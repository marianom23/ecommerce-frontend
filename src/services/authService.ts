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
  token?: string;
  expiresAt?: string;
  user: MeResponse;
};

export type OAuthCallbackRequest = {
  idToken: string;
  provider: 'GOOGLE' | 'AZURE_AD';
};

export const authService = {
  /** Obtener usuario actual (si está logueado) */
  me() {
    return api.get<MeResponse>("/me");
  },

  /** Obtener token actual desde cookie (para OAuth) */
  async getToken() {
    try {
      const response = await api.get<{ token: string }>("/auth/token");
      return response;
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  },

  /** Login con email y contraseña */
  async login(payload: LoginRequest) {
    const response = await api.post<LoginResponse>("/login", payload);

    // DEBUG: Ver qué recibimos
    console.log('Login response:', response);
    console.log('Token:', response.token);

    // Guardar token en localStorage para modo incógnito
    if (response.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.token);
        console.log('✅ Token guardado en localStorage');
      }
    } else {
      console.warn('⚠️ No se recibió token en la respuesta');
    }

    return response;
  },

  /** OAuth callback (Google/Microsoft) - para flujo cliente */
  async oauthCallback(payload: OAuthCallbackRequest) {
    const response = await api.post<LoginResponse>("/oauth2/callback", payload);

    console.log('OAuth callback response:', response);

    // Guardar token en localStorage
    if (response.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.token);
        console.log('✅ Token de OAuth guardado en localStorage');
      }
    } else {
      console.warn('⚠️ No se recibió token del OAuth callback');
    }

    return response;
  },

  /** Logout: backend borra las cookies HttpOnly */
  async logout() {
    try {
      console.log("logout");
      await api.post<void>("/logout", {});
    } finally {
      // Limpiar localStorage (incógnito mode)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('cart_session');
      }
    }
  },
};
