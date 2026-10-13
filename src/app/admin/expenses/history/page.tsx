export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import ExpenseHistory from '@/models/ExpenseHistory';
import Expense from '@/models/Expense';

export default async function ExpenseHistoryPage() {
  await connectToDatabase();
  const history = await ExpenseHistory.find()
    .populate({ path: 'expense_id', select: 'title amount status', model: Expense })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Expense Audit Log</h1>
        <p className="text-sm text-gray-500 mt-1">Complete history of expense approvals, payments, and cancellations</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Expense Title</th>
              <th className="px-6 py-4 text-center">Action</th>
              <th className="px-6 py-4">Notes</th>
              <th className="px-6 py-4 text-right">User</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {history.map((h: any) => (
              <tr key={h._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-gray-500">
                  {new Date(h.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {h.expense_id ? h.expense_id.title : <span className="text-gray-400 italic">Deleted Expense</span>}
                  {h.expense_id && <div className="text-xs text-gray-400 font-normal mt-0.5">৳{h.expense_id.amount.toLocaleString()} • Current: {h.expense_id.status}</div>}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                    h.action === 'created' ? 'bg-gray-100 text-gray-600' :
                    h.action === 'approved' ? 'bg-blue-50 text-blue-700' :
                    h.action === 'paid' ? 'bg-green-50 text-green-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {h.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {h.notes}
                </td>
                <td className="px-6 py-4 text-right text-gray-500 font-medium">
                  {h.created_by}
                </td>
              </tr>
            ))}
            {history.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-gray-500">No history found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
