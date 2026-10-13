'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { createExpenseCategory, updateExpenseCategory, deleteExpenseCategory } from '@/app/actions/expenseActions';

export default function CategoryClient({ initialData }: { initialData: any[] }) {
  const [categories, setCategories] = useState(initialData);
  const [formData, setFormData] = useState({ id: '', name: '', description: '', is_active: true });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    let res;
    if (isEditing) {
      res = await updateExpenseCategory(formData.id, { name: formData.name, description: formData.description, is_active: formData.is_active });
    } else {
      res = await createExpenseCategory({ name: formData.name, description: formData.description });
    }

    setLoading(false);
    if (res.success) {
      toast.success(isEditing ? 'Category updated' : 'Category created');
      window.location.reload(); // Quick refresh for now
    } else {
      toast.error(res.error || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteExpenseCategory(id);
    if (res.success) {
      toast.success('Category deleted');
      window.location.reload();
    } else {
      toast.error(res.error || 'Operation failed');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-6">Expense Categories</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map(c => (
                <tr key={c._id}>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {c.name}
                    <div className="text-xs text-gray-400 font-normal mt-0.5">{c.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-md ${c.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        setFormData({ id: c._id, name: c.name, description: c.description || '', is_active: c.is_active });
                        setIsEditing(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium mr-4 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button onClick={() => setConfirmModal({ isOpen: true, id: c._id })} className="text-red-600 hover:text-red-800 font-medium cursor-pointer">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-gray-500">No categories found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:w-96 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
          <h2 className="text-lg font-bold mb-4">{isEditing ? 'Edit Category' : 'Add Category'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:border-black outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:border-black outline-none h-24" />
            </div>
            {isEditing && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4 rounded text-black focus:ring-black cursor-pointer" />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            )}
            <div className="pt-2 flex gap-2">
              {isEditing && <button type="button" onClick={() => { setIsEditing(false); setFormData({ id: '', name: '', description: '', is_active: true }); }} className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg cursor-pointer">Cancel</button>}
              <button type="submit" disabled={loading} className="flex-1 py-2 bg-black text-white font-bold rounded-lg cursor-pointer">{loading ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      </div>
      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-50 text-red-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to delete this category?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ isOpen: false, id: '' })} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">
                Cancel
              </button>
              <button 
                onClick={async () => {
                  setConfirmModal({ isOpen: false, id: '' });
                  await handleDelete(confirmModal.id);
                }} 
                className="flex-1 py-3 font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
