"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  FileQuestion,
  FileText,
  Hand,
  ImageIcon,
  Info,
  PlayCircle,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import EmptyState from "@/components/EmptyState";
import ImageUploader from "@/components/ImageUploader";
import StatusTimeline from "@/components/StatusTimeline";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import Toast, { ToastData } from "@/components/Toast";
import { useApp } from "@/context/AppContext";
import { getCategory } from "@/mock/categories";
import { formatLocation, formatThaiDateTime } from "@/lib/ticket-utils";
import { TicketImage } from "@/lib/types";

const MAX_COMPLETION_IMAGES = 3;

export default function TechnicianJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, tickets, acceptTicket, startProgress, completeTicket } = useApp();
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState("");
  const [completionImages, setCompletionImages] = useState<TicketImage[]>([]);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [accepting, setAccepting] = useState(false);

  const ticket = tickets.find((t) => t.id === id);

  if (!ticket || !currentUser) {
    return (
      <AppShell role="technician" title="รายละเอียดงาน">
        <EmptyState icon={FileQuestion} title="ไม่พบข้อมูลรายการนี้" />
      </AppShell>
    );
  }

  const category = getCategory(ticket.categoryId);
  const isMine = ticket.technicianId === currentUser.id;
  const assignedElsewhere = !!ticket.technicianId && !isMine;

  // TS doesn't retain the `!ticket || !currentUser` narrowing above across a nested function
  // boundary, so capture already-narrowed locals for handleAccept to close over.
  const currentTicket = ticket;
  const technician = currentUser;

  function handleAccept() {
    console.log("[TechnicianJobDetailPage][handleAccept] START", { ticketId: currentTicket.id });
    setAccepting(true);
    // Re-checked atomically inside acceptTicket against the latest state (including anything
    // just synced in from another tab), so this is the "realtime" guard against two technicians
    // both accepting the same pending job.
    const result = acceptTicket(currentTicket.id, technician);
    setToast({ variant: result.success ? "success" : "error", message: result.message });
    setAccepting(false);
    console.log("[TechnicianJobDetailPage][handleAccept] END", { ticketId: currentTicket.id, result });
  }

  return (
    <AppShell role="technician" title="รายละเอียดงาน">
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        <div
          className="rounded-2xl border bg-[var(--surface-2)] p-5 shadow-sm"
          style={{ borderColor: "var(--border-hairline)" }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-sm text-[var(--text-muted)]">{ticket.id}</p>
              <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                {category.icon} {category.label}
              </h2>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>

          <dl className="mt-5 grid gap-4 border-t pt-5 text-sm sm:grid-cols-2" style={{ borderColor: "var(--border-hairline)" }}>
            <div>
              <dt className="text-[var(--text-muted)]">สถานที่</dt>
              <dd className="mt-0.5 font-medium">
                {formatLocation(ticket)}
              </dd>
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
            <div>
              <dt className="text-[var(--text-muted)]">แจ้งเมื่อ</dt>
              <dd className="mt-0.5 font-medium">{formatThaiDateTime(ticket.createdAt)}</dd>
            </div>
          </dl>

          {ticket.images.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3 border-t pt-5" style={{ borderColor: "var(--border-hairline)" }}>
              {ticket.images.map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.name}
                  src={img.url}
                  alt={img.name}
                  className="h-20 w-20 rounded-lg border object-cover"
                  style={{ borderColor: "var(--border-hairline)" }}
                />
              ))}
            </div>
          )}
        </div>

        {assignedElsewhere && (
          <div
            className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm"
            style={{ borderColor: "var(--border-hairline)", color: "var(--text-secondary)" }}
          >
            <Info className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} aria-hidden />
            งานนี้ถูกมอบหมายให้ {ticket.technicianName} แล้ว
          </div>
        )}

        {!assignedElsewhere && ticket.status === "pending" && (
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="inline-flex w-fit items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            <Hand className="h-4 w-4" aria-hidden />
            รับงาน
          </button>
        )}

        {!assignedElsewhere && isMine && ticket.status === "accepted" && (
          <button
            onClick={() => startProgress(ticket.id)}
            className="inline-flex w-fit items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            style={{ backgroundColor: "var(--status-progress)" }}
          >
            <PlayCircle className="h-4 w-4" aria-hidden />
            เริ่มดำเนินการ
          </button>
        )}

        {!assignedElsewhere && isMine && ticket.status === "in_progress" && (
          <div
            className="rounded-2xl border bg-[var(--surface-2)] p-5 shadow-sm"
            style={{ borderColor: "var(--border-hairline)" }}
          >
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)]">
              <FileText className="h-4 w-4" style={{ color: "var(--brand-primary)" }} aria-hidden />
              หมายเหตุการซ่อม
            </label>
            <textarea
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-primary)]"
              style={{ borderColor: "var(--border-hairline)" }}
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น เปลี่ยนอะไหล่ชุดควบคุมไฟ"
            />
            {noteError && (
              <p className="animate-fade-in mt-2 text-sm" style={{ color: "var(--status-critical)" }}>
                {noteError}
              </p>
            )}

            <label className="mb-1.5 mt-4 flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)]">
              <ImageIcon className="h-4 w-4" style={{ color: "var(--brand-primary)" }} aria-hidden />
              แนบรูปภาพหลังซ่อม
            </label>
            <ImageUploader
              images={completionImages}
              onChange={setCompletionImages}
              maxImages={MAX_COMPLETION_IMAGES}
            />

            <button
              onClick={() => {
                if (!note.trim()) {
                  setNoteError("กรุณาระบุหมายเหตุการซ่อม");
                  return;
                }
                completeTicket(ticket.id, note.trim(), completionImages);
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
              style={{ backgroundColor: "var(--status-good)" }}
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              งานเสร็จสิ้น
            </button>
          </div>
        )}

        <div
          className="rounded-2xl border bg-[var(--surface-2)] p-5 shadow-sm"
          style={{ borderColor: "var(--border-hairline)" }}
        >
          <h3 className="mb-4 text-sm font-semibold text-[var(--text-secondary)]">ความคืบหน้า</h3>
          <StatusTimeline ticket={ticket} />
        </div>
      </div>
    </AppShell>
  );
}
