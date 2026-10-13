"use client";

import { useCartStore } from "@/store/useCartStore";

export default function ProductActions({ product }: { product: any }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
    });
    // Trigger a small toast or just let the badge update
  };

  return (
    <div className="flex flex-col gap-3 mb-4">
      <button 
        onClick={handleAddToCart}
        className="w-full bg-white text-charcoal border border-charcoal py-4 px-6 text-sm tracking-widest uppercase hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center gap-2 group"
      >
        ADD TO CART
      </button>
      <button 
        className="w-full bg-charcoal text-white py-4 px-6 text-sm tracking-widest uppercase hover:bg-black transition-colors duration-300 flex items-center justify-center gap-2 group"
      >
        ORDER VIA CHAT
      </button>
    </div>
  );
}
