import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    backendJwt?: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      roles: string[];
      verified: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    verified: boolean;
    token: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendJwt?: string;
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    verified: boolean;
  }
}
