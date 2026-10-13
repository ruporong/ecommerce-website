'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface CategoryFilterProps {
  categorySlug: string;
  subCategories?: Array<{ _id: string; name: string; slug: string }>;
  defaultMinPrice?: number;
  defaultMaxPrice?: number;
  totalProducts: number;
}

export default function CategoryFilter({
  categorySlug,
  subCategories = [],
  defaultMinPrice = 0,
  defaultMaxPrice = 10000,
  totalProducts
}: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Mobile drawer open state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Filter states from URL
  const currentSub = searchParams.get('sub') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentAvailability = searchParams.get('availability') || 'all';
  const currentMinPrice = searchParams.get('min_price') || '';
  const currentMaxPrice = searchParams.get('max_price') || '';

  // Local state for price inputs
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);

  useEffect(() => {
    setMinPrice(currentMinPrice);
    setMaxPrice(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) {
      params.set('min_price', minPrice);
    } else {
      params.delete('min_price');
    }
    if (maxPrice) {
      params.set('max_price', maxPrice);
    } else {
      params.delete('max_price');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePricePreset = (min: number | null, max: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (min !== null) {
      params.set('min_price', min.toString());
      setMinPrice(min.toString());
    } else {
      params.delete('min_price');
      setMinPrice('');
    }
    if (max !== null) {
      params.set('max_price', max.toString());
      setMaxPrice(max.toString());
    } else {
      params.delete('max_price');
      setMaxPrice('');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    router.push(pathname, { scroll: false });
  };

  const hasActiveFilters = Boolean(
    currentSub || currentMinPrice || currentMaxPrice || (currentAvailability && currentAvailability !== 'all') || (currentSort && currentSort !== 'newest')
  );

  const filterCards = (
    <div className="space-y-4">
      {/* Group Card 0: Header & Reset */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h3 className="font-serif text-base text-charcoal font-semibold">Filter</h3>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-[11px] uppercase tracking-wider text-dusty-rose hover:underline font-semibold"
          >
            Reset
          </button>
        )}
      </div>

      {/* Group Card 1: Availability */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 block">
          Availability
        </span>
        <div className="space-y-2.5">
          {[
            { label: 'All Items', value: 'all' },
            { label: 'In Stock', value: 'in_stock' },
            { label: 'Out of Stock', value: 'out_of_stock' }
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-700 hover:text-black transition-colors group">
              <input
                type="radio"
                name="availability"
                checked={currentAvailability === opt.value}
                onChange={() => updateParam('availability', opt.value)}
                className="w-3.5 h-3.5 accent-charcoal cursor-pointer"
              />
              <span className={currentAvailability === opt.value ? 'font-semibold text-charcoal' : 'text-gray-600 group-hover:text-charcoal'}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Group Card 2: Price Range */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500">
            Price Range
          </span>
          {(currentMinPrice || currentMaxPrice) && (
            <button
              type="button"
              onClick={() => handlePricePreset(null, null)}
              className="text-[10px] text-gray-400 hover:text-charcoal"
            >
              Clear
            </button>
          )}
        </div>

        {/* Min / Max Inputs */}
        <div className="grid grid-cols-2 gap-2">
          {/* Min Input */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:bg-white focus-within:border-charcoal focus-within:ring-1 focus-within:ring-charcoal transition-all">
            <span className="text-xs text-gray-500 font-medium mr-1.5 select-none shrink-0">৳</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-transparent text-xs text-charcoal outline-none placeholder:text-gray-400 font-normal min-w-0"
            />
          </div>

          {/* Max Input */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:bg-white focus-within:border-charcoal focus-within:ring-1 focus-within:ring-charcoal transition-all">
            <span className="text-xs text-gray-500 font-medium mr-1.5 select-none shrink-0">৳</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-transparent text-xs text-charcoal outline-none placeholder:text-gray-400 font-normal min-w-0"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={applyPriceFilter}
          className="w-full py-2.5 bg-charcoal text-white text-xs uppercase tracking-widest font-semibold rounded-xl hover:bg-black transition-colors shadow-sm"
        >
          Apply Price
        </button>

        {/* Quick price presets */}
        <div className="pt-2 border-t border-gray-100">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-2 font-medium">Quick Select</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Under ৳1k', min: 0, max: 1000 },
              { label: '৳1k - ৳3k', min: 1000, max: 3000 },
              { label: '৳3k - ৳5k', min: 3000, max: 5000 },
              { label: 'Above ৳5k', min: 5000, max: null }
            ].map((preset, idx) => {
              const isSelected = currentMinPrice === preset.min.toString() &&
                (preset.max === null ? !currentMaxPrice : currentMaxPrice === preset.max.toString());
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePricePreset(preset.min, preset.max)}
                  className={`py-2 px-2 text-center text-xs rounded-xl border transition-all font-medium ${
                    isSelected
                      ? 'bg-charcoal text-white border-charcoal shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Group Card 3: Subcategories (if any) */}
      {subCategories.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 block">
            Subcategory
          </span>
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-700 hover:text-black transition-colors group">
              <input
                type="radio"
                name="subcategory"
                checked={!currentSub}
                onChange={() => updateParam('sub', null)}
                className="w-3.5 h-3.5 accent-charcoal cursor-pointer"
              />
              <span className={!currentSub ? 'font-semibold text-charcoal' : 'text-gray-600 group-hover:text-charcoal'}>
                All Subcategories
              </span>
            </label>
            {subCategories.map((sub) => (
              <label key={sub._id} className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-700 hover:text-black transition-colors group">
                <input
                  type="radio"
                  name="subcategory"
                  checked={currentSub === sub.slug}
                  onChange={() => updateParam('sub', sub.slug)}
                  className="w-3.5 h-3.5 accent-charcoal cursor-pointer"
                />
                <span className={currentSub === sub.slug ? 'font-semibold text-charcoal' : 'text-gray-600 group-hover:text-charcoal'}>
                  {sub.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Group Card 4: Sort By */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 block">
          Sort By
        </span>
        <select
          value={currentSort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="w-full py-2 px-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:border-charcoal focus:bg-white transition-all cursor-pointer"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Filter Sidebar - Separate individual cards */}
      <aside className="hidden md:block w-64 lg:w-72 shrink-0 sticky top-24">
        {filterCards}
      </aside>

      {/* Mobile Filter Button Bar - ONLY visible on mobile */}
      <div className="md:hidden w-full flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-medium shadow-sm hover:bg-black transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filters {hasActiveFilters && '•'}
        </button>

        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          {totalProducts} {totalProducts === 1 ? 'Product' : 'Products'}
        </span>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-gray-50 h-full shadow-2xl p-5 overflow-y-auto flex flex-col z-10">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4 bg-white -m-5 p-5 shadow-sm">
              <span className="font-serif text-lg font-medium text-charcoal">Filters</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
              >
                ✕
              </button>
            </div>
            {filterCards}
            <div className="mt-6 pt-4 border-t border-gray-200 sticky bottom-0 bg-gray-50 pb-2">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="w-full py-3 bg-charcoal text-white rounded-xl text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors shadow-md"
              >
                Apply & View ({totalProducts})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
