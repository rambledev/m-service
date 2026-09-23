import type { DefaultSession } from "next-auth";
import { Role } from "@/lib/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: Role;
    } & DefaultSession["user"];
  }
}

// `next-auth/jwt` re-exports its JWT interface from "@auth/core/jwt" (`export * from ...`) —
// augmenting the re-exporting module doesn't merge onto the original declaration, so this
// targets the module where JWT is actually declared instead.
declare module "@auth/core/jwt" {
  interface JWT {
    role?: Role;
  }
}
