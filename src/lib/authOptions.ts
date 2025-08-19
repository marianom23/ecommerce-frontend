// src/lib/authOptions.ts
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Account, Profile, Session } from "next-auth";

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,                // ✅ importante
  session: { strategy: "jwt" },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { scope: "openid email profile" } },
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: { params: { scope: "openid email profile" } },
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

        const payload = await res.json();

        if (!res.ok || !payload?.data?.verified) {
          throw new Error(payload?.message || "Login failed");
        }

        // { id, email, firstName, lastName, roles, verified, token }
        return payload.data;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, profile }: {
      token: JWT;
      user?: any;
      account?: Account | null;
      profile?: Profile;
    }): Promise<JWT> {
      // ► Credenciales
      if (user) {
        token.backendJwt = user.token;         // ⬅️ guardado solo en token
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.roles = user.roles;
        token.verified = user.verified;
      }

      // ► OAuth
      if (account && profile && account.id_token) {
        const email = (profile as any).email;
        const first = (profile as any).given_name || profile.name?.split(" ")[0] || "Usuario";
        const last  = (profile as any).family_name || profile.name?.split(" ").slice(1).join(" ") || "OAuth";

        try {
          const res = await fetch("http://localhost:8080/api/oauth2/callback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              firstName: first,
              lastName: last,
              provider: account.provider,
              idToken: account.id_token,
            }),
          });

          const payload = await res.json();
          const { status, data, message } = payload as { status: string; data?: any; message?: string };

          if (!res.ok || status !== "OK" || !data) throw new Error(message || "OAuth login failed");

          token.backendJwt = data.token;       // ⬅️ guardado solo en token
          token.id = data.id;
          token.email = data.email ?? email;
          token.firstName = data.firstName ?? first;
          token.lastName = data.lastName ?? last;
          token.roles = data.roles ?? [];
          token.verified = data.verified ?? true;
        } catch (e) {
          console.error("OAuth login error:", e);
          throw new Error("OAuth login failed");
        }
      }

      return token;
    },

    async session({ session, token }: {
      session: Session;
      token: JWT & {
        backendJwt?: string;
        id?: string | number;
        email?: string;
        firstName?: string;
        lastName?: string;
        roles?: string[];
        verified?: boolean;
      };
    }): Promise<Session> {
      // ❌ NO exponer backendJwt al cliente
      // (session as any).backendJwt = undefined;  // o simplemente no lo seteamos

      // ✅ Solo datos de UI
      session.user = {
        name: [token.firstName, token.lastName].filter(Boolean).join(" ") || "",
        email: token.email ?? "",
        id: token.id as any,
        firstName: token.firstName ?? "",
        lastName: token.lastName ?? "",
        roles: (token.roles as any) ?? [],
        verified: token.verified ?? false,
      } as any;

      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};
