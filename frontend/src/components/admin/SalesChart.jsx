"use client";

import { useState, useEffect } from "react";
import TabSelector from "./TabSelector";
import adminService from "@/services/adminService";

export default function SalesChart() {
  const [salesPeriod, setSalesPeriod] = useState("Today");
  const [selectedType, setSelectedType] = useState("sales");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const salesTypes = [
    { label: "Sales", value: "sales" },
    { label: "Orders", value: "orders" },
    { label: "Ad Revenue", value: "ad_revenue" }
  ];

  useEffect(() => {
    fetchChartData();
  }, [salesPeriod, selectedType]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await adminService.getSalesChartData({
        period: salesPeriod.toLowerCase(),
        type: selectedType
      });

      setChartData(result.data || []);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      setError(error.message);
      // Use fallback mock data
      setChartData([
        { day: "10", value: 20 },
        { day: "11", value: 45 },
        { day: "12", value: 30 },
        { day: "13", value: 65 },
        { day: "14", value: 50 },
        { day: "15", value: 85 },
        { day: "16", value: 90 },
        { day: "17", value: 75 },
        { day: "18", value: 60 },
        { day: "19", value: 40 },
        { day: "20", value: 55 },
        { day: "21", value: 70 },
        { day: "22", value: 80 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Mock chart data - fallback if API fails
  const fallbackData = [
    { day: "10", value: 20 },
    { day: "11", value: 45 },
    { day: "12", value: 30 },
    { day: "13", value: 65 },
    { day: "14", value: 50 },
    { day: "15", value: 85 },
    { day: "16", value: 90 }, // Current day - highlighted
    { day: "17", value: 75 },
    { day: "18", value: 60 },
    { day: "19", value: 40 },
    { day: "20", value: 55 },
    { day: "21", value: 70 },
    { day: "22", value: 80 },
  ];

  const displayData = chartData.length > 0 ? chartData : fallbackData;
  const maxValue = Math.max(...displayData.map(d => d.value));
  const minValue = Math.min(...displayData.map(d => d.value));
  const range = maxValue - minValue;
  
  return (
    <div className="space-y-6">
      {/* Chart Type Selector */}
      <TabSelector 
        options={salesTypes}
        selected={selectedType}
        onSelect={setSelectedType}
      />
      
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-32 flex flex-col justify-between text-xs text-gray-400 pr-4">
          <span>100K</span>
          <span>80K</span>
          <span>60K</span>
          <span>40K</span>
          <span>20K</span>
        </div>
        
        {/* Chart area */}
        <div className="ml-12 relative h-32">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full h-px bg-gray-200" />
            ))}
          </div>
          
          {/* Chart background area */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2f6b4f" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#2f6b4f" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            
            {/* Area under the curve */}
            <path
              d={`M 0% 100% L ${displayData.map((d, i) => 
                `${(i / (displayData.length - 1)) * 100}% ${100 - ((d.value - minValue) / range) * 100}%`
              ).join(' L ')} L 100% 100% Z`}
              fill="url(#areaGradient)"
            />
            
            {/* Main line */}
            <path
              d={`M ${displayData.map((d, i) => 
                `${(i / (displayData.length - 1)) * 100}% ${100 - ((d.value - minValue) / range) * 100}%`
              ).join(' L ')}`}
              fill="none"
              stroke="#2f6b4f"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
            
            {/* Data points */}
            {displayData.map((d, i) => (
              <circle
                key={i}
                cx={`${(i / (displayData.length - 1)) * 100}%`}
                cy={`${100 - ((d.value - minValue) / range) * 100}%`}
                r="3"
                fill={d.day === "16" ? "#2f6b4f" : "#2f6b4f"}
                className="drop-shadow-sm"
              />
            ))}
          </svg>
          
          {/* Current value callout */}
          <div className="absolute bg-[#2f6b4f] text-white px-2 py-1 rounded text-xs shadow-lg"
               style={{ left: "61.5%", top: "10%" }}>
            <div className="flex items-center">
              83,234
              <div className="ml-1 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-[#2f6b4f] transform translate-y-1"></div>
            </div>
          </div>
        </div>
        
        {/* X-axis labels */}
        <div className="ml-12 mt-4 flex justify-between text-xs text-gray-400">
          {displayData.map((d) => (
            <span 
              key={d.day} 
              className={d.day === "16" ? "font-bold text-blue-600" : ""}
            >
              {d.day}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
