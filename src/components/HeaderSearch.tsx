"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HeaderSearch({ 
  className = "",
  placeholder = "Search products...",
  onSearchSubmit
}: { 
  className?: string;
  placeholder?: string;
  onSearchSubmit?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced live search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setTotal(0);
      setLoading(false);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=6`);
        const data = await res.json();
        if (data.success) {
          setResults(data.products || []);
          setTotal(data.total || 0);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Failed to fetch search results:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsOpen(false);
    if (inputRef.current) inputRef.current.blur();
    if (onSearchSubmit) onSearchSubmit();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setTotal(0);
    setIsOpen(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleItemClick = () => {
    setIsOpen(false);
    if (onSearchSubmit) onSearchSubmit();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Bulletproof Flex Search Bar (Zero overlap guarantee) */}
      <form 
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '40px',
          backgroundColor: '#ffffff',
          border: isFocused ? '1px solid #1c1c1c' : '1px solid #e5e7eb',
          borderRadius: '9999px',
          padding: '0 12px 0 14px',
          boxShadow: isFocused ? '0 2px 8px rgba(0,0,0,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        {/* Search Icon / Button */}
        <button 
          type="submit" 
          aria-label="Submit Search"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            padding: 0,
            margin: 0,
            cursor: 'pointer',
            color: isFocused ? '#1c1c1c' : '#9ca3af',
            flexShrink: 0,
            transition: 'color 0.2s ease',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'block' }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (query.trim().length > 0) setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsOpen(false);
          }}
          placeholder={placeholder}
          style={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            padding: '0 8px 0 10px',
            margin: 0,
            fontSize: '13px',
            color: '#1c1c1c',
            fontFamily: 'inherit',
            lineHeight: '40px',
            boxSizing: 'border-box',
          }}
          className="placeholder:text-gray-400 placeholder:text-xs md:placeholder:text-[13px]"
        />

        {/* Loading Spinner or Clear Button */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {loading ? (
            <svg 
              className="animate-spin text-gray-400" 
              style={{ width: '16px', height: '16px', display: 'block' }} 
              viewBox="0 0 24 24" 
              fill="none"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                cursor: 'pointer',
                padding: 0,
                margin: 0,
                transition: 'background-color 0.15s ease',
              }}
              title="Clear search"
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e5e7eb'; e.currentTarget.style.color = '#111827'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: 'block' }}>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          ) : null}
        </div>
      </form>

      {/* Dynamic Results Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div 
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: '380px',
            maxWidth: '92vw',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #f3f4f6',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Products {total > 0 ? `(${total})` : ''}</span>
            {loading && <span className="text-[11px] text-gray-400">Searching...</span>}
          </div>

          {/* Results List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
            {results.length > 0 ? (
              results.map((product) => (
                <Link
                  key={product._id}
                  href={`/product/${product.slug}`}
                  onClick={handleItemClick}
                  className="flex items-center gap-3.5 p-3 hover:bg-gray-50/80 transition-colors group cursor-pointer"
                >
                  {/* Thumbnail (4:5 Aspect Ratio) */}
                  <div 
                    style={{
                      width: '48px',
                      height: '60px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #f3f4f6',
                      position: 'relative',
                    }}
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                        No Img
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium block truncate">
                      {product.category}
                    </span>
                    <h4 className="text-xs sm:text-sm font-medium text-charcoal group-hover:text-dusty-rose transition-colors truncate">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-charcoal">
                        ৳{product.price}
                      </span>
                      {product.stock === 0 && (
                        <span className="text-[10px] text-red-500 font-medium">
                          Sold Out
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : !loading ? (
              <div className="py-8 px-4 text-center">
                <p className="text-xs sm:text-sm text-gray-500 font-serif">
                  No products found for "{query}"
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Try checking spelling or use general keywords
                </p>
              </div>
            ) : null}
          </div>

          {/* Footer View All Button */}
          {results.length > 0 && (
            <Link
              href={`/search?q=${encodeURIComponent(query.trim())}`}
              onClick={handleItemClick}
              className="block w-full py-2.5 px-4 text-center text-xs font-bold uppercase tracking-widest text-charcoal bg-gray-50 hover:bg-charcoal hover:text-white border-t border-gray-100 transition-colors"
            >
              View all results ({total}) →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
