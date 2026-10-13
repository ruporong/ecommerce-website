import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import Image from "next/image";

export default async function UserOrdersPage() {
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


  const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-500 mt-1">View and track your entire order history.</p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order._id.toString()} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <p className="text-gray-500 font-medium mb-0.5">Order Placed</p>
                    <p className="text-gray-900 font-semibold">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium mb-0.5">Total</p>
                    <p className="text-gray-900 font-semibold">৳{order.total_price}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium mb-0.5">Payment Method</p>
                    <p className="text-gray-900 font-semibold uppercase">{order.payment_method}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-sm font-medium mb-0.5">Order ID #{order.order_id || order._id.toString().slice(-6).toUpperCase()}</p>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {order.status}
                  </span>
                  {order.courier_consignment_id && (
                    <div className="mt-2">
                      <a 
                        href={`https://steadfast.com.bd/t/${order.courier_consignment_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center justify-end gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        Track Parcel
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Order Items */}
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                  <span className="font-semibold text-gray-900 block mb-2">Items Ordered:</span>
                  <div className="leading-relaxed whitespace-pre-wrap">{order.product_name}</div>
                  {order.customer_note && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="font-semibold text-gray-900 block mb-1">Your Note:</span>
                      <p className="italic text-gray-600">{order.customer_note}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Orders Found</h3>
          <p className="text-gray-500 font-medium">Looks like you haven't made any purchases yet.</p>
        </div>
      )}
    </div>
  );
}
