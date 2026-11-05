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
    title: `Terms of Service | ${storeName}`,
    description: `Terms and Conditions of shopping with ${storeName}. Learn about orders, delivery, returns, and customer policies.`,
  };
}

export default async function TermsOfServicePage() {
  await connectToDatabase();

  // Check if custom CMS page has been published in admin
  const cmsPage = await PageModel.findOne({ 
    slug: { $in: ['terms-of-service', 'terms', 'terms-and-conditions'] }, 
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
          <span className="text-charcoal font-medium">Terms of Service</span>
        </nav>

        {/* Header */}
        <div className="border-b border-gray-200 pb-8 mb-10">
          <span className="text-xs tracking-[0.25em] uppercase text-dusty-rose font-semibold block mb-2">
            Legal Agreement
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal mb-4 tracking-tight">
            Terms & Conditions
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
              <h2 className="font-serif text-xl sm:text-2xl text-charcoal font-medium mb-3">1. Agreement to Terms</h2>
              <p>
                By visiting or placing an order with <strong>{storeName}</strong>, you agree to be bound by these Terms of Service. Please read them thoroughly before making a purchase. If you do not agree with any part of these terms, please refrain from using our services.
              </p>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="font-serif text-xl sm:text-2xl text-charcoal font-medium mb-3">2. Products, Pricing & Accuracy</h2>
              <p className="mb-3">
                We make every effort to display the colors, fabrics, and descriptions of our collections as accurately as possible. However:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Colors may vary slightly depending on monitor/screen color profiles and studio lighting.</li>
                <li>All prices are listed in Bangladeshi Taka (BDT ৳) and are subject to change without prior notice.</li>
                <li>In the unlikely event of an incorrect price listing due to technical error, we reserve the right to cancel or adjust the order after contacting the customer.</li>
              </ul>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="font-serif text-xl sm:text-2xl text-charcoal font-medium mb-3">3. Orders & Verification</h2>
              <p className="mb-3">
                Upon submitting an order through our checkout:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>You will receive an automated confirmation on-screen and via SMS/email.</li>
                <li>For Cash on Delivery (COD) orders, our customer relations team may place a brief verification call to confirm your delivery address and contact phone number.</li>
                <li>We reserve the right to decline or cancel orders in cases of product out-of-stock, suspected fraud, or repeated unreachable delivery attempts.</li>
              </ul>
            </section>

            <section id="shipping" className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm scroll-mt-24">
              <h2 className="font-serif text-xl sm:text-2xl text-charcoal font-medium mb-3">4. Shipping & Delivery Policy</h2>
              <p className="mb-3">
                We partner with leading nationwide courier services to ensure prompt and secure delivery:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Inside Dhaka:</strong> Usually delivered within 24 to 48 hours.</li>
                <li><strong>Outside Dhaka:</strong> Usually delivered within 3 to 5 business days.</li>
                <li>Applicable delivery charges are calculated at checkout based on your district/area.</li>
                <li>Please inspect the exterior packaging of the parcel in front of the delivery agent before completing receipt.</li>
              </ul>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="font-serif text-xl sm:text-2xl text-charcoal font-medium mb-3">5. Payment Methods</h2>
              <p className="mb-3">We accept flexible and secure payment options for your convenience:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Cash on Delivery (COD):</strong> Pay in cash directly to the courier agent upon receiving your parcel.</li>
                <li><strong>Mobile Financial Services:</strong> bKash, Nagad, and Rocket via secure payment gateways.</li>
                <li><strong>Debit & Credit Cards:</strong> Visa, Mastercard, and other supported domestic & international cards.</li>
              </ul>
            </section>

            <section id="returns" className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm scroll-mt-24">
              <h2 className="font-serif text-xl sm:text-2xl text-charcoal font-medium mb-3">6. Return, Replacement & Refund Policy</h2>
              <p className="mb-3">
                Your satisfaction is our priority. If there is an issue with your received item:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Eligibility Window:</strong> You must notify us within <strong>48 hours</strong> of receiving the delivery if you receive a damaged, defective, or incorrect product.
                </li>
                <li>
                  <strong>Condition:</strong> The item must be unused, unwashed, unaltered, and returned with its original tags and packaging intact.
                </li>
                <li>
                  <strong>Replacement:</strong> Once verified, we will arrange a replacement at no additional delivery cost to you.
                </li>
                <li>
                  <strong>Refunds:</strong> If a replacement is not available, refunds for prepaid orders will be processed within 5 to 7 working days via the original payment method or bKash/bank transfer.
                </li>
              </ul>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="font-serif text-xl sm:text-2xl text-charcoal font-medium mb-3">7. Order Cancellation</h2>
              <p>
                Customers can cancel an order free of charge before it has been dispatched from our warehouse by contacting our support hotline or WhatsApp. Once the package has been handed over to the courier service, standard return terms will apply.
              </p>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="font-serif text-xl sm:text-2xl text-charcoal font-medium mb-3">8. Intellectual Property</h2>
              <p>
                All photographs, text, graphics, logos, illustrations, and design elements featured on this website are the proprietary property of <strong>{storeName}</strong>. Unauthorized duplication, reproduction, or commercial use without prior written consent is strictly prohibited.
              </p>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="font-serif text-xl sm:text-2xl text-charcoal font-medium mb-3">9. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws of the People&apos;s Republic of Bangladesh. Any dispute arising out of or related to these terms shall be subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh.
              </p>
            </section>

            <section className="bg-charcoal text-white p-6 sm:p-8 rounded-2xl">
              <h2 className="font-serif text-xl sm:text-2xl text-warm-white font-medium mb-3">10. Contact & Inquiries</h2>
              <p className="text-warm-white/80 mb-4">
                For questions regarding our terms, shipping assistance, or returns, please reach out to our client care team:
              </p>
              <div className="space-y-2 text-sm sm:text-base text-warm-white/90">
                <p><strong>Store:</strong> {storeName}</p>
                <p><strong>Email:</strong> <a href={`mailto:${email}`} className="underline text-dusty-rose hover:text-white">{email}</a></p>
                <p><strong>Hotline:</strong> <a href={`tel:${phone}`} className="underline text-dusty-rose hover:text-white">{phone}</a></p>
                <p><strong>Address:</strong> {address}</p>
              </div>
            </section>

          </div>
        )}

      </div>
    </main>
  );
}
