"use client";

const FilterIcon = () => (
  <svg width="20" height="17" viewBox="0 0 20 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M2 4.5H18M2 4.5C2 3.11929 3.11929 2 4.5 2C5.88071 2 7 3.11929 7 4.5M2 4.5C2 5.88071 3.11929 7 4.5 7C5.88071 7 7 5.88071 7 4.5M18 4.5C18 3.11929 16.8807 2 15.5 2C14.1193 2 13 3.11929 13 4.5M18 4.5C18 5.88071 16.8807 7 15.5 7C14.1193 7 13 5.88071 13 4.5M7 4.5H13M2 12.5H18M2 12.5C2 11.1193 3.11929 10 4.5 10C5.88071 10 7 11.1193 7 12.5M2 12.5C2 13.8807 3.11929 15 4.5 15C5.88071 15 7 13.8807 7 12.5M18 12.5C18 11.1193 16.8807 10 15.5 10C14.1193 10 13 11.1193 13 12.5M18 12.5C18 13.8807 16.8807 15 15.5 15C14.1193 15 13 13.8807 13 12.5M7 12.5H13"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M3.5 5.25L7 8.75L10.5 5.25" 
      stroke="#4d4d4d" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export default function ExploreHeader({ sortBy, onSortChange, onToggleFilters, resultsCount }) {
  const sortOptions = [
    { value: "latest", label: "Latest" },
    { value: "price_low_high", label: "Price: Low to High" },
    { value: "price_high_low", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
    { value: "popular", label: "Most Popular" }
  ];

  return (
    <div className="border-b border-gray-200 px-4 py-3 mx-4 my-4"> {/* Reduced padding */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"> {/* Reduced gap */}
        
        {/* Filter Button - Mobile and Tablet */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleFilters}
            className="lg:hidden bg-[#272727] hover:bg-[#1a1a1a] text-white px-6 py-2.5 rounded-full font-poppins font-semibold text-[14px] flex items-center gap-2 transition-colors"
          >
            <span>Filter</span>
            <FilterIcon />
          </button>

          {/* Desktop Filter Button */}
          <button
            onClick={onToggleFilters}
            className="hidden lg:flex bg-[#272727] hover:bg-[#1a1a1a] text-white px-8 py-3.5 rounded-full font-poppins font-semibold text-[14px] items-center gap-3 transition-colors"
          >
            <span>Filter</span>
            <FilterIcon />
          </button>
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2">
          <span className="font-poppins text-[14px] text-gray-600">Sort by:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none border border-[#272727] rounded px-4 py-2.5 pr-10 font-poppins text-[14px] text-[#4d4d4d] bg-white focus:outline-none focus:ring-2 focus:ring-[#1a4032] cursor-pointer min-w-[140px]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDownIcon />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-right">
          <span className="font-poppins text-[16px]">
            <span className="font-semibold text-[#1a1a1a]">{resultsCount}</span>
            <span className="text-[#1a1a1a]"> </span>
            <span className="text-[#666666]">Results Found</span>
          </span>
        </div>
      </div>
    </div>
  );
}
