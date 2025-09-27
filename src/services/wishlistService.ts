// lib/services/wishlistService.ts
import { api } from "@/lib/api";
import type { Wishlist } from "@/types/wishlist";

const baseLogged = "/b/wishlist";

export const wishlistService = {
  get() {
    return api.get<Wishlist>(`${baseLogged}/me`);
  },
  add(productId: number) {
    return api.post<Wishlist>(`${baseLogged}/products`, { productId });
  },
  remove(productId: number) {
    return api.del<Wishlist>(`${baseLogged}/products/${productId}`);
  },
  toggle(productId: number) {
    return api.post<Wishlist>(`${baseLogged}/products/${productId}/toggle`);
  },
  clear() {
    return api.del<Wishlist>(baseLogged);
  },
};
