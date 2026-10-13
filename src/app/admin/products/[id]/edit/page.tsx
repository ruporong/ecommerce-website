import ProductForm from '@/components/admin/ProductForm';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import Attribute from '@/models/Attribute';
import SizeChart from '@/models/SizeChart';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  
  const { id } = await params;
  
  const product = await Product.findById(id).lean();
  
  if (!product) {
    notFound();
  }

  // Fetch relational data for dropdowns
  const categories = await Category.find({ is_active: { $ne: false } }).lean();
  const subCategories = await SubCategory.find().lean();
  const brands = await Attribute.find({ type: 'brand', is_active: { $ne: false } }).lean();
  const colors = await Attribute.find({ type: 'color', is_active: { $ne: false } }).lean();
  const tags = await Attribute.find({ type: 'tag', is_active: { $ne: false } }).lean();
  const sizeCharts = await SizeChart.find({ is_active: { $ne: false } }).lean();

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Edit Product</h2>
          <p className="text-sm text-gray-500 mt-1">Update your product catalog entry.</p>
        </div>
      </div>
      
      <ProductForm 
        initialData={JSON.parse(JSON.stringify(product))}
        categories={JSON.parse(JSON.stringify(categories))}
        subCategories={JSON.parse(JSON.stringify(subCategories))}
        brands={JSON.parse(JSON.stringify(brands))}
        colors={JSON.parse(JSON.stringify(colors))}
        tags={JSON.parse(JSON.stringify(tags))}
        sizeCharts={JSON.parse(JSON.stringify(sizeCharts))}
      />
    </div>
  );
}
