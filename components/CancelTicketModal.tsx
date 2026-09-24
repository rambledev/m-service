"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import Button from "@/components/Button";

export default function CancelTicketModal({
  onConfirm,
  onClose,
}: {
  onConfirm: (reason: string) => Promise<void>;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    if (!reason.trim()) {
      setError("กรุณาระบุเหตุผล");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onConfirm(reason.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ยกเลิกรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="animate-scale-in w-full max-w-md rounded-2xl bg-[var(--surface-2)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mb-4 flex h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--status-critical-soft)", color: "var(--status-critical)" }}
        >
          <TriangleAlert className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">ยกเลิกรายการแจ้งซ่อม</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          กรุณาระบุเหตุผลในการยกเลิกรายการนี้
        </p>
        <textarea
          className="mt-4 w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-primary)]"
          style={{ borderColor: "var(--border-hairline)" }}
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="เช่น แจ้งซ้ำ, แก้ไขได้เองแล้ว"
          autoFocus
          disabled={submitting}
        />
        {error && (
          <p className="mt-2 text-sm" style={{ color: "var(--status-critical)" }}>
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            ปิด
          </Button>
          <Button variant="dangerSolid" onClick={handleConfirm} loading={submitting}>
            ยืนยันยกเลิก
          </Button>
        </div>
      </div>
    </div>
  );
}
