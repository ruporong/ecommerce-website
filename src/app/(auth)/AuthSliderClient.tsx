'use client';

import { useState, useEffect } from 'react';

interface BannerItem {
  _id?: string;
  image: string;
  title?: string | null;
  subtitle?: string | null;
  link?: string | null;
  button_text?: string;
  tagline?: string;
}

const DEFAULT_SLIDES: BannerItem[] = [
  {
    _id: 'default-1',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    title: 'Exquisite Handcrafted Traditional Wear',
    subtitle: 'FESTIVE COLLECTION',
    tagline: 'Timeless three-piece and saree collections crafted with royal elegance and unmatched comfort.'
  },
  {
    _id: 'default-2',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80',
    title: 'Signature Heritage Jewelry & Ornaments',
    subtitle: 'LUXURY ORNAMENTS',
    tagline: 'Intricate bridal jewelry, churis and necklaces that make every special moment unforgettable.'
  },
  {
    _id: 'default-3',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80',
    title: 'Premium Quality & Authentic Bangladeshi Fashion',
    subtitle: 'RUPORONG EXCLUSIVE',
    tagline: 'Nationwide cash on delivery, hassle-free returns and dedicated support on every order.'
  }
];

export default function AuthSliderClient({ 
  banners,
  storeName = 'Ruporong' 
}: { 
  banners?: BannerItem[];
  storeName?: string;
}) {
  const activeSlides = (banners && banners.length > 0) ? banners : DEFAULT_SLIDES;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [activeSlides.length]);

  const currentYear = new Date().getFullYear();

  return (
    <div className="absolute inset-0 overflow-hidden bg-gray-950 select-none">
      {activeSlides.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div 
            key={slide._id || index} 
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image with smooth scale transition */}
            <img 
              src={slide.image} 
              alt={slide.title || 'Auth Banner'} 
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-7000 ease-out ${
                isActive ? 'scale-105' : 'scale-100'
              }`}
            />

            {/* Gradient Overlay for luxury feel and clear contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/35 pointer-events-none" />

            {/* Slide Content */}
            <div className="relative h-full flex flex-col justify-between p-8 xl:p-14 text-white z-20">
              {/* Top Header info */}
              <div className="flex items-center justify-between text-xs font-semibold tracking-wider">
                <span className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25 uppercase text-[11px] text-white">
                  {slide.subtitle || `${storeName} Collection`}
                </span>
                <span className="text-white/80 font-mono tracking-widest text-sm">
                  0{index + 1} / 0{activeSlides.length}
                </span>
              </div>

              {/* Center / Lower Main Typography */}
              <div className="max-w-xl mb-6">
                <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-serif leading-[1.2] text-white mb-4 drop-shadow-md">
                  {slide.title || 'Elevate Your Everyday Style With Elegance'}
                </h1>
                <p className="text-sm xl:text-base text-white/85 leading-relaxed font-light drop-shadow">
                  {slide.tagline || slide.link || 'Discover premium handcrafted traditional wear and ornaments designed for comfort and celebration.'}
                </p>
              </div>

              {/* Bottom Footer Info & Navigation Dots */}
              <div className="flex items-center justify-between pt-4 border-t border-white/20">
                <div className="flex items-center gap-2">
                  {activeSlides.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setCurrentIndex(dotIdx)}
                      aria-label={`Go to slide ${dotIdx + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        dotIdx === currentIndex 
                          ? 'w-8 bg-white' 
                          : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>

                <div className="text-right text-[11px] text-white/70 tracking-wider">
                  © {currentYear} {storeName}. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
