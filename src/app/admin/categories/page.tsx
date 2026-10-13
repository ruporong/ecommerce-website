import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import CategoryClient from './CategoryClient';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  await dbConnect();
  
  // Fetch categories
  const categories = await Category.find().sort({ createdAt: -1 }).lean();
  const subCategories = await SubCategory.find().sort({ createdAt: -1 }).lean();
  
  // Serialize for Client Component
  const serializedCategories = categories.map((cat: any) => ({
    _id: cat._id.toString(),
    name: cat.name,
    slug: cat.slug,
    image: cat.image || null,
    meta_title: cat.meta_title || null,
    meta_description: cat.meta_description || null,
    is_active: cat.is_active !== undefined ? cat.is_active : true,
    show_on_home: cat.show_on_home || false,
    createdAt: cat.createdAt?.toString(),
    subCategories: subCategories
      .filter((sub: any) => sub.parent_category_id.toString() === cat._id.toString())
      .map((sub: any) => ({
        _id: sub._id.toString(),
        name: sub.name,
        slug: sub.slug,
        meta_title: sub.meta_title || null,
        meta_description: sub.meta_description || null
      }))
  }));

  return (
    <div className="w-full pt-2 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Categories & Sub-Categories</h2>
          <p className="text-sm text-gray-500 mt-1">Organize your products with a clear hierarchy.</p>
        </div>
      </div>

      <CategoryClient initialCategories={serializedCategories} />
    </div>
  );
}
