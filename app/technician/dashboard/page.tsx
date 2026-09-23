"use client";

import { CheckCircle2, Inbox, Wrench } from "lucide-react";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import TicketCard from "@/components/TicketCard";
import { useApp } from "@/context/AppContext";

export default function TechnicianDashboardPage() {
  const { currentUser, tickets } = useApp();

  const newJobs = tickets.filter((t) => t.status === "pending");
  const myActive = tickets.filter(
    (t) =>
      t.technicianId === currentUser?.id && (t.status === "accepted" || t.status === "in_progress")
  );
  const myCompleted = tickets.filter(
    (t) => t.technicianId === currentUser?.id && t.status === "completed"
  );

  return (
    <AppShell role="technician" title="แดชบอร์ดช่างซ่อม">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            สวัสดี, {currentUser?.name}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">งานซ่อมที่รอดำเนินการของคุณวันนี้</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <DashboardCard label="งานใหม่" value={newJobs.length} icon={Inbox} accentVar="--status-pending" />
          <DashboardCard
            label="กำลังดำเนินการ"
            value={myActive.length}
            icon={Wrench}
            accentVar="--status-progress"
          />
          <DashboardCard
            label="เสร็จสิ้น"
            value={myCompleted.length}
            icon={CheckCircle2}
            accentVar="--status-completed"
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)]">งานใหม่ที่รอรับ</h2>
            <Button href="/technician/jobs?view=new" variant="ghost" size="sm">
              ดูทั้งหมด →
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {newJobs.length === 0 && (
              <EmptyState icon={CheckCircle2} title="ไม่มีงานใหม่ในขณะนี้" description="งานใหม่ที่มีผู้แจ้งซ่อมจะแสดงที่นี่" />
            )}
            {newJobs.slice(0, 5).map((t) => (
              <TicketCard key={t.id} ticket={t} href={`/technician/jobs/${t.id}`} />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
