"use client";

export default function TabSelector({ options, selected, onSelect, className = "" }) {
  return (
    <div className={`bg-gray-100 rounded-full p-1 inline-flex ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
            selected === option.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
