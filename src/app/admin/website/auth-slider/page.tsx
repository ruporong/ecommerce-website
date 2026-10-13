export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Banner from '@/models/Banner';
import BannersClient from '../banners/BannersClient';

export default async function AuthSliderPage() {
  await connectToDatabase();
  const banners = await Banner.find({ type: 'auth' }).sort({ order: 1 }).lean();
  return <BannersClient initialData={JSON.parse(JSON.stringify(banners))} bannerType="auth" />;
}
