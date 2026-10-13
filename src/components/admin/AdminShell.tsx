'use client';

import { useState, Suspense } from 'react';
import { signOut } from 'next-auth/react';
import Sidebar from './Sidebar';
import AdminNotifications from './AdminNotifications';

export default function AdminShell({ children, logoUrl, storeName = 'ÉLANE' }: { children: React.ReactNode, logoUrl?: string | null, storeName?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 font-sans md:pl-64 print:pl-0 print:bg-white">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden print:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar Wrapper */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} print:hidden`}>
        <Suspense fallback={<div className="bg-[#0e0e0e] w-64 h-screen"></div>}>
          <Sidebar onClose={() => setMobileMenuOpen(false)} logoUrl={logoUrl} />
        </Suspense>
      </div>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0 print:overflow-visible print:h-auto">
        {/* Topbar */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 px-4 md:px-8 py-3 md:py-4 flex justify-between items-center mx-4 md:mx-6 mt-4 md:mt-6 mb-2 rounded-xl shadow-sm print:hidden">
          
          {/* Mobile Menu Button & Search */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <div className="relative w-40 md:w-64 hidden sm:block">
              <input type="text" placeholder="Search here" className="w-full pl-3 pr-10 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900" />
              <button className="absolute right-0 top-0 h-full px-3 bg-gray-900 text-white rounded-r-md">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <AdminNotifications />
            

            
            {/* Profile */}
            <div className="flex items-center gap-2 md:border-l border-gray-200 pl-2 md:pl-4 group relative">
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold border border-gray-300 shrink-0">
                A
              </div>
              <div className="text-right leading-tight hidden lg:block">
                <p className="text-[13px] font-semibold text-gray-900">Admin User</p>
                <p className="text-[11px] text-gray-500">Super Admin</p>
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                title="Logout"
                className="ml-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="px-4 md:px-6 pb-6 pt-2 print:p-0">
          {children}
        </div>
        
        <footer className="text-center py-4 text-xs text-gray-500 mt-auto print:hidden">
          Copyright © {storeName} {new Date().getFullYear()}. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
