const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'

async function testFetch() {
  console.log(`Fetching from: ${backendUrl}/api/products?limit=1000`)
  try {
    const response = await fetch(`${backendUrl}/api/products?limit=1000`)
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)
      return
    }
    const result = await response.json()
    console.log('Response status:', result.status)
    
    const data = result.data
    const products = Array.isArray(data) ? data : (data?.items || [])
    
    console.log(`Found ${products.length} products`)
    if (products.length > 0) {
      console.log('First product sample:', {
        id: products[0].id,
        title: products[0].title
      })
      
      const product = products[0]
      const slug = product.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
          
      console.log(`Generated URL: /detalle-producto/${product.id}-${slug}`)
    }
  } catch (error) {
    console.error('Fetch error:', error)
  }
}

testFetch()
