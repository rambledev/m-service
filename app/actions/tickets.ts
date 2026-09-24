"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getAllTickets, getAllUsers, mapDbTicketToTicket, priorityToDb, ticketInclude } from "@/lib/data/tickets";
import { generateTicketId } from "@/lib/ticket-utils";
import { getCategory } from "@/mock/categories";
import { CategoryId, Role, Ticket, TicketImage, User } from "@/lib/types";

export type NewTicketInput = {
  requesterName: string;
  department: string;
  phone: string;
  categoryId: CategoryId;
  building: string;
  floor: string;
  room: string;
  detail: string;
  priority: "normal" | "urgent" | "critical";
  images: TicketImage[];
};

export interface AcceptTicketResult {
  success: boolean;
  message: string;
  ticket?: Ticket;
}

interface SessionIdentity {
  id: string;
  role: Role;
  name: string;
}

// Every Server Action re-derives identity from the session instead of trusting whatever the
// client claims — render-time role gating (AppShell) is a UX convenience, not the security
// boundary. This is that boundary.
async function requireSession(): Promise<SessionIdentity> {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    throw new Error("กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
  }
  return { id: session.user.id, role: session.user.role, name: session.user.name ?? session.user.id };
}

export async function createTicketAction(input: NewTicketInput): Promise<Ticket> {
  const session = await requireSession();
  console.log("[actions/tickets][createTicketAction] START", { by: session.id });

  const created = new Date();
  const ticket = await prisma.$transaction(async (tx) => {
    const last = await tx.ticket.findFirst({ orderBy: { seq: "desc" }, select: { seq: true } });
    const seq = (last?.seq ?? 0) + 1;
    const id = generateTicketId(seq, created);

    return tx.ticket.create({
      data: {
        id,
        seq,
        title: input.detail.slice(0, 60),
        requesterId: session.id,
        requesterName: input.requesterName,
        department: input.department,
        phone: input.phone,
        categoryId: input.categoryId,
        building: input.building,
        floor: input.floor,
        room: input.room,
        detail: input.detail,
        priority: priorityToDb[input.priority],
        status: "PENDING",
        images: { create: input.images.map((img) => ({ ...img, kind: "ATTACHED" as const })) },
        history: {
          create: {
            type: "CREATED",
            timestamp: created,
            actorId: session.id,
            actorName: input.requesterName,
          },
        },
      },
      include: ticketInclude,
    });
  });

  console.log("[actions/tickets][createTicketAction] END", { ticketId: ticket.id });
  return mapDbTicketToTicket(ticket);
}

export async function acceptTicketAction(ticketId: string): Promise<AcceptTicketResult> {
  const session = await requireSession();
  console.log("[actions/tickets][acceptTicketAction] START", { ticketId, by: session.id });

  if (session.role !== "technician") {
    throw new Error("เฉพาะช่างซ่อมเท่านั้นที่รับงานได้");
  }

  // The WHERE clause's `status: "PENDING"` is what makes this atomic — Postgres only lets one
  // concurrent UPDATE win a row lock, so `count` (0 or 1) is a real, DB-enforced guarantee that
  // exactly one technician can ever accept a given ticket, no client-side race-checking needed.
  const { count } = await prisma.ticket.updateMany({
    where: { id: ticketId, status: "PENDING" },
    data: {
      status: "ACCEPTED",
      technicianId: session.id,
      technicianName: session.name,
      updatedAt: new Date(),
    },
  });

  if (count === 1) {
    await prisma.ticketEvent.create({
      data: {
        ticketId,
        type: "ACCEPTED",
        actorId: session.id,
        actorName: session.name,
      },
    });
  }

  const current = await prisma.ticket.findUnique({ where: { id: ticketId }, include: ticketInclude });
  if (!current) {
    return { success: false, message: "ไม่พบรายการนี้ในระบบ" };
  }
  const ticket = mapDbTicketToTicket(current);

  const result: AcceptTicketResult =
    count === 1
      ? { success: true, message: `รับงาน ${ticket.id} สำเร็จ`, ticket }
      : {
          success: false,
          message: ticket.technicianName
            ? `รับงานไม่สำเร็จ: ${ticket.technicianName} รับงานนี้ไปแล้ว`
            : "รับงานไม่สำเร็จ: สถานะของงานนี้เปลี่ยนไปแล้ว",
          ticket,
        };

  console.log("[actions/tickets][acceptTicketAction] END", { ticketId, result: { success: result.success } });
  return result;
}

export async function startProgressAction(ticketId: string): Promise<Ticket> {
  const session = await requireSession();

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new Error("ไม่พบรายการนี้ในระบบ");
  if (session.role !== "technician" || ticket.technicianId !== session.id) {
    throw new Error("คุณไม่มีสิทธิ์ดำเนินการรายการนี้");
  }

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: "IN_PROGRESS",
      history: {
        create: { type: "IN_PROGRESS", actorId: session.id, actorName: session.name },
      },
    },
    include: ticketInclude,
  });
  return mapDbTicketToTicket(updated);
}

export async function completeTicketAction(
  ticketId: string,
  note: string,
  images: TicketImage[] = []
): Promise<Ticket> {
  const session = await requireSession();

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new Error("ไม่พบรายการนี้ในระบบ");
  if (session.role !== "technician" || ticket.technicianId !== session.id) {
    throw new Error("คุณไม่มีสิทธิ์ดำเนินการรายการนี้");
  }

  // TicketImage has two independent relations (ticket + optional event) — a doubly-nested
  // create through `history.create.images.create` can't auto-wire the `ticket` side, so the
  // completion event is created first (to get its id), then its images explicitly reference
  // both ticketId and eventId, all inside one transaction for atomicity.
  const updated = await prisma.$transaction(async (tx) => {
    const event = await tx.ticketEvent.create({
      data: { ticketId, type: "COMPLETED", actorId: session.id, actorName: session.name, note },
    });
    if (images.length > 0) {
      await tx.ticketImage.createMany({
        data: images.map((img) => ({ ...img, ticketId, eventId: event.id, kind: "REPAIR" as const })),
      });
    }
    return tx.ticket.update({
      where: { id: ticketId },
      data: { status: "COMPLETED", repairNote: note },
      include: ticketInclude,
    });
  });
  return mapDbTicketToTicket(updated);
}

export async function assignTechnicianAction(ticketId: string, technicianId: string): Promise<Ticket> {
  const session = await requireSession();
  if (session.role !== "admin") throw new Error("เฉพาะผู้ดูแลระบบเท่านั้นที่มอบหมายช่างได้");

  const [ticket, technician] = await Promise.all([
    prisma.ticket.findUnique({ where: { id: ticketId } }),
    prisma.user.findUnique({ where: { id: technicianId } }),
  ]);
  if (!ticket) throw new Error("ไม่พบรายการนี้ในระบบ");
  if (!technician) throw new Error("ไม่พบช่างซ่อมคนนี้ในระบบ");

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: ticket.status === "PENDING" ? "ACCEPTED" : ticket.status,
      technicianId: technician.id,
      technicianName: technician.name,
      history: {
        create: {
          type: "ASSIGNED",
          actorId: session.id,
          actorName: session.name,
          note: `มอบหมายงานให้ ${technician.name}`,
        },
      },
    },
    include: ticketInclude,
  });
  return mapDbTicketToTicket(updated);
}

export async function updateCategoryAction(ticketId: string, categoryId: CategoryId): Promise<Ticket> {
  const session = await requireSession();
  if (session.role !== "admin") throw new Error("เฉพาะผู้ดูแลระบบเท่านั้นที่แก้ไขประเภทงานได้");

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId }, include: ticketInclude });
  if (!ticket) throw new Error("ไม่พบรายการนี้ในระบบ");
  if (ticket.categoryId === categoryId) return mapDbTicketToTicket(ticket);

  const fromLabel = getCategory(ticket.categoryId).label;
  const toLabel = getCategory(categoryId).label;

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      categoryId,
      history: {
        create: {
          type: "NOTE",
          actorId: session.id,
          actorName: session.name,
          note: `เปลี่ยนประเภทงานจาก "${fromLabel}" เป็น "${toLabel}"`,
        },
      },
    },
    include: ticketInclude,
  });
  return mapDbTicketToTicket(updated);
}

export async function cancelTicketAction(ticketId: string, reason: string): Promise<Ticket> {
  const session = await requireSession();
  const trimmedReason = reason.trim();
  if (!trimmedReason) throw new Error("กรุณาระบุเหตุผลในการยกเลิก");

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new Error("ไม่พบรายการนี้ในระบบ");
  if (ticket.status === "COMPLETED" || ticket.status === "CANCELLED") {
    throw new Error("รายการนี้เสร็จสิ้นหรือถูกยกเลิกไปแล้ว ไม่สามารถยกเลิกซ้ำได้");
  }

  const allowed =
    session.role === "admin" ||
    (session.role === "technician" && ticket.technicianId === session.id) ||
    (session.role === "requester" && ticket.requesterId === session.id);
  if (!allowed) {
    throw new Error("คุณไม่มีสิทธิ์ยกเลิกรายการนี้");
  }

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: "CANCELLED",
      cancelReason: trimmedReason,
      cancelledBy: session.name,
      cancelledAt: new Date(),
      history: {
        create: {
          type: "CANCELLED",
          actorId: session.id,
          actorName: session.name,
          note: trimmedReason,
        },
      },
    },
    include: ticketInclude,
  });
  return mapDbTicketToTicket(updated);
}

export async function fetchTicketsAction(): Promise<Ticket[]> {
  await requireSession();
  return getAllTickets();
}

export async function fetchUsersAction(): Promise<User[]> {
  await requireSession();
  return getAllUsers();
}
