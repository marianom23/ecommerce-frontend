// hooks/useCart.ts
"use client";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  addCartItem,
  removeCartItem,
  incrementCartItem,
  decrementCartItem,
  clearCart,
  fetchCart,
  selectCart,
  selectCartItems,
  selectItemsCount,
  selectTotalPrice,
} from "@/redux/features/cart-slice";

export function useCart() {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCart);
  const items = useAppSelector(selectCartItems);
  const totalItems = useAppSelector(selectItemsCount);
  const totalPrice = useAppSelector(selectTotalPrice);

  return {
    cart,
    items,
    totalItems,
    totalPrice,
    addItem: (p: { productId: number; variantId?: number; quantity: number }) =>
      dispatch(addCartItem(p)),
    removeItem: (id: number) => dispatch(removeCartItem(id)),
    increment: (id: number) => dispatch(incrementCartItem(id)),
    decrement: (id: number) => dispatch(decrementCartItem(id)),
    clear: () => dispatch(clearCart()),
    refresh: () => dispatch(fetchCart()),
  };
}
