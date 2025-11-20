// lib/services/authService.ts
import { api } from "@/lib/api";

export type MeResponse = {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  roles: string[];
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token?: string;     // opcional (solo si backend también lo devuelve)
  expiresAt?: string; // opcional
  user: MeResponse;
};

export const authService = {
  /** Obtener usuario actual (si está logueado) */
  me() {
    return api.get<MeResponse>("/me"); // ✔️ CORRECTO
  },

  /** Login con email y contraseña */
  login(payload: LoginRequest) {
    return api.post<LoginResponse>("/login", payload); // ✔️ CORRECTO
  },

  /** Logout: backend borra las cookies HttpOnly */
  logout() {
    console.log("logout")
    return api.post<void>("/logout", {}); // ✔️ CORRECTO
  },
};
