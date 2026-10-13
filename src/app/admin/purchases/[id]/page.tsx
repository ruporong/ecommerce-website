export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Purchase from '@/models/Purchase';
import Supplier from '@/models/Supplier';
import Link from 'next/link';
import { notFound } from 'next/navigation';


export default async function PurchaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  const resolvedParams = await params;
  
  const purchase = await Purchase.findById(resolvedParams.id)
    .populate({ path: 'supplier_id', select: 'name email phone address', model: Supplier })
    .lean();
    
  if (!purchase) return notFound();

  return (
    <div className="p-6 md:p-10 w-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase {purchase.purchase_no}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(purchase.purchase_date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <Link 
          href="/admin/purchases"
          className="text-sm font-semibold text-gray-600 hover:text-black transition-colors"
        >
          &larr; Back to Purchases
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Order Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Unit Cost</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Qty</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {purchase.items.map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="px-4 py-4 font-medium text-gray-900">{item.product_name}</td>
                    <td className="px-4 py-4 text-right text-gray-500">৳{item.unit_cost.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right font-medium text-gray-900">{item.quantity}</td>
                    <td className="px-4 py-4 text-right font-bold text-gray-900">৳{item.subtotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="text-gray-900 font-bold">৳{purchase.total_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Shipping Cost</span>
                <span className="text-gray-900 font-bold">৳{purchase.shipping_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Discount</span>
                <span className="text-gray-900 font-bold">- ৳{purchase.discount.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between">
                <span className="text-gray-900 font-bold">Grand Total</span>
                <span className="text-xl text-gray-900 font-black">৳{purchase.grand_total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Summary</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                <span className="px-2.5 py-1 text-xs font-bold rounded-md uppercase tracking-wider bg-gray-100 text-gray-700">{purchase.status}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment</p>
                <span className="px-2.5 py-1 text-xs font-bold rounded-md uppercase tracking-wider bg-gray-100 text-gray-700">{purchase.payment_status}</span>
              </div>
              {purchase.reference_no && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Reference No</p>
                  <p className="text-sm font-medium text-gray-900">{purchase.reference_no}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Supplier Details</h2>
            {purchase.supplier_id ? (
              <div className="space-y-3">
                <p className="font-bold text-gray-900">{(purchase.supplier_id as any).name}</p>
                <p className="text-sm text-gray-600">{(purchase.supplier_id as any).phone}</p>
                <p className="text-sm text-gray-600">{(purchase.supplier_id as any).email}</p>
                <p className="text-sm text-gray-600">{(purchase.supplier_id as any).address}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Unknown Supplier</p>
            )}
          </div>
          
          {purchase.notes && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Notes</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{purchase.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
