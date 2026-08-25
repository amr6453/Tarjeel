"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LoadingSkeleton } from "@/components/ui/StateFeedback";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const { login, isAuthenticated } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [credential, setCredential] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, redirectPath, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !credential) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login({
        identifier: identifier.trim(),
        credential,
        login_type: "password",
      });
      router.push(redirectPath);
    } catch (err: any) {
      setError(err?.message || "بيانات الدخول غير صحيحة، يرجى التحقق وإعادة المحاولة.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-[#FAF8F5]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 start-1/3 w-96 h-96 ambient-glow-top-left pointer-events-none opacity-60" />
      <div className="absolute bottom-1/4 end-1/3 w-80 h-80 ambient-glow-top-right pointer-events-none opacity-60" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-tarjeel-600 via-tarjeel-500 to-gold-300 flex items-center justify-center text-white mx-auto shadow-soft-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-serif uppercase tracking-widest text-tarjeel-600 font-semibold">
            TARJEEL VIP SALON MANAGEMENT
          </span>
          <h1 className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight">
            تسجيل دخول الإدارة
          </h1>
          <p className="text-xs text-stone-500 max-w-xs mx-auto font-light">
            بوابة الإدارة المركزية لإدارة الحجوزات والموظفات والمخزون.
          </p>
        </div>

        {/* Card */}
        <div className="luxury-card rounded-3xl p-6 sm:p-8 space-y-5 shadow-soft-md">
          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block text-stone-700 font-semibold">
                البريد الإلكتروني أو رقم الجوال:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@tarjeel.com"
                  className="w-full pl-4 pr-10 py-3 rounded-2xl bg-sand-50/60 border border-sand-200 text-stone-800 text-xs font-mono focus:outline-none focus:border-tarjeel-500 shadow-soft-sm"
                />
                <Mail className="w-4 h-4 absolute top-3.5 right-3.5 text-stone-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-stone-700 font-semibold">
                كلمة المرور:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-10 py-3 rounded-2xl bg-sand-50/60 border border-sand-200 text-stone-800 text-xs focus:outline-none focus:border-tarjeel-500 shadow-soft-sm"
                />
                <Lock className="w-4 h-4 absolute top-3.5 right-3.5 text-stone-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-tarjeel-500 hover:bg-tarjeel-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-soft-sm transition-all active:scale-95 disabled:opacity-50 mt-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? "جاري تسجيل الدخول..." : "دخول لوحة التحكم"}</span>
            </button>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <button
            onClick={() => router.push("/")}
            className="text-xs text-stone-500 hover:text-tarjeel-700 font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            <span>العودة للبوابة الرئيسية</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <LoadingSkeleton count={3} />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
