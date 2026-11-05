import Link from 'next/link';
import NewsletterForm from './NewsletterForm';

function getSocialIcon(platform: string) {
  const p = (platform || '').toLowerCase().trim();
  if (p.includes('facebook') || p === 'fb') {
    return (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    );
  }
  if (p.includes('instagram') || p === 'insta') {
    return (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    );
  }
  if (p.includes('twitter') || p.includes(' x') || p === 'x') {
    return (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  }
  if (p.includes('youtube')) {
    return (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    );
  }
  if (p.includes('tiktok')) {
    return (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    );
  }
  if (p.includes('whatsapp')) {
    return (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
      </svg>
    );
  }
  if (p.includes('linkedin')) {
    return (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    );
  }
  // Generic / Website link fallback
  return (
    <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

export default function Footer({ 
  menus = [], 
  categories = [], 
  socialLinks = [], 
  logoUrl, 
  storeName = 'Ruporong' 
}: { 
  menus?: any[], 
  categories?: any[], 
  socialLinks?: any[], 
  logoUrl?: string | null, 
  storeName?: string 
}) {
  const col1 = menus.filter(m => m.column === 1);
  const col2 = menus.filter(m => m.column === 2);
  const col3 = menus.filter(m => m.column === 3);

  // Dynamic category list for footer fallback
  const displayCategories = categories && categories.length > 0 
    ? categories.slice(0, 5) 
    : [];

  return (
    <footer className="bg-charcoal text-warm-white pt-20 pb-10 px-4 md:px-8">
      <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 border-b border-white/10 pb-16">
        <div className="md:col-span-2">
          {logoUrl ? (
            <div className="inline-flex items-center bg-white px-4 py-2.5 rounded-xl mb-6 shadow-sm">
              <img src={logoUrl} alt="Store Logo" className="h-10 sm:h-12 md:h-14 w-auto max-w-[220px] md:max-w-[260px] object-contain" />
            </div>
          ) : (
            <div className="h-12 w-36 bg-gray-800 rounded flex items-center justify-center text-xs text-gray-500 font-sans tracking-normal mb-6">No Logo</div>
          )}
          <p className="text-warm-white/70 max-w-sm mb-8 text-sm">Elevating women's fashion through modern design, premium fabrics, and timeless silhouettes.</p>
          <div className="max-w-md">
            <p className="text-[10px] tracking-widest uppercase mb-3">Join The Edit</p>
            <NewsletterForm />
          </div>
          {socialLinks.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mt-8">
              {socialLinks.map((link: any, idx: number) => (
                <a 
                  key={idx} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title={link.platform}
                  aria-label={link.platform}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white text-warm-white hover:text-charcoal border border-white/10 hover:border-white flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 shadow-sm"
                >
                  {getSocialIcon(link.platform)}
                </a>
              ))}
            </div>
          )}
        </div>
        
        {/* Column 1 - Company / Categories */}
        <div>
          <h4 className="text-[10px] tracking-widest uppercase mb-6 text-warm-white/50">Company</h4>
          <ul className="space-y-3 text-sm">
            {col1.length > 0 ? col1.map((m, idx) => (
              <li key={idx}><Link href={m.link} className="hover:text-dusty-rose transition-colors">{m.name}</Link></li>
            )) : displayCategories.length > 0 ? (
              <>
                <li><Link href="/shop" className="hover:text-dusty-rose transition-colors">All Products</Link></li>
                {displayCategories.map((c: any) => (
                  <li key={c._id}><Link href={`/category/${c.slug}`} className="hover:text-dusty-rose transition-colors">{c.name}</Link></li>
                ))}
              </>
            ) : (
              <>
                <li><Link href="/shop" className="hover:text-dusty-rose transition-colors">New Arrivals</Link></li>
                <li><Link href="/shop" className="hover:text-dusty-rose transition-colors">Collections</Link></li>
                <li><Link href="/contact" className="hover:text-dusty-rose transition-colors">Contact</Link></li>
              </>
            )}
          </ul>
        </div>
        
        {/* Column 2 - Help & Customer Care */}
        <div>
          <h4 className="text-[10px] tracking-widest uppercase mb-6 text-warm-white/50">Help</h4>
          <ul className="space-y-3 text-sm">
            {col2.length > 0 ? col2.map((m, idx) => (
              <li key={idx}><Link href={m.link} className="hover:text-dusty-rose transition-colors">{m.name}</Link></li>
            )) : (
              <>
                <li><Link href="/contact" className="hover:text-dusty-rose transition-colors">Contact Us</Link></li>
                <li><Link href="/terms-of-service#shipping" className="hover:text-dusty-rose transition-colors">Shipping & Delivery</Link></li>
                <li><Link href="/terms-of-service#returns" className="hover:text-dusty-rose transition-colors">Returns & Refunds</Link></li>
              </>
            )}
          </ul>
        </div>
        
        {/* Column 3 - Legal */}
        <div>
          <h4 className="text-[10px] tracking-widest uppercase mb-6 text-warm-white/50">Legal</h4>
          <ul className="space-y-3 text-sm">
            {col3.length > 0 ? col3.map((m, idx) => (
              <li key={idx}><Link href={m.link} className="hover:text-dusty-rose transition-colors">{m.name}</Link></li>
            )) : (
              <>
                <li><Link href="/terms-of-service" className="hover:text-dusty-rose transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-dusty-rose transition-colors">Privacy Policy</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
      <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row justify-between items-center pt-8 text-xs text-warm-white/60 gap-3">
        <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        <p className="flex items-center gap-1.5 text-warm-white/60">
          <span>Design and develop by</span>
          <a 
            href="https://www.ecombuildltd.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-warm-white hover:text-white font-medium underline underline-offset-4 transition-colors"
          >
            ecommercebuild
          </a>
        </p>
      </div>
    </footer>
  );
}
