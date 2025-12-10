"use client";

import { useState, useEffect } from "react";
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  PowerIcon
} from "@heroicons/react/24/outline";
import adminService from "@/services/adminService";

export default function ProductsScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Data state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0
  });

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState(null); // 'approve' or 'reject'
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, statusFilter, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      if (statusFilter === 'pending') {
        result = await adminService.getPendingProducts({
          page: pagination.page,
          limit: pagination.limit
        });
      } else {
        result = await adminService.getAllProducts({
          page: pagination.page,
          limit: pagination.limit,
          status: statusFilter === 'all' ? undefined : statusFilter,
          category: categoryFilter === 'all' ? undefined : categoryFilter
        });
      }
      
      setProducts(result.items || []);
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

  const openReviewModal = (product, action) => {
    setSelectedProduct(product);
    setReviewAction(action);
    setReviewComment("");
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setSelectedProduct(null);
    setReviewAction(null);
    setReviewComment("");
    setShowReviewModal(false);
  };

  const handleProductReview = async () => {
    if (!selectedProduct || !reviewAction) return;

    try {
      setIsSubmitting(true);
      
      const approved = reviewAction === 'approve';
      const approvalNotes = reviewComment;

      await adminService.reviewProduct(selectedProduct.id, approved, approvalNotes);
      
      // Refresh products list
      await fetchProducts();
      
      // Close modal
      closeReviewModal();
      
    } catch (error) {
      console.error('Failed to review product:', error);
      alert('Failed to review product: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await adminService.deleteProduct(productId);
      await fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product: ' + error.message);
    }
  };

  const handleToggleProductStatus = async (productId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'enable' : 'disable';
    
    if (!confirm(`Are you sure you want to ${action} this product?`)) {
      return;
    }

    try {
      await adminService.updateProductStatus(productId, newStatus);
      await fetchProducts(); // Refresh the list
    } catch (error) {
      console.error(`Failed to ${action} product:`, error);
      alert(`Failed to ${action} product: ` + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Review' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      active: { color: 'bg-green-100 text-green-800', text: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', text: 'Inactive' },
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.supplier?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.supplier?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.supplier?.first_name && product.supplier?.last_name 
                           ? `${product.supplier.first_name} ${product.supplier.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
                           : false);
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-black">Products Management</h1>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-12 rounded-lg mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-gray-200 h-16 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-black">Products Management</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Failed to load products: {error}</p>
          <button 
            onClick={fetchProducts}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-black">Products Management</h1>
        <button 
          onClick={fetchProducts}
          className="bg-[#1a4032] hover:bg-[#0f2319] text-white px-4 py-2 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name, description, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4032] focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4032] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4032] focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="home-kitchen">Home & Kitchen</option>
              <option value="personal-care">Personal Care</option>
              <option value="clothing">Clothing</option>
              <option value="food-beverages">Food & Beverages</option>
              <option value="health-wellness">Health & Wellness</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {product.images && product.images.length > 0 ? (
                            <img 
                              className="h-12 w-12 rounded-lg object-cover" 
                              src={product.images[0].url} 
                              alt={product.name} 
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {product.category?.name || 'Uncategorized'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.supplier?.business_name || 
                         (product.supplier?.first_name && product.supplier?.last_name 
                           ? `${product.supplier.first_name} ${product.supplier.last_name}`.trim()
                           : product.supplier?.email || 'Unknown Supplier')}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {product.supplier_id || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{(product.price || 0).toLocaleString()}
                      </div>
                      {product.original_price && product.original_price > product.price && (
                        <div className="text-sm text-gray-500 line-through">
                          ₹{product.original_price.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.available_quantity || 0} units
                      </div>
                      <div className="text-sm text-gray-500">
                        SKU: {product.sku || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openReviewModal(product, 'view')}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="View Product Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {product.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openReviewModal(product, 'approve')}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Approve Product"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openReviewModal(product, 'reject')}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Reject Product"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {/* Enable/Disable Button - only for approved/active/inactive products */}
                        {(product.status === 'approved' || product.status === 'active' || product.status === 'inactive') && (
                          <button
                            onClick={() => handleToggleProductStatus(product.id, product.status)}
                            className={`p-1 rounded ${
                              product.status === 'active' 
                                ? 'text-orange-600 hover:text-orange-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={product.status === 'active' ? 'Disable Product' : 'Enable Product'}
                          >
                            <PowerIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Delete Product"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {pagination.page} of {pagination.total_pages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.total_pages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Review Modal */}
      {showReviewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {reviewAction === 'view' ? 'Product Details' : 
               reviewAction === 'approve' ? 'Approve Product' : 'Reject Product'}
            </h3>
            
            {/* Product Info */}
            <div className="mb-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <img 
                      className="h-24 w-24 rounded-lg object-cover" 
                      src={selectedProduct.images[0].url} 
                      alt={selectedProduct.name} 
                    />
                  ) : (
                    <div className="h-24 w-24 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedProduct.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {selectedProduct.description || 'No description available'}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Price:</span>
                      <span className="ml-2">₹{(selectedProduct.price || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Stock:</span>
                      <span className="ml-2">{selectedProduct.available_quantity || 0} units</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Category:</span>
                      <span className="ml-2">{selectedProduct.category?.name || 'Uncategorized'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">SKU:</span>
                      <span className="ml-2">{selectedProduct.sku || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Supplier:</span>
                      <span className="ml-2">{selectedProduct.supplier?.business_name || 
                                             (selectedProduct.supplier?.first_name && selectedProduct.supplier?.last_name 
                                               ? `${selectedProduct.supplier.first_name} ${selectedProduct.supplier.last_name}`.trim()
                                               : selectedProduct.supplier?.email || 'Unknown')}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className="ml-2">{getStatusBadge(selectedProduct.status)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Comment Section */}
            {reviewAction !== 'view' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {reviewAction === 'approve' ? 'Approval Comment (Optional)' : 'Rejection Reason'}
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={reviewAction === 'approve' ? 
                    'Add any approval notes...' : 
                    'Please provide a reason for rejection...'}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4032] focus:border-transparent"
                  required={reviewAction === 'reject'}
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeReviewModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {reviewAction === 'view' ? 'Close' : 'Cancel'}
              </button>
              {reviewAction !== 'view' && (
                <button
                  onClick={handleProductReview}
                  disabled={isSubmitting || (reviewAction === 'reject' && !reviewComment.trim())}
                  className={`px-4 py-2 rounded-lg text-white transition-colors ${
                    reviewAction === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400' 
                      : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : 
                   reviewAction === 'approve' ? 'Approve Product' : 'Reject Product'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
