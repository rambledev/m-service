"use client";

import { useState } from "react";
import { ChevronDown, Tags, Trash2, UserCog, XCircle } from "lucide-react";
import { CategoryId, Ticket } from "@/lib/types";
import { categories, getCategory } from "@/mock/categories";
import { formatLocation, formatThaiDateTime } from "@/lib/ticket-utils";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import StatusTimeline from "@/components/StatusTimeline";
import ImageGallery from "@/components/ImageGallery";
import Button from "@/components/Button";
import CancelTicketModal from "@/components/CancelTicketModal";
import DeleteTicketModal from "@/components/DeleteTicketModal";
import { useApp } from "@/context/AppContext";

export default function AdminTicketRow({
  ticket,
  defaultOpen,
}: {
  ticket: Ticket;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [showCancel, setShowCancel] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const { assignTechnician, updateCategory, cancelTicket, deleteTicket, getTechnicians } = useApp();
  const category = getCategory(ticket.categoryId);
  const technicians = getTechnicians();
  const canCancel = !["completed", "cancelled"].includes(ticket.status);

  return (
    <div
      className="overflow-hidden rounded-xl border bg-[var(--surface-2)] shadow-sm transition-shadow hover:shadow-md"
      style={{ borderColor: "var(--border-hairline)" }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full flex-col gap-3 p-4 text-left transition-colors hover:bg-[var(--surface-1)] sm:flex-row sm:items-center sm:justify-between"
        aria-expanded={open}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
            style={{ backgroundColor: `color-mix(in srgb, var(${category.colorVar}) 16%, white)` }}
          >
            <span aria-hidden>{category.icon}</span>
          </div>
          <div>
            <p className="text-xs font-mono text-[var(--text-muted)]">{ticket.id}</p>
            <p className="font-medium text-[var(--text-primary)]">{ticket.title}</p>
            <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
              {ticket.requesterName} · {category.label} ·{" "}
              {ticket.technicianName ?? "ยังไม่มอบหมายช่าง"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <ChevronDown
            className="h-4 w-4 text-[var(--text-muted)] transition-transform"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
            aria-hidden
          />
        </div>
      </button>

      {open && (
        <div
          className="animate-fade-in border-t px-4 py-4"
          style={{ borderColor: "var(--border-hairline)" }}
        >
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[var(--text-muted)]">สถานที่</dt>
              <dd className="mt-0.5 font-medium">{formatLocation(ticket)}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">แจ้งเมื่อ</dt>
              <dd className="mt-0.5 font-medium">{formatThaiDateTime(ticket.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">ผู้แจ้ง</dt>
              <dd className="mt-0.5 font-medium">
                {ticket.requesterName} · {ticket.department} · {ticket.phone}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[var(--text-muted)]">รายละเอียดปัญหา</dt>
              <dd className="mt-0.5">{ticket.detail}</dd>
            </div>
            {ticket.repairNote && (
              <div className="sm:col-span-2">
                <dt className="text-[var(--text-muted)]">หมายเหตุการซ่อม</dt>
                <dd className="mt-0.5">{ticket.repairNote}</dd>
              </div>
            )}
            {ticket.images.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="mb-2 text-[var(--text-muted)]">รูปภาพที่แนบตอนแจ้งซ่อม</dt>
                <ImageGallery images={ticket.images} thumbClassName="h-16 w-16 object-cover" />
              </div>
            )}
          </dl>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)]">
                <Tags className="h-4 w-4" aria-hidden />
                ประเภทงาน
              </label>
              <select
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--brand-primary)]"
                style={{ borderColor: "var(--border-hairline)" }}
                value={ticket.categoryId}
                onChange={(e) => updateCategory(ticket.id, e.target.value as CategoryId)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>

            {ticket.status !== "completed" && ticket.status !== "cancelled" && (
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)]">
                  <UserCog className="h-4 w-4" aria-hidden />
                  มอบหมายช่าง
                </label>
                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--brand-primary)]"
                  style={{ borderColor: "var(--border-hairline)" }}
                  value={ticket.technicianId ?? ""}
                  onChange={(e) => e.target.value && assignTechnician(ticket.id, e.target.value)}
                >
                  <option value="" disabled>
                    เลือกช่าง
                  </option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name}
                      {tech.department ? ` (${tech.department})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="mt-5">
            <h4 className="mb-3 text-sm font-semibold text-[var(--text-secondary)]">ความคืบหน้า</h4>
            <StatusTimeline ticket={ticket} />
          </div>

          <div className="mt-5 flex flex-wrap gap-2 border-t pt-4" style={{ borderColor: "var(--border-hairline)" }}>
            {canCancel && (
              <Button variant="danger" icon={XCircle} onClick={() => setShowCancel(true)} size="sm">
                ยกเลิกรายการ
              </Button>
            )}
            <Button variant="dangerSolid" icon={Trash2} onClick={() => setShowDelete(true)} size="sm">
              ลบรายการ
            </Button>
          </div>
        </div>
      )}

      {showCancel && (
        <CancelTicketModal
          onClose={() => setShowCancel(false)}
          onConfirm={async (reason) => {
            await cancelTicket(ticket.id, reason);
          }}
        />
      )}

      {showDelete && (
        <DeleteTicketModal
          ticketId={ticket.id}
          onClose={() => setShowDelete(false)}
          onConfirm={async () => {
            await deleteTicket(ticket.id);
          }}
        />
      )}
    </div>
  );
}
