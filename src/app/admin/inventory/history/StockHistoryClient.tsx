'use client';

export default function StockHistoryClient({ history }: { history: any[] }) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Stock History</h1>
        <p className="text-sm text-gray-500 mt-1">Recent inventory transactions and movements</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-center">Change</th>
                <th className="px-6 py-4 text-center">Previous ➔ New</th>
                <th className="px-6 py-4">Source & Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.map(item => {
                const isPositive = item.type === 'in' || (item.type === 'adjustment' && item.new_stock > item.previous_stock);
                const isNegative = item.type === 'out' || (item.type === 'adjustment' && item.new_stock < item.previous_stock);
                const changeColor = isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500';
                const changeSign = isPositive ? '+' : isNegative ? '-' : '';
                
                return (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {item.product_id ? (
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden shrink-0">
                             {item.product_id.mainImages?.[0] && <img src={item.product_id.mainImages[0]} alt="" className="w-full h-full object-cover" />}
                           </div>
                           <div>
                             <p className="font-bold text-gray-900 truncate max-w-[200px]" title={item.product_id.name}>{item.product_id.name}</p>
                             {item.variant_id && <p className="text-xs text-gray-500">{item.variant_id}</p>}
                           </div>
                         </div>
                      ) : (
                         <span className="text-gray-400 italic">Deleted Product</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-1 bg-gray-100 rounded-md text-gray-700">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${changeColor}`}>
                        {changeSign}{item.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500 font-medium">
                      {item.previous_stock} ➔ <span className="text-gray-900">{item.new_stock}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 text-xs uppercase tracking-wider">{item.source}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{item.reason}</p>
                      {item.order_id && <p className="text-blue-600 text-xs mt-0.5 font-medium">{item.order_id}</p>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {history.length === 0 && (
             <div className="text-center py-12 text-gray-500">No history found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
