"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Scissors,
  Package,
  Plus,
  Trash2,
  Receipt,
  CreditCard,
  CheckCircle2,
  DollarSign,
  User,
  X
} from "lucide-react";
import { api } from "@/lib/api";
import { Service, InventoryItem, Staff, Invoice } from "@/lib/types";
import { formatSAR } from "@/lib/utils";
import { LoadingSkeleton, EmptyState, ErrorState } from "@/components/ui/StateFeedback";

interface CartItem {
  id: string;
  name: string;
  price: number;
  type: "service" | "retail";
  quantity: number;
}

export default function POSPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [retailItems, setRetailItems] = useState<InventoryItem[]>([]);
  const [consumableItems, setConsumableItems] = useState<InventoryItem[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [clientName, setClientName] = useState<string>("عميلة نقدية");
  const [clientPhone, setClientPhone] = useState<string>("0500000000");

  // Backbar
  const [formulaText, setFormulaText] = useState<string>("");
  const [selectedConsumableId, setSelectedConsumableId] = useState<string>("");
  const [consumedGrams, setConsumedGrams] = useState<number>(50);
  const [consumablesList, setConsumablesList] = useState<{ itemId: string; name: string; grams: number }[]>([]);

  // Payment
  const [discount, setDiscount] = useState<number>(0);
  const [tip, setTip] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("mada");

  // States
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issuedInvoice, setIssuedInvoice] = useState<Invoice | null>(null);

  const loadPOSData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [srv, inv, st] = await Promise.all([
        api.getServices(),
        api.getInventory(),
        api.getStaff(),
      ]);
      setServices(srv);
      setRetailItems(inv.filter((i) => i.item_type === "retail"));
      const backbar = inv.filter((i) => i.item_type === "backbar_consumable");
      setConsumableItems(backbar);
      if (backbar.length > 0) setSelectedConsumableId(backbar[0].id);
      setStaffList(st.filter((s) => s.role === "stylist"));
      if (st.length > 0) setSelectedStaffId(st[0].id);
    } catch (err: any) {
      setError(err?.message || "تعذر تحميل بيانات الكاشير");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPOSData();
  }, []);

  const addToCart = (item: { id: string; name: string; price: number; type: "service" | "retail" }) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const addConsumableDeduction = () => {
    const item = consumableItems.find((i) => i.id === selectedConsumableId);
    if (!item) return;
    setConsumablesList([...consumablesList, { itemId: item.id, name: item.name, grams: consumedGrams }]);
  };

  const removeConsumableDeduction = (idx: number) => {
    setConsumablesList(consumablesList.filter((_, i) => i !== idx));
  };

  const subtotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const taxableAmount = Math.max(0, subtotal - discount);
  const taxAmount = Number((taxableAmount * 0.15).toFixed(2));
  const totalAmount = Number((taxableAmount + taxAmount + tip).toFixed(2));

  const selectedStylist = staffList.find((s) => s.id === selectedStaffId);
  const commissionPreview = selectedStylist
    ? Number((taxableAmount * (selectedStylist.commission_rate_services / 100)).toFixed(2))
    : 0;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("يرجى إضافة خدمة أو منتج إلى السلة أولاً");
      return;
    }

    setIsProcessing(true);
    try {
      const inv = await api.posCheckout({
        salon_id: services[0]?.salon_id || "salon-1",
        client_name: clientName,
        client_phone: clientPhone,
        staff_id: selectedStaffId,
        subtotal: subtotal,
        discount_amount: discount,
        tip_amount: tip,
        payment_method: paymentMethod,
        formula_text: formulaText || undefined,
        consumables_used: consumablesList.map((c) => ({
          item_id: c.itemId,
          quantity_used: c.grams,
        })),
      });

      setIssuedInvoice(inv);
      setCart([]);
      setFormulaText("");
      setConsumablesList([]);
      setDiscount(0);
      setTip(0);
    } catch (err: any) {
      alert("تعذر إصدار الفاتورة: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-sand-200 pb-6 space-y-1">
        <span className="text-xs font-serif uppercase tracking-widest text-tarjeel-600 font-semibold">
          POS TERMINAL // INVOICE ENGINE
        </span>
        <h1 className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight">
          نقطة البيع وإصدار الفواتير الإلكترونية
        </h1>
      </div>

      {isLoading && <LoadingSkeleton count={3} />}
      {!isLoading && error && (
        <ErrorState title="تعذر تحميل نظام POS" error={error} onRetry={loadPOSData} />
      )}

      {/* Invoice Modal */}
      {issuedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-sand-200 p-6 sm:p-8 space-y-5 shadow-soft-lg text-xs">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-soft-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="text-[10px] font-serif uppercase tracking-widest text-tarjeel-600 font-semibold">فاتورة ضريبية مبسطة</div>
              <h3 className="text-lg font-bold text-stone-900">صالون وتَرجِيل لاونج للعناية</h3>
              <p className="text-stone-400 font-mono">{issuedInvoice.invoice_number}</p>
            </div>

            <div className="p-4 rounded-2xl bg-sand-50/80 border border-sand-200 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-stone-500">العميلة:</span>
                <span className="text-stone-900 font-bold">{issuedInvoice.client_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">الأخصائية:</span>
                <span className="text-stone-800">{issuedInvoice.staff_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">طريقة الدفع:</span>
                <span className="text-stone-900 font-semibold uppercase">{issuedInvoice.payment_method}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-sand-200">
                <span className="text-stone-500">المجموع قبل الضريبة:</span>
                <span className="font-bold text-stone-800">{formatSAR(issuedInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">ضريبة القيمة المضافة (15%):</span>
                <span className="font-bold text-stone-800">{formatSAR(issuedInvoice.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-tarjeel-800 pt-1 border-t border-sand-200">
                <span>المبلغ الإجمالي:</span>
                <span>{formatSAR(issuedInvoice.total_amount)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-500 pt-1">
                <span>عمولة الأخصائية المحسوبة:</span>
                <span className="font-semibold">{formatSAR(issuedInvoice.staff_commission_amount)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-full bg-tarjeel-500 text-white font-semibold text-xs shadow-soft-sm hover:bg-tarjeel-600 transition-all active:scale-95"
              >
                طباعة الفاتورة (POS)
              </button>
              <button
                onClick={() => setIssuedInvoice(null)}
                className="py-3 px-6 rounded-full border border-sand-300 text-stone-600 text-xs hover:bg-sand-50 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POS Screen */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Catalog (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Services */}
            <div className="luxury-card rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-sand-200 pb-2 text-xs">
                <span className="font-bold text-stone-900">قائمة الخدمات المتاحة</span>
                <span className="text-stone-400">{services.length} خدمة</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => addToCart({ id: srv.id, name: srv.name, price: srv.price, type: "service" })}
                    className="p-3.5 rounded-2xl bg-sand-50/60 border border-sand-200 hover:border-tarjeel-400 hover:bg-white cursor-pointer flex justify-between items-center transition-all shadow-soft-sm"
                  >
                    <div>
                      <div className="font-bold text-xs text-stone-900 truncate max-w-[170px]">{srv.name}</div>
                      <div className="text-[11px] text-stone-500">{srv.duration_minutes} دقيقة</div>
                    </div>
                    <span className="text-xs font-bold text-tarjeel-700 shrink-0">{formatSAR(srv.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Retail */}
            <div className="luxury-card rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-sand-200 pb-2 text-xs">
                <span className="font-bold text-stone-900">منتجات البيع بالتجزئة</span>
                <span className="text-stone-400">{retailItems.length} صنف</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-52 overflow-y-auto p-1">
                {retailItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => addToCart({ id: item.id, name: item.name, price: item.retail_price, type: "retail" })}
                    className="p-3.5 rounded-2xl bg-sand-50/60 border border-sand-200 hover:border-tarjeel-400 hover:bg-white cursor-pointer flex justify-between items-center transition-all shadow-soft-sm"
                  >
                    <div>
                      <div className="font-bold text-xs text-stone-900 truncate max-w-[170px]">{item.name}</div>
                      <div className="text-[10px] text-stone-400">المخزون: {item.current_stock} قطعة</div>
                    </div>
                    <span className="text-xs font-bold text-tarjeel-700 shrink-0">{formatSAR(item.retail_price)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Backbar Formula */}
            <div className="luxury-card rounded-3xl p-6 space-y-4">
              <div className="border-b border-sand-200 pb-2 text-xs font-bold text-stone-900">
                أرشيف خلط الصبغة وخصم المستهلكات (Backbar)
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs text-stone-600 font-semibold">تفاصيل تركيبة الصبغة / المعالجة:</label>
                <input
                  type="text"
                  placeholder="مثال: L'Oreal Majirel 7.1 (40g) + 20Vol (60ml)"
                  value={formulaText}
                  onChange={(e) => setFormulaText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-sand-200 text-stone-800 text-xs focus:outline-none focus:border-tarjeel-500 shadow-soft-sm"
                />
              </div>

              <div className="p-4 rounded-2xl bg-sand-50/80 border border-sand-200 space-y-3">
                <div className="flex gap-2">
                  <select
                    value={selectedConsumableId}
                    onChange={(e) => setSelectedConsumableId(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-sand-200 text-stone-800 text-xs focus:outline-none focus:border-tarjeel-500 shadow-soft-sm"
                  >
                    {consumableItems.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.unit === "gram" ? "جرام" : c.unit})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={consumedGrams}
                    onChange={(e) => setConsumedGrams(Number(e.target.value))}
                    className="w-20 px-3 py-2 rounded-xl bg-white border border-sand-200 text-stone-800 text-xs text-center font-bold focus:outline-none focus:border-tarjeel-500 shadow-soft-sm"
                  />
                  <button
                    type="button"
                    onClick={addConsumableDeduction}
                    className="px-4 py-2 rounded-full bg-tarjeel-500 text-white font-semibold text-xs shadow-soft-sm hover:bg-tarjeel-600 transition-all active:scale-95"
                  >
                    خصم
                  </button>
                </div>

                {consumablesList.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {consumablesList.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-xl border border-sand-200 bg-white shadow-soft-sm">
                        <span className="text-stone-700">{item.name} — {item.grams} جرام</span>
                        <button onClick={() => removeConsumableDeduction(idx)} className="text-stone-400 hover:text-rose-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Checkout Panel (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 luxury-card rounded-3xl p-6 sm:p-7 space-y-5 shadow-soft-md text-xs">
              <div className="flex items-center justify-between border-b border-sand-200 pb-3">
                <span className="font-bold text-sm text-stone-900">سلة الفاتورة الحالية</span>
                <span className="px-3 py-1 rounded-full bg-tarjeel-50 text-tarjeel-800 font-semibold">{cart.length} عناصر</span>
              </div>

              {/* Client & Stylist */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="اسم العميلة"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-sand-200 text-stone-800 text-xs focus:outline-none focus:border-tarjeel-500 shadow-soft-sm"
                  />
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="الجوال"
                    className="w-32 px-3 py-2.5 rounded-xl bg-white border border-sand-200 text-stone-800 text-xs font-mono focus:outline-none focus:border-tarjeel-500 shadow-soft-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-stone-600 font-semibold text-[11px]">الأخصائية (حساب العمولة):</label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-sand-200 text-stone-800 text-xs font-semibold focus:outline-none focus:border-tarjeel-500 shadow-soft-sm"
                  >
                    {staffList.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.full_name} (عمولة {st.commission_rate_services}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cart */}
              <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-stone-400 rounded-2xl bg-sand-50/50 border border-dashed border-sand-200">
                    السلة فارغة، اختاري خدمات أو منتجات
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl border border-sand-200/80 bg-white shadow-soft-sm">
                      <div>
                        <span className="text-stone-900 block font-bold text-xs">{item.name}</span>
                        <span className="text-[11px] text-stone-400">{formatSAR(item.price)} × {item.quantity}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-tarjeel-800">{formatSAR(item.price * item.quantity)}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-stone-400 hover:text-rose-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Discount & Tip */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-stone-600 font-semibold text-[11px]">الخصم (ريال):</label>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-sand-200 text-stone-800 text-center font-bold focus:outline-none focus:border-tarjeel-500 shadow-soft-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-stone-600 font-semibold text-[11px]">الإكرامية (ريال):</label>
                  <input
                    type="number"
                    min="0"
                    value={tip}
                    onChange={(e) => setTip(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-sand-200 text-stone-800 text-center font-bold focus:outline-none focus:border-tarjeel-500 shadow-soft-sm"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="block text-stone-600 font-semibold text-[11px]">طريقة الدفع:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "mada", label: "مدى" },
                    { id: "card", label: "فيزا/ماستر" },
                    { id: "apple_pay", label: "Apple Pay" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`py-2.5 rounded-xl text-center transition-all text-xs font-semibold ${
                        paymentMethod === m.id
                          ? "bg-tarjeel-500 text-white shadow-soft-sm"
                          : "bg-white border border-sand-200 text-stone-700 hover:border-tarjeel-300"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="p-4 rounded-2xl bg-sand-50/90 border border-sand-200 space-y-2">
                <div className="flex justify-between text-stone-600">
                  <span>المجموع قبل الضريبة:</span>
                  <span className="font-semibold text-stone-800">{formatSAR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>ضريبة القيمة المضافة (15%):</span>
                  <span className="font-semibold text-stone-800">{formatSAR(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-tarjeel-900 pt-2 border-t border-sand-200">
                  <span>المبلغ المستحق:</span>
                  <span>{formatSAR(totalAmount)}</span>
                </div>
                {selectedStylist && (
                  <div className="flex justify-between text-[11px] text-stone-500 pt-1 border-t border-sand-200/80">
                    <span>عمولة الأخصائية ({selectedStylist.full_name}):</span>
                    <span className="font-semibold">{formatSAR(commissionPreview)}</span>
                  </div>
                )}
              </div>

              {/* Checkout */}
              <button
                onClick={handleCheckout}
                disabled={isProcessing || cart.length === 0}
                className="w-full py-4 rounded-full bg-tarjeel-500 hover:bg-tarjeel-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-soft-md transition-all active:scale-95 disabled:opacity-50"
              >
                <Receipt className="w-4 h-4" />
                <span>{isProcessing ? "جاري الإصدار..." : "إتمام الدفع وإصدار الفاتورة الضريبية"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

