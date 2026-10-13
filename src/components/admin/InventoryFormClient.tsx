'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { processManualStockUpdate } from '@/app/actions/inventory';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function InventoryFormClient({ 
  products, 
  defaultProductId,
  defaultType = 'in'
}: { 
  products: any[], 
  defaultProductId?: string,
  defaultType?: 'in' | 'out' | 'adjustment'
}) {
  const router = useRouter();
  const [type, setType] = useState<'in' | 'out' | 'adjustment'>(defaultType);
  const [formData, setFormData] = useState({
    product_id: defaultProductId || '',
    quantity: 1,
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProduct = products.find(p => p._id === formData.product_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id) return toast.error('Please select a product');
    
    setIsSubmitting(true);
    const res = await processManualStockUpdate({
      product_id: formData.product_id,
      type,
      quantity: formData.quantity,
      reason: formData.reason || `Manual Stock ${type}`
    });
    setIsSubmitting(false);

    if (res.success) {
      toast.success('Stock updated successfully');
      router.push('/admin/inventory/overview');
    } else {
      toast.error(res.error || 'Failed to update stock');
    }
  };

  const descriptions = {
    in: 'Add new incoming stock to your inventory',
    out: 'Manually deduct stock (e.g. damaged goods, offline sales)',
    adjustment: 'Set the exact absolute stock quantity for a product'
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Stock</h1>
        <p className="text-sm text-gray-500 mt-1">Update inventory levels manually</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Form */}
        <div className="flex-1 max-w-3xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="flex divide-x divide-gray-100 border-b border-gray-100">
              <button 
                onClick={() => setType('in')}
                className={`flex-1 py-4 text-sm font-bold transition-all ${type === 'in' ? 'bg-black text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                Stock In
              </button>
              <button 
                onClick={() => setType('out')}
                className={`flex-1 py-4 text-sm font-bold transition-all ${type === 'out' ? 'bg-black text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                Stock Out
              </button>
              <button 
                onClick={() => setType('adjustment')}
                className={`flex-1 py-4 text-sm font-bold transition-all ${type === 'adjustment' ? 'bg-black text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                Adjustment
              </button>
            </div>
            <div className="p-4 bg-gray-50/50 text-sm text-gray-600 border-b border-gray-100 text-center font-medium">
                {descriptions[type]}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Product</label>
              <select 
                required
                value={formData.product_id}
                onChange={e => setFormData({...formData, product_id: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black outline-none transition-colors"
              >
                <option value="">Choose a product...</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>{p.name} (Current: {p.stock})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {type === 'adjustment' ? 'New Absolute Quantity' : 'Quantity'}
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    required
                    min={type === 'adjustment' ? 0 : 1}
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black outline-none transition-colors text-lg font-bold"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                    {type === 'in' ? '+' : type === 'out' ? '-' : '='}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason / Note</label>
                <input 
                  type="text" 
                  required
                  placeholder={type === 'in' ? "e.g. New batch" : type === 'out' ? "e.g. Damaged" : "e.g. Audit"}
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
              <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center gap-2">
                {isSubmitting ? 'Processing...' : 'Confirm Update'}
                {!isSubmitting && (
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Product Preview */}
        <div className="lg:w-96 flex-shrink-0">
          {selectedProduct ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
              <div className="aspect-square bg-gray-50 relative border-b border-gray-100">
                {selectedProduct.mainImages?.[0] ? (
                  <img src={selectedProduct.mainImages[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                {selectedProduct.stock <= 5 && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    {selectedProduct.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-1">{selectedProduct.name}</h3>
                {selectedProduct.slug && <p className="text-sm text-gray-500 mb-6">SKU: {selectedProduct.slug}</p>}
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Current Stock</span>
                    <span className="text-2xl font-black text-gray-900">{selectedProduct.stock}</span>
                  </div>
                  
                  {type !== 'adjustment' && (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200/60 mt-2">
                      <span className="text-sm font-medium text-gray-600">Expected After</span>
                      <span className={`text-lg font-bold ${type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                        {type === 'in' ? selectedProduct.stock + formData.quantity : Math.max(0, selectedProduct.stock - formData.quantity)}
                      </span>
                    </div>
                  )}
                </div>
                
                <Link href={`/admin/products/${selectedProduct._id}/edit`} className="block w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg text-center transition-colors border border-gray-200">
                  Edit Product
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 border-dashed rounded-2xl h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 sticky top-6 text-gray-400">
              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              <h3 className="text-lg font-bold text-gray-500 mb-1">Product Preview</h3>
              <p className="text-sm">Select a product from the list to view its current details and stock status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
