"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ShoppingBag,
  Users,
  Package,
  UserCheck,
  ArrowRight,
  Shield,
  UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const ALL_NAV_ITEMS = [
  { href: "/dashboard", label: "نظرة عامة والمؤشرات", icon: LayoutDashboard, roles: ["owner"] },
  { href: "/dashboard/appointments", label: "جدول المواعيد والتقويم", icon: CalendarDays, roles: ["owner", "receptionist", "stylist"] },
  { href: "/dashboard/pos", label: "نقطة البيع والكاشير", icon: ShoppingBag, roles: ["owner", "receptionist"] },
  { href: "/dashboard/clients", label: "سجل العميلات والخلطات", icon: Users, roles: ["owner", "receptionist", "stylist"] },
  { href: "/dashboard/inventory", label: "المخزون والجرامات", icon: Package, roles: ["owner", "receptionist"] },
  { href: "/dashboard/staff", label: "الموظفات والعمولات", icon: UserCheck, roles: ["owner", "stylist"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { staff } = useAuth();

  const userRole = staff?.role || "owner";
  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between border-e border-sand-200 bg-white/70 backdrop-blur-md p-4 min-h-[calc(100vh-5rem)]">
      <div className="space-y-6">
        {/* Salon Branch & User Info */}
        <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200/80 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tarjeel-500" />
            <span className="text-stone-900 font-bold text-xs">فرع الرياض الرئيسي</span>
          </div>
          {staff && (
            <div className="pt-2 border-t border-sand-200/80 flex items-center justify-between text-xs">
              <span className="text-stone-600 truncate max-w-[120px] font-semibold">{staff.full_name}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-tarjeel-50 text-tarjeel-800 border border-tarjeel-200">
                {staff.role === "owner" ? "مالكة" : staff.role === "receptionist" ? "كاشير" : "أخصائية"}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all",
                  isActive
                    ? "bg-tarjeel-500 text-white shadow-soft-sm font-bold"
                    : "text-stone-600 hover:text-stone-900 hover:bg-sand-100/70"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-tarjeel-600")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-sand-200">
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 text-xs font-medium text-stone-500 hover:text-tarjeel-700 transition-colors"
        >
          <span>معاينة بوابة الزوار</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </Link>
      </div>
    </aside>
  );
}


