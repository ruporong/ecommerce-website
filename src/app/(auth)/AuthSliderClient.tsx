'use client';
import { useState, useEffect } from 'react';

export default function AuthSliderClient({ banners }: { banners: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <div className="absolute inset-0 bg-gray-50 flex items-center justify-center p-10">
        <div className="w-full h-full max-w-lg mx-auto flex flex-col justify-between animate-pulse">
          <div className="flex justify-between w-full">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-4 w-12 bg-gray-200 rounded"></div>
          </div>
          <div className="w-full mt-auto mb-10">
            <div className="h-10 w-3/4 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 w-1/2 bg-gray-200 rounded"></div>
          </div>
          <div className="flex justify-between items-end w-full">
            <div className="h-4 w-12 bg-gray-200 rounded"></div>
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden text-white">
      {banners.map((banner, index) => (
        <div 
          key={banner._id} 
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out p-10 ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <img 
            src={banner.image} 
            alt="Auth Banner" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#8b2323]/50 to-[#5a1010]/80 mix-blend-multiply pointer-events-none"></div>
          
          <div className="relative h-full flex flex-col justify-between">
            <div className="flex justify-between text-sm tracking-wide opacity-80">
              <span>{banner.subtitle || 'Brand New'}</span>
              <span>0{(index % 4) + 1}-04</span>
            </div>

            <div className="max-w-md">
              <h1 className="text-4xl leading-tight font-serif mb-6">
                {banner.title || "We use contrast to bring your brand's truest"}
              </h1>
            </div>

            <div className="flex justify-between items-end">
              <span className="text-sm opacity-80">@2024</span>
              <p className="text-xs max-w-[200px] text-right opacity-90 leading-relaxed">
                {banner.link || "We use contrast to bring truest essence into the light."}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
