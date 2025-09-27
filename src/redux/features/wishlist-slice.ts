// redux/features/wishlist-slice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { wishlistService } from "@/services/wishlistService"; // 👈 ruta corregida
import type { Product } from "@/types/product";

type State = { items: Product[] };
const initialState: State = { items: [] };

export const loadWishlist = createAsyncThunk<Product[]>(
  "wishlist/load",
  async () => (await wishlistService.get()).products
);

export const toggleWishlist = createAsyncThunk<Product[], Product>(
  "wishlist/toggle",
  async (product) => (await wishlistService.toggle(product.id)).products
);

// alias opcional para compatibilidad con código viejo
export const addItemToWishlist = toggleWishlist;

export const removeFromWishlist = createAsyncThunk<Product[], number>(
  "wishlist/remove",
  async (productId) => (await wishlistService.remove(productId)).products
);

export const clearWishlist = createAsyncThunk<Product[]>(
  "wishlist/clear",
  async () => (await wishlistService.clear()).products
);

const slice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(loadWishlist.fulfilled, (s, a) => { s.items = a.payload; });
    b.addCase(toggleWishlist.fulfilled, (s, a) => { s.items = a.payload; });
    b.addCase(removeFromWishlist.fulfilled, (s, a) => { s.items = a.payload; });
    b.addCase(clearWishlist.fulfilled, (s, a) => { s.items = a.payload; });
  },
});

export default slice.reducer;
