/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://hornerotech.com.ar',
  generateRobotsTxt: true,
  exclude: [
    '/cart',
    '/checkout',
    '/checkout/*',
    '/error',
    '/signin',
    '/signup',
    '/wishlist',
    '/mail-success',
    '/mi-cuenta',
    '/mi-cuenta/*',
  ],
  transform: async (config, path) => {
    // Custom priority for specific pages
    if (path === '/' || path === '/productos') {
      return {
        loc: path,
        changefreq: config.changefreq,
        priority: 1.0,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      }
    }

    // Default transformation
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }
  },
  additionalPaths: async (config) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
    const results = []

    try {
      // Fetch products from the API
      // We use limit=1000 to get a large number of products. 
      // The backend returns a ServiceResult<T> wrapper.
      const response = await fetch(`${backendUrl}/api/products?limit=1000`)
      const result = await response.json()

      // The actual data is in the 'data' field of ServiceResult.
      // It could be a List<ProductResponse> or a PaginatedResponse<ProductResponse>
      const data = result.data
      const products = Array.isArray(data) ? data : (data?.items || [])

      products.forEach((product) => {
        const slug = product.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()

        results.push({
          loc: `/detalle-producto/${product.id}-${slug}`,
          priority: 0.8,
          changefreq: 'daily',
          lastmod: new Date().toISOString(),
        })
      })
    } catch (error) {
      console.error('Error fetching products for sitemap:', error)
    }

    return results
  },
}
