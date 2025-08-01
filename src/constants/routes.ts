// src/constants/routes.ts

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

if (!API_BASE) {
  throw new Error("🚨 NEXT_PUBLIC_API_BASE no está definida en .env");
}

export const ROUTES = {
  LOGIN: `${API_BASE}/login`,
  REGISTER: `${API_BASE}/register`,
  OAUTH_CALLBACK: `${API_BASE}/oauth2/callback`,
  PRODUCTS: `${API_BASE}/products`,
  // Agregá más según necesites
};
