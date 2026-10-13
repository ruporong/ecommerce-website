'use client';

import { useState, useRef } from 'react';
import { saveAttribute, deleteAttribute, toggleAttributeStatus } from '@/app/actions/attributeActions';
import toast from 'react-hot-toast';

export default function AttributeClient({ initialData, type, title }: { initialData: any[], type: string, title: string }) {
  const [items, setItems] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // States for Color specifically (easier to keep controlled for the color picker sync)
  const [colorValue, setColorValue] = useState('');
  
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      setImagePreview(editingItem?.image || null);
    }
  };

  const openModal = (item: any = null) => {
    setEditingItem(item);
    if (type === 'color') setColorValue(item ? (item.value || '#000000') : '#000000');
    if (type === 'brand') setImagePreview(item ? item.image : null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setColorValue('');
    setImagePreview(null);
  };

  const formAction = async (formData: FormData) => {
    const name = formData.get('name') as string;
    if (!name || !name.trim()) { toast.error('Name is required'); return; }
    
    formData.append('type', type);
    if (editingItem) formData.append('id', editingItem._id);
    
    // Default is_active to true if not toggled in form
    formData.append('is_active', formData.get('is_active_toggle') === 'on' ? 'true' : 'false');
    
    setIsLoading(true);
    const res = await saveAttribute(formData);
    
    if (res.success) {
      toast.success(`${title.slice(0, -1)} saved successfully`);
      window.location.reload(); // Quickest way to refresh images and data safely
    } else {
      toast.error(res.error || 'Failed to save');
      setIsLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setItems(items.map(i => i._id === id ? { ...i, is_active: !currentStatus } : i));
    const res = await toggleAttributeStatus(id, !currentStatus, type);
    if (res.error) {
      toast.error(res.error);
      setItems(items.map(i => i._id === id ? { ...i, is_active: currentStatus } : i));
    } else {
      toast.success(!currentStatus ? 'Activated' : 'Deactivated');
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    const res = await deleteAttribute(itemToDelete, type);
    if (res.success) {
      toast.success('Deleted successfully');
      setItems(items.filter(i => i._id !== itemToDelete));
    } else {
      toast.error(res.error || 'Failed to delete');
    }
    setIsDeleting(false);
    setItemToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your {title.toLowerCase()}.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-black hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          + Add {title.slice(0, -1)}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-white text-gray-500 uppercase text-[11px] font-bold tracking-wider border-b border-gray-200">
            <tr>
              <th className="px-6 py-5">Name</th>
              {type === 'color' && <th className="px-6 py-5">Color Value</th>}
              <th className="px-6 py-5 text-center">Status</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {items.length === 0 ? (
              <tr>
                <td colSpan={type === 'color' ? 4 : 3} className="px-6 py-12 text-center text-gray-400">
                  No {title.toLowerCase()} found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-4">
                    {type === 'color' && (
                      <span className="w-6 h-6 rounded-full border border-gray-200 block shadow-sm" style={{ backgroundColor: item.value }}></span>
                    )}
                    {type === 'brand' && (
                      item.image ? (
                        <div className="w-16 h-16 rounded-xl border border-gray-200 overflow-hidden shrink-0 bg-white p-1.5">
                          <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl border border-gray-200 border-dashed bg-gray-50 flex items-center justify-center shrink-0 text-gray-400 text-xs">
                          Logo
                        </div>
                      )
                    )}
                    <span className="text-base">{item.name}</span>
                  </td>
                  {type === 'color' && <td className="px-6 py-4 font-mono">{item.value}</td>}
                  <td className="px-6 py-4 text-center">
                    <label className="relative inline-flex items-center cursor-pointer" title={item.is_active ? 'Deactivate' : 'Activate'}>
                      <input type="checkbox" className="sr-only peer" checked={item.is_active !== false} onChange={() => toggleStatus(item._id, item.is_active !== false)} />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => openModal(item)}
                        className="text-gray-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setItemToDelete(item._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                        title="Delete"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900">{editingItem ? 'Edit' : 'Add'} {title.slice(0, -1)}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-md transition-colors">✕</button>
            </div>
            <form ref={formRef} action={formAction} className="p-6 space-y-5">
              
              {/* Common Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="name"
                  defaultValue={editingItem?.name || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none"
                  placeholder={`e.g. ${type === 'brand' ? 'Nike' : type === 'size' ? 'XL' : type === 'color' ? 'Red' : 'Summer'}`}
                  required
                />
              </div>

              {/* Status Toggle (Applies to all) */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="is_active_toggle" className="sr-only peer" defaultChecked={editingItem ? editingItem.is_active !== false : true} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">Active Status</span>
                </label>
              </div>

              {/* Color Specific Field */}
              {type === 'color' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color Value (Hex Code)</label>
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      value={colorValue}
                      onChange={(e) => setColorValue(e.target.value)}
                      className="h-10 w-14 rounded cursor-pointer border border-gray-300"
                    />
                    <input 
                      type="text" 
                      name="value"
                      value={colorValue}
                      onChange={(e) => setColorValue(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none font-mono"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              )}

              {/* Brand Specific Field (Logo) */}
              {type === 'brand' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand Logo (Optional)</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors bg-gray-50/50">
                   <div className="space-y-2 text-center">
                     {imagePreview ? (
                       <div className="relative mx-auto w-24 h-24 mb-4">
                          <img src={imagePreview} className="w-full h-full object-contain bg-white rounded-lg border border-gray-200 shadow-sm p-1" alt="Preview" />
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
                         <span>{imagePreview ? 'Change Logo' : 'Upload a logo'}</span>
                         <input type="file" name="image" accept="image/*" onChange={handleImageChange} className="sr-only" />
                       </label>
                     </div>
                     <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 2MB</p>
                   </div>
                 </div>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={closeModal} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-6 py-2.5 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg disabled:opacity-50 transition-colors">
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete {title.slice(0, -1)}</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete this {title.slice(0, -1).toLowerCase()}? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button 
                type="button" 
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
