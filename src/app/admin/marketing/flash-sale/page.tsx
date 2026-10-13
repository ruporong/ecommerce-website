export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import FlashSale from '@/models/FlashSale';
import { revalidatePath } from 'next/cache';

async function createOrUpdateFlashSale(formData: FormData) {
  'use server';
  await connectToDatabase();
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const start_time = formData.get('start_time') as string;
  const end_time = formData.get('end_time') as string;
  const discount_percentage = parseInt(formData.get('discount_percentage') as string) || 0;
  const is_active = formData.get('is_active') === 'on';

  if (id) {
    await FlashSale.findByIdAndUpdate(id, {
      title, start_time: new Date(start_time), end_time: new Date(end_time), discount_percentage, is_active
    });
  } else {
    // Only allow one active flash sale at a time
    if (is_active) {
      await FlashSale.updateMany({}, { is_active: false });
    }
    await FlashSale.create({
      title, start_time: new Date(start_time), end_time: new Date(end_time), discount_percentage, is_active
    });
  }

  revalidatePath('/admin/marketing/flash-sale');
}

async function deleteFlashSale(formData: FormData) {
  'use server';
  await connectToDatabase();
  const id = formData.get('id') as string;
  await FlashSale.findByIdAndDelete(id);
  revalidatePath('/admin/marketing/flash-sale');
}

export default async function FlashSalePage() {
  await connectToDatabase();
  const flashSales = await FlashSale.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flash Sale Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Configure global flash sales and countdown banners.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Flash Sale</h2>
            <form action={createOrUpdateFlashSale} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Title (Displayed on Banner)</label>
                <input type="text" name="title" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black outline-none text-sm text-gray-900" placeholder="e.g. Eid Mega Flash Sale" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Discount Percentage (Visual Only)</label>
                <input type="number" name="discount_percentage" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black outline-none text-sm text-gray-900" placeholder="e.g. 50" min="1" max="99" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Start Time</label>
                  <input type="datetime-local" name="start_time" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black outline-none text-sm text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">End Time</label>
                  <input type="datetime-local" name="end_time" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black outline-none text-sm text-gray-900" />
                </div>
              </div>
              <label className="flex items-center gap-3 py-2">
                <input type="checkbox" name="is_active" className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black bg-white" />
                <span className="text-gray-900">Active (Overrides others)</span>
              </label>
              <button type="submit" className="w-full bg-black text-white font-medium py-2 rounded-lg hover:bg-gray-800 shadow-sm transition-colors">
                Save Flash Sale
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-white border-b border-gray-200 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Discount</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium text-center">Status</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {flashSales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No flash sales created.</td>
                  </tr>
                ) : (
                  flashSales.map((fs: any) => (
                    <tr key={fs._id.toString()} className="hover:bg-white transition-colors">
                      <td className="px-4 py-4 font-medium text-gray-900">{fs.title}</td>
                      <td className="px-4 py-4">UP TO {fs.discount_percentage}% OFF</td>
                      <td className="px-4 py-4">
                        <div className="text-xs">{new Date(fs.start_time).toLocaleString()}</div>
                        <div className="text-xs text-gray-500">to {new Date(fs.end_time).toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {fs.is_active ? (
                          <span className="inline-block bg-green-500/10 text-green-700 px-2 py-1 rounded-lg text-xs font-medium">Active</span>
                        ) : (
                          <span className="inline-block bg-gray-500/10 text-gray-500 px-2 py-1 rounded-lg text-xs font-medium">Inactive</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <form action={deleteFlashSale}>
                          <input type="hidden" name="id" value={fs._id.toString()} />
                          <button type="submit" className="text-red-400 hover:text-red-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
