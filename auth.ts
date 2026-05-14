import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

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
export const { handlers, signIn, signOut, auth } = NextAuth({
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
});
