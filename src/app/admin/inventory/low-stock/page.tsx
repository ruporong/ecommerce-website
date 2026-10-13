export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import InventoryOverviewClient from '../overview/InventoryOverviewClient';

export default async function LowStockPage() {
  await connectToDatabase();
  
  // Show products with stock <= 5
  const products = await Product.find({ stock: { $lte: 5 } })
    .select('name slug stock mainImages is_active')
    .sort({ stock: 1 })
    .lean();
    
  const productsData = JSON.parse(JSON.stringify(products));

  return (
    <div>
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
        <svg className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <div>
          <h3 className="text-yellow-800 font-bold">Low Stock Alerts</h3>
          <p className="text-sm text-yellow-700 mt-1">These products have 5 or fewer items remaining in stock. Consider restocking them soon.</p>
        </div>
      </div>
      <InventoryOverviewClient initialProducts={productsData} />
    </div>
  );
}
