export default function Loading() {
  return (
    <main className="w-full animate-pulse">
      {/* Hero Skeleton */}
      <section className="relative w-full h-[85vh] min-h-[600px] bg-gray-200"></section>

      {/* Shop by Category Skeleton */}
      <section className="py-20 md:py-32 px-4 md:px-8 max-w-[1920px] mx-auto">
        <div className="text-center mb-16 flex flex-col items-center">
          <div className="h-8 md:h-12 w-64 md:w-96 bg-gray-200 rounded mb-4"></div>
          <div className="h-5 w-48 bg-gray-200 rounded"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="col-span-2 md:col-span-2 md:row-span-2 h-[400px] md:h-[800px] bg-gray-200 rounded-2xl"></div>
          <div className="col-span-1 md:col-span-1 h-[250px] md:h-[388px] bg-gray-200 rounded-2xl"></div>
          <div className="col-span-1 md:col-span-1 h-[250px] md:h-[388px] bg-gray-200 rounded-2xl"></div>
          <div className="col-span-1 md:col-span-1 h-[250px] md:h-[388px] bg-gray-200 rounded-2xl"></div>
          <div className="col-span-1 md:col-span-1 h-[250px] md:h-[388px] bg-gray-200 rounded-2xl"></div>
        </div>
      </section>

      {/* New Arrivals Skeleton */}
      <section className="py-20 md:py-32 px-4 md:px-8 max-w-[1920px] mx-auto bg-white border-y border-gray-100">
        <div className="flex justify-between items-end mb-12">
          <div className="flex flex-col">
            <div className="h-8 md:h-12 w-48 md:w-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-5 w-40 bg-gray-200 rounded"></div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col">
              <div className="aspect-[4/5] bg-gray-200 rounded-2xl mb-4"></div>
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
