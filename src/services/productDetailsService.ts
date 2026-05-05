// lib/services/productDetailsService.ts
import { api } from "@/lib/api";

/** ===== Bases ===== */
const basePublic = "/products"; // pasa por app/api/p/[...path]/route.ts (publico)
const baseAdmin = "/products"; // pasa por app/api/b/[...path]/route.ts (con Bearer)

/** ===== Tipos minimos del endpoint /products/:id/details ===== */
type ImageSet = { urls: string[]; thumbnails?: string[]; previews?: string[] };

type APIRelatedProduct = {
  id: number;
  title: string;
  consoleName?: string | null;
  price?: number | null;
  discountedPrice?: number | null;
  imageUrl?: string | null;
  imgs?: Partial<ImageSet>;
};

type ProductType = "GAME" | "DLC" | "CONSOLE" | "ACCESSORY" | "OTHER";

type APIVariant = {
  id: number;
  sku: string;
  price: number;
  discountedPrice?: number | null;
  priceWithTransfer?: number | null;
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
  specificationsJson?: string;
  presale?: boolean;
  releaseDate?: string | null;
  productType?: ProductType;
  fulfillmentType?: "PHYSICAL" | "DIGITAL_ON_DEMAND" | "DIGITAL_INSTANT";
  parentProducts?: APIRelatedProduct[];
  childProducts?: APIRelatedProduct[];
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

export type NormalizedVariant = {
  id: number;
  sku: string;
  attrs: Record<string, string>;
  price: number;
  discountedPrice: number;
  priceWithTransfer?: number;
  stock: number;
  images: string[];
};

export type RelatedProduct = {
  id: number;
  title: string;
  consoleName?: string;
  price?: number;
  discountedPrice?: number;
  image?: string;
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
  fulfillmentType: "PHYSICAL" | "DIGITAL_ON_DEMAND" | "DIGITAL_INSTANT";
  priceWithTransfer?: number;
  specifications?: Record<string, string>;
  isPresale?: boolean;
  releaseDate?: string | null;
  productType?: ProductType;
  parentProducts: RelatedProduct[];
  childProducts: RelatedProduct[];
};

function getRawFrom(base: string, id: number) {
  return api.get<ProductDetailsRaw>(`${base}/${id}/details`);
}

function normalize(p: ProductDetailsRaw): NormalizedProduct {
  const money = (n: number | null | undefined) =>
    typeof n === "number" && !Number.isNaN(n) ? n : 0;

  const parseSpecifications = (json?: string) => {
    if (!json) return {};
    try {
      return JSON.parse(json);
    } catch {
      return {};
    }
  };

  const firstImage = (imgs?: Partial<ImageSet>, fallback?: string | null) =>
    imgs?.urls?.[0] ?? imgs?.previews?.[0] ?? imgs?.thumbnails?.[0] ?? fallback ?? undefined;

  const normalizeRelatedProducts = (products?: APIRelatedProduct[]) =>
    (products ?? []).map((product) => ({
      id: product.id,
      title: product.title,
      consoleName: product.consoleName ?? undefined,
      price: typeof product.price === "number" ? product.price : undefined,
      discountedPrice: typeof product.discountedPrice === "number" ? product.discountedPrice : undefined,
      image: firstImage(product.imgs, product.imageUrl),
    }));

  const base = p;
  const baseImages = base.imgs?.urls ?? base.imgs?.previews ?? [];
  const fulfillmentType = base.fulfillmentType || "PHYSICAL";
  const common = {
    id: base.id,
    title: base.title,
    description: base.description,
    brand: base.brand,
    category: base.category,
    sku: base.sku,
    images: baseImages,
    averageRating: base.averageRating ?? 0,
    totalReviews: base.totalReviews ?? 0,
    fulfillmentType,
    priceWithTransfer: base.priceWithTransfer,
    specifications: parseSpecifications(base.specificationsJson),
    isPresale: base.presale,
    releaseDate: base.releaseDate,
    productType: base.productType,
    parentProducts: normalizeRelatedProducts(base.parentProducts),
    childProducts: normalizeRelatedProducts(base.childProducts),
  };

  if (p.hasVariants) {
    const pv = p as APIProductWithVariants;

    const variants: NormalizedVariant[] = (pv.variants ?? []).map((v) => {
      const price = money(v.price);
      const discounted = money(v.discountedPrice ?? v.price);
      const images = (v.imgs?.urls?.length ? v.imgs.urls : v.imgs?.previews?.length ? v.imgs.previews : baseImages) ?? [];
      return {
        id: v.id,
        sku: v.sku,
        attrs: v.attributes ?? {},
        price,
        discountedPrice: discounted,
        priceWithTransfer: v.priceWithTransfer ?? undefined,
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
      ...common,
      hasVariants: true,
      options: pv.variantOptions ?? {},
      variants,
      priceRange: { min, max, minDiscounted: minDisc, maxDiscounted: maxDisc },
      stockTotal,
      inStock: fulfillmentType === "DIGITAL_ON_DEMAND" ? true : stockTotal > 0,
    };
  }

  const ps = p as APIProductSimple;
  const price = money(ps.price);
  const discounted = money(ps.discountedPrice ?? price);
  const stock = ps.stock ?? 0;

  return {
    ...common,
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
    inStock: fulfillmentType === "DIGITAL_ON_DEMAND" ? true : stock > 0,
  };
}

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

export const productDetailsService = productDetailsAdminService;
