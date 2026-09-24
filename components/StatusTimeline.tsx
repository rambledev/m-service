import { Check, X } from "lucide-react";
import { Ticket, TicketStatus } from "@/lib/types";
import { formatThaiDateTime, timelineSteps } from "@/lib/ticket-utils";
import { statusIcon } from "@/lib/status-icons";
import ImageGallery from "@/components/ImageGallery";

const statusOrder: TicketStatus[] = ["pending", "accepted", "in_progress", "completed"];

export default function StatusTimeline({ ticket }: { ticket: Ticket }) {
  const reachedIndex =
    ticket.status === "cancelled"
      ? timelineSteps.reduce(
          (acc, step, i) => (ticket.history.some((e) => e.type === step.eventType) ? i : acc),
          0
        )
      : statusOrder.indexOf(ticket.status);

  return (
    <ol className="relative space-y-6 pl-2">
      {timelineSteps.map((step, i) => {
        const event = ticket.history.find((e) => e.type === step.eventType);
        const isDone = i < reachedIndex;
        const isCurrent = i === reachedIndex;
        const isLast = i === timelineSteps.length - 1 && ticket.status !== "cancelled";
        const StepIcon = statusIcon[step.type];

        return (
          <li key={step.type} className="relative flex gap-4 pl-7">
            {!isLast && (
              <span
                className="absolute left-[13px] top-7 h-[calc(100%+0.5rem)] w-px"
                style={{
                  backgroundColor: isDone ? "var(--status-good)" : "var(--gridline)",
                }}
                aria-hidden
              />
            )}
            <span
              className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full"
              style={{
                backgroundColor: isDone
                  ? "var(--status-good)"
                  : isCurrent
                    ? "var(--brand-primary-soft)"
                    : "var(--surface-1)",
                color: isDone ? "#ffffff" : isCurrent ? "var(--brand-primary)" : "var(--text-muted)",
                border: isCurrent ? "2px solid var(--brand-primary)" : "1px solid var(--gridline)",
              }}
              aria-hidden
            >
              {isDone ? (
                <Check className="h-4 w-4" />
              ) : isCurrent ? (
                <StepIcon className="h-3.5 w-3.5" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--gridline)" }} />
              )}
            </span>
            <div className="pb-1">
              <p
                className="font-medium"
                style={{
                  color: isDone || isCurrent ? "var(--text-primary)" : "var(--text-muted)",
                }}
              >
                {step.label}
              </p>
              {event ? (
                <p className="text-sm text-[var(--text-secondary)]">
                  {formatThaiDateTime(event.timestamp)} · โดย {event.actor}
                </p>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">ยังไม่ถึงขั้นตอนนี้</p>
              )}
              {event?.note && (
                <p className="mt-1 rounded-lg bg-[var(--surface-1)] px-3 py-2 text-sm text-[var(--text-secondary)]">
                  หมายเหตุ: {event.note}
                </p>
              )}
              {event?.images && event.images.length > 0 && (
                <div className="mt-2">
                  <ImageGallery images={event.images} thumbClassName="h-16 w-16 object-cover" />
                </div>
              )}
            </div>
          </li>
        );
      })}

      {ticket.status === "cancelled" && (
        <li className="relative flex gap-4 pl-7">
          <span
            className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: "var(--status-critical)" }}
            aria-hidden
          >
            <X className="h-4 w-4" />
          </span>
          <div className="pb-1">
            <p className="font-medium" style={{ color: "var(--status-critical)" }}>
              ยกเลิกรายการ
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              {ticket.cancelledAt && formatThaiDateTime(ticket.cancelledAt)} · โดย{" "}
              {ticket.cancelledBy}
            </p>
            {ticket.cancelReason && (
              <p className="mt-1 rounded-lg bg-[var(--surface-1)] px-3 py-2 text-sm text-[var(--text-secondary)]">
                เหตุผล: {ticket.cancelReason}
              </p>
            )}
          </div>
        </li>
      )}
    </ol>
  );
}
