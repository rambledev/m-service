import { TicketStatus } from "@/lib/types";
import { statusMeta } from "@/lib/ticket-utils";
import { statusIcon } from "@/lib/status-icons";

export default function StatusBadge({ status }: { status: TicketStatus }) {
  const meta = statusMeta[status];
  const Icon = statusIcon[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{
        color: `var(${meta.colorVar})`,
        borderColor: "var(--border-hairline)",
        backgroundColor: "var(--surface-2)",
      }}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {meta.label}
    </span>
  );
}
