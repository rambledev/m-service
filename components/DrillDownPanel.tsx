"use client";

import { Inbox, X } from "lucide-react";
import { Ticket } from "@/lib/types";
import TicketCard from "@/components/TicketCard";
import EmptyState from "@/components/EmptyState";

export default function DrillDownPanel({
  title,
  tickets,
  onClose,
}: {
  title: string;
  tickets: Ticket[];
  onClose: () => void;
}) {
  const sorted = [...tickets].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="animate-scale-in flex h-full w-full max-w-lg flex-col bg-[var(--surface-2)] shadow-xl sm:m-3 sm:h-[calc(100%-1.5rem)] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex shrink-0 items-center justify-between gap-3 border-b p-4"
          style={{ borderColor: "var(--border-hairline)" }}
        >
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-[var(--text-primary)]">{title}</h2>
            <p className="text-xs text-[var(--text-muted)]">พบ {sorted.length} รายการ</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-1)]"
          >
            <X className="h-4.5 w-4.5" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {sorted.length === 0 ? (
            <EmptyState icon={Inbox} title="ไม่พบรายการในหมวดนี้" />
          ) : (
            <div className="flex flex-col gap-3">
              {sorted.map((t) => (
                <TicketCard key={t.id} ticket={t} href={`/admin/tickets?open=${t.id}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
