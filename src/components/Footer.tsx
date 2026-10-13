import NewsletterForm from './NewsletterForm';
export default function Footer({ menus = [], socialLinks = [], logoUrl, storeName = 'Store' }: { menus?: any[], socialLinks?: any[], logoUrl?: string | null, storeName?: string }) {
  const col1 = menus.filter(m => m.column === 1);
  const col2 = menus.filter(m => m.column === 2);
  const col3 = menus.filter(m => m.column === 3);

  return (
    <footer className="bg-charcoal text-warm-white pt-20 pb-10 px-4 md:px-8">
      <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 border-b border-white/10 pb-16">
        <div className="md:col-span-2">
          {logoUrl ? (
            <img src={logoUrl} alt="Store Logo" className="h-10 object-contain mb-6" />
          ) : (
            <div className="h-10 w-32 bg-gray-800 rounded flex items-center justify-center text-xs text-gray-500 font-sans tracking-normal mb-6">No Logo</div>
          )}
          <p className="text-warm-white/70 max-w-sm mb-8 text-sm">Elevating women's fashion through modern design, premium fabrics, and timeless silhouettes.</p>
          <div className="max-w-md">
            <p className="text-[10px] tracking-widest uppercase mb-3">Join The Edit</p>
            <NewsletterForm />
          </div>
          {socialLinks.length > 0 && (
            <div className="flex gap-4 mt-8">
              {socialLinks.map((link: any, idx: number) => (
                <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="text-warm-white/70 hover:text-white text-sm">
                  {link.platform}
                </a>
              ))}
            </div>
          )}
        </div>
        
        {/* Column 1 */}
        <div>
          <h4 className="text-[10px] tracking-widest uppercase mb-6 text-warm-white/50">Company</h4>
          <ul className="space-y-3 text-sm">
            {col1.length > 0 ? col1.map((m, idx) => (
              <li key={idx}><a href={m.link} className="hover:text-dusty-rose transition-colors">{m.name}</a></li>
            )) : (
              <>
                <li><a href="#" className="hover:text-dusty-rose transition-colors">New Arrivals</a></li>
                <li><a href="#" className="hover:text-dusty-rose transition-colors">Dresses</a></li>
                <li><a href="#" className="hover:text-dusty-rose transition-colors">Sale</a></li>
              </>
            )}
          </ul>
        </div>
        
        {/* Column 2 */}
        <div>
          <h4 className="text-[10px] tracking-widest uppercase mb-6 text-warm-white/50">Help</h4>
          <ul className="space-y-3 text-sm">
            {col2.length > 0 ? col2.map((m, idx) => (
              <li key={idx}><a href={m.link} className="hover:text-dusty-rose transition-colors">{m.name}</a></li>
            )) : (
              <>
                <li><a href="#" className="hover:text-dusty-rose transition-colors">Size Guide</a></li>
                <li><a href="#" className="hover:text-dusty-rose transition-colors">Shipping & Returns</a></li>
                <li><a href="#" className="hover:text-dusty-rose transition-colors">Contact Us</a></li>
              </>
            )}
          </ul>
        </div>
        
        {/* Column 3 */}
        <div>
          <h4 className="text-[10px] tracking-widest uppercase mb-6 text-warm-white/50">Legal</h4>
          <ul className="space-y-3 text-sm">
            {col3.length > 0 ? col3.map((m, idx) => (
              <li key={idx}><a href={m.link} className="hover:text-dusty-rose transition-colors">{m.name}</a></li>
            )) : (
              <>
                <li><a href="#" className="hover:text-dusty-rose transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-dusty-rose transition-colors">Privacy Policy</a></li>
              </>
            )}
          </ul>
        </div>
      </div>
      <div className="max-w-[1920px] mx-auto flex justify-between items-center mt-8 text-xs text-warm-white/50">
        <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
      </div>
    </footer>
  );
}
