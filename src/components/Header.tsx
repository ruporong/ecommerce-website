"use client";

import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import HeaderSearch from '@/components/HeaderSearch';
import FlashSaleBanner from '@/components/FlashSaleBanner';

export default function Header({ 
  menus = [], 
  categories = [], 
  logoUrl, 
  flashSale 
}: { 
  menus?: any[], 
  categories?: any[], 
  logoUrl?: string | null, 
  flashSale?: any 
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { data: session } = useSession();
  const accountLink = session?.user ? '/user/dashboard' : '/user/login';
  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((total, item) => total + Number(item.quantity), 0);
  const wishlistItems = useWishlistStore((state) => state.items);
  const totalWishlist = wishlistItems.length;

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

  // Dynamic Category Links from Database
  const categoryLinks = (categories || []).map((cat: any) => ({
    name: cat.name,
    link: `/category/${cat.slug}`,
  }));

  // Build Navigation Links: Dynamic Categories + Custom Menus
  let navLinks: { name: string; link: string }[] = [];

  if (categoryLinks.length > 0) {
    navLinks = [...categoryLinks];
    // If admin has configured custom header menus that aren't duplicate categories, merge them
    if (menus && menus.length > 0) {
      menus.forEach((m: any) => {
        if (!navLinks.some(nl => nl.link === m.link || nl.name.toLowerCase() === m.name.toLowerCase())) {
          navLinks.push({ name: m.name, link: m.link });
        }
      });
    }
  } else if (menus && menus.length > 0) {
    navLinks = [...menus];
  } else {
    navLinks = [
      { name: 'Shop', link: '/shop' }
    ];
  }

  // Ensure Contact link exists if not already present
  if (!navLinks.some(m => m.name.toLowerCase() === 'contact' || m.link === '/contact')) {
    navLinks.push({ name: 'Contact', link: '/contact' });
  }

  // Desktop Navigation: reduced by 3 items (top 3 categories + Contact)
  const contactLink = navLinks.find(m => m.name.toLowerCase() === 'contact' || m.link === '/contact') || { name: 'Contact', link: '/contact' };
  const nonContactLinks = navLinks.filter(m => m.name.toLowerCase() !== 'contact' && m.link !== '/contact');
  const desktopNavLinks = nonContactLinks.length > 3 
    ? [...nonContactLinks.slice(0, 3), contactLink]
    : navLinks;

  return (
    <header className="sticky top-0 w-full z-40 bg-white shadow-sm">
      {flashSale && <FlashSaleBanner data={flashSale} />}
      <div className="w-full bg-white border-b border-gray-200/80">
        <div className="max-w-[1920px] mx-auto px-3 sm:px-4 md:px-8 h-18 sm:h-20 md:h-24 flex items-center justify-between gap-3 sm:gap-6">
        
          {/* LEFT: Logo & Mobile Hamburger */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            <button 
              type="button"
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (mobileSearchOpen) setMobileSearchOpen(false);
              }}
              className="lg:hidden flex flex-col justify-center gap-1.5 w-8 h-8 z-50 focus:outline-none"
              aria-label="Toggle menu"
            >
              <span className={`w-6 h-0.5 bg-charcoal transition-transform duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`w-6 h-0.5 bg-charcoal transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`w-6 h-0.5 bg-charcoal transition-transform duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>

            <Link href="/" className="shrink-0 flex items-center py-2">
              {logoUrl ? (
                <img src={logoUrl} alt="Store Logo" className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto max-w-[160px] sm:max-w-[210px] md:max-w-[270px] lg:max-w-[300px] object-contain" />
              ) : (
                <div className="h-10 sm:h-12 w-32 sm:w-36 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500 font-sans tracking-normal">No Logo</div>
              )}
            </Link>
          </div>

          {/* CENTER: Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center justify-center gap-5 xl:gap-8 flex-1 py-1">
            {desktopNavLinks.map((menu, idx) => {
              const isActive = pathname === menu.link;
              return (
                <Link 
                  key={idx} 
                  href={menu.link} 
                  className={`text-xs xl:text-[13px] tracking-[0.18em] uppercase whitespace-nowrap transition-colors duration-200 ${
                    isActive 
                      ? 'text-black font-extrabold border-b-2 border-black pb-0.5' 
                      : 'text-black/85 font-bold hover:text-black hover:border-b-2 hover:border-black/50 pb-0.5'
                  } ${menu.name.toLowerCase() === 'sale' ? 'text-red-700 font-extrabold' : ''}`}
                >
                  {menu.name}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5 shrink-0 justify-end">
            
            {/* Desktop Search Bar (md and above) */}
            <div className="hidden md:flex items-center">
              <HeaderSearch className="w-36 md:w-44 lg:w-56 xl:w-64" />
            </div>

            {/* Account Icon (always visible on desktop, tablet, and mobile) */}
            <Link 
              href={accountLink} 
              aria-label="Account" 
              title={session?.user ? "Account" : "Login"}
              className="flex items-center text-charcoal hover:opacity-70 transition-opacity"
            >
              {session?.user ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              )}
            </Link>

            {/* Mobile Search Button Toggle (below md) */}
            <button 
              type="button"
              aria-label="Search" 
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
              className="md:hidden hover:opacity-70 transition-opacity text-charcoal"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>

            {/* Wishlist Icon */}
            <button 
              type="button"
              onClick={() => useWishlistStore.getState().openDrawer()} 
              aria-label="Wishlist" 
              title="Wishlist"
              className="relative hover:opacity-70 transition-opacity"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={mounted && totalWishlist > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
              {mounted && totalWishlist > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {totalWishlist}
                </span>
              )}
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

      {/* Expandable Search Bar (below md) */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 py-3 bg-white border-t border-gray-200">
          <HeaderSearch 
            placeholder="Search products..." 
            onSearchSubmit={() => setMobileSearchOpen(false)} 
          />
        </div>
      )}
      
      {/* Mobile/Tablet Drawer Dropdown */}
      <div className={`lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-[85vh] overflow-y-auto opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}>
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
             <button 
               type="button"
               onClick={() => { setMobileMenuOpen(false); useWishlistStore.getState().openDrawer(); }} 
               className="flex items-center gap-3 text-base tracking-[0.1em] uppercase text-gray-500 hover:text-charcoal transition-colors text-left"
             >
               <svg width="18" height="18" viewBox="0 0 24 24" fill={mounted && totalWishlist > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                 <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
               </svg>
               <span>Wishlist {mounted && totalWishlist > 0 ? `(${totalWishlist})` : ''}</span>
             </button>

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
