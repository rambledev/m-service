// LINE messages for ticket events. Called from Server Actions inside `after()` so that a slow
// or unavailable LINE gateway never delays or fails the user's action; errors are only logged.

import { prisma } from "@/lib/prisma";
import { appBaseUrl, lineNotiEnabled, sendLineText } from "@/lib/line-noti";
import { formatLocation, priorityMeta } from "@/lib/ticket-utils";
import { getCategory } from "@/mock/categories";
import type { Ticket } from "@/lib/types";

const TAG = "[lib/ticket-line-notify]";

const requesterLink = (ticketId: string) => `${appBaseUrl()}/requester/detail/${encodeURIComponent(ticketId)}`;
const technicianLink = (ticketId: string) => `${appBaseUrl()}/technician/jobs/${encodeURIComponent(ticketId)}`;

async function safely(name: string, ticketId: string, work: () => Promise<void>) {
  if (!lineNotiEnabled()) return;
  console.log(`${TAG}[${name}] START`, { ticketId });
  try {
    await work();
    console.log(`${TAG}[${name}] END`, { ticketId });
  } catch (error) {
    console.error(`${TAG}[${name}] ERROR`, { ticketId, error });
  }
}

/** New ticket -> every technician (same audience as the e-mail notification). */
export function lineNewTicket(ticket: Ticket) {
  return safely("lineNewTicket", ticket.id, async () => {
    const technicians = await prisma.user.findMany({ where: { role: "TECHNICIAN" }, select: { id: true } });
    const text = [
      `🔔 มีงานแจ้งซ่อมใหม่ ${ticket.id}`,
      `ประเภทงาน: ${getCategory(ticket.categoryId).label}`,
      `ความเร่งด่วน: ${priorityMeta[ticket.priority].label}`,
      `สถานที่: ${formatLocation(ticket)}`,
      `รายละเอียด: ${ticket.detail.slice(0, 300)}`,
      `ผู้แจ้ง: ${ticket.requesterName} (${ticket.department})`,
      "",
      `รับงาน: ${technicianLink(ticket.id)}`,
    ].join("\n");
    await sendLineText(technicians.map((t) => t.id), text, ticket.id);
  });
}

/** Status changes -> the requester. `skip` is the person who made the change (no self-notify). */
export function lineStatusToRequester(ticket: Ticket, headline: string, extra: string[] = [], skip?: string) {
  return safely("lineStatusToRequester", ticket.id, async () => {
    if (!ticket.requesterId || ticket.requesterId === skip) return;
    const text = [
      `${headline}`,
      `เลขที่: ${ticket.id}`,
      `รายการ: ${ticket.title}`,
      ...extra,
      "",
      `ดูรายละเอียด: ${requesterLink(ticket.id)}`,
    ].join("\n");
    await sendLineText([ticket.requesterId], text, ticket.id);
  });
}

/** Messages for the assigned technician (assignment by admin, cancellation by someone else). */
export function lineToTechnician(ticket: Ticket, headline: string, extra: string[] = [], skip?: string) {
  return safely("lineToTechnician", ticket.id, async () => {
    if (!ticket.technicianId || ticket.technicianId === skip) return;
    const text = [
      `${headline}`,
      `เลขที่: ${ticket.id}`,
      `รายการ: ${ticket.title}`,
      `สถานที่: ${formatLocation(ticket)}`,
      ...extra,
      "",
      `ดูงาน: ${technicianLink(ticket.id)}`,
    ].join("\n");
    await sendLineText([ticket.technicianId], text, ticket.id);
  });
}
