"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { Role } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import Button from "@/components/Button";
import BrandLogo from "@/components/BrandLogo";

const roleLabel: Record<Role, string> = {
  requester: "ผู้แจ้งซ่อม",
  technician: "ช่างซ่อม",
  admin: "ผู้ดูแลระบบ",
};

export default function Header({
  role,
  title,
  onMenuClick,
}: {
  role: Role;
  title: string;
  onMenuClick?: () => void;
}) {
  const router = useRouter();
  const { currentUser, logout } = useApp();

  return (
    <header
      className="flex items-center justify-between gap-3 border-b bg-[var(--surface-2)]/95 px-4 py-3 backdrop-blur sm:px-6"
      style={{ borderColor: "var(--border-hairline)" }}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="เปิดเมนู"
            className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-1)] md:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        )}
        <BrandLogo size={32} />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-[var(--text-primary)]">{title}</h1>
          <p className="text-xs leading-tight text-[var(--text-muted)] sm:hidden">
            {roleLabel[role]}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-[var(--text-primary)]">{currentUser?.name}</p>
          <p className="text-xs text-[var(--text-muted)]">{roleLabel[role]}</p>
        </div>
        <div
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white sm:flex"
          style={{ backgroundColor: "var(--brand-primary)" }}
          aria-hidden
        >
          {currentUser?.name?.charAt(0) ?? "?"}
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={LogOut}
          aria-label="ออกจากระบบ"
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          <span className="hidden sm:inline">ออกจากระบบ</span>
        </Button>
      </div>
    </header>
  );
}
