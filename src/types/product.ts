export type FulfillmentType = 'PHYSICAL' | 'DIGITAL_ON_DEMAND' | 'DIGITAL_INSTANT';

export type Product = {
  title: string;
  averageRating: number | null;
  totalReviews: number;
  price: number;
  discountedPrice: number;
  id: number;
  imgs?: {
    urls: string[];
  };
  variantCount: number;
  defaultVariantId: number | null;
  fulfillmentType: FulfillmentType;
  priceWithTransfer?: number;
};
