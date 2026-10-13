import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import { formatDistanceToNow } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function CustomerActivityPage() {
  await connectToDatabase();
  
  // Fetch real data for activity
  const recentCustomers = await User.find({ role: 'customer' }).sort({ createdAt: -1 }).limit(5).lean();
  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10).lean();

  const activities: any[] = [];

  recentCustomers.forEach((user: any) => {
    activities.push({
      id: `user-${user._id}`,
      type: 'registration',
      title: 'New Registration',
      description: `${user.name || 'A customer'} created a new account (${user.email}).`,
      date: new Date(user.createdAt),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
      ),
      color: 'bg-green-100 text-green-600'
    });
  });

  recentOrders.forEach((order: any) => {
    activities.push({
      id: `order-${order._id}`,
      type: 'order',
      title: 'Order Placed',
      description: `${order.customer_name} placed an order (${order.order_id}) for ৳${order.total_price.toLocaleString('en-IN')}.`,
      date: new Date(order.createdAt),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
      ),
      color: 'bg-blue-100 text-blue-600'
    });
  });

  // Sort combined activities by date descending
  activities.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Activity</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time actions and behavior of your customers.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
        <h3 className="font-medium text-gray-900 mb-6">Recent Activity Timeline</h3>
        
        {activities.length > 0 ? (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {activities.map((activity) => (
              <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${activity.color}`}>
                  {activity.icon}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm ml-4 md:ml-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-gray-900">{activity.title}</span>
                    <span className="text-xs text-gray-500">{formatDistanceToNow(activity.date, { addSuffix: true })}</span>
                  </div>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No recent activity found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
