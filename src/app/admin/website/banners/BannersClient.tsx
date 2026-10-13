'use client';

import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { createBanner, deleteBanner, updateBanner } from '@/app/actions/websiteActions';
import Modal from '@/components/admin/Modal';

interface BannerFormProps {
  defaultValues?: any;
  bannerType: string;
  loading: boolean;
  onSubmit: (formData: FormData, file: File | null) => Promise<void>;
  onCancel: () => void;
}

function BannerForm({ defaultValues, bannerType, loading, onSubmit, onCancel }: BannerFormProps) {
  const [preview, setPreview] = useState<string | null>(defaultValues?.image || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreview(defaultValues?.image || null);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData, selectedFile);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="md:col-span-2 flex justify-between items-center mb-1">
        <h2 className="text-xl font-bold text-gray-900">{defaultValues ? 'Edit Banner' : 'Add New Banner'}</h2>
      </div>

      {/* Clean Single Image Upload Area */}
      <div className="md:col-span-2 bg-gray-50/80 p-6 rounded-xl border border-gray-200">
        <div className="flex justify-between items-start mb-1">
          <label className="block text-sm font-semibold text-gray-800">
            Upload Banner Image {defaultValues ? '' : '*'}
          </label>
        </div>
        
        {bannerType === "auth" ? (
          <p className="text-red-500 text-xs font-bold mb-3">Recommended size: 960x1080 px (Auth Slider). Maintain ratio to avoid layout issues.</p>
        ) : (
          <p className="text-red-500 text-xs font-bold mb-3">Recommended size: 1920x800 px (Home Banner). Maintain ratio to avoid layout issues.</p>
        )}

        <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-gray-400 transition-colors bg-white">
          <div className="space-y-3 text-center w-full">
            {preview ? (
              <div className="relative mx-auto max-w-md h-48 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                <img src={preview} alt="Selected Banner" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => { setSelectedFile(null); setPreview(null); }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 hover:scale-110 transition-all"
                  title="Remove Image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <label className="cursor-pointer font-semibold text-black hover:text-white bg-gray-100 hover:bg-black px-6 py-2.5 rounded-xl text-sm transition-all shadow-xs inline-block">
                  <span>Choose Image File</span>
                  <input 
                    type="file" 
                    name="imageFile"
                    ref={fileInputRef} 
                    onChange={handleImageChange}
                    accept="image/*" 
                    className="sr-only" 
                  />
                </label>
                <p className="text-xs text-gray-400 mt-2">PNG, JPG, WEBP (Upload directly from device)</p>
              </div>
            )}

            {preview && (
              <div className="flex justify-center pt-1">
                <label className="cursor-pointer text-xs font-semibold text-gray-600 hover:text-black underline">
                  <span>Change Image</span>
                  <input 
                    type="file" 
                    name="imageFile"
                    ref={fileInputRef} 
                    onChange={handleImageChange}
                    accept="image/*" 
                    className="sr-only" 
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-700">
          Title <span className="text-gray-400 font-normal text-xs">(Optional)</span>
        </label>
        <input 
          name="title" 
          defaultValue={defaultValues?.title} 
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm" 
          placeholder="E.g. THE NEW SEASON." 
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-700">
          Subtitle <span className="text-gray-400 font-normal text-xs">(Optional)</span>
        </label>
        <input 
          name="subtitle" 
          defaultValue={defaultValues?.subtitle} 
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm" 
          placeholder="E.g. Modern silhouettes." 
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-700">
          Link URL <span className="text-gray-400 font-normal text-xs">(Optional)</span>
        </label>
        <input 
          name="link" 
          defaultValue={defaultValues?.link} 
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm" 
          placeholder="E.g. /category/dresses or leave blank" 
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-700">
          Button Text <span className="text-gray-400 font-normal text-xs">(Optional)</span>
        </label>
        <input 
          name="button_text" 
          defaultValue={defaultValues?.button_text ?? "Shop Now"} 
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm" 
          placeholder="Shop Now"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-700">Order (Sorting)</label>
        <input 
          name="order" 
          type="number" 
          defaultValue={defaultValues?.order || 0} 
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm" 
        />
      </div>

      <div className="md:col-span-2 flex justify-end gap-3 mt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-6 py-2.5 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={loading} 
          className="bg-black text-white px-6 py-2.5 rounded-lg font-bold disabled:opacity-50 hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : 'Save Banner'}
        </button>
      </div>
    </form>
  );
}

export default function BannersClient({ initialData, bannerType = "home" }: { initialData: any[], bannerType?: string }) {
  const [banners, setBanners] = useState(initialData);
  const [isAdding, setIsAdding] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [deletingBannerId, setDeletingBannerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddSubmit = async (formData: FormData, file: File | null) => {
    setLoading(true);
    formData.append("type", bannerType);
    
    // Check if we have file
    if (file) {
      formData.set('imageFile', file);
    } else {
      toast.error('Please choose an image file to upload');
      setLoading(false);
      return;
    }

    const res = await createBanner(formData);
    setLoading(false);
    
    if (res.success) {
      toast.success('Banner added successfully');
      setBanners([...banners, res.data].sort((a, b) => a.order - b.order));
      setIsAdding(false);
    } else {
      toast.error(res.error || 'Failed to save banner');
    }
  };

  const handleEditSubmit = async (formData: FormData, file: File | null) => {
    if (!editingBanner) return;
    
    setLoading(true);
    if (file) {
      formData.set('imageFile', file);
    } else if (editingBanner.image) {
      formData.set('image', editingBanner.image);
    }

    const res = await updateBanner(editingBanner._id, formData);
    setLoading(false);
    
    if (res.success) {
      toast.success('Banner updated successfully');
      setBanners(banners.map(b => b._id === editingBanner._id ? res.data : b).sort((a, b) => a.order - b.order));
      setEditingBanner(null);
    } else {
      toast.error(res.error || 'Failed to update banner');
    }
  };

  const handleDelete = async () => {
    if (!deletingBannerId) return;
    setLoading(true);
    const res = await deleteBanner(deletingBannerId);
    setLoading(false);
    if (res.success) {
      toast.success('Banner deleted');
      setBanners(banners.filter(b => b._id !== deletingBannerId));
      setDeletingBannerId(null);
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="p-6 md:p-10 w-full space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{bannerType === "auth" ? "Auth Page Slider" : "Home Hero Banners"}</h1>
          <p className="text-gray-500 mt-1">Manage {bannerType === "auth" ? "login/signup page sliders" : "homepage hero banners"}</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setEditingBanner(null); }} 
          className="bg-black text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Banner
        </button>
      </div>

      {isAdding && (
        <BannerForm 
          bannerType={bannerType}
          loading={loading}
          onSubmit={handleAddSubmit} 
          onCancel={() => setIsAdding(false)} 
        />
      )}

      {editingBanner && (
        <BannerForm 
          defaultValues={editingBanner}
          bannerType={bannerType}
          loading={loading}
          onSubmit={handleEditSubmit} 
          onCancel={() => setEditingBanner(null)} 
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {banners.map(banner => (
          <div key={banner._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group hover:shadow-md transition-shadow">
            <div className="relative h-56 w-full">
              <img src={banner.image} alt="Banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              
              {/* Action Buttons Overlay */}
              <div className="absolute top-3 right-3 flex gap-2 transition-opacity">
                <button 
                  onClick={() => { setEditingBanner(banner); setIsAdding(false); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                  className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-700 hover:text-black hover:bg-white transition-colors shadow-sm"
                  title="Edit Banner"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button 
                  onClick={() => setDeletingBannerId(banner._id)}
                  className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors shadow-sm"
                  title="Delete Banner"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="font-bold text-lg leading-tight truncate">{banner.title || 'Untitled Banner'}</h3>
                <p className="text-xs text-gray-200 truncate mt-0.5">{banner.subtitle || 'No subtitle'}</p>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 rounded-full text-gray-600">
                Order: {banner.order}
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-gray-400 truncate max-w-[60%]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  <span className="truncate">{banner.link || 'No URL'}</span>
                </div>
                <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  {banner.button_text || 'Shop Now'}
                </span>
              </div>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
            <svg className="w-12 h-12 mb-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <p className="text-lg font-medium text-gray-500">No banners found</p>
            <p className="text-sm mt-1">Click "Add Banner" to create your first slider.</p>
          </div>
        )}
      </div>

      {/* Custom Delete Modal */}
      <Modal 
        isOpen={!!deletingBannerId} 
        onClose={() => setDeletingBannerId(null)}
        title="Delete Banner"
      >
        <div className="p-5">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-red-50 flex flex-shrink-0 items-center justify-center text-red-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-1">Are you absolutely sure?</h4>
              <p className="text-sm text-gray-500">This action cannot be undone. This will permanently delete the banner from your store's homepage slider.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              onClick={() => setDeletingBannerId(null)}
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
