import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Setting from '@/models/Setting';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = params?.q || '';
  await connectToDatabase();
  const storeSetting = await Setting.findOne({ key: 'store_name' }).lean();
  const storeName = (storeSetting as any)?.value || 'Ruporong';
  return {
    title: q ? `Search results for "${q}" | ${storeName}` : `Search Products | ${storeName}`,
    description: `Explore search results for "${q}" at ${storeName}.`
  };
}

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = (params?.q || '').trim();

  await connectToDatabase();

  let products: any[] = [];
  if (q) {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    const matchingCategories = await Category.find({
      name: regex,
      is_active: true
    }).select('_id').lean();
    const categoryIds = matchingCategories.map((c: any) => c._id);

    const mongoQuery: any = {
      is_active: true,
      $or: [
        { name: regex },
        { slug: regex },
        { description: regex },
        ...(categoryIds.length > 0 ? [{ category_id: { $in: categoryIds } }] : [])
      ]
    };

    const raw = await Product.find(mongoQuery)
      .populate('category_id', 'name slug')
      .sort({ createdAt: -1 })
      .lean();

    products = raw.map((p: any) => ({
      ...JSON.parse(JSON.stringify(p)),
      category: p.category_id?.name || 'Collection'
    }));
  }

  // Fetch popular categories for suggestion pills
  const categoriesRaw = await Category.find({ is_active: true }).limit(8).lean();
  const categories = JSON.parse(JSON.stringify(categoriesRaw));

  return (
    <main className="py-10 md:py-16 px-4 md:px-8 max-w-[1600px] mx-auto min-h-[70vh]">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 mb-6">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <span className="text-charcoal">Search</span>
      </nav>

      {/* Search Header & In-page Search Bar */}
      <div className="pb-8 border-b border-gray-100 mb-10">
        <div className="max-w-2xl">
          <h1 className="font-serif text-3xl md:text-5xl text-charcoal mb-3">
            {q ? `Search: "${q}"` : 'Search Products'}
          </h1>
          <p className="text-gray-500 font-serif italic text-sm md:text-base mb-6">
            {q 
              ? `Found ${products.length} ${products.length === 1 ? 'item' : 'items'} matching your query` 
              : 'Discover timeless dresses, sarees, and fine collections.'}
          </p>

          <form 
            action="/search" 
            method="GET" 
            className="flex items-center bg-white border border-gray-300 rounded-full pl-4 pr-2 py-1.5 shadow-xs focus-within:border-charcoal focus-within:ring-2 focus-within:ring-charcoal/10 transition-all"
          >
            <svg 
              className="w-5 h-5 text-gray-400 shrink-0 pointer-events-none" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" strokeWidth="2"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2"></line>
            </svg>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by product name, category, or style..."
              className="flex-1 min-w-0 bg-transparent border-none outline-none px-3 py-2 text-sm text-charcoal placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="shrink-0 px-5 py-2.5 bg-charcoal text-white text-xs uppercase tracking-widest font-semibold rounded-full hover:bg-black transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Results Section */}
      {products.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-8">
            <span className="text-xs uppercase tracking-widest text-gray-500 font-medium">
              Showing {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product: any) => (
              <div key={product._id} className="w-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 md:py-24 bg-gray-50/70 rounded-3xl border border-gray-100 p-8 max-w-3xl mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          
          <h2 className="font-serif text-2xl md:text-3xl text-charcoal mb-2">
            {q ? `No products found for "${q}"` : 'Start your search'}
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
            {q 
              ? 'Try checking your spelling, using more general keywords, or browse our popular categories below.' 
              : 'Type what you are looking for in the search bar above to see results.'}
          </p>

          {/* Quick Categories */}
          {categories.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-4">
                Popular Categories
              </p>
              <div className="flex flex-wrap gap-2.5 justify-center">
                {categories.map((cat: any) => (
                  <Link
                    key={cat._id}
                    href={`/category/${cat.slug}`}
                    className="px-4 py-2 bg-white border border-gray-200/90 rounded-full text-xs font-medium text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-white transition-all shadow-xs"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
