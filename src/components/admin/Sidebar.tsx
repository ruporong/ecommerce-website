
"use client";

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SidebarProps {
  onClose: () => void;
  logoUrl?: string | null;
}

const MenuSection = ({ title }: { title: string }) => (
  <div className="px-3 pb-1 pt-6 text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.15em]">
    {title}
  </div>
);

export default function Sidebar({ onClose, logoUrl }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const statusParam = searchParams?.get('status') || 'all';

  const [isOrdersOpen, setIsOrdersOpen] = useState(pathname.startsWith('/admin/orders'));
  const [isProductsOpen, setIsProductsOpen] = useState(
    pathname.startsWith('/admin/products') || 
    pathname.startsWith('/admin/categories') ||
    pathname.startsWith('/admin/subcategories') ||
    pathname.startsWith('/admin/brands') ||
    pathname.startsWith('/admin/sizes') ||
    pathname.startsWith('/admin/colors') ||
    pathname.startsWith('/admin/tags')
  );
  
  const [isCustomersOpen, setIsCustomersOpen] = useState(pathname.startsWith('/admin/customers'));
  const [isInventoryOpen, setIsInventoryOpen] = useState(pathname.startsWith('/admin/inventory'));
  const [isExpensesOpen, setIsExpensesOpen] = useState(pathname.startsWith('/admin/expenses'));
  const [isCouponsOpen, setIsCouponsOpen] = useState(pathname.startsWith('/admin/coupons'));
  const [isWebsiteOpen, setIsWebsiteOpen] = useState(pathname.startsWith('/admin/website'));
  const [isMarketingOpen, setIsMarketingOpen] = useState(pathname.startsWith('/admin/marketing'));
  const [isReportsOpen, setIsReportsOpen] = useState(pathname.startsWith('/admin/reports'));
  
  const isWebApiPage = pathname === '/admin/settings/courier' || pathname === '/admin/settings/bkash' || pathname === '/admin/settings/eps' || pathname === '/admin/settings/nagad' || pathname === '/admin/settings/sslcommerz';
  const [isSettingsOpen, setIsSettingsOpen] = useState(pathname.startsWith('/admin/settings') && !isWebApiPage);
  const [isWebApiOpen, setIsWebApiOpen] = useState(isWebApiPage);
  const [isCommunicationOpen, setIsCommunicationOpen] = useState(pathname.startsWith('/admin/communication'));

  // Ensure it stays open if we navigate to an order page
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    // Only update if not already open to avoid cascading renders
    if (pathname.startsWith('/admin/orders')) {
      setIsOrdersOpen(prev => prev ? prev : true);
    }
    if (
      pathname.startsWith('/admin/products') || 
      pathname.startsWith('/admin/categories') || 
      pathname.startsWith('/admin/attributes') || 
      pathname.startsWith('/admin/inventory')
    ) {
      setIsProductsOpen(prev => prev ? prev : true);
    }
    if (pathname.startsWith('/admin/settings')) {
      setIsSettingsOpen(prev => prev ? prev : true);
    }
    if (pathname.startsWith('/admin/website')) {
      setIsWebsiteOpen(prev => prev ? prev : true);
    }
    if (pathname.startsWith('/admin/reports')) {
      setIsReportsOpen(prev => prev ? prev : true);
    }
    if (pathname.startsWith('/admin/marketing')) {
      setIsMarketingOpen(prev => prev ? prev : true);
    }
    if (pathname.startsWith('/admin/communication')) {
      setIsCommunicationOpen(prev => prev ? prev : true);
    }
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === '/admin' && pathname === '/admin') return true;
    if (path !== '/admin' && pathname.startsWith(path) && !path.includes('?')) return true;
    return false;
  };

  const isSubItemActive = (value: string) => {
    return pathname === '/admin/orders' && statusParam === value;
  };

  const orderStatuses = [
    { label: 'All Orders', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Processing', value: 'processing' },
    { label: 'Picked', value: 'picked' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <>
      

      {/* Sidebar sidebar */}
      <aside className="bg-[#0e0e0e] text-gray-300 w-64 flex-shrink-0 flex flex-col h-screen border-r border-[#1f1f1f]">
        <div className="p-6 flex justify-between items-center mb-4">
          <Link href="/admin" onClick={onClose} className="flex items-center gap-3 w-full justify-center">
            <Image 
              src={logoUrl || "/logo.png"} 
              alt="Logo" 
              width={150} 
              height={40} 
              className="h-12 w-auto object-contain brightness-0 invert" 
              unoptimized
            />
          </Link>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white transition-colors focus:outline-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar pb-24">
          
          <MenuSection title="Overview" />
          
          <Link 
            href="/admin"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 ${
              isActive('/admin') ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Dashboard
          </Link>

          <MenuSection title="Sales & Catalog" />

          {/* Orders */}
          <div className="space-y-1">
            <button 
              onClick={() => setIsOrdersOpen(!isOrdersOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                isActive('/admin/orders') ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                Orders
              </div>
              <svg 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className={`w-4 h-4 transition-transform duration-200 ${isOrdersOpen ? 'rotate-180' : ''}`} 
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isOrdersOpen && (
              <div className="pl-9 pr-3 py-1 space-y-1 relative before:absolute before:left-[22px] before:top-1 before:bottom-1 before:w-px before:bg-white/10">
                {orderStatuses.map((status) => (
                  <Link 
                    key={status.value}
                    href={`/admin/orders?status=${status.value}`}
                    onClick={onClose}
                    className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${
                      isSubItemActive(status.value) ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {status.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Products */}
          <div className="space-y-1">
            <button 
              onClick={() => setIsProductsOpen(!isProductsOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                isActive('/admin/products') || isActive('/admin/categories') || isActive('/admin/brands') || isActive('/admin/sizes') || isActive('/admin/colors') || isActive('/admin/tags') ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                Products
              </div>
              <svg 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className={`w-4 h-4 transition-transform duration-200 ${isProductsOpen ? 'rotate-180' : ''}`} 
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isProductsOpen && (
              <div className="pl-9 pr-3 py-1 space-y-1 relative before:absolute before:left-[22px] before:top-1 before:bottom-1 before:w-px before:bg-white/10">
                <Link href="/admin/products" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/products' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>All Products</Link>
                <Link href="/admin/categories" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/categories' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Categories</Link>
                <Link href="/admin/brands" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/brands' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Brands</Link>
                <Link href="/admin/sizes" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/sizes' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Sizes</Link>
                <Link href="/admin/colors" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/colors' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Colors</Link>
                <Link href="/admin/tags" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/tags' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Tags</Link>
              </div>
            )}
          </div>

          
          {/* Customers */}
          <div className="space-y-1">
            <button 
              onClick={() => setIsCustomersOpen(!isCustomersOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                isActive('/admin/customers') ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                Customers
              </div>
              <svg 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className={`w-4 h-4 transition-transform duration-200 ${isCustomersOpen ? 'rotate-180' : ''}`} 
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isCustomersOpen && (
              <div className="pl-9 pr-3 py-1 space-y-1 relative before:absolute before:left-[22px] before:top-1 before:bottom-1 before:w-px before:bg-white/10">
                <Link href="/admin/customers" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/customers' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>All Customers</Link>
                <Link href="/admin/customers/groups" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/customers/groups' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Customer Groups</Link>
                <Link href="/admin/customers/activity" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/customers/activity' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Customer Activity</Link>
              </div>
            )}
          </div>

          {/* Inventory */}
          <div className="space-y-1">
            <button 
              onClick={() => setIsInventoryOpen(!isInventoryOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                isActive('/admin/inventory') ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                Inventory
              </div>
              <svg 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className={`w-4 h-4 transition-transform duration-200 ${isInventoryOpen ? 'rotate-180' : ''}`} 
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isInventoryOpen && (
              <div className="pl-9 pr-3 py-1 space-y-1 relative before:absolute before:left-[22px] before:top-1 before:bottom-1 before:w-px before:bg-white/10">
                <Link href="/admin/inventory/overview" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/inventory/overview' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Overview</Link>
                <Link href="/admin/inventory/manage" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/inventory/manage' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Manage Stock</Link>
                <Link href="/admin/inventory/history" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/inventory/history' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Stock History</Link>
                <Link href="/admin/inventory/low-stock" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/inventory/low-stock' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Low Stock Alerts</Link>
              </div>
            )}
          </div>

          <MenuSection title="Supply & Finance" />

          {/* Purchases */}
          <Link 
            href="/admin/purchases"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 ${
              isActive('/admin/purchases') ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Purchases
          </Link>

          {/* Suppliers */}
          <Link 
            href="/admin/suppliers"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 ${
              isActive('/admin/suppliers') ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Suppliers
          </Link>

          {/* Expenses */}
          <div className="space-y-1">
            <button 
              onClick={() => setIsExpensesOpen(!isExpensesOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                isActive('/admin/expenses') ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Expenses
              </div>
              <svg 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className={`w-4 h-4 transition-transform duration-200 ${isExpensesOpen ? 'rotate-180' : ''}`} 
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isExpensesOpen && (
              <div className="pl-9 pr-3 py-1 space-y-1 relative before:absolute before:left-[22px] before:top-1 before:bottom-1 before:w-px before:bg-white/10">
                <Link href="/admin/expenses" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/expenses' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Overview</Link>
                <Link href="/admin/expenses/categories" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/expenses/categories' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Categories</Link>
                <Link href="/admin/expenses/history" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/expenses/history' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>History</Link>
              </div>
            )}
          </div>

          
          {/* Reports */}
          <div className="space-y-1">
            <button 
              onClick={() => setIsReportsOpen(!isReportsOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                isActive('/admin/reports') ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Reports
              </div>
              <svg 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className={`w-4 h-4 transition-transform duration-200 ${isReportsOpen ? 'rotate-180' : ''}`} 
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isReportsOpen && (
              <div className="pl-9 pr-3 py-1 space-y-1 relative before:absolute before:left-[22px] before:top-1 before:bottom-1 before:w-px before:bg-white/10">
                <Link href="/admin/reports/sales" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/reports/sales' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Sales Report</Link>
                <Link href="/admin/reports/orders" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/reports/orders' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Order Report</Link>
                <Link href="/admin/reports/purchases" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/reports/purchases' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Purchase Report</Link>
                <Link href="/admin/reports/stock" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/reports/stock' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Stock Report</Link>
                <Link href="/admin/reports/expenses" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/reports/expenses' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Expense Report</Link>
                <Link href="/admin/reports/profit" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/reports/profit' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Profit Report</Link>
                <Link href="/admin/reports/loss" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/reports/loss' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Loss Report</Link>
              </div>
            )}
          </div>

          <MenuSection title="Marketing & CMS" />

          {/* Marketing */}
          <div className="space-y-1">
            <button 
              onClick={() => setIsMarketingOpen(!isMarketingOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                isActive('/admin/marketing') ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
                Marketing
              </div>
              <svg 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className={`w-4 h-4 transition-transform duration-200 ${isMarketingOpen ? 'rotate-180' : ''}`} 
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isMarketingOpen && (
              <div className="pl-9 pr-3 py-1 space-y-1 relative before:absolute before:left-[22px] before:top-1 before:bottom-1 before:w-px before:bg-white/10">
                <Link href="/admin/marketing/meta-pixel" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/marketing/meta-pixel' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Meta Pixel</Link>
                <Link href="/admin/marketing/tiktok-pixel" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/marketing/tiktok-pixel' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>TikTok Pixel</Link>
                <Link href="/admin/marketing/conversion-api" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/marketing/conversion-api' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Conversion API</Link>
                <Link href="/admin/marketing/ga4" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/marketing/ga4' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>GA4</Link>
                <Link href="/admin/marketing/campaigns" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/marketing/campaigns' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Campaigns</Link>
                <Link href="/admin/marketing/flash-sale" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/marketing/flash-sale' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Flash Sale</Link>
                <Link href="/admin/marketing/clarity" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/marketing/clarity' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Clarity Microsoft</Link>
                <Link href="/admin/marketing/abandoned-cart" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/marketing/abandoned-cart' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Abandoned Cart</Link>
              </div>
            )}
          </div>


          {/* Coupons */}
          <div className="space-y-1">
            <button 
              onClick={() => setIsCouponsOpen(!isCouponsOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                isActive('/admin/coupons') ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                Coupons
              </div>
              <svg 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className={`w-4 h-4 transition-transform duration-200 ${isCouponsOpen ? 'rotate-180' : ''}`} 
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isCouponsOpen && (
              <div className="pl-9 pr-3 py-1 space-y-1 relative before:absolute before:left-[22px] before:top-1 before:bottom-1 before:w-px before:bg-white/10">
                <Link href="/admin/coupons" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/coupons' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>All Coupons</Link>
                <Link href="/admin/coupons/add" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/coupons/add' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Create Coupon</Link>
              </div>
            )}
          </div>

          {/* Website Content */}
          <div className="space-y-1">
            <button 
              onClick={() => setIsWebsiteOpen(!isWebsiteOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                isActive('/admin/website') ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Website Content
              </div>
              <svg 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className={`w-4 h-4 transition-transform duration-200 ${isWebsiteOpen ? 'rotate-180' : ''}`} 
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isWebsiteOpen && (
              <div className="pl-9 pr-3 py-1 space-y-1 relative before:absolute before:left-[22px] before:top-1 before:bottom-1 before:w-px before:bg-white/10">
                <Link href="/admin/website/banners" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/website/banners' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Hero Banners</Link>
                <Link href="/admin/website/auth-slider" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/website/auth-slider' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Auth Sliders</Link>
                <Link href="/admin/website/sections" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/website/sections' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Homepage Sections</Link>
                <Link href="/admin/website/pages" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/website/pages' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Custom Pages</Link>
                <Link href="/admin/website/menus/header" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/website/menus/header' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Header Menu</Link>
                <Link href="/admin/website/menus/footer" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/website/menus/footer' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Footer Links</Link>
                <Link href="/admin/website/social" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/website/social' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Social Links</Link>
              </div>
            )}
          </div>

          <Link 
            href="/admin/reviews"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 ${
              isActive('/admin/reviews') ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            Reviews
          </Link>

          <MenuSection title="Configuration" />

          {/* Settings Dropdown */}
          <div className="space-y-1">
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                pathname.startsWith('/admin/settings') && !isWebApiPage ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Settings
              </div>
              <svg 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className={`w-4 h-4 transition-transform duration-200 ${isSettingsOpen ? 'rotate-180' : ''}`} 
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isSettingsOpen && (
              <div className="pl-9 pr-3 py-1 space-y-1 relative before:absolute before:left-[22px] before:top-1 before:bottom-1 before:w-px before:bg-white/10">
                <Link href="/admin/settings/global" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/settings/global' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Global Settings</Link>
                <Link href="/admin/settings/auth" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/settings/auth' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Authentication</Link>
                <Link href="/admin/settings/push-notification" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/settings/push-notification' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Push Notification</Link>
                <Link href="/admin/settings/seo" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/settings/seo' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>SEO Settings</Link>
                <Link href="/admin/settings/sitemap" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/settings/sitemap' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Sitemap</Link>
                <Link href="/admin/settings/search-console" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/settings/search-console' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Search Console</Link>
                <Link href="/admin/settings/shipping" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/settings/shipping' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Shipping</Link>
                <Link href="/admin/settings/payment" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/settings/payment' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Payment</Link>
                                <Link href="/admin/settings/mail" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/settings/mail' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Mail & SMTP</Link>
                <Link href="/admin/settings/activity-logs" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/settings/activity-logs' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Activity Logs</Link>
              </div>
            )}
          </div>

          
          {/* Communication Dropdown */}
          <div className="space-y-1">
            <button 
              onClick={() => setIsCommunicationOpen(!isCommunicationOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                pathname.startsWith('/admin/communication') ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                Communication
              </div>
              <svg 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className={`w-4 h-4 transition-transform duration-200 ${isCommunicationOpen ? 'rotate-180' : ''}`} 
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isCommunicationOpen && (
              <div className="pl-9 pr-3 py-1 space-y-1 relative before:absolute before:left-[22px] before:top-1 before:bottom-1 before:w-px before:bg-white/10">
                <Link href="/admin/communication/contact" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/communication/contact' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Contact Messages</Link>
                <Link href="/admin/communication/newsletter" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/communication/newsletter' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Newsletter</Link>
                <Link href="/admin/communication/templates" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/communication/templates' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Email Templates</Link>
                <Link href="/admin/communication/broadcast" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/communication/broadcast' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Broadcast</Link>
              </div>
            )}
          </div>

          {/* Web API Dropdown */}
          <div className="space-y-1">
            <button 
              onClick={() => setIsWebApiOpen(!isWebApiOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                isWebApiPage ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                Web API
              </div>
              <svg 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className={`w-4 h-4 transition-transform duration-200 ${isWebApiOpen ? 'rotate-180' : ''}`} 
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isWebApiOpen && (
              <div className="pl-9 pr-3 py-1 space-y-1 relative before:absolute before:left-[22px] before:top-1 before:bottom-1 before:w-px before:bg-white/10">
                <Link href="/admin/settings/courier" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/settings/courier' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Courier API</Link>
                <Link href="/admin/settings/bkash" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/settings/bkash' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Bkash API</Link>
                <Link href="/admin/settings/eps" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/settings/eps' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>EPS API</Link>
                <Link href="/admin/settings/sslcommerz" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/settings/sslcommerz' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>SSLCommerz</Link>
                <Link href="/admin/settings/nagad" onClick={onClose} className={`block px-3 py-[6px] rounded-md text-[13px] transition-colors ${pathname === '/admin/settings/nagad' ? 'bg-white/[0.08] text-white font-medium shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'}`}>Nagad API</Link>
              </div>
            )}
          </div>

        </div>
        
        <div className="p-4 border-t border-zinc-800/60">
          <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:bg-white/[0.04] hover:text-white transition-all duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            View Storefront
          </Link>
        </div>
      </aside>
    </>
  );
}
