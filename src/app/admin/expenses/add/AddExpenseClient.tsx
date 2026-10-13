'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { createExpense } from '@/app/actions/expenseActions';
import { useRouter } from 'next/navigation';

export default function AddExpenseClient({ categories }: { categories: any[] }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    payment_method: '',
    reference_no: '',
    notes: ''
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
      setAttachmentPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id) return toast.error('Please select a category');
    
    setLoading(true);
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => form.append(key, value));
    if (attachment) form.append('attachment', attachment);

    const res = await createExpense(form);
    setLoading(false);

    if (res.success) {
      toast.success('Expense submitted successfully');
      router.push('/admin/expenses');
    } else {
      toast.error(res.error || 'Failed to submit expense');
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Expense</h1>
        <p className="text-sm text-gray-500 mt-1">Submit a new expense request for approval</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title / Description</label>
            <input type="text" required placeholder="e.g. Facebook Ads for October" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black outline-none transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (৳)</label>
            <input type="number" required min={1} value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black outline-none transition-colors text-lg font-bold" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black outline-none transition-colors cursor-pointer" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black outline-none transition-colors cursor-pointer">
              <option value="">Select a category...</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method <span className="text-gray-400 font-normal">(Optional)</span></label>
            <select value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black outline-none transition-colors cursor-pointer">
              <option value="">N/A</option>
              <option value="Cash">Cash</option>
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Card">Credit/Debit Card</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Reference No. / TrxID <span className="text-gray-400 font-normal">(Optional)</span></label>
            <input type="text" value={formData.reference_no} onChange={e => setFormData({...formData, reference_no: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black outline-none transition-colors" />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes <span className="text-gray-400 font-normal">(Optional)</span></label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black outline-none transition-colors h-24" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Attachment (Memo / Screenshot) <span className="text-gray-400 font-normal">(Optional)</span></label>
            <div className="flex items-center gap-4">
              <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-black transition-colors bg-gray-50 overflow-hidden relative">
                {attachmentPreview ? (
                  <img src={attachmentPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <svg className="w-6 h-6 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    <span className="text-xs font-semibold text-gray-500">Upload</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {attachmentPreview && (
                <button type="button" onClick={() => { setAttachment(null); setAttachmentPreview(null); }} className="text-red-500 text-sm font-semibold hover:text-red-700">Remove Image</button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-8 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 cursor-pointer">
            {loading ? 'Submitting...' : 'Submit Expense'}
          </button>
        </div>
      </form>
    </div>
  );
}
