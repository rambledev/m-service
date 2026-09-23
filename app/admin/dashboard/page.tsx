"use client";

import { CheckCircle2, ClipboardList, Clock, Inbox, Wrench, XCircle } from "lucide-react";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import TicketCard from "@/components/TicketCard";
import { useApp } from "@/context/AppContext";

export default function AdminDashboardPage() {
  const { tickets } = useApp();

  const total = tickets.length;
  const pending = tickets.filter((t) => t.status === "pending").length;
  const inProgress = tickets.filter((t) => t.status === "accepted" || t.status === "in_progress").length;
  const completed = tickets.filter((t) => t.status === "completed").length;
  const cancelled = tickets.filter((t) => t.status === "cancelled").length;

  const recent = [...tickets].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, 6);

  return (
    <AppShell role="admin" title="แดชบอร์ดผู้ดูแลระบบ">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <DashboardCard label="งานทั้งหมด" value={total} icon={ClipboardList} />
          <DashboardCard label="รอดำเนินการ" value={pending} icon={Clock} accentVar="--status-pending" />
          <DashboardCard label="กำลังซ่อม" value={inProgress} icon={Wrench} accentVar="--status-progress" />
          <DashboardCard label="เสร็จสิ้น" value={completed} icon={CheckCircle2} accentVar="--status-completed" />
          <DashboardCard label="ยกเลิก" value={cancelled} icon={XCircle} accentVar="--status-critical" />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)]">รายการล่าสุด</h2>
            <Button href="/admin/tickets" variant="ghost" size="sm">
              จัดการรายการซ่อม →
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {recent.length === 0 && (
              <EmptyState icon={Inbox} title="ยังไม่มีรายการแจ้งซ่อมในระบบ" />
            )}
            {recent.map((t) => (
              <TicketCard key={t.id} ticket={t} href={`/admin/tickets?open=${t.id}`} />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
