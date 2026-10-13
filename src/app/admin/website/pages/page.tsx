export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Page from '@/models/Page';
import PagesClient from './PagesClient';

export default async function PagesPage() {
  await connectToDatabase();
  const pages = await Page.find().sort({ createdAt: -1 }).lean();
  return <PagesClient initialData={JSON.parse(JSON.stringify(pages))} />;
}
