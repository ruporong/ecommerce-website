export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Section from '@/models/Section';
import Category from '@/models/Category';
import SectionsClient from './SectionsClient';

export default async function SectionsPage() {
  await connectToDatabase();
  const sections = await Section.find().sort({ order: 1 }).lean();
  const categories = await Category.find().sort({ name: 1 }).lean();
  
  return <SectionsClient 
    initialData={JSON.parse(JSON.stringify(sections))} 
    categories={JSON.parse(JSON.stringify(categories))}
  />;
}
