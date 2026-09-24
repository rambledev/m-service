import { User } from "@/lib/types";
import { roleByEmail } from "@/lib/roles";

// Bootstrap accounts for prisma/seed.ts (see lib/roles.ts) — every other account is created on
// its own first sign-in (auth.ts's signIn callback). `name` falls back to the email itself
// until that person actually signs in with Google, at which point their real Google display
// name gets written to the database and this placeholder no longer applies.
export const initialUsers: User[] = Object.entries(roleByEmail).map(([email, role]) => ({
  id: email,
  name: email,
  role,
  email,
}));
