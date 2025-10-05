// lib/services/cartService.ts
import { api } from "@/lib/api";
import type { Cart, AddItemDto, UpdateItemDto } from "@/types/cart";

const basePublic = "/p/cart";   // guest
const baseLogged = "/b/cart";   // autenticado (inyecta Authorization)

export const cartService = {
  // --- lecturas ---
  getGuest() {
    return api.get<Cart>(`${basePublic}/me`);
  },
  getLogged() {
    return api.get<Cart>(`${baseLogged}/me`);
  },

  // --- mutaciones guest (si estás logueado y tu cookie apunta a cart de user, backend devuelve 403) ---
  add(body: AddItemDto) {
    return api.post<Cart>(`${basePublic}/items`, body);
  },
  increment(itemId: number) {
    return api.patch<Cart>(`${basePublic}/items/${itemId}/increment`);
  },
  decrement(itemId: number) {
    return api.patch<Cart>(`${basePublic}/items/${itemId}/decrement`);
  },
  quantity(itemId: number, body: UpdateItemDto) {
    return api.patch<Cart>(`${basePublic}/items/${itemId}`, body);
  },
  removeItem(itemId: number) {
    return api.del<Cart>(`${basePublic}/items/${itemId}`);
  },
  clear() {
    return api.del<Cart>(basePublic);
  },
  applyCoupon(code: string) {
    return api.post<Cart>(`${basePublic}/coupon`, { code });
  },

  // --- logged-only ---
  attachCart() {
    return api.post<Cart>(`${baseLogged}/attach`);
  },
};
