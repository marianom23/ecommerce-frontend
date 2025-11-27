// lib/services/productDetailsService.ts
import { api } from "@/lib/api";

/** ===== Bases ===== */
const basePublic = "/products"; // pasa por app/api/p/[...path]/route.ts (público)
const baseAdmin = "/products"; // pasa por app/api/b/[...path]/route.ts (con Bearer)

/** ===== Tipos mínimos del endpoint /products/:id/details ===== */
type ImageSet = { thumbnails: string[]; previews: string[] };

type APIVariant = {
  id: number;
  sku: string;
  price: number;
  discountedPrice?: number | null;
  stock: number;
  attributes: Record<string, string>;
  imgs?: Partial<ImageSet>;
};

type APIProductBase = {
  id: number;
  title: string;
  averageRating: number | null;
  totalReviews: number;
  imgs: ImageSet;
  description: string;
  sku: string;
  brand: string;
  category: string;
  priceWithTransfer?: number;
};

type APIProductWithVariants = APIProductBase & {
  hasVariants: true;
  variantAttributes: string[];
  variantOptions: Record<string, string[]>;
  variants: APIVariant[];
};

type APIProductSimple = APIProductBase & {
  hasVariants: false;
  price: number;
  discountedPrice?: number | null;
  stock: number;
  variantAttributes: [];
  variantOptions: Record<string, never>;
  variants: [];
};

export type ProductDetailsRaw = APIProductWithVariants | APIProductSimple;

/** ===== Tipo normalizado para la UI ===== */
export type NormalizedVariant = {
  id: number;
  sku: string;
  attrs: Record<string, string>;
  price: number;
  discountedPrice: number;
  stock: number;
  images: string[];
};

export type NormalizedProduct = {
  id: number;
  title: string;
  description: string;
  brand: string;
  category: string;
  sku: string;
  images: string[];
  averageRating: number;
  totalReviews: number;
  hasVariants: boolean;
  options: Record<string, string[]>;
  variants: NormalizedVariant[];
  price?: number;
  discountedPrice?: number;
  priceRange: { min: number; max: number; minDiscounted: number; maxDiscounted: number };
  stockTotal: number;
  inStock: boolean;
  fulfillmentType: 'PHYSICAL' | 'DIGITAL_ON_DEMAND' | 'DIGITAL_INSTANT';
  priceWithTransfer?: number;
};

/** ===== Fetchers ===== */
function getRawFrom(base: string, id: number) {
  return api.get<ProductDetailsRaw>(`${base}/${id}/details`);
}

/** ===== Normalizador ===== */
function normalize(p: ProductDetailsRaw): NormalizedProduct {
  const money = (n: number | null | undefined) =>
    typeof n === "number" && !Number.isNaN(n) ? n : 0;

  if (p.hasVariants) {
    const pv = p as APIProductWithVariants;

    const variants: NormalizedVariant[] = (pv.variants ?? []).map((v) => {
      const price = money(v.price);
      const discounted = money(v.discountedPrice ?? v.price);
      const images =
        (v.imgs?.previews?.length ? v.imgs.previews : pv.imgs?.previews) ?? [];
      return {
        id: v.id,
        sku: v.sku,
        attrs: v.attributes ?? {},
        price,
        discountedPrice: discounted,
        stock: v.stock ?? 0,
        images,
      };
    });

    const prices = variants.map((v) => v.price);
    const discounts = variants.map((v) => v.discountedPrice);
    const stocks = variants.map((v) => v.stock);

    const min = prices.length ? Math.min(...prices) : 0;
    const max = prices.length ? Math.max(...prices) : 0;
    const minDisc = discounts.length ? Math.min(...discounts) : min;
    const maxDisc = discounts.length ? Math.max(...discounts) : max;
    const stockTotal = stocks.reduce((a, b) => a + (b || 0), 0);

    return {
      id: pv.id,
      title: pv.title,
      description: pv.description,
      brand: pv.brand,
      category: pv.category,
      sku: pv.sku,
      images: pv.imgs?.previews ?? [],
      averageRating: pv.averageRating ?? 0,
      totalReviews: pv.totalReviews ?? 0,
      hasVariants: true,
      options: pv.variantOptions ?? {},
      variants,
      priceRange: { min, max, minDiscounted: minDisc, maxDiscounted: maxDisc },
      stockTotal,
      inStock: (pv as any).fulfillmentType === 'DIGITAL_ON_DEMAND' ? true : stockTotal > 0,
      fulfillmentType: (pv as any).fulfillmentType || 'PHYSICAL',
      priceWithTransfer: pv.priceWithTransfer,
    };
  } else {
    const ps = p as APIProductSimple;

    const price = money(ps.price);
    const discounted = money(ps.discountedPrice ?? price);
    const stock = ps.stock ?? 0;

    return {
      id: ps.id,
      title: ps.title,
      description: ps.description,
      brand: ps.brand,
      category: ps.category,
      sku: ps.sku,
      images: ps.imgs?.previews ?? [],
      averageRating: ps.averageRating ?? 0,
      totalReviews: ps.totalReviews ?? 0,
      hasVariants: false,
      options: {},
      variants: [],
      price,
      discountedPrice: discounted,
      priceRange: {
        min: price,
        max: price,
        minDiscounted: discounted,
        maxDiscounted: discounted,
      },
      stockTotal: stock,
      inStock: (ps as any).fulfillmentType === 'DIGITAL_ON_DEMAND' ? true : stock > 0,
      fulfillmentType: (ps as any).fulfillmentType || 'PHYSICAL',
      priceWithTransfer: ps.priceWithTransfer,
    };
  }
}

/** ===== Servicios ===== */
export const productDetailsPublicService = {
  getRaw(id: number) {
    return getRawFrom(basePublic, id);
  },
  async getNormalized(id: number): Promise<NormalizedProduct> {
    const raw = await getRawFrom(basePublic, id);
    return normalize(raw);
  },
};

export const productDetailsAdminService = {
  getRaw(id: number) {
    return getRawFrom(baseAdmin, id);
  },
  async getNormalized(id: number): Promise<NormalizedProduct> {
    const raw = await getRawFrom(baseAdmin, id);
    return normalize(raw);
  },
};

/** Alias para compatibilidad: mantiene el comportamiento previo (admin) */
export const productDetailsService = productDetailsAdminService;
