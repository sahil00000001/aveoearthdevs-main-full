import React, { useState, useEffect } from 'react';
import ProductTableHeader from './ProductTableHeader';
import ProductRow from './ProductRow';
import productsService from '../../../services/productsService';
import supplierAnalyticsService from '../../../services/supplierAnalyticsService';

export default function ProductsTable({ refreshTrigger }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 0
  });

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, refreshTrigger]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      console.log('Fetching products with params:', { page: pagination.page, page_size: pagination.page_size });
      
      const result = await productsService.getSupplierProducts({
        page: pagination.page,
        page_size: pagination.page_size
      });
      
      console.log('Products fetch result:', result);
      
      // Fetch inventory data for each product
      const productsWithInventory = await Promise.all(
        (result.items || []).map(async (product) => {
          try {
            const inventoryData = await supplierAnalyticsService.getProductInventory(product.id);
            return {
              ...product,
              inventory: inventoryData && Array.isArray(inventoryData) ? inventoryData : [inventoryData].filter(Boolean)
            };
          } catch (error) {
            console.warn(`Failed to fetch inventory for product ${product.id}:`, error);
            return {
              ...product,
              inventory: [] // Empty inventory if fetch fails
            };
          }
        })
      );
      
      setProducts(productsWithInventory);
      setPagination(prev => ({
        ...prev,
        total: result.total || 0,
        total_pages: result.total_pages || 0
      }));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price || 0);
  };

  const getStatusBadge = (status, approvalStatus) => {
    if (approvalStatus === 'pending') {
      return { text: 'Pending Review', color: '#fbbf24' };
    } else if (approvalStatus === 'rejected') {
      return { text: 'Rejected', color: '#ef4444' };
    } else if (status === 'active') {
      return { text: 'Active', color: '#10b981' };
    } else if (status === 'inactive') {
      return { text: 'Inactive', color: '#6b7280' };
    } else {
      return { text: 'Draft', color: '#9ca3af' };
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="bg-white rounded-[14px] border border-[#c6c6c6] overflow-hidden">
        <ProductTableHeader />
        <div className="p-4 sm:p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-16 sm:w-20 h-3 sm:h-4 bg-gray-200 rounded"></div>
                <div className="w-12 sm:w-16 h-3 sm:h-4 bg-gray-200 rounded"></div>
                <div className="w-16 sm:w-20 h-4 sm:h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-[14px] border border-[#c6c6c6] p-8 text-center">
        <p className="text-red-500">Failed to load products: {error}</p>
        <button 
          onClick={fetchProducts}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[14px] border border-[#c6c6c6] p-4 sm:p-6">
      {/* Table Header Info */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6 gap-2">
        <div>
          <h3 className="text-[14px] sm:text-[16px] font-inter font-semibold text-black mb-1 sm:mb-2">
            Product Information
          </h3>
          <p className="text-[13px] sm:text-[15px] font-inter font-medium text-[#909090]">
            Information about stocks and restocking
          </p>
        </div>

        {/* Pagination Info */}
        <div className="bg-[#fcfdfd] border border-[#818181] rounded-[4px] px-3 py-2 flex items-center gap-2 self-start">
          <span className="text-[12px] text-[rgba(0,0,0,0.4)] font-reem-kufi">
            Page {pagination.page} of {pagination.total_pages}
          </span>
        </div>
      </div>
      
      {/* Table */}
      <div className="space-y-3">
        <ProductTableHeader />
        {products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          products.map((product) => {
            const statusBadge = getStatusBadge(product.status, product.approval_status);
            const primaryImage = product.images?.find(img => img.is_primary)?.url || 
                               product.images?.[0]?.url || 
                               '/placeholder-product.jpg';
            
            // Transform product data to match ProductRow expectations
            const transformedProduct = {
              id: product.id,
              name: product.name,
              vendor: 'Your Store', // Since this is supplier's own products
              description: product.short_description || product.description || 'No description',
              category: product.category?.name || 'Uncategorized',
              price: formatPrice(product.price),
              stock: product.inventory?.[0]?.available_quantity || 0,
              status: product.status, // Pass the actual status
              visibility: product.visibility || 'visible', // Pass visibility status, default to visible
              statusText: statusBadge.text, // Display text
              statusColor: statusBadge.color,
              image: primaryImage,
              sku: product.sku,
              inventory: product.inventory // Pass inventory data for stock display
            };
            
            return <ProductRow key={product.id} product={transformedProduct} onProductUpdated={fetchProducts} />;
          })
        )}
      </div>
      
      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button 
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <span className="px-3 py-1 text-sm text-gray-600">
            Page {pagination.page} of {pagination.total_pages}
          </span>
          
          <button 
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.total_pages}
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
