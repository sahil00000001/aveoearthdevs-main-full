// Search Icon SVG
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Categories Icon SVG
const CategoriesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7H21M3 12H21M3 17H21" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 3V7M9 12V17M9 17V21" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function OrdersSearch() {
  return (
    <div className="bg-white rounded-[14px] border border-[#c6c6c6] p-4 sm:p-7 mb-4 sm:mb-6">
      <h3 className="font-inter font-semibold text-[14px] sm:text-[16px] text-black mb-3 sm:mb-4">
        Search Orders
      </h3>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="flex-1 bg-[#f5f6fa] rounded-[14px] border-[0.6px] border-[#bbbbbb] px-4 py-3 flex items-center gap-3">
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search orders..."
            className="bg-transparent text-[14px] font-nunito text-[#202224] opacity-50 outline-none flex-1 min-w-0"
          />
        </div>

        {/* Categories Filter */}
        <div className="bg-[#f5f6fa] rounded-[14px] border-[0.6px] border-[#bbbbbb] px-4 py-3 flex items-center gap-3 w-full sm:min-w-[150px] flex-shrink-0">
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            <CategoriesIcon />
          </div>
          <span className="text-[14px] font-nunito text-[#202224] opacity-50 flex-1 min-w-0">Categories</span>
        </div>
      </div>
    </div>
  );
}
