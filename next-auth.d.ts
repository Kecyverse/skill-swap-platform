// File: next-auth.d.ts

import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extends the default session user to include the `id`.
   */
  interface Session {
    user: {
      /** The user's database id. */
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /**
   * Extends the default JWT token to include the `id`.
   */
  interface JWT {
    /** The user's database id. */
    id: string;
  }
}