/**
 * Generates a URL-friendly slug from a product title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

/**
 * Generates a product URL with ID and slug
 */
export function generateProductUrl(id: number, title: string): string {
  const slug = generateSlug(title);
  return `/detalle-producto/${id}-${slug}`;
}

/**
 * Extracts product ID from a product URL
 */
export function extractProductIdFromUrl(url: string): number | null {
  const match = url.match(/\/detalle-producto\/(\d+)-/);
  return match ? parseInt(match[1], 10) : null;
}
