import { MetadataRoute } from 'next';

const DOMAIN = 'https://hornerotech.com.ar';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.hornerotech.com.ar';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Definir páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${DOMAIN}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${DOMAIN}/productos`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${DOMAIN}/como-funciona`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${DOMAIN}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${DOMAIN}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${DOMAIN}/terms-of-use`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    // 2. Obtener productos del Backend de forma dinámica
    // Aseguramos traer todos los productos (ajustar limit si es necesario)
    const response = await fetch(`${BACKEND_URL}/api/products?page=1&limit=100`, {
      cache: 'no-store' // No cachear para que siempre esté fresco
    });
    
    if (!response.ok) throw new Error('Error fetching products');

    const result = await response.json();
    const products = result.data || [];

    // 3. Generar rutas para cada producto
    const productPages: MetadataRoute.Sitemap = products.map((product: any) => ({
      url: `${DOMAIN}/detalle-producto/${product.id}-${product.slug}`,
      lastModified: new Date(), // O usar product.updatedAt si lo tienes
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // 4. Combinar todo
    return [...staticPages, ...productPages];
  } catch (error) {
    console.error('Sitemap Error:', error);
    return staticPages; // En caso de error, devolvemos al menos las estáticas
  }
}
