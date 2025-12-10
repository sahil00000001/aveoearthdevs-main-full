"use client";

export default function TimeFilter({ selectedPeriod = "Today", onPeriodChange }) {
  const periods = ["Today", "This week", "This Month"];
  
  return (
    <div className="bg-gray-100 rounded-full p-1 inline-flex">
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onPeriodChange?.(period)}
          className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
            selectedPeriod === period
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {period}
        </button>
      ))}
    </div>
  );
}
