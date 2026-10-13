'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import PlaceholderImage from '@/components/PlaceholderImage';

export default function HomeClient({ banners, sections, categories = [], products }: { banners: any[], sections: any[], categories?: any[], products?: any[] }) {
  const [activeSlide, setActiveSlide] = useState(0);
  
  // Use dynamic banners or fallback to static if none
  const slides = banners && banners.length > 0 
    ? banners.map((b, i) => ({
        image: b.image,
        campaign: `Slide ${i+1}`,
        title: b.title || 'NEW COLLECTION',
        subtitle: b.subtitle || 'Discover the latest arrivals.',
        primaryBtn: b.button_text || 'Shop Now',
        link: b.link || '#'
      }))
    : [
        {
          image: '', isPlaceholder: true,
          campaign: 'Campaign 01',
          title: 'THE NEW\nSEASON.',
          subtitle: 'Modern silhouettes. Timeless confidence.',
          primaryBtn: 'Shop New Arrivals',
          link: '#'
        }
      ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <main>
      {/* Hero Slider */}
      <section className="relative w-full h-[85vh] min-h-[600px] bg-gray-100 overflow-hidden" id="hero-slider">
        {slides.map((slide: any, idx: number) => (
          <div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            {slide.isPlaceholder ? 
              <PlaceholderImage className="absolute inset-0 w-full h-full object-cover object-top md:object-center" /> : 
              <img src={slide.image} alt={slide.title} className="absolute inset-0 w-full h-full object-cover object-top md:object-center" />
            }
            <div className={`absolute inset-0 ${idx === 0 ? 'bg-gradient-to-r from-black/40 to-transparent' : 'bg-black/20'}`}></div>
            <div className={`absolute inset-0 flex items-center ${idx === 0 ? 'justify-start' : 'justify-end'} max-w-[1920px] mx-auto px-4 md:px-16`}>
              <div className={`text-warm-white ${idx === 0 ? 'max-w-xl animate-fade-in-up' : 'max-w-lg text-right'}`}>
                <span className="text-xs tracking-widest uppercase mb-4 block">{slide.campaign}</span>
                <h2 className="font-serif text-5xl md:text-[82px] leading-[0.9] mb-6 whitespace-pre-line">{slide.title}</h2>
                <p className="font-serif text-lg md:text-xl italic mb-10 text-warm-white/90">{slide.subtitle}</p>
                {slide.primaryBtn && (
                  <div className={`flex ${idx === 0 ? 'flex-col sm:flex-row gap-4' : 'justify-end'}`}>
                    <a href={slide.link || '#'} className={`px-8 py-4 bg-warm-white text-charcoal text-[13px] tracking-widest uppercase font-medium rounded-2xl ${idx === 0 ? 'hover:bg-dusty-rose' : 'hover:bg-deep-burgundy'} hover:text-white transition-colors text-center inline-block`}>
                      {slide.primaryBtn}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Slider Controls */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-between items-center max-w-[1920px] mx-auto px-4 md:px-16 z-20">
          <div className="flex items-center gap-4 text-warm-white font-medium text-sm">
            <button onClick={() => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)} className="w-10 h-10 rounded-full border border-warm-white/30 flex items-center justify-center hover:bg-warm-white hover:text-charcoal transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span>0{activeSlide + 1}</span>
            <div className="w-24 md:w-48 h-px bg-warm-white/30 relative">
              <div className="absolute left-0 top-0 bottom-0 bg-warm-white transition-all duration-300" style={{ width: `${((activeSlide + 1) / slides.length) * 100}%` }}></div>
            </div>
            <span>0{slides.length}</span>
            <button onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)} className="w-10 h-10 rounded-full border border-warm-white/30 flex items-center justify-center hover:bg-warm-white hover:text-charcoal transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories && categories.length > 0 && (
        <section className="py-8 md:py-16 px-4 md:px-8 max-w-[1920px] mx-auto border-b border-gray-100">
          <div className="flex items-end justify-between mb-5 md:mb-8">
            <div>
              <span className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium block mb-1">Collections</span>
              <h2 className="font-serif text-xl sm:text-2xl md:text-4xl text-charcoal">Shop by Category</h2>
            </div>
            {categories.length > 4 && (
              <span className="text-xs text-gray-400 uppercase tracking-widest hidden sm:inline-block">
                {categories.length} Categories
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-4 pt-1 scrollbar-none justify-start">
            {categories.map((cat: any) => (
              <Link 
                key={cat._id} 
                href={`/category/${cat.slug}`} 
                className="group relative block w-36 sm:w-44 md:w-60 lg:w-72 flex-shrink-0 rounded-2xl md:rounded-[20px] overflow-hidden bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl md:rounded-[20px]">
                  {cat.image ? (
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out rounded-2xl md:rounded-[20px]" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-serif text-base md:text-2xl rounded-2xl md:rounded-[20px]">
                      {cat.name}
                    </div>
                  )}
                  
                  {/* Gradient Overlay for luxury feel and readable text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent transition-opacity group-hover:from-black/90 rounded-2xl md:rounded-[20px]"></div>
                  
                  {/* Category Details at bottom */}
                  <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 md:p-6 text-white flex flex-col justify-end">
                    <span className="text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-white/80 font-medium mb-0.5 md:mb-1">
                      Collection
                    </span>
                    <h3 className="font-serif text-sm sm:text-lg md:text-2xl font-normal tracking-wide text-white group-hover:translate-x-1 transition-transform duration-300 truncate">
                      {cat.name}
                    </h3>
                    <div className="mt-1.5 md:mt-3 flex items-center gap-1.5 md:gap-2 text-[10px] sm:text-xs uppercase tracking-widest text-white/90 font-medium group-hover:text-warm-white transition-colors">
                      <span>Explore</span>
                      <svg className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Sections */}
      {sections && sections.map((section, idx) => (
        <section key={section._id || idx} className={`py-20 md:py-24 px-4 md:px-8 max-w-[1920px] mx-auto ${idx % 2 === 1 ? 'bg-gray-50' : ''}`}>
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-3xl md:text-5xl mb-2">{section.title}</h2>
              <p className="text-gray-500 font-serif italic capitalize">{section.type.replace('_', ' ')} Collection.</p>
            </div>
            <a href="#" className="text-xs tracking-widest uppercase border-b border-charcoal pb-1 hover:text-dusty-rose hover:border-dusty-rose transition-colors">View All</a>
          </div>
          
          {section.resolvedProducts && section.resolvedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {section.resolvedProducts.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-500">No products found for this section.</p>
            </div>
          )}
        </section>
      ))}
    </main>
  );
}
