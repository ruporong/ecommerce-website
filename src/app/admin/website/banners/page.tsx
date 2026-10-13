export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Banner from '@/models/Banner';
import BannersClient from './BannersClient';

export default async function BannersPage() {
  await connectToDatabase();
  const banners = await Banner.find({ type: { $ne: "auth" } }).sort({ order: 1 }).lean();
  return <BannersClient initialData={JSON.parse(JSON.stringify(banners))} bannerType="home" />;
}
