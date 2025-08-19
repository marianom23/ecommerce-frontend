// src/constants/routes.ts

const rawBase = process.env.NEXT_PUBLIC_API_BASE;
if (!rawBase) {
  throw new Error("🚨 NEXT_PUBLIC_API_BASE no está definida en .env(.local)");
}

// quita barras finales
const API_BASE = rawBase.replace(/\/+$/, "");

// helper para unir sin duplicar barras
const join = (base: string, path: string) =>
  `${base}${path.startsWith("/") ? path : `/${path}`}`;

export const ROUTES = {
  REGISTER:       join(API_BASE, "/register"),
  PRODUCTS:       join(API_BASE, "/products"),
  // agrega más según necesites
};
