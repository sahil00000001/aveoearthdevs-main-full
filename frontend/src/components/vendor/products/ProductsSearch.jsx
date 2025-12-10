export default function ProductsSearch() {
  return (
    <div className="bg-white rounded-[14px] border border-[#c6c6c6] p-4 sm:p-6 mb-4 sm:mb-6 h-auto sm:h-[138px]">
      <h2 className="text-[14px] sm:text-[16px] font-inter font-semibold text-black mb-3 sm:mb-4">
        Search Products
      </h2>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="bg-[#f5f6fa] border border-[#bbbbbb] rounded-[14px] px-4 py-3 flex items-center">
            <div className="mr-3 flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-50">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="bg-transparent text-[14px] text-[#202224] placeholder-[#202224] placeholder-opacity-50 outline-none flex-1 font-poppins min-w-0"
            />
          </div>
        </div>

        {/* Categories Filter */}
        <div className="w-full sm:w-[200px] flex-shrink-0">
          <div className="bg-[#f5f6fa] border border-[#bbbbbb] rounded-[14px] px-4 py-3 flex items-center">
            <div className="mr-3 flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-[14px] text-[#202224] opacity-50 font-poppins flex-1 min-w-0">
              Categories
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
