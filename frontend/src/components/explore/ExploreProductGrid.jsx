"use client";

import Image from "next/image";
import ProductCard from "../ui/ProductCard";

export default function ExploreProductGrid({ products, loading, onProductClick }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 w-2/3 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 w-1/3 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4">
          <svg
            className="w-16 h-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="font-poppins font-semibold text-[18px] text-[#1a1a1a] mb-2">
          No products found
        </h3>
        <p className="font-poppins text-[14px] text-[#666666] max-w-md">
          Try adjusting your filters or search terms to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          productId={product.id}
          imageUrl={product.images?.[0]?.url || '/placeholder-product.jpg'}
          images={product.images || []}
          category={product.category?.name || 'Product'}
          title={product.name}
          description={product.short_description || ''}
          price={product.price}
          originalPrice={product.compare_at_price}
          rating={4.5}
          reviews={0}
          className="w-full"
          inStock={product?.status === 'active' && (product?.available_stock > 0)}
          onClick={() => onProductClick && onProductClick(product)}
        />
      ))}
    </div>
  );
}
