// types/facets.ts (o dentro del mismo archivo si preferís)
export type CategoryFacet = { id: number; name: string; count: number };
export type BrandFacet    = { id: number; name: string; count: number };
export type PriceRange    = { minPrice: number | null; maxPrice: number | null };

export type ProductFacetsResponse = {
  categoryFacets: CategoryFacet[];
  brandFacets: BrandFacet[];
  priceRange: PriceRange;
};
