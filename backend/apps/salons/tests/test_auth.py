import json
import pytest
from decimal import Decimal
from django.test import Client as DjangoTestClient
from django.utils import timezone
from apps.salons.models import Salon, Staff, Service, Client, Appointment


@pytest.fixture
def auth_salon(db):
    return Salon.objects.create(
        name="صالون تَرجِيل VIP",
        subdomain="tarjeel-vip",
        phone="0501112233",
        tax_number="300987654300003",
    )


@pytest.fixture
def auth_staff(auth_salon):
    staff = Staff(
        salon=auth_salon,
        full_name="نورة الشمري",
        email="admin@tarjeel.com",
        phone="0501112233",
        pin_code="1111",
        role="owner",
        specialty="المالكة والمديرة العامة",
    )
    staff.set_password("admin123")
    staff.save()
    return staff


@pytest.fixture
def auth_stylist(auth_salon):
    staff = Staff(
        salon=auth_salon,
        full_name="سارة القحطاني",
        email="sara@tarjeel.com",
        phone="0551112233",
        pin_code="1234",
        role="stylist",
        specialty="صبغات",
    )
    staff.set_password("sara123")
    staff.save()
    return staff


def test_staff_login_with_password(auth_staff):
    client = DjangoTestClient()
    response = client.post(
        "/api/v1/auth/login",
        data=json.dumps({
            "identifier": "admin@tarjeel.com",
            "credential": "admin123",
            "login_type": "password"
        }),
        content_type="application/json"
    )
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["staff"]["full_name"] == "نورة الشمري"
    assert data["staff"]["role"] == "owner"


def test_staff_login_with_pin(auth_stylist):
    client = DjangoTestClient()
    response = client.post(
        "/api/v1/auth/login",
        data=json.dumps({
            "identifier": "0551112233",
            "credential": "1234",
            "login_type": "pin"
        }),
        content_type="application/json"
    )
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["staff"]["full_name"] == "سارة القحطاني"
    assert data["staff"]["role"] == "stylist"


def test_staff_login_invalid_password(auth_staff):
    client = DjangoTestClient()
    response = client.post(
        "/api/v1/auth/login",
        data=json.dumps({
            "identifier": "admin@tarjeel.com",
            "credential": "wrongpassword",
            "login_type": "password"
        }),
        content_type="application/json"
    )
    assert response.status_code == 401


def test_public_appointment_lookup(auth_salon, auth_staff):
    service = Service.objects.create(
        salon=auth_salon,
        name="جلسة هيدرافيشل",
        category="skin",
        duration_minutes=60,
        price=Decimal("350.00"),
    )
    client_obj = Client.objects.create(
        salon=auth_salon,
        full_name="هند الفيصل",
        phone="0509991122",
    )
    Appointment.objects.create(
        salon=auth_salon,
        client=client_obj,
        service=service,
        staff=auth_staff,
        start_time=timezone.now(),
        end_time=timezone.now() + timezone.timedelta(minutes=60),
        total_amount=Decimal("350.00"),
        deposit_amount=Decimal("70.00"),
        status="confirmed"
    )

    client = DjangoTestClient()
    response = client.post(
        "/api/v1/public/appointments/lookup",
        data=json.dumps({
            "phone": "0509991122"
        }),
        content_type="application/json"
    )
    assert response.status_code == 200
    results = response.json()
    assert len(results) == 1
    assert results[0]["client_name"] == "هند الفيصل"
    assert results[0]["service_name"] == "جلسة هيدرافيشل"
    assert results[0]["status"] == "confirmed"

