export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

type AnalyticsItem = {
  item_id: string;
  item_name?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
  item_category?: string;
};

type AnalyticsEventParams = {
  currency?: string;
  value?: number;
  transaction_id?: string;
  tax?: number;
  shipping?: number;
  payment_type?: string;
  items?: AnalyticsItem[];
  [key: string]: unknown;
};

const DEFAULT_CURRENCY = "ARS";

export const pageview = (url: string) => {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || !window.gtag) return;

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

export const event = (name: string, params: AnalyticsEventParams = {}) => {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", name, {
    currency: DEFAULT_CURRENCY,
    ...params,
  });
};

export const toAnalyticsItem = (input: {
  id?: number | string | null;
  variantId?: number | string | null;
  name?: string | null;
  title?: string | null;
  price?: number | null;
  quantity?: number | null;
  category?: string | null;
}): AnalyticsItem => ({
  item_id: String(input.variantId ?? input.id ?? ""),
  item_name: input.name ?? input.title ?? undefined,
  item_variant: input.variantId ? String(input.variantId) : undefined,
  price: input.price ?? undefined,
  quantity: input.quantity ?? 1,
  item_category: input.category ?? undefined,
});

export const getGaClientId = () => {
  if (typeof document === "undefined") return undefined;

  const gaCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("_ga="));

  if (!gaCookie) return undefined;

  const value = decodeURIComponent(gaCookie.split("=")[1] ?? "");
  const parts = value.split(".");
  if (parts.length < 4) return undefined;

  return `${parts[2]}.${parts[3]}`;
};

export const trackViewItem = (item: AnalyticsItem, value?: number) => {
  event("view_item", {
    value,
    items: [item],
  });
};

export const trackAddToCart = (item: AnalyticsItem, value?: number) => {
  event("add_to_cart", {
    value,
    items: [item],
  });
};

export const trackAddToWishlist = (item: AnalyticsItem, value?: number) => {
  event("add_to_wishlist", {
    value,
    items: [item],
  });
};

export const trackBeginCheckout = (items: AnalyticsItem[], value?: number) => {
  event("begin_checkout", {
    value,
    items,
  });
};

export const trackAddPaymentInfo = (paymentType: string, items: AnalyticsItem[], value?: number) => {
  event("add_payment_info", {
    payment_type: paymentType,
    value,
    items,
  });
};

export const trackPurchase = (params: {
  transactionId: string;
  value: number;
  tax?: number;
  shipping?: number;
  items: AnalyticsItem[];
}) => {
  event("purchase", {
    transaction_id: params.transactionId,
    value: params.value,
    tax: params.tax,
    shipping: params.shipping,
    items: params.items,
  });
};
