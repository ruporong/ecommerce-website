import { MetadataRoute } from 'next'
import connectToDatabase from '@/lib/mongodb'
import Setting from '@/models/Setting'

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
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
    console.error('Error fetching site_url in robots:', error);
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

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
