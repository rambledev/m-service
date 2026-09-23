import { User } from "@/lib/types";
import { roleByEmail } from "@/lib/roles";

// Real accounts, no fictional personas. `name` falls back to the email itself until that
// person actually signs in with Google at least once — context/AppContext.tsx then upserts
// their real Google display name into localStorage so it sticks for everyone from then on
// (see the "known users" sync in AppProvider).
export const initialUsers: User[] = Object.entries(roleByEmail).map(([email, role]) => ({
  id: email,
  name: email,
  role,
  email,
}));

export function getUserById(users: User[], id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function getTechnicians(users: User[] = initialUsers): User[] {
  return users.filter((u) => u.role === "technician");
}
