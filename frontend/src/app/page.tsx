"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Scissors,
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
  ShieldCheck,
  User,
  AlertTriangle,
  ArrowUpLeft,
  ArrowDown,
  Phone,
  MapPin,
  Star,
  Heart,
  ChevronRight,
  X
} from "lucide-react";
import { api } from "@/lib/api";
import { Service, Staff, AvailableSlot, Appointment } from "@/lib/types";
import { formatSAR, formatArabicDate, formatArabicTime } from "@/lib/utils";
import { LoadingSkeleton, EmptyState, ErrorState } from "@/components/ui/StateFeedback";

export default function BookingPortalPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  // Client form
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAllergy, setClientAllergy] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");

  // States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);

  const categories = [
    { id: "all", label: "كافة الخدمات" },
    { id: "hair", label: "الشعر والتصفيف" },
    { id: "nails", label: "الأظافر والسبا" },
    { id: "skin", label: "علاجات البشرة" },
    { id: "makeup", label: "المكياج الاحترافي" },
  ];

  const curatedPackages = [
    {
      id: "pkg-1",
      title: "باقة التصفيف والصبغات الملكية",
      category: "hair",
      price: 650,
      duration: "120 دقيقة",
      image: "/images/package_hair.jpg",
      description: "جلسة تلوين بالياج فاخرة مع حماية ألياف الشعر وسشوار لمعان فائق لإطلالة ساحرة.",
      tag: "الأكثر طلباً",
    },
    {
      id: "pkg-2",
      title: "باقة السبا والترميم العميق",
      category: "nails",
      price: 220,
      duration: "60 دقيقة",
      image: "/images/package_spa.jpg",
      description: "عناية متكاملة باليدين والقدمين مع تقشير وقناع البارافين الدافئ لترطيب ونعومة حريرية.",
      tag: "استرخاء فائق",
    },
    {
      id: "pkg-3",
      title: "باقة الإشراقة وهيدرافيشل",
      category: "skin",
      price: 420,
      duration: "60 دقيقة",
      image: "/images/package_skin.jpg",
      description: "تنظيف عميق وتقشير ألماسي مع حقن سيروم الهيالورونيك لنضارة وتوهج فوري.",
      tag: "نضارة فورية",
    },
  ];

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [srvData, stData] = await Promise.all([
        api.getPublicServices("tarjeel-vip"),
        api.getPublicStaff("tarjeel-vip"),
      ]);
      setServices(srvData);
      setStaffList(stData);
      if (srvData.length > 0) {
        setSelectedService(srvData[0]);
      }
    } catch (err: any) {
      setError(err?.message || "تعذر قراءة قائمة الخدمات من النظام المركزي");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedService) {
      api.getAvailableSlots(
        "tarjeel-vip",
        selectedService.id,
        selectedDate,
        selectedStaff ? selectedStaff.id : undefined
      ).then(setSlots);
    }
  }, [selectedService, selectedStaff, selectedDate]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedSlot || !clientName || !clientPhone) {
      alert("يرجى اختيار موعد الجلسة وملء بيانات الاسم ورقم الجوال");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createBooking({
        salon_id: selectedService.salon_id,
        client_name: clientName,
        client_phone: clientPhone,
        service_id: selectedService.id,
        staff_id: selectedSlot.staff_id || (selectedStaff ? selectedStaff.id : undefined),
        start_time: selectedSlot.start_time,
        notes: `${bookingNotes} ${clientAllergy ? `[محاذير: ${clientAllergy}]` : ""}`,
      });
      setConfirmedBooking(res);
    } catch (err: any) {
      alert("تعذر تسجيل الحجز: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectPackageService = (category: string) => {
    setSelectedCategory(category);
    const found = services.find((s) => s.category === category);
    if (found) setSelectedService(found);
    const bookingEl = document.getElementById("booking");
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const filteredServices =
    selectedCategory === "all"
      ? services
      : services.filter((s) => s.category === selectedCategory);

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-stone-800 overflow-hidden font-sans">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 start-0 w-[550px] h-[550px] ambient-glow-top-left pointer-events-none -z-10 blur-3xl opacity-80" />
      <div className="absolute top-10 end-0 w-[600px] h-[600px] ambient-glow-top-right pointer-events-none -z-10 blur-3xl opacity-70" />

      {/* 1. Hero Section (Matching the Reference Image) */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column (Content) */}
          <div className="lg:col-span-7 space-y-8 text-start">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-tarjeel-100/70 border border-tarjeel-300/60 text-xs font-semibold text-tarjeel-800 shadow-soft-sm">
              <span className="w-2 h-2 rounded-full bg-tarjeel-500 animate-pulse" />
              <span>خصم 10% بمناسبة الافتتاح على باقات العناية المتكاملة</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-stone-900 leading-[1.2]">
              ارتقي بجمالكِ، <br />
              <span className="font-serif italic font-normal text-tarjeel-600">
                وتألقي بثقة
              </span>{" "}
              استثنائية.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed font-light">
              استمتعي بتجربة عناية فائقة وتصفيف ملكي يجمع بين دقة الأخصائيات وراحة السبا المترفة لتعزيز إشراقتكِ وجمالكِ الطبيعي في أجواء من الخصوصية التامة.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#booking"
                className="px-8 py-4 rounded-full bg-tarjeel-500 hover:bg-tarjeel-600 text-white font-bold text-sm transition-all shadow-soft-md hover:shadow-soft-lg active:scale-95 flex items-center gap-2"
              >
                <span>احجزي جلستكِ الآن</span>
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </a>

              <a
                href="#packages"
                className="px-8 py-4 rounded-full border border-sand-300 bg-white/60 hover:bg-white text-stone-800 font-semibold text-sm transition-all shadow-soft-sm hover:border-tarjeel-400 active:scale-95"
              >
                استكشفي الباقات
              </a>
            </div>

            {/* Social Trust Metrics */}
            <div className="pt-6 border-t border-sand-200/80 flex items-center gap-8 text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-tarjeel-600" />
                <span>تعقيم المحطات وضمان الخصوصية</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>أخصائيات معتمدات بخبرة عالمية</span>
              </div>
            </div>
          </div>

          {/* Right Column (Hero Visual with Arched/Organic Mask) */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Decorative Frame */}
              <div className="hero-arched-mask overflow-hidden border-8 border-white/90 shadow-soft-lg bg-sand-100 aspect-[4/5] relative">
                <img
                  src="/images/hero_salon.jpg"
                  alt="صالون تَرجيل - تصفيف وعناية ملكية"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Floating Luxury Tag */}
              <div className="absolute -bottom-6 -start-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-sand-200 shadow-soft-md flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-tarjeel-50 flex items-center justify-center text-tarjeel-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">صالون تَرجِيل VIP</div>
                  <div className="text-[11px] text-stone-500">حي النرجس — الرياض</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Choose Your Plan / Curated Packages Section (Matching the Reference) */}
      <section id="packages" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-serif uppercase tracking-widest text-tarjeel-600 font-semibold">
            CURATED PACKAGES
          </span>
          <h2 className="text-3xl sm:text-4xl font-light text-stone-900 tracking-tight">
            باقات العناية المختارة
          </h2>
          <p className="text-sm text-stone-500 leading-relaxed font-light">
            باقات متكاملة ومصممة بعناية لتمنحكِ تجربة تدليل شاملة بأعلى مستويات الجودة والراحة.
          </p>
        </div>

        {/* 3 Arched Package Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {curatedPackages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => selectPackageService(pkg.category)}
              className="luxury-card luxury-card-hover rounded-3xl p-6 flex flex-col justify-between space-y-6 cursor-pointer group"
            >
              {/* Arched Top Image */}
              <div className="w-full aspect-square card-arch-top overflow-hidden relative shadow-inner bg-sand-100">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 start-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-tarjeel-800 shadow-soft-sm">
                  {pkg.tag}
                </span>
              </div>

              {/* Text Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-tarjeel-500" />
                    <span>{pkg.duration}</span>
                  </span>
                  <span className="text-base font-bold text-tarjeel-700">
                    {formatSAR(pkg.price)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 group-hover:text-tarjeel-600 transition-colors">
                  {pkg.title}
                </h3>

                <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 font-light">
                  {pkg.description}
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                className="w-full py-3 rounded-full border border-tarjeel-300 group-hover:bg-tarjeel-500 group-hover:text-white group-hover:border-tarjeel-500 text-tarjeel-800 font-semibold text-xs transition-all shadow-soft-sm"
              >
                اختيار هذه الباقة
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Live Booking Portal & Services Section */}
      <section id="booking" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-sand-200/80">
        <div id="services" className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-serif uppercase tracking-widest text-tarjeel-600 font-semibold">
            RESERVATION DESK
          </span>
          <h2 className="text-3xl sm:text-4xl font-light text-stone-900 tracking-tight">
            جدولة المواعيد والحجز الفوري
          </h2>
          <p className="text-sm text-stone-500 leading-relaxed font-light">
            اختاري الخدمة المطلوبة، حددي الأخصائية المفضلة، واعتمدي موعد جلستكِ بدفعة عربون آمنة (20%).
          </p>
        </div>

        {/* Loading State */}
        {isLoading && <LoadingSkeleton count={4} className="max-w-4xl mx-auto" />}

        {/* Error State */}
        {!isLoading && error && (
          <ErrorState
            title="تعذر تحميل قائمة الخدمات"
            error={error}
            onRetry={loadData}
            className="max-w-2xl mx-auto"
          />
        )}

        {/* Success / Confirmed Booking Modal */}
        {confirmedBooking && (
          <div className="max-w-2xl mx-auto luxury-card rounded-3xl p-8 space-y-6 text-center shadow-soft-lg">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-soft-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
                تذكرة تأكيد الحجز #{confirmedBooking.id.slice(0, 8)}
              </span>
              <h3 className="text-2xl font-bold text-stone-900">
                تم تأكيد حجزكِ بنجاح، {confirmedBooking.client_name}
              </h3>
              <p className="text-xs text-stone-500">
                تم إرسال إشعار التأكيد وتفاصيل الموعد عبر WhatsApp إلى {confirmedBooking.client_phone}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-sand-50/80 border border-sand-200 text-start space-y-3 text-xs">
              <div className="flex justify-between border-b border-sand-200/80 pb-2.5">
                <span className="text-stone-500">الخدمة المختارة:</span>
                <span className="text-stone-900 font-bold">{confirmedBooking.service_name}</span>
              </div>
              <div className="flex justify-between border-b border-sand-200/80 pb-2.5">
                <span className="text-stone-500">الأخصائية / المصففة:</span>
                <span className="text-stone-800">{confirmedBooking.staff_name || "أي مصففة متاحة"}</span>
              </div>
              <div className="flex justify-between border-b border-sand-200/80 pb-2.5">
                <span className="text-stone-500">الوقت والتاريخ:</span>
                <span className="text-stone-900 font-bold">
                  {formatArabicDate(confirmedBooking.start_time)} — {formatArabicTime(confirmedBooking.start_time)}
                </span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-bold text-tarjeel-800">
                <span>العربون المدفوع (20%):</span>
                <span>{formatSAR(confirmedBooking.deposit_amount)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setConfirmedBooking(null);
                setSelectedSlot(null);
              }}
              className="w-full py-4 rounded-full bg-tarjeel-500 hover:bg-tarjeel-600 text-white font-bold text-sm transition-all shadow-soft-sm"
            >
              حجز جلسة أخرى
            </button>
          </div>
        )}

        {/* Booking Interactive Grid */}
        {!isLoading && !error && !confirmedBooking && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Services & Specialist Selection (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Category Segmented Tabs */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs text-stone-500">
                  <span className="font-semibold text-stone-700">تصنيف الخدمات</span>
                  <span>{filteredServices.length} خدمة متاحة</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                        selectedCategory === cat.id
                          ? "bg-tarjeel-500 text-white shadow-soft-sm"
                          : "bg-white/80 border border-sand-200 text-stone-600 hover:border-tarjeel-300 hover:text-stone-900"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Services List */}
              {filteredServices.length === 0 ? (
                <EmptyState
                  title="لا توجد خدمات متاحة في هذا التصنيف"
                  description="يرجى اختيار تصنيف آخر للاطلاع على الخدمات والأسعار."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredServices.map((srv) => {
                    const isSelected = selectedService?.id === srv.id;
                    return (
                      <div
                        key={srv.id}
                        onClick={() => setSelectedService(srv)}
                        className={`luxury-card rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                          isSelected
                            ? "ring-2 ring-tarjeel-500 bg-white shadow-soft-md"
                            : "hover:border-tarjeel-300 hover:bg-white"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-sm text-stone-900">
                              {srv.name}
                            </h4>
                            <span className="text-sm font-bold text-tarjeel-700 shrink-0">
                              {formatSAR(srv.price)}
                            </span>
                          </div>

                          <p className="text-xs text-stone-500 font-light leading-relaxed line-clamp-2">
                            {srv.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-stone-500 pt-3 border-t border-sand-200/80">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-tarjeel-500" />
                            <span>{srv.duration_minutes} دقيقة + {srv.buffer_after_minutes}د تعقيم</span>
                          </span>
                          {isSelected && (
                            <span className="text-tarjeel-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>مختارة</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Specialist Selector */}
              <div className="space-y-4 pt-6 border-t border-sand-200/80">
                <div className="flex justify-between items-center text-xs text-stone-500">
                  <span className="font-semibold text-stone-700">اختيار الأخصائية / المصففة</span>
                  <span>{staffList.length} مصففات متوفرات</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div
                    onClick={() => setSelectedStaff(null)}
                    className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
                      selectedStaff === null
                        ? "bg-tarjeel-500 text-white border-tarjeel-500 shadow-soft-sm font-bold"
                        : "bg-white/80 border-sand-200 text-stone-700 hover:border-tarjeel-300"
                    }`}
                  >
                    <div className="text-[10px] opacity-80">توزيع تلقائي</div>
                    <div className="text-xs font-bold mt-1">أي مصففة متاحة</div>
                    <div className="text-[10px] opacity-75 mt-0.5">الموعد الأقرب</div>
                  </div>

                  {staffList
                    .filter((s) => s.role === "stylist")
                    .map((st) => {
                      const isSelected = selectedStaff?.id === st.id;
                      return (
                        <div
                          key={st.id}
                          onClick={() => setSelectedStaff(st)}
                          className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
                            isSelected
                              ? "bg-tarjeel-500 text-white border-tarjeel-500 shadow-soft-sm font-bold"
                              : "bg-white/80 border-sand-200 text-stone-700 hover:border-tarjeel-300"
                          }`}
                        >
                          <div className="text-[10px] opacity-80 truncate">{st.specialty}</div>
                          <div className="text-xs font-bold mt-1 truncate">{st.full_name}</div>
                          <div className="text-[10px] opacity-75 mt-0.5">محطة 0{st.id.slice(-1) || '1'}</div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Right Column: Date, Slots, Client Form & Deposit Hold (5 cols) */}
            <div className="lg:col-span-5">
              <div className="luxury-card rounded-3xl p-6 sm:p-7 space-y-6 shadow-soft-md">
                <div className="border-b border-sand-200 pb-4">
                  <span className="text-[10px] font-serif uppercase tracking-widest text-tarjeel-600 font-semibold">
                    BOOKING CONFIRMATION
                  </span>
                  <h3 className="text-lg font-bold text-stone-900 mt-1">
                    تأكيد حجز الجلسة والكرسي
                  </h3>
                  {selectedService && (
                    <p className="text-xs text-stone-500 mt-1">
                      {selectedService.name} — {selectedService.duration_minutes} دقيقة — {formatSAR(selectedService.price)}
                    </p>
                  )}
                </div>

                {/* Date Picker */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-stone-700">تاريخ الجلسة المطلوبة:</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-sand-200 text-stone-800 text-xs focus:outline-none focus:border-tarjeel-500 transition-colors shadow-soft-sm"
                  />
                </div>

                {/* Available Slots */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-700">المواعيد الشاغرة:</span>
                    <span className="text-stone-400">{slots.length} موعد</span>
                  </div>

                  {slots.length === 0 ? (
                    <div className="p-4 text-center text-xs text-stone-400 rounded-xl bg-sand-50/60 border border-dashed border-sand-200">
                      لا توجد أوقات شاغرة لهذا اليوم، يرجى تجربة يوم آخر.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1">
                      {slots.map((slot, idx) => {
                        const isSelected = selectedSlot?.start_time === slot.start_time;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all ${
                              isSelected
                                ? "bg-tarjeel-500 text-white shadow-soft-sm"
                                : "bg-white border border-sand-200 text-stone-700 hover:border-tarjeel-300"
                            }`}
                          >
                            {formatArabicTime(slot.start_time)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Client Details Form */}
                <form onSubmit={handleBookingSubmit} className="space-y-4 pt-4 border-t border-sand-200">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-stone-700">اسم العميلة:</label>
                    <input
                      type="text"
                      required
                      placeholder="الاسم الكريم (مثال: ريم بنت فهد الراجحي)"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-sand-200 text-stone-800 text-xs focus:outline-none focus:border-tarjeel-500 transition-colors shadow-soft-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-stone-700">رقم الجوال (WhatsApp):</label>
                    <input
                      type="tel"
                      required
                      placeholder="05xxxxxxxx"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-sand-200 text-stone-800 text-xs font-mono focus:outline-none focus:border-tarjeel-500 transition-colors shadow-soft-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-stone-700">محاذير حساسية الصبغات أو المواد (اختياري):</label>
                    <input
                      type="text"
                      placeholder="مثال: حساسية خفيفة من الأمونيا"
                      value={clientAllergy}
                      onChange={(e) => setClientAllergy(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-sand-200 text-stone-800 text-xs focus:outline-none focus:border-tarjeel-500 transition-colors shadow-soft-sm"
                    />
                  </div>

                  {/* Financial Breakdown */}
                  {selectedService && (
                    <div className="p-4 rounded-2xl bg-sand-50/90 border border-sand-200 space-y-2 text-xs">
                      <div className="flex justify-between text-stone-600">
                        <span>قيمة الخدمة الأساسية:</span>
                        <span className="font-semibold">{formatSAR(selectedService.price)}</span>
                      </div>
                      <div className="flex justify-between text-tarjeel-900 font-bold text-sm">
                        <span>العربون المستحق للحجز (20%):</span>
                        <span>{formatSAR(selectedService.price * 0.2)}</span>
                      </div>
                      <p className="text-[11px] text-stone-400 font-light pt-1 border-t border-sand-200/80">
                        * يضمن دفع العربون تجهيز محطة العمل مسبقاً وعدم الانتظار، ويُخصم من إجمالي الفاتورة عند الحضور.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedSlot}
                    className="w-full py-4 rounded-full bg-tarjeel-500 hover:bg-tarjeel-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-soft-md active:scale-95 disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isSubmitting ? "جاري التأكيد..." : "دفع العربون وتأكيد الحجز الفوري"}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. Minimalist Luxury Footer */}
      <footer className="border-t border-sand-200 bg-sand-100/50 py-12 px-4 sm:px-6 lg:px-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-start">
          <div className="space-y-1">
            <div className="text-base font-bold text-stone-900">صالون وتَرجِيل لاونج للعناية والتجميل VIP</div>
            <p className="text-stone-400">المملكة العربية السعودية — الرياض، حي النرجس، طريق الملك سلمان</p>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/track" className="hover:text-tarjeel-700 transition-colors font-medium">
              تتبع مواعيدكِ
            </Link>
          </div>


          <div className="text-stone-400">
            الرقم الضريبي: 300987654300003 • جميع الحقوق محفوظة © {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
}


