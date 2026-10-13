import { MetadataRoute } from 'next'
import connectToDatabase from '@/lib/mongodb'
import Product from '@/models/Product'
import Category from '@/models/Category'
import Setting from '@/models/Setting'

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let baseUrl = '';

  try {
    await connectToDatabase();
    const siteUrlSetting = await Setting.findOne({ 
      key: { $in: ['site_url', 'store_url'] } 
    }).lean();
    if (siteUrlSetting?.value) {
      baseUrl = siteUrlSetting.value.trim().replace(/\/$/, '');
    }
  } catch (error) {
    console.error('Error fetching site_url in sitemap:', error);
  }

  if (!baseUrl) {
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
              (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
              'https://www.ruporong.com';
  }

  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `https://${baseUrl}`;
  }
  baseUrl = baseUrl.replace(/\/$/, '');
  
  // Static routes
  const routes = ['', '/shop', '/track', '/contact', '/about'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  try {
    await connectToDatabase();
    
    // Dynamic Product Routes (filtered by is_active: true)
    const products = await Product.find({ is_active: true }).select('slug updatedAt').lean();
    
    const productRoutes = products.map((product: any) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }));

    // Dynamic Category Routes (filtered by is_active: true)
    const categories = await Category.find({ is_active: true }).select('slug updatedAt').lean();

    const categoryRoutes = categories.map((cat: any) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    return [...routes, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    console.error('Error generating dynamic sitemap routes:', error);
    return routes;
  }
}
