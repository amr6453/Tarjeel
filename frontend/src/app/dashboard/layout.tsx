"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { LogOut, UserCheck, ShieldCheck, Sparkles, Building } from "lucide-react";
import { LoadingSkeleton } from "@/components/ui/StateFeedback";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { staff, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-8 bg-[#FAF8F5]">
        <div className="w-full max-w-md space-y-4">
          <LoadingSkeleton count={3} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] bg-[#FAF8F5] text-stone-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Dashboard Top Banner */}
        <div className="border-b border-sand-200/80 bg-white/60 backdrop-blur-sm px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-tarjeel-50 flex items-center justify-center text-tarjeel-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900">{staff?.full_name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-tarjeel-50 text-tarjeel-800 border border-tarjeel-200">
                  {staff?.role === "owner" ? "المالكة / المديرة" : staff?.role === "receptionist" ? "كاشير واستقبال" : "أخصائية عناية"}
                </span>
              </div>
              <span className="text-[11px] text-stone-400 font-light">
                {staff?.specialty || "صالون وتَرجِيل VIP"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={logout}
              className="px-3.5 py-1.5 rounded-full border border-sand-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-stone-600 font-medium text-xs flex items-center gap-1.5 transition-colors shadow-soft-sm"
            >
              <LogOut className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl">
          {children}
        </div>
      </div>
    </div>
  );
}


