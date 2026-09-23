"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Role } from "@/lib/types";
import { navByRole } from "@/lib/nav";

export default function TopTabs({ role }: { role: Role }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "";
  const items = navByRole[role];

  return (
    <nav
      className="hidden border-b bg-[var(--surface-2)] md:block"
      style={{ borderColor: "var(--border-hairline)" }}
    >
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
        {items.map((item) => {
          const active = item.match
            ? item.match(pathname, view)
            : pathname === item.href.split("?")[0];
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors"
              style={{
                borderColor: active ? "var(--brand-primary)" : "transparent",
                color: active ? "var(--brand-primary)" : "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
