import { Ticket } from "@/lib/types";
import { getCategory } from "@/mock/categories";
import { priorityMeta } from "@/lib/ticket-utils";

// Fire-and-forget: notifying technicians is a background side effect of creating a ticket,
// not something the requester's flow should block or fail on. Errors are logged, not thrown.
export async function notifyTechniciansOfNewTicket(ticket: Ticket): Promise<void> {
  console.log("[notify][notifyTechniciansOfNewTicket] START", { ticketId: ticket.id });
  try {
    const res = await fetch("/api/notify-technicians", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticketId: ticket.id,
        title: ticket.title,
        categoryLabel: getCategory(ticket.categoryId).label,
        priorityLabel: priorityMeta[ticket.priority].label,
        building: ticket.building,
        floor: ticket.floor,
        room: ticket.room,
        detail: ticket.detail,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      console.error("[notify][notifyTechniciansOfNewTicket] ERROR", {
        ticketId: ticket.id,
        message: data.message,
      });
      return;
    }
    console.log("[notify][notifyTechniciansOfNewTicket] END", {
      ticketId: ticket.id,
      recipientCount: data.recipientCount,
    });
  } catch (error) {
    console.error("[notify][notifyTechniciansOfNewTicket] ERROR", { ticketId: ticket.id, error });
  }
}
