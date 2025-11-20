// lib/services/cartService.ts
import { api } from "@/lib/api";
import type { Cart, AddItemDto, UpdateItemDto } from "@/types/cart";

const baseGuest = "/cart";   // guest (usa cookie cart_session)
const baseLogged = "/cart";  // logged (inyecta Authorization vía /api/b proxy)

export const cartService = {
  /* ========== LECTURAS ========== */
  getGuest:  () => api.get<Cart>(`${baseGuest}/me`),
  getLogged: () => api.get<Cart>(`${baseLogged}/me`),

  /* ========== MUTACIONES GUEST ========== */
  addGuest:        (body: AddItemDto)                   => api.post<Cart>(`${baseGuest}/items`, body),
  incrementGuest:  (itemId: number)                     => api.patch<Cart>(`${baseGuest}/items/${itemId}/increment`),
  decrementGuest:  (itemId: number)                     => api.patch<Cart>(`${baseGuest}/items/${itemId}/decrement`),
  quantityGuest:   (itemId: number, body: UpdateItemDto)=> api.patch<Cart>(`${baseGuest}/items/${itemId}`, body),
  removeGuest:     (itemId: number)                     => api.del<Cart>(`${baseGuest}/items/${itemId}`),
  clearGuest:      ()                                   => api.del<Cart>(baseGuest),
  applyCouponGuest:(code: string)                       => api.post<Cart>(`${baseGuest}/coupon`, { code }),

  /* ========== MUTACIONES LOGGED ========== */
  addLogged:        (body: AddItemDto)                   => api.post<Cart>(`${baseLogged}/items`, body),
  incrementLogged:  (itemId: number)                     => api.patch<Cart>(`${baseLogged}/items/${itemId}/increment`),
  decrementLogged:  (itemId: number)                     => api.patch<Cart>(`${baseLogged}/items/${itemId}/decrement`),
  quantityLogged:   (itemId: number, body: UpdateItemDto)=> api.patch<Cart>(`${baseLogged}/items/${itemId}`, body),
  removeLogged:     (itemId: number)                     => api.del<Cart>(`${baseLogged}/items/${itemId}`),
  clearLogged:      ()                                   => api.del<Cart>(baseLogged),
  applyCouponLogged:(code: string)                       => api.post<Cart>(`${baseLogged}/coupon`, { code }),

  /* ========== UTILIDAD ========== */
  attachCart: () => api.post<Cart>(`${baseLogged}/attach`),
};
