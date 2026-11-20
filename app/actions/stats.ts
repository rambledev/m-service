"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface UserStats {
  total: number;
  active24h: number;
  active7d: number;
  newUsers30d: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    throw new Error("เฉพาะผู้ดูแลระบบเท่านั้นที่ดูสถิติผู้ใช้งานได้");
  }
}

/** Usage snapshot for the admin dashboard — rolling windows, not calendar-day buckets. */
export async function getUserStatsAction(): Promise<UserStats> {
  await requireAdmin();
  console.log("[actions/stats][getUserStatsAction] START");
  const now = Date.now();
  const since = (ms: number) => new Date(now - ms);

  const [total, active24h, active7d, newUsers30d] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { lastLoginAt: { gte: since(DAY_MS) } } }),
    prisma.user.count({ where: { lastLoginAt: { gte: since(7 * DAY_MS) } } }),
    prisma.user.count({ where: { createdAt: { gte: since(30 * DAY_MS) } } }),
  ]);

  const stats = { total, active24h, active7d, newUsers30d };
  console.log("[actions/stats][getUserStatsAction] END", stats);
  return stats;
}
