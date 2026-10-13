import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import ContactClient from './ContactClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  await connectToDatabase();
  const setting = await Setting.findOne({ key: 'store_name' }).lean();
  const name = (setting as any)?.value || 'ÉLANE';
  return {
    title: `Contact Us | ${name}`,
    description: 'Get in touch with us for any inquiries, support, or feedback.',
  };
}

export default async function ContactPage() {
  await connectToDatabase();
  const settings = await Setting.find({
    key: { $in: ['store_name', 'store_phone', 'store_email', 'store_address', 'phone_number', 'email_address', 'address'] }
  }).lean();
  
  const settingsMap = settings.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
  
  const address = settingsMap.store_address || settingsMap.address || 'Dhaka, Bangladesh';
  const email = settingsMap.store_email || settingsMap.email_address || 'hello@store.com';
  const phone = settingsMap.store_phone || settingsMap.phone_number || '+880 1700 000 000';
  const telLink = phone.replace(/[^\d+]/g, '') || '+8801700000000';

  return (
    <main className="min-h-screen bg-[#F9F9F9] py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-serif text-charcoal mb-6 tracking-tight">Contact Us</h1>
          <p className="text-gray-500 max-w-xl mx-auto text-lg leading-relaxed">
            Have a question or need assistance? Our client advisors are here to help you with anything you need.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white shadow-2xl shadow-gray-200/40 rounded-2xl overflow-hidden">
          
          {/* LEFT SIDE: Info */}
          <div className="lg:col-span-5 bg-charcoal text-white p-10 md:p-16 flex flex-col justify-between relative overflow-hidden">
            {/* Decorative background shape */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

            <div className="relative z-10">
              <h2 className="text-3xl font-serif mb-6 text-warm-white">Get in touch</h2>
              <p className="text-gray-400 mb-12 text-sm leading-relaxed">
                Fill out the form and our dedicated team will get back to you within 24 business hours.
              </p>

              <div className="space-y-10">
                <div className="flex items-start gap-5">
                  <div className="bg-white/10 p-3 rounded-full shrink-0">
                    <svg className="w-5 h-5 text-dusty-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs tracking-widest uppercase text-gray-400 mb-1.5">Office</h3>
                    <p className="text-warm-white text-sm leading-relaxed whitespace-pre-line">{address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="bg-white/10 p-3 rounded-full shrink-0">
                    <svg className="w-5 h-5 text-dusty-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs tracking-widest uppercase text-gray-400 mb-1.5">Email</h3>
                    <a href={`mailto:${email}`} className="text-warm-white text-sm hover:text-dusty-rose transition-colors break-all">
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="bg-white/10 p-3 rounded-full shrink-0">
                    <svg className="w-5 h-5 text-dusty-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.436-4.136-7.032-7.032l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs tracking-widest uppercase text-gray-400 mb-1.5">Phone</h3>
                    <a href={`tel:${telLink}`} className="text-warm-white text-sm hover:text-dusty-rose transition-colors">
                      {phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Form */}
          <div className="lg:col-span-7 p-10 md:p-16">
            <h3 className="text-2xl font-serif text-charcoal mb-8">Send a Message</h3>
            <ContactClient />
          </div>

        </div>
      </div>
    </main>
  );
}
