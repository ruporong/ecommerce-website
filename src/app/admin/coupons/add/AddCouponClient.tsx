'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { createCoupon } from '@/app/actions/couponActions';
import Link from 'next/link';

export default function AddCouponClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('percentage');
  const [hasUsageLimit, setHasUsageLimit] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    if (!hasUsageLimit) {
      formData.delete('usage_limit');
    }
    if (type !== 'percentage') {
      formData.delete('max_discount');
    }

    const res = await createCoupon(formData);
    setLoading(false);
    
    if (res.success) {
      toast.success('Coupon created successfully');
      router.push('/admin/coupons');
    } else {
      toast.error(res.error || 'Failed to create coupon');
    }
  };

  return (
    <div className="p-6 md:p-10 w-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Coupon</h1>
          <p className="text-sm text-gray-500 mt-1">Create a new discount code for your customers</p>
        </div>
        <Link 
          href="/admin/coupons"
          className="text-sm font-semibold text-gray-600 hover:text-black transition-colors"
        >
          &larr; Back to Coupons
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Coupon Code *</label>
            <input type="text" name="code" required placeholder="e.g. SUMMER50" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none uppercase" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Type *</label>
            <select name="type" value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none">
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (৳)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Value *</label>
            <input type="number" name="value" required min="1" step="0.01" placeholder={type === 'percentage' ? 'e.g. 10' : 'e.g. 500'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Purchase Amount (৳)</label>
            <input type="number" name="min_purchase" defaultValue="0" min="0" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none" />
          </div>

          {type === 'percentage' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Maximum Discount Amount (৳)</label>
              <input type="number" name="max_discount" placeholder="Leave empty for unlimited" min="1" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none" />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
            <input type="date" name="start_date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">End Date *</label>
            <input type="date" name="end_date" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none" />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <input type="checkbox" id="hasUsageLimit" checked={hasUsageLimit} onChange={(e) => setHasUsageLimit(e.target.checked)} className="w-5 h-5 accent-black rounded" />
              <label htmlFor="hasUsageLimit" className="text-sm font-semibold text-gray-700 cursor-pointer">Limit total usage?</label>
            </div>
            
            {hasUsageLimit && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Total Usage Limit</label>
                <input type="number" name="usage_limit" min="1" required className="w-full md:w-1/2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none" placeholder="e.g. 100" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select name="status" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-md active:scale-95 disabled:opacity-70"
          >
            {loading ? 'Creating...' : 'Create Coupon'}
          </button>
        </div>
      </form>
    </div>
  );
}
