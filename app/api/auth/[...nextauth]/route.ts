// File: app/api/auth/[...nextauth]/route.ts

import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing Google OAuth credentials");
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
  ],
  // --- THIS IS THE KEY CHANGE ---
  // Explicitly use the JWT strategy for sessions.
  session: {
    strategy: "jwt",
  },
  // -----------------------------
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    // 1. JWT callback: Runs first.
    // This is where we add the user's database ID to the token.
    jwt({ token, user }) {
      if (user) {
        // On initial sign-in, the `user` object is available.
        token.id = user.id;
      }
      console.log("JWT CALLBACK - Token:", token); // For debugging
      return token;
    },
    // 2. Session callback: Runs second.
    // This is where we add the ID from the token to the final session object.
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      console.log("SESSION CALLBACK - Session:", session); // For debugging
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };