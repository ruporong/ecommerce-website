'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { createPurchase } from '@/app/actions/purchaseActions';
import Link from 'next/link';

export default function AddPurchaseClient({ suppliers, products }: { suppliers: any[], products: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  
  const handleAddItem = () => {
    if (!selectedProduct) return;
    const prod = products.find(p => p._id === selectedProduct);
    if (!prod) return;
    
    // Check if already in list
    if (items.some(i => i.product_id === prod._id)) {
      toast.error('Product already added to list');
      return;
    }
    
    setItems([...items, { product_id: prod._id, product_name: prod.name, quantity: 1, unit_cost: 0 }]);
    setSelectedProduct('');
  };

  const updateItem = (index: number, field: string, value: number) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Please add at least one product to the purchase');
      return;
    }
    
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      supplier_id: formData.get('supplier_id'),
      reference_no: formData.get('reference_no'),
      status: formData.get('status'),
      payment_status: formData.get('payment_status'),
      shipping_cost: Number(formData.get('shipping_cost') || 0),
      discount: Number(formData.get('discount') || 0),
      notes: formData.get('notes'),
      items
    };

    const res = await createPurchase(data);
    
    setLoading(false);
    
    if (res.success) {
      toast.success('Purchase created successfully');
      router.push('/admin/purchases');
    } else {
      toast.error(res.error || 'Failed to create purchase');
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);

  return (
    <div className="p-6 md:p-10 w-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Purchase</h1>
          <p className="text-sm text-gray-500 mt-1">Record new stock from suppliers</p>
        </div>
        <Link 
          href="/admin/purchases"
          className="text-sm font-semibold text-gray-600 hover:text-black transition-colors"
        >
          &larr; Back to Purchases
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier *</label>
              <select name="supplier_id" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none">
                <option value="">Select Supplier</option>
                {suppliers.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Reference No</label>
              <input type="text" name="reference_no" placeholder="e.g. INV-1029" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select name="status" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none">
                <option value="pending">Pending</option>
                <option value="ordered">Ordered</option>
                <option value="received">Received (Updates Inventory)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Status</label>
              <select name="payment_status" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none">
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Items</h2>
          <div className="flex gap-4 mb-6">
            <select 
              value={selectedProduct} 
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
            >
              <option value="">Select a product to add</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            <button 
              type="button" 
              onClick={handleAddItem}
              className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-md active:scale-95"
            >
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase w-32">Unit Cost</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase w-32">Quantity</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase w-32">Subtotal</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 text-sm">No items added yet.</td>
                  </tr>
                ) : items.map((item, index) => (
                  <tr key={item.product_id}>
                    <td className="px-4 py-3 font-semibold text-gray-900">{item.product_name}</td>
                    <td className="px-4 py-3">
                      <input 
                        type="number" 
                        min="0" 
                        value={item.unit_cost} 
                        onChange={(e) => updateItem(index, 'unit_cost', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-black"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="number" 
                        min="1" 
                        value={item.quantity} 
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-black"
                      />
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">
                      ৳{(item.unit_cost * item.quantity).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
            <textarea 
              name="notes" 
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none resize-none"
            ></textarea>
          </div>
          <div className="w-full md:w-80 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-gray-500">Subtotal</span>
              <span className="font-bold text-gray-900">৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm gap-4">
              <span className="font-semibold text-gray-500 whitespace-nowrap">Shipping Cost (+)</span>
              <input type="number" name="shipping_cost" defaultValue={0} className="w-24 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-right outline-none" />
            </div>
            <div className="flex justify-between items-center text-sm gap-4">
              <span className="font-semibold text-gray-500 whitespace-nowrap">Discount (-)</span>
              <input type="number" name="discount" defaultValue={0} className="w-24 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-right outline-none" />
            </div>
            <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="font-bold text-gray-900">Grand Total</span>
              <span className="text-xl font-black text-gray-900">Auto-calculated</span>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-md active:scale-95 disabled:opacity-70 mt-4"
            >
              {loading ? 'Processing...' : 'Submit Purchase Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
