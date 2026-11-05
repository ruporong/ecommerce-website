import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import PageModel from '@/models/Page';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  await connectToDatabase();
  const setting = await Setting.findOne({ key: 'store_name' }).lean();
  const storeName = (setting as any)?.value || 'Ruporong';
  return {
    title: `Privacy Policy | ${storeName}`,
    description: `Read the privacy policy of ${storeName}. Learn how we collect, protect, and handle your personal information.`,
  };
}

export default async function PrivacyPolicyPage() {
  await connectToDatabase();

  // Check if a custom CMS page has been published in admin
  const cmsPage = await PageModel.findOne({ 
    slug: { $in: ['privacy-policy', 'privacy'] }, 
    status: 'published' 
  }).lean();

  const settings = await Setting.find({
    key: { $in: ['store_name', 'store_phone', 'store_email', 'store_address', 'phone_number', 'email_address', 'address'] }
  }).lean();
  const settingsMap = settings.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});

  const storeName = settingsMap.store_name || 'Ruporong';
  const email = settingsMap.store_email || settingsMap.email_address || 'contact@ruporong.com';
  const phone = settingsMap.store_phone || settingsMap.phone_number || '+880 1700 000 000';
  const address = settingsMap.store_address || settingsMap.address || 'Dhaka, Bangladesh';

  return (
    <main className="min-h-screen bg-[#FDFCFB] py-12 md:py-20 text-charcoal">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 mb-8">
          <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
          <span>/</span>
          <span className="text-charcoal font-medium">Privacy Policy</span>
        </nav>

        {/* Header */}
        <div className="border-b border-gray-200 pb-8 mb-10">
          <span className="text-xs tracking-[0.25em] uppercase text-dusty-rose font-semibold block mb-2">
            Legal & Security
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal mb-4 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {cmsPage && cmsPage.content ? (
          <div 
            className="prose prose-stone max-w-none leading-relaxed text-charcoal/85 space-y-6 [&>h2]:font-serif [&>h2]:text-2xl [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:font-serif [&>h3]:text-xl [&>h3]:mt-6 [&>h3]:mb-3 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4"
            dangerouslySetInnerHTML={{ __html: cmsPage.content }}
          />
        ) : (
          <div className="space-y-10 text-charcoal/85 leading-relaxed text-sm sm:text-base">
            
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="font-serif text-xl sm:text-2xl text-charcoal font-medium mb-3">1. Introduction</h2>
              <p>
                Welcome to <strong>{storeName}</strong>. We value your trust and are deeply committed to protecting the privacy and security of your personal information. This Privacy Policy outlines our practices regarding the collection, use, and disclosure of information when you browse our website, create an account, or purchase our products.
              </p>
              <p className="mt-3">
                By accessing or using our website, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="font-serif text-xl sm:text-2xl text-charcoal font-medium mb-3">2. Information We Collect</h2>
              <p className="mb-3">To provide you with our boutique e-commerce services, we collect several types of information:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Personal Identification Details:</strong> Name, delivery address, phone/mobile number, and email address provided during checkout or account registration.
                </li>
                <li>
                  <strong>Order & Transaction Records:</strong> Products purchased, order timestamps, preferred delivery location, and payment method selected (such as Cash on Delivery or Mobile Financial Services).
                </li>
                <li>
                  <strong>Communication Records:</strong> Queries, customer support chats, or order notes sent to us via WhatsApp, live chat, or phone calls.
                </li>
                <li>
                  <strong>Technical & Browsing Data:</strong> IP address, device type, browser information, pages visited, and cookies to ensure an optimal user experience.
                </li>
              </ul>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="font-serif text-xl sm:text-2xl text-charcoal font-medium mb-3">3. How We Use Your Information</h2>
              <p className="mb-3">We use the collected information for the following specific purposes:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Processing and fulfilling your orders accurately.</li>
                <li>Coordinating with courier and delivery partners to ensure swift delivery to your doorstep.</li>
                <li>Sending order confirmation SMS, dispatch notifications, and tracking numbers.</li>
                <li>Providing reliable customer support, addressing inquiries, and handling replacement or return requests.</li>
                <li>Preventing fraudulent orders and maintaining platform security.</li>
                <li>Sending updates about new collections or special seasonal offers (you may opt out at any time).</li>
              </ul>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="font-serif text-xl sm:text-2xl text-charcoal font-medium mb-3">4. Payment Security & Financial Data</h2>
              <p>
                Your financial safety is our utmost priority. <strong>{storeName} does not store your credit card details, debit card numbers, or bKash / Nagad PINs or OTPs</strong> on our servers. All digital transactions are processed through certified, SSL-encrypted payment gateways or handled securely upon parcel receipt via Cash on Delivery (COD).
              </p>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="font-serif text-xl sm:text-2xl text-charcoal font-medium mb-3">5. Sharing with Trusted Partners</h2>
              <p className="mb-3">
                We never sell, trade, or rent your personal identifiable information to third parties. We share limited relevant details only with:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Authorized Logistics Partners:</strong> Reputable courier services in Bangladesh (e.g., Steadfast, Pathao, RedX) solely for delivering your parcels and collecting COD payments.
                </li>
                <li>
                  <strong>Legal Authorities:</strong> Only when strictly required by Bangladesh laws, regulations, or court orders to protect our rights or prevent fraud.
                </li>
              </ul>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="font-serif text-xl sm:text-2xl text-charcoal font-medium mb-3">6. Cookies and Tracking</h2>
              <p>
                Our store uses cookies to remember your shopping cart items, preserve your login session, and analyze store traffic. You can choose to disable cookies in your browser settings, though doing so may affect some website features like cart persistence.
              </p>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="font-serif text-xl sm:text-2xl text-charcoal font-medium mb-3">7. Your Rights & Choices</h2>
              <p className="mb-3">
                As a valued customer, you have full control over your personal data:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>You may view, edit, or update your profile and saved addresses in your account dashboard.</li>
                <li>You may request the deletion of your account and personal history by contacting our support team.</li>
                <li>You can unsubscribe from promotional messages at any time.</li>
              </ul>
            </section>

            <section className="bg-charcoal text-white p-6 sm:p-8 rounded-2xl">
              <h2 className="font-serif text-xl sm:text-2xl text-warm-white font-medium mb-3">8. Contact Us Regarding Privacy</h2>
              <p className="text-warm-white/80 mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or how your personal information is handled, please contact us:
              </p>
              <div className="space-y-2 text-sm sm:text-base text-warm-white/90">
                <p><strong>Store:</strong> {storeName}</p>
                <p><strong>Email:</strong> <a href={`mailto:${email}`} className="underline text-dusty-rose hover:text-white">{email}</a></p>
                <p><strong>Phone / WhatsApp:</strong> <a href={`tel:${phone}`} className="underline text-dusty-rose hover:text-white">{phone}</a></p>
                <p><strong>Address:</strong> {address}</p>
              </div>
            </section>

          </div>
        )}

      </div>
    </main>
  );
}
