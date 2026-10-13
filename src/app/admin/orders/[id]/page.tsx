import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import StatusSelect from '@/components/admin/StatusSelect';
import BookCourierButton from '@/components/admin/BookCourierButton';
import PrintInvoiceButton from '@/components/admin/PrintInvoiceButton';

type Props = {
  params: Promise<{ id: string }>;
};

// Helper for status colors
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'shipped': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'processing': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
    default: return 'bg-amber-50 text-amber-700 border-amber-200'; // pending
  }
};

export default async function OrderDetailsPage({ params }: Props) {
  const { id } = await params;
  await connectToDatabase();
  
  const order = await Order.findById(id).lean();

  if (!order) {
    notFound();
  }

  const statusColor = getStatusColor(order.status);
  const isHighRisk = order.fraud_score > 60;

  return (
    <div className="w-full w-full pb-12">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-charcoal hover:shadow-sm transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.order_id}</h1>
              <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border ${statusColor}`}>
                {order.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <PrintInvoiceButton orderId={order._id.toString()} variant="button" />
          <div className="rounded-lg overflow-hidden">
             <StatusSelect orderId={order._id.toString()} currentStatus={order.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column (Main details) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-5 bg-gray-50/30 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              </div>
              <h2 className="text-base font-bold text-gray-900">Order Items</h2>
            </div>
            
            <div className="p-6">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium text-center">Qty</th>
                    <th className="pb-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr className="group">
                    <td className="py-4 flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm mb-1">{order.product_name}</div>
                        <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded inline-block">{order.product_details || 'Standard'}</div>
                      </div>
                    </td>
                    <td className="py-4 text-center font-medium text-gray-700 text-sm">
                      {order.product_details?.match(/Qty: (\d+)/)?.[1] || 1}
                    </td>
                    <td className="py-4 text-right font-bold text-gray-900 text-sm">
                      ৳{order.total_price}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">৳{order.total_price}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-lg">৳{order.total_price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Courier & Logistics */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-5 bg-gray-50/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
                </div>
                <h2 className="text-base font-bold text-gray-900">Courier Integration</h2>
              </div>
              <BookCourierButton 
                orderId={order._id.toString()} 
                status={order.courier_status} 
                consignmentId={order.courier_consignment_id} 
              />
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Courier Status {order.courier_provider ? `(${order.courier_provider})` : ""}</span>
                <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${order.courier_status ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  {order.courier_status || 'Not Booked Yet'}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Consignment ID</span>
                {order.courier_consignment_id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                      {order.courier_consignment_id}
                    </span>
                    <button className="text-gray-400 hover:text-charcoal transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    </button>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">N/A</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar details) */}
        <div className="space-y-6">
          
          {/* Customer Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-5 bg-gray-50/30 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <h2 className="text-base font-bold text-gray-900">Customer</h2>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-charcoal to-gray-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {order.customer_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{order.customer_name}</h3>
                  <p className="text-sm text-gray-500">Customer</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  <div>
                    <a href={`tel:${order.customer_phone}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">{order.customer_phone || 'N/A'}</a>
                  </div>
                </div>
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {order.customer_address}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Risk & Metadata */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-5 bg-gray-50/30 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <h2 className="text-base font-bold text-gray-900">Fraud & Source</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isHighRisk ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"></path></svg>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Risk Analysis</span>
                    <span className="text-sm font-bold text-gray-900">Fraud Score: <span className={isHighRisk ? 'text-red-600' : 'text-green-600'}>{order.fraud_score}%</span></span>
                  </div>
                </div>
                <div className="text-xs font-medium text-gray-500">
                  {isHighRisk ? 'High Risk' : 'Low Risk'}
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Order Source</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 capitalize">
                  {order.source === 'web_chat' ? (
                    <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg> AI Chatbot</>
                  ) : order.source}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
