import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Link from 'next/link';

import Pagination from '@/components/admin/Pagination';

export const dynamic = 'force-dynamic';

export default async function CustomersPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await connectToDatabase();
  const resolvedParams = await searchParams;
  const page = parseInt((resolvedParams?.page as string) || '1');
  const limit = 20;
  
  const totalCustomers = await User.countDocuments({ role: 'customer' });
  const totalPages = Math.ceil(totalCustomers / limit);
  
  const customers = await User.find({ role: 'customer' }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your store customers.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.length > 0 ? customers.map((c: any) => (
                <tr key={c._id.toString()} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                    {c.image ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                        <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                    )}
                    {c.name}
                  </td>
                  <td className="px-6 py-4">{c.email}</td>
                  <td className="px-6 py-4">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button className="text-gray-400 hover:text-blue-600 font-medium transition-colors">Edit</button>
                    <button className="text-gray-400 hover:text-red-600 font-medium transition-colors">Delete</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {customers.length > 0 && <Pagination totalPages={totalPages} currentPage={page} />}
      </div>
    </div>
  );
}
