import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import StatusSelect from '@/components/admin/StatusSelect';
import FraudCheckButton from '@/components/admin/FraudCheckButton';
import BookCourierButton from '@/components/admin/BookCourierButton';
import TableSearch from '@/components/admin/TableSearch';
import OrderModalTrigger from '@/components/admin/OrderModalTrigger';
import DeleteOrderButton from '@/components/admin/DeleteOrderButton';
import Pagination from '@/components/admin/Pagination';
import PrintInvoiceButton from '@/components/admin/PrintInvoiceButton';

export default async function AdminOrders({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await connectToDatabase();
  
  const resolvedParams = await searchParams;
  const currentStatus = (resolvedParams?.status as string) || 'all';
  const searchQuery = (resolvedParams?.q as string) || '';
  const page = parseInt((resolvedParams?.page as string) || '1');
  const limit = 20;
  
  const query: any = {};
  
  if (currentStatus !== 'all') {
    query.status = currentStatus;
  }
  
  if (searchQuery) {
    query.$or = [
      { order_id: { $regex: searchQuery, $options: 'i' } },
      { customer_name: { $regex: searchQuery, $options: 'i' } },
      { customer_phone: { $regex: searchQuery, $options: 'i' } },
    ];
  }
  
  const totalOrders = await Order.countDocuments(query);
  const totalPages = Math.ceil(totalOrders / limit);
  
  const orders = await Order.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Orders</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and track your customer orders.</p>
        </div>
        <div className="flex items-center gap-3">
          <TableSearch placeholder="Search order ID, name or phone..." />
          <button className="bg-black hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-white text-gray-500 uppercase text-[11px] font-bold tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-5">Order ID</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Product</th>
                <th className="px-6 py-5 text-center">Source</th>
                <th className="px-6 py-5 text-center">Date</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 text-center">Courier</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery ? `No orders found matching "${searchQuery}".` : 'No orders found.'}
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order._id.toString()} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5 align-top">
                      <OrderModalTrigger order={JSON.parse(JSON.stringify(order))}>
                        <span className="font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors">{order.order_id}</span>
                      </OrderModalTrigger>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="font-medium text-gray-900">{order.customer_name}</div>
                      <div className="text-xs text-gray-500 mt-0.5 mb-2 max-w-[200px] truncate" title={order.customer_address}>
                        {order.customer_address}
                      </div>
                      <FraudCheckButton 
                        orderId={order._id.toString()} 
                        phone={order.customer_phone || 'N/A'} 
                        initialScore={order.fraud_score} 
                      />
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="font-medium text-gray-900 line-clamp-2 max-w-[250px]">{order.product_name}</div>
                      <div className="text-sm text-gray-500 mt-1">৳{(order.total_price || 0).toLocaleString('en-IN')}</div>
                    </td>
                    <td className="px-6 py-5 align-top text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 uppercase tracking-wider">
                        {order.source === 'web_chat' ? 'AI Chatbot' : (order.source || 'Website')}
                      </span>
                    </td>
                    <td className="px-6 py-5 align-top text-center whitespace-nowrap text-gray-600 text-sm">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-5 align-top text-center">
                      <div className="w-[140px] mx-auto">
                        <StatusSelect orderId={order._id.toString()} currentStatus={order.status || 'pending'} />
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top text-center">
                      <div className="w-[140px] mx-auto">
                        <BookCourierButton 
                          orderId={order._id.toString()} 
                          status={order.courier_status} 
                          consignmentId={order.courier_consignment_id} 
                        />
                      </div>
                    </td>
                      <td className="px-6 py-5 align-top text-right">
                      <div className="flex items-center justify-end gap-2">
                        <PrintInvoiceButton orderId={order._id.toString()} />
                        <OrderModalTrigger order={JSON.parse(JSON.stringify(order))}>
                          <span className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center" title="View Order">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </span>
                        </OrderModalTrigger>
                        <DeleteOrderButton orderId={order._id.toString()} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination totalPages={totalPages} currentPage={page} />
      </div>
    </div>
  );
}
