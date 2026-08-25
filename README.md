# تَرجيل (Tarjeel)

نظام سحابي لإدارة صالونات التجميل ومراكز العناية النسائية، مبني بواجهة عربية كاملة (RTL).

> «رَجَّلَ شَعَرَهُ يَرْجُلُهُ رَجْلاً وتَرْجِيلاً: سَرَّحَهُ وحَسَّنَهُ وَزَيَّنَهُ» (لسان العرب)

---

## تجربة النظام (Live Demo)

- **رابط التجربة المباشرة:** https://tarjeel.vercel.app/

---

## الميزات الأساسية

- **بوابة حجز العميلات:** حجز المواعيد، اختيار المصففة، تحديد فترات التعقيم تلقائياً، ودفع العربون.
- **إدارة المواعيد والتقويم:** جدولة المواعيد وتحديث الحالات (مؤكد، قيد التنفيذ، مكتمل، عدم حضور).
- **نقطة البيع (POS):** فوترة الخدمات ومنتجات التجزئة، حساب ضريبة القيمة المضافة (15%)، وتسجيل الخصومات والإكراميات.
- **سجل تركيبات الصبغة (Hair Formula):** حفظ نسب خلط الصبغات والمؤكسدات بالجرام والمل، مع سجل حساسية مخصص لكل عميلة.
- **إدارة المخزون والاستهلاك الداخلي:** خصم كميات الصبغة والمعالجات المستهلكة من المخزون تلقائياً بالجرام عند إتمام الفاتورة.
- **حساب العمولات:** احتساب عمولة المصففات تلقائياً بناءً على الخدمات المنفذة ومبيعات التجزئة.

---

## التقنيات المستخدمة

### Backend
- **Python 3 / Django 5**
- **Django Ninja:** لمعالجة وتوثيق واجهات REST API عبر Swagger
- **SQLite / PostgreSQL**
- **Pytest:** لاختبار الخدمات ونقاط الـ API

### Frontend
- **Next.js 15 (App Router)**
- **React 19 / TypeScript**
- **Tailwind CSS** مع خط Cairo وواجهة مهيأة للغة العربية (RTL)
- **Lucide React & Framer Motion**

---

## طريقة التشغيل محلياً

### 1. تشغيل الـ Backend

```bash
cd backend
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py seed_tarjeel
python manage.py runserver 8000
```

- التوثيق التفاعلي للـ API (Swagger): `http://127.0.0.1:8000/api/v1/docs`

### 2. تشغيل الـ Frontend

```bash
cd frontend
npm install
npm run dev
```

- **بوابة الحجز:** `http://localhost:3000`
- **تتبع الحجز:** `http://localhost:3000/track`
- **لوحة التحكم:** `http://localhost:3000/dashboard`
- **المواعيد والتقويم:** `http://localhost:3000/dashboard/appointments`
- **نقطة البيع (POS):** `http://localhost:3000/dashboard/pos`
- **سجل العميلات والتركيبات:** `http://localhost:3000/dashboard/clients`
- **المخزون واستهلاك المواد:** `http://localhost:3000/dashboard/inventory`
- **فريق العمل والعمولات:** `http://localhost:3000/dashboard/staff`

---

## تشغيل الاختبارات

```bash
cd backend
python -m pytest
```
