import { Role } from "@/lib/types";

// The only accounts allowed to sign in (see auth.ts's signIn callback) — every other Google
// account is rejected. Role is fixed per email; there is no self-service role picker.
// Kept dependency-free (no next-auth import) so both auth.ts (server) and mock/users.ts
// (imported by client components) can share this single source of truth.
export const roleByEmail: Record<string, Role> = {
  "techodev.2024@gmail.com": "admin",
  "sakolsupa.te@rmu.ac.th": "admin",
  "marvin.pu@rmu.ac.th": "admin",
  "techo@rmu.ac.th": "requester",
  "cc.claude3@rmu.ac.th": "technician",
};

export function roleForEmail(email: string | null | undefined): Role | undefined {
  return email ? roleByEmail[email.toLowerCase()] : undefined;
}
