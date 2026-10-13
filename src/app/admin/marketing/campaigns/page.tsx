export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import Campaign from '@/models/Campaign';
import Setting from '@/models/Setting';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

async function createCampaign(formData: FormData) {
  'use server';
  await connectToDatabase();
  const name = formData.get('name') as string;
  const utm_source = formData.get('utm_source') as string;
  const utm_medium = formData.get('utm_medium') as string;
  const utm_campaign = formData.get('utm_campaign') as string;

  await Campaign.create({
    name,
    utm_source,
    utm_medium,
    utm_campaign
  });

  revalidatePath('/admin/marketing/campaigns');
}

async function deleteCampaign(formData: FormData) {
  'use server';
  await connectToDatabase();
  const id = formData.get('id') as string;
  await Campaign.findByIdAndDelete(id);
  revalidatePath('/admin/marketing/campaigns');
}

export default async function CampaignsPage() {
  await connectToDatabase();
  const campaigns = await Campaign.find().sort({ createdAt: -1 }).lean();
  
  // Find store url
  const domainSetting = await Setting.findOne({ key: 'store_domain' }).lean();
  const storeUrl = domainSetting?.value || 'https://example.com';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns & Tracking Links</h1>
          <p className="text-gray-500 text-sm mt-1">Generate UTM links to track performance of your marketing channels.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Create Campaign</h2>
            <form action={createCampaign} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Campaign Name</label>
                <input type="text" name="name" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black outline-none text-sm text-gray-900" placeholder="e.g. Summer Sale FB Ads" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">UTM Source</label>
                <input type="text" name="utm_source" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black outline-none text-sm text-gray-900" placeholder="e.g. facebook" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">UTM Medium (Optional)</label>
                <input type="text" name="utm_medium" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black outline-none text-sm text-gray-900" placeholder="e.g. cpc" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">UTM Campaign (Optional)</label>
                <input type="text" name="utm_campaign" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black outline-none text-sm text-gray-900" placeholder="e.g. summer_2026" />
              </div>
              <button type="submit" className="w-full bg-black text-white font-medium py-2 rounded-lg hover:bg-gray-800 shadow-sm transition-colors">
                Generate Link
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-white border-b border-gray-200 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-medium">Name & Link</th>
                  <th className="px-4 py-3 font-medium text-center">Clicks</th>
                  <th className="px-4 py-3 font-medium text-center">Orders</th>
                  <th className="px-4 py-3 font-medium text-right">Revenue</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No campaigns created yet.</td>
                  </tr>
                ) : (
                  campaigns.map((c: any) => {
                    const queryParams = new URLSearchParams();
                    queryParams.set('utm_source', c.utm_source);
                    if (c.utm_medium) queryParams.set('utm_medium', c.utm_medium);
                    if (c.utm_campaign) queryParams.set('utm_campaign', c.utm_campaign);
                    const link = `${storeUrl}?${queryParams.toString()}`;

                    return (
                      <tr key={c._id.toString()} className="hover:bg-white transition-colors">
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">{c.name}</div>
                          <div className="text-xs mt-1 font-mono text-gray-500 break-all select-all">{link}</div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-block bg-blue-500/10 text-blue-700 px-2 py-1 rounded-lg font-medium">{c.clicks}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-block bg-green-500/10 text-green-700 px-2 py-1 rounded-lg font-medium">{c.orders}</span>
                        </td>
                        <td className="px-4 py-4 text-right font-medium text-gray-900">
                          ৳{c.revenue}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <form action={deleteCampaign}>
                            <input type="hidden" name="id" value={c._id.toString()} />
                            <button type="submit" className="text-red-400 hover:text-red-300">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
