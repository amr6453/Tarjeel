import React from "react";
import { AlertCircle, RefreshCw, Sparkles, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

// 1. Loading Skeleton Component
export function LoadingSkeleton({
  count = 3,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4 animate-pulse", className)}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="h-20 bg-sand-200/70 rounded-3xl w-full"
        />
      ))}
    </div>
  );
}

// 2. Empty State Component
export function EmptyState({
  title = "لا توجد بيانات حالياً",
  description = "لم يتم العثور على أي عناصر مسجلة في هذا القسم.",
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className = "",
}: {
  title?: string;
  description?: string;
  icon?: any;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center bg-white/70 rounded-3xl border border-dashed border-sand-300 my-4 shadow-soft-sm",
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-tarjeel-50 flex items-center justify-center text-tarjeel-600 mb-4 shadow-soft-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-stone-900 mb-1">
        {title}
      </h3>
      <p className="text-sm text-stone-500 max-w-sm mb-6 font-light">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-tarjeel-500 hover:bg-tarjeel-600 text-white font-semibold text-xs transition-transform active:scale-95 shadow-soft-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}

// 3. Error & Retry State Component
export function ErrorState({
  title = "حدث خطأ أثناء تحميل البيانات",
  error,
  onRetry,
  className = "",
}: {
  title?: string;
  error?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center bg-rose-50/70 rounded-3xl border border-rose-200 my-4 shadow-soft-sm",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-rose-900 mb-1">
        {title}
      </h3>
      {error && (
        <p className="text-xs text-rose-700/80 max-w-md mb-4 font-mono">
          {error}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-transform active:scale-95 shadow-soft-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>إعادة المحاولة</span>
        </button>
      )}
    </div>
  );
}

