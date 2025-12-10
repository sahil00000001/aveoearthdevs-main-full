import React, { useState, useEffect } from 'react';
import supplierAnalyticsService from '../../services/supplierAnalyticsService';

// Icons
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PackageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 8a2 2 0 0 0-1-1.73L12 2 4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L12 22l8-4.27A2 2 0 0 0 21 16V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CategoryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MoreActionsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="5" r="1" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="19" r="1" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

// Stock Update Modal
const StockUpdateModal = ({ isOpen, onClose, product, onUpdate }) => {
  // Try to get quantity from either available_quantity or quantity field
  const getInventoryQuantity = (product) => {
    const inventory = product?.inventory?.[0];
    return inventory?.available_quantity || inventory?.quantity || 0;
  };

  const [quantity, setQuantity] = useState(getInventoryQuantity(product));
  const [lowStockThreshold, setLowStockThreshold] = useState(product?.inventory?.[0]?.low_stock_threshold || 5);
  const [location, setLocation] = useState(product?.inventory?.[0]?.location || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setQuantity(getInventoryQuantity(product));
      setLowStockThreshold(product.inventory?.[0]?.low_stock_threshold || 5);
      setLocation(product.inventory?.[0]?.location || '');
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;

    setLoading(true);
    try {
      await supplierAnalyticsService.updateProductInventory(product.id, {
        quantity: parseInt(quantity),
        low_stock_threshold: parseInt(lowStockThreshold),
        location: location.trim() || null
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update inventory:', error);
      alert('Failed to update inventory: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Update Inventory</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
          <p className="text-sm text-gray-600">SKU: {product.sku}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Stock Quantity
            </label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2f6b4f] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Low Stock Threshold
            </label>
            <input
              type="number"
              min="1"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2f6b4f] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Storage Location (Optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Warehouse A, Section 1"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2f6b4f] focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#2f6b4f] text-white rounded-md hover:bg-[#245a41] transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function InventoryContent({ isCompact = false }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const result = await supplierAnalyticsService.getInventoryOverview({
        page: 1,
        page_size: isCompact ? 6 : 50 // Show fewer items in compact mode
      });
      
      const productsWithInventory = result.items || [];
      
      // Fetch individual inventory data for each product
      const enhancedProducts = await Promise.all(
        productsWithInventory.map(async (product) => {
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
      
      setProducts(enhancedProducts);
    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = (product) => {
    setSelectedProduct(product);
    setShowUpdateModal(true);
  };

  const handleInventoryUpdate = () => {
    fetchInventoryData(); // Refresh data after update
  };

  const getStockStatus = (product) => {
    const inventory = product.inventory?.[0];
    if (!inventory) return { status: 'No Data', color: '#9ca3af' };
    
    // Try both available_quantity and quantity fields
    const available = inventory.available_quantity || inventory.quantity || 0;
    const threshold = inventory.low_stock_threshold || 5;
    
    if (available === 0) {
      return { status: 'Out of Stock', color: '#ef4444' };
    } else if (available <= threshold) {
      return { status: 'Low Stock', color: '#f59e0b' };
    } else {
      return { status: 'In Stock', color: '#10b981' };
    }
  };

  // Helper function to get inventory quantity consistently
  const getInventoryQuantity = (product) => {
    const inventory = product?.inventory?.[0];
    return inventory?.available_quantity || inventory?.quantity || 0;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    const stockStatus = getStockStatus(product);
    return matchesSearch && stockStatus.status.toLowerCase().includes(statusFilter);
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className={isCompact ? "" : "bg-white w-full h-full p-4 sm:p-7 pb-4"}>
        <div className="animate-pulse">
          {!isCompact && <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/4 mb-4"></div>}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-16 sm:w-20 h-3 sm:h-4 bg-gray-200 rounded"></div>
                <div className="w-12 sm:w-16 h-3 sm:h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={isCompact ? "text-center py-4" : "bg-white w-full h-full p-4 sm:p-7 pb-4"}>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Failed to load inventory: {error}</p>
          <button 
            onClick={fetchInventoryData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isCompact) {
    // Compact view for dashboard
    return (
      <div className="space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No products found
          </div>
        ) : (
          filteredProducts.slice(0, 6).map((product) => {
            const stockStatus = getStockStatus(product);
            const inventory = product.inventory?.[0];
            const primaryImage = product.images?.find(img => img.is_primary)?.url || 
                               product.images?.[0]?.url;

            return (
              <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                {/* Product Info */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {primaryImage ? (
                      <img 
                        src={primaryImage} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <PackageIcon />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 truncate">{product.name}</div>
                    <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                  </div>
                </div>

                {/* Stock & Status */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {getInventoryQuantity(product)} units
                    </div>
                    <span 
                      className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                      style={{ 
                        backgroundColor: `${stockStatus.color}20`,
                        color: stockStatus.color 
                      }}
                    >
                      {stockStatus.status}
                    </span>
                  </div>
                  <button
                    onClick={() => handleUpdateStock(product)}
                    className="p-2 text-[#2f6b4f] hover:bg-[#2f6b4f] hover:text-white border border-[#2f6b4f] rounded transition-colors"
                  >
                    <EditIcon />
                  </button>
                </div>
              </div>
            );
          })
        )}
        
        {/* Stock Update Modal for compact view */}
        <StockUpdateModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          product={selectedProduct}
          onUpdate={handleInventoryUpdate}
        />
      </div>
    );
  }

  // Full inventory view
  return (
    <div className="bg-white w-full h-full p-4 sm:p-7 pb-4">
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4 sm:gap-0">
          <div>
            <h1 className="font-poppins font-semibold text-[20px] sm:text-[24px] text-black tracking-[0.3px] mb-2">
              Inventory Management
            </h1>
            <p className="font-poppins text-[14px] sm:text-[16px] text-[#757575] tracking-[0.3px]">
              Manage your product stock levels and inventory
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Total Products: {products.length}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4 sm:mb-6">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f6b4f] focus:border-transparent"
            />
          </div>
          
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FilterIcon className="text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f6b4f] focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="stock">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-[14px] border border-[#c6c6c6] overflow-hidden">
          {/* Table Header - Hidden on Mobile */}
          <div className="hidden sm:grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-700 bg-gray-50 px-4 sm:px-6 py-3 border-b border-gray-200">
            <div className="col-span-4">Product</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Current Stock</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
                {searchTerm || statusFilter !== 'all' ? 'No products match your filters' : 'No products found'}
              </div>
            ) : (
              filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                const inventory = product.inventory?.[0];
                const primaryImage = product.images?.find(img => img.is_primary)?.url || 
                                   product.images?.[0]?.url;

                return (
                  <div key={product.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
                    {/* Mobile Layout */}
                    <div className="block sm:hidden">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {primaryImage ? (
                            <img 
                              src={primaryImage} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <PackageIcon />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm mb-1">{product.name}</div>
                          <div className="text-xs text-gray-500 mb-2">SKU: {product.sku}</div>
                          {product.category && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                              <CategoryIcon />
                              <span>{product.category.name}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(product.price)}
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {getInventoryQuantity(product)} units
                              </div>
                            </div>
                            <span 
                              className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                              style={{ 
                                backgroundColor: `${stockStatus.color}20`,
                                color: stockStatus.color 
                              }}
                            >
                              {stockStatus.status}
                            </span>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => handleUpdateStock(product)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-sm text-[#2f6b4f] hover:bg-[#2f6b4f] hover:text-white border border-[#2f6b4f] rounded transition-colors"
                            >
                              <EditIcon />
                              Update Stock
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
                      {/* Product Info */}
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {primaryImage ? (
                            <img 
                              src={primaryImage} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <PackageIcon />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                          {product.category && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                              <CategoryIcon />
                              <span>{product.category.name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-2">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(product.price)}
                        </div>
                      </div>

                      {/* Stock */}
                      <div className="col-span-2">
                        <div className="text-sm font-medium text-gray-900">
                          {getInventoryQuantity(product)} units
                        </div>
                        <div className="text-xs text-gray-500">
                          Threshold: {inventory?.low_stock_threshold || 5}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <span 
                          className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                          style={{ 
                            backgroundColor: `${stockStatus.color}20`,
                            color: stockStatus.color 
                          }}
                        >
                          {stockStatus.status}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2">
                        <button
                          onClick={() => handleUpdateStock(product)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm text-[#2f6b4f] hover:bg-[#2f6b4f] hover:text-white border border-[#2f6b4f] rounded transition-colors"
                        >
                          <EditIcon />
                          Update Stock
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Stock Update Modal - Available for both modes */}
      <StockUpdateModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        product={selectedProduct}
        onUpdate={handleInventoryUpdate}
      />
    </div>
  );
}
