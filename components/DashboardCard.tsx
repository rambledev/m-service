import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  accentVar?: string;
  hint?: string;
}

export default function DashboardCard({
  label,
  value,
  icon: Icon,
  accentVar = "--brand-primary",
  hint,
}: DashboardCardProps) {
  return (
    <div
      className="rounded-2xl border bg-[var(--surface-2)] p-5 shadow-sm transition-shadow hover:shadow-md"
      style={{ borderColor: "var(--border-hairline)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">{label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--text-primary)]">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-[var(--text-muted)]">{hint}</p>}
        </div>
        {Icon && (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `color-mix(in srgb, var(${accentVar}) 14%, white)`,
              color: `var(${accentVar})`,
            }}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </div>
        )}
      </div>
    </div>
  );
}
