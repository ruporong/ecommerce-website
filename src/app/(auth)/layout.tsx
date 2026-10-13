import Link from 'next/link';

import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import Banner from '@/models/Banner';
import AuthSliderClient from './AuthSliderClient';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  await connectToDatabase();
  const logoSetting = await Setting.findOne({ key: 'logo_dark_url' });
  const storeLogo = logoSetting?.value;
  const rawBanners = await Banner.find({ status: 'active', type: 'auth' }).sort({ order: 1 }).lean();
  const banners = JSON.parse(JSON.stringify(rawBanners));
  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Left Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Top bar */}
        <div className="p-6 md:p-10 flex justify-between items-center text-sm font-medium">
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-black font-semibold transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Back</Link>
          {(storeLogo && storeLogo !== '/logo.png') ? <img src={storeLogo} alt="Logo" className="h-10 md:h-12 w-auto object-contain" /> : <span className="font-serif font-bold text-xl tracking-widest text-black uppercase">ÉLANE</span>}
          <div className="w-8"></div> {/* Spacer */}
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
           <div className="w-full max-w-sm">
             {children}
           </div>
        </div>
      </div>

      {/* Right Image Side */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gray-50">
        <AuthSliderClient banners={banners} />
      </div>
    </div>
  );
}
