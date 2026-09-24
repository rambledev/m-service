import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isAllowedEmail, roleForEmail } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { roleFromDb, roleToDb } from "@/lib/data/tickets";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  // Self-hosted behind a reverse proxy (Docker/production, not Vercel) — Auth.js otherwise
  // rejects the request's Host header as untrusted. See AUTH_URL in .env for the production domain.
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase();
      const allowed = isAllowedEmail(email);
      console.log("[auth][signIn]", { email, allowed });
      if (!email || !allowed) return false;

      // Guarantees a real User row exists (id = email) before any ticket ever references it as
      // requesterId/technicianId — without this, a brand-new account's first "แจ้งซ่อมใหม่" would
      // fail its foreign key constraint.
      const name = user.name ?? email;
      const pinnedRole = roleForEmail(email);

      if (pinnedRole) {
        // A small set of "bootstrap" accounts (lib/roles.ts) — role is re-asserted on every
        // sign-in so it can't be changed via the admin role-assignment UI.
        await prisma.user.upsert({
          where: { id: email },
          create: { id: email, name, role: roleToDb[pinnedRole] },
          update: { name, role: roleToDb[pinnedRole] },
        });
      } else {
        // Any other @rmu.ac.th account: default to "requester" the first time it signs in.
        // `update` deliberately omits `role` — an admin may have already promoted this email
        // to technician via the admin UI (app/actions/users.ts) before its first sign-in, and
        // a later sign-in must not silently reset that back to requester.
        await prisma.user.upsert({
          where: { id: email },
          create: { id: email, name, role: "REQUESTER" },
          update: { name },
        });
      }

      return true;
    },
    async jwt({ token }) {
      if (token.email) {
        // Re-read from the database on every request (not just sign-in) so a role an admin
        // just changed takes effect without forcing the affected person to sign out and back
        // in — acceptable extra DB load at this app's scale. A failed lookup (e.g. a transient
        // DB blip) must not throw here: an uncaught error in this callback turns into a
        // JWTSessionError that invalidates the session entirely, signing everyone out on a
        // hiccup that has nothing to do with them — falling back to whatever role the token
        // already carried keeps the session alive and just skips this one refresh.
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.email },
            select: { role: true },
          });
          token.role = dbUser ? roleFromDb[dbUser.role] : roleForEmail(token.email);
        } catch (error) {
          console.error("[auth][jwt] ERROR reading role from database, keeping cached role", {
            email: token.email,
            error,
          });
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        // No separate internal user id exists for real accounts — the verified email is
        // already unique and stable, so it doubles as this app's User.id.
        session.user.id = token.email ?? session.user.email ?? "";
      }
      return session;
    },
  },
});
