import { Priority } from "@/lib/types";
import { priorityMeta } from "@/lib/ticket-utils";
import { priorityIcon } from "@/lib/status-icons";

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = priorityMeta[priority];
  const Icon = priorityIcon[priority];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        color: `var(${meta.colorVar})`,
        backgroundColor: "var(--surface-2)",
        border: "1px solid var(--border-hairline)",
      }}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {meta.label}
    </span>
  );
}
