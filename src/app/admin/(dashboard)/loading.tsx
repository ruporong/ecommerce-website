export default function AdminLoading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 bg-gray-200 rounded-md w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded-md w-72"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="flex items-baseline gap-3">
              <div className="h-8 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded-full w-12"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart Skeleton */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-6">
            <div className="h-5 bg-gray-200 rounded w-36"></div>
            <div className="h-8 bg-gray-200 rounded w-28"></div>
          </div>
          
          <div className="flex h-64 mt-4">
            <div className="w-10 flex flex-col justify-between pb-8 pr-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-3 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
            
            <div className="flex-1 relative flex items-end justify-around px-2 pb-8">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="w-8 sm:w-12 bg-gray-200 rounded-t-md" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders List Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-6">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          
          <div className="space-y-6 mt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded-full w-14"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
