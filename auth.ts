import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isBlocked, recordAttempt } from "@/lib/blocklist";

/**
 * Auth.js v5 setup. Google is the only provider — sharing a build requires a
 * Google identity. JWT-based session means no DB needed; the session cookie
 * carries everything we use server-side (name, email, image).
 *
 * Required env vars:
 *   AUTH_SECRET         (any 32+ random chars)
 *   AUTH_GOOGLE_ID      (OAuth client ID)
 *   AUTH_GOOGLE_SECRET  (OAuth client secret)
 *
 * In dev, AUTH_URL defaults to http://localhost:3000.
 */
const nextAuth = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  trustHost: true,
  pages: {
    signIn: "/submit",
  },
  callbacks: {
    /**
     * Blocked emails never get a session. Returning a path (rather than false)
     * routes them to /banned instead of the generic Auth.js error page. The
     * attempt is recorded on their moderation record so organizers see repeats.
     */
    async signIn({ user }) {
      if (await isBlocked(user?.email)) {
        console.warn(`[auth] blocked sign-in attempt: ${user?.email}`);
        await recordAttempt(user?.email);
        return "/banned";
      }
      return true;
    },
  },
});

export const { handlers, signIn, signOut } = nextAuth;

export const auth: typeof nextAuth.auth = (async (...args: Parameters<typeof nextAuth.auth>) => {
  const session = await (nextAuth.auth as Function)(...args);
  if (session?.user?.email) return session;
  if (process.env.NODE_ENV !== "production" && !process.env.AUTH_GOOGLE_ID) {
    return {
      user: {
        name: "Christina Lin",
        email: "organizer@gdgboston.dev",
        image: null,
      },
      expires: "2099-01-01T00:00:00.000Z",
    };
  }
  return session;
}) as typeof nextAuth.auth;

