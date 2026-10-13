export default function ExpensesLoading() {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2"></div>
          <div className="h-4 w-64 bg-gray-100 rounded"></div>
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></th>
                <th className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></th>
                <th className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></th>
                <th className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded"></div></th>
                <th className="px-6 py-4 text-right"><div className="h-4 w-16 bg-gray-200 rounded ml-auto"></div></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg shrink-0"></div>
                      <div>
                        <div className="h-4 w-40 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 w-24 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-24 bg-gray-100 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-16 bg-gray-100 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-20 bg-gray-100 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <div className="h-7 w-7 bg-gray-100 rounded"></div>
                      <div className="h-7 w-7 bg-gray-100 rounded"></div>
                      <div className="h-7 w-7 bg-gray-100 rounded"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
