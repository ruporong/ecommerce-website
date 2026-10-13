
import connectToDatabase from '@/lib/mongodb';
import Expense from '@/models/Expense';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function Page() {
  await connectToDatabase();
  const expenses = await Expense.find().sort({ date: -1 }).populate('category').lean() as any[];
  
  const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const thisMonth = expenses.filter(e => new Date(e.date || e.createdAt).getMonth() === new Date().getMonth() && new Date(e.date || e.createdAt).getFullYear() === new Date().getFullYear()).reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Expense Report</h1>
        <p className="text-sm text-zinc-500 mt-1">Breakdown of operational expenses over time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">Total Expenses Count</h3>
          <p className="text-2xl font-semibold text-zinc-900 mt-2">{expenses.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">Total Expense Amount</h3>
          <p className="text-2xl font-semibold text-red-600 mt-2">৳ {totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">This Month</h3>
          <p className="text-2xl font-semibold text-zinc-900 mt-2">৳ {thisMonth.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {expenses.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No data available.</td></tr>
              ) : expenses.map((e) => (
                <tr key={e._id.toString()}>
                  <td className="px-6 py-3">{format(new Date(e.date || e.createdAt), 'dd MMM yyyy')}</td>
                  <td className="px-6 py-3 font-medium">{e.category?.name || 'General'}</td>
                  <td className="px-6 py-3">{e.title || e.description}</td>
                  <td className="px-6 py-3 text-right">৳ {e.amount?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
