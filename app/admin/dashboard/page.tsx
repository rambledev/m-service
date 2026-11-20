"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList, Clock, Inbox, UserCheck, UserPlus, Users, Wrench, XCircle } from "lucide-react";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import TicketCard from "@/components/TicketCard";
import { useApp } from "@/context/AppContext";
import { getUserStatsAction, UserStats } from "@/app/actions/stats";

export default function AdminDashboardPage() {
  const { tickets } = useApp();

  const total = tickets.length;
  const pending = tickets.filter((t) => t.status === "pending").length;
  const inProgress = tickets.filter((t) => t.status === "accepted" || t.status === "in_progress").length;
  const completed = tickets.filter((t) => t.status === "completed").length;
  const cancelled = tickets.filter((t) => t.status === "cancelled").length;

  const recent = [...tickets].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, 6);

  const [userStats, setUserStats] = useState<UserStats | null>(null);
  useEffect(() => {
    getUserStatsAction()
      .then(setUserStats)
      .catch((error) => console.error("[AdminDashboardPage][getUserStatsAction] ERROR", { error }));
  }, []);

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
          <h2 className="mb-3 text-sm font-semibold text-[var(--text-secondary)]">สถิติผู้ใช้งาน</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardCard label="ผู้ใช้งานทั้งหมด" value={userStats?.total ?? "—"} icon={Users} />
            <DashboardCard label="ใช้งานใน 24 ชม." value={userStats?.active24h ?? "—"} icon={UserCheck} accentVar="--status-good" />
            <DashboardCard label="ใช้งานใน 7 วัน" value={userStats?.active7d ?? "—"} icon={UserCheck} accentVar="--status-accepted" />
            <DashboardCard label="ผู้ใช้ใหม่ (30 วัน)" value={userStats?.newUsers30d ?? "—"} icon={UserPlus} accentVar="--status-progress" />
          </div>
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
