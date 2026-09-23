"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ClipboardList, Inbox } from "lucide-react";
import AppShell from "@/components/AppShell";
import EmptyState from "@/components/EmptyState";
import Tabs from "@/components/Tabs";
import TicketCard from "@/components/TicketCard";
import { useApp } from "@/context/AppContext";

type View = "new" | "active" | "done";

const tabs: { key: View; label: string }[] = [
  { key: "new", label: "งานใหม่" },
  { key: "active", label: "กำลังดำเนินการ" },
  { key: "done", label: "เสร็จสิ้น" },
];

const emptyStateByView: Record<View, { icon: typeof Inbox; title: string; description: string }> = {
  new: { icon: CheckCircle2, title: "ไม่มีงานใหม่ในขณะนี้", description: "งานใหม่ที่มีผู้แจ้งซ่อมจะแสดงที่นี่" },
  active: { icon: Inbox, title: "ไม่มีงานที่กำลังดำเนินการ", description: "งานที่คุณรับไว้จะแสดงที่นี่" },
  done: { icon: ClipboardList, title: "ยังไม่มีงานที่เสร็จสิ้น", description: "งานที่ปิดงานแล้วจะแสดงที่นี่" },
};

function JobsInner() {
  const { currentUser, tickets } = useApp();
  const searchParams = useSearchParams();
  const initial = (searchParams.get("view") as View) ?? "new";
  const [view, setView] = useState<View>(["new", "active", "done"].includes(initial) ? initial : "new");

  const newJobs = tickets.filter((t) => t.status === "pending");
  const active = tickets.filter(
    (t) => t.technicianId === currentUser?.id && (t.status === "accepted" || t.status === "in_progress")
  );
  const done = tickets.filter((t) => t.technicianId === currentUser?.id && t.status === "completed");

  const list = view === "new" ? newJobs : view === "active" ? active : done;
  const empty = emptyStateByView[view];

  return (
    <AppShell role="technician" title="งานของฉัน">
      <div className="mx-auto flex max-w-4xl flex-col gap-5">
        <Tabs
          items={tabs.map((t) => ({
            ...t,
            count: t.key === "new" ? newJobs.length : t.key === "active" ? active.length : done.length,
          }))}
          active={view}
          onChange={setView}
        />

        <div className="flex flex-col gap-3">
          {list.length === 0 && (
            <EmptyState icon={empty.icon} title={empty.title} description={empty.description} />
          )}
          {list.map((t) => (
            <TicketCard key={t.id} ticket={t} href={`/technician/jobs/${t.id}`} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export default function TechnicianJobsPage() {
  return (
    <Suspense fallback={null}>
      <JobsInner />
    </Suspense>
  );
}
