"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  Calendar,
  Clock,
  AlertTriangle,
  Scissors,
  CheckCircle2,
  TrendingUp,
  Package,
  ShoppingBag,
  Plus,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { api } from "@/lib/api";
import { AnalyticsOverview, Appointment, InventoryItem } from "@/lib/types";
import { formatSAR, formatArabicTime } from "@/lib/utils";
import { LoadingSkeleton, EmptyState, ErrorState } from "@/components/ui/StateFeedback";

export default function DashboardOverviewPage() {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [anData, appData, invData] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getAppointments(),
        api.getInventory(),
      ]);
      setAnalytics(anData);
      setAppointments(appData);
      setInventory(invData);
    } catch (err: any) {
      setError(err?.message || "تعذر قراءة مؤشرات الصالون");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const lowStockItems = inventory.filter((item) => item.is_low_stock);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-sand-200 pb-6">
        <div className="space-y-1">
          <span className="text-xs font-serif uppercase tracking-widest text-tarjeel-600 font-semibold">
            SALON OPERATIONS CENTER
          </span>
          <h1 className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight">
            المؤشرات الحية ولوحة التشغيل
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/pos"
            className="px-5 py-2.5 rounded-full bg-tarjeel-500 hover:bg-tarjeel-600 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-soft-sm active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>نقطة البيع (POS)</span>
          </Link>
          <Link
            href="/dashboard/appointments"
            className="px-5 py-2.5 rounded-full border border-sand-300 bg-white hover:bg-sand-50 text-stone-800 font-semibold text-xs flex items-center gap-2 transition-all shadow-soft-sm active:scale-95"
          >
            <Plus className="w-4 h-4 text-tarjeel-600" />
            <span>حجز فوري</span>
          </Link>
        </div>
      </div>

      {/* States */}
      {isLoading && <LoadingSkeleton count={3} />}
      {!isLoading && error && (
        <ErrorState
          title="تعذر قراءة بيانات لوحة التحكم"
          error={error}
          onRetry={loadDashboardData}
        />
      )}

      {/* Filled View */}
      {!isLoading && !error && analytics && (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="luxury-card rounded-3xl p-6 space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>إيرادات اليوم</span>
                <div className="w-8 h-8 rounded-full bg-tarjeel-50 flex items-center justify-center text-tarjeel-600">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-stone-900 tabular-nums">
                {formatSAR(analytics.today_revenue)}
              </div>
              <p className="text-[11px] text-stone-400 font-light">
                شامل ضريبة القيمة المضافة 15%
              </p>
            </div>

            <div className="luxury-card rounded-3xl p-6 space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>مواعيد وجلسات اليوم</span>
                <div className="w-8 h-8 rounded-full bg-tarjeel-50 flex items-center justify-center text-tarjeel-600">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-stone-900 tabular-nums">
                {analytics.today_appointments_count} موعد
              </div>
              <p className="text-[11px] text-stone-400 font-light">
                {analytics.completed_count} مكتمل • {analytics.in_progress_count} قيد التنفيذ
              </p>
            </div>

            <div className="luxury-card rounded-3xl p-6 space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>الكراسي النشطة</span>
                <div className="w-8 h-8 rounded-full bg-tarjeel-50 flex items-center justify-center text-tarjeel-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-stone-900 tabular-nums">
                {analytics.in_progress_count} كراسي مشغولة
              </div>
              <p className="text-[11px] text-stone-400 font-light">
                فترات تعقيم 10-15 دقيقة بين الجلسات
              </p>
            </div>

            <div className="luxury-card rounded-3xl p-6 space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>تنبيهات المخزون</span>
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-stone-900 tabular-nums">
                {lowStockItems.length} مواد
              </div>
              <p className="text-[11px] text-stone-400 font-light">
                مستهلكات قاربت على حد التنبيه
              </p>
            </div>
          </div>

          {/* Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Today's Appointments (7 cols) */}
            <div className="lg:col-span-7 luxury-card rounded-3xl p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-sand-200 pb-3">
                <span className="font-bold text-sm text-stone-900">جدول مواعيد اليوم</span>
                <Link
                  href="/dashboard/appointments"
                  className="text-xs font-semibold text-tarjeel-600 hover:text-tarjeel-800 transition-colors flex items-center gap-1"
                >
                  <span>التقويم الكامل</span>
                  <ArrowLeft className="w-3 h-3 rtl:rotate-180" />
                </Link>
              </div>

              {appointments.length === 0 ? (
                <EmptyState
                  title="لا توجد مواعيد مسجلة اليوم"
                  description="يمكنك تسجيل حضور فوري أو إضافة موعد جديد."
                />
              ) : (
                <div className="space-y-2.5">
                  {appointments.slice(0, 4).map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-2xl bg-sand-50/70 border border-sand-200/80 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-900">
                            {app.client_name}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-sand-200 text-stone-600">
                            {app.status === "completed"
                              ? "مكتمل"
                              : app.status === "in_progress"
                              ? "قيد التنفيذ"
                              : "مؤكد"}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">
                          {app.service_name} — {app.staff_name || "أي مصففة"}
                        </p>
                      </div>

                      <div className="text-end shrink-0">
                        <div className="text-xs font-bold text-stone-900">
                          {formatArabicTime(app.start_time)}
                        </div>
                        <div className="text-xs font-bold text-tarjeel-700">
                          {formatSAR(app.total_amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Top Stylists */}
              <div className="luxury-card rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-sand-200 pb-3 text-xs">
                  <span className="font-bold text-sm text-stone-900">أداء الأخصائيات</span>
                  <span className="text-stone-400">{analytics.top_stylists.length} أخصائيات</span>
                </div>

                <div className="space-y-2">
                  {analytics.top_stylists.map((st, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-sand-50/70 border border-sand-200/70 text-xs"
                    >
                      <div>
                        <div className="font-bold text-stone-900">{st.name}</div>
                        <div className="text-[11px] text-stone-500 font-light">{st.specialty}</div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-tarjeel-50 text-tarjeel-800 font-semibold text-[11px]">
                        {st.completed_appointments} جلسات
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low Stock Alerts */}
              {lowStockItems.length > 0 && (
                <div className="luxury-card rounded-3xl p-6 space-y-3 border-amber-200/80 bg-amber-50/20">
                  <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>مواد قاربت على النفاد بالمخزون</span>
                  </div>

                  <div className="space-y-2">
                    {lowStockItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs p-3 rounded-2xl bg-white border border-amber-200/60"
                      >
                        <span className="text-stone-700 truncate max-w-[180px]">
                          {item.name}
                        </span>
                        <span className="font-bold text-stone-900">
                          {item.current_stock} {item.unit === "gram" ? "جرام" : item.unit}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/dashboard/inventory"
                    className="block text-center text-xs font-semibold text-tarjeel-700 hover:text-tarjeel-900 pt-1 transition-colors"
                  >
                    إدارة المخزون والتوريد ←
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

