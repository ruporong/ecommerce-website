'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useQuickViewStore } from '@/store/useQuickViewStore';
import toast from 'react-hot-toast';
import PlaceholderImage from '@/components/PlaceholderImage';

export default function ProductCard({ product }: { product: any }) {
  const addItem = useCartStore((state) => state.addItem);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const openQuickView = useQuickViewStore((state) => state.openQuickView);

  // Determine images
  const mainImage = product.mainImages?.[0] || product.images?.[0] || '';
  const hoverImage = product.mainImages?.[1] || product.images?.[1] || mainImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Default to first size and color if available, otherwise empty
    const selectedSize = product.sizes?.[0] || '';
    const selectedColor = product.colors?.[0] || '';

    // Create a unique ID if size/color variations are meant to be separate, 
    // but the store currently uses just product.slug or id. 
    // For a simple add, we just pass the product ID.
    addItem({
      id: product._id || product.slug, // Prefer _id if available
      name: product.name,
      price: product.price,
      image: mainImage,
      quantity: 1
    });

    openDrawer();
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success('Added to Wishlist');
  };

  return (
    <div className="group block relative">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 rounded-elane mb-4">
          {mainImage ? (
            <img 
              src={mainImage} 
              alt={product.name} 
              className="w-full h-full object-cover object-top transition-opacity duration-700 ease-in-out opacity-100 group-hover:opacity-0"
            />
          ) : (
            <PlaceholderImage className="w-full h-full object-cover object-top transition-opacity duration-700 ease-in-out opacity-100 group-hover:opacity-0" />
          )}
          {hoverImage && hoverImage !== mainImage && (
            <img 
              src={hoverImage} 
              alt={`${product.name} - Alternate View`} 
              className="absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
            />
          )}
          {product.stock === 0 && (
            <div className="absolute top-4 left-4 bg-white/90 text-charcoal text-[10px] tracking-widest uppercase px-3 py-1 font-bold z-10">
              Sold Out
            </div>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute top-4 left-4 bg-red-50 text-red-600 text-[10px] tracking-widest uppercase px-3 py-1 font-bold z-10">
              Low Stock
            </div>
          )}
          
          {/* Hover Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-30">
            <button 
              type="button"
              className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200/90 shadow-md transition-all duration-200" 
              style={{ backgroundColor: '#ffffff', color: '#111111' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#000000'; e.currentTarget.style.color = '#ffffff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#111111'; }}
              title="Quick View" 
              onClick={handleQuickView}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button 
              type="button"
              className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200/90 shadow-md transition-all duration-200" 
              style={{ backgroundColor: '#ffffff', color: '#111111' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#000000'; e.currentTarget.style.color = '#ffffff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#111111'; }}
              title="Add to Wishlist" 
              onClick={handleWishlist}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            </button>
          </div>

          {/* Quick Add to Bag Button */}
          <div className="absolute bottom-0 left-0 right-0 p-3.5 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-30">
            <button 
              type="button"
              className="w-full py-3 px-4 text-xs tracking-widest uppercase font-bold border border-gray-300/80 shadow-xl rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#ffffff', color: '#111111' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#000000'; e.currentTarget.style.color = '#ffffff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#111111'; }}
              onClick={handleQuickAdd}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              <span>Add to Bag</span>
            </button>
          </div>
        </div>
      </Link>
      
      <div className="flex justify-between items-start px-1">
        <div>
          <h3 className="font-serif text-lg mb-1 group-hover:text-dusty-rose transition-colors">
            <Link href={`/product/${product.slug}`}>{product.name}</Link>
          </h3>
          <p className="text-xs text-gray-500 tracking-widest uppercase">{product.category}</p>
        </div>
        <span className="font-serif text-lg">৳{product.price}</span>
      </div>
    </div>
  );
}
