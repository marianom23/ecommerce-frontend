// hooks/useCart.ts
"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useAuth } from "@/hooks/useAuth";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import {
  // lecturas
  fetchCartGuest,
  fetchCartLogged,

  // mutaciones guest
  addCartItemGuest,
  removeCartItemGuest,
  incrementCartItemGuest,
  decrementCartItemGuest,
  clearCartGuest,
  updateCartItemQuantityGuest,

  // mutaciones logged
  addCartItemLogged,
  removeCartItemLogged,
  incrementCartItemLogged,
  decrementCartItemLogged,
  clearCartLogged,
  updateCartItemQuantityLogged,

  // selects
  selectCart,
  selectCartItems,
  selectItemsCount,
  selectTotalPrice,
} from "@/redux/features/cart-slice";

const CART_AUTO_OPENED_KEY = "hornero-cart-auto-opened";

export function useCart() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const { openCartModal } = useCartModalContext();

  const cart = useAppSelector(selectCart);
  const items = useAppSelector(selectCartItems);
  const totalItems = useAppSelector(selectItemsCount);
  const totalPrice = useAppSelector(selectTotalPrice);

  const isLogged = isAuthenticated;

  return {
    cart,
    items,
    totalItems,
    totalPrice,

    // lecturas
    refresh: () => isLogged ? dispatch(fetchCartLogged()) : dispatch(fetchCartGuest()),
    refreshGuest: () => dispatch(fetchCartGuest()),
    refreshLogged: () => dispatch(fetchCartLogged()),

    // mutaciones
    addItem: async (p: { productId?: number; variantId?: number; quantity: number; price?: number }) => {
      const action = await (isLogged ? dispatch(addCartItemLogged(p)) : dispatch(addCartItemGuest(p)));
      const addedToCart = addCartItemLogged.fulfilled.match(action) || addCartItemGuest.fulfilled.match(action);

      if (addedToCart) {
        window.dispatchEvent(new Event("cart:attention"));

        if (sessionStorage.getItem(CART_AUTO_OPENED_KEY) !== "true") {
          sessionStorage.setItem(CART_AUTO_OPENED_KEY, "true");
          openCartModal();
        }
      }

      return action;
    },

    updateQuantity: (itemId: number, quantity: number) =>
      isLogged
        ? dispatch(updateCartItemQuantityLogged({ itemId, quantity }))
        : dispatch(updateCartItemQuantityGuest({ itemId, quantity })),

    removeItem: (id: number) =>
      isLogged ? dispatch(removeCartItemLogged(id)) : dispatch(removeCartItemGuest(id)),

    increment: (id: number) =>
      isLogged ? dispatch(incrementCartItemLogged(id)) : dispatch(incrementCartItemGuest(id)),

    decrement: (id: number) =>
      isLogged ? dispatch(decrementCartItemLogged(id)) : dispatch(decrementCartItemGuest(id)),

    clear: () => (isLogged ? dispatch(clearCartLogged()) : dispatch(clearCartGuest())),
  };
}
