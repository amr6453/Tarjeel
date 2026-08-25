import {
  Salon, Staff, Service, Client, Appointment,
  ClientHairFormula, InventoryItem, Invoice, AnalyticsOverview, AvailableSlot,
  AuthResponse, StaffProfile, AppointmentLookupResult
} from "./types";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

// Demo Fallback Data for resilient UI rendering
export const fallbackSalon: Salon = {
  id: "d3b07384-d113-460b-986a-7eddd2802061",
  name: "صالون تَرجيل للعناية والتجميل",
  subdomain: "tarjeel-vip",
  phone: "+966551234567",
  address: "المملكة العربية السعودية، الرياض، حي النرجس، طريق الملك سلمان",
  currency: "SAR",
  tax_number: "300987654300003",
  tax_rate: 15.0,
  deposit_percentage: 20.0,
  created_at: new Date().toISOString(),
};

export const fallbackStaff: Staff[] = [
  {
    id: "s1",
    salon_id: fallbackSalon.id,
    full_name: "سارة القحطاني",
    phone: "0551112233",
    role: "stylist",
    specialty: "كبير أخصائيات الصبغات والمعالجة",
    commission_rate_services: 15.0,
    commission_rate_retail: 8.0,
    avatar_url: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "s2",
    salon_id: fallbackSalon.id,
    full_name: "نورة الشهري",
    phone: "0552223344",
    role: "stylist",
    specialty: "تصفيف، قصات عصرية وسشوار",
    commission_rate_services: 12.0,
    commission_rate_retail: 6.0,
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "s3",
    salon_id: fallbackSalon.id,
    full_name: "ليلى مراد",
    phone: "0553334455",
    role: "stylist",
    specialty: "أخصائية العناية بالأظافر والسبا",
    commission_rate_services: 10.0,
    commission_rate_retail: 5.0,
    avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "s4",
    salon_id: fallbackSalon.id,
    full_name: "منى الدوسري",
    phone: "0554445566",
    role: "receptionist",
    specialty: "إدارة الاستقبال والحجوزات الفورية",
    commission_rate_services: 2.0,
    commission_rate_retail: 5.0,
    avatar_url: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
    is_active: true,
  },
];

export const fallbackServices: Service[] = [
  {
    id: "srv1",
    salon_id: fallbackSalon.id,
    name: "صبغ شعر كامل (أومبري / بالياج)",
    category: "hair",
    description: "تلوين كامل للشعر بأحدث تقنيات البالياج مع خلطات حماية متقدمة وتفتيح آمن.",
    duration_minutes: 120,
    buffer_after_minutes: 15,
    price: 650.0,
    requires_chair_type: "washing",
    is_active: true,
  },
  {
    id: "srv2",
    salon_id: fallbackSalon.id,
    name: "قص وتصفيف ملكي مع سشوار",
    category: "hair",
    description: "قص احترافي مخصص لشكل الوجه مع غسيل وسشوار علاجي بالزيوت.",
    duration_minutes: 45,
    buffer_after_minutes: 10,
    price: 180.0,
    requires_chair_type: "styling",
    is_active: true,
  },
  {
    id: "srv3",
    salon_id: fallbackSalon.id,
    name: "معالجة البروتين والكيراتين البرازيلي",
    category: "hair",
    description: "علاج ترميمي عميق للشعر التالف يمنحه نعومة ولمعاناً فائقاً.",
    duration_minutes: 150,
    buffer_after_minutes: 20,
    price: 900.0,
    requires_chair_type: "styling",
    is_active: true,
  },
  {
    id: "srv4",
    salon_id: fallbackSalon.id,
    name: "مانيكير وبديكير سبا متكامل",
    category: "nails",
    description: "عناية متكاملة للأظافر مع تقشير وقناع ترطيب عميق بالبارافين.",
    duration_minutes: 60,
    buffer_after_minutes: 10,
    price: 220.0,
    requires_chair_type: "spa",
    is_active: true,
  },
  {
    id: "srv5",
    salon_id: fallbackSalon.id,
    name: "تنظيف بشرة عميق هيدرافيشل",
    category: "skin",
    description: "جلسة تنظيف وتغذية للبشرة باستخدام أحدث أجهزة الهيدرافيشل والميزوثيرابي.",
    duration_minutes: 60,
    buffer_after_minutes: 15,
    price: 400.0,
    requires_chair_type: "spa",
    is_active: true,
  },
  {
    id: "srv6",
    salon_id: fallbackSalon.id,
    name: "مكياج سهرة ومناسبات VIP",
    category: "makeup",
    description: "مكياج سينمائي عالي الجودة يدوم طويلاً مع تركيب رموش طبيعية.",
    duration_minutes: 75,
    buffer_after_minutes: 15,
    price: 500.0,
    requires_chair_type: "styling",
    is_active: true,
  },
];

export const fallbackClients: Client[] = [
  {
    id: "c1",
    salon_id: fallbackSalon.id,
    full_name: "ريم بنت فهد الراجحي",
    phone: "0501234001",
    email: "reem.rajhi@example.com",
    notes: "تفضل القهوة السعودية، وتفضل مواعيد نهاية الأسبوع صباحاً.",
    allergy_info: "حساسية خفيفة من مادة الأمونيا القوية.",
    total_visits: 8,
    total_spent: 3850.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "c2",
    salon_id: fallbackSalon.id,
    full_name: "هند إبراهيم العتيبي",
    phone: "0501234002",
    email: "hind.otaibi@example.com",
    notes: "دائمة حجز قص وسشوار مع سارة القحطاني.",
    allergy_info: "لا يوجد",
    total_visits: 5,
    total_spent: 1450.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "c3",
    salon_id: fallbackSalon.id,
    full_name: "نوف عبدالعزيز التميمي",
    phone: "0501234003",
    email: "nouf.tamimi@example.com",
    notes: "تجهيز لعروس - تفضل الخصوصية التامة في غرفة السبا.",
    allergy_info: "حساسية من بعض الزيوت العطرية المركزة.",
    total_visits: 3,
    total_spent: 2400.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "c4",
    salon_id: fallbackSalon.id,
    full_name: "ديمة خالد السبيعي",
    phone: "0501234004",
    email: "deema.subaie@example.com",
    notes: "عميلة جديدة محولة من حملة التيك توك.",
    allergy_info: "لا يوجد",
    total_visits: 1,
    total_spent: 220.0,
    created_at: new Date().toISOString(),
  },
];

export const fallbackAppointments: Appointment[] = [
  {
    id: "app1",
    salon_id: fallbackSalon.id,
    client_id: "c1",
    client_name: "ريم بنت فهد الراجحي",
    client_phone: "0501234001",
    staff_id: "s1",
    staff_name: "سارة القحطاني",
    service_id: "srv1",
    service_name: "صبغ شعر كامل (أومبري / بالياج)",
    service_category: "hair",
    start_time: new Date(Date.now() - 3600000 * 3).toISOString(),
    end_time: new Date(Date.now() - 3600000 * 1).toISOString(),
    status: "completed",
    deposit_amount: 130.0,
    total_amount: 650.0,
    notes: "جلسة تجديد اللون السنوية",
    created_at: new Date().toISOString(),
  },
  {
    id: "app2",
    salon_id: fallbackSalon.id,
    client_id: "c2",
    client_name: "هند إبراهيم العتيبي",
    client_phone: "0501234002",
    staff_id: "s2",
    staff_name: "نورة الشهري",
    service_id: "srv2",
    service_name: "قص وتصفيف ملكي مع سشوار",
    service_category: "hair",
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 2700000).toISOString(),
    status: "in_progress",
    deposit_amount: 36.0,
    total_amount: 180.0,
    notes: "قص أطراف وتدريج ناعم",
    created_at: new Date().toISOString(),
  },
  {
    id: "app3",
    salon_id: fallbackSalon.id,
    client_id: "c3",
    client_name: "نوف عبدالعزيز التميمي",
    client_phone: "0501234003",
    staff_id: "s3",
    staff_name: "ليلى مراد",
    service_id: "srv4",
    service_name: "مانيكير وبديكير سبا متكامل",
    service_category: "nails",
    start_time: new Date(Date.now() + 3600000 * 2).toISOString(),
    end_time: new Date(Date.now() + 3600000 * 3).toISOString(),
    status: "confirmed",
    deposit_amount: 44.0,
    total_amount: 220.0,
    notes: "تجهيز أظافر عروس",
    created_at: new Date().toISOString(),
  },
  {
    id: "app4",
    salon_id: fallbackSalon.id,
    client_id: "c4",
    client_name: "ديمة خالد السبيعي",
    client_phone: "0501234004",
    staff_id: "s1",
    staff_name: "سارة القحطاني",
    service_id: "srv3",
    service_name: "معالجة البروتين والكيراتين البرازيلي",
    service_category: "hair",
    start_time: new Date(Date.now() + 3600000 * 4).toISOString(),
    end_time: new Date(Date.now() + 3600000 * 6.5).toISOString(),
    status: "confirmed",
    deposit_amount: 180.0,
    total_amount: 900.0,
    notes: "شعر كثيف يحتاج وقت إضافي",
    created_at: new Date().toISOString(),
  },
];

export const fallbackInventory: InventoryItem[] = [
  {
    id: "inv1",
    salon_id: fallbackSalon.id,
    name: "صبغة لوريال ماجيريل 7.1 (أشقر رمادي)",
    sku: "LOR-MAJ-71",
    item_type: "backbar_consumable",
    unit: "gram",
    current_stock: 1250.0,
    min_stock_alert: 200.0,
    cost_price: 0.45,
    retail_price: 0.0,
    is_low_stock: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "inv2",
    salon_id: fallbackSalon.id,
    name: "مؤكسد إينوا L'Oreal Oxydant 20 Vol",
    sku: "LOR-OXY-20",
    item_type: "backbar_consumable",
    unit: "ml",
    current_stock: 3500.0,
    min_stock_alert: 500.0,
    cost_price: 0.12,
    retail_price: 0.0,
    is_low_stock: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "inv3",
    salon_id: fallbackSalon.id,
    name: "معالج أولابليكس رقم 1 و 2 المركز",
    sku: "OLA-PRO-12",
    item_type: "backbar_consumable",
    unit: "ml",
    current_stock: 120.0,
    min_stock_alert: 150.0,
    cost_price: 1.2,
    retail_price: 0.0,
    is_low_stock: true, // Alert!
    created_at: new Date().toISOString(),
  },
  {
    id: "inv4",
    salon_id: fallbackSalon.id,
    name: "زيت الأرجان المغربي العضوي النقي (تجزئة)",
    sku: "ARG-RET-100",
    item_type: "retail",
    unit: "unit",
    current_stock: 24.0,
    min_stock_alert: 5.0,
    cost_price: 65.0,
    retail_price: 145.0,
    is_low_stock: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "inv5",
    salon_id: fallbackSalon.id,
    name: "شامبو كيراتين خالي من السلفات 500ml (تجزئة)",
    sku: "KER-SHP-500",
    item_type: "retail",
    unit: "unit",
    current_stock: 3.0,
    min_stock_alert: 4.0,
    cost_price: 45.0,
    retail_price: 110.0,
    is_low_stock: true, // Alert!
    created_at: new Date().toISOString(),
  },
];

export const fallbackFormulas: ClientHairFormula[] = [
  {
    id: "f1",
    client_id: "c1",
    appointment_id: "app1",
    formula_text: "L'Oreal Majirel 7.1 (40g) + 8.1 (20g) + Oxydant 20Vol (90ml) مع إضافة 3.75ml أولابليكس رقم 1. وقت التثبيت: 35 دقيقة.",
    brand_name: "L'Oreal Professional",
    before_photo_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80",
    after_photo_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&auto=format&fit=crop&q=80",
    created_at: new Date().toISOString(),
  },
];

export const fallbackAnalytics: AnalyticsOverview = {
  today_revenue: 1950.0,
  today_appointments_count: 4,
  in_progress_count: 1,
  completed_count: 1,
  no_show_count: 0,
  low_stock_alerts_count: 2,
  top_services: [
    { name: "صبغ شعر كامل (أومبري / بالياج)", category: "hair", count: 18, price: 650.0 },
    { name: "قص وتصفيف ملكي مع سشوار", category: "hair", count: 26, price: 180.0 },
    { name: "معالجة البروتين والكيراتين", category: "hair", count: 12, price: 900.0 },
    { name: "مانيكير وبديكير سبا متكامل", category: "nails", count: 22, price: 220.0 },
  ],
  top_stylists: [
    { name: "سارة القحطاني", specialty: "كبير أخصائيات الصبغات والمعالجة", completed_appointments: 28 },
    { name: "نورة الشهري", specialty: "تصفيف وقصات عصرية", completed_appointments: 24 },
    { name: "ليلى مراد", specialty: "أخصائية أظافر وسبا", completed_appointments: 19 },
  ],
};

// API Fetch Helper
async function apiFetch<T>(endpoint: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      if (fallback !== undefined) return fallback;
      throw new Error(`API Error: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    if (fallback !== undefined) return fallback;
    throw err;
  }
}

export const api = {
  // Salon
  getSalonBySlug: (slug: string) =>
    apiFetch<Salon>(`/public/salons/${slug}`, undefined, fallbackSalon),

  // Public Booking
  getPublicServices: (slug: string, category?: string) =>
    apiFetch<Service[]>(
      `/public/salons/${slug}/services${category ? `?category=${category}` : ""}`,
      undefined,
      fallbackServices
    ),

  getPublicStaff: (slug: string) =>
    apiFetch<Staff[]>(`/public/salons/${slug}/staff`, undefined, fallbackStaff),

  getAvailableSlots: (slug: string, serviceId: string, dateStr: string, staffId?: string) => {
    let url = `/public/salons/${slug}/available-slots?service_id=${serviceId}&target_date=${dateStr}`;
    if (staffId) url += `&staff_id=${staffId}`;
    return apiFetch<AvailableSlot[]>(url, undefined, [
      { start_time: `${dateStr}T10:00:00Z`, end_time: `${dateStr}T11:00:00Z`, staff_name: "سارة القحطاني", is_available: true },
      { start_time: `${dateStr}T11:30:00Z`, end_time: `${dateStr}T12:30:00Z`, staff_name: "نورة الشهري", is_available: true },
      { start_time: `${dateStr}T14:00:00Z`, end_time: `${dateStr}T15:00:00Z`, staff_name: "ليلى مراد", is_available: true },
      { start_time: `${dateStr}T16:30:00Z`, end_time: `${dateStr}T17:30:00Z`, staff_name: "سارة القحطاني", is_available: true },
      { start_time: `${dateStr}T18:00:00Z`, end_time: `${dateStr}T19:00:00Z`, staff_name: "نورة الشهري", is_available: true },
    ]);
  },

  createBooking: (payload: any) =>
    apiFetch<Appointment>(
      `/public/bookings`,
      { method: "POST", body: JSON.stringify(payload) },
      {
        id: `app-${Date.now()}`,
        salon_id: payload.salon_id,
        client_id: `c-${Date.now()}`,
        client_name: payload.client_name,
        client_phone: payload.client_phone,
        service_id: payload.service_id,
        service_name: "خدمة صالون",
        service_category: "hair",
        start_time: payload.start_time,
        end_time: payload.start_time,
        status: "confirmed",
        deposit_amount: 50.0,
        total_amount: 250.0,
        notes: payload.notes || "",
        created_at: new Date().toISOString(),
      }
    ),

  // Dashboard & Admin
  getAppointments: (salonId?: string, status?: string, dateStr?: string) => {
    let url = `/appointments?`;
    if (salonId) url += `salon_id=${salonId}&`;
    if (status) url += `status=${status}&`;
    if (dateStr) url += `target_date=${dateStr}&`;
    return apiFetch<Appointment[]>(url, undefined, fallbackAppointments);
  },

  updateAppointmentStatus: (id: string, status: string) =>
    apiFetch<Appointment>(
      `/appointments/${id}/status`,
      { method: "PATCH", body: JSON.stringify({ status }) },
      { ...fallbackAppointments[0], id, status: status as any }
    ),

  getClients: (salonId?: string, search?: string) => {
    let url = `/clients?`;
    if (salonId) url += `salon_id=${salonId}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    return apiFetch<Client[]>(url, undefined, fallbackClients);
  },

  getClientFormulas: (clientId: string) =>
    apiFetch<ClientHairFormula[]>(`/clients/${clientId}/formulas`, undefined, fallbackFormulas),

  addClientFormula: (clientId: string, payload: any) =>
    apiFetch<ClientHairFormula>(
      `/clients/${clientId}/formulas`,
      { method: "POST", body: JSON.stringify(payload) },
      {
        id: `f-${Date.now()}`,
        client_id: clientId,
        formula_text: payload.formula_text,
        brand_name: payload.brand_name || "ترجيل",
        before_photo_url: payload.before_photo_url || "",
        after_photo_url: payload.after_photo_url || "",
        created_at: new Date().toISOString(),
      }
    ),

  getInventory: (salonId?: string, itemType?: string) => {
    let url = `/inventory?`;
    if (salonId) url += `salon_id=${salonId}&`;
    if (itemType) url += `item_type=${itemType}&`;
    return apiFetch<InventoryItem[]>(url, undefined, fallbackInventory);
  },

  deductInventory: (payload: { item_id: string; quantity: number; appointment_id?: string }) =>
    apiFetch<InventoryItem>(
      `/inventory/deduct-consumable`,
      { method: "POST", body: JSON.stringify(payload) },
      { ...fallbackInventory[0], current_stock: 1200.0 }
    ),

  getStaff: (salonId?: string) =>
    apiFetch<Staff[]>(`/staff${salonId ? `?salon_id=${salonId}` : ""}`, undefined, fallbackStaff),

  getServices: (salonId?: string) =>
    apiFetch<Service[]>(`/services${salonId ? `?salon_id=${salonId}` : ""}`, undefined, fallbackServices),

  posCheckout: (payload: any) =>
    apiFetch<Invoice>(
      `/pos/checkout`,
      { method: "POST", body: JSON.stringify(payload) },
      {
        id: `inv-${Date.now()}`,
        invoice_number: `INV-20260820-${Math.floor(1000 + Math.random() * 9000)}`,
        salon_id: payload.salon_id,
        client_name: payload.client_name || "عميلة صالون",
        subtotal: payload.subtotal,
        tax_amount: Number((payload.subtotal * 0.15).toFixed(2)),
        discount_amount: payload.discount_amount || 0,
        tip_amount: payload.tip_amount || 0,
        total_amount: Number((payload.subtotal * 1.15 + (payload.tip_amount || 0)).toFixed(2)),
        payment_method: payload.payment_method || "mada",
        payment_status: "paid",
        staff_commission_amount: Number((payload.subtotal * 0.1).toFixed(2)),
        created_at: new Date().toISOString(),
      }
    ),

  getAnalyticsOverview: (salonId?: string) =>
    apiFetch<AnalyticsOverview>(
      `/analytics/overview${salonId ? `?salon_id=${salonId}` : ""}`,
      undefined,
      fallbackAnalytics
    ),

  // Auth & Session
  login: (payload: { identifier: string; credential: string; login_type?: string }) =>
    apiFetch<AuthResponse>(
      `/auth/login`,
      { method: "POST", body: JSON.stringify(payload) },
      {
        token: `mock-token-${Date.now()}`,
        staff: {
          id: "staff-owner",
          salon_id: fallbackSalon.id,
          salon_name: fallbackSalon.name,
          salon_subdomain: fallbackSalon.subdomain,
          full_name: "نورة الشمري",
          email: payload.identifier.includes("@") ? payload.identifier : "admin@tarjeel.com",
          phone: payload.identifier.includes("@") ? "0501112233" : payload.identifier,
          role: "owner",
          specialty: "المالكة والمديرة العامة لصالون تَرجِيل VIP",
          commission_rate_services: 0,
          commission_rate_retail: 0,
          avatar_url: "/images/hero_salon.jpg",
          is_active: true,
        },
        message: "تم تسجيل الدخول بنجاح.",
      }
    ),

  getMe: (staffId: string) =>
    apiFetch<StaffProfile>(
      `/auth/me?staff_id=${staffId}`,
      undefined,
      {
        id: staffId,
        salon_id: fallbackSalon.id,
        salon_name: fallbackSalon.name,
        salon_subdomain: fallbackSalon.subdomain,
        full_name: "نورة الشمري",
        email: "admin@tarjeel.com",
        phone: "0501112233",
        role: "owner",
        specialty: "المالكة والمديرة العامة",
        commission_rate_services: 0,
        commission_rate_retail: 0,
        avatar_url: "/images/hero_salon.jpg",
        is_active: true,
      }
    ),

  logout: () =>
    apiFetch<{ status: string; message: string }>(
      `/auth/logout`,
      { method: "POST" },
      { status: "success", message: "تم تسجيل الخروج بنجاح." }
    ),

  // Public Appointment Lookup
  lookupAppointments: (phone: string) =>
    apiFetch<AppointmentLookupResult[]>(
      `/public/appointments/lookup`,
      { method: "POST", body: JSON.stringify({ phone }) },
      []
    ),
};

