export default function SettingsLoading() {
  return (
    <div className="w-full space-y-6 pb-20 animate-pulse">
      <div>
        <div className="h-8 bg-gray-200 rounded-md w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded-md w-64"></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="p-6 space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-gray-100 rounded-md w-full"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-gray-100 rounded-md w-full"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-gray-100 rounded-md w-full"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-gray-100 rounded-md w-full"></div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <div className="h-10 bg-gray-200 rounded-md w-24"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
