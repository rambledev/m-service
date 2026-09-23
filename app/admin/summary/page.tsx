"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import Tabs from "@/components/Tabs";
import DimensionBreakdown from "@/components/DimensionBreakdown";
import DrillDownPanel from "@/components/DrillDownPanel";
import { useApp } from "@/context/AppContext";
import {
  applyDrillFilter,
  buildPeriodBuckets,
  byCategory,
  byDepartment,
  byPriority,
  byStatus,
  byTechnician,
  DimensionRow,
  DrillFilter,
  PeriodBucket,
  PeriodGranularity,
} from "@/lib/summary-data";
import { CategoryId, Priority, TicketStatus } from "@/lib/types";

const CHART_HEIGHT = 160;

export default function AdminSummaryPage() {
  const { tickets } = useApp();
  const [granularity, setGranularity] = useState<PeriodGranularity>("week");
  const [filter, setFilter] = useState<DrillFilter | null>(null);

  const periods = granularity === "week" ? 8 : 6;
  const buckets = useMemo(
    () => buildPeriodBuckets(tickets, granularity, periods),
    [tickets, granularity, periods]
  );
  const maxBucket = Math.max(1, ...buckets.map((b) => b.count));

  const statusRows = useMemo(() => byStatus(tickets), [tickets]);
  const categoryRows = useMemo(() => byCategory(tickets), [tickets]);
  const priorityRows = useMemo(() => byPriority(tickets), [tickets]);
  const technicianRows = useMemo(() => byTechnician(tickets), [tickets]);
  const departmentRows = useMemo(() => byDepartment(tickets), [tickets]);

  const drillTickets = useMemo(
    () => (filter ? applyDrillFilter(tickets, filter) : []),
    [tickets, filter]
  );

  function selectPeriod(bucket: PeriodBucket) {
    if (bucket.count === 0) return;
    setFilter({ kind: "period", from: bucket.from, to: bucket.to, label: `ช่วงเวลา: ${bucket.label}` });
  }

  function selectStatus(row: DimensionRow) {
    setFilter({ kind: "status", value: row.key as TicketStatus, label: `สถานะ: ${row.label}` });
  }

  function selectCategory(row: DimensionRow) {
    setFilter({ kind: "category", value: row.key as CategoryId, label: `ประเภทงาน: ${row.label}` });
  }

  function selectPriority(row: DimensionRow) {
    setFilter({ kind: "priority", value: row.key as Priority, label: `ความเร่งด่วน: ${row.label}` });
  }

  function selectTechnician(row: DimensionRow) {
    setFilter({
      kind: "technician",
      value: row.key === "__unassigned__" ? null : row.key,
      label: `ช่างซ่อม: ${row.label}`,
    });
  }

  function selectDepartment(row: DimensionRow) {
    setFilter({ kind: "department", value: row.key, label: `หน่วยงาน: ${row.label}` });
  }

  return (
    <AppShell role="admin" title="สรุปข้อมูล">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div
          className="rounded-2xl border bg-[var(--surface-2)] p-5 shadow-sm"
          style={{ borderColor: "var(--border-hairline)" }}
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
                แนวโน้มรายการแจ้งซ่อม
              </h2>
              <p className="text-xs text-[var(--text-muted)]">แตะแท่งกราฟเพื่อดูรายละเอียดของช่วงนั้น</p>
            </div>
            <div className="w-full max-w-[220px] sm:w-auto">
              <Tabs
                items={[
                  { key: "week", label: "รายสัปดาห์" },
                  { key: "month", label: "รายเดือน" },
                ]}
                active={granularity}
                onChange={setGranularity}
              />
            </div>
          </div>

          <div className="flex items-end gap-2 sm:gap-3" style={{ height: CHART_HEIGHT + 44 }}>
            {buckets.map((bucket) => {
              const barHeight =
                bucket.count > 0 ? Math.max(6, (bucket.count / maxBucket) * CHART_HEIGHT) : 2;
              return (
                <button
                  key={bucket.key}
                  type="button"
                  onClick={() => selectPeriod(bucket)}
                  disabled={bucket.count === 0}
                  className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5 disabled:cursor-default"
                >
                  <span className="text-xs font-semibold tabular-nums text-[var(--text-secondary)]">
                    {bucket.count}
                  </span>
                  <div
                    className="w-full rounded-t-md transition-all hover:opacity-80"
                    style={{
                      height: barHeight,
                      backgroundColor: bucket.count > 0 ? "var(--brand-primary)" : "var(--surface-1)",
                    }}
                  />
                  <span className="w-full truncate text-center text-[10px] leading-tight text-[var(--text-muted)]">
                    {bucket.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <DimensionBreakdown title="ตามสถานะ" rows={statusRows} onSelect={selectStatus} />
          <DimensionBreakdown title="ตามความเร่งด่วน" rows={priorityRows} onSelect={selectPriority} />
          <DimensionBreakdown title="ตามประเภทงาน" rows={categoryRows} onSelect={selectCategory} />
          <DimensionBreakdown
            title="ตามช่างซ่อมผู้รับผิดชอบ"
            rows={technicianRows}
            onSelect={selectTechnician}
          />
          <div className="lg:col-span-2">
            <DimensionBreakdown
              title="ตามหน่วยงานผู้แจ้ง"
              rows={departmentRows}
              onSelect={selectDepartment}
            />
          </div>
        </div>
      </div>

      {filter && (
        <DrillDownPanel title={filter.label} tickets={drillTickets} onClose={() => setFilter(null)} />
      )}
    </AppShell>
  );
}
