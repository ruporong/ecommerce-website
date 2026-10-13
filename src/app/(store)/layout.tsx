import connectToDatabase from '@/lib/mongodb';
import Menu from '@/models/Menu';
import Setting from '@/models/Setting';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuickViewModal from "@/components/QuickViewModal";
import CartDrawer from "@/components/CartDrawer";
import WebChat from "@/components/WebChat";
import CartSyncListener from "@/components/CartSyncListener";
import FlashSale from "@/models/FlashSale";
import Script from "next/script";

export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connectToDatabase();
  
  // Fetch Menus
  const rawHeaderMenus = await Menu.find({ position: 'header', status: 'active' }).sort({ order: 1 }).lean();
  const rawFooterMenus = await Menu.find({ position: 'footer', status: 'active' }).sort({ column: 1, order: 1 }).lean();
  
  const headerMenus = JSON.parse(JSON.stringify(rawHeaderMenus));
  const footerMenus = JSON.parse(JSON.stringify(rawFooterMenus));

  const rawFlashSale = await FlashSale.findOne({ is_active: true }).lean();
  const flashSale = rawFlashSale ? JSON.parse(JSON.stringify(rawFlashSale)) : null;

  // Fetch Social Links
  const setting = await Setting.findOne({ key: 'social_links' }).lean();
  const socialLinks = setting?.value ? JSON.parse(setting.value) : [];

  // Fetch Logos
  const logoLightSetting = await Setting.findOne({ key: 'logo_url' }).lean();
  const logoDarkSetting = await Setting.findOne({ key: 'logo_dark_url' }).lean();
  
  const logoLight = logoLightSetting?.value || null;
  const logoDark = logoDarkSetting?.value || null;

  // Fetch Colors
  const primaryColorSetting = await Setting.findOne({ key: 'primary_color' }).lean();
  const bgColorSetting = await Setting.findOne({ key: 'background_color' }).lean();
  
  const primaryColor = primaryColorSetting?.value || '#1a1a1a';
  const bgColor = bgColorSetting?.value || '#FAFAFA';

  return (
    <>
      <link rel="stylesheet" href="/assets/template/output.css" />
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --color-charcoal: ${primaryColor};
          --color-warm-white: ${bgColor};
        }
        .bg-charcoal { background-color: var(--color-charcoal) !important; }
        .text-charcoal { color: var(--color-charcoal) !important; }
        .border-charcoal { border-color: var(--color-charcoal) !important; }
        .hover\\:bg-charcoal:hover { background-color: var(--color-charcoal) !important; }
        .hover\\:text-charcoal:hover { color: var(--color-charcoal) !important; }
        .hover\\:text-white:hover { color: #ffffff !important; }
        .hover\\:bg-black:hover { background-color: #000000 !important; }
        
        body { background-color: var(--color-warm-white) !important; color: var(--color-charcoal) !important; }
        .bg-warm-white { background-color: var(--color-warm-white) !important; }
        .text-warm-white { color: var(--color-warm-white) !important; }
      `}} />
      
      <Header menus={headerMenus} logoUrl={logoDark} flashSale={flashSale} />

      {children}

      <Footer menus={footerMenus} socialLinks={socialLinks} logoUrl={logoLight} />
      <QuickViewModal />
      <CartDrawer />
      <WebChat />
      <CartSyncListener />

      {/* Global Scripts from Template */}
      <Script src="/assets/template/jquery.min.js" strategy="beforeInteractive" />
      <Script src="/assets/template/store.js" strategy="lazyOnload" />
      <Script src="/assets/template/main.js" strategy="lazyOnload" />
    </>
  );
}
