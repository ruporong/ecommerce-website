'use client';

import { useState, useEffect, useRef } from 'react';
import { createCategory, updateCategory, deleteCategory, updateCategoryStatus, updateCategoryHomeStatus } from '@/app/actions/category';
import { createSubCategory, deleteSubCategory } from '@/app/actions/subCategoryActions';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import TableSearch from '@/components/admin/TableSearch';

export default function CategoryClient({ initialCategories }: { initialCategories: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  const [categories, setCategories] = useState(initialCategories);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modals
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Sub Category Modals
  const [subToDelete, setSubToDelete] = useState<string | null>(null);
  const [addSubTo, setAddSubTo] = useState<string | null>(null);

  // Form states
  const formRef = useRef<HTMLFormElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Edit State
  const [editingCategory, setEditingCategory] = useState<any>(null);
  
  // Sub category form state
  const [subName, setSubName] = useState('');
  const [subMetaTitle, setSubMetaTitle] = useState('');
  const [subMetaDescription, setSubMetaDescription] = useState('');
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        e.target.value = '';
        return;
      }
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(editingCategory?.image || null);
    }
  };

  const openAddCategory = () => {
    setEditingCategory(null);
    setImagePreview(null);
    setIsAddingCategory(true);
  };

  const openEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setImagePreview(cat.image || null);
    setIsAddingCategory(true);
  };

  const formAction = async (formData: FormData) => {
    const categoryName = formData.get('name') as string;
    if (!categoryName || !categoryName.trim()) {
      toast.error("Please enter a category name.");
      return;
    }
    
    // Default is_active to true if not toggled in form
    formData.append('is_active', formData.get('is_active_toggle') === 'on' ? 'true' : 'false');
    formData.append('show_on_home', formData.get('show_on_home_toggle') === 'on' ? 'true' : 'false');
    
    setIsSubmitting(true);
    try {
      const result = editingCategory 
        ? await updateCategory(editingCategory._id, formData)
        : await createCategory(formData);
        
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(editingCategory ? "Category updated!" : "Category added!");
        formRef.current?.reset();
        setImagePreview(null);
        setIsAddingCategory(false);
        setEditingCategory(null);
        router.refresh(); 
      }
    } catch (error: any) {
      toast.error("Something went wrong. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCategoryStatus = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setCategories(categories.map(c => c._id === id ? { ...c, is_active: !currentStatus } : c));
    const res = await updateCategoryStatus(id, !currentStatus);
    if (res.error) {
      toast.error(res.error);
      // Revert if failed
      setCategories(categories.map(c => c._id === id ? { ...c, is_active: currentStatus } : c));
    } else {
      toast.success(!currentStatus ? 'Category activated' : 'Category deactivated');
    }
  };

  const toggleCategoryHomeStatus = async (id: string, currentStatus: boolean) => {
    setCategories(categories.map(c => c._id === id ? { ...c, show_on_home: !currentStatus } : c));
    const res = await updateCategoryHomeStatus(id, !currentStatus);
    if (res.error) {
      toast.error(res.error);
      setCategories(categories.map(c => c._id === id ? { ...c, show_on_home: currentStatus } : c));
    } else {
      toast.success(!currentStatus ? 'Added to Home Page' : 'Removed from Home Page');
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeletingId(categoryToDelete);
    try {
      const result = await deleteCategory(categoryToDelete);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Category deleted successfully!");
        setCategories(categories.filter(c => c._id !== categoryToDelete));
      }
    } catch (error) {
       toast.error("Failed to delete.");
    } finally {
      setDeletingId(null);
      setCategoryToDelete(null);
    }
  };

  const confirmDeleteSub = async () => {
    if (!subToDelete) return;
    setIsSubmittingSub(true);
    const res = await deleteSubCategory(subToDelete);
    if (res.success) {
      toast.success("Sub category deleted");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete");
    }
    setIsSubmittingSub(false);
    setSubToDelete(null);
  };

  const handleAddSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || !addSubTo) return toast.error("Please enter sub-category name.");
    
    setIsSubmittingSub(true);
    const res = await createSubCategory(subName, addSubTo, subMetaTitle, subMetaDescription);
    if (res.success) {
      toast.success("Sub category added!");
      setSubName('');
      setSubMetaTitle('');
      setSubMetaDescription('');
      setAddSubTo(null);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to add sub-category");
    }
    setIsSubmittingSub(false);
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">
        
        {/* Header Action */}
        {!isAddingCategory && (
           <div className="flex justify-end">
             <button onClick={openAddCategory} className="bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
               + Add New Category
             </button>
           </div>
        )}

        {/* Add/Edit Category Form */}
        {isAddingCategory && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
              <button onClick={() => { setIsAddingCategory(false); setEditingCategory(null); }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form ref={formRef} action={formAction} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="name"
                      defaultValue={editingCategory?.name || ''}
                      placeholder="e.g. Winter Collection" 
                      className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col gap-4 pt-2 pb-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="is_active_toggle" className="sr-only peer" defaultChecked={editingCategory ? editingCategory.is_active : true} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      <span className="ml-3 text-sm font-medium text-gray-700">Active Status (Visible on site)</span>
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="show_on_home_toggle" className="sr-only peer" defaultChecked={editingCategory ? editingCategory.show_on_home : false} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-700">Show on Home Page</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title (Optional)</label>
                    <input 
                      type="text" 
                      name="meta_title"
                      defaultValue={editingCategory?.meta_title || ''}
                      placeholder="Best Winter Collection in BD" 
                      className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description (Optional)</label>
                    <textarea 
                      name="meta_description"
                      rows={3}
                      defaultValue={editingCategory?.meta_description || ''}
                      placeholder="Shop the best winter collection..." 
                      className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-none"
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Category Image (Optional)</label>
                   <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors bg-gray-50/50">
                    <div className="space-y-2 text-center">
                      {imagePreview ? (
                        <div className="relative mx-auto w-32 h-32 mb-4">
                           <img src={imagePreview} className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm" alt="Preview" />
                           <button type="button" onClick={() => {setImagePreview(null); if(formRef.current) formRef.current.image.value = '';}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:scale-110 transition-transform">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                           </button>
                        </div>
                      ) : (
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                          <span>{imagePreview ? 'Change Image' : 'Upload an image'}</span>
                          <input type="file" name="image" accept="image/*" onChange={handleImageChange} className="sr-only" />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 2MB</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-black hover:bg-gray-800 disabled:opacity-50 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors"
                >
                  {isSubmitting ? 'Saving...' : (editingCategory ? 'Update Category' : 'Save Category')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List of Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-end">
            <TableSearch placeholder="Search categories..." />
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold bg-white">
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Sub Categories</th>
                <th className="px-6 py-4 text-center">Show on Home</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm bg-white">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery ? `No categories found for "${searchQuery}"` : 'No categories found.'}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 align-top pt-5">
                      <div className="flex items-center gap-4">
                        {cat.image ? (
                           <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden shrink-0 bg-gray-100">
                             <img src={cat.image} className="w-full h-full object-cover" alt={cat.name} />
                           </div>
                        ) : (
                           <div className="w-12 h-12 rounded-lg border border-gray-200 border-dashed bg-gray-50 flex items-center justify-center shrink-0 text-gray-400">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                           </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900">{cat.name}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{cat.slug}</p>
                          {(cat.meta_title || cat.meta_description) && (
                            <div className="mt-1.5 flex items-center gap-1 text-[10px] uppercase font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded w-fit">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                              SEO Optimized
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top pt-5">
                      <div className="flex flex-wrap gap-2 items-center">
                        {cat.subCategories?.map((sub: any) => (
                           <span key={sub._id} className="bg-white text-gray-700 text-xs px-2.5 py-1.5 rounded-md flex items-center gap-2 border border-gray-200 shadow-sm group/sub">
                              {sub.name}
                              <button onClick={() => setSubToDelete(sub._id)} className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded w-4 h-4 flex items-center justify-center transition-colors">✕</button>
                           </span>
                        ))}
                        <button 
                          onClick={() => setAddSubTo(cat._id)} 
                          className="text-xs font-medium text-gray-600 border border-dashed border-gray-300 hover:border-black hover:text-black bg-gray-50 hover:bg-white px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1 shadow-sm"
                        >
                          + Add Sub
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center align-top pt-5">
                      <label className="relative inline-flex items-center cursor-pointer" title={cat.show_on_home ? 'Remove from Home' : 'Show on Home'}>
                        <input type="checkbox" className="sr-only peer" checked={cat.show_on_home} onChange={() => toggleCategoryHomeStatus(cat._id, cat.show_on_home)} />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 text-center align-top pt-5">
                      <label className="relative inline-flex items-center cursor-pointer" title={cat.is_active ? 'Deactivate Category' : 'Activate Category'}>
                        <input type="checkbox" className="sr-only peer" checked={cat.is_active} onChange={() => toggleCategoryStatus(cat._id, cat.is_active)} />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 text-right align-top pt-5">
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          type="button"
                          onClick={() => openEditCategory(cat)}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                          title="Edit Category"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button 
                          type="button"
                          onClick={() => setCategoryToDelete(cat._id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                          title="Delete Category"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Category Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Category</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete this category? This will also affect related subcategories.</p>
            <div className="flex gap-3 justify-end">
              <button 
                type="button" 
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={deletingId !== null}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                disabled={deletingId !== null}
              >
                {deletingId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Sub Category Modal */}
      {subToDelete && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Sub Category</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete this sub category? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button 
                type="button" 
                onClick={() => setSubToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSubmittingSub}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmDeleteSub}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                disabled={isSubmittingSub}
              >
                {isSubmittingSub ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add SubCategory Modal */}
      {addSubTo && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Add Sub Category</h3>
              <button onClick={() => setAddSubTo(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleAddSub} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                  placeholder="e.g. T-Shirts"
                  autoFocus
                  required
                />
              </div>
              
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">SEO Details (Optional)</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                    <input 
                      type="text" 
                      value={subMetaTitle}
                      onChange={(e) => setSubMetaTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none text-sm"
                      placeholder="e.g. Buy Men's T-Shirts"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                    <textarea 
                      value={subMetaDescription}
                      onChange={(e) => setSubMetaDescription(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none text-sm resize-none"
                      placeholder="Explore our wide range of t-shirts..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setAddSubTo(null)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={isSubmittingSub} className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg disabled:opacity-50">
                  {isSubmittingSub ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
