// types/cart.ts (ejemplo)
export type CartItem = {
  id: number;            // id del cart_item
  productId: number;
  variantId?: number | null;
  name: string;
  imageUrl?: string | null;
  attributesJson?: string | null; // ej: {"size":"M","color":"Blue"}
  unitPrice: number;
  unitDiscountedPrice: number;
  priceAtAddition: number;
  discountedPriceAtAddition: number;
  quantity: number;
  subtotal: number;
};

export type Cart = {
  id: number;
  sessionId: string;
  updatedAt: string;
  items: CartItem[];
  totals: {
    itemsSubtotal: number;
    grandTotal: number;
  }
};


export type AddItemDto = {
  productId?: number;
  variantId?: number;
  quantity: number;
};

export type UpdateItemDto = { quantity: number };
