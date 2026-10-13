
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function Page() {
  await connectToDatabase();
  // Revenue should represent actual successful sales (delivered + completed)
  const sales = await Order.find({ status: { $in: ['delivered', 'completed'] } }).sort({ createdAt: -1 }).lean() as any[];
  
  const totalAmount = sales.reduce((sum, s) => sum + (s.total_price || 0), 0);
  const thisMonthAmount = sales.filter(s => new Date(s.createdAt).getMonth() === new Date().getMonth() && new Date(s.createdAt).getFullYear() === new Date().getFullYear()).reduce((sum, s) => sum + (s.total_price || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Sales Report</h1>
        <p className="text-sm text-zinc-500 mt-1">Overview of total successful sales and revenue generated.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">Total Successful Orders</h3>
          <p className="text-2xl font-semibold text-zinc-900 mt-2">{sales.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">Total Revenue</h3>
          <p className="text-2xl font-semibold text-green-600 mt-2">৳ {totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">This Month Revenue</h3>
          <p className="text-2xl font-semibold text-green-600 mt-2">৳ {thisMonthAmount.toLocaleString()}</p>
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
                <th className="px-6 py-3 font-medium text-right">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {sales.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No data available.</td></tr>
              ) : sales.map((sale) => (
                <tr key={sale._id.toString()}>
                  <td className="px-6 py-3">{format(new Date(sale.createdAt), 'dd MMM yyyy')}</td>
                  <td className="px-6 py-3 font-medium">{sale.order_id}</td>
                  <td className="px-6 py-3">{sale.customer_name || 'N/A'}</td>
                  <td className="px-6 py-3 text-right">৳ {sale.total_price?.toLocaleString()}</td>
                  <td className="px-6 py-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs capitalize">{sale.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
