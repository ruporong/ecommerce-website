import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import Setting from '@/models/Setting';
import ProductCard from '@/components/ProductCard';
import ShopFilter from '@/components/ShopFilter';
import Link from 'next/link';

export async function generateMetadata() {
  await connectToDatabase();
  const storeSetting = await Setting.findOne({ key: 'store_name' }).lean();
  const storeName = (storeSetting as any)?.value || 'Ruporong';
  return {
    title: `All Products | ${storeName}`,
    description: `Explore the complete collection of elegant women's wear, accessories, jewelry, and more at ${storeName}.`
  };
}

export default async function ShopPage({
  searchParams
}: {
  searchParams: Promise<{
    category?: string;
    min_price?: string;
    max_price?: string;
    availability?: string;
    sort?: string;
  }>;
}) {
  const resolvedQuery = await searchParams;
  await connectToDatabase();

  // Fetch all active categories
  const categoriesRaw = await Category.find({ is_active: true }).sort({ sort_order: 1, name: 1 }).lean();
  const categories = JSON.parse(JSON.stringify(categoriesRaw));

  // Build MongoDB query
  const query: any = {
    is_active: true
  };

  // Category filter
  let activeCategoryName = '';
  if (resolvedQuery?.category) {
    const selectedCategory = categories.find((c: any) => c.slug === resolvedQuery.category);
    if (selectedCategory) {
      query.category_id = selectedCategory._id;
      activeCategoryName = selectedCategory.name;
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
        <span className="text-charcoal">{activeCategoryName ? activeCategoryName : 'Shop'}</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-gray-100 mb-10">
        <div>
          <h1 className="font-serif text-3xl md:text-5xl text-charcoal mb-2">
            {activeCategoryName ? activeCategoryName : 'All Products'}
          </h1>
          <p className="text-gray-500 font-serif italic text-sm md:text-base">
            Discover our curated collection of luxury fashion, ornaments, skincare and accessories.
          </p>
        </div>
      </div>

      {/* Layout with Left Filter Sidebar and Right Products Grid */}
      <div className="flex flex-col md:flex-row gap-8 lg:gap-10 items-start">
        {/* Left Filter Sidebar */}
        <ShopFilter
          categories={categories}
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {products.map((product: any) => (
                <div key={product._id} className="w-full">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-gray-50 rounded-2xl border border-gray-100 p-6">
              <p className="text-gray-500 font-serif text-lg mb-2">No products match your filter criteria.</p>
              <p className="text-gray-400 text-sm mb-6">Try adjusting your category, price range, or availability options.</p>
              <Link 
                href="/shop" 
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
