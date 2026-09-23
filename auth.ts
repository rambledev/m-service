import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { roleForEmail } from "@/lib/roles";

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
      const role = roleForEmail(user.email);
      console.log("[auth][signIn]", { email: user.email, allowed: !!role });
      return !!role;
    },
    async jwt({ token }) {
      if (token.email) {
        token.role = roleForEmail(token.email);
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
