"use client";

import { ChevronRight } from "lucide-react";
import { DimensionRow } from "@/lib/summary-data";

export default function DimensionBreakdown({
  title,
  rows,
  onSelect,
}: {
  title: string;
  rows: DimensionRow[];
  onSelect: (row: DimensionRow) => void;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div
      className="rounded-2xl border bg-[var(--surface-2)] p-5 shadow-sm"
      style={{ borderColor: "var(--border-hairline)" }}
    >
      <h2 className="mb-4 text-sm font-semibold text-[var(--text-secondary)]">{title}</h2>
      <div className="flex flex-col gap-1">
        {rows.map((row) => (
          <button
            key={row.key}
            type="button"
            onClick={() => onSelect(row)}
            disabled={row.count === 0}
            className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-left transition hover:bg-[var(--surface-1)] disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <span className="w-32 shrink-0 truncate text-sm text-[var(--text-secondary)]" title={row.label}>
              {row.icon && <span aria-hidden>{row.icon} </span>}
              {row.label}
            </span>
            <div className="relative h-6 flex-1 rounded-full bg-[var(--surface-1)]">
              <div
                className="h-6 rounded-full transition-all"
                style={{
                  width: `${(row.count / max) * 100}%`,
                  backgroundColor: row.colorVar ? `var(${row.colorVar})` : "var(--brand-primary)",
                  minWidth: row.count > 0 ? "1.5rem" : 0,
                }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums">{row.count}</span>
            <ChevronRight
              className="h-4 w-4 shrink-0"
              style={{ color: row.count > 0 ? "var(--text-muted)" : "transparent" }}
              aria-hidden
            />
          </button>
        ))}
      </div>
    </div>
  );
}
