'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitReview } from '@/app/actions/review';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';
import PlaceholderImage from '@/components/PlaceholderImage';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailsClient({ product, relatedProducts = [] }: { product: any, relatedProducts?: any[] }) {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(product.allImages?.[0] || '');
  
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    if (url.includes('vimeo.com/')) {
      return url.replace('vimeo.com/', 'player.vimeo.com/video/');
    }
    return url;
  };
  const [selectedColor, setSelectedColor] = useState(product.colorsList?.[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState(product.sizesList?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('desc'); // desc, details, shipping
  const [isAdding, setIsAdding] = useState(false);
    const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) {
      return toast.error("Please fill all fields");
    }
    
    setIsSubmittingReview(true);
    const formData = new FormData();
    formData.append('product_id', product._id);
    formData.append('name', reviewForm.name);
    formData.append('rating', reviewForm.rating.toString());
    formData.append('comment', reviewForm.comment);
    formData.append('path', `/product/${product.slug}`);

    const res = await submitReview(formData);
    setIsSubmittingReview(false);
    
    if (res.success) {
      toast.success("Review submitted successfully! It will appear after admin approval.");
      setReviewForm({ name: '', rating: 5, comment: '' });
    } else {
      toast.error(res.error || "Failed to submit review");
    }
  };
  
  const addItem = useCartStore((state) => state.addItem);

  const handleBuyNow = () => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.allImages?.[0] || '',
      quantity: quantity,
      size: selectedSize,
      color: selectedColor,
    });
    router.push('/checkout');
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.allImages?.[0] || '',
      quantity: quantity,
      size: selectedSize,
      color: selectedColor,
    });
    
    setTimeout(() => {
      setIsAdding(false);
      toast.success('Successfully added to cart');
    }, 800);
  };

  return (
    <section id="product-details" className="product-details-component w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-charcoal font-sans antialiased">
      
      {/* Breadcrumb */}
      <nav className="flex text-sm text-gray-500 mb-8 lg:pt-20 pt-10" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-2">
          <li><Link href="/" className="hover:text-charcoal transition-colors">Home</Link></li>
          <li><span className="mx-2">/</span></li>
          <li aria-current="page" className="text-charcoal font-medium truncate">{product.name}</li>
        </ol>
      </nav>

      {/* Main Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-start">
        
        {/* LEFT: PRODUCT GALLERY */}
        <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6 lg:sticky lg:top-28">
          {/* Thumbnails */}
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar snap-x snap-mandatory lg:w-24 shrink-0">
            {product.video_url && (
              <button
                onClick={() => setActiveImage('video')}
                className={`gallery-thumb ${activeImage === 'video' ? 'border-charcoal border-2' : 'border-gray-200 border hover:border-gray-400'} rounded-2xl overflow-hidden shrink-0 snap-start w-20 h-24 lg:w-24 lg:h-32 transition-all bg-gray-100 flex items-center justify-center relative`}
              >
                {product.allImages?.[0] ? (
                  <img src={product.allImages[0]} alt="Video Thumbnail" className="w-full h-full object-cover opacity-60" />
                ) : (
                  <div className="w-full h-full bg-gray-200"></div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 rounded-full p-2 shadow-md">
                    <svg className="w-5 h-5 text-red-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 6v12l10-6z"></path></svg>
                  </div>
                </div>
              </button>
            )}
            {product.allImages?.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`gallery-thumb ${activeImage === img ? 'border-charcoal border-2' : 'border-gray-200 border hover:border-gray-400'} rounded-2xl overflow-hidden shrink-0 snap-start w-20 h-24 lg:w-24 lg:h-32 transition-all bg-gray-100 flex items-center justify-center`}
              >
                {img ? (
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                ) : (
                  <PlaceholderImage className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="relative w-full aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden group">
            {product.stock > 0 && (
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <span className="bg-charcoal text-white text-[10px] uppercase tracking-widest font-bold py-1.5 px-3 rounded-full">Available</span>
              </div>
            )}
            {activeImage === 'video' && product.video_url ? (
              <iframe 
                src={getEmbedUrl(product.video_url)} 
                className="w-full h-full border-0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            ) : activeImage ? (
              <img 
                id="main-product-image" 
                src={activeImage} 
                alt={product.name} 
                className="w-full h-full object-cover object-center cursor-zoom-in transition-all duration-500 group-hover:scale-105" 
              />
            ) : (
              <PlaceholderImage className="w-full h-full object-cover object-center cursor-zoom-in transition-all duration-500 group-hover:scale-105" />
            )}
          </div>
        </div>

        {/* RIGHT: PRODUCT INFO */}
        <div className="flex flex-col">
          {/* Brand & Title */}
          <div className="mb-4">
            <span className="text-xs text-gray-500 tracking-[0.18em] uppercase font-semibold mb-2 block">{product.categoryName || 'Collection'}</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-charcoal leading-snug">{product.name}</h1>
          </div>

          {/* Rating & Share */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="flex text-charcoal text-sm">★★★★★</div>
              <span className="text-sm font-medium">5.0</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3 mb-6">
            <span className="text-3xl font-bold text-charcoal">৳{product.price}</span>
          </div>

          {/* Short Description */}
          <div className="text-base leading-relaxed mb-6 text-gray-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.description || 'No description available for this product.' }} />

          
          {/* Variants Area */}
          <div className="space-y-5 mb-6 border-y border-gray-100 py-5">
            {/* Color Variant */}
            {product.colorsList && product.colorsList.length > 0 && (
              <div className="variant-group">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[13px] uppercase tracking-wider font-semibold text-charcoal">Color: <span className="text-gray-500 font-normal">{selectedColor}</span></span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.colorsList.map((color: any) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 outline-none ${
                        selectedColor === color.name 
                          ? 'border border-charcoal' 
                          : 'border border-transparent hover:border-gray-300'
                      }`}
                      title={color.name}
                    >
                      <span 
                        className="w-7 h-7 rounded-full border border-black/10 shadow-inner" 
                        style={{ backgroundColor: color.value }}
                      ></span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Variant */}
            {product.sizesList && product.sizesList.length > 0 && (
              <div className="variant-group">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[13px] uppercase tracking-wider font-semibold text-charcoal">Size: <span className="text-gray-500 font-normal">{selectedSize}</span></span>
                  <button onClick={() => setIsSizeChartOpen(true)} className="text-[12px] underline text-gray-500 hover:text-charcoal transition-colors">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizesList.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 flex items-center justify-center rounded-full border text-[13px] font-medium transition-all duration-300 ${selectedSize === size ? 'border-charcoal bg-charcoal text-white shadow-md' : 'border-gray-200 text-gray-700 hover:border-gray-400 bg-white'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Purchase Actions */}
          <div className="flex flex-col gap-3 mb-5">
            <div className="flex gap-3 h-12">
              {/* Quantity */}
              <div className="flex items-center justify-between border border-gray-200 rounded-full px-2 w-32 shrink-0 bg-white">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-charcoal rounded-full transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                </button>
                <span className="text-[15px] font-semibold text-charcoal w-6 text-center select-none">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-charcoal rounded-full transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </button>
              </div>

              {/* Add to Cart */}
              {product.stock > 0 ? (
                <button 
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className={`flex-1 text-[13px] tracking-widest uppercase font-semibold rounded-full transition-all flex items-center justify-center relative overflow-hidden group ${isAdding ? 'bg-green-600 text-white cursor-not-allowed shadow-inner' : 'bg-charcoal hover:bg-black text-white hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)] transform hover:-translate-y-0.5'}`}
                >
                  <span>{isAdding ? 'ADDED TO CART ✓' : 'ADD TO CART'}</span>
                </button>
              ) : (
                <button 
                  onClick={async () => {
                    const token = localStorage.getItem('fcm_token_value');
                    if (!token) return toast.error('Please allow notifications first to use this feature.');
                    
                    const res = await fetch('/api/notify-stock', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ productId: product._id, token })
                    });
                    if (res.ok) toast.success('We will notify you when back in stock!');
                  }}
                  className="flex-1 text-[13px] tracking-widest uppercase font-semibold rounded-full transition-all flex items-center justify-center relative overflow-hidden group bg-gray-200 text-gray-500 hover:bg-gray-300"
                >
                  <span>NOTIFY ME WHEN AVAILABLE</span>
                </button>
              )}
            </div>
            
            {product.stock > 0 && (
              <button onClick={handleBuyNow} className="w-full h-12 bg-white hover:bg-gray-50 border border-charcoal text-charcoal text-[13px] tracking-widest uppercase font-semibold rounded-full transition-all">
                BUY IT NOW
              </button>
            )}
          </div>

          {/* Social Order Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
             <a href={`https://wa.me/1234567890?text=I'm interested in ${product.name}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 h-11 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-medium text-sm transition-colors border border-[#25D366]/20">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
               WhatsApp
             </a>
             <a href="#" className="flex items-center justify-center gap-2 h-11 rounded-xl bg-[#0084FF]/10 hover:bg-[#0084FF]/20 text-[#0084FF] font-medium text-sm transition-colors border border-[#0084FF]/20">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.89 1.446 5.474 3.69 7.151V22l3.383-1.859c.92.253 1.902.392 2.927.392 5.523 0 10-4.145 10-9.275S17.523 2 12 2zm1.09 12.723-2.836-3.03-5.54 3.03 6.077-6.449 2.894 3.03 5.48-3.03-6.075 6.449z"/></svg>
               Messenger
             </a>
          </div>

          {/* Stock Status & Features */}
          <div className="flex flex-col gap-4 bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div className={`flex items-center gap-3 text-[13px] font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${product.stock > 0 ? 'bg-green-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </span>
              {product.stock > 0 ? `In Stock (${product.stock} available) - Ready to ship` : 'Out of Stock'}
            </div>
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-4 border-t border-gray-200/60 text-sm text-charcoal font-medium">
               <div className="flex items-center gap-2">
                 <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                 Secure Checkout
               </div>
               <div className="flex items-center gap-2">
                 <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 Fast Delivery
               </div>
               <div className="flex items-center gap-2">
                 <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                 Authentic Product
               </div>
               <div className="flex items-center gap-2">
                 <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"></path></svg>
                 Return Policy
               </div>
            </div>
          </div>
        </div>
      </div>


      {/* TABS / ACCORDION SECTION */}
      <div className="mt-16 lg:mt-24 max-w-4xl border-t border-gray-200">
        
        {/* Desktop Tabs */}
        <div className="hidden lg:flex gap-8 border-b border-gray-200">
          <button onClick={() => setActiveTab('desc')} className={`text-sm font-semibold tracking-wide uppercase py-4 border-b-2 transition-colors ${activeTab === 'desc' ? 'border-charcoal text-charcoal' : 'border-transparent text-gray-500 hover:text-charcoal'}`}>Description</button>
          <button onClick={() => setActiveTab('details')} className={`text-sm font-semibold tracking-wide uppercase py-4 border-b-2 transition-colors ${activeTab === 'details' ? 'border-charcoal text-charcoal' : 'border-transparent text-gray-500 hover:text-charcoal'}`}>Details</button>
          <button onClick={() => setActiveTab('shipping')} className={`text-sm font-semibold tracking-wide uppercase py-4 border-b-2 transition-colors ${activeTab === 'shipping' ? 'border-charcoal text-charcoal' : 'border-transparent text-gray-500 hover:text-charcoal'}`}>Shipping & Care</button>
          {product.faqs && product.faqs.length > 0 && (
            <button onClick={() => setActiveTab('faqs')} className={`text-sm font-semibold tracking-wide uppercase py-4 border-b-2 transition-colors ${activeTab === 'faqs' ? 'border-charcoal text-charcoal' : 'border-transparent text-gray-500 hover:text-charcoal'}`}>FAQs</button>
          )}
          <button onClick={() => setActiveTab('reviews')} className={`text-sm font-semibold tracking-wide uppercase py-4 border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-charcoal text-charcoal' : 'border-transparent text-gray-500 hover:text-charcoal'}`}>Reviews {product.totalReviews ? `(${product.totalReviews})` : ''}</button>
        </div>

        {/* Tab Contents */}
        <div className="tab-panels">
          {/* Description */}
          <div className="accordion-item border-b lg:border-none border-gray-200">
            <button onClick={() => setActiveTab(activeTab === 'desc' ? '' : 'desc')} className="lg:hidden w-full flex justify-between items-center py-5 text-left font-semibold text-charcoal">
              DESCRIPTION
              <svg className={`w-5 h-5 transform transition-transform ${activeTab === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className={`lg:py-8 py-0 pb-6 prose prose-sm max-w-none ${activeTab === 'desc' ? 'block' : 'hidden'}`}>
              <div dangerouslySetInnerHTML={{ __html: product.description || '' }} />
            </div>
          </div>

          {/* Details */}
          <div className="accordion-item border-b lg:border-none border-gray-200">
            <button onClick={() => setActiveTab(activeTab === 'details' ? '' : 'details')} className="lg:hidden w-full flex justify-between items-center py-5 text-left font-semibold text-charcoal">
              DETAILS
              <svg className={`w-5 h-5 transform transition-transform ${activeTab === 'details' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className={`lg:py-8 py-0 pb-6 ${activeTab === 'details' ? 'block' : 'hidden'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium text-charcoal">{product.categoryName}</span>
                </div>
                {product.sizesList && product.sizesList.length > 0 && (
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Available Sizes</span>
                    <span className="font-medium text-charcoal">{product.sizesList.join(', ')}</span>
                  </div>
                )}
                {product.colorsList && product.colorsList.length > 0 && (
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Available Colors</span>
                    <span className="font-medium text-charcoal">{product.colorsList.map((c: any) => c.name).join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FAQs */}
          {product.faqs && product.faqs.length > 0 && (
            <div className="accordion-item border-b lg:border-none border-gray-200">
              <button onClick={() => setActiveTab(activeTab === 'faqs' ? '' : 'faqs')} className="lg:hidden w-full flex justify-between items-center py-5 text-left font-semibold text-charcoal">
                FAQS
                <svg className={`w-5 h-5 transform transition-transform ${activeTab === 'faqs' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div className={`lg:py-8 py-0 pb-6 ${activeTab === 'faqs' ? 'block' : 'hidden'}`}>
                <div className="space-y-6">
                  {product.faqs.map((faq: any, idx: number) => (
                    <div key={idx} className="border-l-2 border-[#FF5A2E] pl-4">
                      <h4 className="font-bold text-gray-900 mb-1">{faq.question}</h4>
                      <p className="text-gray-600 text-sm">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Shipping */}
          <div className="accordion-item border-b lg:border-none border-gray-200">
            <button onClick={() => setActiveTab(activeTab === 'shipping' ? '' : 'shipping')} className="lg:hidden w-full flex justify-between items-center py-5 text-left font-semibold text-charcoal">
              SHIPPING & CARE
              <svg className={`w-5 h-5 transform transition-transform ${activeTab === 'shipping' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className={`lg:py-8 py-0 pb-6 text-sm ${activeTab === 'shipping' ? 'block' : 'hidden'}`}>
              <h4 className="font-bold text-charcoal mb-2">Shipping Information</h4>
              <p className="mb-6">Standard delivery takes 3-5 business days. Express shipping is available at checkout. Enjoy free returns within 30 days of receiving your order.</p>
              <h4 className="font-bold text-charcoal mb-2">Product Care</h4>
              <p>To preserve the quality of your product, keep it away from prolonged direct sunlight and moisture.</p>
            </div>
          </div>
          
          {/* Reviews */}
          <div className="accordion-item border-b lg:border-none border-gray-200">
            <button onClick={() => setActiveTab(activeTab === 'reviews' ? '' : 'reviews')} className="lg:hidden w-full flex justify-between items-center py-5 text-left font-semibold text-charcoal">
              REVIEWS
              <svg className={`w-5 h-5 transform transition-transform ${activeTab === 'reviews' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className={`lg:py-10 py-4 pb-10 ${activeTab === 'reviews' ? 'block' : 'hidden'}`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                <div className="lg:col-span-7">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-serif text-charcoal">Customer Reviews</h3>
                    {product.reviews?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-charcoal">{product.averageRating || "5.0"}</span>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < Math.round(Number(product.averageRating || 5)) ? 'fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {(!product.reviews || product.reviews.length === 0) ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                      <p className="text-gray-500 font-medium">No reviews yet. Be the first to review this product!</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {product.reviews.map((review: any) => (
                        <div key={review._id} className="group border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                              <span className="text-sm font-bold text-gray-600">{review.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1.5">
                                <div>
                                  <p className="font-bold text-[15px] text-charcoal">{review.name}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">{new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <div className="flex text-yellow-400 bg-yellow-50 px-2 py-1 rounded-full">
                                  {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-600 text-[14px] leading-relaxed mt-3">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="lg:col-span-5 bg-white border border-gray-100/60 p-7 md:p-9 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-28">
                  <h3 className="text-[22px] font-serif mb-7 text-charcoal">Write a Review</h3>
                  <form onSubmit={handleReviewSubmit} className="space-y-6 text-sm">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-2.5 uppercase tracking-widest">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            type="button" 
                            key={star} 
                            onClick={() => setReviewForm({...reviewForm, rating: star})}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <svg className={`w-[26px] h-[26px] ${star <= reviewForm.rating ? 'text-[#F5A623] fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-2.5 uppercase tracking-widest">Your Name</label>
                      <input 
                        type="text" 
                        required
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                        className="w-full h-12 px-4 bg-[#F9FAFB] border border-gray-200/80 rounded-xl focus:bg-white focus:ring-1 focus:ring-charcoal focus:border-charcoal outline-none transition-all text-[15px] text-gray-800 placeholder-gray-400"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-2.5 uppercase tracking-widest">Review</label>
                      <textarea 
                        required
                        rows={4}
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                        className="w-full p-4 bg-[#F9FAFB] border border-gray-200/80 rounded-xl focus:bg-white focus:ring-1 focus:ring-charcoal focus:border-charcoal outline-none transition-all resize-none text-[15px] text-gray-800 placeholder-gray-400"
                        placeholder="What do you think about this product?"
                      ></textarea>
                    </div>
                    <button 
                      type="submit"
                      disabled={isSubmittingReview}
                      className="w-full h-12 bg-charcoal text-white rounded-xl font-bold uppercase tracking-widest text-[13px] hover:bg-black hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                    >
                      {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
      </div></div>
      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-24 pt-16 border-t border-gray-100">
          <h2 className="text-2xl font-serif text-charcoal mb-10 text-center">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Size Chart Modal */}
      {isSizeChartOpen && product.size_chart_id && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">{product.size_chart_id.name} - Size Guide</h3>
              <button 
                onClick={() => setIsSizeChartOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Size</th>
                    {product.size_chart_id.columns.map((col: string, i: number) => (
                      <th key={i} className={`px-4 py-3 ${i === product.size_chart_id.columns.length - 1 ? 'rounded-tr-lg' : ''}`}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {product.size_chart_id.sizes.map((s: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900">{s.name}</td>
                      {product.size_chart_id.columns.map((col: string, j: number) => (
                        <td key={j} className="px-4 py-3 text-gray-600">{s.measurements[col] || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-6 text-[13px] text-gray-500 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                <p className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Measurements are provided as a guide. Please allow a 1-2 cm difference due to manual measurement.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>

  );
}
