import {
  BarChart3,
  ClipboardList,
  History,
  Home,
  LucideIcon,
  PlusCircle,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { Role } from "@/lib/types";

export interface NavItem {
  label: string;
  shortLabel: string;
  href: string;
  icon: LucideIcon;
  match?: (pathname: string, search: string) => boolean;
}

// Single source of truth for role-based navigation — used by both TopTabs (desktop)
// and BottomTabBar (mobile) so the two stay in sync.
export const navByRole: Record<Role, NavItem[]> = {
  requester: [
    { label: "แดชบอร์ด", shortLabel: "แดชบอร์ด", href: "/requester/dashboard", icon: Home },
    { label: "แจ้งซ่อมใหม่", shortLabel: "แจ้งซ่อม", href: "/requester/create", icon: PlusCircle },
    {
      label: "รายการแจ้งซ่อมของฉัน",
      shortLabel: "รายการ",
      href: "/requester/tickets?view=active",
      icon: ClipboardList,
      match: (p, s) => p === "/requester/tickets" && s !== "history",
    },
    {
      label: "ประวัติการแจ้งซ่อม",
      shortLabel: "ประวัติ",
      href: "/requester/tickets?view=history",
      icon: History,
      match: (p, s) => p === "/requester/tickets" && s === "history",
    },
  ],
  technician: [
    { label: "แดชบอร์ด", shortLabel: "แดชบอร์ด", href: "/technician/dashboard", icon: Home },
    { label: "งานของฉัน", shortLabel: "งานของฉัน", href: "/technician/jobs", icon: Wrench },
  ],
  admin: [
    { label: "แดชบอร์ด", shortLabel: "แดชบอร์ด", href: "/admin/dashboard", icon: Home },
    { label: "จัดการรายการซ่อม", shortLabel: "รายการซ่อม", href: "/admin/tickets", icon: ClipboardList },
    { label: "สรุปข้อมูล", shortLabel: "สรุปข้อมูล", href: "/admin/summary", icon: TrendingUp },
    { label: "จัดการผู้ใช้งาน", shortLabel: "ผู้ใช้งาน", href: "/admin/users", icon: Users },
    { label: "รายงาน", shortLabel: "รายงาน", href: "/admin/reports", icon: BarChart3 },
  ],
};
