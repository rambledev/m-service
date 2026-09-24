"use client";

import { useState } from "react";
import { AlertCircle, Pencil, UserPlus, X } from "lucide-react";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import { useApp } from "@/context/AppContext";
import { roleByEmail } from "@/lib/roles";
import { Role, User } from "@/lib/types";

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

const isPinned = (email: string) => !!roleByEmail[email.toLowerCase()];

function AddTechnicianForm() {
  const { setUserRole } = useApp();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!email.trim()) {
      setError("กรุณาระบุอีเมล");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await setUserRole(email.trim(), "technician");
      setEmail("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เพิ่มช่างซ่อมไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <Button icon={UserPlus} onClick={() => setOpen(true)}>
        เพิ่มช่างซ่อม
      </Button>
    );
  }

  return (
    <div
      className="flex flex-col gap-2 rounded-xl border bg-[var(--surface-2)] p-3 shadow-sm sm:flex-row sm:items-start"
      style={{ borderColor: "var(--border-hairline)" }}
    >
      <div className="flex-1">
        <input
          type="email"
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--brand-primary)]"
          style={{ borderColor: "var(--border-hairline)" }}
          placeholder="เช่น name.sur@rmu.ac.th"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          autoFocus
        />
        {error && (
          <p className="mt-1.5 flex items-center gap-1 text-xs" style={{ color: "var(--status-critical)" }}>
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {error}
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        <Button size="sm" loading={submitting} onClick={handleSubmit}>
          กำหนดเป็นช่างซ่อม
        </Button>
        <Button
          size="sm"
          variant="secondary"
          icon={X}
          onClick={() => {
            setOpen(false);
            setError("");
            setEmail("");
          }}
          disabled={submitting}
        >
          ยกเลิก
        </Button>
      </div>
    </div>
  );
}

function EditRoleModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { setUserRole } = useApp();
  const [role, setRole] = useState<Role>(user.role);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setSubmitting(true);
    setError("");
    try {
      await setUserRole(user.id, role);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เปลี่ยนบทบาทไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="animate-scale-in w-full max-w-sm rounded-2xl bg-[var(--surface-2)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">เปลี่ยนบทบาท</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{user.email ?? user.name}</p>
        <select
          className="mt-4 w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-primary)]"
          style={{ borderColor: "var(--border-hairline)" }}
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          disabled={submitting}
        >
          <option value="requester">ผู้แจ้งซ่อม</option>
          <option value="technician">ช่างซ่อม</option>
          <option value="admin">Admin</option>
        </select>
        {error && (
          <p className="mt-2 text-sm" style={{ color: "var(--status-critical)" }}>
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            ปิด
          </Button>
          <Button loading={submitting} onClick={handleConfirm}>
            บันทึก
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const { users } = useApp();
  const [editingUser, setEditingUser] = useState<User | null>(null);

  return (
    <AppShell role="admin" title="จัดการผู้ใช้งาน">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--text-secondary)]">
            บัญชี @rmu.ac.th ที่เคยเข้าสู่ระบบหรือถูกกำหนดสิทธิ์ไว้ ทั้งหมด {users.length} คน
          </p>
          <AddTechnicianForm />
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          บัญชี @rmu.ac.th ใดๆ เข้าสู่ระบบได้ทันทีและเริ่มต้นเป็น &quot;ผู้แจ้งซ่อม&quot; เสมอ —
          แอดมินกำหนดบทบาทอื่นได้จากหน้านี้ ชื่อจะอัปเดตเป็นชื่อจริงอัตโนมัติเมื่อบัญชีนั้นเข้าสู่ระบบครั้งแรก
          บัญชีที่กำหนดสิทธิ์ตายตัวไว้ใน <code>lib/roles.ts</code> จะแก้ไขจากหน้านี้ไม่ได้
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
                      {isPinned(u.id) ? (
                        <span className="text-xs text-[var(--text-muted)]">กำหนดตายตัว</span>
                      ) : (
                        <button
                          onClick={() => setEditingUser(u)}
                          className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-75"
                          style={{ color: "var(--brand-primary)" }}
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                          แก้ไข
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingUser && <EditRoleModal user={editingUser} onClose={() => setEditingUser(null)} />}
    </AppShell>
  );
}
