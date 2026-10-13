export default function ReviewsLoading() {
  return (
    <div className="w-full animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="h-7 bg-gray-200 rounded-md w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded-md w-72"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-lg w-40"></div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-2 sm:px-6">
          <div className="flex gap-6">
            <div className="h-14 bg-gray-200 rounded-sm w-32 mt-2"></div>
            <div className="h-14 bg-gray-100 rounded-sm w-24 mt-2"></div>
          </div>
        </div>

        <div className="p-2 sm:p-6 bg-gray-50/30">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                </div>
                
                <div className="space-y-2 mb-5">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
                
                <div className="flex justify-between items-end border-t border-gray-50 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-10 bg-gray-200 rounded shrink-0"></div>
                    <div>
                      <div className="h-2.5 bg-gray-200 rounded w-20 mb-1.5"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="w-16 h-8 bg-gray-200 rounded-md"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
