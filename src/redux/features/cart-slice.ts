// redux/features/cart-slice.ts
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

// helper por si algún service devuelve { data }
const pickCart = (res: any): Cart => (res?.data ?? res) as Cart;

/* ========== LECTURAS ========== */
export const fetchCartGuest = createAsyncThunk<Cart>("cart/fetchGuest", async () => await cartService.getGuest());
export const fetchCartLogged = createAsyncThunk<Cart>("cart/fetchLogged", async () => await cartService.getLogged());

/* ========== MUTACIONES GUEST ========== */
export const addCartItemGuest = createAsyncThunk<Cart,
  { productId?: number; variantId?: number; quantity: number },
  { rejectValue: string }>(
    "cart/addItemGuest",
    async (body, { rejectWithValue }) => {
      try {
        return pickCart(await cartService.addGuest(body));
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || "Error al agregar al carrito";
        return rejectWithValue(message);
      }
    }
  );

export const updateCartItemQuantityGuest = createAsyncThunk<Cart, { itemId: number; quantity: number }>(
  "cart/updateQtyGuest",
  async ({ itemId, quantity }) => pickCart(await cartService.quantityGuest(itemId, { quantity }))
);

export const incrementCartItemGuest = createAsyncThunk<Cart, number, { rejectValue: string }>(
  "cart/incrementGuest",
  async (itemId, { rejectWithValue }) => {
    try {
      return pickCart(await cartService.incrementGuest(itemId));
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Error al incrementar cantidad";
      return rejectWithValue(message);
    }
  }
);

export const decrementCartItemGuest = createAsyncThunk<Cart, number>(
  "cart/decrementGuest",
  async (itemId) => pickCart(await cartService.decrementGuest(itemId))
);

export const removeCartItemGuest = createAsyncThunk<Cart, number>(
  "cart/removeItemGuest",
  async (itemId) => pickCart(await cartService.removeGuest(itemId))
);

export const clearCartGuest = createAsyncThunk<Cart>(
  "cart/clearGuest",
  async () => pickCart(await (await cartService.clearGuest(), cartService.getGuest()))
);

/* ========== MUTACIONES LOGGED ========== */
export const addCartItemLogged = createAsyncThunk<Cart,
  { productId?: number; variantId?: number; quantity: number },
  { rejectValue: string }>(
    "cart/addItemLogged",
    async (body, { rejectWithValue }) => {
      try {
        return pickCart(await cartService.addLogged(body));
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || "Error al agregar al carrito";
        return rejectWithValue(message);
      }
    }
  );

export const updateCartItemQuantityLogged = createAsyncThunk<Cart, { itemId: number; quantity: number }>(
  "cart/updateQtyLogged",
  async ({ itemId, quantity }) => pickCart(await cartService.quantityLogged(itemId, { quantity }))
);

export const incrementCartItemLogged = createAsyncThunk<Cart, number, { rejectValue: string }>(
  "cart/incrementLogged",
  async (itemId, { rejectWithValue }) => {
    try {
      return pickCart(await cartService.incrementLogged(itemId));
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Error al incrementar cantidad";
      return rejectWithValue(message);
    }
  }
);

export const decrementCartItemLogged = createAsyncThunk<Cart, number>(
  "cart/decrementLogged",
  async (itemId) => pickCart(await cartService.decrementLogged(itemId))
);

export const removeCartItemLogged = createAsyncThunk<Cart, number>(
  "cart/removeItemLogged",
  async (itemId) => pickCart(await cartService.removeLogged(itemId))
);

export const clearCartLogged = createAsyncThunk<Cart>(
  "cart/clearLogged",
  async () => pickCart(await cartService.clearLogged())
);

/* ========== ATTACH (solo logged) ========== */
export const attachCart = createAsyncThunk<Cart>(
  "cart/attach",
  async () => pickCart(await cartService.attachCart())
);

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

    const rejectedWithStockError = (s: CartState, a: any) => {
      s.loading = false;
      // Cuando usamos rejectWithValue, el mensaje está en action.payload
      const errorMsg = a.payload || a.error?.message || "Error al modificar el carrito";
      s.error = errorMsg;
      toast.error(errorMsg);
    };

    // LECTURAS
    builder
      .addCase(fetchCartGuest.pending, pending)
      .addCase(fetchCartGuest.fulfilled, fulfilled)
      .addCase(fetchCartGuest.rejected, rejected)

      .addCase(fetchCartLogged.pending, pending)
      .addCase(fetchCartLogged.fulfilled, fulfilled)
      .addCase(fetchCartLogged.rejected, rejected);

    // MUTACIONES GUEST
    builder
      .addCase(addCartItemGuest.pending, pending)
      .addCase(addCartItemGuest.fulfilled, (s, a) => { fulfilled(s, a); toast.success("Producto agregado 🛒"); })
      .addCase(addCartItemGuest.rejected, rejectedWithStockError)

      .addCase(updateCartItemQuantityGuest.pending, pending)
      .addCase(updateCartItemQuantityGuest.fulfilled, fulfilled)
      .addCase(updateCartItemQuantityGuest.rejected, rejected)

      .addCase(incrementCartItemGuest.pending, pending)
      .addCase(incrementCartItemGuest.fulfilled, fulfilled)
      .addCase(incrementCartItemGuest.rejected, rejectedWithStockError)

      .addCase(decrementCartItemGuest.pending, pending)
      .addCase(decrementCartItemGuest.fulfilled, fulfilled)
      .addCase(decrementCartItemGuest.rejected, rejected)

      .addCase(removeCartItemGuest.pending, pending)
      .addCase(removeCartItemGuest.fulfilled, fulfilled)
      .addCase(removeCartItemGuest.rejected, rejected)

      .addCase(clearCartGuest.pending, pending)
      .addCase(clearCartGuest.fulfilled, fulfilled)
      .addCase(clearCartGuest.rejected, rejected);

    // MUTACIONES LOGGED
    builder
      .addCase(addCartItemLogged.pending, pending)
      .addCase(addCartItemLogged.fulfilled, (s, a) => { fulfilled(s, a); toast.success("Producto agregado 🛒"); })
      .addCase(addCartItemLogged.rejected, rejectedWithStockError)

      .addCase(updateCartItemQuantityLogged.pending, pending)
      .addCase(updateCartItemQuantityLogged.fulfilled, fulfilled)
      .addCase(updateCartItemQuantityLogged.rejected, rejected)

      .addCase(incrementCartItemLogged.pending, pending)
      .addCase(incrementCartItemLogged.fulfilled, fulfilled)
      .addCase(incrementCartItemLogged.rejected, rejectedWithStockError)

      .addCase(decrementCartItemLogged.pending, pending)
      .addCase(decrementCartItemLogged.fulfilled, fulfilled)
      .addCase(decrementCartItemLogged.rejected, rejected)

      .addCase(removeCartItemLogged.pending, pending)
      .addCase(removeCartItemLogged.fulfilled, fulfilled)
      .addCase(removeCartItemLogged.rejected, rejected)

      .addCase(clearCartLogged.pending, pending)
      .addCase(clearCartLogged.fulfilled, fulfilled)
      .addCase(clearCartLogged.rejected, rejected);

    // ATTACH
    builder
      .addCase(attachCart.pending, pending)
      .addCase(attachCart.fulfilled, fulfilled)
      .addCase(attachCart.rejected, rejected);
  },
});

export const { reset: resetCart } = slice.actions;
export default slice.reducer;

/* ========== SELECTORS ========== */
export const selectCart = (s: RootState) => s.cartReducer.cart;
export const selectCartItems = createSelector([selectCart], (c) => c?.items ?? []);
export const selectTotalPrice = createSelector([selectCart], (c) => c?.totals?.grandTotal ?? 0);

export const selectItemsCount = createSelector([selectCartItems], (items) =>
  items.reduce((sum, it) => sum + it.quantity, 0)
);
