import React from "react";

interface ProductJsonLdProps {
  product: {
    id: string | number;
    title: string;
    description?: string;
    price: number;
    discountedPrice?: number;
    images?: string[];
    stockTotal?: number;
    averageRating?: number;
    reviewCount?: number;
  };
  url: string;
}

const ProductJsonLd: React.FC<ProductJsonLdProps> = ({ product, url }) => {
  const images = product.images && product.images.length > 0 
    ? product.images 
    : ["/placeholder.png"];

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "image": images,
    "description": product.description || `Comprá ${product.title} en HorneroTech.`,
    "sku": `HT-${product.id}`,
    "brand": {
      "@type": "Brand",
      "name": "HorneroTech"
    },
    "offers": {
      "@type": "Offer",
      "url": url,
      "priceCurrency": "ARS",
      "price": product.discountedPrice || product.price,
      "availability": product.stockTotal && product.stockTotal > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
    },
  };

  if (product.averageRating && product.averageRating > 0) {
    (jsonLd as any).aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": product.averageRating,
      "reviewCount": product.reviewCount || 1,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export default ProductJsonLd;
