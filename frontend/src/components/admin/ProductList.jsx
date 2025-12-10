"use client";

import { useState, useEffect } from "react";
import adminService from "@/services/adminService";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTopProducts();
  }, []);

  const fetchTopProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await adminService.getTopProducts({
        limit: 4,
        period: "month"
      });

      setProducts(result || []);
    } catch (error) {
      console.error('Failed to fetch top products:', error);
      setError(error.message);
      // Use fallback mock data
      setProducts([
        { name: "Bamboo Spoons", orders: 2345, likes: 2223, image: "/spoons.png" },
        { name: "Wooden Baskets", orders: 1890, likes: 1856, image: "/category1.png" },
        { name: "Jute Bags", orders: 1654, likes: 1423, image: "/category1.png" },
        { name: "Eco-friendly Plates", orders: 1432, likes: 1289, image: "/spoons.png" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-4 p-2">
            <div className="w-4 h-4 bg-gray-300 rounded animate-pulse" />
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-300 rounded animate-pulse mb-2" />
              <div className="flex items-center gap-4">
                <div className="h-3 bg-gray-300 rounded animate-pulse w-16" />
                <div className="h-3 bg-gray-300 rounded animate-pulse w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-gray-500 py-4">
        Failed to load top products
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product, index) => (
        <div key={index} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{product.name}</p>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-sm text-gray-600">{product.orders || 0} orders</span>
              <span className="text-sm text-gray-600">{product.likes || 0} likes</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
