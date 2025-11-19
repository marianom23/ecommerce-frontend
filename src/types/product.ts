export type FulfillmentType = 'PHYSICAL' | 'DIGITAL_ON_DEMAND' | 'DIGITAL_INSTANT';

export type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
  variantCount: number;
  defaultVariantId: number | null;
  fulfillmentType: FulfillmentType;
};
