import { MetadataRoute } from 'next'
import connectToDatabase from '@/lib/mongodb'
import Product from '@/models/Product'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://elane.com'
  
  // Static routes
  const routes = ['', '/shop', '/track', '/contact', '/about'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  try {
    await connectToDatabase();
    
    // Dynamic Product Routes
    const products = await Product.find({ status: 'active' }).select('slug updatedAt').lean();
    
    const productRoutes = products.map((product: any) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))

    return [...routes, ...productRoutes]
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return routes;
  }
}
