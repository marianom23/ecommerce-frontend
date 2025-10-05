// lib/services/authService.ts
import { signOut } from "next-auth/react";
import { store } from "@/redux/store";
import { resetCart } from "@/redux/features/cart-slice"; // asegúrate de tener esta action
import { api, instance } from "@/lib/api";             // 👈 importar la instancia real de axios

// Si tenés un BFF que expone /api/b/logout, poné "/b"; sino dejalo vacío ("")
const baseAuth = "/b"; // -> "/logout" contra tu AuthController (@PostMapping("/logout"))

export const authService = {
  async logout(redirectTo: string = "/") {
    try {
      // 1) Avisar al backend para que borre la cookie `cart_session`
      await api.post(`${baseAuth}/logout`);

      // 2) Fallback en el front: borrar la cookie por si el browser no la removió
      //    (en dev SameSite=Lax; en prod suele ser SameSite=None; Secure)
      document.cookie = "cart_session=; Max-Age=0; path=/; SameSite=Lax";
    } catch (err) {
      console.warn("Error al cerrar sesión en el backend:", err);
    }

    // 3) Limpiar el estado local (Redux)
    try {
      store.dispatch(resetCart());
    } catch {}

    // 4) Quitar Authorization global de la instancia de Axios (si lo usabas)
    try {
      // Solo si lo tenías seteado en algún login
      // apiInstance.defaults.headers.common.Authorization = undefined;
      delete (instance.defaults.headers.common as any)["Authorization"];
    } catch {}

    // 5) Cerrar sesión en NextAuth y redirigir
    await signOut({ redirect: true, callbackUrl: redirectTo });
  },
};
