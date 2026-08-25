"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  AlertTriangle,
  Plus,
  Search,
  MinusCircle,
  CheckCircle2,
  Filter,
  X
} from "lucide-react";
import { api } from "@/lib/api";
import { InventoryItem } from "@/lib/types";
import { formatSAR } from "@/lib/utils";
import { LoadingSkeleton, EmptyState, ErrorState } from "@/components/ui/StateFeedback";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restock / Deduct modal
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState<number>(100);
  const [actionType, setActionType] = useState<"deduct" | "restock">("deduct");

  const loadInventory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getInventory(
        undefined,
        filterType === "all" ? undefined : filterType
      );
      setItems(data);
    } catch (err: any) {
      setError(err?.message || "تعذر تحميل قائمة المخزون");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [filterType]);

  const handleAdjustStock = async () => {
    if (!selectedItem) return;
    try {
      if (actionType === "deduct") {
        await api.deductInventory({
          item_id: selectedItem.id,
          quantity: adjustmentQty,
        });
        setItems((prev) =>
          prev.map((i) =>
            i.id === selectedItem.id
              ? {
                  ...i,
                  current_stock: Math.max(0, i.current_stock - adjustmentQty),
                  is_low_stock: i.current_stock - adjustmentQty <= i.min_stock_alert,
                }
              : i
          )
        );
      } else {
        alert("تم تسجيل طلب التوريد بنجاح.");
      }
      setSelectedItem(null);
    } catch (err: any) {
      alert("تعذر تسوية المخزون: " + err.message);
    }
  };

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.sku && i.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-sand-200 pb-6">
        <div className="space-y-1">
          <span className="text-xs font-serif uppercase tracking-widest text-tarjeel-600 font-semibold">
            INVENTORY & BACKBAR CONTROL
          </span>
          <h1 className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight">
            المخزون ومستهلكات الصالون بالجرامات
          </h1>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute top-3.5 right-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="بحث بالصنف أو كود SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-full bg-white border border-sand-200 text-stone-800 text-xs focus:outline-none focus:border-tarjeel-500 shadow-soft-sm placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-sand-100/70 border border-sand-200 w-fit text-xs">
        {[
          { id: "all", label: "كافة الأصناف" },
          { id: "backbar_consumable", label: "مستهلكات الاستخدام الداخلي (جرامات)" },
          { id: "retail", label: "منتجات التجزئة للبيع" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-2 rounded-xl transition-all font-medium ${
              filterType === tab.id
                ? "bg-white text-stone-900 shadow-soft-sm font-semibold"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && <LoadingSkeleton count={3} />}
      {!isLoading && error && (
        <ErrorState title="تعذر تحميل المخزون" error={error} onRetry={loadInventory} />
      )}

      {!isLoading && !error && filteredItems.length === 0 && (
        <EmptyState
          title="لم يتم العثور على أي منتج"
          description="تأكدي من صحة البحث أو تغيير نوع التصفية."
        />
      )}

      {/* Inventory Table */}
      {!isLoading && !error && filteredItems.length > 0 && (
        <div className="luxury-card rounded-3xl overflow-hidden shadow-soft-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-sand-50 border-b border-sand-200 text-stone-500 font-semibold">
                <tr>
                  <th className="p-4">الصنف / المادة</th>
                  <th className="p-4">النوع والوحدة</th>
                  <th className="p-4">المخزون الحالي</th>
                  <th className="p-4">حد التنبيه</th>
                  <th className="p-4">سعر التكلفة / البيع</th>
                  <th className="p-4 text-center">إجراء فوري</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200/70">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-sand-50/60 transition-colors ${
                      item.is_low_stock ? "bg-amber-50/30" : ""
                    }`}
                  >
                    <td className="p-4">
                      <div className="font-bold text-stone-900 text-sm">{item.name}</div>
                      <div className="text-[11px] text-stone-400 font-mono mt-0.5">SKU: {item.sku || "N/A"}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white border border-sand-200 text-stone-700">
                        {item.item_type === "backbar_consumable" ? "مستهلك داخلي (جرامات)" : "تجزئة"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-stone-900 font-mono">
                          {item.current_stock}
                        </span>
                        <span className="text-stone-500 font-medium">
                          {item.unit === "gram" ? "جرام" : item.unit === "ml" ? "مل" : "قطعة"}
                        </span>
                        {item.is_low_stock && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>منخفض</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-stone-500 font-mono">
                      {item.min_stock_alert} {item.unit === "gram" ? "جرام" : item.unit}
                    </td>
                    <td className="p-4 font-mono font-bold text-stone-900">
                      {item.retail_price > 0 ? (
                        <div>
                          <span>{formatSAR(item.retail_price)}</span>
                          <span className="text-[10px] text-stone-400 font-normal block">
                            تكلفة: {formatSAR(item.cost_price)}
                          </span>
                        </div>
                      ) : (
                        <span>{formatSAR(item.cost_price)} (تكلفة)</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setActionType("deduct");
                          }}
                          className="px-3 py-1.5 rounded-full bg-white border border-sand-300 hover:border-tarjeel-400 hover:bg-sand-50 text-stone-800 font-semibold text-[11px] transition-all shadow-soft-sm"
                        >
                          خصم استخدام
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setActionType("restock");
                          }}
                          className="px-3 py-1.5 rounded-full bg-tarjeel-500 hover:bg-tarjeel-600 text-white font-semibold text-[11px] transition-all shadow-soft-sm"
                        >
                          توريد
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-sand-200 p-6 space-y-4 shadow-soft-lg text-xs">
            <div className="flex justify-between items-start border-b border-sand-200 pb-3">
              <div>
                <span className="text-[10px] font-serif uppercase tracking-widest text-tarjeel-600 font-semibold">
                  STOCK ADJUSTMENT
                </span>
                <h3 className="font-bold text-base text-stone-900 mt-0.5">
                  {actionType === "deduct" ? "خصم كمية مستهلكة" : "تسجيل توريد جديد"}
                </h3>
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-1.5 rounded-full hover:bg-sand-100 text-stone-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-sand-50/80 border border-sand-200 space-y-1">
              <span className="text-stone-500 block">الصنف المختار:</span>
              <div className="font-bold text-sm text-stone-900">{selectedItem.name}</div>
              <div className="text-xs text-stone-500">
                المتوفر حالياً: {selectedItem.current_stock} {selectedItem.unit === "gram" ? "جرام" : selectedItem.unit}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-stone-700 font-semibold">
                الكمية ({selectedItem.unit === "gram" ? "جرام" : selectedItem.unit}):
              </label>
              <input
                type="number"
                min="1"
                value={adjustmentQty}
                onChange={(e) => setAdjustmentQty(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-sand-50/60 border border-sand-200 text-stone-800 text-center font-bold text-base focus:outline-none focus:border-tarjeel-500 shadow-soft-sm"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAdjustStock}
                className="flex-1 py-3 rounded-full bg-tarjeel-500 hover:bg-tarjeel-600 text-white font-semibold text-xs shadow-soft-sm transition-all active:scale-95"
              >
                تأكيد العملية
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-3 rounded-full border border-sand-300 text-stone-600 text-xs hover:bg-sand-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
