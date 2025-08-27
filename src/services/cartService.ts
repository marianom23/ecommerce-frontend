// lib/services/cartService.ts
import { api } from "@/lib/api";
import type { Cart, AddItemDto, UpdateItemDto } from "@/types/cart";

const basePublic = "/p/cart";     // opcional: endpoints guest/public
const baseLogged = "/b/cart";   // logged-in (reemplaza a baseAdmin)

export const cartService = {
    
  get() {
    return api.get<Cart>(`${basePublic}/me`);
  },
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

  attachCart() {
    return api.post<Cart>(`${baseLogged}/attach`);
  },
};
