'use client'

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { approveReview, deleteReview, addAdminReview } from '@/app/actions/review';
import Modal from '@/components/admin/Modal';

export default function AdminReviewsClient({ initialReviews, products }: { initialReviews: any[], products: any[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  
  // Add Review Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ product_id: '', name: '', rating: 5, comment: '', date: new Date().toISOString().split('T')[0] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingReviews = reviews.filter(r => r.status === 'pending');
  const approvedReviews = reviews.filter(r => r.status === 'approved');

  const displayedReviews = activeTab === 'pending' ? pendingReviews : approvedReviews;

  const handleApprove = async (id: string) => {
    const res = await approveReview(id);
    if (res.success) {
      toast.success('Review approved successfully');
      setReviews(reviews.map(r => r._id === id ? { ...r, status: 'approved' } : r));
    } else {
      toast.error(res.error || 'Failed to approve review');
    }
  };

  const handleDelete = async () => {
    if (!reviewToDelete) return;
    const res = await deleteReview(reviewToDelete);
    if (res.success) {
      toast.success('Review deleted successfully');
      setReviews(reviews.filter(r => r._id !== reviewToDelete));
    } else {
      toast.error(res.error || 'Failed to delete review');
    }
    setReviewToDelete(null);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('product_id', addForm.product_id);
    formData.append('name', addForm.name);
    formData.append('rating', addForm.rating.toString());
    formData.append('comment', addForm.comment);
    if (addForm.date) {
      formData.append('createdAt', addForm.date);
    }

    const res = await addAdminReview(formData);
    setIsSubmitting(false);

    if (res.success) {
      toast.success('Review added successfully');
      setIsAddOpen(false);
      // Fetching or pushing locally is needed. Since we populate product_id, let's construct it.
      const productObj = products.find(p => p._id === addForm.product_id);
      const newReview = { ...res.review, product_id: productObj };
      setReviews([newReview, ...reviews]);
      setAddForm({ product_id: '', name: '', rating: 5, comment: '', date: new Date().toISOString().split('T')[0] });
      setActiveTab('approved'); // It's auto-approved
    } else {
      toast.error(res.error || 'Failed to add review');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and moderate product reviews</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0e0e0e] text-white rounded-lg text-sm font-semibold hover:bg-black transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add Manual Review
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-2 sm:px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`relative py-4 text-sm font-semibold transition-colors ${activeTab === 'pending' ? 'text-charcoal' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Pending Requests
              {pendingReviews.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingReviews.length}</span>
              )}
              {activeTab === 'pending' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal rounded-t-full"></div>}
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`relative py-4 text-sm font-semibold transition-colors ${activeTab === 'approved' ? 'text-charcoal' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Approved
              <span className="ml-2 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{approvedReviews.length}</span>
              {activeTab === 'approved' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal rounded-t-full"></div>}
            </button>
          </div>
        </div>

        <div className="p-2 sm:p-6 bg-gray-50/30">
          {displayedReviews.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100 border-dashed">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              <h3 className="text-gray-900 font-medium mb-1">No {activeTab} reviews</h3>
              <p className="text-gray-500 text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {displayedReviews.map((review) => {
                const product = review.product_id;
                const productImage = product?.mainImages?.[0] || product?.images?.[0] || '';
                
                return (
                  <div key={review._id} className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-gray-600">{review.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-bold text-[14px] text-gray-900 leading-tight">{review.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="flex bg-yellow-50 px-2 py-1 rounded-full">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-yellow-400/20 fill-current'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-5 line-clamp-3">"{review.comment}"</p>
                    
                    <div className="flex justify-between items-end border-t border-gray-50 pt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-10 bg-gray-50 rounded shrink-0 overflow-hidden">
                          {productImage && <img src={productImage} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="max-w-[150px] sm:max-w-[200px]">
                          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-0.5">Reviewed on</p>
                          <p className="text-xs font-medium text-gray-700 truncate">{product?.name || 'Unknown Product'}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {review.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(review._id)}
                            className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 rounded-md text-xs font-semibold transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => setReviewToDelete(review._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Review"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={!!reviewToDelete} onClose={() => setReviewToDelete(null)} title="Delete Review">
        <div className="p-6">
          <p className="text-gray-600 mb-6 text-sm">Are you sure you want to delete this review? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setReviewToDelete(null)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Delete Review
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Manual Review">
        <form onSubmit={handleAddReview} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Product</label>
            <select 
              required
              value={addForm.product_id}
              onChange={e => setAddForm({...addForm, product_id: e.target.value})}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none"
            >
              <option value="">Select a product...</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Customer Name</label>
              <input 
                type="text" 
                required
                value={addForm.name}
                onChange={e => setAddForm({...addForm, name: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Date</label>
              <input 
                type="date" 
                value={addForm.date}
                onChange={e => setAddForm({...addForm, date: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Rating</label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  type="button" 
                  key={star} 
                  onClick={() => setAddForm({...addForm, rating: star})}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <svg className={`w-8 h-8 ${star <= addForm.rating ? 'text-[#F5A623] fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Review Comment</label>
            <textarea 
              required
              rows={4}
              value={addForm.comment}
              onChange={e => setAddForm({...addForm, comment: e.target.value})}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none resize-none"
              placeholder="What do you think about this product?"
            ></textarea>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Review'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
