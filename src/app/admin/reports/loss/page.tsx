
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function Page() {
  await connectToDatabase();
  const lostOrders = await Order.find({ status: { $in: ['cancelled', 'returned', 'failed'] } }).sort({ createdAt: -1 }).lean() as any[];
  
  const totalCancelled = lostOrders.filter(o => o.status === 'cancelled').reduce((sum, o) => sum + (o.total_price || 0), 0);
  const totalReturned = lostOrders.filter(o => o.status === 'returned').reduce((sum, o) => sum + (o.total_price || 0), 0);
  const totalFailed = lostOrders.filter(o => o.status === 'failed').reduce((sum, o) => sum + (o.total_price || 0), 0);
  const totalLostRevenue = totalCancelled + totalReturned + totalFailed;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Loss / Unsuccessful Orders Report</h1>
        <p className="text-sm text-zinc-500 mt-1">Analysis of cancelled, returned, or failed orders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">Estimated Lost Revenue</h3>
          <p className="text-2xl font-semibold text-red-600 mt-2">৳ {totalLostRevenue.toLocaleString()}</p>
          <p className="text-xs text-zinc-400 mt-1">Total of all unsuccessful orders</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">Cancelled Orders Value</h3>
          <p className="text-2xl font-semibold text-orange-600 mt-2">৳ {totalCancelled.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">Returned Orders Value</h3>
          <p className="text-2xl font-semibold text-orange-600 mt-2">৳ {totalReturned.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">Failed Orders Value</h3>
          <p className="text-2xl font-semibold text-orange-600 mt-2">৳ {totalFailed.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium text-right">Lost Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {lostOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No data available.</td></tr>
              ) : lostOrders.map((o) => (
                <tr key={o._id.toString()}>
                  <td className="px-6 py-3">{format(new Date(o.createdAt), 'dd MMM yyyy')}</td>
                  <td className="px-6 py-3 font-medium">{o.order_id}</td>
                  <td className="px-6 py-3">{o.customer_name || 'Unknown'}</td>
                  <td className="px-6 py-3 text-right">৳ {o.total_price?.toLocaleString()}</td>
                  <td className="px-6 py-3">
                     <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs capitalize">{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
