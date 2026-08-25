"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Calendar,
  LayoutDashboard,
  ShoppingBag,
  PhoneCall,
  UserCheck,
  LogOut,
  Search,
  Lock
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const pathname = usePathname();
  const { staff, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sand-200/80 bg-[#FAF8F5]/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-tarjeel-600 via-tarjeel-500 to-gold-300 flex items-center justify-center text-white shadow-soft-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-stone-900 font-sans leading-none">
                تَرجِـيل
              </span>
              <span className="text-[10px] tracking-widest text-tarjeel-600 font-serif uppercase font-semibold mt-1">
                TARJEEL VIP SALON
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <Link
            href="/"
            className={`hover:text-tarjeel-700 transition-colors py-1 ${
              pathname === "/" ? "text-tarjeel-800 font-bold" : ""
            }`}
          >
            الرئيسية
          </Link>

          {/* Visitor Public Links */}
          <a
            href="/#packages"
            className="hover:text-tarjeel-700 transition-colors py-1"
          >
            الباقات المختارة
          </a>
          <a
            href="/#services"
            className="hover:text-tarjeel-700 transition-colors py-1"
          >
            قائمة الخدمات
          </a>
          <Link
            href="/track"
            className={`hover:text-tarjeel-700 transition-colors py-1 flex items-center gap-1.5 ${
              pathname === "/track" ? "text-tarjeel-800 font-bold" : ""
            }`}
          >
            <Search className="w-3.5 h-3.5 text-tarjeel-600" />
            <span>تتبع حجزكِ</span>
          </Link>

          {/* Authenticated Staff Links */}
          {isAuthenticated && (
            <>
              <Link
                href="/dashboard"
                className={`hover:text-tarjeel-700 transition-colors py-1 flex items-center gap-1.5 ${
                  pathname.startsWith("/dashboard") && pathname !== "/dashboard/pos"
                    ? "text-tarjeel-800 font-bold"
                    : "text-stone-700 font-semibold"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-tarjeel-600" />
                <span>لوحة العمليات</span>
              </Link>
              <Link
                href="/dashboard/pos"
                className={`hover:text-tarjeel-700 transition-colors py-1 flex items-center gap-1.5 ${
                  pathname === "/dashboard/pos"
                    ? "text-tarjeel-800 font-bold"
                    : "text-stone-700 font-semibold"
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-tarjeel-600" />
                <span>الكاشير</span>
              </Link>
            </>
          )}
        </nav>

        {/* Actions & Profile */}
        <div className="flex items-center gap-3">
          {isAuthenticated && staff ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-stone-900">{staff.full_name}</span>
                <span className="text-[10px] text-tarjeel-700 font-medium">
                  {staff.role === "owner" ? "المالكة والمديرة" : staff.role === "receptionist" ? "استقبال وكاشير" : "أخصائية عناية"}
                </span>
              </div>
              <button
                onClick={logout}
                title="تسجيل الخروج"
                className="p-2 rounded-full border border-sand-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-stone-500 transition-colors shadow-soft-sm"
              >
                <LogOut className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          ) : (
            <a
              href="/#booking"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-tarjeel-500 hover:bg-tarjeel-600 text-white font-semibold text-xs transition-all shadow-soft-sm active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>احجزي الآن</span>
            </a>
          )}

        </div>
      </div>
    </header>
  );
}


