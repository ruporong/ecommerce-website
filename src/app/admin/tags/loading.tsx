export default function ListLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <div className="h-8 bg-gray-200 rounded-md w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded-md w-64"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-12 bg-white border-b border-gray-100 flex items-center px-6">
           <div className="h-3 bg-gray-200 rounded w-24"></div>
           <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
           <div className="h-3 bg-gray-200 rounded w-16 ml-auto"></div>
        </div>
        <div className="divide-y divide-gray-100 bg-white">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-5 w-9 bg-gray-200 rounded-full mx-auto"></div>
              <div className="flex gap-2 ml-auto">
                <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
                <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
