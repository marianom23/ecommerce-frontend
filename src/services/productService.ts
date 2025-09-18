// lib/services/productService.ts
import { api, type PaginatedResponse } from "@/lib/api";
import { type Product } from "@/types/product";
import {
  type ProductFacetsResponse,
} from "@/types/facets";
// export type Product = { id: number; title: string; reviews: number; price: number; discountedPrice: number; imgs?: { thumbnails: string[]; previews: string[] } };
export type ListParams = { page?: number; limit?: number; sort?: string; q?:  string; categoryId?: number; minPrice?: number, maxPrice?: number, brandIds?: number[], inStockOnly?: boolean; };
export type CreateProductDto = { name: string; description?: string; price: number; sku?: string; brandId?: number; categoryId?: number; };
export type UpdateProductDto = Partial<CreateProductDto>;

const basePublic = "/p/products";
const baseAdmin  = "/b/products";

export const productService = {
  list(params: ListParams) {
    return api.get<PaginatedResponse<Product>>(basePublic, { params });
  },
  getFacets(params: ListParams) {
    return api.get<ProductFacetsResponse>(`${basePublic}/facets`, { params });
  },
  getOne(id: number) {
    return api.get<Product>(`${basePublic}/${id}`);
  },
  create(body: CreateProductDto) {
    return api.post<Product>(baseAdmin, body);
  },
  update(id: number, body: UpdateProductDto) {
    return api.put<Product>(`${baseAdmin}/${id}`, body);
  },
  remove(id: number) {
    return api.del<void>(`${baseAdmin}/${id}`);
  },
  addImages(productId: number, urls: string[]) {
    return api.post<void>(`${baseAdmin}/${productId}/images`, urls);
  },
  addVariantImages(productId: number, variantId: number, urls: string[]) {
    return api.post<void>(`${baseAdmin}/${productId}/variants/${variantId}/images`, urls);
  },
  deleteImage(productId: number, imageId: number) {
    return api.del<void>(`${baseAdmin}/${productId}/images/${imageId}`);
  },
  reorderImages(productId: number, imageIdsInOrder: number[]) {
    return api.put<void>(`${baseAdmin}/${productId}/images/reorder`, imageIdsInOrder);
  },
};
