from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Sum, Count, Q
from ninja import Router, Query

from .models import (
    Salon, Staff, Service, Client, Appointment,
    ClientHairFormula, InventoryItem, Invoice, InventoryUsage
)
from .schemas import (
    SalonOut, SalonUpdate,
    StaffOut, StaffCreate,
    ServiceOut, ServiceCreate,
    ClientOut, ClientCreate,
    ClientHairFormulaOut, ClientHairFormulaCreate,
    AppointmentOut, AppointmentCreate, AppointmentStatusUpdate,
    AvailableSlotOut,
    InventoryItemOut, InventoryItemCreate, InventoryDeductIn,
    POSCheckoutIn, InvoiceOut,
    AnalyticsOverviewOut,
    LoginInput, AuthTokenOut, StaffProfileOut, AppointmentLookupIn, AppointmentLookupOut
)
from ninja.errors import HttpError
from .services import get_available_slots, create_booking, process_pos_checkout, deduct_inventory_stock

router = Router(tags=["Tarjeel Salon Management"])


# ==========================================
# 1. Public Booking Endpoints
# ==========================================

@router.get("/public/salons/{slug}", response=SalonOut)
def get_public_salon_by_slug(request, slug: str):
    return get_object_or_404(Salon, subdomain=slug)


@router.get("/public/salons/{slug}/services", response=List[ServiceOut])
def get_public_salon_services(request, slug: str, category: Optional[str] = None):
    salon = get_object_or_404(Salon, subdomain=slug)
    qs = Service.objects.filter(salon=salon, is_active=True)
    if category:
        qs = qs.filter(category=category)
    return qs


@router.get("/public/salons/{slug}/staff", response=List[StaffOut])
def get_public_salon_staff(request, slug: str):
    salon = get_object_or_404(Salon, subdomain=slug)
    return Staff.objects.filter(salon=salon, is_active=True)


@router.get("/public/salons/{slug}/available-slots", response=List[AvailableSlotOut])
def check_available_slots(
    request,
    slug: str,
    service_id: UUID = Query(...),
    target_date: date = Query(default_factory=timezone.now().date),
    staff_id: Optional[UUID] = Query(None)
):
    salon = get_object_or_404(Salon, subdomain=slug)
    slots = get_available_slots(
        salon_id=salon.id,
        service_id=service_id,
        target_date=target_date,
        staff_id=staff_id
    )
    return slots


@router.post("/public/bookings", response=AppointmentOut)
def create_public_booking(request, payload: AppointmentCreate):
    appointment = create_booking(
        salon_id=payload.salon_id,
        client_name=payload.client_name,
        client_phone=payload.client_phone,
        client_email=payload.client_email or "",
        service_id=payload.service_id,
        start_time=payload.start_time,
        staff_id=payload.staff_id,
        notes=payload.notes or ""
    )
    return {
        "id": appointment.id,
        "salon_id": appointment.salon_id,
        "client_id": appointment.client_id,
        "client_name": appointment.client.full_name,
        "client_phone": appointment.client.phone,
        "staff_id": appointment.staff_id,
        "staff_name": appointment.staff.full_name if appointment.staff else "غير محدد",
        "service_id": appointment.service_id,
        "service_name": appointment.service.name,
        "service_category": appointment.service.category,
        "start_time": appointment.start_time,
        "end_time": appointment.end_time,
        "status": appointment.status,
        "deposit_amount": appointment.deposit_amount,
        "total_amount": appointment.total_amount,
        "notes": appointment.notes,
        "created_at": appointment.created_at,
    }


# ==========================================
# 2. Salons Management
# ==========================================

@router.get("/salons", response=List[SalonOut])
def list_salons(request):
    return Salon.objects.all()


@router.get("/salons/{id}", response=SalonOut)
def get_salon(request, id: UUID):
    return get_object_or_404(Salon, id=id)


@router.patch("/salons/{id}", response=SalonOut)
def update_salon(request, id: UUID, payload: SalonUpdate):
    salon = get_object_or_404(Salon, id=id)
    for attr, val in payload.dict(exclude_unset=True).items():
        setattr(salon, attr, val)
    salon.save()
    return salon


# ==========================================
# 3. Staff Management
# ==========================================

@router.get("/staff", response=List[StaffOut])
def list_staff(request, salon_id: Optional[UUID] = None):
    qs = Staff.objects.all()
    if salon_id:
        qs = qs.filter(salon_id=salon_id)
    return qs


@router.post("/staff", response=StaffOut)
def create_staff(request, payload: StaffCreate):
    salon = get_object_or_404(Salon, id=payload.salon_id)
    staff = Staff.objects.create(
        salon=salon,
        full_name=payload.full_name,
        phone=payload.phone or "",
        role=payload.role or "stylist",
        specialty=payload.specialty or "تصفيف وصبغات",
        commission_rate_services=payload.commission_rate_services or Decimal("10.00"),
        commission_rate_retail=payload.commission_rate_retail or Decimal("5.00"),
        avatar_url=payload.avatar_url or "",
        is_active=payload.is_active if payload.is_active is not None else True,
    )
    return staff


@router.get("/staff/{id}", response=StaffOut)
def get_staff_member(request, id: UUID):
    return get_object_or_404(Staff, id=id)


# ==========================================
# 4. Services Management
# ==========================================

@router.get("/services", response=List[ServiceOut])
def list_services(request, salon_id: Optional[UUID] = None, category: Optional[str] = None):
    qs = Service.objects.all()
    if salon_id:
        qs = qs.filter(salon_id=salon_id)
    if category:
        qs = qs.filter(category=category)
    return qs


@router.post("/services", response=ServiceOut)
def create_service(request, payload: ServiceCreate):
    salon = get_object_or_404(Salon, id=payload.salon_id)
    service = Service.objects.create(
        salon=salon,
        name=payload.name,
        category=payload.category or "hair",
        description=payload.description or "",
        duration_minutes=payload.duration_minutes,
        buffer_after_minutes=payload.buffer_after_minutes or 10,
        price=payload.price,
        requires_chair_type=payload.requires_chair_type or "styling",
        is_active=payload.is_active if payload.is_active is not None else True,
    )
    return service


@router.get("/services/{id}", response=ServiceOut)
def get_service(request, id: UUID):
    return get_object_or_404(Service, id=id)


# ==========================================
# 5. Clients & Formula Archive
# ==========================================

@router.get("/clients", response=List[ClientOut])
def list_clients(request, salon_id: Optional[UUID] = None, search: Optional[str] = None):
    qs = Client.objects.all()
    if salon_id:
        qs = qs.filter(salon_id=salon_id)
    if search:
        qs = qs.filter(Q(full_name__icontains=search) | Q(phone__icontains=search))
    return qs


@router.post("/clients", response=ClientOut)
def create_client(request, payload: ClientCreate):
    salon = get_object_or_404(Salon, id=payload.salon_id)
    client, created = Client.objects.get_or_create(
        salon=salon,
        phone=payload.phone,
        defaults={
            "full_name": payload.full_name,
            "email": payload.email or "",
            "notes": payload.notes or "",
            "allergy_info": payload.allergy_info or "",
        }
    )
    if not created:
        client.full_name = payload.full_name
        if payload.email:
            client.email = payload.email
        if payload.notes:
            client.notes = payload.notes
        if payload.allergy_info:
            client.allergy_info = payload.allergy_info
        client.save()
    return client


@router.get("/clients/{id}", response=ClientOut)
def get_client(request, id: UUID):
    return get_object_or_404(Client, id=id)


@router.get("/clients/{id}/formulas", response=List[ClientHairFormulaOut])
def get_client_formulas(request, id: UUID):
    client = get_object_or_404(Client, id=id)
    return client.hair_formulas.all()


@router.post("/clients/{id}/formulas", response=ClientHairFormulaOut)
def add_client_formula(request, id: UUID, payload: ClientHairFormulaCreate):
    client = get_object_or_404(Client, id=id)
    appointment = None
    if payload.appointment_id:
        appointment = Appointment.objects.filter(id=payload.appointment_id).first()
    
    formula = ClientHairFormula.objects.create(
        client=client,
        appointment=appointment,
        formula_text=payload.formula_text,
        brand_name=payload.brand_name or "ترجيل",
        before_photo_url=payload.before_photo_url or "",
        after_photo_url=payload.after_photo_url or "",
    )
    return formula


# ==========================================
# 6. Appointments & Calendar
# ==========================================

@router.get("/appointments", response=List[AppointmentOut])
def list_appointments(
    request,
    salon_id: Optional[UUID] = None,
    staff_id: Optional[UUID] = None,
    status: Optional[str] = None,
    target_date: Optional[date] = None
):
    qs = Appointment.objects.select_related("client", "staff", "service", "salon").all()
    if salon_id:
        qs = qs.filter(salon_id=salon_id)
    if staff_id:
        qs = qs.filter(staff_id=staff_id)
    if status:
        qs = qs.filter(status=status)
    if target_date:
        qs = qs.filter(start_time__date=target_date)

    return [
        {
            "id": a.id,
            "salon_id": a.salon_id,
            "client_id": a.client_id,
            "client_name": a.client.full_name,
            "client_phone": a.client.phone,
            "staff_id": a.staff_id,
            "staff_name": a.staff.full_name if a.staff else "غير محدد",
            "service_id": a.service_id,
            "service_name": a.service.name,
            "service_category": a.service.category,
            "start_time": a.start_time,
            "end_time": a.end_time,
            "status": a.status,
            "deposit_amount": a.deposit_amount,
            "total_amount": a.total_amount,
            "notes": a.notes,
            "created_at": a.created_at,
        }
        for a in qs
    ]


@router.post("/appointments", response=AppointmentOut)
def create_appointment(request, payload: AppointmentCreate):
    appointment = create_booking(
        salon_id=payload.salon_id,
        client_name=payload.client_name,
        client_phone=payload.client_phone,
        client_email=payload.client_email or "",
        service_id=payload.service_id,
        start_time=payload.start_time,
        staff_id=payload.staff_id,
        notes=payload.notes or ""
    )
    return {
        "id": appointment.id,
        "salon_id": appointment.salon_id,
        "client_id": appointment.client_id,
        "client_name": appointment.client.full_name,
        "client_phone": appointment.client.phone,
        "staff_id": appointment.staff_id,
        "staff_name": appointment.staff.full_name if appointment.staff else "غير محدد",
        "service_id": appointment.service_id,
        "service_name": appointment.service.name,
        "service_category": appointment.service.category,
        "start_time": appointment.start_time,
        "end_time": appointment.end_time,
        "status": appointment.status,
        "deposit_amount": appointment.deposit_amount,
        "total_amount": appointment.total_amount,
        "notes": appointment.notes,
        "created_at": appointment.created_at,
    }


@router.get("/appointments/{id}", response=AppointmentOut)
def get_appointment(request, id: UUID):
    a = get_object_or_404(Appointment.objects.select_related("client", "staff", "service"), id=id)
    return {
        "id": a.id,
        "salon_id": a.salon_id,
        "client_id": a.client_id,
        "client_name": a.client.full_name,
        "client_phone": a.client.phone,
        "staff_id": a.staff_id,
        "staff_name": a.staff.full_name if a.staff else "غير محدد",
        "service_id": a.service_id,
        "service_name": a.service.name,
        "service_category": a.service.category,
        "start_time": a.start_time,
        "end_time": a.end_time,
        "status": a.status,
        "deposit_amount": a.deposit_amount,
        "total_amount": a.total_amount,
        "notes": a.notes,
        "created_at": a.created_at,
    }


@router.patch("/appointments/{id}/status", response=AppointmentOut)
def update_appointment_status(request, id: UUID, payload: AppointmentStatusUpdate):
    a = get_object_or_404(Appointment.objects.select_related("client", "staff", "service"), id=id)
    a.status = payload.status
    a.save(update_fields=["status"])
    return {
        "id": a.id,
        "salon_id": a.salon_id,
        "client_id": a.client_id,
        "client_name": a.client.full_name,
        "client_phone": a.client.phone,
        "staff_id": a.staff_id,
        "staff_name": a.staff.full_name if a.staff else "غير محدد",
        "service_id": a.service_id,
        "service_name": a.service.name,
        "service_category": a.service.category,
        "start_time": a.start_time,
        "end_time": a.end_time,
        "status": a.status,
        "deposit_amount": a.deposit_amount,
        "total_amount": a.total_amount,
        "notes": a.notes,
        "created_at": a.created_at,
    }


# ==========================================
# 7. Inventory & Consumables
# ==========================================

@router.get("/inventory", response=List[InventoryItemOut])
def list_inventory(request, salon_id: Optional[UUID] = None, item_type: Optional[str] = None):
    qs = InventoryItem.objects.all()
    if salon_id:
        qs = qs.filter(salon_id=salon_id)
    if item_type:
        qs = qs.filter(item_type=item_type)
    return [
        {
            "id": item.id,
            "salon_id": item.salon_id,
            "name": item.name,
            "sku": item.sku,
            "item_type": item.item_type,
            "unit": item.unit,
            "current_stock": item.current_stock,
            "min_stock_alert": item.min_stock_alert,
            "cost_price": item.cost_price,
            "retail_price": item.retail_price,
            "is_low_stock": item.is_low_stock,
            "created_at": item.created_at,
        }
        for item in qs
    ]


@router.post("/inventory", response=InventoryItemOut)
def create_inventory_item(request, payload: InventoryItemCreate):
    salon = get_object_or_404(Salon, id=payload.salon_id)
    item = InventoryItem.objects.create(
        salon=salon,
        name=payload.name,
        sku=payload.sku or "",
        item_type=payload.item_type or "backbar_consumable",
        unit=payload.unit or "gram",
        current_stock=payload.current_stock,
        min_stock_alert=payload.min_stock_alert or Decimal("50.00"),
        cost_price=payload.cost_price,
        retail_price=payload.retail_price or Decimal("0.00"),
    )
    return {
        "id": item.id,
        "salon_id": item.salon_id,
        "name": item.name,
        "sku": item.sku,
        "item_type": item.item_type,
        "unit": item.unit,
        "current_stock": item.current_stock,
        "min_stock_alert": item.min_stock_alert,
        "cost_price": item.cost_price,
        "retail_price": item.retail_price,
        "is_low_stock": item.is_low_stock,
        "created_at": item.created_at,
    }


@router.post("/inventory/deduct-consumable", response=InventoryItemOut)
def deduct_consumable(request, payload: InventoryDeductIn):
    item = deduct_inventory_stock(
        item_id=payload.item_id,
        quantity=payload.quantity,
        appointment_id=payload.appointment_id
    )
    return {
        "id": item.id,
        "salon_id": item.salon_id,
        "name": item.name,
        "sku": item.sku,
        "item_type": item.item_type,
        "unit": item.unit,
        "current_stock": item.current_stock,
        "min_stock_alert": item.min_stock_alert,
        "cost_price": item.cost_price,
        "retail_price": item.retail_price,
        "is_low_stock": item.is_low_stock,
        "created_at": item.created_at,
    }


@router.get("/inventory/low-stock", response=List[InventoryItemOut])
def get_low_stock_items(request, salon_id: Optional[UUID] = None):
    qs = InventoryItem.objects.filter(current_stock__lte=models.F("min_stock_alert"))
    if salon_id:
        qs = qs.filter(salon_id=salon_id)
    return [
        {
            "id": item.id,
            "salon_id": item.salon_id,
            "name": item.name,
            "sku": item.sku,
            "item_type": item.item_type,
            "unit": item.unit,
            "current_stock": item.current_stock,
            "min_stock_alert": item.min_stock_alert,
            "cost_price": item.cost_price,
            "retail_price": item.retail_price,
            "is_low_stock": True,
            "created_at": item.created_at,
        }
        for item in qs
    ]


# ==========================================
# 8. POS Checkout & Invoices
# ==========================================

@router.post("/pos/checkout", response=InvoiceOut)
def pos_checkout(request, payload: POSCheckoutIn):
    invoice = process_pos_checkout(payload.dict())
    return {
        "id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "salon_id": invoice.salon_id,
        "appointment_id": invoice.appointment_id,
        "client_name": invoice.client.full_name,
        "staff_name": invoice.staff.full_name if invoice.staff else "غير محدد",
        "subtotal": invoice.subtotal,
        "tax_amount": invoice.tax_amount,
        "discount_amount": invoice.discount_amount,
        "tip_amount": invoice.tip_amount,
        "total_amount": invoice.total_amount,
        "payment_method": invoice.payment_method,
        "payment_status": invoice.payment_status,
        "staff_commission_amount": invoice.staff_commission_amount,
        "created_at": invoice.created_at,
    }


@router.get("/pos/invoices", response=List[InvoiceOut])
def list_invoices(request, salon_id: Optional[UUID] = None):
    qs = Invoice.objects.select_related("client", "staff", "salon").all()
    if salon_id:
        qs = qs.filter(salon_id=salon_id)
    return [
        {
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "salon_id": inv.salon_id,
            "appointment_id": inv.appointment_id,
            "client_name": inv.client.full_name,
            "staff_name": inv.staff.full_name if inv.staff else "غير محدد",
            "subtotal": inv.subtotal,
            "tax_amount": inv.tax_amount,
            "discount_amount": inv.discount_amount,
            "tip_amount": inv.tip_amount,
            "total_amount": inv.total_amount,
            "payment_method": inv.payment_method,
            "payment_status": inv.payment_status,
            "staff_commission_amount": inv.staff_commission_amount,
            "created_at": inv.created_at,
        }
        for inv in qs
    ]


# ==========================================
# 9. Analytics & Business Intelligence
# ==========================================

@router.get("/analytics/overview", response=AnalyticsOverviewOut)
def get_analytics_overview(request, salon_id: Optional[UUID] = None):
    today = timezone.now().date()
    
    invoices_today = Invoice.objects.filter(created_at__date=today)
    appointments_today = Appointment.objects.filter(start_time__date=today)
    inventory_qs = InventoryItem.objects.all()

    if salon_id:
        invoices_today = invoices_today.filter(salon_id=salon_id)
        appointments_today = appointments_today.filter(salon_id=salon_id)
        inventory_qs = inventory_qs.filter(salon_id=salon_id)

    today_revenue = invoices_today.aggregate(total=Sum("total_amount"))["total"] or Decimal("0.00")
    
    in_progress = appointments_today.filter(status="in_progress").count()
    completed = appointments_today.filter(status="completed").count()
    no_show = appointments_today.filter(status="no_show").count()

    low_stock = sum(1 for item in inventory_qs if item.is_low_stock)

    # Top services
    top_services_qs = Service.objects.annotate(
        booking_count=Count("appointments")
    ).order_by("-booking_count")[:5]

    top_services = [
        {"name": s.name, "category": s.category, "count": s.booking_count, "price": float(s.price)}
        for s in top_services_qs
    ]

    # Top stylists
    top_stylists_qs = Staff.objects.annotate(
        completed_count=Count("appointments", filter=Q(appointments__status="completed"))
    ).order_by("-completed_count")[:5]

    top_stylists = [
        {"name": st.full_name, "specialty": st.specialty, "completed_appointments": st.completed_count}
        for st in top_stylists_qs
    ]

    return {
        "today_revenue": today_revenue,
        "today_appointments_count": appointments_today.count(),
        "in_progress_count": in_progress,
        "completed_count": completed,
        "no_show_count": no_show,
        "low_stock_alerts_count": low_stock,
        "top_services": top_services,
        "top_stylists": top_stylists,
    }


# ==========================================
# 10. Authentication & Staff Session Management
# ==========================================

@router.post("/auth/login", response=AuthTokenOut)
def staff_login(request, payload: LoginInput):
    identifier = payload.identifier.strip()
    credential = payload.credential.strip()

    # Find staff by email or phone
    staff = Staff.objects.filter(
        Q(email__iexact=identifier) | Q(phone__iexact=identifier),
        is_active=True
    ).select_related("salon").first()

    if not staff:
        raise HttpError(401, "بيانات الدخول غير صحيحة أو الحساب غير مفعّل.")

    is_valid = False
    if payload.login_type == "pin":
        is_valid = staff.check_pin(credential)
    else:
        # Check password or fallback to PIN if credential matches PIN
        is_valid = staff.check_password(credential) or staff.check_pin(credential)

    if not is_valid:
        raise HttpError(401, "كلمة المرور أو رمز PIN غير صحيح.")

    # Generate a lightweight session token
    token = f"tarjeel_token_{staff.id}_{int(timezone.now().timestamp())}"

    return {
        "token": token,
        "staff": {
            "id": staff.id,
            "salon_id": staff.salon.id,
            "salon_name": staff.salon.name,
            "salon_subdomain": staff.salon.subdomain,
            "full_name": staff.full_name,
            "email": staff.email,
            "phone": staff.phone,
            "role": staff.role,
            "specialty": staff.specialty,
            "commission_rate_services": staff.commission_rate_services,
            "commission_rate_retail": staff.commission_rate_retail,
            "avatar_url": staff.avatar_url,
            "is_active": staff.is_active,
        },
        "message": f"أهلاً بكِ {staff.full_name}، تم تسجيل الدخول بنجاح."
    }


@router.get("/auth/me", response=StaffProfileOut)
def get_current_staff_profile(request, staff_id: UUID):
    staff = get_object_or_404(Staff.objects.select_related("salon"), id=staff_id, is_active=True)
    return {
        "id": staff.id,
        "salon_id": staff.salon.id,
        "salon_name": staff.salon.name,
        "salon_subdomain": staff.salon.subdomain,
        "full_name": staff.full_name,
        "email": staff.email,
        "phone": staff.phone,
        "role": staff.role,
        "specialty": staff.specialty,
        "commission_rate_services": staff.commission_rate_services,
        "commission_rate_retail": staff.commission_rate_retail,
        "avatar_url": staff.avatar_url,
        "is_active": staff.is_active,
    }


@router.post("/auth/logout")
def staff_logout(request):
    return {"status": "success", "message": "تم تسجيل الخروج بنجاح."}


# ==========================================
# 11. Public Appointment Lookup for Clients
# ==========================================

@router.post("/public/appointments/lookup", response=List[AppointmentLookupOut])
def lookup_public_appointments(request, payload: AppointmentLookupIn):
    phone_clean = payload.phone.strip()
    if not phone_clean:
        raise HttpError(400, "يرجى إدخال رقم الجوال.")

    qs = Appointment.objects.filter(
        client__phone__icontains=phone_clean
    ).select_related("client", "service", "staff").order_by("-start_time")[:10]

    return [
        {
            "id": app.id,
            "client_name": app.client.full_name,
            "client_phone": app.client.phone,
            "service_name": app.service.name,
            "staff_name": app.staff.full_name if app.staff else "أي مصففة",
            "start_time": app.start_time,
            "status": app.status,
            "total_amount": app.total_amount,
            "deposit_amount": app.deposit_amount,
            "notes": app.notes,
        }
        for app in qs
    ]


