"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
  Check,
  XCircle,
  UserX,
  X
} from "lucide-react";
import { api } from "@/lib/api";
import { Appointment, Service, Staff } from "@/lib/types";
import { formatSAR, formatArabicTime, formatArabicDate } from "@/lib/utils";
import { LoadingSkeleton, EmptyState, ErrorState } from "@/components/ui/StateFeedback";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Walk-in modal
  const [showModal, setShowModal] = useState(false);
  const [walkinName, setWalkinName] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");
  const [walkinServiceId, setWalkinServiceId] = useState("");
  const [walkinStaffId, setWalkinStaffId] = useState("");

  const loadAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [appData, srvData, stData] = await Promise.all([
        api.getAppointments(undefined, statusFilter === "all" ? undefined : statusFilter, selectedDate),
        api.getServices(),
        api.getStaff(),
      ]);
      setAppointments(appData);
      setServices(srvData);
      setStaffList(stData);
      if (srvData.length > 0 && !walkinServiceId) {
        setWalkinServiceId(srvData[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "تعذر قراءة جدول المواعيد");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.updateAppointmentStatus(id, newStatus);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus as any } : a))
      );
    } catch (err: any) {
      alert("تعذر تحديث حالة الموعد: " + err.message);
    }
  };

  const handleCreateWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName || !walkinPhone || !walkinServiceId) return;

    try {
      const newApp = await api.createBooking({
        salon_id: services[0]?.salon_id || "salon-1",
        client_name: walkinName,
        client_phone: walkinPhone,
        service_id: walkinServiceId,
        staff_id: walkinStaffId || undefined,
        start_time: new Date().toISOString(),
        notes: "حجز فوري في الصالون (Walk-in)",
      });
      setAppointments([newApp, ...appointments]);
      setShowModal(false);
      setWalkinName("");
      setWalkinPhone("");
    } catch (err: any) {
      alert("تعذر تسجيل الحضور الفوري: " + err.message);
    }
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case "completed":
        return <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">مكتمل</span>;
      case "in_progress":
        return <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">قيد التنفيذ</span>;
      case "no_show":
        return <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">عدم حضور</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-tarjeel-50 text-tarjeel-800 border border-tarjeel-200">مؤكد</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-sand-200 pb-6">
        <div className="space-y-1">
          <span className="text-xs font-serif uppercase tracking-widest text-tarjeel-600 font-semibold">
            APPOINTMENT DISPATCH
          </span>
          <h1 className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight">
            جدول المواعيد والتقويم اليومي
          </h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-full bg-tarjeel-500 hover:bg-tarjeel-600 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-soft-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل حضور فوري (Walk-in)</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl luxury-card text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-600">التاريخ:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-sand-200 text-stone-800 text-xs focus:outline-none focus:border-tarjeel-500 shadow-soft-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: "all", label: "الكل" },
            { id: "confirmed", label: "المؤكدة" },
            { id: "in_progress", label: "قيد التنفيذ" },
            { id: "completed", label: "المكتملة" },
            { id: "no_show", label: "عدم حضور" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full transition-all text-xs font-medium ${
                statusFilter === tab.id
                  ? "bg-tarjeel-500 text-white shadow-soft-sm font-semibold"
                  : "bg-white/80 text-stone-600 border border-sand-200 hover:border-tarjeel-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {isLoading && <LoadingSkeleton count={4} />}
      {!isLoading && error && (
        <ErrorState title="تعذر تحميل المواعيد" error={error} onRetry={loadAppointments} />
      )}

      {!isLoading && !error && appointments.length === 0 && (
        <EmptyState
          title="لا توجد مواعيد مسجلة لهذا التاريخ"
          description="يمكنك اختيار يوم آخر أو تسجيل عميلة جديدة."
          actionLabel="تسجيل حضور فوري"
          onAction={() => setShowModal(true)}
        />
      )}

      {/* Appointments Grid */}
      {!isLoading && !error && appointments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {appointments.map((app) => (
            <div
              key={app.id}
              className="luxury-card rounded-3xl p-6 space-y-4 shadow-soft-sm hover:shadow-soft-md transition-all"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-stone-900">
                      {app.client_name}
                    </h3>
                    {statusBadge(app.status)}
                  </div>
                  <p className="text-xs text-stone-500 mt-1 font-mono">{app.client_phone}</p>
                </div>

                <div className="text-end">
                  <span className="text-sm font-bold text-tarjeel-700 block">
                    {formatSAR(app.total_amount)}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    عربون: {formatSAR(app.deposit_amount)}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-4 rounded-2xl bg-sand-50/70 border border-sand-200/80 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">الخدمة:</span>
                  <span className="text-stone-800 font-semibold">{app.service_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">الأخصائية:</span>
                  <span className="text-stone-800">{app.staff_name || "أي مصففة متاحة"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">الموعد:</span>
                  <span className="text-stone-900 font-bold">{formatArabicTime(app.start_time)}</span>
                </div>
                {app.notes && (
                  <div className="text-[11px] text-stone-600 pt-2 border-t border-sand-200">
                    {app.notes}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5 pt-1 text-xs">
                {app.status === "confirmed" && (
                  <button
                    onClick={() => handleStatusChange(app.id, "in_progress")}
                    className="flex-1 py-2.5 px-4 rounded-full bg-tarjeel-500 text-white font-semibold flex items-center justify-center gap-1.5 shadow-soft-sm hover:bg-tarjeel-600 transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>بدء الجلسة</span>
                  </button>
                )}

                {app.status === "in_progress" && (
                  <button
                    onClick={() => handleStatusChange(app.id, "completed")}
                    className="flex-1 py-2.5 px-4 rounded-full bg-emerald-600 text-white font-semibold flex items-center justify-center gap-1.5 shadow-soft-sm hover:bg-emerald-700 transition-all active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>إنهاء الجلسة والدفع</span>
                  </button>
                )}

                {app.status !== "completed" && app.status !== "no_show" && (
                  <button
                    onClick={() => handleStatusChange(app.id, "no_show")}
                    className="py-2.5 px-4 rounded-full border border-sand-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-stone-500 transition-colors"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Walk-in Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-sand-200 p-6 space-y-5 shadow-soft-lg text-xs">
            <div className="flex justify-between items-start border-b border-sand-200 pb-3">
              <div>
                <span className="text-[10px] font-serif uppercase tracking-widest text-tarjeel-600 font-semibold">
                  WALK-IN DESK
                </span>
                <h3 className="font-bold text-base text-stone-900 mt-0.5">تسجيل حضور فوري</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-full hover:bg-sand-100 text-stone-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWalkin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-stone-700 font-semibold">اسم العميلة:</label>
                <input
                  type="text"
                  required
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  placeholder="الاسم الكريم"
                  className="w-full px-4 py-2.5 rounded-xl bg-sand-50/60 border border-sand-200 text-stone-800 text-xs focus:outline-none focus:border-tarjeel-500 shadow-soft-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-stone-700 font-semibold">رقم الجوال:</label>
                <input
                  type="tel"
                  required
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="w-full px-4 py-2.5 rounded-xl bg-sand-50/60 border border-sand-200 text-stone-800 text-xs font-mono focus:outline-none focus:border-tarjeel-500 shadow-soft-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-stone-700 font-semibold">الخدمة المطلوبة:</label>
                <select
                  value={walkinServiceId}
                  onChange={(e) => setWalkinServiceId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-sand-50/60 border border-sand-200 text-stone-800 text-xs focus:outline-none focus:border-tarjeel-500 shadow-soft-sm"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {formatSAR(s.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-stone-700 font-semibold">المصففة (اختياري):</label>
                <select
                  value={walkinStaffId}
                  onChange={(e) => setWalkinStaffId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-sand-50/60 border border-sand-200 text-stone-800 text-xs focus:outline-none focus:border-tarjeel-500 shadow-soft-sm"
                >
                  <option value="">أي مصففة شاغرة</option>
                  {staffList
                    .filter((st) => st.role === "stylist")
                    .map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.full_name} ({st.specialty})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-full bg-tarjeel-500 hover:bg-tarjeel-600 text-white font-semibold text-xs shadow-soft-sm transition-all active:scale-95"
                >
                  تسجيل الحجز والبدء
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-3 rounded-full border border-sand-300 text-stone-600 text-xs hover:bg-sand-50"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

