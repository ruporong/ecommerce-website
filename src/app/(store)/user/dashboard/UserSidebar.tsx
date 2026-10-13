"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function UserSidebar({ user }: { user: any }) {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/user/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { name: "My Orders", href: "/user/dashboard/orders", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
    { name: "Track Parcel", href: "/user/dashboard/track", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
    { name: "My Profile", href: "/user/dashboard/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .user-sidebar-layout { width: 100%; }
        @media (min-width: 1024px) { .user-sidebar-layout { width: 256px; } }
      `}} />
      <aside className="shrink-0 user-sidebar-layout">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 line-clamp-1">{user?.name || 'Customer'}</h3>
            <p className="text-sm text-gray-500 line-clamp-1">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <nav className="flex flex-col py-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-semibold border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium border-r-4 border-transparent'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} /></svg>
                {link.name}
              </Link>
            )
          })}
          
          <div className="h-px bg-gray-100 my-2 mx-4"></div>
          
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 px-6 py-3 text-red-600 hover:bg-red-50 font-medium transition-colors border-r-4 border-transparent w-full text-left"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </button>
        </nav>
      </div>
    </aside>
    </>
  );
}
