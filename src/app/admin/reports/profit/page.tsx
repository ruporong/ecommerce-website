
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Expense from '@/models/Expense';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

export default async function Page() {
  await connectToDatabase();
  
  // Note: Since Order items are stored as a concatenated string (e.g. "1x Dress, 2x Shirt") and not an array,
  // we use a regex fallback to extract quantities and match them to existing products to estimate COGS.
  // Historical cost_price is not stored in Orders, so this relies on current Product cost_price.

  const sales = await Order.find({ status: { $in: ['delivered', 'completed'] } }).lean() as any[];
  const expenses = await Expense.find().lean() as any[];
  const products = await Product.find().lean() as any[];

  let cogs = 0;
  
  // Parse order strings to estimate COGS
  sales.forEach(order => {
    if (order.product_name) {
      const parts = order.product_name.split(',');
      parts.forEach((p: string) => {
        const match = p.match(/^\s*(\d+)x\s+(.+?)(?:\s+\[.*?\])?$/);
        if (match) {
          const qty = parseInt(match[1]);
          const name = match[2].trim();
          const product = products.find(pr => pr.name === name);
          if (product && product.cost_price) {
            cogs += (qty * product.cost_price);
          }
        }
      });
    }
  });

  const revenue = sales.reduce((sum, s) => sum + (s.total_price || 0), 0);
  const grossProfit = revenue - cogs;
  const operatingExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = grossProfit - operatingExpenses;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Profit & Loss Report</h1>
        <p className="text-sm text-zinc-500 mt-1">Calculated net profit based on sales minus COGS (Cost of Goods Sold) and expenses.</p>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-700">
          <strong>Note:</strong> COGS is calculated by parsing order strings and multiplying by the <em>current</em> product cost_price. Historical cost data is not stored per order item in the database, so older profits may reflect recent cost changes.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">Revenue (Successful Sales)</h3>
          <p className="text-2xl font-semibold text-green-600 mt-2">৳ {revenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">COGS (Cost of Goods Sold)</h3>
          <p className="text-2xl font-semibold text-orange-600 mt-2">৳ {cogs.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">Operating Expenses</h3>
          <p className="text-2xl font-semibold text-red-600 mt-2">৳ {operatingExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm bg-zinc-50">
          <h3 className="text-sm font-medium text-zinc-500">Net Profit / Loss</h3>
          <p className={`text-2xl font-semibold mt-2 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ৳ {netProfit.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
