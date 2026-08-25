"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Percent,
  Scissors,
  Phone,
  Award,
  Sparkles
} from "lucide-react";
import { api } from "@/lib/api";
import { Staff } from "@/lib/types";
import { formatSAR } from "@/lib/utils";
import { LoadingSkeleton, EmptyState, ErrorState } from "@/components/ui/StateFeedback";

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStaff = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getStaff();
      setStaffList(data);
    } catch (err: any) {
      setError(err?.message || "تعذر تحميل بيانات فريق العمل");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-sand-200 pb-6 space-y-1">
        <span className="text-xs font-serif uppercase tracking-widest text-tarjeel-600 font-semibold">
          STAFF DIRECTORY // COMMISSION CALCULATION
        </span>
        <h1 className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight">
          فريق الأخصائيات ومحرك حساب العمولات
        </h1>
      </div>

      {isLoading && <LoadingSkeleton count={3} />}
      {!isLoading && error && (
        <ErrorState title="تعذر تحميل قائمة الأخصائيات" error={error} onRetry={loadStaff} />
      )}

      {!isLoading && !error && staffList.length === 0 && (
        <EmptyState title="لا توجد أخصائيات مسجلات حالياً" />
      )}

      {!isLoading && !error && staffList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((st) => (
            <div
              key={st.id}
              className="luxury-card rounded-3xl p-6 sm:p-7 space-y-5 shadow-soft-sm hover:shadow-soft-md transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-stone-900">{st.full_name}</h3>
                  <p className="text-xs text-tarjeel-700 font-semibold mt-0.5">{st.specialty}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {st.is_active ? "على رأس العمل" : "إجازة"}
                </span>
              </div>

              {/* Phone */}
              <div className="text-xs text-stone-500 font-mono flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>{st.phone}</span>
              </div>

              {/* Commission Rates */}
              <div className="p-4 rounded-2xl bg-sand-50/80 border border-sand-200 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">عمولة الخدمات:</span>
                  <span className="font-bold text-stone-900">{st.commission_rate_services}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">عمولة مبيعات التجزئة:</span>
                  <span className="font-bold text-stone-900">{st.commission_rate_retail}%</span>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-stone-500 font-light">الدور الوظيفي:</span>
                <span className="font-semibold text-stone-800">
                  {st.role === "stylist" ? "أخصائية عناية وتصفيف" : "استقبال وإدارة"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
