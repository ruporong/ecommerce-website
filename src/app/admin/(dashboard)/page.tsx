import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Link from 'next/link';
import OrderModalTrigger from '@/components/admin/OrderModalTrigger';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  await connectToDatabase();
  
  // Fetch all orders
  const allOrders = await Order.find({}).lean();
  
  let totalRevenue = 0;
  let totalOrders = allOrders.length;
  let refunds = 0;
  const customers = new Set();

  allOrders.forEach((order: any) => {
    if (order.status !== 'cancelled' && order.status !== 'refunded') {
      totalRevenue += (order.total_price || 0);
    }
    if (order.status === 'refunded' || order.status === 'returned') {
      refunds++;
    }
    if (order.customer_phone) {
      customers.add(order.customer_phone);
    }
  });

  const activeCustomers = customers.size;

  // Recent Orders
  const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5).lean();

  // Chart Data (Last 7 Days)
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const chartData = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  let maxDailyRevenue = 0;

  for (let i = 6; i >= 0; i--) {
    const startOfDay = new Date(today);
    startOfDay.setDate(today.getDate() - i);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setDate(today.getDate() - i);
    endOfDay.setHours(23, 59, 59, 999);

    const dailyOrders = allOrders.filter((o: any) => {
      const d = new Date(o.createdAt || o.updatedAt || Date.now());
      return d >= startOfDay && d <= endOfDay && o.status !== 'cancelled' && o.status !== 'refunded';
    });

    const dailyRevenue = dailyOrders.reduce((sum, o: any) => sum + (o.total_price || 0), 0);
    if (dailyRevenue > maxDailyRevenue) maxDailyRevenue = dailyRevenue;

    chartData.push({
      day: days[startOfDay.getDay()],
      revenue: dailyRevenue,
      date: startOfDay.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    });
  }

  // Calculate Y-axis steps dynamically
  // Make max divisible by 4 for clean intervals
  const yMax = Math.max(Math.ceil(maxDailyRevenue / 4000) * 4000, 4000);
  const ySteps = [yMax, yMax * 0.75, yMax * 0.5, yMax * 0.25, 0];

  const formatYAxis = (val: number) => {
    if (val >= 1000) return (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + 'k';
    return val;
  };

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('en-IN');
  };

  const stats = [
    { name: 'Total Revenue', value: `৳ ${formatMoney(totalRevenue)}`, change: '+0%', isUp: true },
    { name: 'Total Orders', value: formatMoney(totalOrders), change: '+0%', isUp: true },
    { name: 'Active Customers', value: formatMoney(activeCustomers), change: '+0%', isUp: true },
    { name: 'Refunds', value: refunds.toString(), change: '0%', isUp: false },
  ];

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Overview</h2>
        <p className="text-sm text-gray-500 mt-1">Here is what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{stat.name}</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-gray-900 tracking-tight">{stat.value}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart (CSS) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-gray-900">Revenue over time</h3>
            <select className="text-sm border-gray-200 rounded-lg text-gray-600 focus:ring-black focus:border-black py-1.5 pl-3 pr-8 bg-gray-50">
              <option>Last 7 days</option>
            </select>
          </div>
          
          <div className="flex h-64 mt-4">
            {/* Y-axis */}
            <div className="w-10 flex flex-col justify-between text-[10px] text-gray-400 pb-8 pr-3 text-right font-medium">
              {ySteps.map((val, i) => (
                <span key={i}>{formatYAxis(val)}</span>
              ))}
            </div>
            
            {/* Chart Area */}
            <div className="flex-1 relative">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pb-8 pointer-events-none">
                {[4, 3, 2, 1, 0].map(i => (
                  <div key={i} className="w-full border-t border-gray-100 border-dashed h-0"></div>
                ))}
              </div>
              
              {/* Bars */}
              <div className="absolute inset-0 pb-8 flex items-end justify-around px-2 z-10">
                {chartData.map((data, i) => {
                  const heightPercent = yMax > 0 ? (data.revenue / yMax) * 100 : 0;
                  return (
                    <div key={i} className="relative group w-8 sm:w-12 h-full flex flex-col justify-end items-center">
                      <div 
                        className="w-full bg-[#1A1A1A] hover:bg-[#333333] rounded-t-md transition-all duration-300" 
                        style={{ height: `${heightPercent}%`, minHeight: data.revenue > 0 ? '4px' : '0' }}
                      >
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-medium py-1.5 px-2.5 rounded shadow-lg whitespace-nowrap transition-opacity pointer-events-none flex flex-col items-center">
                          <span>৳ {formatMoney(data.revenue)}</span>
                          <span className="text-gray-400 text-[8px] mt-0.5">{data.date}</span>
                        </div>
                      </div>
                      <div className="absolute -bottom-6 text-[10px] sm:text-xs text-gray-500 font-medium">
                        {data.day}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-gray-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all</Link>
          </div>
          
          <div className="space-y-5">
            {recentOrders.length > 0 ? recentOrders.map((order: any, i: number) => (
              <div key={i} className="flex items-center justify-between pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div>
                  <OrderModalTrigger order={JSON.parse(JSON.stringify(order))}><span className="text-sm font-medium text-gray-900 hover:underline">{order.order_id}</span></OrderModalTrigger>
                  <div className="text-xs text-gray-500 mt-0.5">{order.customer_name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">৳ {formatMoney(order.total_price || 0)}</div>
                  <div className={`text-[10px] mt-1 font-medium px-2 py-0.5 rounded-full inline-block
                    ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 
                      order.status === 'shipped' ? 'bg-blue-50 text-blue-600' : 
                      order.status === 'cancelled' || order.status === 'refunded' ? 'bg-red-50 text-red-600' :
                      'bg-orange-50 text-orange-600'}`}>
                    {order.status || 'pending'}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-sm text-gray-500 py-4 text-center">No recent orders.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
