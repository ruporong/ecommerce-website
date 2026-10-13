export default function Loading() {
  return (
    <div className="p-6 md:p-10 w-full space-y-8 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-xl w-40"></div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="w-full h-12 bg-gray-100 border-b border-gray-200"></div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-6">
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-48"></div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded-md w-16"></div>
              </div>
              <div className="flex justify-end gap-2">
                <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
                <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
                <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
