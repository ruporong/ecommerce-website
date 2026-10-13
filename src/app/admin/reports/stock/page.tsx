
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

export default async function Page() {
  await connectToDatabase();
  const products = await Product.find({ is_active: true }).sort({ stock: 1 }).lean() as any[];
  
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const stockCostValue = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.cost_price || 0)), 0);
  const stockRetailValue = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0);
  const lowStock = products.filter(p => p.stock < 10).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Stock Report</h1>
        <p className="text-sm text-zinc-500 mt-1">Current inventory levels and stock valuations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">Total Items in Stock</h3>
          <p className="text-2xl font-semibold text-zinc-900 mt-2">{totalStock}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">Stock Cost Value</h3>
          <p className="text-2xl font-semibold text-orange-600 mt-2">৳ {stockCostValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">Estimated Retail Value</h3>
          <p className="text-2xl font-semibold text-green-600 mt-2">৳ {stockRetailValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">Low Stock Products</h3>
          <p className="text-2xl font-semibold text-red-600 mt-2">{lowStock}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3 font-medium">Product Name</th>
                <th className="px-6 py-3 font-medium">SKU</th>
                <th className="px-6 py-3 font-medium">Unit Price</th>
                <th className="px-6 py-3 font-medium text-right">Stock Qty</th>
                <th className="px-6 py-3 font-medium text-right">Retail Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {products.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No data available.</td></tr>
              ) : products.map((p) => (
                <tr key={p._id.toString()}>
                  <td className="px-6 py-3 font-medium">{p.name}</td>
                  <td className="px-6 py-3">{p.slug || '-'}</td>
                  <td className="px-6 py-3">৳ {p.price?.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right">
                    <span className={`px-2 py-1 rounded-md text-xs ${p.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">৳ {((p.stock || 0) * (p.price || 0)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
