import { Priority, Ticket, TicketEventType, TicketStatus } from "@/lib/types";

export function toBuddhistYear(date: Date): number {
  return date.getFullYear() + 543;
}

export function generateTicketId(seq: number, date: Date = new Date()): string {
  const year = toBuddhistYear(date);
  return `MS-${year}-${String(seq).padStart(5, "0")}`;
}

export function formatThaiDate(iso: string): string {
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date(iso));
}

export function formatThaiTime(iso: string): string {
  return new Intl.DateTimeFormat("th-TH", { timeStyle: "short" }).format(new Date(iso));
}

export function formatThaiDateTime(iso: string): string {
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(iso)
  );
}

interface StatusMeta {
  label: string;
  colorVar: string;
}

export const statusMeta: Record<TicketStatus, StatusMeta> = {
  pending: { label: "รอดำเนินการ", colorVar: "--status-pending" },
  accepted: { label: "เจ้าหน้าที่รับเรื่องแล้ว", colorVar: "--status-accepted" },
  in_progress: { label: "กำลังดำเนินการ", colorVar: "--status-progress" },
  completed: { label: "ดำเนินการเสร็จสิ้น", colorVar: "--status-completed" },
  cancelled: { label: "ยกเลิก", colorVar: "--status-cancelled" },
};

interface PriorityMeta {
  label: string;
  colorVar: string;
}

export const priorityMeta: Record<Priority, PriorityMeta> = {
  normal: { label: "ปกติ", colorVar: "--status-good" },
  urgent: { label: "เร่งด่วน", colorVar: "--status-warning" },
  critical: { label: "ด่วนมาก", colorVar: "--status-critical" },
};

export function formatLocation(ticket: Pick<Ticket, "building" | "floor" | "room">): string {
  const parts = [
    ticket.building,
    ticket.floor && `ชั้น ${ticket.floor}`,
    ticket.room,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "-";
}

export const timelineSteps: { type: TicketStatus; eventType: TicketEventType; label: string }[] = [
  { type: "pending", eventType: "created", label: "แจ้งซ่อม" },
  { type: "accepted", eventType: "accepted", label: "เจ้าหน้าที่รับเรื่อง" },
  { type: "in_progress", eventType: "in_progress", label: "กำลังดำเนินการ" },
  { type: "completed", eventType: "completed", label: "ดำเนินการเสร็จสิ้น" },
];

// Thai label for every possible TicketEvent type — a superset of timelineSteps (which only
// covers the 4 forward-progress statuses) used by the repair-history export/report.
export const eventTypeLabel: Record<TicketEventType, string> = {
  created: "แจ้งซ่อม",
  accepted: "เจ้าหน้าที่รับเรื่อง",
  in_progress: "กำลังดำเนินการ",
  completed: "ดำเนินการเสร็จสิ้น",
  cancelled: "ยกเลิกรายการ",
  assigned: "มอบหมายช่าง",
  note: "บันทึกเพิ่มเติม",
};
