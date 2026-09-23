"use client";

import { ClipboardList, Inbox, Plus, Wrench } from "lucide-react";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import TicketCard from "@/components/TicketCard";
import { useApp } from "@/context/AppContext";
import { statusMeta } from "@/lib/ticket-utils";
import { statusIcon } from "@/lib/status-icons";

export default function RequesterDashboardPage() {
  const { currentUser, tickets } = useApp();

  const myTickets = tickets.filter((t) => t.requesterName === currentUser?.name);
  const active = myTickets.filter((t) => !["completed", "cancelled"].includes(t.status));
  const recent = [...myTickets]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5);
  const latestStatus = recent[0];
  const LatestIcon = latestStatus ? statusIcon[latestStatus.status] : Inbox;

  return (
    <AppShell role="requester" title="แดชบอร์ด">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              สวัสดี, {currentUser?.name}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              ยินดีต้อนรับกลับสู่ระบบแจ้งซ่อม m-service
            </p>
          </div>
          <Button href="/requester/create" icon={Plus}>
            แจ้งซ่อมใหม่
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <DashboardCard label="รายการแจ้งซ่อมทั้งหมด" value={myTickets.length} icon={ClipboardList} />
          <DashboardCard
            label="กำลังดำเนินการ"
            value={active.length}
            icon={Wrench}
            accentVar="--status-progress"
          />
          <DashboardCard
            label="สถานะล่าสุด"
            value={latestStatus ? statusMeta[latestStatus.status].label : "-"}
            hint={latestStatus ? latestStatus.id : "ยังไม่มีรายการแจ้งซ่อม"}
            icon={LatestIcon}
            accentVar={latestStatus ? statusMeta[latestStatus.status].colorVar : "--text-muted"}
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)]">รายการล่าสุด</h2>
            <Button href="/requester/tickets?view=active" variant="ghost" size="sm">
              ดูทั้งหมด →
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {recent.length === 0 && (
              <EmptyState
                icon={Inbox}
                title="ยังไม่มีรายการแจ้งซ่อม"
                description="เริ่มแจ้งซ่อมรายการแรกของคุณได้ทันที"
                action={
                  <Button href="/requester/create" icon={Plus} size="sm">
                    แจ้งซ่อมใหม่
                  </Button>
                }
              />
            )}
            {recent.map((t) => (
              <TicketCard key={t.id} ticket={t} href={`/requester/detail/${t.id}`} />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
