import { createSlice } from "@reduxjs/toolkit";
import { Product } from "@/types/product";

type InitialState = {
  value: Product;
};

const initialState = {
  value: {
    title: "",
    averageRating: 0,
    totalReviews: 0,
    price: 0,
    discountedPrice: 0,
    id: 0,
    imgs: { thumbnails: [], previews: [] },
    variantCount: 0,
    defaultVariantId: 0,
    fulfillmentType: "PHYSICAL" as const
  },
} as InitialState;

export const productDetails = createSlice({
  name: "productDetails",
  initialState,
  reducers: {
    updateproductDetails: (_, action) => {
      return {
        value: {
          ...action.payload,
        },
      };
    },
  },
});

export const { updateproductDetails } = productDetails.actions;
export default productDetails.reducer;
