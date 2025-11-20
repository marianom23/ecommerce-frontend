// lib/logoutClient.ts
import { store } from "@/redux/store";
import { resetCart } from "@/redux/features/cart-slice";
import { authService } from "@/services/authService";

export async function logoutClient(redirectTo: string = "/") {
  try {
    // 🔥 1) Backend elimina cookies httpOnly
    await authService.logout();
  } catch (err) {
    console.warn("Error al cerrar sesión en backend:", err);
  }

  // 🔥 2) Limpiar estado del frontend (redux)
  try {
    store.dispatch(resetCart());
  } catch {}

  // 🔥 3) Redirigir
  window.location.href = redirectTo;
}
