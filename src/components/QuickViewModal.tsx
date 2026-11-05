'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useQuickViewStore } from '@/store/useQuickViewStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import PlaceholderImage from '@/components/PlaceholderImage';

export default function QuickViewModal() {
  const { isOpen, product, closeQuickView } = useQuickViewStore();
  const { addItem, openDrawer } = useCartStore();
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product?._id || product?.slug));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset index when product changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product]);

  if (!isOpen || !product) return null;

  const images = product.images ? [...product.images] : [];
  if (product.mainImages && product.mainImages.length > 0) {
    images.unshift(...product.mainImages); // Ensure main images are first
  }
  // Remove duplicates and keep unique images
  const uniqueImages: string[] = Array.from(new Set(images));
  const displayImage = uniqueImages[currentImageIndex] || '';

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % uniqueImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + uniqueImages.length) % uniqueImages.length);

  const hasDiscount = Boolean(product.discount_price && Number(product.discount_price) > 0 && Number(product.discount_price) < Number(product.price));
  const effectivePrice = hasDiscount ? Number(product.discount_price) : Number(product.price);

  const handleQuickAdd = () => {
    addItem({
      id: product._id || product.slug,
      name: product.name,
      price: effectivePrice,
      image: displayImage,
      quantity: 1
    });
    closeQuickView();
    openDrawer();
  };

  const handleWishlist = () => {
    if (!product) return;
    toggleWishlist({
      id: product._id || product.slug,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      discount_price: product.discount_price ? Number(product.discount_price) : undefined,
      image: displayImage,
      category: product.category,
      stock: product.stock,
    });
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-[90] transition-opacity duration-300" 
        onClick={closeQuickView}
      ></div>
      
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
          <button 
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors"
            onClick={closeQuickView}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          
          <div className="w-full md:w-1/2 h-[40vh] md:h-auto bg-gray-100 relative group/qv">
            {displayImage ? (
              <img src={displayImage} className="w-full h-full object-cover" alt={product.name} />
            ) : (
              <PlaceholderImage className="w-full h-full object-cover" />
            )}
            {uniqueImages.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover/qv:opacity-100 transition-opacity hover:bg-white z-10 text-charcoal">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover/qv:opacity-100 transition-opacity hover:bg-white z-10 text-charcoal">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </>
            )}
          </div>
          
          <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto">
            <div className="flex justify-between items-start mb-3">
              <h2 className="font-serif text-2xl md:text-3xl text-charcoal">{product.name}</h2>
              <button 
                onClick={handleWishlist} 
                className={`p-1.5 rounded-full transition-colors ${
                  isInWishlist ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-black hover:bg-gray-100'
                }`}
                title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
              </button>
            </div>

            {/* Price on one line */}
            {hasDiscount ? (
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-2xl font-bold text-charcoal">৳{effectivePrice}</span>
                <span className="text-base text-gray-400 line-through">৳{product.price}</span>
              </div>
            ) : (
              <p className="text-xl font-semibold text-charcoal mb-6">৳{product.price}</p>
            )}

            {/* Product Description */}
            {product.description && (
              <div className="mb-6">
                <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block mb-2">Description</span>
                <div 
                  className="text-sm text-gray-600 leading-relaxed max-h-36 overflow-y-auto pr-2 space-y-2 [&>p]:mb-1 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-2" 
                  dangerouslySetInnerHTML={{ __html: product.description }} 
                />
              </div>
            )}
            
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3 block">Color</span>
                <div className="flex gap-2">
                  {product.colors.map((color: string, i: number) => (
                    <button key={i} className="w-6 h-6 rounded-full border border-gray-300" style={{ backgroundColor: color }} title={color}></button>
                  ))}
                </div>
              </div>
            )}
            
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Size</span>
                  <button className="text-[10px] tracking-widest uppercase border-b border-charcoal pb-0.5">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string, i: number) => (
                    <button key={i} className="py-1.5 px-3.5 text-xs border border-gray-200 rounded-md text-charcoal hover:border-black transition-colors font-medium">
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <Link 
                href={`/product/${product.slug}`} 
                onClick={closeQuickView}
                className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase font-semibold text-charcoal hover:underline"
              >
                <span>View Full Details</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>
            </div>
            
            <button 
              onClick={handleQuickAdd} 
              className="w-full py-3.5 bg-charcoal text-white text-xs tracking-widest uppercase font-bold rounded-xl hover:bg-black transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              <span>Add to Bag</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
