"use client";

import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import HeaderSearch from '@/components/HeaderSearch';
import FlashSaleBanner from '@/components/FlashSaleBanner';

export default function Header({ menus = [], logoUrl, flashSale }: { menus?: any[], logoUrl?: string | null, flashSale?: any }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { data: session } = useSession();
  const accountLink = session?.user ? '/user/dashboard' : '/user/login';
  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((total, item) => total + Number(item.quantity), 0);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  // Fallback static menu if empty
  const navLinks = menus.length > 0 ? [...menus] : [
    { name: 'New In', link: '/shop' },
    { name: 'Dresses', link: '/category/dresses' },
    { name: 'Sale', link: '/category/sale' }
  ];
  if (!navLinks.find(m => m.name.toLowerCase() === 'contact')) {
    navLinks.push({ name: 'Contact', link: '/contact' });
  }

  return (
    <header className="sticky top-0 w-full z-40">
      {flashSale && <FlashSaleBanner data={flashSale} />}
      <div className="w-full bg-warm-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between relative">
        
        {/* Mobile Menu */}
        <button 
          onClick={() => {
            setMobileMenuOpen(!mobileMenuOpen);
            if (mobileSearchOpen) setMobileSearchOpen(false);
          }}
          className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8 z-50 focus:outline-none"
        >
          <span className={`w-6 h-0.5 bg-charcoal transition-transform duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`w-6 h-0.5 bg-charcoal transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
          <span className={`w-6 h-0.5 bg-charcoal transition-transform duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>

        {/* Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 z-50">
          {logoUrl ? (
            <img src={logoUrl} alt="Store Logo" className="h-8 md:h-10 object-contain" />
          ) : (
            <div className="h-10 w-32 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500 font-sans tracking-normal">No Logo</div>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 lg:gap-10">
          {navLinks.map((menu, idx) => (
            <Link key={idx} href={menu.link} className={`text-sm tracking-[0.2em] uppercase hover:text-gray-500 transition-colors ${menu.name.toLowerCase() === 'sale' ? 'text-red-800' : ''}`}>
              {menu.name}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4 md:gap-5 z-50">
          
          {/* Desktop Search Bar */}
          <div className="hidden md:flex items-center">
            <HeaderSearch className="w-52 lg:w-72" />
          </div>

          {/* Account Icon */}
          <Link href={accountLink} aria-label="Account" className="hover:opacity-70 transition-opacity">
            {session?.user ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            )}
          </Link>

          {/* Mobile Search Button Toggle */}
          <button 
            type="button"
            aria-label="Search" 
            onClick={() => {
              setMobileSearchOpen(!mobileSearchOpen);
              if (mobileMenuOpen) setMobileMenuOpen(false);
            }}
            className="md:hidden hover:opacity-70 transition-opacity"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
          
          {/* Cart Icon */}
          <button onClick={() => useCartStore.getState().openDrawer()} className="relative hover:opacity-70 transition-opacity group">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {mounted && totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-charcoal text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
      </div>

      {/* Mobile Expandable Search Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 py-3 bg-warm-white border-t border-gray-200">
          <HeaderSearch 
            placeholder="Search products..." 
            onSearchSubmit={() => setMobileSearchOpen(false)} 
          />
        </div>
      )}
      
      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-warm-white border-b border-gray-200 shadow-xl transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-[85vh] overflow-y-auto opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}>
         <nav className="flex flex-col px-6 py-4 space-y-5">
           {/* Mobile Search inside drawer */}
           <div className="pb-3 border-b border-gray-200/80">
             <HeaderSearch 
               placeholder="Search products..." 
               onSearchSubmit={() => setMobileMenuOpen(false)} 
             />
           </div>

           {navLinks.map((menu, idx) => (
             <Link key={idx} href={menu.link} onClick={() => setMobileMenuOpen(false)} className={`text-base tracking-[0.2em] uppercase transition-colors ${menu.name.toLowerCase() === 'sale' ? 'text-red-800' : 'text-charcoal hover:text-gray-500'}`}>
               {menu.name}
             </Link>
           ))}
           
           <div className="pt-4 border-t border-gray-200 flex flex-col gap-4">
             <Link href={accountLink} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-base tracking-[0.1em] uppercase text-gray-500 hover:text-charcoal transition-colors">
               {session?.user ? (
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                   <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                 </svg>
               ) : (
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
               )}
               {session?.user ? 'Dashboard' : 'Account'}
             </Link>
           </div>
         </nav>
      </div>
    </header>
  );
}
