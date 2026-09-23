"use client";

import { ReactNode, Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Role } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import TopTabs from "@/components/TopTabs";
import BottomTabBar from "@/components/BottomTabBar";
import Sidebar from "@/components/Sidebar";
import BrandLogo from "@/components/BrandLogo";

const SIDEBAR_COLLAPSED_KEY = "mservice_admin_sidebar_collapsed_v1";

export default function AppShell({
  role,
  title,
  children,
}: {
  role: Role;
  title: string;
  children: ReactNode;
}) {
  const { currentUser, isHydrated } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && (!currentUser || currentUser.role !== role)) {
      router.replace("/login");
    }
  }, [isHydrated, currentUser, role, router]);

  if (!isHydrated || !currentUser || currentUser.role !== role) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--page-plane)]">
        <BrandLogo size={48} />
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--brand-primary)" }} aria-hidden />
        <p className="text-sm text-[var(--text-muted)]">กำลังโหลด...</p>
      </div>
    );
  }

  if (role === "admin") {
    return (
      <AdminShell role={role} title={title}>
        {children}
      </AdminShell>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--page-plane)]">
      <div className="sticky top-0 z-10">
        <Header role={role} title={title} />
        <Suspense fallback={null}>
          <TopTabs role={role} />
        </Suspense>
      </div>
      <main className="flex-1 px-4 py-6 pb-24 sm:px-6 md:pb-6">{children}</main>
      <Suspense fallback={null}>
        <BottomTabBar role={role} />
      </Suspense>
    </div>
  );
}

// Sidebar-based layout — admin only. Collapsed state (desktop icon-only rail) persists across
// page navigation via localStorage since each admin page mounts its own AppShell/Sidebar
// instance (no shared app/admin/layout.tsx). Mobile drawer state is intentionally NOT persisted
// (always starts closed), matching normal off-canvas drawer behavior.
function AdminShell({ role, title, children }: { role: Role; title: string; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch (error) {
        console.error("[AdminShell][toggleCollapse] ERROR", { error });
      }
      return next;
    });
  }

  return (
    <div className="flex min-h-screen bg-[var(--page-plane)]">
      <Suspense fallback={null}>
        <Sidebar
          role={role}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-10">
          <Header role={role} title={title} onMenuClick={() => setMobileOpen(true)} />
        </div>
        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
