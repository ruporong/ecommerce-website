
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function Page() {
  await connectToDatabase();
  const orders = await Order.find().sort({ createdAt: -1 }).lean() as any[];
  
  const pending = orders.filter(o => o.status === 'pending').length;
  const completed = orders.filter(o => o.status === 'delivered').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Order Report</h1>
        <p className="text-sm text-zinc-500 mt-1">Detailed view of all orders and their current status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">Total Orders</h3>
          <p className="text-2xl font-semibold text-zinc-900 mt-2">{orders.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">Pending Orders</h3>
          <p className="text-2xl font-semibold text-orange-600 mt-2">{pending}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">Delivered</h3>
          <p className="text-2xl font-semibold text-green-600 mt-2">{completed}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Payment</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No data available.</td></tr>
              ) : orders.map((order) => (
                <tr key={order._id.toString()}>
                  <td className="px-6 py-3">{format(new Date(order.createdAt), 'dd MMM yyyy')}</td>
                  <td className="px-6 py-3 font-medium">{order.order_id}</td>
                  <td className="px-6 py-3">{order.payment_status}</td>
                  <td className="px-6 py-3 text-right">৳ {order.total_price?.toLocaleString()}</td>
                  <td className="px-6 py-3 capitalize">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
