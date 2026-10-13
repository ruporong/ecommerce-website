export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import AbandonedCart from '@/models/AbandonedCart';

export default async function AbandonedCartPage() {
  await connectToDatabase();
  const carts = await AbandonedCart.find().sort({ last_updated: -1 }).limit(100).lean();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Abandoned Carts</h1>
          <p className="text-gray-500 text-sm mt-1">View carts that were left without checking out. (Push notifications are sent automatically if enabled)</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-white border-b border-gray-200 shadow-sm">
              <tr>
                <th className="px-4 py-3 font-medium">Last Updated</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Push Notification Target</th>
                <th className="px-4 py-3 font-medium text-center">Notified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {carts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No abandoned carts found.</td>
                </tr>
              ) : (
                carts.map((cart: any) => (
                  <tr key={cart._id.toString()} className="hover:bg-white transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      {new Date(cart.last_updated).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        {cart.items.map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-gray-100 flex items-center justify-center rounded text-xs text-gray-800 font-medium">{item.quantity}</span>
                            <span className="truncate max-w-[200px]" title={item.name}>{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-gray-500 truncate max-w-[150px]" title={cart.fcm_token || 'No Token'}>
                      {cart.fcm_token ? '✅ Opted In' : '❌ Opted Out'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {cart.notified ? (
                        <span className="inline-block bg-green-500/10 text-green-700 px-2 py-1 rounded-lg text-xs font-medium">Yes</span>
                      ) : (
                        <span className="inline-block bg-yellow-500/10 text-amber-700 px-2 py-1 rounded-lg text-xs font-medium">Pending</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
