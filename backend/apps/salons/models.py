import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone


class Salon(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="اسم الصالون")
    subdomain = models.SlugField(max_length=100, unique=True, verbose_name="النطاق الفرعي")
    phone = models.CharField(max_length=20, verbose_name="رقم الهاتف")
    address = models.TextField(blank=True, default="", verbose_name="العنوان")
    currency = models.CharField(max_length=10, default="SAR", verbose_name="العملة")
    tax_number = models.CharField(max_length=50, blank=True, default="", verbose_name="الرقم الضريبي")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("15.00"), verbose_name="نسبة الضريبة %")
    deposit_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("20.00"), verbose_name="نسبة العربون %")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")

    class Meta:
        db_table = "salons"
        verbose_name = "صالون"
        verbose_name_plural = "الصالونات"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


from django.contrib.auth.hashers import make_password, check_password as django_check_password

class Staff(models.Model):
    ROLE_CHOICES = [
        ("owner", "مالك / مدير"),
        ("receptionist", "موظفة استقبال"),
        ("stylist", "مصففة / أخصائية"),
        ("assistant", "مساعدة"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    salon = models.ForeignKey(Salon, on_delete=models.CASCADE, related_name="staff_members")
    full_name = models.CharField(max_length=255, verbose_name="الاسم الكامل")
    email = models.EmailField(blank=True, default="", verbose_name="البريد الإلكتروني")
    phone = models.CharField(max_length=20, blank=True, default="", verbose_name="رقم الجوال")
    password_hash = models.CharField(max_length=255, blank=True, default="", verbose_name="كلمة المرور المشفرة")
    pin_code = models.CharField(max_length=10, blank=True, default="1234", verbose_name="رمز PIN السريع")
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default="stylist", verbose_name="الدور الوظيفي")
    specialty = models.CharField(max_length=150, blank=True, default="تصفيف وصبغات", verbose_name="التخصص")
    commission_rate_services = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("10.00"), verbose_name="عمولة الخدمات %")
    commission_rate_retail = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("5.00"), verbose_name="عمولة مبيعات التجزئة %")
    avatar_url = models.URLField(blank=True, default="", verbose_name="صورة الموظفة")
    is_active = models.BooleanField(default=True, verbose_name="نشطة")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "staff"
        verbose_name = "موظفة"
        verbose_name_plural = "الموظفات"
        ordering = ["full_name"]

    def __str__(self):
        return f"{self.full_name} ({self.get_role_display()})"

    def set_password(self, raw_password: str):
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password: str) -> bool:
        if not self.password_hash:
            return False
        return django_check_password(raw_password, self.password_hash)

    def check_pin(self, raw_pin: str) -> bool:
        return bool(self.pin_code and self.pin_code == raw_pin)



class Service(models.Model):
    CHAIR_TYPE_CHOICES = [
        ("styling", "كرسي التصفيف والقص"),
        ("washing", "كرسي الغسيل والمعالجة"),
        ("spa", "غرفة السبا والعناية"),
        ("general", "كرسي عام"),
    ]

    CATEGORY_CHOICES = [
        ("hair", "العناية بالشعر والصبغات"),
        ("nails", "الأظافر والمانيكير"),
        ("skin", "البشرة والعناية"),
        ("spa", "المساج والاسترخاء"),
        ("makeup", "المكياج والمناسبات"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    salon = models.ForeignKey(Salon, on_delete=models.CASCADE, related_name="services")
    name = models.CharField(max_length=255, verbose_name="اسم الخدمة")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="hair", verbose_name="التصنيف")
    description = models.TextField(blank=True, default="", verbose_name="وصف الخدمة")
    duration_minutes = models.PositiveIntegerField(default=45, verbose_name="مدة الخدمة (بالدقائق)")
    buffer_after_minutes = models.PositiveIntegerField(default=10, verbose_name="وقت التعقيم والتجهيز (بالدقائق)")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="السعر (شامل الضريبة)")
    requires_chair_type = models.CharField(max_length=50, choices=CHAIR_TYPE_CHOICES, default="styling", verbose_name="نوع الكرسي المطلوب")
    is_active = models.BooleanField(default=True, verbose_name="متاحة للحجز")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "services"
        verbose_name = "خدمة"
        verbose_name_plural = "الخدمات"
        ordering = ["category", "name"]

    def __str__(self):
        return f"{self.name} - {self.price} {self.salon.currency}"


class Client(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    salon = models.ForeignKey(Salon, on_delete=models.CASCADE, related_name="clients")
    full_name = models.CharField(max_length=255, verbose_name="اسم العميلة")
    phone = models.CharField(max_length=20, verbose_name="رقم الجوال")
    email = models.EmailField(blank=True, default="", verbose_name="البريد الإلكتروني")
    notes = models.TextField(blank=True, default="", verbose_name="ملاحظات وتفضيلات")
    allergy_info = models.TextField(blank=True, default="", verbose_name="الحساسية والمحاذير الطبية")
    total_visits = models.PositiveIntegerField(default=0, verbose_name="إجمالي الزيارات")
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"), verbose_name="إجمالي الإنفاق")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "clients"
        verbose_name = "عميلة"
        verbose_name_plural = "العميلات"
        unique_together = [("salon", "phone")]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} ({self.phone})"


class Appointment(models.Model):
    STATUS_CHOICES = [
        ("pending_deposit", "بانتظار دفع العربون"),
        ("confirmed", "مؤكد"),
        ("in_progress", "قيد التنفيذ"),
        ("completed", "مكتمل"),
        ("cancelled", "ملغي"),
        ("no_show", "عدم حضور"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    salon = models.ForeignKey(Salon, on_delete=models.CASCADE, related_name="appointments")
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="appointments")
    staff = models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name="appointments")
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="appointments")
    start_time = models.DateTimeField(verbose_name="وقت البدء")
    end_time = models.DateTimeField(verbose_name="وقت الانتهاء")
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="confirmed", verbose_name="حالة الموعد")
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"), verbose_name="العربون المدفوع")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="إجمالي القيمة")
    notes = models.TextField(blank=True, default="", verbose_name="ملاحظات الحجز")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "appointments"
        verbose_name = "موعد"
        verbose_name_plural = "المواعيد"
        indexes = [
            models.Index(fields=["salon", "start_time"]),
            models.Index(fields=["staff", "start_time"]),
            models.Index(fields=["status"]),
        ]
        ordering = ["start_time"]

    def __str__(self):
        return f"موعد {self.client.full_name} مع {self.staff.full_name if self.staff else 'أي مصففة'} في {self.start_time.strftime('%Y-%m-%d %H:%M')}"

    @property
    def client_name(self) -> str:
        return self.client.full_name if self.client else ""

    @property
    def client_phone(self) -> str:
        return self.client.phone if self.client else ""



class ClientHairFormula(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="hair_formulas")
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name="hair_formulas")
    formula_text = models.TextField(verbose_name="تركيبة الصبغة / المعالجة بالتفصيل")
    brand_name = models.CharField(max_length=100, blank=True, default="", verbose_name="الماركة التجارية")
    before_photo_url = models.URLField(blank=True, default="", verbose_name="صورة قبل")
    after_photo_url = models.URLField(blank=True, default="", verbose_name="صورة بعد")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ التسجيل")

    class Meta:
        db_table = "client_hair_formulas"
        verbose_name = "تركيبة شعر"
        verbose_name_plural = "أرشيف تركيبات الشعر"
        ordering = ["-created_at"]

    def __str__(self):
        return f"تركيبة {self.client.full_name} ({self.created_at.strftime('%Y-%m-%d')})"


class InventoryItem(models.Model):
    ITEM_TYPE_CHOICES = [
        ("retail", "منتج بيع تجزئة"),
        ("backbar_consumable", "مستهلكات داخلية بالجرام/المل"),
    ]

    UNIT_CHOICES = [
        ("unit", "قطعة / علبة"),
        ("gram", "جرام (g)"),
        ("ml", "مليلتر (ml)"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    salon = models.ForeignKey(Salon, on_delete=models.CASCADE, related_name="inventory_items")
    name = models.CharField(max_length=255, verbose_name="اسم المنتج / المادة")
    sku = models.CharField(max_length=100, blank=True, default="", verbose_name="رمز الصنف (SKU)")
    item_type = models.CharField(max_length=50, choices=ITEM_TYPE_CHOICES, default="backbar_consumable", verbose_name="نوع الصنف")
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, default="gram", verbose_name="وحدة القياس")
    current_stock = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"), verbose_name="المخزون الحالي")
    min_stock_alert = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("50.00"), verbose_name="حد التنبيه")
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"), verbose_name="سعر التكلفة")
    retail_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"), verbose_name="سعر البيع")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "inventory_items"
        verbose_name = "صنف مخزون"
        verbose_name_plural = "أصناف المخزون"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.current_stock} {self.get_unit_display()})"

    @property
    def is_low_stock(self):
        return self.current_stock <= self.min_stock_alert


class Invoice(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ("cash", "نقدي"),
        ("card", "بطاقة ائتمان"),
        ("mada", "مدى"),
        ("apple_pay", "Apple Pay"),
        ("split", "دفع مجزأ"),
    ]

    STATUS_CHOICES = [
        ("paid", "مدفوعة"),
        ("pending", "معلقة"),
        ("refunded", "مسترجعة"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=50, unique=True, verbose_name="رقم الفاتورة")
    salon = models.ForeignKey(Salon, on_delete=models.CASCADE, related_name="invoices")
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name="invoices")
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="invoices")
    staff = models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name="invoices")
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="المجموع قبل الضريبة")
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"), verbose_name="مبلغ الضريبة")
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"), verbose_name="الخصم")
    tip_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"), verbose_name="الإكرامية")
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="المجموع الصافي")
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, default="mada", verbose_name="طريقة الدفع")
    payment_status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="paid", verbose_name="حالة الدفع")
    staff_commission_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"), verbose_name="عمولة الموظفة المحسوبة")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإصدار")

    class Meta:
        db_table = "invoices"
        verbose_name = "فاتورة"
        verbose_name_plural = "الفواتير"
        ordering = ["-created_at"]

    def __str__(self):
        return f"فاتورة #{self.invoice_number} - {self.total_amount} {self.salon.currency}"


class InventoryUsage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name="consumable_usages")
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name="usages")
    quantity_used = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="الكمية المستهلكة")
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "inventory_usages"
        verbose_name = "استهلاك مادة"
        verbose_name_plural = "سجل استهلاك المواد"
        ordering = ["-recorded_at"]
