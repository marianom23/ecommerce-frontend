// types/wishlist.ts
import type { Product } from "@/types/product";

export interface Wishlist {
  id: number;
  name: string;
  products: Product[]; // 👈 exactamente el mismo shape que usás en shop
}
