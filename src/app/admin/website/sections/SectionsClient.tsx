'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { createSection, deleteSection, updateSection } from '@/app/actions/websiteActions';
import Modal from '@/components/admin/Modal';

export default function SectionsClient({ initialData, categories }: { initialData: any[], categories: any[] }) {
  const [sections, setSections] = useState(initialData);
  const [isAdding, setIsAdding] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createSection(formData);
    setLoading(false);
    
    if (res.success) {
      toast.success('Section added successfully');
      setSections([...sections, res.data].sort((a, b) => a.order - b.order));
      setIsAdding(false);
    } else {
      toast.error(res.error);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSection) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateSection(editingSection._id, formData);
    setLoading(false);
    
    if (res.success) {
      toast.success('Section updated successfully');
      setSections(sections.map(s => s._id === editingSection._id ? res.data : s).sort((a, b) => a.order - b.order));
      setEditingSection(null);
    } else {
      toast.error(res.error);
    }
  };

  const handleDelete = async () => {
    if (!deletingSectionId) return;
    setLoading(true);
    const res = await deleteSection(deletingSectionId);
    setLoading(false);
    if (res.success) {
      toast.success('Section deleted');
      setSections(sections.filter(s => s._id !== deletingSectionId));
      setDeletingSectionId(null);
    } else {
      toast.error(res.error);
    }
  };

  const EditForm = ({ defaultValues, onSubmit, onCancel }: { defaultValues?: any, onSubmit: any, onCancel: () => void }) => {
    const [selectedType, setSelectedType] = useState(defaultValues?.type || 'new_arrivals');

    return (
      <form onSubmit={onSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 mb-2">
          <h2 className="text-xl font-bold">{defaultValues ? 'Edit Section' : 'Add New Section'}</h2>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Title *</label>
          <input name="title" defaultValue={defaultValues?.title} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black outline-none transition-all" placeholder="e.g. New Arrivals" />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Type *</label>
          <select 
            name="type" 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black outline-none transition-all bg-white"
          >
            <option value="new_arrivals">New Arrivals (Auto)</option>
            <option value="featured">Featured Products</option>
            <option value="category">Specific Category</option>
          </select>
        </div>

        {selectedType === 'category' && (
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Select Category *</label>
            <select name="category_id" defaultValue={defaultValues?.category_id || ''} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black outline-none transition-all bg-white">
              <option value="" disabled>Select a category...</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Order (Sorting)</label>
          <input name="order" type="number" defaultValue={defaultValues?.order || 0} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black outline-none transition-all" />
        </div>

        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button disabled={loading} className="bg-black text-white px-6 py-2.5 rounded-lg font-bold disabled:opacity-50 hover:bg-gray-800 transition-colors flex items-center gap-2">
            {loading ? (
              <><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saving...</>
            ) : 'Save Section'}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="p-6 md:p-10 w-full space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Homepage Sections</h1>
          <p className="text-gray-500 mt-1">Manage dynamic sections on the homepage</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)} 
          className="bg-black text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Section
        </button>
      </div>

      {isAdding && (
        <EditForm 
          onSubmit={handleAddSubmit} 
          onCancel={() => setIsAdding(false)} 
        />
      )}

      {editingSection && (
        <EditForm 
          defaultValues={editingSection}
          onSubmit={handleEditSubmit} 
          onCancel={() => setEditingSection(null)} 
        />
      )}

      <div className="grid grid-cols-1 gap-4">
        {sections.map(section => (
          <div key={section._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold text-lg text-gray-900">{section.title}</h3>
                {section.status === 'active' ? (
                  <span className="w-2 h-2 rounded-full bg-green-400" title="Active"></span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-gray-400" title="Inactive"></span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="capitalize bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{section.type.replace('_', ' ')}</span>
                {section.category_id && (
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                    Category ID: {categories.find(c => c._id === section.category_id)?.name || section.category_id}
                  </span>
                )}
                <span className="bg-gray-50 px-2 py-0.5 rounded border border-gray-100">Order: {section.order}</span>
              </div>
            </div>
            
            {/* Always visible action buttons */}
            <div className="flex gap-2">
              <button 
                onClick={() => { setEditingSection(section); setIsAdding(false); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                title="Edit Section"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button 
                onClick={() => setDeletingSectionId(section._id)}
                className="w-10 h-10 rounded-full border border-red-200 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm"
                title="Delete Section"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        ))}
        {sections.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
            <svg className="w-12 h-12 mb-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            <p className="text-lg font-medium text-gray-500">No sections found</p>
            <p className="text-sm mt-1">Click "Add Section" to create your first homepage section.</p>
          </div>
        )}
      </div>

      {/* Custom Delete Modal */}
      <Modal 
        isOpen={!!deletingSectionId} 
        onClose={() => setDeletingSectionId(null)}
        title="Delete Section"
      >
        <div className="p-5">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-red-50 flex flex-shrink-0 items-center justify-center text-red-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-1">Are you absolutely sure?</h4>
              <p className="text-sm text-gray-500">This action cannot be undone. This will permanently remove the section from your storefront.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              onClick={() => setDeletingSectionId(null)}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
