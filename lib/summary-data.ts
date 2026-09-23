import { CategoryId, Priority, Ticket, TicketStatus } from "@/lib/types";
import { categories } from "@/mock/categories";
import { priorityMeta, statusMeta } from "@/lib/ticket-utils";

export type PeriodGranularity = "week" | "month";

export interface PeriodBucket {
  key: string;
  label: string;
  from: Date;
  to: Date;
  count: number;
}

const shortDate = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short" });
const shortMonth = new Intl.DateTimeFormat("th-TH", { month: "short", year: "numeric" });

function startOfWeek(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayFromMonday = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - dayFromMonday);
  return date;
}

// Builds the last `periods` week/month buckets (oldest first, current period last) with a
// ticket count per bucket, for the trend chart — each bucket doubles as a drill-down filter
// range (see DrillFilter's "period" kind in this same file).
export function buildPeriodBuckets(
  tickets: Ticket[],
  granularity: PeriodGranularity,
  periods: number
): PeriodBucket[] {
  const now = new Date();
  const buckets: PeriodBucket[] = [];

  for (let i = periods - 1; i >= 0; i--) {
    let from: Date;
    let to: Date;
    let key: string;
    let label: string;

    if (granularity === "week") {
      const anchor = new Date(now);
      anchor.setDate(anchor.getDate() - i * 7);
      from = startOfWeek(anchor);
      to = new Date(from);
      to.setDate(to.getDate() + 7);
      const lastDay = new Date(to);
      lastDay.setDate(lastDay.getDate() - 1);
      key = from.toISOString().slice(0, 10);
      label = `${shortDate.format(from)} - ${shortDate.format(lastDay)}`;
    } else {
      const anchor = new Date(now.getFullYear(), now.getMonth() - i, 1);
      from = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
      to = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
      key = `${from.getFullYear()}-${from.getMonth() + 1}`;
      label = shortMonth.format(from);
    }

    const count = tickets.filter((t) => {
      const created = new Date(t.createdAt);
      return created >= from && created < to;
    }).length;

    buckets.push({ key, label, from, to, count });
  }

  return buckets;
}

export interface DimensionRow {
  key: string;
  label: string;
  icon?: string;
  colorVar?: string;
  count: number;
}

export function byStatus(tickets: Ticket[]): DimensionRow[] {
  return (Object.keys(statusMeta) as TicketStatus[]).map((status) => ({
    key: status,
    label: statusMeta[status].label,
    colorVar: statusMeta[status].colorVar,
    count: tickets.filter((t) => t.status === status).length,
  }));
}

export function byCategory(tickets: Ticket[]): DimensionRow[] {
  return categories
    .map((c) => ({
      key: c.id,
      label: c.label,
      icon: c.icon,
      colorVar: c.colorVar,
      count: tickets.filter((t) => t.categoryId === c.id).length,
    }))
    .sort((a, b) => b.count - a.count);
}

export function byPriority(tickets: Ticket[]): DimensionRow[] {
  return (Object.keys(priorityMeta) as Priority[]).map((priority) => ({
    key: priority,
    label: priorityMeta[priority].label,
    colorVar: priorityMeta[priority].colorVar,
    count: tickets.filter((t) => t.priority === priority).length,
  }));
}

const UNASSIGNED_KEY = "__unassigned__";

export function byTechnician(tickets: Ticket[]): DimensionRow[] {
  const map = new Map<string, { label: string; count: number }>();
  for (const t of tickets) {
    const key = t.technicianId ?? UNASSIGNED_KEY;
    const label = t.technicianName ?? "ยังไม่ได้มอบหมาย";
    const entry = map.get(key);
    if (entry) entry.count += 1;
    else map.set(key, { label, count: 1 });
  }
  return [...map.entries()]
    .map(([key, v]) => ({ key, label: v.label, count: v.count }))
    .sort((a, b) => b.count - a.count);
}

export function byDepartment(tickets: Ticket[]): DimensionRow[] {
  const map = new Map<string, number>();
  for (const t of tickets) {
    const key = t.department || "ไม่ระบุหน่วยงาน";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, label: key, count }))
    .sort((a, b) => b.count - a.count);
}

export type DrillFilter =
  | { kind: "status"; value: TicketStatus; label: string }
  | { kind: "category"; value: CategoryId; label: string }
  | { kind: "priority"; value: Priority; label: string }
  | { kind: "technician"; value: string | null; label: string }
  | { kind: "department"; value: string; label: string }
  | { kind: "period"; from: Date; to: Date; label: string };

export function applyDrillFilter(tickets: Ticket[], filter: DrillFilter): Ticket[] {
  switch (filter.kind) {
    case "status":
      return tickets.filter((t) => t.status === filter.value);
    case "category":
      return tickets.filter((t) => t.categoryId === filter.value);
    case "priority":
      return tickets.filter((t) => t.priority === filter.value);
    case "technician":
      return tickets.filter((t) => (t.technicianId ?? null) === filter.value);
    case "department":
      return tickets.filter((t) => (t.department || "ไม่ระบุหน่วยงาน") === filter.value);
    case "period":
      return tickets.filter((t) => {
        const created = new Date(t.createdAt);
        return created >= filter.from && created < filter.to;
      });
  }
}

