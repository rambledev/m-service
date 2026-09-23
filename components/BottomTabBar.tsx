"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Role } from "@/lib/types";
import { navByRole } from "@/lib/nav";

export default function BottomTabBar({ role }: { role: Role }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "";
  const items = navByRole[role];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex border-t bg-[var(--surface-2)] md:hidden"
      style={{
        borderColor: "var(--border-hairline)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {items.map((item) => {
        const active = item.match
          ? item.match(pathname, view)
          : pathname === item.href.split("?")[0];
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium"
            style={{ color: active ? "var(--brand-primary)" : "var(--text-muted)" }}
          >
            <Icon className="h-5 w-5" aria-hidden />
            <span className="max-w-full truncate px-1">{item.shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
