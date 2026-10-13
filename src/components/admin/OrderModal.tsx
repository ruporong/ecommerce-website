'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { checkFraud } from '@/app/actions/steadfastActions';
import { getProductsByNames } from '@/app/actions/productActions';
import toast from 'react-hot-toast';
import { updateAdminNote } from '@/app/actions/orderActions';

export default function OrderModal({ order, isOpen, onClose }: { order: any, isOpen: boolean, onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [isCheckingFraud, setIsCheckingFraud] = useState(false);
  const [currentFraudScore, setCurrentFraudScore] = useState(order.fraud_score || 0);
  const [history, setHistory] = useState<any>(null);
  const [productDetails, setProductDetails] = useState<Record<string, any>>({});
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [adminNote, setAdminNote] = useState(order.admin_note || '');
  const [isSavingNote, setIsSavingNote] = useState(false);
  
  const handleSaveNote = async () => {
    setIsSavingNote(true);
    const res = await updateAdminNote(order._id, adminNote);
    if (res.success) {
      toast.success('Note saved successfully');
      setIsEditingNote(false);
    } else {
      toast.error('Failed to save note');
    }
    setIsSavingNote(false);
  };

  const parseProducts = (productStr: string) => {
    if (!productStr) return [];
    return productStr.split(',').map(item => {
      item = item.trim();
      let qty = 1;
      let name = item;
      let size = null;
      let color = null;
      
      const qtyMatch = item.match(/^(\d+)x\s+(.+)$/i);
      if (qtyMatch) {
        qty = parseInt(qtyMatch[1], 10);
        name = qtyMatch[2].trim();
      }

      const attrMatch = name.match(/(.+) \[(.+)\]$/);
      if (attrMatch) {
        name = attrMatch[1].trim();
        const attrs = attrMatch[2].split(' | ');
        attrs.forEach(attr => {
          if (attr.startsWith('Size: ')) size = attr.replace('Size: ', '');
          if (attr.startsWith('Color: ')) color = attr.replace('Color: ', '');
        });
      }

      return { qty, name, size, color };
    });
  };
  
  const parsedProducts = parseProducts(order.product_name);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

  return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);



  useEffect(() => {
    if (!isOpen || !parsedProducts.length) return;
    const fetchDetails = async () => {
      const names = parsedProducts.map(p => p.name);
      const res = await getProductsByNames(names);
      if (res.success && res.data) {
        setProductDetails(res.data);
      }
    };
    fetchDetails();
  }, [isOpen, order.product_name]);

  if (!mounted || !isOpen) return null;

  const handleFraudCheck = async () => {
    setIsCheckingFraud(true);
    try {
      const res = await checkFraud(order._id.toString(), order.customer_phone);
      if (res.success && res.score !== undefined) {
        setCurrentFraudScore(res.score);
        if (res.history) setHistory(res.history);
        toast.success('Fraud check completed');
      } else {
        toast.error('Failed to check fraud score');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsCheckingFraud(false);
    }
  };

  const dateStr = new Date(order.createdAt).toLocaleString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
  });

  const fraudScore = currentFraudScore;
  const isHighRisk = fraudScore > 60;
  const riskColor = isHighRisk ? 'text-red-600 bg-red-50 border-red-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200';



  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white px-6 py-5 border-b border-gray-200 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Order Details</h2>
            <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-gray-200">#{order.order_id}</span>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors focus:outline-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Customer Box */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Customer Information
              </h3>
              <div className="flex gap-4 items-start mb-6">
                <div className="w-14 h-14 bg-gray-100 border border-gray-200 text-gray-500 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xl font-bold">{order.customer_name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-base">{order.customer_name}</div>
                  <div className="text-gray-600 text-sm mt-1 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    {order.customer_phone || 'N/A'}
                  </div>
                  <div className="text-gray-500 text-sm mt-1 leading-relaxed flex items-start gap-1.5">
                    <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {order.customer_address}
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">IP Address</span>
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-700 border border-gray-200">
                    {order.ip_address || '202.134.9.128'}
                  </span>
                </div>
                <button className="text-red-600 hover:text-red-700 text-xs font-medium hover:underline flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                  Block IP
                </button>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Order Summary
              </h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Invoice</div>
                  <div className="text-gray-900 font-medium text-sm">#{order.order_id}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Date</div>
                  <div className="text-gray-900 font-medium text-sm">{dateStr}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Status</div>
                  <span className="inline-flex bg-gray-100 text-gray-800 border border-gray-200 px-2.5 py-0.5 rounded text-xs font-semibold capitalize">
                    {order.status || 'Pending'}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Product Type</div>
                  <div className="text-gray-900 font-medium text-sm">Physical</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Total Amount</div>
                  <div className="text-gray-900 font-semibold text-sm">৳{(order.total_price || 0).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Traffic Source</div>
                  <span className="inline-flex bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded text-xs font-medium">
                    {order.source === 'web_chat' ? 'AI Bot' : (order.source || 'Website')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Fraud Check */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                Fraud Analysis
              </h3>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${riskColor}`}>
                  {fraudScore}% Risk
                </span>
                <button onClick={handleFraudCheck} disabled={isCheckingFraud} className="bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
    {isCheckingFraud && <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
    {isCheckingFraud ? 'Checking...' : 'Run Fraud Check'}
  </button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-base mb-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  {order.customer_phone || 'N/A'}
                </div>
                <div className="text-sm text-gray-500 font-medium">Delivery Success Rate: {history ? (history.total > 0 ? Math.round((history.success / history.total) * 100) : 0) : '0'}%</div>
              </div>
              <div className="text-gray-500 text-sm bg-white px-3 py-1.5 rounded border border-gray-200">
                {history ? (
                  history.total === 0 ? 'No previous history found.' : `${history.success} Delivered, ${history.fail} Cancelled/Returned`
                ) : 'Run check to see history.'}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                Customer Note
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex-1 mb-4 text-sm text-gray-700 flex items-start justify-start whitespace-pre-wrap">
                {order.customer_note ? order.customer_note : <span className="text-gray-400 italic mx-auto self-center">— No notes provided —</span>}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  Admin Note
                </h3>
                {!isEditingNote ? (
                  <button onClick={() => setIsEditingNote(true)} className="text-black hover:text-gray-700 text-sm font-medium hover:underline">
                    {order.admin_note ? 'Edit Note' : '+ Add Note'}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => {setIsEditingNote(false); setAdminNote(order.admin_note || '');}} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                      Cancel
                    </button>
                    <button onClick={handleSaveNote} disabled={isSavingNote} className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50">
                      {isSavingNote ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
              {isEditingNote ? (
                <textarea
                  className="w-full h-full min-h-[100px] border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-black resize-none"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Type an internal note here..."
                  autoFocus
                />
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex-1 mb-4 text-sm text-gray-700 flex items-start justify-start whitespace-pre-wrap">
                  {order.admin_note ? order.admin_note : <span className="text-gray-400 italic mx-auto self-center">— No internal notes —</span>}
                </div>
              )}
            </div>
          </div>

          {/* Products List */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-2">
               <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
               <h3 className="text-sm font-semibold text-gray-900">Items ({parsedProducts.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-gray-500 text-xs font-semibold border-b border-gray-100 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Product</th>
                    <th className="px-6 py-4 font-semibold">Attributes</th>
                    <th className="px-6 py-4 font-semibold text-center">Qty</th>
                    <th className="px-6 py-4 font-semibold text-right">Price</th>
                    <th className="px-6 py-4 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {parsedProducts.map((p: any, idx: number) => (
                  <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        
                        <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 shrink-0 flex items-center justify-center overflow-hidden relative">
                          {productDetails[p.name]?.image ? (
                            <Image src={productDetails[p.name].image} alt={p.name} fill className="object-cover" />
                          ) : (
                            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{p.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{order.product_details || 'Standard'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {p.size && (
                          <span className="bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">Size: {p.size}</span>
                        )}
                        {p.color && (
                          <span className="bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">Color: {p.color}</span>
                        )}
                        {!p.size && !p.color && (
                          <span className="text-gray-400 text-xs italic">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-900">{p.qty}</td>
                    
                    <td className="px-6 py-4 text-right text-gray-600">
                      {productDetails[p.name]?.price ? `৳${productDetails[p.name].price.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {productDetails[p.name]?.price ? `৳${(productDetails[p.name].price * p.qty).toLocaleString('en-IN')}` : '-'}
                    </td>

                  </tr>
                ))}
                  
                  {/* Totals */}
                  <tr className="bg-gray-50/50">
                    <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-500">Subtotal</td>
                    <td className="px-6 py-3 text-right font-medium text-gray-900">৳{(order.total_price || 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-gray-50/50">
                    <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-500">Delivery</td>
                    <td className="px-6 py-3 text-right font-medium text-gray-900">৳0</td>
                  </tr>
                  <tr className="bg-gray-100/50">
                    <td colSpan={4} className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Total Amount</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 text-base">৳{(order.total_price || 0).toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
