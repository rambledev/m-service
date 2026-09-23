import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Ticket } from "@/lib/types";
import { getCategory } from "@/mock/categories";
import { formatLocation, formatThaiDateTime } from "@/lib/ticket-utils";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";

export default function TicketCard({
  ticket,
  href,
}: {
  ticket: Ticket;
  href: string;
}) {
  const category = getCategory(ticket.categoryId);

  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-xl border bg-[var(--surface-2)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
      style={{ borderColor: "var(--border-hairline)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
          style={{ backgroundColor: `color-mix(in srgb, var(${category.colorVar}) 16%, white)` }}
        >
          <span aria-hidden>{category.icon}</span>
        </div>
        <div>
          <p className="text-xs font-mono text-[var(--text-muted)]">{ticket.id}</p>
          <p className="font-medium text-[var(--text-primary)]">{ticket.title}</p>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            {category.label} · {formatLocation(ticket)} · {formatThaiDateTime(ticket.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 self-end sm:self-auto">
        <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
        <ChevronRight
          className="hidden h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 sm:block"
          aria-hidden
        />
      </div>
    </Link>
  );
}
