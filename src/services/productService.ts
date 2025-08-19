// lib/services/productService.ts
import { api, type PaginatedResponse } from "@/lib/api";

export type Product = {
  id: number;
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  imgs?: { thumbnails: string[]; previews: string[] };
};

export type ListParams = {
  page?: number;
  limit?: number;
  sort?: string;
  q?: string;
  inStockOnly?: boolean;
};

export type CreateProductDto = {
  name: string;
  description?: string;
  price: number;
  sku?: string;
  brandId?: number;
  categoryId?: number;
};

export type UpdateProductDto = Partial<CreateProductDto>;

// 👇 ahora todos los endpoints pasan por el proxy de Next
const base = "/b/products";

export const productService = {
  // GET /api/b/products?page=..&limit=..&sort=..
  list(params: ListParams) {
    return api.get<PaginatedResponse<Product>>(base, { params });
  },

  // GET /api/b/products/:id
  getOne(id: number) {
    return api.get<Product>(`${base}/${id}`);
  },

  // POST /api/b/products
  create(body: CreateProductDto) {
    return api.post<Product>(base, body);
  },

  // PUT /api/b/products/:id
  update(id: number, body: UpdateProductDto) {
    return api.put<Product>(`${base}/${id}`, body);
  },

  // DELETE /api/b/products/:id
  remove(id: number) {
    return api.del<void>(`${base}/${id}`);
  },

  // POST /api/b/products/:id/images
  addImages(productId: number, urls: string[]) {
    return api.post<void>(`${base}/${productId}/images`, urls);
  },

  // POST /api/b/products/:id/variants/:variantId/images
  addVariantImages(productId: number, variantId: number, urls: string[]) {
    return api.post<void>(`${base}/${productId}/variants/${variantId}/images`, urls);
  },

  // DELETE /api/b/products/:id/images/:imageId
  deleteImage(productId: number, imageId: number) {
    return api.del<void>(`${base}/${productId}/images/${imageId}`);
  },

  // PUT /api/b/products/:id/images/reorder
  reorderImages(productId: number, imageIdsInOrder: number[]) {
    return api.put<void>(`${base}/${productId}/images/reorder`, imageIdsInOrder);
  },
};
