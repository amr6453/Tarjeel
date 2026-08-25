"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Calendar, Clock, CheckCircle2, AlertCircle, Sparkles, User, Scissors, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { AppointmentLookupResult } from "@/lib/types";
import { formatSAR, formatArabicTime, formatArabicDate } from "@/lib/utils";
import { LoadingSkeleton, EmptyState, ErrorState } from "@/components/ui/StateFeedback";

export default function TrackAppointmentPage() {
  const [phone, setPhone] = useState("0509991122");
  const [appointments, setAppointments] = useState<AppointmentLookupResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const results = await api.lookupAppointments(phone);
      setAppointments(results);
    } catch (err: any) {
      setError(err?.message || "تعذر الاستعلام عن المواعيد، يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case "completed":
        return <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">مكتمل</span>;
      case "in_progress":
        return <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">قيد التنفيذ</span>;
      case "cancelled":
        return <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">ملغي</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-tarjeel-50 text-tarjeel-800 border border-tarjeel-200">حجز مؤكد</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-serif uppercase tracking-widest text-tarjeel-600 font-semibold">
          CLIENT APPOINTMENT DISPATCH & STATUS
        </span>
        <h1 className="text-3xl font-light text-stone-900 tracking-tight">
          تتبع وإدارة مواعيدكِ
        </h1>
        <p className="text-xs text-stone-500 max-w-md mx-auto font-light">
          أدخلي رقم جوالكِ المسجل للاطلاع على تفاصيل الجلسات القادمة، وقت الحضور، وحالة العربون.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="luxury-card rounded-3xl p-6 sm:p-8 max-w-xl mx-auto shadow-soft-sm">
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700">
              رقم الجوال:
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05xxxxxxxx"
                className="w-full pl-4 pr-10 py-3 rounded-2xl bg-sand-50/60 border border-sand-200 text-stone-800 text-sm font-mono focus:outline-none focus:border-tarjeel-500 shadow-soft-sm"
              />
              <Search className="w-4 h-4 absolute top-3.5 right-3.5 text-stone-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-tarjeel-500 hover:bg-tarjeel-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-soft-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? "جاري الاستعلام..." : "استعراض سجل المواعيد"}</span>
          </button>
        </form>
      </div>

      {/* States & Results */}
      {loading && <LoadingSkeleton count={2} />}
      {!loading && error && (
        <ErrorState title="حدث خطأ أثناء الاستعلام" error={error} />
      )}

      {!loading && !error && hasSearched && appointments && appointments.length === 0 && (
        <EmptyState
          title="لم يتم العثور على مواعيد مسجلة بهذا الرقم"
          description="يمكنكِ حجز جلسة جديدة وتأكيد موعدكِ الآن بكل سهولة."
          actionLabel="احجزي موعد جديد"
          onAction={() => (window.location.href = "/#booking")}
        />
      )}

      {!loading && !error && appointments && appointments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 text-xs text-stone-500">
            <span className="font-semibold text-stone-700">المواعيد المسجلة ({appointments.length})</span>
            <span>النتائج مرتبة حسب الأحدث</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {appointments.map((app) => (
              <div
                key={app.id}
                className="luxury-card rounded-3xl p-6 space-y-4 shadow-soft-sm hover:shadow-soft-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-stone-900">{app.service_name}</h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      الأخصائية: {app.staff_name || "أي مصففة شاغرة"}
                    </p>
                  </div>
                  {statusBadge(app.status)}
                </div>

                <div className="p-4 rounded-2xl bg-sand-50/80 border border-sand-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">اسم العميلة:</span>
                    <span className="font-semibold text-stone-800">{app.client_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">الموعد والتاريخ:</span>
                    <span className="font-bold text-stone-900">
                      {formatArabicDate(app.start_time)} • {formatArabicTime(app.start_time)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-sand-200">
                    <span className="text-stone-500">إجمالي القيمة:</span>
                    <span className="font-bold text-tarjeel-800">{formatSAR(app.total_amount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">العربون المدفوع:</span>
                    <span className="font-semibold text-stone-700">{formatSAR(app.deposit_amount)}</span>
                  </div>
                </div>

                {app.notes && (
                  <p className="text-[11px] text-stone-500 font-light pt-1">
                    ملاحظات: {app.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer link */}
      <div className="text-center pt-6">
        <Link
          href="/"
          className="text-xs text-stone-500 hover:text-tarjeel-700 font-medium inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          <span>العودة للبوابة الرئيسية</span>
        </Link>
      </div>
    </div>
  );
}
