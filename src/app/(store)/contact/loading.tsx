export default function ContactLoading() {
  return (
    <main className="min-h-screen bg-[#F9F9F9] py-16 md:py-24 animate-pulse">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Header Skeleton */}
        <div className="text-center mb-16 flex flex-col items-center">
          <div className="h-12 w-64 bg-gray-200 rounded-xl mb-4"></div>
          <div className="h-5 w-96 max-w-full bg-gray-200 rounded-lg"></div>
        </div>

        {/* Card Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          
          {/* Left Info Column */}
          <div className="lg:col-span-5 bg-neutral-900 p-8 md:p-12 lg:p-16 flex flex-col justify-between space-y-8">
            <div>
              <div className="h-8 w-44 bg-neutral-800 rounded-lg mb-4"></div>
              <div className="h-4 w-64 bg-neutral-800 rounded mb-10"></div>
              
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-neutral-800 shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-16 bg-neutral-800 rounded"></div>
                    <div className="h-4 w-48 bg-neutral-800 rounded"></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-neutral-800 shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-16 bg-neutral-800 rounded"></div>
                    <div className="h-4 w-40 bg-neutral-800 rounded"></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-neutral-800 shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-16 bg-neutral-800 rounded"></div>
                    <div className="h-4 w-36 bg-neutral-800 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7 p-8 md:p-12 lg:p-16 space-y-6">
            <div className="h-8 w-48 bg-gray-200 rounded-lg mb-6"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-100 rounded-xl"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-100 rounded-xl"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-3 w-20 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-100 rounded-xl"></div>
            </div>

            <div className="space-y-2">
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-100 rounded-xl"></div>
            </div>

            <div className="h-12 w-48 bg-gray-200 rounded-xl mt-6"></div>
          </div>

        </div>
      </div>
    </main>
  );
}
