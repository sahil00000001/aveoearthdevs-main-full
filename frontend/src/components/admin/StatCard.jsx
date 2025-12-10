"use client";

import { ArrowTrendingUpIcon, ShoppingCartIcon, UsersIcon } from "@heroicons/react/24/outline";

const iconMap = {
  orders: ShoppingCartIcon,
  users: UsersIcon,
  trend: ArrowTrendingUpIcon,
};

export default function StatCard({ 
  title, 
  value, 
  change, 
  changeType = "up", 
  description,
  icon = "orders" 
}) {
  const IconComponent = iconMap[icon] || ShoppingCartIcon;
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 opacity-70">{title}</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className="text-sm mt-2">
              <span className={`${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {changeType === 'up' ? '+' : '-'}{change}
              </span>
              {description && (
                <span className="text-gray-500 ml-1">{description}</span>
              )}
            </p>
          )}
        </div>
        <div className="bg-gray-100 rounded-md p-2">
          <IconComponent className="h-4 w-4 text-gray-600" />
        </div>
      </div>
    </div>
  );
}
