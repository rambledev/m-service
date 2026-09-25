"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import Button from "@/components/Button";

export default function DeleteTicketModal({
  ticketId,
  onConfirm,
  onClose,
}: {
  ticketId: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setSubmitting(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ลบรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
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
          <Trash2 className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">ลบรายการแจ้งซ่อม</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          ต้องการลบรายการ <span className="font-mono font-medium">{ticketId}</span> ใช่หรือไม่?
          การลบนี้จะลบข้อมูล ประวัติ และรูปภาพทั้งหมดของรายการนี้ออกจากระบบถาวร{" "}
          <span className="font-medium" style={{ color: "var(--status-critical)" }}>
            ไม่สามารถกู้คืนได้
          </span>
        </p>
        {error && (
          <p className="mt-2 text-sm" style={{ color: "var(--status-critical)" }}>
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            ยกเลิก
          </Button>
          <Button variant="dangerSolid" icon={Trash2} loading={submitting} onClick={handleConfirm}>
            ลบรายการ
          </Button>
        </div>
      </div>
    </div>
  );
}
