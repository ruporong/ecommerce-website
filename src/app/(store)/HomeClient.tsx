'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import PlaceholderImage from '@/components/PlaceholderImage';

export default function HomeClient({ banners, sections, categories = [], products }: { banners: any[], sections: any[], categories?: any[], products?: any[] }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const categorySliderRef = useRef<HTMLDivElement>(null);

  const scrollCategory = (direction: 'left' | 'right') => {
    if (categorySliderRef.current) {
      const scrollAmount = categorySliderRef.current.clientWidth * 0.75;
      categorySliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
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
            <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 flex items-center justify-start max-w-[1920px] mx-auto px-6 md:px-20">
              <div className="max-w-xl text-left animate-fade-in-up">
                <span className="text-xs tracking-widest uppercase mb-4 block text-black/75 font-semibold">{slide.campaign}</span>
                <h2 className="font-serif text-5xl md:text-[82px] leading-[0.9] mb-6 whitespace-pre-line text-black font-normal">{slide.title}</h2>
                <p className="font-serif text-lg md:text-xl italic mb-10 text-black/85">{slide.subtitle}</p>
                {slide.primaryBtn && (
                  <div className="flex justify-start">
                    <a 
                      href={slide.link || '#'} 
                      className="px-8 py-4 bg-white text-black border border-black/15 shadow-sm hover:bg-black hover:text-white transition-all text-center inline-block text-[13px] tracking-widest uppercase font-medium rounded-2xl"
                    >
                      {slide.primaryBtn}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Slider Controls */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-between items-center max-w-[1920px] mx-auto px-6 md:px-20 z-20">
          <div className="flex items-center gap-4 text-black font-medium text-sm">
            <button onClick={() => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)} className="w-10 h-10 rounded-full border border-black/30 bg-white/40 backdrop-blur-sm flex items-center justify-center hover:bg-black hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span>0{activeSlide + 1}</span>
            <div className="w-24 md:w-48 h-px bg-black/30 relative">
              <div className="absolute left-0 top-0 bottom-0 bg-black transition-all duration-300" style={{ width: `${((activeSlide + 1) / slides.length) * 100}%` }}></div>
            </div>
            <span>0{slides.length}</span>
            <button onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)} className="w-10 h-10 rounded-full border border-black/30 bg-white/40 backdrop-blur-sm flex items-center justify-center hover:bg-black hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section with Slider & Dark Opacity Text Card */}
      {categories && categories.length > 0 && (
        <section className="py-8 md:py-16 px-4 md:px-8 max-w-[1920px] mx-auto border-b border-gray-100">
          <div className="flex items-end justify-between mb-5 md:mb-8">
            <div>
              <span className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium block mb-1">Collections</span>
              <h2 className="font-serif text-xl sm:text-2xl md:text-4xl text-charcoal">Shop by Category</h2>
            </div>
            
            {/* Category Slider Controls */}
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => scrollCategory('left')}
                aria-label="Previous category"
                className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-gray-300 bg-white shadow-sm flex items-center justify-center hover:bg-black hover:text-white transition-all text-charcoal"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button 
                type="button"
                onClick={() => scrollCategory('right')}
                aria-label="Next category"
                className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-gray-300 bg-white shadow-sm flex items-center justify-center hover:bg-black hover:text-white transition-all text-charcoal"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </div>
          
          <div 
            ref={categorySliderRef}
            className="flex items-center gap-4 sm:gap-5 md:gap-6 overflow-x-auto pb-4 pt-1 scrollbar-none justify-start scroll-smooth snap-x snap-mandatory"
          >
            {categories.map((cat: any) => (
              <Link 
                key={cat._id} 
                href={`/category/${cat.slug}`} 
                className="group relative block w-64 sm:w-72 md:w-80 lg:w-[350px] flex-shrink-0 snap-start rounded-xl md:rounded-2xl overflow-hidden bg-white border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-500 cursor-pointer"
              >
                <div className="relative aspect-[3/2] w-full overflow-hidden bg-gray-50">
                  {cat.image ? (
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-serif text-base md:text-xl">
                      {cat.name}
                    </div>
                  )}
                  
                  {/* Modern Floating Luxury Capsule */}
                  <div className="absolute bottom-3 inset-x-3 sm:bottom-3.5 sm:inset-x-3.5 z-10">
                    <div className="bg-white/95 backdrop-blur-md px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.08)] group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.16)] flex items-center justify-between gap-3 transition-all duration-300">
                      <div className="min-w-0 flex-1">
                        <span className="block text-[10px] tracking-[0.2em] uppercase font-bold text-gray-400 group-hover:text-charcoal transition-colors">
                          Collection
                        </span>
                        <h3 className="font-serif text-sm sm:text-base font-bold text-gray-900 tracking-wide truncate">
                          {cat.name}
                        </h3>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:bg-black group-hover:scale-105 transition-all">
                        <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                        </svg>
                      </div>
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
        <section key={section._id || idx} className={`py-16 md:py-24 px-4 md:px-8 max-w-[1920px] mx-auto ${idx % 2 === 1 ? 'bg-gray-50/70' : ''}`}>
          <div className="mb-8 md:mb-12">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-2 text-charcoal">{section.title}</h2>
            <p className="text-gray-500 font-serif italic capitalize text-sm md:text-base">{section.type.replace('_', ' ')} Collection.</p>
          </div>
          
          {section.resolvedProducts && section.resolvedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-6 landing-product-grid gap-3 sm:gap-4 md:gap-5 lg:gap-5">
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
