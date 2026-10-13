
import connectToDatabase from '@/lib/mongodb';
import Purchase from '@/models/Purchase';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function Page() {
  await connectToDatabase();
  const purchases = await Purchase.find().sort({ createdAt: -1 }).populate('supplier').lean() as any[];
  
  const totalAmount = purchases.reduce((sum, p) => sum + (p.total_amount || 0), 0);
  const totalPaid = purchases.reduce((sum, p) => sum + (p.paid_amount || 0), 0);
  const outstanding = totalAmount - totalPaid;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Purchase Report</h1>
        <p className="text-sm text-zinc-500 mt-1">History of product purchases from suppliers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">Total Purchases</h3>
          <p className="text-2xl font-semibold text-zinc-900 mt-2">{purchases.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">Total Amount</h3>
          <p className="text-2xl font-semibold text-zinc-900 mt-2">৳ {totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">Total Paid</h3>
          <p className="text-2xl font-semibold text-green-600 mt-2">৳ {totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">Outstanding</h3>
          <p className="text-2xl font-semibold text-orange-600 mt-2">৳ {outstanding.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Invoice No</th>
                <th className="px-6 py-3 font-medium">Supplier</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {purchases.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No data available.</td></tr>
              ) : purchases.map((p) => (
                <tr key={p._id.toString()}>
                  <td className="px-6 py-3">{format(new Date(p.purchase_date || p.createdAt), 'dd MMM yyyy')}</td>
                  <td className="px-6 py-3 font-medium">{p.purchase_no || p._id.toString().substring(0,8)}</td>
                  <td className="px-6 py-3">{p.supplier?.name || 'Unknown'}</td>
                  <td className="px-6 py-3 text-right">৳ {p.total_amount?.toLocaleString()}</td>
                  <td className="px-6 py-3 capitalize">{p.payment_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
