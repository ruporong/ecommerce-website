export default function ProductDetailLoading() {
  return (
    <section className="product-details-component w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      
      {/* Breadcrumb Skeleton */}
      <div className="flex text-sm text-gray-500 mb-8 lg:pt-20 pt-10">
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      {/* Main Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
        
        {/* LEFT: PRODUCT GALLERY Skeleton */}
        <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6 animate-pulse">
          {/* Thumbnails */}
          <div className="flex lg:flex-col gap-3 overflow-hidden shrink-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-24 lg:w-24 lg:h-32 bg-gray-200 rounded-2xl shrink-0"></div>
            ))}
          </div>

          {/* Main Image */}
          <div className="relative w-full aspect-[4/5] bg-gray-200 rounded-2xl overflow-hidden"></div>
        </div>

        {/* RIGHT: PRODUCT INFO Skeleton */}
        <div className="flex flex-col animate-pulse pt-2">
          {/* Category */}
          <div className="h-3 bg-gray-200 rounded w-24 mb-4"></div>
          {/* Title */}
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
          {/* Reviews/Rating */}
          <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
          {/* Price */}
          <div className="h-8 bg-gray-200 rounded w-24 mb-8"></div>
          
          {/* Description lines */}
          <div className="space-y-3 mb-10">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>

          {/* Color Option */}
          <div className="mb-6">
            <div className="h-4 bg-gray-200 rounded w-16 mb-3"></div>
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-12 h-12 bg-gray-200 rounded-full border border-gray-100"></div>
              ))}
            </div>
          </div>

          {/* Size Option */}
          <div className="mb-8">
            <div className="flex justify-between mb-3">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-20 h-12 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex gap-4">
              <div className="w-32 h-14 bg-gray-200 rounded-2xl shrink-0"></div>
              <div className="flex-1 h-14 bg-gray-200 rounded-2xl"></div>
            </div>
            <div className="w-full h-14 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
