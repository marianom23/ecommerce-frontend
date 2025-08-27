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

// ---- Thunks tipados ----
export const fetchCart = createAsyncThunk<Cart>(
  "cart/fetch",
  async () => await cartService.get()
);

// helper: si backend envuelve en {data}
const pickCart = (res: any): Cart => (res?.data ?? res) as Cart;

export const addCartItem = createAsyncThunk<Cart,
  { productId: number; variantId?: number; quantity: number }
>(
  "cart/addItem",
  async (body) => {
    const res = await cartService.add(body);
    return pickCart(res); // si tu service ya devuelve {data}, esto lo normaliza
  }
);


export const updateCartItemQuantity = createAsyncThunk<Cart, { itemId: number; quantity: number }>(
  "cart/updateQty",
  async ({ itemId, quantity }) => await cartService.quantity(itemId, { quantity })
);

export const incrementCartItem = createAsyncThunk<Cart, number>(
  "cart/increment",
  async (itemId) => await cartService.increment(itemId)
);

export const decrementCartItem = createAsyncThunk<Cart, number>(
  "cart/decrement",
  async (itemId) => await cartService.decrement(itemId)
);

export const removeCartItem = createAsyncThunk<Cart, number>(
  "cart/removeItem",
  async (itemId) => await cartService.removeItem(itemId)
);

export const clearCart = createAsyncThunk<Cart>(
  "cart/clear",
  async () => {
    await cartService.clear(); 
    return await cartService.get(); 
  }
);


export const attachCart = createAsyncThunk<Cart>(
  "cart/attach",
  async () => await cartService.attachCart()
);

const slice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
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

    builder
      .addCase(fetchCart.pending, pending)
      .addCase(fetchCart.fulfilled, fulfilled)
      .addCase(fetchCart.rejected, rejected)

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


export default slice.reducer;

// Selectores
export const selectCart = (s: RootState) => s.cartReducer.cart;
export const selectCartItems = createSelector([selectCart], (c) => c?.items ?? []);
export const selectTotalPrice = createSelector([selectCart], (c) => c?.totals?.grandTotal ?? 0);


export const selectItemsCount = createSelector([selectCartItems], (items) =>
  items.reduce((sum, it) => sum + it.quantity, 0)
);


