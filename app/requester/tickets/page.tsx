"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ClipboardList, Inbox } from "lucide-react";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import Tabs from "@/components/Tabs";
import TicketCard from "@/components/TicketCard";
import { useApp } from "@/context/AppContext";

type View = "active" | "history";

function TicketsInner() {
  const { currentUser, tickets } = useApp();
  const searchParams = useSearchParams();
  const initialView: View = searchParams.get("view") === "history" ? "history" : "active";
  const [view, setView] = useState<View>(initialView);

  const myTickets = tickets
    .filter((t) => t.requesterName === currentUser?.name)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const active = myTickets.filter((t) => !["completed", "cancelled"].includes(t.status));
  const history = myTickets.filter((t) => ["completed", "cancelled"].includes(t.status));
  const list = view === "active" ? active : history;

  return (
    <AppShell role="requester" title={view === "active" ? "รายการแจ้งซ่อมของฉัน" : "ประวัติการแจ้งซ่อม"}>
      <div className="mx-auto flex max-w-4xl flex-col gap-5">
        <Tabs
          items={[
            { key: "active" as const, label: "รายการของฉัน", count: active.length },
            { key: "history" as const, label: "ประวัติ", count: history.length },
          ]}
          active={view}
          onChange={setView}
        />

        <div className="flex flex-col gap-3">
          {list.length === 0 && (
            <EmptyState
              icon={view === "active" ? Inbox : ClipboardList}
              title={view === "active" ? "ยังไม่มีรายการแจ้งซ่อม" : "ยังไม่มีประวัติการแจ้งซ่อม"}
              description={
                view === "active"
                  ? "เมื่อคุณแจ้งซ่อม รายการจะแสดงที่นี่"
                  : "รายการที่เสร็จสิ้นหรือยกเลิกแล้วจะแสดงที่นี่"
              }
              action={
                view === "active" ? (
                  <Button href="/requester/create" size="sm">
                    แจ้งซ่อมใหม่
                  </Button>
                ) : undefined
              }
            />
          )}
          {list.map((t) => (
            <TicketCard key={t.id} ticket={t} href={`/requester/detail/${t.id}`} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export default function RequesterTicketsPage() {
  return (
    <Suspense fallback={null}>
      <TicketsInner />
    </Suspense>
  );
}
