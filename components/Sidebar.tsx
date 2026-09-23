"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronsLeft, ChevronsRight, X } from "lucide-react";
import { Role } from "@/lib/types";
import { navByRole } from "@/lib/nav";
import BrandLogo from "@/components/BrandLogo";

interface SidebarProps {
  role: Role;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ role, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "";
  const items = navByRole[role];

  function isActive(item: (typeof items)[number]) {
    return item.match ? item.match(pathname, view) : pathname === item.href.split("?")[0];
  }

  // `iconOnly` only ever applies to the desktop rail — the mobile drawer always shows full
  // labels regardless of the desktop collapsed preference, since it's a separate off-canvas
  // surface with room for them.
  const navList = (iconOnly: boolean, onNavigate?: () => void) => (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      {items.map((item) => {
        const active = isActive(item);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={iconOnly ? item.label : undefined}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
            style={{
              backgroundColor: active ? "var(--brand-primary-soft)" : "transparent",
              color: active ? "var(--brand-primary)" : "var(--text-secondary)",
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.backgroundColor = "var(--surface-1)";
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
            {!iconOnly && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop rail — normal flex item, collapses between icon-only and full width. */}
      <aside
        className="sticky top-0 hidden h-screen shrink-0 flex-col border-r transition-[width] duration-200 md:flex"
        style={{
          width: collapsed ? "72px" : "240px",
          borderColor: "var(--border-hairline)",
          backgroundColor: "var(--surface-2)",
        }}
      >
        <div
          className="flex h-[57px] shrink-0 items-center gap-2 border-b px-4"
          style={{ borderColor: "var(--border-hairline)" }}
        >
          <BrandLogo size={28} />
          {!collapsed && <span className="truncate text-sm font-semibold text-[var(--text-primary)]">m-service</span>}
        </div>
        {navList(collapsed)}
        <div className="border-t p-3" style={{ borderColor: "var(--border-hairline)" }}>
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "ขยายเมนู" : "ย่อเมนู"}
            className="flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-1)]"
            style={{ borderColor: "var(--border-hairline)" }}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" aria-hidden />
            ) : (
              <>
                <ChevronsLeft className="h-4 w-4" aria-hidden />
                ย่อเมนู
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile drawer — off-canvas overlay, independent of the desktop collapsed state. */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onCloseMobile} aria-hidden />
          <aside
            className="animate-fade-in absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col border-r shadow-xl"
            style={{ borderColor: "var(--border-hairline)", backgroundColor: "var(--surface-2)" }}
          >
            <div
              className="flex h-[57px] shrink-0 items-center justify-between gap-2 border-b px-4"
              style={{ borderColor: "var(--border-hairline)" }}
            >
              <div className="flex items-center gap-2">
                <BrandLogo size={28} />
                <span className="text-sm font-semibold text-[var(--text-primary)]">m-service</span>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="ปิดเมนู"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-1)]"
              >
                <X className="h-4.5 w-4.5" aria-hidden />
              </button>
            </div>
            {navList(false, onCloseMobile)}
          </aside>
        </div>
      )}
    </>
  );
}
