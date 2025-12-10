export default function HotDealsCard({ 
  title, 
  price, 
  originalPrice, 
  rating, 
  reviews, 
  tags = [], 
  discount, 
  imageUrl,
  category,
}) {
  const calculateSavings = () => {
    if (originalPrice && price) {
      return originalPrice - price;
    }
    return 0;
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] border border-white/20 backdrop-blur-sm flex flex-col h-full min-h-[420px]">
      
      {/* Image */}
      <div className="relative w-full h-48 sm:h-52 overflow-hidden rounded-t-2xl">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Discount + Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount && (
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
              {discount}
            </div>
          )}
          <div className="flex flex-wrap gap-1 min-h-[24px]">
            {tags.slice(0, 1).map((tag, tagIndex) => (
              <span 
                key={tagIndex}
                className="bg-eco-gradient/90 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Wishlist button */}
        <div className="absolute top-3 right-3">
          <button className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow-lg">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Category */}
        {category && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-[#1a4032] px-2 py-1 rounded-full text-xs font-medium shadow-sm">
              {category}
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="relative p-4 space-y-3 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="font-reem font-semibold text-[#1a4032] text-sm sm:text-base leading-tight line-clamp-2 group-hover:text-[#2d5a45] transition-colors min-h-[3.5rem]">
          {title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="flex text-yellow-400 text-sm">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-600 font-medium">{rating}</span>
          </div>
          <span className="text-xs text-gray-500">({reviews} reviews)</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mt-auto">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#1a4032] text-lg">₹{price}</span>
              {originalPrice && (
                <span className="text-gray-400 text-sm line-through">₹{originalPrice}</span>
              )}
            </div>
            {originalPrice && (
              <div className="text-xs text-green-600 font-medium">Save ₹{calculateSavings()}</div>
            )}
          </div>

          {/* Add to cart */}
          <button className="group/btn relative bg-eco-gradient hover:shadow-lg text-white px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
            <div className="relative flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.39.39-.39 1.024 0 1.414L6.414 17M7 13v4a2 2 0 002 2h9m-9-2h9m-9-2v2m9-2v2" />
              </svg>
              <span className="hidden sm:inline">Add</span>
            </div>
          </button>
        </div>

        {/* Bottom info */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-2 text-gray-500">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span>Free shipping</span>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>In stock</span>
          </div>
        </div>
      </div>

      {/* Hover ring */}
      <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-eco-gradient/30 transition-all duration-500 pointer-events-none"></div>
    </div>
  );
}
