import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import Product from '@/models/Product';
import Setting from '@/models/Setting';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  await connectToDatabase();
  const category = await Category.findOne({ slug: resolvedParams.slug, is_active: true }).lean();
  if (!category) return { title: 'Category Not Found' };
  const storeSetting = await Setting.findOne({ key: 'store_name' }).lean();
  const storeName = (storeSetting as any)?.value || 'Ruporong';
  return {
    title: category.meta_title || `${category.name} | ${storeName}`,
    description: category.meta_description || `Explore our ${category.name} collection.`
  };
}

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sub?: string;
    min_price?: string;
    max_price?: string;
    availability?: string;
    sort?: string;
  }>;
}) {
  const resolvedParams = await params;
  const resolvedQuery = await searchParams;
  await connectToDatabase();

  const category = await Category.findOne({ slug: resolvedParams.slug, is_active: true }).lean();
  if (!category) {
    notFound();
  }

  const subCategoriesRaw = await SubCategory.find({ parent_category_id: category._id }).lean();
  const subCategories = JSON.parse(JSON.stringify(subCategoriesRaw));

  // Build MongoDB query
  const query: any = {
    category_id: category._id,
    is_active: true
  };

  // Subcategory filter
  if (resolvedQuery?.sub) {
    const selectedSub = subCategories.find((s: any) => s.slug === resolvedQuery.sub);
    if (selectedSub) {
      query.sub_category_id = selectedSub._id;
    }
  }

  // Price Range filter
  if (resolvedQuery?.min_price || resolvedQuery?.max_price) {
    query.price = {};
    if (resolvedQuery.min_price) {
      const min = Number(resolvedQuery.min_price);
      if (!isNaN(min)) query.price.$gte = min;
    }
    if (resolvedQuery.max_price) {
      const max = Number(resolvedQuery.max_price);
      if (!isNaN(max)) query.price.$lte = max;
    }
  }

  // Availability filter
  if (resolvedQuery?.availability === 'in_stock') {
    query.stock = { $gt: 0 };
  } else if (resolvedQuery?.availability === 'out_of_stock') {
    query.stock = { $lte: 0 };
  }

  // Sort Query
  let sortQuery: any = { createdAt: -1 };
  if (resolvedQuery?.sort === 'price_asc') sortQuery = { price: 1 };
  if (resolvedQuery?.sort === 'price_desc') sortQuery = { price: -1 };

  const productsRaw = await Product.find(query).sort(sortQuery).lean();
  const products = JSON.parse(JSON.stringify(productsRaw));

  return (
    <main className="py-10 md:py-16 px-4 md:px-8 max-w-[1600px] mx-auto min-h-[70vh]">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 mb-6">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <span className="text-charcoal">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-gray-100 mb-10">
        <div>
          <h1 className="font-serif text-3xl md:text-5xl text-charcoal mb-2">{category.name}</h1>
          <p className="text-gray-500 font-serif italic text-sm md:text-base">
            {category.meta_description || `Discover timeless pieces in our ${category.name} collection.`}
          </p>
        </div>
      </div>

      {/* Layout with Left Filter Sidebar and Right Products Grid */}
      <div className="flex flex-col md:flex-row gap-8 lg:gap-10 items-start">
        {/* Left Filter Sidebar */}
        <CategoryFilter
          categorySlug={category.slug}
          subCategories={subCategories}
          totalProducts={products.length}
        />

        {/* Right Product Grid */}
        <div className="flex-1 w-full min-w-0">
          <div className="hidden md:flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              Showing {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </span>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((product: any) => (
                <div key={product._id} className="w-full max-w-[280px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-gray-50 rounded-2xl border border-gray-100 p-6">
              <p className="text-gray-500 font-serif text-lg mb-2">No products match your filter criteria.</p>
              <p className="text-gray-400 text-sm mb-6">Try adjusting your price range or availability options.</p>
              <Link 
                href={`/category/${category.slug}`} 
                className="inline-block px-6 py-3 bg-charcoal text-white text-xs uppercase tracking-widest font-medium rounded-full hover:bg-black transition-colors"
              >
                Reset Filters
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
