'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useQuickViewStore } from '@/store/useQuickViewStore';
import PlaceholderImage from '@/components/PlaceholderImage';
import toast from 'react-hot-toast';

export default function QuickViewModal() {
  const { isOpen, product, closeQuickView } = useQuickViewStore();
  const { addItem, openDrawer } = useCartStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset index when product changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product]);

  if (!isOpen || !product) return null;

  const images = product.images || [];
  if (product.mainImages && product.mainImages.length > 0) {
    images.unshift(...product.mainImages); // Ensure main images are first
  }
  // Remove duplicates and keep unique images
  const uniqueImages: string[] = Array.from(new Set(images));
  const displayImage = uniqueImages[currentImageIndex] || '';

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % uniqueImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + uniqueImages.length) % uniqueImages.length);

  const handleQuickAdd = () => {
    addItem({
      id: product._id || product.slug,
      name: product.name,
      price: product.price,
      image: displayImage,
      quantity: 1
    });
    closeQuickView();
    openDrawer();
  };

  const handleWishlist = () => {
    toast.success('Added to Wishlist');
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
          
          <div className="w-full md:w-1/2 p-8 overflow-y-auto">
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-serif text-3xl">{product.name}</h2>
              <button onClick={handleWishlist} className="text-gray-400 hover:text-dusty-rose transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              </button>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-charcoal">★★★★★</div>
              <span className="text-sm text-gray-500">4.9 (126 Reviews)</span>
            </div>
            <p className="text-xl font-medium mb-8">৳{product.price}</p>
            
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <span className="text-sm mb-3 block">Color</span>
                <div className="flex gap-2">
                  {product.colors.map((color: string, i: number) => (
                    <button key={i} className="w-6 h-6 rounded-full border border-gray-300" style={{ backgroundColor: color }} title={color}></button>
                  ))}
                </div>
              </div>
            )}
            
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm">Size</span>
                  <button className="text-[10px] tracking-widest uppercase border-b border-charcoal pb-0.5">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string, i: number) => (
                    <button key={i} className="py-2 px-4 text-sm border border-gray-200 rounded-md text-gray-500 hover:border-charcoal hover:text-charcoal transition-colors">
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <button 
              onClick={handleQuickAdd} 
              className="w-full py-4 bg-charcoal text-white text-[13px] tracking-widest uppercase font-medium rounded-2xl hover:bg-dusty-rose transition-colors"
            >
              Add to Bag
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
