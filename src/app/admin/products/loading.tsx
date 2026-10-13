export default function ProductsLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="h-8 bg-gray-200 rounded-md w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded-md w-64"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-md w-36"></div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-12 bg-gray-50 border-b border-gray-200"></div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 w-1/2">
                <div className="h-12 w-12 bg-gray-200 rounded-md flex-shrink-0"></div>
                <div className="space-y-2 w-full">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
