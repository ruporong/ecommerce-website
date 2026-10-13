'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { saveSettings } from '@/app/actions/settingsActions';

export default function SeoSettingsClient({ initialData }: { initialData: Record<string, string> }) {
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(initialData.seo_og_image || null);
  
  const [title, setTitle] = useState(initialData.seo_title || '');
  const [description, setDescription] = useState(initialData.seo_description || '');
  const [keywords, setKeywords] = useState(initialData.seo_keywords || '');
  const [activePreview, setActivePreview] = useState<'google' | 'facebook' | 'instagram' | 'tiktok'>('google');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    // If preview is null, it means image was deleted
    if (!previewImage && initialData.seo_og_image) {
      formData.append('seo_og_image_deleted', 'true');
    }

    try {
      const result = await saveSettings(formData, '/admin/settings/seo');
      if (result.success) toast.success('SEO Settings saved successfully!');
      else toast.error(result.error || 'Failed to save settings.');
    } catch (error) {
      toast.error('An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const domain = typeof window !== 'undefined' ? window.location.hostname : 'yourstore.com';

  return (
    <div className="w-full space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">SEO Settings</h1>
        <p className="text-sm text-gray-500 mt-2">Optimize your store for search engines and social media.</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-8 items-start">
        {/* Left Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Default Meta Data</h2>
            <p className="text-sm text-gray-500 mt-1">These details will be used if a specific page doesn't have its own SEO data.</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Title</label>
              <input 
                type="text" 
                name="seo_title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none font-medium text-gray-900 placeholder-gray-300"
                placeholder="e.g. Best Online Store | Shop Now"
              />
              <p className="text-xs text-gray-400 mt-2">Recommended: 50-60 characters</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Description</label>
              <textarea 
                name="seo_description" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-28 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none text-sm text-gray-700 placeholder-gray-300 resize-none"
                placeholder="Write a brief description of your store..."
              />
              <p className="text-xs text-gray-400 mt-2">Recommended: 150-160 characters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Keywords</label>
              <input 
                type="text" 
                name="seo_keywords" 
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black outline-none text-sm text-gray-900 placeholder-gray-300"
                placeholder="e.g. clothing, fashion, online store"
              />
              <p className="text-xs text-gray-400 mt-2">Comma separated keywords</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Open Graph Image (Social Media Share)</label>
              
              <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl bg-white p-6 text-center group relative hover:border-gray-400 transition-colors flex flex-col items-center justify-center min-h-[200px]">
                {previewImage && (
                  <div className="relative w-full h-40 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 mb-4 group/preview">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-contain p-2" />
                    <button 
                      type="button" 
                      onClick={(e) => { e.preventDefault(); removeImage(); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors z-10 shadow-sm"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                )}
                
                <input 
                  type="file" 
                  name="seo_og_image" 
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {!previewImage && (
                  <div className="flex flex-col items-center pointer-events-none">
                    <div className="w-12 h-12 mb-3 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    </div>
                    <span className="text-sm font-medium text-gray-600">Click to upload or drag & drop</span>
                    <span className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={isSaving} className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

                {/* Right Previews */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50 overflow-x-auto">
              <button 
                type="button"
                onClick={() => setActivePreview('google')}
                className={`flex-1 py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap transition-colors ${activePreview === 'google' ? 'text-black border-b-2 border-black bg-white' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" /></svg>
                Google
              </button>
              <button 
                type="button"
                onClick={() => setActivePreview('facebook')}
                className={`flex-1 py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap transition-colors ${activePreview === 'facebook' ? 'text-[#1877F2] border-b-2 border-[#1877F2] bg-white' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" /></svg>
                Facebook
              </button>
              <button 
                type="button"
                onClick={() => setActivePreview('instagram')}
                className={`flex-1 py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap transition-colors ${activePreview === 'instagram' ? 'text-[#E1306C] border-b-2 border-[#E1306C] bg-white' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" /></svg>
                Instagram
              </button>
              <button 
                type="button"
                onClick={() => setActivePreview('tiktok')}
                className={`flex-1 py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap transition-colors ${activePreview === 'tiktok' ? 'text-black border-b-2 border-black bg-white' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 6.14 5.7c3.12 0 5.26-2.36 5.26-5.59V7.74c1.11.86 2.39 1.2 3.86 1.15v-3.04c-.95-.01-1.92-.19-2.82-.03z" /></svg>
                TikTok
              </button>
            </div>

            {/* Preview Content Area */}
            <div className="flex-1 bg-[#f0f2f5] flex items-center justify-center p-6 overflow-y-auto">
              
              {/* Google */}
              {activePreview === 'google' && (
                <div className="w-full max-w-[500px] p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 overflow-hidden shrink-0">
                      {initialData.favicon_url ? (
                        <img src={initialData.favicon_url} alt="Favicon" className="w-full h-full object-cover" />
                      ) : (
                        domain[0].toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-[#202124] truncate leading-none mb-0.5">{domain}</div>
                      <div className="text-[12px] text-[#4d5156] truncate leading-none">https://{domain}</div>
                    </div>
                  </div>
                  <div className="text-xl text-[#1a0dab] font-medium hover:underline cursor-pointer truncate mb-1">
                    {title || 'Your Site Title'}
                  </div>
                  <div className="text-sm text-[#4d5156] line-clamp-2">
                    {description || 'This is an example of what your meta description will look like in Google search results. Make it catchy!'}
                  </div>
                </div>
              )}

              {/* Facebook */}
              {activePreview === 'facebook' && (
                <div className="w-full max-w-[400px] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="w-full h-[200px] bg-gray-200 border-b border-gray-200 relative">
                    {previewImage ? (
                      <img src={previewImage} alt="OG" className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-[#f2f3f5]">
                    <div className="text-[12px] text-gray-500 uppercase tracking-wide mb-1 truncate">{domain}</div>
                    <div className="text-base font-bold text-gray-900 leading-tight mb-1 line-clamp-1">{title || 'Your Site Title'}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{description || 'Your site description will appear here...'}</div>
                  </div>
                </div>
              )}

              {/* Instagram DM */}
              {activePreview === 'instagram' && (
                <div className="w-full max-w-[280px] bg-white border border-gray-200 rounded-[20px] overflow-hidden shadow-sm flex flex-col">
                  <div className="w-full h-[150px] bg-gray-200 relative">
                    {previewImage ? (
                      <img src={previewImage} alt="OG" className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-white">
                    <div className="text-sm font-bold text-gray-900 leading-tight mb-0.5 line-clamp-2">{title || 'Your Site Title'}</div>
                    <div className="text-xs text-gray-400 truncate">{domain}</div>
                  </div>
                </div>
              )}

              {/* TikTok DM */}
              {activePreview === 'tiktok' && (
                <div className="w-full max-w-[300px] bg-gray-100 border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-gray-300"></div>
                    <div className="text-xs font-bold text-gray-800">You shared a link</div>
                  </div>
                  <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                    <div className="flex">
                      <div className="p-3 flex-1">
                        <div className="text-sm font-bold text-gray-900 leading-tight mb-1 line-clamp-2">{title || 'Your Site Title'}</div>
                        <div className="text-[11px] text-gray-500 line-clamp-1 mb-1">{description || 'Check out this awesome site...'}</div>
                        <div className="text-[10px] text-gray-400 truncate">{domain}</div>
                      </div>
                      <div className="w24 h-full min-h-[80px] w-[80px] bg-gray-200 relative flex-shrink-0">
                        {previewImage ? (
                          <img src={previewImage} alt="OG" className="w-full h-full object-cover absolute inset-0" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
