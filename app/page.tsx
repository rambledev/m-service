"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

const roleHome: Record<string, string> = {
  requester: "/requester/dashboard",
  technician: "/technician/dashboard",
  admin: "/admin/dashboard",
};

export default function Home() {
  const { currentUser, isHydrated } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    router.replace(currentUser ? roleHome[currentUser.role] : "/login");
  }, [isHydrated, currentUser, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--page-plane)]">
      <p className="text-sm text-[var(--text-muted)]">กำลังโหลด...</p>
    </div>
  );
}
