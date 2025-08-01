// src/types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    backendJwt?: string;
    firstName?: string;
    lastName?: string;
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    verified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendJwt?: string;
    firstName?: string;
    lastName?: string;
  }
}
