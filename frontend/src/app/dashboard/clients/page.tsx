"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Phone,
  Calendar,
  AlertTriangle,
  FileText,
  DollarSign,
  X,
  Sparkles
} from "lucide-react";
import { api } from "@/lib/api";
import { Client, ClientHairFormula } from "@/lib/types";
import { formatSAR, formatArabicDate } from "@/lib/utils";
import { LoadingSkeleton, EmptyState, ErrorState } from "@/components/ui/StateFeedback";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formulas, setFormulas] = useState<ClientHairFormula[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Formula modal
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [newFormulaText, setNewFormulaText] = useState("");
  const [newBrand, setNewBrand] = useState("L'Oreal Professional");

  const loadClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getClients(undefined, searchQuery);
      setClients(data);
      if (data.length > 0 && !selectedClient) {
        setSelectedClient(data[0]);
      }
    } catch (err: any) {
      setError(err?.message || "تعذر قراءة سجلات العميلات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [searchQuery]);

  useEffect(() => {
    if (selectedClient) {
      api.getClientFormulas(selectedClient.id).then(setFormulas);
    }
  }, [selectedClient]);

  const handleAddFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newFormulaText) return;

    try {
      const created = await api.addClientFormula(selectedClient.id, {
        formula_text: newFormulaText,
        brand_name: newBrand,
      });
      setFormulas([created, ...formulas]);
      setShowFormulaModal(false);
      setNewFormulaText("");
    } catch (err: any) {
      alert("تعذر حفظ التركيبة: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-sand-200 pb-6">
        <div className="space-y-1">
          <span className="text-xs font-serif uppercase tracking-widest text-tarjeel-600 font-semibold">
            CLIENT DIRECTORY // HAIR FORMULA ARCHIVE
          </span>
          <h1 className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight">
            سجل العميلات وأرشيف خلطات الصبغة
          </h1>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute top-3.5 right-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو رقم الجوال..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-full bg-white border border-sand-200 text-stone-800 text-xs focus:outline-none focus:border-tarjeel-500 shadow-soft-sm placeholder:text-stone-400"
          />
        </div>
      </div>

      {isLoading && <LoadingSkeleton count={3} />}
      {!isLoading && error && (
        <ErrorState title="تعذر تحميل سجل العميلات" error={error} onRetry={loadClients} />
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Client List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-2 text-xs font-bold text-stone-500">
              <span>العميلات المسجلات</span>
              <span>{clients.length} عميلة</span>
            </div>

            {clients.length === 0 ? (
              <EmptyState
                title="لم يتم العثور على عميلات"
                description="جربي البحث برقم أو اسم آخر."
              />
            ) : (
              <div className="space-y-2.5 max-h-[calc(100vh-18rem)] overflow-y-auto p-1">
                {clients.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedClient(c)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                      selectedClient?.id === c.id
                        ? "bg-white border-tarjeel-500 shadow-soft-md ring-1 ring-tarjeel-500"
                        : "bg-white/80 border-sand-200/90 hover:border-sand-300 hover:bg-white shadow-soft-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-stone-900">{c.full_name}</h4>
                      <span className="text-xs font-bold text-tarjeel-700">
                        {formatSAR(c.total_spent)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-500 mt-2">
                      <span className="font-mono">{c.phone}</span>
                      <span>{c.total_visits} زيارات</span>
                    </div>

                    {c.allergy_info && c.allergy_info !== "لا يوجد" && (
                      <div className="mt-2.5 pt-2 border-t border-sand-200 text-[11px] text-rose-700 font-medium flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">حساسية: {c.allergy_info}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Client Profile & Hair History (7 cols) */}
          <div className="lg:col-span-7">
            {selectedClient ? (
              <div className="luxury-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft-sm">
                {/* Profile Header */}
                <div className="flex justify-between items-start border-b border-sand-200 pb-5">
                  <div>
                    <span className="text-[10px] font-serif uppercase tracking-widest text-tarjeel-600 font-semibold">
                      CLIENT PROFILE
                    </span>
                    <h2 className="text-xl font-bold text-stone-900 mt-0.5">
                      {selectedClient.full_name}
                    </h2>
                    <p className="text-xs text-stone-500 font-mono mt-1">
                      {selectedClient.phone} • مسجلة منذ {formatArabicDate(selectedClient.created_at)}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowFormulaModal(true)}
                    className="px-4 py-2.5 rounded-full bg-tarjeel-500 hover:bg-tarjeel-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-soft-sm transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة تركيبة صبغة</span>
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-sand-50/80 border border-sand-200">
                    <span className="text-stone-500 text-xs block">إجمالي المشتريات</span>
                    <span className="text-base font-bold text-stone-900 mt-1 block">
                      {formatSAR(selectedClient.total_spent)}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-sand-50/80 border border-sand-200">
                    <span className="text-stone-500 text-xs block">عدد الزيارات</span>
                    <span className="text-base font-bold text-stone-900 mt-1 block">
                      {selectedClient.total_visits} جلسة
                    </span>
                  </div>
                </div>

                {/* Allergies / Notes */}
                {(selectedClient.allergy_info || selectedClient.notes) && (
                  <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-2 text-xs">
                    {selectedClient.allergy_info && selectedClient.allergy_info !== "لا يوجد" && (
                      <div className="text-rose-800 font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>تنبيه الحساسية: {selectedClient.allergy_info}</span>
                      </div>
                    )}
                    {selectedClient.notes && (
                      <p className="text-stone-600 font-light pt-1">
                        ملاحظات وتفضيلات: {selectedClient.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Formula History */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-sand-200 pb-2 text-xs font-bold text-stone-900">
                    <span>أرشيف تركيبات الصبغة والمعالجات (Hair Formula Archive)</span>
                    <span className="text-stone-400">{formulas.length} تركيبة</span>
                  </div>

                  {formulas.length === 0 ? (
                    <div className="p-8 text-center bg-sand-50/40 rounded-2xl border border-dashed border-sand-200 text-stone-400 text-xs">
                      لا توجد تركيبات مسجلة لهذه العميلة بعد.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formulas.map((f) => (
                        <div
                          key={f.id}
                          className="p-4 rounded-2xl bg-sand-50/80 border border-sand-200/90 space-y-2 text-xs"
                        >
                          <div className="flex justify-between items-center text-stone-500">
                            <span className="font-semibold text-tarjeel-800 bg-white px-2.5 py-0.5 rounded-full border border-sand-200">
                              {f.brand_name || "مستحضرات احترافية"}
                            </span>
                            <span className="text-[11px]">{formatArabicDate(f.created_at)}</span>
                          </div>
                          <p className="text-stone-900 font-medium font-mono text-xs bg-white p-3 rounded-xl border border-sand-200/60">
                            {f.formula_text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="luxury-card rounded-3xl p-12 text-center text-stone-400 text-xs">
                يرجى اختيار عميلة من القائمة لعرض السجل الكامل
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Formula Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-sand-200 p-6 space-y-4 shadow-soft-lg text-xs">
            <div className="flex justify-between items-start border-b border-sand-200 pb-3">
              <div>
                <span className="text-[10px] font-serif uppercase tracking-widest text-tarjeel-600 font-semibold">
                  FORMULA ARCHIVE
                </span>
                <h3 className="font-bold text-base text-stone-900 mt-0.5">
                  حفظ تركيبة صبغة لـ {selectedClient?.full_name}
                </h3>
              </div>
              <button onClick={() => setShowFormulaModal(false)} className="p-1.5 rounded-full hover:bg-sand-100 text-stone-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFormula} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-stone-700 font-semibold">الماركة / البراند المستخدم:</label>
                <input
                  type="text"
                  required
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  placeholder="L'Oreal / Wella / Olaplex"
                  className="w-full px-4 py-2.5 rounded-xl bg-sand-50/60 border border-sand-200 text-stone-800 text-xs focus:outline-none focus:border-tarjeel-500 shadow-soft-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-stone-700 font-semibold">تفاصيل نسب الخلط والجرامات:</label>
                <textarea
                  required
                  rows={3}
                  value={newFormulaText}
                  onChange={(e) => setNewFormulaText(e.target.value)}
                  placeholder="مثال: Majirel 6.1 (30g) + 7.0 (15g) + 20 Vol Ox (45ml) - 35 mins"
                  className="w-full px-4 py-2.5 rounded-xl bg-sand-50/60 border border-sand-200 text-stone-800 text-xs font-mono focus:outline-none focus:border-tarjeel-500 shadow-soft-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-full bg-tarjeel-500 hover:bg-tarjeel-600 text-white font-semibold text-xs shadow-soft-sm transition-all active:scale-95"
                >
                  حفظ التركيبة بالأرشيف
                </button>
                <button
                  type="button"
                  onClick={() => setShowFormulaModal(false)}
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
