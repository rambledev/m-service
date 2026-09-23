"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export type ToastVariant = "success" | "error";

export interface ToastData {
  variant: ToastVariant;
  message: string;
}

export default function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastData | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isSuccess = toast.variant === "success";
  const Icon = isSuccess ? CheckCircle2 : XCircle;

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-6" aria-live="polite">
      <div
        className="animate-scale-in flex max-w-md items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg"
        style={{
          backgroundColor: isSuccess ? "var(--status-good-soft)" : "var(--status-critical-soft)",
          borderColor: isSuccess ? "var(--status-good)" : "var(--status-critical)",
          color: isSuccess ? "var(--status-good)" : "var(--status-critical)",
        }}
        role="alert"
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        {toast.message}
      </div>
    </div>
  );
}
