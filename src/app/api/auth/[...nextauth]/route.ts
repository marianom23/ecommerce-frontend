import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions"; // o desde donde exportes tu config

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
