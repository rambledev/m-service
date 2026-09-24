import { Role } from "@/lib/types";

// Sign-in is allowed for any @rmu.ac.th Google account, plus this one non-rmu.ac.th admin
// account as an explicit, deliberate exception. See auth.ts's signIn callback.
const ALLOWED_NON_RMU_EMAILS = new Set(["techodev.2024@gmail.com"]);

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const lower = email.toLowerCase();
  return lower.endsWith("@rmu.ac.th") || ALLOWED_NON_RMU_EMAILS.has(lower);
}

// Pinned roles for a small set of "bootstrap" accounts — re-asserted on every sign-in (see
// auth.ts), so these can't be demoted via the admin "จัดการผู้ใช้งาน" role-assignment UI.
// Everyone else's role lives in the database from here on: a brand-new @rmu.ac.th account
// defaults to "requester" the first time it signs in, and an admin can promote an email to
// "technician" (or beyond) via that same admin UI — see app/actions/users.ts.
export const roleByEmail: Record<string, Role> = {
  "techodev.2024@gmail.com": "admin",
  "sakolsupa.te@rmu.ac.th": "admin",
  "mavin.pu@rmu.ac.th": "admin",
  "cc.claude3@rmu.ac.th": "technician",
};

export function roleForEmail(email: string | null | undefined): Role | undefined {
  return email ? roleByEmail[email.toLowerCase()] : undefined;
}
