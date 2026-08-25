from datetime import datetime, timedelta, time
from decimal import Decimal
from typing import List, Optional
from uuid import UUID
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import (
    Salon, Staff, Service, Client, Appointment,
    ClientHairFormula, InventoryItem, Invoice, InventoryUsage
)


def get_available_slots(
    salon_id: UUID,
    service_id: UUID,
    target_date: datetime.date,
    staff_id: Optional[UUID] = None
) -> List[dict]:
    """
    Computes free time slots for a given salon, service, and date,
    factoring in service duration, buffer/sterilization times, and existing appointments.
    """
    salon = get_object_or_404(Salon, id=salon_id)
    service = get_object_or_404(Service, id=service_id, salon=salon)

    # Salon working hours: 10:00 AM to 10:00 PM (12 hours)
    start_hour = 10
    end_hour = 22
    slot_interval_minutes = 30
    total_needed_minutes = service.duration_minutes + service.buffer_after_minutes

    staff_query = Staff.objects.filter(salon=salon, is_active=True)
    if staff_id:
        staff_query = staff_query.filter(id=staff_id)

    available_slots = []
    
    # Query appointments for the day
    day_start = timezone.make_aware(datetime.combine(target_date, time(start_hour, 0)))
    day_end = timezone.make_aware(datetime.combine(target_date, time(end_hour, 0)))

    existing_appointments = Appointment.objects.filter(
        salon=salon,
        start_time__gte=day_start,
        start_time__lt=day_end,
        status__in=["pending_deposit", "confirmed", "in_progress"]
    ).select_related("staff")

    current_slot_start = day_start
    while current_slot_start + timedelta(minutes=service.duration_minutes) <= day_end:
        slot_end = current_slot_start + timedelta(minutes=service.duration_minutes)
        slot_block_end = current_slot_start + timedelta(minutes=total_needed_minutes)

        # Check if any staff is free during this slot
        for staff_member in staff_query:
            # Check collision with staff's existing appointments
            has_collision = existing_appointments.filter(
                staff=staff_member,
                start_time__lt=slot_block_end,
                end_time__gt=current_slot_start
            ).exists()

            if not has_collision:
                available_slots.append({
                    "start_time": current_slot_start,
                    "end_time": slot_end,
                    "staff_id": staff_member.id,
                    "staff_name": staff_member.full_name,
                    "is_available": True
                })
                break

        current_slot_start += timedelta(minutes=slot_interval_minutes)

    return available_slots


@transaction.atomic
def create_booking(
    salon_id: UUID,
    client_name: str,
    client_phone: str,
    client_email: str,
    service_id: UUID,
    start_time: datetime,
    staff_id: Optional[UUID] = None,
    notes: str = ""
) -> Appointment:
    salon = get_object_or_404(Salon, id=salon_id)
    service = get_object_or_404(Service, id=service_id, salon=salon)

    # Find or create client
    client, _ = Client.objects.get_or_create(
        salon=salon,
        phone=client_phone,
        defaults={
            "full_name": client_name,
            "email": client_email or "",
        }
    )
    if client.full_name != client_name:
        client.full_name = client_name
        client.save(update_fields=["full_name"])

    # Determine staff
    staff = None
    if staff_id:
        staff = get_object_or_404(Staff, id=staff_id, salon=salon)
    else:
        # Assign first available active stylist
        staff = Staff.objects.filter(salon=salon, is_active=True).first()

    end_time = start_time + timedelta(minutes=service.duration_minutes)
    deposit_amount = (service.price * salon.deposit_percentage) / Decimal("100.00")

    appointment = Appointment.objects.create(
        salon=salon,
        client=client,
        staff=staff,
        service=service,
        start_time=start_time,
        end_time=end_time,
        status="confirmed",
        deposit_amount=deposit_amount,
        total_amount=service.price,
        notes=notes
    )

    return appointment


@transaction.atomic
def process_pos_checkout(payload_data: dict) -> Invoice:
    salon = get_object_or_404(Salon, id=payload_data["salon_id"])
    
    appointment = None
    if payload_data.get("appointment_id"):
        appointment = Appointment.objects.filter(id=payload_data["appointment_id"]).first()

    # Resolve Client
    if appointment:
        client = appointment.client
        staff = appointment.staff
    elif payload_data.get("client_id"):
        client = get_object_or_404(Client, id=payload_data["client_id"], salon=salon)
        staff = Staff.objects.filter(id=payload_data.get("staff_id"), salon=salon).first()
    else:
        client, _ = Client.objects.get_or_create(
            salon=salon,
            phone=payload_data.get("client_phone", "0500000000"),
            defaults={"full_name": payload_data.get("client_name", "عميلة نقدية")}
        )
        staff = Staff.objects.filter(id=payload_data.get("staff_id"), salon=salon).first()

    subtotal = Decimal(str(payload_data.get("subtotal", "0.00")))
    discount = Decimal(str(payload_data.get("discount_amount", "0.00")))
    tip = Decimal(str(payload_data.get("tip_amount", "0.00")))
    tax_rate = salon.tax_rate / Decimal("100.00")

    taxable_amount = max(Decimal("0.00"), subtotal - discount)
    tax_amount = (taxable_amount * tax_rate).quantize(Decimal("0.01"))
    total_amount = (taxable_amount + tax_amount + tip).quantize(Decimal("0.01"))

    # Calculate staff commission
    commission = Decimal("0.00")
    if staff:
        commission = (taxable_amount * (staff.commission_rate_services / Decimal("100.00"))).quantize(Decimal("0.01"))

    # Invoice sequence number
    import random
    inv_num = f"INV-{timezone.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"

    invoice = Invoice.objects.create(
        invoice_number=inv_num,
        salon=salon,
        appointment=appointment,
        client=client,
        staff=staff,
        subtotal=subtotal,
        tax_amount=tax_amount,
        discount_amount=discount,
        tip_amount=tip,
        total_amount=total_amount,
        payment_method=payload_data.get("payment_method", "mada"),
        payment_status="paid",
        staff_commission_amount=commission
    )

    # Deduct consumables if provided
    consumables = payload_data.get("consumables_used", [])
    for c in consumables:
        item = InventoryItem.objects.filter(id=c["item_id"], salon=salon).first()
        if item:
            qty = Decimal(str(c["quantity_used"]))
            item.current_stock = max(Decimal("0.00"), item.current_stock - qty)
            item.save(update_fields=["current_stock"])
            if appointment:
                InventoryUsage.objects.create(
                    appointment=appointment,
                    item=item,
                    quantity_used=qty
                )

    # Save Hair formula if provided
    formula_text = payload_data.get("formula_text")
    if formula_text and client:
        ClientHairFormula.objects.create(
            client=client,
            appointment=appointment,
            formula_text=formula_text,
            brand_name="صالون ترجيل"
        )

    # Update appointment status
    if appointment:
        appointment.status = "completed"
        appointment.save(update_fields=["status"])

    # Update client stats
    client.total_visits += 1
    client.total_spent += total_amount
    client.save(update_fields=["total_visits", "total_spent"])

    return invoice


@transaction.atomic
def deduct_inventory_stock(item_id: UUID, quantity: Decimal, appointment_id: Optional[UUID] = None) -> InventoryItem:
    item = get_object_or_404(InventoryItem, id=item_id)
    item.current_stock = max(Decimal("0.00"), item.current_stock - quantity)
    item.save(update_fields=["current_stock"])

    if appointment_id:
        appointment = Appointment.objects.filter(id=appointment_id).first()
        if appointment:
            InventoryUsage.objects.create(
                appointment=appointment,
                item=item,
                quantity_used=quantity
            )

    return item
