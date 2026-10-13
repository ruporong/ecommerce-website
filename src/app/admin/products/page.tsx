import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Link from 'next/link';
import DeleteProductButton from '@/components/admin/DeleteProductButton';
import TableSearch from '@/components/admin/TableSearch';
import Image from 'next/image';
import Pagination from '@/components/admin/Pagination';

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await dbConnect();
  
  const resolvedParams = await searchParams;
  const searchQuery = (resolvedParams?.q as string) || '';
  const page = parseInt((resolvedParams?.page as string) || '1');
  const limit = 20;
  
  const query: any = {};
  if (searchQuery) {
    query.$or = [
      { name: { $regex: searchQuery, $options: 'i' } }
    ];
  }

  Category; // Prevent tree-shaking
  
  const totalProducts = await Product.countDocuments(query);
  const totalPages = Math.ceil(totalProducts / limit);
  
  const products = await Product.find(query).populate('category_id', 'name').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();

  return (
    <div className="w-full pt-2">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div className="w-full md:w-auto">
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Product Catalog</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Manage your store's inventory, pricing, and visibility.</p>
        </div>
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="flex-1 md:flex-none">
            <TableSearch placeholder="Search products..." />
          </div>
          <Link href="/admin/products/new" className="bg-black hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add Product
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {products.length === 0 ? (
          <div className="p-10 text-center py-20">
            <div className="w-16 h-16 mx-auto bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">
              {searchQuery ? 'No products found' : 'No products yet'}
            </h3>
            <p className="text-sm text-gray-500">
              {searchQuery ? `No results match "${searchQuery}".` : 'Get started by adding your first product.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product: any) => (
                  <tr key={product._id.toString()} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0 relative">
                          {(product.mainImages && product.mainImages[0]) || (product.images && product.images[0]) ? (
                            <Image src={product.mainImages?.[0] || product.images?.[0]} alt={product.name} fill sizes="48px" unoptimized className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <Link href={`/admin/products/${product._id.toString()}/edit`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
                            {product.name}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        {product.category_id?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">৳{product.price.toLocaleString('en-IN')}</div>
                      {product.compare_at_price && (
                        <div className="text-xs text-gray-400 line-through">৳{product.compare_at_price.toLocaleString('en-IN')}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        product.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {product.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        <Link 
                          href={`/admin/products/${product._id.toString()}/edit`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </Link>
                        <DeleteProductButton id={product._id.toString()} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {products.length > 0 && <Pagination totalPages={totalPages} currentPage={page} />}
      </div>
    </div>
  );
}
