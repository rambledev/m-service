import { Ticket, TicketStatus } from "@/lib/types";
import {
  eventTypeLabel,
  formatThaiDateTime,
  priorityMeta,
  statusMeta,
  toBuddhistYear,
} from "@/lib/ticket-utils";
import { categories, getCategory } from "@/mock/categories";

export interface ReportRow {
  id: string;
  title: string;
  categoryLabel: string;
  statusLabel: string;
  priorityLabel: string;
  requesterName: string;
  department: string;
  technicianName: string;
  building: string;
  createdAtLabel: string;
}

export interface CategoryCount {
  label: string;
  count: number;
}

// One row per event in a ticket's StatusTimeline — the full "ประวัติการซ่อม" (repair history).
export interface HistoryRow {
  ticketId: string;
  ticketTitle: string;
  eventLabel: string;
  timestampLabel: string;
  actor: string;
  note: string;
}

export interface ReportData {
  generatedAtLabel: string;
  filenameBase: string;
  summary: {
    total: number;
    pending: number;
    accepted: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    cancelRatePercent: number;
  };
  byCategory: CategoryCount[];
  rows: ReportRow[];
  history: HistoryRow[];
}

function countByStatus(tickets: Ticket[], status: TicketStatus): number {
  return tickets.filter((t) => t.status === status).length;
}

export function buildReportData(tickets: Ticket[]): ReportData {
  const now = new Date();
  const total = tickets.length;
  const cancelled = countByStatus(tickets, "cancelled");

  const byCategory: CategoryCount[] = categories
    .map((c) => ({
      label: `${c.icon} ${c.label}`,
      count: tickets.filter((t) => t.categoryId === c.id).length,
    }))
    .sort((a, b) => b.count - a.count);

  const sortedTickets = [...tickets].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const rows: ReportRow[] = sortedTickets.map((t) => ({
    id: t.id,
    title: t.title,
    categoryLabel: getCategory(t.categoryId).label,
    statusLabel: statusMeta[t.status].label,
    priorityLabel: priorityMeta[t.priority].label,
    requesterName: t.requesterName,
    department: t.department,
    technicianName: t.technicianName ?? "-",
    building: t.building || "-",
    createdAtLabel: formatThaiDateTime(t.createdAt),
  }));

  // Grouped by ticket (same order as `rows`), events within a ticket kept in the
  // chronological order they were recorded — i.e. exactly what StatusTimeline renders on screen.
  const history: HistoryRow[] = sortedTickets.flatMap((t) =>
    t.history.map((event) => ({
      ticketId: t.id,
      ticketTitle: t.title,
      eventLabel: eventTypeLabel[event.type],
      timestampLabel: formatThaiDateTime(event.timestamp),
      actor: event.actor || "-",
      note: event.note ?? "-",
    }))
  );

  return {
    generatedAtLabel: formatThaiDateTime(now.toISOString()),
    filenameBase: `m-service-report-${toBuddhistYear(now)}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
    summary: {
      total,
      pending: countByStatus(tickets, "pending"),
      accepted: countByStatus(tickets, "accepted"),
      inProgress: countByStatus(tickets, "in_progress"),
      completed: countByStatus(tickets, "completed"),
      cancelled,
      cancelRatePercent: total > 0 ? Math.round((cancelled / total) * 100) : 0,
    },
    byCategory,
    rows,
    history,
  };
}
