import { Prisma, Role as DbRole, Priority as DbPriority, TicketStatus as DbTicketStatus, TicketEventType as DbTicketEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  CategoryId,
  Priority,
  Role,
  Ticket,
  TicketEvent,
  TicketEventType,
  TicketImage,
  TicketStatus,
  User,
} from "@/lib/types";

export const roleFromDb: Record<DbRole, Role> = {
  REQUESTER: "requester",
  TECHNICIAN: "technician",
  ADMIN: "admin",
};

const priorityFromDb: Record<DbPriority, Priority> = {
  NORMAL: "normal",
  URGENT: "urgent",
  CRITICAL: "critical",
};

const statusFromDb: Record<DbTicketStatus, TicketStatus> = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const eventTypeFromDb: Record<DbTicketEventType, TicketEventType> = {
  CREATED: "created",
  ACCEPTED: "accepted",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ASSIGNED: "assigned",
  NOTE: "note",
};

// Reverse (TS -> DB) maps — used by app/actions/tickets.ts when writing.
export const roleToDb: Record<Role, DbRole> = {
  requester: "REQUESTER",
  technician: "TECHNICIAN",
  admin: "ADMIN",
};

export const priorityToDb: Record<Priority, DbPriority> = {
  normal: "NORMAL",
  urgent: "URGENT",
  critical: "CRITICAL",
};

export const statusToDb: Record<TicketStatus, DbTicketStatus> = {
  pending: "PENDING",
  accepted: "ACCEPTED",
  in_progress: "IN_PROGRESS",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
};

export const eventTypeToDb: Record<TicketEventType, DbTicketEventType> = {
  created: "CREATED",
  accepted: "ACCEPTED",
  in_progress: "IN_PROGRESS",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
  assigned: "ASSIGNED",
  note: "NOTE",
};

export const ticketInclude = {
  images: true,
  history: { orderBy: { timestamp: "asc" } },
} satisfies Prisma.TicketInclude;

type DbTicket = Prisma.TicketGetPayload<{ include: typeof ticketInclude }>;

function toTicketImage(img: { name: string; url: string }): TicketImage {
  return { name: img.name, url: img.url };
}

export function mapDbTicketToTicket(t: DbTicket): Ticket {
  const attachedImages = t.images.filter((i) => i.kind === "ATTACHED").map(toTicketImage);

  const history: TicketEvent[] = t.history.map((e) => {
    const eventImages = t.images.filter((i) => i.eventId === e.id).map(toTicketImage);
    return {
      id: e.id,
      type: eventTypeFromDb[e.type],
      timestamp: e.timestamp.toISOString(),
      actor: e.actorName,
      note: e.note ?? undefined,
      images: eventImages.length > 0 ? eventImages : undefined,
    };
  });

  const completedEvent = t.history.find((e) => e.type === "COMPLETED");
  const repairImages = completedEvent
    ? t.images.filter((i) => i.eventId === completedEvent.id).map(toTicketImage)
    : undefined;

  return {
    id: t.id,
    title: t.title,
    requesterId: t.requesterId ?? undefined,
    requesterName: t.requesterName,
    department: t.department,
    phone: t.phone,
    categoryId: t.categoryId as CategoryId,
    building: t.building,
    floor: t.floor,
    room: t.room,
    detail: t.detail,
    priority: priorityFromDb[t.priority],
    images: attachedImages,
    status: statusFromDb[t.status],
    technicianId: t.technicianId ?? undefined,
    technicianName: t.technicianName ?? undefined,
    repairNote: t.repairNote ?? undefined,
    repairImages,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    history,
    cancelReason: t.cancelReason ?? undefined,
    cancelledBy: t.cancelledBy ?? undefined,
    cancelledAt: t.cancelledAt?.toISOString(),
  };
}

export function mapDbUserToUser(u: {
  id: string;
  name: string;
  role: DbRole;
  department: string | null;
  phone: string | null;
  expertise: string[];
}): User {
  return {
    id: u.id,
    name: u.name,
    role: roleFromDb[u.role],
    department: u.department ?? undefined,
    phone: u.phone ?? undefined,
    email: u.id,
    expertise: u.expertise.length > 0 ? u.expertise : undefined,
  };
}

export async function getAllTickets(): Promise<Ticket[]> {
  const tickets = await prisma.ticket.findMany({
    include: ticketInclude,
    orderBy: { createdAt: "desc" },
  });
  return tickets.map(mapDbTicketToTicket);
}

export async function getAllUsers(): Promise<User[]> {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return users.map(mapDbUserToUser);
}
