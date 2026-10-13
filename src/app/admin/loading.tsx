export default function AdminSkeletonLoading() {
  return (
    <div className="w-full p-6 md:p-10 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
          <div className="h-4 bg-gray-100 rounded-lg w-64"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
      </div>

      {/* Grid Skeleton (Works for Cards or Table rows) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Image/Top Area */}
            <div className="h-48 bg-gray-100"></div>
            {/* Content Area */}
            <div className="p-5 space-y-4">
              <div className="h-5 bg-gray-200 rounded-md w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded-md w-1/2"></div>
              <div className="pt-4 border-t border-gray-50 flex justify-between">
                <div className="h-6 bg-gray-100 rounded-md w-16"></div>
                <div className="h-6 bg-gray-200 rounded-md w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
