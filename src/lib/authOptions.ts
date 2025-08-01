// src/lib/authOptions.ts
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Account, Profile, Session } from "next-auth";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: { scope: "openid email profile" },
      },
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: { scope: "openid email profile" },
      },
    }),
    CredentialsProvider({
      name: "Email y Contraseña",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch("http://localhost:8080/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText);
        }

        const user = await res.json();

        if (user && user.verified) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } else {
          throw new Error("Usuario no verificado");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account, profile }: {
      token: JWT;
      account?: Account | null;
      profile?: Profile;
    }): Promise<JWT> {
      if (account && profile) {
        const fullName = profile.name || "";
        const first = (profile as any).given_name || fullName.split(" ")[0] || "Usuario";
        const last = (profile as any).family_name || fullName.split(" ").slice(1).join(" ") || "OAuth";

        token.firstName = first;
        token.lastName = last;

        const idToken = account.id_token;
        const provider = account.provider;

        try {
          const res = await fetch("http://localhost:8080/api/oauth2/callback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: profile.email,
              firstName: first,
              lastName: last,
              provider: provider,
              idToken: idToken
            }),
          });

          if (!res.ok) {
            console.error("Backend error:", await res.text());
            throw new Error("OAuth callback failed");
          }

          const tokenString = await res.text();
          token.backendJwt = tokenString;

        } catch (err) {
          console.error("OAuth error:", err);
          throw new Error("OAuth login failed");
        }
      }

      return token;
    },

    async session({ session, token }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
      session.backendJwt = token.backendJwt as string;
      session.firstName = token.firstName as string;
      session.lastName = token.lastName as string;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};
