"use client";

export default function QuickAction({ title, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:shadow-md transition-shadow"
    >
      <h3 className="text-sm font-semibold text-gray-900 opacity-70">{title}</h3>
    </button>
  );
}
