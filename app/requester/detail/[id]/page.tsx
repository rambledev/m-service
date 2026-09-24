"use client";

import { Suspense, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Activity, CheckCircle2, FileQuestion, XCircle } from "lucide-react";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import StatusTimeline from "@/components/StatusTimeline";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import CancelTicketModal from "@/components/CancelTicketModal";
import ImageGallery from "@/components/ImageGallery";
import { useApp } from "@/context/AppContext";
import { getCategory } from "@/mock/categories";
import { formatLocation, formatThaiDateTime } from "@/lib/ticket-utils";

function DetailInner() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const justCreated = searchParams.get("created") === "1";
  const { currentUser, tickets, cancelTicket } = useApp();
  const [showCancel, setShowCancel] = useState(false);

  const ticket = tickets.find((t) => t.id === id);

  if (!ticket) {
    return (
      <AppShell role="requester" title="รายละเอียดการแจ้งซ่อม">
        <EmptyState icon={FileQuestion} title="ไม่พบข้อมูลรายการนี้" />
      </AppShell>
    );
  }

  const category = getCategory(ticket.categoryId);
  const canCancel = !["completed", "cancelled"].includes(ticket.status);

  return (
    <AppShell role="requester" title="รายละเอียดการแจ้งซ่อม">
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        {justCreated && (
          <div
            className="animate-fade-in flex items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-sm"
            style={{
              borderColor: "var(--status-good)",
              backgroundColor: "var(--status-good-soft)",
              color: "var(--status-good)",
            }}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
            ส่งแจ้งซ่อมสำเร็จ เลขที่ {ticket.id} สถานะปัจจุบัน: รอดำเนินการ
          </div>
        )}

        <div
          className="rounded-2xl border bg-[var(--surface-2)] p-5 shadow-sm"
          style={{ borderColor: "var(--border-hairline)" }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-sm text-[var(--text-muted)]">{ticket.id}</p>
              <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                {ticket.title}
              </h2>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>

          <dl className="mt-5 grid gap-4 border-t pt-5 text-sm sm:grid-cols-2" style={{ borderColor: "var(--border-hairline)" }}>
            <div>
              <dt className="text-[var(--text-muted)]">ประเภทงาน</dt>
              <dd className="mt-0.5 font-medium">
                {category.icon} {category.label}
              </dd>
            </div>
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
            <div>
              <dt className="text-[var(--text-muted)]">แจ้งเมื่อ</dt>
              <dd className="mt-0.5 font-medium">{formatThaiDateTime(ticket.createdAt)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[var(--text-muted)]">รายละเอียดปัญหา</dt>
              <dd className="mt-0.5">{ticket.detail}</dd>
            </div>
            {ticket.technicianName && (
              <div>
                <dt className="text-[var(--text-muted)]">ช่างผู้รับผิดชอบ</dt>
                <dd className="mt-0.5 font-medium">{ticket.technicianName}</dd>
              </div>
            )}
            {ticket.repairNote && (
              <div className="sm:col-span-2">
                <dt className="text-[var(--text-muted)]">หมายเหตุการซ่อม</dt>
                <dd className="mt-0.5">{ticket.repairNote}</dd>
              </div>
            )}
          </dl>

          {ticket.images.length > 0 && (
            <div className="mt-5 border-t pt-5" style={{ borderColor: "var(--border-hairline)" }}>
              <p className="mb-2 text-sm text-[var(--text-muted)]">รูปภาพที่แนบตอนแจ้งซ่อม</p>
              <ImageGallery images={ticket.images} />
            </div>
          )}

          {ticket.repairImages && ticket.repairImages.length > 0 && (
            <div className="mt-5 border-t pt-5" style={{ borderColor: "var(--border-hairline)" }}>
              <p className="mb-2 text-sm text-[var(--text-muted)]">รูปภาพหลังซ่อม</p>
              <ImageGallery images={ticket.repairImages} />
            </div>
          )}
        </div>

        <div
          className="rounded-2xl border bg-[var(--surface-2)] p-5 shadow-sm"
          style={{ borderColor: "var(--border-hairline)" }}
        >
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
            <Activity className="h-4 w-4" style={{ color: "var(--brand-primary)" }} aria-hidden />
            ความคืบหน้า
          </h3>
          <StatusTimeline ticket={ticket} />
        </div>

        {canCancel && (
          <Button variant="danger" icon={XCircle} onClick={() => setShowCancel(true)} className="self-start">
            ยกเลิกรายการ
          </Button>
        )}
      </div>

      {showCancel && (
        <CancelTicketModal
          onClose={() => setShowCancel(false)}
          onConfirm={(reason) => {
            cancelTicket(ticket.id, reason, currentUser?.name ?? "ผู้แจ้งซ่อม");
            setShowCancel(false);
          }}
        />
      )}
    </AppShell>
  );
}

export default function RequesterDetailPage() {
  return (
    <Suspense fallback={null}>
      <DetailInner />
    </Suspense>
  );
}
