"use client";

import { Pencil, UserPlus } from "lucide-react";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import { useApp } from "@/context/AppContext";
import { Role } from "@/lib/types";

const roleLabel: Record<Role, string> = {
  requester: "ผู้แจ้งซ่อม",
  technician: "ช่างซ่อม",
  admin: "Admin",
};

const roleColorVar: Record<Role, string> = {
  requester: "--status-accepted",
  technician: "--status-progress",
  admin: "--brand-primary",
};

export default function AdminUsersPage() {
  const { users } = useApp();

  return (
    <AppShell role="admin" title="จัดการผู้ใช้งาน">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--text-secondary)]">
            บัญชี Google ที่ได้รับอนุญาตให้เข้าใช้งานระบบ ทั้งหมด {users.length} คน
          </p>
          <Button icon={UserPlus}>เพิ่มผู้ใช้งาน</Button>
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          ชื่อจะอัปเดตเป็นชื่อจริงอัตโนมัติเมื่อบัญชีนั้นเข้าสู่ระบบครั้งแรก
          การเพิ่ม/ถอดสิทธิ์บัญชีต้องแก้ไขที่ <code>lib/roles.ts</code>
        </p>

        <div
          className="overflow-hidden rounded-2xl border bg-[var(--surface-2)] shadow-sm"
          style={{ borderColor: "var(--border-hairline)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr
                  className="border-b text-[var(--text-muted)]"
                  style={{ borderColor: "var(--border-hairline)", backgroundColor: "var(--surface-1)" }}
                >
                  <th className="px-4 py-3 font-medium">ชื่อ</th>
                  <th className="px-4 py-3 font-medium">บทบาท</th>
                  <th className="px-4 py-3 font-medium">อีเมล</th>
                  <th className="px-4 py-3 font-medium">เบอร์โทร</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b transition-colors last:border-0 hover:bg-[var(--surface-1)]"
                    style={{ borderColor: "var(--border-hairline)" }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: `var(${roleColorVar[u.role]})` }}
                        >
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[var(--text-primary)]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{
                          color: `var(${roleColorVar[u.role]})`,
                          backgroundColor: `color-mix(in srgb, var(${roleColorVar[u.role]}) 12%, white)`,
                        }}
                      >
                        {roleLabel[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{u.email ?? "-"}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{u.phone ?? "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-75"
                        style={{ color: "var(--brand-primary)" }}
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        แก้ไข
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
