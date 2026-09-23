// Seed script — inserts the same demo data the running prototype uses (mock/*.ts),
// so a database-backed run reproduces the exact same Demo Flow / dashboard numbers.
// Run with: npm run db:seed  (or: npx prisma db seed)

import { PrismaClient, Prisma } from "@prisma/client";
import { categories } from "../mock/categories";
import { initialUsers } from "../mock/users";
import { buildInitialTickets } from "../mock/tickets";
import type { Priority, Role, TicketEventType, TicketStatus } from "../lib/types";

const prisma = new PrismaClient();

const roleMap: Record<Role, Prisma.UserCreateInput["role"]> = {
  requester: "REQUESTER",
  technician: "TECHNICIAN",
  admin: "ADMIN",
};

const priorityMap: Record<Priority, Prisma.TicketCreateInput["priority"]> = {
  normal: "NORMAL",
  urgent: "URGENT",
  critical: "CRITICAL",
};

const statusMap: Record<TicketStatus, Prisma.TicketCreateInput["status"]> = {
  pending: "PENDING",
  accepted: "ACCEPTED",
  in_progress: "IN_PROGRESS",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
};

const eventTypeMap: Record<TicketEventType, Prisma.TicketEventCreateInput["type"]> = {
  created: "CREATED",
  accepted: "ACCEPTED",
  in_progress: "IN_PROGRESS",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
  assigned: "ASSIGNED",
  note: "NOTE",
};

// Ticket ids are formatted "MS-{year}-{seq:05d}" by lib/ticket-utils.ts#generateTicketId —
// recover the numeric seq from it so the DB's `seq` column stays in sync.
function seqFromTicketId(id: string): number {
  const match = id.match(/(\d+)$/);
  if (!match) throw new Error(`Cannot parse seq from ticket id: ${id}`);
  return Number(match[1]);
}

async function main() {
  console.log("[seed] categories...");
  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      create: category,
      update: category,
    });
  }

  console.log("[seed] users...");
  for (const user of initialUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        name: user.name,
        role: roleMap[user.role],
        department: user.department,
        phone: user.phone,
        expertise: user.expertise ?? [],
      },
      update: {
        name: user.name,
        role: roleMap[user.role],
        department: user.department,
        phone: user.phone,
        expertise: user.expertise ?? [],
      },
    });
  }

  // Ticket history events store the actor's display name only (matching lib/types.ts#TicketEvent).
  // Resolve actorId by name where it matches a seeded user, so the relation is populated
  // wherever possible while still preserving the name snapshot either way.
  const userIdByName = new Map(initialUsers.map((u) => [u.name, u.id]));
  const validUserIds = new Set(initialUsers.map((u) => u.id));

  console.log("[seed] tickets...");
  const tickets = buildInitialTickets();
  let maxSeq = 0;

  for (const ticket of tickets) {
    const seq = seqFromTicketId(ticket.id);
    maxSeq = Math.max(maxSeq, seq);

    // Shared scalar fields for both branches of the upsert, so create/update never drift.
    const fields = {
      seq,
      title: ticket.title,
      requesterId: userIdByName.get(ticket.requesterName) ?? null,
      requesterName: ticket.requesterName,
      department: ticket.department,
      phone: ticket.phone,
      categoryId: ticket.categoryId,
      building: ticket.building,
      floor: ticket.floor,
      room: ticket.room,
      detail: ticket.detail,
      priority: priorityMap[ticket.priority],
      status: statusMap[ticket.status],
      technicianId: ticket.technicianId && validUserIds.has(ticket.technicianId) ? ticket.technicianId : null,
      technicianName: ticket.technicianName ?? null,
      repairNote: ticket.repairNote ?? null,
      createdAt: new Date(ticket.createdAt),
      updatedAt: new Date(ticket.updatedAt),
      cancelReason: ticket.cancelReason ?? null,
      cancelledBy: ticket.cancelledBy ?? null,
      cancelledAt: ticket.cancelledAt ? new Date(ticket.cancelledAt) : null,
    };

    const images = ticket.images.map((img) => ({ name: img.name, url: img.url }));
    const history = ticket.history.map((event) => ({
      type: eventTypeMap[event.type],
      timestamp: new Date(event.timestamp),
      actorId: userIdByName.get(event.actor) ?? null,
      actorName: event.actor,
      note: event.note ?? null,
    }));

    await prisma.ticket.upsert({
      where: { id: ticket.id },
      create: {
        id: ticket.id,
        ...fields,
        images: { create: images },
        history: { create: history },
      },
      // On re-run, sync every field and replace nested rows instead of duplicating them.
      update: {
        ...fields,
        images: { deleteMany: {}, create: images },
        history: { deleteMany: {}, create: history },
      },
    });
  }

  // `seq` is a plain app-managed integer (mirroring the client-side `nextSeq` counter in
  // context/AppContext.tsx today), not a DB autoincrement — once ticket creation is wired
  // to Prisma, compute the next value as `tx.ticket.aggregate({ _max: { seq: true } })`
  // inside a transaction.
  console.log(
    `[seed] done: ${categories.length} categories, ${initialUsers.length} users, ${tickets.length} tickets (max seq: ${maxSeq})`
  );
}

main()
  .catch((error) => {
    console.error("[seed] failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
