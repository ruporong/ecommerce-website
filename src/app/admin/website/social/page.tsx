export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import SocialClient from './SocialClient';

export default async function SocialPage() {
  await connectToDatabase();
  const setting = await Setting.findOne({ key: 'social_links' }).lean();
  const links = setting?.value ? JSON.parse(setting.value) : [];
  
  return <SocialClient initialData={links} />;
}
