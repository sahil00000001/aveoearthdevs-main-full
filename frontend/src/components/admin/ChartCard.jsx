"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function ChartCard({ title, children, hasDropdown = false, dropdownValue = "This Month" }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {hasDropdown && (
          <div className="bg-gray-100 rounded-md px-3 py-1 flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700">{dropdownValue}</span>
            <ChevronDownIcon className="h-3 w-3 text-gray-700" />
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
