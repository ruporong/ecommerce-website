import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import TrackOrder from "./TrackOrder";
import Link from "next/link";

export default async function UserDashboardOverview() {
  const session = await getServerSession(await getAuthOptions());
  const user = session?.user;

  
  await connectToDatabase();
  
  let userId = user?.id;
  let dbUser = userId ? await User.findById(userId).lean() : null;
  
  if (!dbUser && user?.email) {
    dbUser = await User.findOne({ email: user.email }).lean();
    if (dbUser) userId = dbUser._id.toString();
  }
  
  // If still no user ID (invalid session), prevent showing all orders
  
  // If still no user ID (invalid session), prevent showing all orders
  let query: any = userId ? { user_id: userId } : { user_id: 'INVALID_PREVENT_ALL' };
  
  // Link guest orders if phone number matches
  // dbUser is already fetched above
  if (dbUser && dbUser.phone) {
    query = { 
      $or: [
        { user_id: userId },
        { customer_phone: dbUser.phone }
      ] 
    };
  }


  // Get order stats
  const totalOrders = await Order.countDocuments(query);
  const pendingOrders = await Order.countDocuments({ ...query, status: { $in: ['Pending', 'Processing'] } });
  const recentOrders = await Order.find(query).sort({ createdAt: -1 }).limit(3).lean();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'Customer'}!</h1>
        <p className="text-gray-500 mt-1">From your dashboard you can view your recent orders and manage your account details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex items-center justify-between">
          <div>
            <p className="text-blue-600 font-medium mb-1">Total Orders</p>
            <h3 className="text-3xl font-bold text-blue-900">{totalOrders}</h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 flex items-center justify-between">
          <div>
            <p className="text-orange-600 font-medium mb-1">Pending Orders</p>
            <h3 className="text-3xl font-bold text-orange-900">{pendingOrders}</h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-orange-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <TrackOrder />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          <Link href="/user/dashboard/orders" className="text-sm text-blue-600 font-medium hover:underline">View All</Link>
        </div>
        
        {recentOrders.length > 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order: any) => (
                    <tr key={order._id.toString()} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-gray-900">#{order.order_id || order._id.toString().slice(-6).toUpperCase()}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        ৳{order.total_price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            <p className="text-gray-500 font-medium">You haven't placed any orders yet.</p>
            <Link href="/products" className="inline-block mt-4 bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">Start Shopping</Link>
          </div>
        )}
      </div>
    </div>
  );
}
