import { createAsyncThunk, createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import { cartService } from "@/services/cartService";
import type { RootState } from "../store";
import type { Cart } from "@/types/cart";
import toast from "react-hot-toast";

type CartState = {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
};

const initialState: CartState = { cart: null, loading: false, error: null };

/* ========================= THUNKS ========================= */

// Lecturas separadas: guest vs logged
export const fetchCartGuest  = createAsyncThunk<Cart>(
  "cart/fetchGuest",
  async () => await cartService.getGuest()
);

export const fetchCartLogged = createAsyncThunk<Cart>(
  "cart/fetchLogged",
  async () => await cartService.getLogged()
);

// Helper por si algún service te devuelve { data }
const pickCart = (res: any): Cart => (res?.data ?? res) as Cart;

// Mutaciones (guest endpoints)
export const addCartItem = createAsyncThunk<Cart,
  { productId: number; variantId?: number; quantity: number }
>(
  "cart/addItem",
  async (body) => {
    const res = await cartService.add(body);
    return pickCart(res);
  }
);

export const updateCartItemQuantity = createAsyncThunk<Cart, { itemId: number; quantity: number }>(
  "cart/updateQty",
  async ({ itemId, quantity }) => {
    const res = await cartService.quantity(itemId, { quantity });
    return pickCart(res);
  }
);

export const incrementCartItem = createAsyncThunk<Cart, number>(
  "cart/increment",
  async (itemId) => {
    const res = await cartService.increment(itemId);
    return pickCart(res);
  }
);

export const decrementCartItem = createAsyncThunk<Cart, number>(
  "cart/decrement",
  async (itemId) => {
    const res = await cartService.decrement(itemId);
    return pickCart(res);
  }
);

export const removeCartItem = createAsyncThunk<Cart, number>(
  "cart/removeItem",
  async (itemId) => {
    const res = await cartService.removeItem(itemId);
    return pickCart(res);
  }
);

export const clearCart = createAsyncThunk<Cart>(
  "cart/clear",
  // clear está en /p: tras limpiar, refresco el guest
  async () => {
    await cartService.clear();
    return await cartService.getGuest();
  }
);

// Logged-only
export const attachCart = createAsyncThunk<Cart>(
  "cart/attach",
  async () => {
    const res = await cartService.attachCart();
    return pickCart(res);
  }
);

/* ========================= SLICE ========================= */

const slice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    reset: (s) => {
      s.cart = null;
      s.loading = false;
      s.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (s: CartState) => { s.loading = true; s.error = null; };
    const fulfilled = (s: CartState, a: PayloadAction<Cart>) => {
      s.loading = false;
      s.error = null;
      s.cart = a.payload;
    };
    const rejected = (s: CartState, a: any) => {
      s.loading = false;
      s.error = a.error?.message || "Error";
    };

    // GETs
    builder
      .addCase(fetchCartGuest.pending, pending)
      .addCase(fetchCartGuest.fulfilled, fulfilled)
      .addCase(fetchCartGuest.rejected, rejected)

      .addCase(fetchCartLogged.pending, pending)
      .addCase(fetchCartLogged.fulfilled, fulfilled)
      .addCase(fetchCartLogged.rejected, rejected);

    // Mutaciones
    builder
      .addCase(addCartItem.pending, pending)
      .addCase(addCartItem.fulfilled, (s, a) => {
        fulfilled(s, a);
        toast.success("Producto agregado al carrito 🛒");
      })
      .addCase(addCartItem.rejected, rejected)

      .addCase(updateCartItemQuantity.pending, pending)
      .addCase(updateCartItemQuantity.fulfilled, fulfilled)
      .addCase(updateCartItemQuantity.rejected, rejected)

      .addCase(incrementCartItem.pending, pending)
      .addCase(incrementCartItem.fulfilled, fulfilled)
      .addCase(incrementCartItem.rejected, rejected)

      .addCase(decrementCartItem.pending, pending)
      .addCase(decrementCartItem.fulfilled, fulfilled)
      .addCase(decrementCartItem.rejected, rejected)

      .addCase(removeCartItem.pending, pending)
      .addCase(removeCartItem.fulfilled, fulfilled)
      .addCase(removeCartItem.rejected, rejected)

      .addCase(clearCart.pending, pending)
      .addCase(clearCart.fulfilled, fulfilled)
      .addCase(clearCart.rejected, rejected)

      .addCase(attachCart.pending, pending)
      .addCase(attachCart.fulfilled, fulfilled)
      .addCase(attachCart.rejected, rejected);
  },
});

export const { reset: resetCart } = slice.actions;
export default slice.reducer;

/* ========================= SELECTORS ========================= */

export const selectCart = (s: RootState) => s.cartReducer.cart;
export const selectCartItems = createSelector([selectCart], (c) => c?.items ?? []);
export const selectTotalPrice = createSelector([selectCart], (c) => c?.totals?.grandTotal ?? 0);

export const selectItemsCount = createSelector([selectCartItems], (items) =>
  items.reduce((sum, it) => sum + it.quantity, 0)
);
