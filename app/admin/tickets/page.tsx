"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Filter, SearchX } from "lucide-react";
import AppShell from "@/components/AppShell";
import AdminTicketRow from "@/components/AdminTicketRow";
import EmptyState from "@/components/EmptyState";
import { useApp } from "@/context/AppContext";
import { categories } from "@/mock/categories";
import { statusMeta } from "@/lib/ticket-utils";
import { TicketStatus } from "@/lib/types";

function TicketsInner() {
  const { tickets } = useApp();
  const searchParams = useSearchParams();
  const openId = searchParams.get("open");

  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = [...tickets]
    .filter((t) => statusFilter === "all" || t.status === statusFilter)
    .filter((t) => categoryFilter === "all" || t.categoryId === categoryFilter)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const selectClass =
    "rounded-lg border bg-[var(--surface-2)] px-3 py-2 text-sm outline-none focus:border-[var(--brand-primary)]";

  return (
    <AppShell role="admin" title="จัดการรายการซ่อม">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div
          className="flex flex-wrap items-center gap-3 rounded-xl border bg-[var(--surface-2)] p-3 shadow-sm"
          style={{ borderColor: "var(--border-hairline)" }}
        >
          <Filter className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} aria-hidden />
          <select
            className={selectClass}
            style={{ borderColor: "var(--border-hairline)" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TicketStatus | "all")}
          >
            <option value="all">ทุกสถานะ</option>
            {(Object.keys(statusMeta) as TicketStatus[]).map((s) => (
              <option key={s} value={s}>
                {statusMeta[s].label}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            style={{ borderColor: "var(--border-hairline)" }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">ทุกประเภทงาน</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
          <span className="ml-auto self-center text-sm text-[var(--text-muted)]">
            พบ {filtered.length} รายการ
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <EmptyState icon={SearchX} title="ไม่พบรายการที่ตรงกับตัวกรอง" description="ลองเปลี่ยนตัวกรองสถานะหรือประเภทงาน" />
          )}
          {filtered.map((t) => (
            <AdminTicketRow key={t.id} ticket={t} defaultOpen={t.id === openId} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export default function AdminTicketsPage() {
  return (
    <Suspense fallback={null}>
      <TicketsInner />
    </Suspense>
  );
}
