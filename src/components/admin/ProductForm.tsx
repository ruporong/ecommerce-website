'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, updateProduct } from '@/app/actions/product';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { compressImage } from '@/lib/imageCompression';

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });


export default function ProductForm({ 
  initialData, 
  categories = [], 
  subCategories = [], 
  brands = [], 
  colors = [], 
  tags = [], 
  sizeCharts = [] 
}: { 
  initialData?: any,
  categories?: any[],
  subCategories?: any[],
  brands?: any[],
  colors?: any[],
  tags?: any[],
  sizeCharts?: any[]
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
  
  // Basic Info
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  
  // Relations
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [subCategoryId, setSubCategoryId] = useState(initialData?.sub_category_id || '');
  const [brandId, setBrandId] = useState(initialData?.brand_id || '');
  const [sizeChartId, setSizeChartId] = useState(initialData?.size_chart_id || '');
  
  // Multi-relations
  const [selectedColors, setSelectedColors] = useState<string[]>(initialData?.colors || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  
  // Pricing & Status
  const [price, setPrice] = useState(initialData?.price || '');
  const [discountPrice, setDiscountPrice] = useState(initialData?.discount_price || '');
  const [stock, setStock] = useState(initialData?.stock || '');
  const [videoUrl, setVideoUrl] = useState(initialData?.video_url || '');
  const [isActive, setIsActive] = useState(initialData ? initialData.is_active : true);
  
  // SEO
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || '');
  const [metaKeywords, setMetaKeywords] = useState(initialData?.meta_keywords || '');

  // Dynamic FAQs
  const [faqs, setFaqs] = useState<{question: string, answer: string}[]>(initialData?.faqs || []);

  // Images
  const [mainImagePreviews, setMainImagePreviews] = useState<string[]>(initialData?.mainImages || []);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<string[]>(initialData?.images || []);
  
  const [newMainImages, setNewMainImages] = useState<File[]>([]);
  const [newGalleryImages, setNewGalleryImages] = useState<File[]>([]);
  
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryImageInputRef = useRef<HTMLInputElement>(null);

  // Filtered sub-categories
  const availableSubCategories = subCategories.filter(sub => sub.parent_category_id === categoryId);

  // Effect to reset sub-category if category changes and it's not valid
  useEffect(() => {
    if (categoryId && subCategoryId) {
      const isValid = subCategories.some(sub => sub._id === subCategoryId && sub.parent_category_id === categoryId);
      if (!isValid) setSubCategoryId('');
    }
  }, [categoryId, subCategoryId, subCategories]);


  const handleAiGenerate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a Product Name first');
      return;
    }
    
    setIsGeneratingAi(true);
    const toastId = toast.loading('Generating AI description & FAQs...');
    
    try {
      const selectedCat = categories.find(c => c._id === categoryId);
      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          category: selectedCat ? selectedCat.name : '' 
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (data.description) setDescription(data.description);
        if (data.faqs && Array.isArray(data.faqs) && data.faqs.length > 0) {
          setFaqs(data.faqs);
        }
        toast.success('Generated successfully!', { id: toastId });
      } else {
        toast.error(data.error || 'Failed to generate', { id: toastId });
      }
    } catch (err) {
      toast.error('Network error during generation', { id: toastId });
    } finally {
      setIsGeneratingAi(false);
    }
  };


  const handleAiGenerateSeo = async () => {
    if (!name.trim()) {
      toast.error('Please enter a Product Name first');
      return;
    }
    
    setIsGeneratingSeo(true);
    const toastId = toast.loading('Generating SEO metadata...');
    
    try {
      const selectedCat = categories.find(c => c._id === categoryId);
      const res = await fetch('/api/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          category: selectedCat ? selectedCat.name : '',
          description
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (data.meta_title) setMetaTitle(data.meta_title);
        if (data.meta_description) setMetaDescription(data.meta_description);
        if (data.meta_keywords) setMetaKeywords(data.meta_keywords);
        toast.success('SEO generated successfully!', { id: toastId });
      } else {
        toast.error(data.error || 'Failed to generate', { id: toastId });
      }
    } catch (err) {
      toast.error('Network error during generation', { id: toastId });
    } finally {
      setIsGeneratingSeo(false);
    }
  };

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (mainImagePreviews.length + filesArray.length > 2) {
        toast.error("Maximum 2 main images allowed");
        return;
      }
      const compressedFiles = await Promise.all(
        filesArray.map(file => compressImage(file, 1600, 2000, 0.85))
      );
      setNewMainImages(prev => [...prev, ...compressedFiles]);
      const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));
      setMainImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleGalleryImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const compressedFiles = await Promise.all(
        filesArray.map(file => compressImage(file, 1600, 2000, 0.85))
      );
      setNewGalleryImages(prev => [...prev, ...compressedFiles]);
      const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));
      setGalleryImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeMainImage = (index: number) => {
    const isExisting = index < (initialData?.mainImages?.length || 0);
    if (isExisting && initialData) {
      initialData.mainImages.splice(index, 1);
    } else {
      const newIndex = index - (initialData?.mainImages?.length || 0);
      const updatedFiles = [...newMainImages];
      updatedFiles.splice(newIndex, 1);
      setNewMainImages(updatedFiles);
    }
    const updatedPreviews = [...mainImagePreviews];
    updatedPreviews.splice(index, 1);
    setMainImagePreviews(updatedPreviews);
  };

  const removeGalleryImage = (index: number) => {
    const isExisting = index < (initialData?.images?.length || 0);
    if (isExisting && initialData) {
      initialData.images.splice(index, 1);
    } else {
      const newIndex = index - (initialData?.images?.length || 0);
      const updatedFiles = [...newGalleryImages];
      updatedFiles.splice(newIndex, 1);
      setNewGalleryImages(updatedFiles);
    }
    const updatedPreviews = [...galleryImagePreviews];
    updatedPreviews.splice(index, 1);
    setGalleryImagePreviews(updatedPreviews);
  };

  const addFaq = () => setFaqs([...faqs, { question: '', answer: '' }]);
  const removeFaq = (index: number) => {
    const newFaqs = [...faqs];
    newFaqs.splice(index, 1);
    setFaqs(newFaqs);
  };
  const updateFaq = (index: number, field: 'question'|'answer', value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  const toggleColor = (id: string) => {
    if (selectedColors.includes(id)) {
      setSelectedColors(selectedColors.filter(c => c !== id));
    } else {
      setSelectedColors([...selectedColors, id]);
    }
  };

  const toggleTag = (id: string) => {
    if (selectedTags.includes(id)) {
      setSelectedTags(selectedTags.filter(t => t !== id));
    } else {
      setSelectedTags([...selectedTags, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Product name is required");
    if (!price) return toast.error("Price is required");
    if (!categoryId) return toast.error("Category is required");
    
    setIsLoading(true);
    const toastId = toast.loading("Processing and uploading images...");

    try {
      // 1. Upload new main images individually
      const uploadedMainUrls: string[] = [];
      for (let i = 0; i < newMainImages.length; i++) {
        toast.loading(`Uploading main image (${i + 1}/${newMainImages.length})...`, { id: toastId });
        const compressed = await compressImage(newMainImages[i], 1600, 2000, 0.85);
        const uploadForm = new FormData();
        uploadForm.append('file', compressed);
        uploadForm.append('folder', 'mini_e_store/products');

        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          body: uploadForm,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadData.error || `Failed to upload main image ${i + 1}`);
        }
        uploadedMainUrls.push(uploadData.url);
      }

      // 2. Upload new gallery images individually
      const uploadedGalleryUrls: string[] = [];
      for (let i = 0; i < newGalleryImages.length; i++) {
        toast.loading(`Uploading gallery image (${i + 1}/${newGalleryImages.length})...`, { id: toastId });
        const compressed = await compressImage(newGalleryImages[i], 1600, 2000, 0.85);
        const uploadForm = new FormData();
        uploadForm.append('file', compressed);
        uploadForm.append('folder', 'mini_e_store/products');

        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          body: uploadForm,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadData.error || `Failed to upload gallery image ${i + 1}`);
        }
        uploadedGalleryUrls.push(uploadData.url);
      }

      toast.loading("Saving product details...", { id: toastId });

      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price.toString());
      if (discountPrice) formData.append('discount_price', discountPrice.toString());
      formData.append('stock', stock.toString());
      formData.append('video_url', videoUrl);
      formData.append('category_id', categoryId);
      if (subCategoryId) formData.append('sub_category_id', subCategoryId);
      if (brandId) formData.append('brand_id', brandId);
      if (sizeChartId) formData.append('size_chart_id', sizeChartId);
      
      selectedColors.forEach(c => formData.append('colors', c));
      selectedTags.forEach(t => formData.append('tags', t));
      
      formData.append('is_active', isActive.toString());
      formData.append('meta_title', metaTitle);
      formData.append('meta_description', metaDescription);
      formData.append('meta_keywords', metaKeywords);
      formData.append('faqs', JSON.stringify(faqs));

      // Append pre-uploaded URLs (very lightweight, few bytes each)
      uploadedMainUrls.forEach(url => formData.append('mainImageUrls', url));
      uploadedGalleryUrls.forEach(url => formData.append('imageUrls', url));

      if (initialData) {
        formData.append('existingMainImages', JSON.stringify(initialData.mainImages || []));
        formData.append('existingImages', JSON.stringify(initialData.images || []));
      }

      const res = initialData 
        ? await updateProduct(initialData._id, formData)
        : await createProduct(formData);

      if (res.success) {
        toast.success(initialData ? 'Product updated successfully' : 'Product created successfully', { id: toastId });
        router.push('/admin/products');
        router.refresh();
      } else {
        toast.error(res.error || 'Something went wrong', { id: toastId });
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Error saving product:', err);
      toast.error(err.message || 'Error uploading images or saving product', { id: toastId });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-10">
      
      <div className="space-y-8">
        
        {/* Section 1: Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-5">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                placeholder="e.g. Modern Leather Sofa"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
              <select 
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none bg-white transition-all"
                required
              >
                <option value="">Select a category</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Sub-Category</label>
              <select 
                value={subCategoryId}
                onChange={e => setSubCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400 transition-all"
                disabled={!categoryId || availableSubCategories.length === 0}
              >
                <option value="">Select a sub-category</option>
                {availableSubCategories.map(sub => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand</label>
              <select 
                value={brandId}
                onChange={e => setBrandId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none bg-white transition-all"
              >
                <option value="">No Brand (Generic)</option>
                {brands.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Size Chart</label>
              <select 
                value={sizeChartId}
                onChange={e => setSizeChartId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none bg-white transition-all"
              >
                <option value="">No Size Chart</option>
                {sizeCharts.map(sc => (
                  <option key={sc._id} value={sc._id}>{sc.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & Inventory */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-5">Pricing & Inventory</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Regular Price (৳) <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                min="0"
                step="0.01"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none font-mono transition-all"
                placeholder="e.g. 1500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Price (৳)</label>
              <input 
                type="number" 
                min="0"
                step="0.01"
                value={discountPrice}
                onChange={e => setDiscountPrice(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none font-mono transition-all"
                placeholder="Optional"
              />
              {discountPrice && parseFloat(discountPrice) >= parseFloat(price) && (
                <p className="text-xs text-red-500 mt-1.5">Discount must be less than regular price.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Available Stock <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                min="0"
                value={stock}
                onChange={e => setStock(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none font-mono transition-all"
                placeholder="e.g. 50"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Attributes (Colors & Tags) */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-5">Colors & Tags</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Available Colors</label>
              {colors.length === 0 ? (
                <p className="text-sm text-gray-400">No colors created yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {colors.map(color => {
                    const isSelected = selectedColors.includes(color._id);
                    return (
                      <button
                        key={color._id}
                        type="button"
                        onClick={() => toggleColor(color._id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isSelected ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-300 hover:border-gray-400 bg-white'} transition-all`}
                      >
                        <span className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: color.value }}></span>
                        <span className="text-sm font-medium text-gray-700">{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Tags</label>
              {tags.length === 0 ? (
                <p className="text-sm text-gray-400">No tags created yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => {
                    const isSelected = selectedTags.includes(tag._id);
                    return (
                      <button
                        key={tag._id}
                        type="button"
                        onClick={() => toggleTag(tag._id)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${isSelected ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'} transition-all`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Media */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-5">Product Media</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Main Images */}
            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-gray-900">Main Images (Max 2)</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">Required</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                {mainImagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-square border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                    <img src={preview} alt="Main" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeMainImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 hover:scale-110 transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    {idx === 0 && <span className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded shadow-sm">Primary</span>}
                  </div>
                ))}
                
                {mainImagePreviews.length < 2 && (
                  <div 
                    onClick={() => mainImageInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-500 hover:bg-orange-50/30 transition-all cursor-pointer bg-white"
                  >
                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4"></path></svg>
                    <span className="text-sm font-medium">Add Image</span>
                  </div>
                )}
              </div>
              <input type="file" ref={mainImageInputRef} onChange={handleMainImageChange} multiple accept="image/*" className="hidden" />
              <p className="text-red-500 text-[11px] text-center font-bold mt-2 mb-1">Recommended size: 1080x1350 px (4:5 ratio)</p>
              <p className="text-xs text-gray-400 text-center">PNG, JPG, WEBP up to 2MB</p>
            </div>

            {/* Gallery Images */}
            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-gray-900">Gallery Images</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">Optional</span>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-3">
                {galleryImagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-square border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                    <img src={preview} alt="Gallery" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 hover:scale-110 transition-all">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                ))}
                
                <div 
                  onClick={() => galleryImageInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer bg-white"
                >
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4"></path></svg>
                  <span className="text-[10px] font-medium">Add</span>
                </div>
              </div>
              <input type="file" ref={galleryImageInputRef} onChange={handleGalleryImageChange} multiple accept="image/*" className="hidden" />
              <p className="text-xs text-gray-400 text-center">Unlimited images</p>
            </div>
          </div>

          <div className="mt-6 col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Video URL (Optional)</label>
            <input
              type="url"
              placeholder="e.g. https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-sm bg-white"
            />
            <p className="text-[12px] text-gray-500 mt-1.5">Add a YouTube or Vimeo link to show a video of the product.</p>
          </div>
        </div>

        {/* Section 5: Description & FAQs */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-5">Description & Information</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="block text-sm font-medium text-gray-700">Detailed Description</label>
                <button 
                  type="button" 
                  onClick={handleAiGenerate}
                  disabled={isGeneratingAi || !name.trim()}
                  className="text-xs font-bold tracking-wider text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition-colors uppercase shadow-sm border border-orange-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  {isGeneratingAi ? 'Generating...' : 'AI Generate'}
                </button>
              </div>
              <div className="prose-sm max-w-none border border-gray-300 rounded-xl overflow-hidden shadow-sm">
                <JoditEditor
                  value={description}
                  config={{
                    readonly: false,
                    placeholder: 'Write a compelling description...',
                    height: 350,
                    toolbarAdaptive: false,
                    buttons: ['bold', 'italic', 'underline', 'strikethrough', '|', 'ul', 'ol', '|', 'outdent', 'indent', '|', 'font', 'fontsize', 'brush', 'paragraph', '|', 'image', 'video', 'table', 'link', '|', 'align', 'undo', 'redo', '|', 'hr', 'eraser', 'copyformat', '|', 'symbol', 'fullsize', 'print', 'about']
                  }}
                  onBlur={newContent => setDescription(newContent)}
                />
              </div>
            </div>
            
            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">Frequently Asked Questions</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Optional Q&A for the product page</p>
                </div>
                <button type="button" onClick={addFaq} className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 shadow-sm transition-colors">
                  + Add Question
                </button>
              </div>
              
              {faqs.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg bg-white">
                  <p className="text-sm text-gray-400">No FAQs added yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="flex gap-4 items-start bg-white p-4 rounded-xl border border-gray-200 shadow-sm group">
                      <div className="flex-1 space-y-3">
                        <input 
                          type="text" 
                          value={faq.question}
                          onChange={e => updateFaq(idx, 'question', e.target.value)}
                          placeholder="e.g. What is the material?"
                          className="w-full text-sm font-medium px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        />
                        <textarea 
                          value={faq.answer}
                          onChange={e => updateFaq(idx, 'answer', e.target.value)}
                          placeholder="Provide a clear answer..."
                          className="w-full text-sm px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black h-20 resize-none transition-all"
                        ></textarea>
                      </div>
                      <button type="button" onClick={() => removeFaq(idx)} className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 6: SEO & Visibility */}
        <div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-5">
            <h3 className="text-lg font-semibold text-gray-900">SEO & Visibility</h3>
            <button 
              type="button" 
              onClick={handleAiGenerateSeo}
              disabled={isGeneratingSeo || !name.trim()}
              className="text-xs font-bold tracking-wider text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition-colors uppercase shadow-sm border border-orange-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              {isGeneratingSeo ? 'Generating...' : 'AI Generate'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Title</label>
                <input 
                  type="text" 
                  value={metaTitle}
                  onChange={e => setMetaTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                  placeholder="SEO Title (leave blank to use product name)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Description</label>
                <textarea 
                  value={metaDescription}
                  onChange={e => setMetaDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none h-24 resize-y text-sm transition-all"
                  placeholder="Brief description for search engines..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Keywords</label>
                <input 
                  type="text" 
                  value={metaKeywords}
                  onChange={e => setMetaKeywords(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                  placeholder="e.g. sofa, living room, modern furniture"
                />
                <p className="text-xs text-gray-400 mt-1.5">Separate keywords with commas.</p>
              </div>
            </div>

            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 h-full flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-gray-900">Publish Product</p>
                  <p className="text-sm text-gray-500 mt-1">Make this product visible on your store instantly.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer scale-110">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      {/* Footer Actions */}
      <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end gap-4">
        <button type="button" onClick={() => router.back()} className="px-8 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-all shadow-sm">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="px-10 py-3 text-sm font-semibold text-white bg-black hover:bg-gray-800 rounded-xl disabled:opacity-70 transition-all shadow-md flex items-center gap-2">
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Saving...
            </>
          ) : 'Save Product'}
        </button>
      </div>

    </form>
  );}
