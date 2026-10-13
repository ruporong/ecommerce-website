export default function CategoriesLoading() {
  return (
    <div className="w-full pt-2 space-y-6 animate-pulse">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
        <div>
          <div className="h-8 bg-gray-200 rounded-md w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded-md w-80"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-lg w-40"></div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Table Toolbar (Search) */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-end">
          <div className="h-9 bg-gray-200 rounded-md w-64"></div>
        </div>
        
        {/* Table Header */}
        <div className="h-12 bg-white border-b border-gray-100 flex items-center px-6">
           <div className="h-3 bg-gray-200 rounded w-20 flex-1"></div>
           <div className="h-3 bg-gray-200 rounded w-24 flex-1"></div>
           <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
           <div className="h-3 bg-gray-200 rounded w-12 mx-auto ml-8"></div>
           <div className="h-3 bg-gray-200 rounded w-16 ml-auto"></div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100 bg-white">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-6 py-4 flex items-start gap-4">
              
              {/* Category Column (Image + Text) */}
              <div className="flex-1 flex gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg shrink-0"></div>
                <div className="space-y-2 pt-1">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-100 rounded w-16"></div>
                </div>
              </div>

              {/* Sub Categories Column */}
              <div className="flex-1 flex gap-2 pt-1">
                <div className="h-7 w-20 bg-gray-200 rounded-md"></div>
                <div className="h-7 w-16 bg-gray-200 rounded-md"></div>
              </div>

              {/* Show on Home Column */}
              <div className="w-24 flex justify-center pt-2">
                <div className="h-5 w-9 bg-gray-200 rounded-full"></div>
              </div>

              {/* Status Column */}
              <div className="w-24 flex justify-center pt-2">
                <div className="h-5 w-9 bg-gray-200 rounded-full"></div>
              </div>

              {/* Action Column */}
              <div className="w-24 flex justify-end gap-2 pt-1">
                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
              </div>
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
