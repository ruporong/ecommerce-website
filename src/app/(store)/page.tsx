import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import Banner from '@/models/Banner';
import Section from '@/models/Section';
import Category from '@/models/Category';
import HomeClient from './HomeClient';

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

export default async function Home() {
  await connectToDatabase();
  
  // Fetch active banners
  const bannersRaw = await Banner.find({ status: 'active' }).sort({ order: 1 }).lean();
  const banners = JSON.parse(JSON.stringify(bannersRaw));

  // Fetch categories for homepage
  const categoriesRaw = await Category.find({ is_active: true, show_on_home: true }).sort({ createdAt: 1 }).lean();
  const fallbackCategories = categoriesRaw.length > 0 
    ? categoriesRaw 
    : await Category.find({ is_active: true }).sort({ createdAt: 1 }).lean();
  const categories = JSON.parse(JSON.stringify(fallbackCategories));

  // Fetch active sections
  const sectionsRaw = await Section.find({ status: 'active' }).sort({ order: 1 }).lean();
  
  // Resolve products for each section
  const sectionsWithProducts = await Promise.all(
    sectionsRaw.map(async (sec: any) => {
      let sectionProducts = [] as any[];
      
      if (sec.type === 'new_arrivals') {
        sectionProducts = await Product.find({ is_active: true }).sort({ createdAt: -1 }).limit(8).lean();
      } else if (sec.type === 'featured') {
        // Just picking random or latest for now if no specific 'featured' flag
        sectionProducts = await Product.find({ is_active: true }).sort({ updatedAt: -1 }).limit(8).lean();
      } else if (sec.type === 'category' && sec.category_id) {
        sectionProducts = await Product.find({ is_active: true, category_id: sec.category_id }).limit(8).lean();
      } else if (sec.type === 'custom' && sec.products?.length > 0) {
        sectionProducts = await Product.find({ _id: { $in: sec.products }, is_active: true }).lean();
      }
      
      return {
        ...sec,
        _id: sec._id.toString(),
        category_id: sec.category_id?.toString() || null,
        resolvedProducts: JSON.parse(JSON.stringify(sectionProducts))
      };
    })
  );

  return (
    <>
      <HomeClient banners={banners} sections={sectionsWithProducts} categories={categories} />
    </>
  );
}
