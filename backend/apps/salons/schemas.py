from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional
from uuid import UUID
from ninja import Schema


# ---------------- Salons ----------------
class SalonOut(Schema):
    id: UUID
    name: str
    subdomain: str
    phone: str
    address: str
    currency: str
    tax_number: str
    tax_rate: Decimal
    deposit_percentage: Decimal
    created_at: datetime


class SalonUpdate(Schema):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    tax_number: Optional[str] = None
    tax_rate: Optional[Decimal] = None
    deposit_percentage: Optional[Decimal] = None


# ---------------- Staff ----------------
class StaffOut(Schema):
    id: UUID
    salon_id: UUID
    full_name: str
    phone: str
    role: str
    specialty: str
    commission_rate_services: Decimal
    commission_rate_retail: Decimal
    avatar_url: str
    is_active: bool


class StaffCreate(Schema):
    salon_id: UUID
    full_name: str
    phone: Optional[str] = ""
    role: Optional[str] = "stylist"
    specialty: Optional[str] = "تصفيف وصبغات"
    commission_rate_services: Optional[Decimal] = Decimal("10.00")
    commission_rate_retail: Optional[Decimal] = Decimal("5.00")
    avatar_url: Optional[str] = ""
    is_active: Optional[bool] = True


# ---------------- Services ----------------
class ServiceOut(Schema):
    id: UUID
    salon_id: UUID
    name: str
    category: str
    description: str
    duration_minutes: int
    buffer_after_minutes: int
    price: Decimal
    requires_chair_type: str
    is_active: bool


class ServiceCreate(Schema):
    salon_id: UUID
    name: str
    category: Optional[str] = "hair"
    description: Optional[str] = ""
    duration_minutes: int
    buffer_after_minutes: Optional[int] = 10
    price: Decimal
    requires_chair_type: Optional[str] = "styling"
    is_active: Optional[bool] = True


# ---------------- Clients ----------------
class ClientOut(Schema):
    id: UUID
    salon_id: UUID
    full_name: str
    phone: str
    email: str
    notes: str
    allergy_info: str
    total_visits: int
    total_spent: Decimal
    created_at: datetime


class ClientCreate(Schema):
    salon_id: UUID
    full_name: str
    phone: str
    email: Optional[str] = ""
    notes: Optional[str] = ""
    allergy_info: Optional[str] = ""


# ---------------- Client Hair Formula ----------------
class ClientHairFormulaOut(Schema):
    id: UUID
    client_id: UUID
    appointment_id: Optional[UUID] = None
    formula_text: str
    brand_name: str
    before_photo_url: str
    after_photo_url: str
    created_at: datetime


class ClientHairFormulaCreate(Schema):
    appointment_id: Optional[UUID] = None
    formula_text: str
    brand_name: Optional[str] = ""
    before_photo_url: Optional[str] = ""
    after_photo_url: Optional[str] = ""


# ---------------- Appointments ----------------
class AppointmentOut(Schema):
    id: UUID
    salon_id: UUID
    client_id: UUID
    client_name: str
    client_phone: str
    staff_id: Optional[UUID] = None
    staff_name: Optional[str] = None
    service_id: UUID
    service_name: str
    service_category: str
    start_time: datetime
    end_time: datetime
    status: str
    deposit_amount: Decimal
    total_amount: Decimal
    notes: str
    created_at: datetime


class AppointmentCreate(Schema):
    salon_id: UUID
    client_name: str
    client_phone: str
    client_email: Optional[str] = ""
    service_id: UUID
    staff_id: Optional[UUID] = None
    start_time: datetime
    notes: Optional[str] = ""


class AppointmentStatusUpdate(Schema):
    status: str  # 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'


class AvailableSlotOut(Schema):
    start_time: datetime
    end_time: datetime
    staff_id: Optional[UUID] = None
    staff_name: Optional[str] = None
    is_available: bool


# ---------------- Inventory ----------------
class InventoryItemOut(Schema):
    id: UUID
    salon_id: UUID
    name: str
    sku: str
    item_type: str
    unit: str
    current_stock: Decimal
    min_stock_alert: Decimal
    cost_price: Decimal
    retail_price: Decimal
    is_low_stock: bool
    created_at: datetime


class InventoryItemCreate(Schema):
    salon_id: UUID
    name: str
    sku: Optional[str] = ""
    item_type: Optional[str] = "backbar_consumable"
    unit: Optional[str] = "gram"
    current_stock: Decimal
    min_stock_alert: Optional[Decimal] = Decimal("50.00")
    cost_price: Decimal
    retail_price: Optional[Decimal] = Decimal("0.00")


class InventoryDeductIn(Schema):
    item_id: UUID
    quantity: Decimal
    appointment_id: Optional[UUID] = None
    notes: Optional[str] = ""


# ---------------- POS & Invoices ----------------
class ConsumableUsageIn(Schema):
    item_id: UUID
    quantity_used: Decimal


class POSCheckoutIn(Schema):
    appointment_id: Optional[UUID] = None
    salon_id: UUID
    client_id: Optional[UUID] = None
    client_name: Optional[str] = None
    client_phone: Optional[str] = None
    staff_id: Optional[UUID] = None
    service_ids: List[UUID] = []
    retail_item_ids: List[UUID] = []
    subtotal: Decimal
    discount_amount: Optional[Decimal] = Decimal("0.00")
    tip_amount: Optional[Decimal] = Decimal("0.00")
    payment_method: str = "mada"
    formula_text: Optional[str] = None
    consumables_used: List[ConsumableUsageIn] = []


class InvoiceOut(Schema):
    id: UUID
    invoice_number: str
    salon_id: UUID
    appointment_id: Optional[UUID] = None
    client_name: str
    staff_name: Optional[str] = None
    subtotal: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    tip_amount: Decimal
    total_amount: Decimal
    payment_method: str
    payment_status: str
    staff_commission_amount: Decimal
    created_at: datetime


# ---------------- Analytics ----------------
class AnalyticsOverviewOut(Schema):
    today_revenue: Decimal
    today_appointments_count: int
    in_progress_count: int
    completed_count: int
    no_show_count: int
    low_stock_alerts_count: int
    top_services: List[dict]
    top_stylists: List[dict]


# ---------------- Auth & Public Lookup ----------------
class LoginInput(Schema):
    # Support email or phone
    identifier: str
    # Support password or pin
    credential: str
    login_type: Optional[str] = "password"  # 'password' or 'pin'


class StaffProfileOut(Schema):
    id: UUID
    salon_id: UUID
    salon_name: str
    salon_subdomain: str
    full_name: str
    email: str
    phone: str
    role: str
    specialty: str
    commission_rate_services: Decimal
    commission_rate_retail: Decimal
    avatar_url: str
    is_active: bool


class AuthTokenOut(Schema):
    token: str
    staff: StaffProfileOut
    message: str


class AppointmentLookupIn(Schema):
    phone: str
    salon_slug: Optional[str] = "tarjeel-vip"


class AppointmentLookupOut(Schema):
    id: UUID
    client_name: str
    client_phone: str
    service_name: str
    staff_name: Optional[str] = None
    start_time: datetime
    status: str
    total_amount: Decimal
    deposit_amount: Decimal
    notes: Optional[str] = ""

