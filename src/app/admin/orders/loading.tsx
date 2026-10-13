export default function OrdersLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <div className="h-8 bg-gray-200 rounded-md w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded-md w-64"></div>
        </div>
        <div className="flex items-center gap-3">
          {/* Search Skeleton */}
          <div className="h-10 w-64 bg-gray-200 rounded-lg"></div>
          {/* Export CSV Skeleton */}
          <div className="h-10 w-28 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
      
      {/* Table Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            {/* Thead */}
            <thead className="bg-white border-b border-gray-200">
              <tr>
                {/* 8 Columns matching the real table headers approximately */}
                <th className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-16"></div></th>
                <th className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-20"></div></th>
                <th className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-24"></div></th>
                <th className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div></th>
                <th className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div></th>
                <th className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div></th>
                <th className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div></th>
                <th className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></th>
              </tr>
            </thead>
            {/* Tbody */}
            <tbody className="divide-y divide-gray-100 bg-white">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i}>
                  {/* Order ID */}
                  <td className="px-6 py-5 align-top">
                    <div className="h-5 bg-gray-200 rounded w-24 mb-1"></div>
                  </td>
                  {/* Customer */}
                  <td className="px-6 py-5 align-top">
                    <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-5 bg-gray-100 rounded-full w-24"></div>
                  </td>
                  {/* Product */}
                  <td className="px-6 py-5 align-top max-w-[250px]">
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </td>
                  {/* Source */}
                  <td className="px-6 py-5 align-top text-center">
                    <div className="h-5 bg-gray-100 rounded-full w-16 mx-auto"></div>
                  </td>
                  {/* Date */}
                  <td className="px-6 py-5 align-top text-center">
                    <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                  </td>
                  {/* Status */}
                  <td className="px-6 py-5 align-top text-center">
                    <div className="h-8 bg-gray-100 rounded-md w-28 mx-auto"></div>
                  </td>
                  {/* Courier */}
                  <td className="px-6 py-5 align-top text-center">
                    <div className="h-8 bg-gray-200 rounded-md w-32 mx-auto"></div>
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-5 align-top text-right">
                    <div className="flex justify-end gap-3">
                      <div className="h-8 w-8 bg-gray-100 rounded-full"></div>
                      <div className="h-8 w-8 bg-gray-100 rounded-full"></div>
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
