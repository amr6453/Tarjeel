from datetime import timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.salons.models import (
    Salon, Staff, Service, Client, Appointment,
    ClientHairFormula, InventoryItem, Invoice, InventoryUsage
)


class Command(BaseCommand):
    help = "Seeds demo data for Tarjeel Salon Management"

    def handle(self, *args, **kwargs):
        self.stdout.write("Began seeding Tarjeel demo data...")

        # 1. Flagship Salon
        salon, created = Salon.objects.get_or_create(
            subdomain="tarjeel-vip",
            defaults={
                "name": "صالون وتَرجيل لاونج للعناية والتجميل",
                "phone": "+966551234567",
                "address": "المملكة العربية السعودية، الرياض، حي النرجس، طريق الملك سلمان",
                "currency": "SAR",
                "tax_number": "300987654300003",
                "tax_rate": Decimal("15.00"),
                "deposit_percentage": Decimal("20.00"),
            }
        )
        self.stdout.write("Salon created successfully.")

        # 2. Staff Members
        from django.contrib.auth.hashers import make_password

        staff_data = [
            {
                "full_name": "نورة الشمري",
                "email": "admin@tarjeel.com",
                "phone": "0501112233",
                "password_hash": make_password("admin123"),
                "pin_code": "1111",
                "role": "owner",
                "specialty": "المالكة والمديرة العامة لصالون تَرجِيل VIP",
                "commission_rate_services": Decimal("0.00"),
                "commission_rate_retail": Decimal("0.00"),
                "avatar_url": "/images/hero_salon.jpg",
            },
            {
                "full_name": "سارة القحطاني",
                "email": "sara@tarjeel.com",
                "phone": "0551112233",
                "password_hash": make_password("sara123"),
                "pin_code": "1234",
                "role": "stylist",
                "specialty": "كبير أخصائيات صبغات البالياج والمعالجة الملكية",
                "commission_rate_services": Decimal("15.00"),
                "commission_rate_retail": Decimal("8.00"),
                "avatar_url": "/images/hero_salon.jpg",
            },
            {
                "full_name": "منى الدوسري",
                "email": "reception@tarjeel.com",
                "phone": "0554445566",
                "password_hash": make_password("cashier123"),
                "pin_code": "2222",
                "role": "receptionist",
                "specialty": "إدارة الاستقبال وضيافة العميلات والكاشير POS",
                "commission_rate_services": Decimal("2.00"),
                "commission_rate_retail": Decimal("5.00"),
                "avatar_url": "/images/hero_salon.jpg",
            },
            {
                "full_name": "نورة الشهري",
                "email": "noura@tarjeel.com",
                "phone": "0552223344",
                "password_hash": make_password("noura123"),
                "pin_code": "3333",
                "role": "stylist",
                "specialty": "تصفيف، قصات عصرية واستشوار علاجي",
                "commission_rate_services": Decimal("12.00"),
                "commission_rate_retail": Decimal("6.00"),
                "avatar_url": "/images/hero_salon.jpg",
            },
            {
                "full_name": "ليلى مراد",
                "email": "layla@tarjeel.com",
                "phone": "0553334455",
                "password_hash": make_password("layla123"),
                "pin_code": "4444",
                "role": "stylist",
                "specialty": "أخصائية العناية بالأظافر وسبا البارافين",
                "commission_rate_services": Decimal("10.00"),
                "commission_rate_retail": Decimal("5.00"),
                "avatar_url": "/images/package_spa.jpg",
            },
            {
                "full_name": "أروى المنصور",
                "email": "arwa@tarjeel.com",
                "phone": "0556667788",
                "password_hash": make_password("arwa123"),
                "pin_code": "5555",
                "role": "stylist",
                "specialty": "أخصائية علاجات البشرة وهيدرافيشل",
                "commission_rate_services": Decimal("14.00"),
                "commission_rate_retail": Decimal("7.00"),
                "avatar_url": "/images/package_skin.jpg",
            },
        ]

        staff_objs = []
        for item in staff_data:
            st, _ = Staff.objects.update_or_create(
                salon=salon,
                full_name=item["full_name"],
                defaults=item
            )
            staff_objs.append(st)

        # 3. Services (Luxury & Realistic)
        services_data = [
            {
                "name": "قص وتصفيف ملكي مع سشوار علاجي",
                "category": "hair",
                "description": "قص دقيق ومناسب لشكل الوجه مع غسيل بمستخلصات الزيوت العضوية وسشوار لمعان فائق.",
                "duration_minutes": 45,
                "buffer_after_minutes": 10,
                "price": Decimal("180.00"),
                "requires_chair_type": "styling",
            },
            {
                "name": "صبغ شعر كامل احترافي (أومبري / بالياج)",
                "category": "hair",
                "description": "تلوين بأحدث تقنيات الدمج الطبيعي مع حماية ألياف الشعر بواسطة الأولابليكس لثبات ولمعان يدوم.",
                "duration_minutes": 120,
                "buffer_after_minutes": 15,
                "price": Decimal("650.00"),
                "requires_chair_type": "washing",
            },
            {
                "name": "معالجة البروتين والكيراتين البرازيلي المعزز",
                "category": "hair",
                "description": "ترميم عميق لألياف الشعر الجاف والتالف يمنح خصلاتك انسيابية ونعومة حريرية تدوم حتى 6 أشهر.",
                "duration_minutes": 150,
                "buffer_after_minutes": 20,
                "price": Decimal("900.00"),
                "requires_chair_type": "styling",
            },
            {
                "name": "جلسة ديتوكس وماسك الكافيار لفروة الرأس",
                "category": "hair",
                "description": "تنقية عميقة لمسام فروة الرأس مع تدليك استرخائي وتغذية مركزة بخلاصة الكافيار الأسود.",
                "duration_minutes": 40,
                "buffer_after_minutes": 10,
                "price": Decimal("250.00"),
                "requires_chair_type": "washing",
            },
            {
                "name": "مانيكير وبديكير سبا بالبارافين والورد الطبيعي",
                "category": "nails",
                "description": "عناية ملكية لليدين والقدمين مع تقشير بأملاح البحر الميت وقناع البارافين الدافئ لترطيب عميق.",
                "duration_minutes": 60,
                "buffer_after_minutes": 10,
                "price": Decimal("220.00"),
                "requires_chair_type": "spa",
            },
            {
                "name": "تنظيف بشرة هيدرافيشل عميق مع تقشير ألماسي",
                "category": "skin",
                "description": "تنظيف وتجديد خلايا البشرة وإزالة الرؤوس السوداء مع حقن سيروم الهيالورونيك لنضارة فورية.",
                "duration_minutes": 60,
                "buffer_after_minutes": 15,
                "price": Decimal("420.00"),
                "requires_chair_type": "spa",
            },
            {
                "name": "قناع الذهب عيار 24 لشد ونضارة البشرة",
                "category": "skin",
                "description": "جلسة نضارة المشاهير بصفائح الذهب الخالص لتحفيز الكولاجين ومنح البشرة توهجاً لافتاً.",
                "duration_minutes": 50,
                "buffer_after_minutes": 10,
                "price": Decimal("380.00"),
                "requires_chair_type": "spa",
            },
            {
                "name": "مكياج سهرة ومناسبات VIP متكامل",
                "category": "makeup",
                "description": "مكياج احترافي عالي الثبات بتقنية الـ HD مع تركيب رموش طبيعية 3D ونحت ملامح الوجه.",
                "duration_minutes": 75,
                "buffer_after_minutes": 15,
                "price": Decimal("550.00"),
                "requires_chair_type": "styling",
            },
        ]

        service_objs = []
        for s_data in services_data:
            srv, _ = Service.objects.update_or_create(
                salon=salon,
                name=s_data["name"],
                defaults=s_data
            )
            service_objs.append(srv)

        # 4. Clients
        clients_data = [
            {
                "full_name": "ريم بنت فهد الراجحي",
                "phone": "0501234001",
                "email": "reem.rajhi@example.com",
                "notes": "تفضل القهوة السعودية بالهيل، وتفضل مواعيد نهاية الأسبوع صباحاً.",
                "allergy_info": "حساسية خفيفة من مادة الأمونيا القوية.",
                "total_visits": 8,
                "total_spent": Decimal("3850.00"),
            },
            {
                "full_name": "هند إبراهيم العتيبي",
                "phone": "0501234002",
                "email": "hind.otaibi@example.com",
                "notes": "دائمة حجز قص وسشوار مع سارة القحطاني.",
                "allergy_info": "لا يوجد",
                "total_visits": 5,
                "total_spent": Decimal("1450.00"),
            },
            {
                "full_name": "نوف عبدالعزيز التميمي",
                "phone": "0501234003",
                "email": "nouf.tamimi@example.com",
                "notes": "تجهيز لعروس - تفضل الخصوصية التامة في غرفة السبا الملكي.",
                "allergy_info": "حساسية من بعض الزيوت العطرية الحمضية المركزة.",
                "total_visits": 3,
                "total_spent": Decimal("2400.00"),
            },
            {
                "full_name": "ديمة خالد السبيعي",
                "phone": "0501234004",
                "email": "deema.subaie@example.com",
                "notes": "عميلة جديدة محولة من إعلان تيك توك.",
                "allergy_info": "لا يوجد",
                "total_visits": 1,
                "total_spent": Decimal("220.00"),
            },
        ]

        client_objs = []
        for c_data in clients_data:
            cl, _ = Client.objects.update_or_create(
                salon=salon,
                phone=c_data["phone"],
                defaults=c_data
            )
            client_objs.append(cl)

        # 5. Inventory Items (Consumables in Grams & Retail)
        inventory_data = [
            {
                "name": "صبغة لوريال ماجيريل 7.1 (أشقر رمادي بارد)",
                "sku": "LOR-MAJ-71",
                "item_type": "backbar_consumable",
                "unit": "gram",
                "current_stock": Decimal("1250.00"),
                "min_stock_alert": Decimal("200.00"),
                "cost_price": Decimal("0.45"),
                "retail_price": Decimal("0.00"),
            },
            {
                "name": "مؤكسد إينوا L'Oreal Oxydant 20 Vol",
                "sku": "LOR-OXY-20",
                "item_type": "backbar_consumable",
                "unit": "ml",
                "current_stock": Decimal("3500.00"),
                "min_stock_alert": Decimal("500.00"),
                "cost_price": Decimal("0.12"),
                "retail_price": Decimal("0.00"),
            },
            {
                "name": "معالج أولابليكس رقم 1 و 2 المركز للبوندينج",
                "sku": "OLA-PRO-12",
                "item_type": "backbar_consumable",
                "unit": "ml",
                "current_stock": Decimal("850.00"),
                "min_stock_alert": Decimal("150.00"),
                "cost_price": Decimal("1.20"),
                "retail_price": Decimal("0.00"),
            },
            {
                "name": "سيروم زيت الأرجان المغربي العضوي النقي 100ml",
                "sku": "ARG-RET-100",
                "item_type": "retail",
                "unit": "unit",
                "current_stock": Decimal("24.00"),
                "min_stock_alert": Decimal("5.00"),
                "cost_price": Decimal("65.00"),
                "retail_price": Decimal("145.00"),
            },
            {
                "name": "شامبو كيراتين عضوي خالي من السلفات 500ml",
                "sku": "KER-SHP-500",
                "item_type": "retail",
                "unit": "unit",
                "current_stock": Decimal("18.00"),
                "min_stock_alert": Decimal("4.00"),
                "cost_price": Decimal("45.00"),
                "retail_price": Decimal("110.00"),
            },
            {
                "name": "قناع الذهب الخالص لترطيب البشرة (عبوة مفردة)",
                "sku": "MSK-GLD-01",
                "item_type": "backbar_consumable",
                "unit": "unit",
                "current_stock": Decimal("35.00"),
                "min_stock_alert": Decimal("10.00"),
                "cost_price": Decimal("22.00"),
                "retail_price": Decimal("0.00"),
            },
        ]

        inv_objs = []
        for inv_data in inventory_data:
            inv, _ = InventoryItem.objects.update_or_create(
                salon=salon,
                sku=inv_data["sku"],
                defaults=inv_data
            )
            inv_objs.append(inv)

        # 6. Hair Formulas
        ClientHairFormula.objects.update_or_create(
            client=client_objs[0],
            defaults={
                "formula_text": "L'Oreal Majirel 7.1 (40g) + 8.1 (20g) + Oxydant 20Vol (90ml) مع إضافة 3.75ml أولابليكس رقم 1. وقت التثبيت: 35 دقيقة.",
                "brand_name": "L'Oreal Professional",
                "before_photo_url": "/images/package_hair.jpg",
                "after_photo_url": "/images/hero_salon.jpg",
            }
        )

        # 7. Today's Appointments & Invoices
        now = timezone.now()
        today_10am = now.replace(hour=10, minute=0, second=0, microsecond=0)
        today_12pm = now.replace(hour=12, minute=30, second=0, microsecond=0)
        today_3pm = now.replace(hour=15, minute=0, second=0, microsecond=0)
        today_5pm = now.replace(hour=17, minute=0, second=0, microsecond=0)

        # Appointment 1 (Completed + Invoiced)
        app1, _ = Appointment.objects.update_or_create(
            salon=salon,
            client=client_objs[0],
            start_time=today_10am,
            defaults={
                "staff": staff_objs[0],
                "service": service_objs[1], # Balayage 650 SAR
                "end_time": today_10am + timedelta(minutes=120),
                "status": "completed",
                "deposit_amount": Decimal("130.00"),
                "total_amount": Decimal("650.00"),
                "notes": "جلسة صبغ سنوية وتجديد البالياج",
            }
        )

        Invoice.objects.update_or_create(
            invoice_number="INV-20260822-1001",
            defaults={
                "salon": salon,
                "appointment": app1,
                "client": client_objs[0],
                "staff": staff_objs[0],
                "subtotal": Decimal("650.00"),
                "tax_amount": Decimal("97.50"),
                "discount_amount": Decimal("0.00"),
                "tip_amount": Decimal("50.00"),
                "total_amount": Decimal("797.50"),
                "payment_method": "mada",
                "payment_status": "paid",
                "staff_commission_amount": Decimal("97.50"),
            }
        )

        # Appointment 2 (In Progress)
        Appointment.objects.update_or_create(
            salon=salon,
            client=client_objs[1],
            start_time=today_12pm,
            defaults={
                "staff": staff_objs[1],
                "service": service_objs[0], # Cut & Blowdry 180 SAR
                "end_time": today_12pm + timedelta(minutes=45),
                "status": "in_progress",
                "deposit_amount": Decimal("36.00"),
                "total_amount": Decimal("180.00"),
                "notes": "قص أطراف وتدريج ناعم",
            }
        )

        # Appointment 3 (Confirmed)
        Appointment.objects.update_or_create(
            salon=salon,
            client=client_objs[2],
            start_time=today_3pm,
            defaults={
                "staff": staff_objs[2],
                "service": service_objs[4], # Spa Manicure 220 SAR
                "end_time": today_3pm + timedelta(minutes=60),
                "status": "confirmed",
                "deposit_amount": Decimal("44.00"),
                "total_amount": Decimal("220.00"),
                "notes": "جلسة عناية بالأظافر قبل مناسبة نهاية الأسبوع",
            }
        )

        # Appointment 4 (Confirmed)
        Appointment.objects.update_or_create(
            salon=salon,
            client=client_objs[3],
            start_time=today_5pm,
            defaults={
                "staff": staff_objs[0],
                "service": service_objs[2], # Protein Treatment 900 SAR
                "end_time": today_5pm + timedelta(minutes=150),
                "status": "confirmed",
                "deposit_amount": Decimal("180.00"),
                "total_amount": Decimal("900.00"),
                "notes": "جلسة علاج البروتين والكيراتين للشعر التالف",
            }
        )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Tarjeel demo data with real backend items!"))
