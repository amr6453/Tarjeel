import pytest
from datetime import timedelta
from decimal import Decimal
from django.utils import timezone
from django.test import Client as DjangoTestClient
from apps.salons.models import (
    Salon, Staff, Service, Client, Appointment,
    ClientHairFormula, InventoryItem, Invoice, InventoryUsage
)
from apps.salons.services import (
    get_available_slots, create_booking, process_pos_checkout, deduct_inventory_stock
)


@pytest.fixture
def sample_salon(db):
    return Salon.objects.create(
        name="صالون الأناقة الملكية",
        subdomain="anaka-royal",
        phone="0500001122",
        tax_number="300111222300003",
        tax_rate=Decimal("15.00"),
        deposit_percentage=Decimal("20.00"),
    )


@pytest.fixture
def sample_staff(sample_salon):
    return Staff.objects.create(
        salon=sample_salon,
        full_name="مها الحربي",
        role="stylist",
        specialty="صبغات",
        commission_rate_services=Decimal("10.00"),
        commission_rate_retail=Decimal("5.00"),
    )


@pytest.fixture
def sample_service(sample_salon):
    return Service.objects.create(
        salon=sample_salon,
        name="قص وسشوار",
        category="hair",
        duration_minutes=60,
        buffer_after_minutes=15,
        price=Decimal("200.00"),
        requires_chair_type="styling",
    )


@pytest.fixture
def sample_client(sample_salon):
    return Client.objects.create(
        salon=sample_salon,
        full_name="سلوى المحمد",
        phone="0509998877",
        allergy_info="لا توجد حساسية",
    )


@pytest.fixture
def sample_inventory(sample_salon):
    return InventoryItem.objects.create(
        salon=sample_salon,
        name="صبغة لوريال 6.1",
        sku="LOR-61",
        item_type="backbar_consumable",
        unit="gram",
        current_stock=Decimal("500.00"),
        min_stock_alert=Decimal("100.00"),
        cost_price=Decimal("0.50"),
    )


# ---------------- Model Tests ----------------

@pytest.mark.django_db
def test_create_salon_and_staff(sample_salon, sample_staff):
    assert sample_salon.subdomain == "anaka-royal"
    assert sample_staff.salon == sample_salon
    assert sample_staff.role == "stylist"
    assert sample_staff.commission_rate_services == Decimal("10.00")


@pytest.mark.django_db
def test_inventory_low_stock_property(sample_inventory):
    assert not sample_inventory.is_low_stock
    sample_inventory.current_stock = Decimal("50.00")
    assert sample_inventory.is_low_stock


# ---------------- Service Layer Tests ----------------

@pytest.mark.django_db
def test_get_available_slots(sample_salon, sample_service, sample_staff):
    today = timezone.now().date()
    slots = get_available_slots(
        salon_id=sample_salon.id,
        service_id=sample_service.id,
        target_date=today,
        staff_id=sample_staff.id
    )
    assert len(slots) > 0
    first_slot = slots[0]
    assert first_slot["staff_name"] == "مها الحربي"
    assert first_slot["is_available"] is True


@pytest.mark.django_db
def test_create_booking_service(sample_salon, sample_service, sample_staff):
    start_time = timezone.now() + timedelta(days=1)
    appointment = create_booking(
        salon_id=sample_salon.id,
        client_name="العنود الشمري",
        client_phone="0559988776",
        client_email="alanood@example.com",
        service_id=sample_service.id,
        start_time=start_time,
        staff_id=sample_staff.id,
        notes="حجز تجريبي للاختبارات"
    )
    assert appointment.status == "confirmed"
    assert appointment.client.full_name == "العنود الشمري"
    assert appointment.deposit_amount == Decimal("40.00") # 20% of 200


@pytest.mark.django_db
def test_pos_checkout_process(sample_salon, sample_staff, sample_service, sample_client, sample_inventory):
    # Book appointment
    start_time = timezone.now()
    appointment = Appointment.objects.create(
        salon=sample_salon,
        client=sample_client,
        staff=sample_staff,
        service=sample_service,
        start_time=start_time,
        end_time=start_time + timedelta(minutes=60),
        status="in_progress",
        total_amount=Decimal("200.00"),
    )

    payload = {
        "appointment_id": str(appointment.id),
        "salon_id": str(sample_salon.id),
        "subtotal": "200.00",
        "discount_amount": "20.00",
        "tip_amount": "30.00",
        "payment_method": "mada",
        "formula_text": "L'Oreal 6.1 (50g) + Oxydant 20Vol (75ml)",
        "consumables_used": [
            {"item_id": str(sample_inventory.id), "quantity_used": "50.00"}
        ]
    }

    invoice = process_pos_checkout(payload)

    assert invoice.payment_status == "paid"
    # Taxable = 200 - 20 = 180. Tax = 180 * 0.15 = 27. Total = 180 + 27 + 30 = 237
    assert invoice.tax_amount == Decimal("27.00")
    assert invoice.total_amount == Decimal("237.00")
    assert invoice.staff_commission_amount == Decimal("18.00") # 10% of 180

    # Verify inventory was deducted
    sample_inventory.refresh_from_db()
    assert sample_inventory.current_stock == Decimal("450.00")

    # Verify formula was saved
    formula = ClientHairFormula.objects.filter(client=sample_client).first()
    assert formula is not None
    assert "L'Oreal 6.1" in formula.formula_text

    # Verify appointment completed
    appointment.refresh_from_db()
    assert appointment.status == "completed"


# ---------------- API Integration Tests ----------------

@pytest.mark.django_db
def test_api_public_endpoints(sample_salon, sample_service, sample_staff):
    client = DjangoTestClient()
    
    # Get salon
    response = client.get(f"/api/v1/public/salons/{sample_salon.subdomain}")
    assert response.status_code == 200
    assert response.json()["name"] == "صالون الأناقة الملكية"

    # Get services
    response = client.get(f"/api/v1/public/salons/{sample_salon.subdomain}/services")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # Get staff
    response = client.get(f"/api/v1/public/salons/{sample_salon.subdomain}/staff")
    assert response.status_code == 200
    assert len(response.json()) == 1


@pytest.mark.django_db
def test_api_analytics_overview(sample_salon):
    client = DjangoTestClient()
    response = client.get(f"/api/v1/analytics/overview?salon_id={sample_salon.id}")
    assert response.status_code == 200
    data = response.json()
    assert "today_revenue" in data
    assert "in_progress_count" in data
