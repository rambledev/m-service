"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { mapDbUserToUser, roleToDb } from "@/lib/data/tickets";
import { isAllowedEmail, roleByEmail } from "@/lib/roles";
import { Role, User } from "@/lib/types";

async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    throw new Error("เฉพาะผู้ดูแลระบบเท่านั้นที่ดำเนินการนี้ได้");
  }
}

// Lets an admin pre-provision or change the role of any @rmu.ac.th email from the "จัดการ
// ผู้ใช้งาน" page — including an email that has never signed in yet (its User row is created
// here with a placeholder name that gets overwritten with the real Google display name on
// that person's first sign-in, same as any other account).
export async function setUserRoleAction(email: string, role: Role): Promise<User> {
  await requireAdmin();

  const normalized = email.trim().toLowerCase();
  if (!normalized) throw new Error("กรุณาระบุอีเมล");
  if (!isAllowedEmail(normalized)) {
    throw new Error("อนุญาตเฉพาะอีเมล @rmu.ac.th เท่านั้น");
  }
  if (roleByEmail[normalized]) {
    throw new Error("บัญชีนี้กำหนดสิทธิ์ไว้ตายตัวใน lib/roles.ts ไม่สามารถแก้ไขผ่านหน้านี้ได้");
  }

  console.log("[actions/users][setUserRoleAction]", { email: normalized, role });
  const updated = await prisma.user.upsert({
    where: { id: normalized },
    create: { id: normalized, name: normalized, role: roleToDb[role] },
    update: { role: roleToDb[role] },
  });
  return mapDbUserToUser(updated);
}
