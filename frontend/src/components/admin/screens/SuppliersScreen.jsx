"use client";

import { useState, useEffect } from "react";
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline";
import adminService from "@/services/adminService";

export default function SuppliersScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("all");
  
  // Data state
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0
  });

  // Modal state
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [supplierDocuments, setSupplierDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  
  // Review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState(null); // 'approve' or 'reject'
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, [pagination.page, verificationFilter]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await adminService.getAllSuppliers({
        page: pagination.page,
        limit: pagination.limit,
        verification_status: verificationFilter === 'all' ? undefined : verificationFilter
      });
      
      setSuppliers(result.items || []);
      setPagination(prev => ({
        ...prev,
        total: result.total || 0,
        total_pages: result.total_pages || 0
      }));
      
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierDocuments = async (supplierId) => {
    try {
      setDocumentsLoading(true);
      const documents = await adminService.getSupplierDocuments(supplierId);
      setSupplierDocuments(documents || []);
    } catch (error) {
      console.error('Failed to fetch supplier documents:', error);
      setSupplierDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const openDocumentsModal = async (supplier) => {
    setSelectedSupplier(supplier);
    setShowDocumentsModal(true);
    await fetchSupplierDocuments(supplier.supplier_id);
  };

  const openReviewModal = (supplier, action) => {
    setSelectedSupplier(supplier);
    setReviewAction(action);
    setReviewComment("");
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setSelectedSupplier(null);
    setReviewAction(null);
    setReviewComment("");
    setShowReviewModal(false);
  };

  const handleSupplierReview = async () => {
    if (!selectedSupplier || !reviewAction) return;

    try {
      setIsSubmittingReview(true);
      
      await adminService.reviewSupplierVerification(
        selectedSupplier.supplier_id,
        reviewAction,
        reviewComment
      );

      // Refresh suppliers list
      await fetchSuppliers();
      
      // Close modal
      closeReviewModal();
      
      // Show success message
      alert(`Supplier ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully!`);
      
    } catch (error) {
      console.error('Failed to review supplier:', error);
      alert('Failed to review supplier: ' + error.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleApproveSupplier = async (supplierId) => {
    try {
      setIsLoading(true);
      
      await adminService.updateSupplierStatus(supplierId, true);
      
      // Refresh suppliers list
      await fetchSuppliers();
      
      // Close modal
      setShowDocumentsModal(false);
      setSelectedSupplier(null);
      setSupplierDocuments([]);
      
      alert('Supplier approved successfully!');
      
    } catch (error) {
      console.error('Failed to approve supplier:', error);
      alert('Failed to approve supplier: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectSupplier = async (supplierId) => {
    try {
      setIsLoading(true);
      
      await adminService.updateSupplierStatus(supplierId, false);
      
      // Refresh suppliers list
      await fetchSuppliers();
      
      // Close modal
      setShowDocumentsModal(false);
      setSelectedSupplier(null);
      setSupplierDocuments([]);
      
      alert('Supplier rejected successfully!');
      
    } catch (error) {
      console.error('Failed to reject supplier:', error);
      alert('Failed to reject supplier: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getVerificationStatus = (supplier) => {
    // This would depend on your backend verification logic
    const hasDocuments = supplier.documents?.length > 0;
    const isVerified = supplier.is_verified || supplier.verification_status === 'verified';
    
    if (isVerified) {
      return { color: 'bg-green-100 text-green-800', text: 'Verified' };
    } else if (hasDocuments) {
      return { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Review' };
    } else {
      return { color: 'bg-red-100 text-red-800', text: 'Documents Missing' };
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (supplier.supplier_email || supplier.email)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (supplier.contact_person || 
                          `${supplier.supplier_first_name || ''} ${supplier.supplier_last_name || ''}`.trim())?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-black">Suppliers Management</h1>
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
        <h1 className="text-2xl font-semibold text-black">Suppliers Management</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Failed to load suppliers: {error}</p>
          <button 
            onClick={fetchSuppliers}
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
        <h1 className="text-2xl font-semibold text-black">Suppliers Management</h1>
        <button 
          onClick={fetchSuppliers}
          className="bg-[#1a4032] hover:bg-[#0f2319] text-white px-4 py-2 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search suppliers by business name, email, or contact person..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4032] focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4032] focus:border-transparent"
          >
            <option value="all">All Verification Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending Review</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No suppliers found
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => {
                  const verification = getVerificationStatus(supplier);
                  return (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {supplier.logo_url ? (
                              <img 
                                className="h-12 w-12 rounded-lg object-cover" 
                                src={supplier.logo_url} 
                                alt={supplier.business_name} 
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {supplier.business_name || 'Business Name Not Set'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {supplier.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {supplier.supplier_email || supplier.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {supplier.supplier_phone || supplier.phone || 'No phone'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {supplier.supplier_first_name || supplier.supplier_last_name 
                            ? `${supplier.supplier_first_name || ''} ${supplier.supplier_last_name || ''}`.trim()
                            : supplier.contact_person || 'No contact person'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {supplier.created_at ? new Date(supplier.created_at).toLocaleDateString() : 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${verification.color}`}>
                          {verification.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openDocumentsModal(supplier)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="View Documents"
                          >
                            <DocumentTextIcon className="h-4 w-4" />
                          </button>
                          
                          {/* Approval actions - only show for pending suppliers */}
                          {supplier.verification_status !== 'verified' && (
                            <button
                              onClick={() => openReviewModal(supplier, 'approve')}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Approve Supplier"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                          )}
                          
                          {supplier.verification_status !== 'rejected' && (
                            <button
                              onClick={() => openReviewModal(supplier, 'reject')}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Reject Supplier"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => openDocumentsModal(supplier)}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      {/* Documents Modal */}
      {showDocumentsModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Supplier Details: {selectedSupplier.business_name || selectedSupplier.email}
            </h3>
            
            {/* Supplier Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Business Information</h4>
                  <p className="text-sm text-gray-600">Business Name: {selectedSupplier.business_name || 'Not provided'}</p>
                  <p className="text-sm text-gray-600">Email: {selectedSupplier.supplier_email || selectedSupplier.email || 'Not provided'}</p>
                  <p className="text-sm text-gray-600">Phone: {selectedSupplier.supplier_phone || selectedSupplier.phone || 'Not provided'}</p>
                  <p className="text-sm text-gray-600">Contact Person: {selectedSupplier.supplier_first_name || selectedSupplier.supplier_last_name 
                    ? `${selectedSupplier.supplier_first_name || ''} ${selectedSupplier.supplier_last_name || ''}`.trim()
                    : selectedSupplier.contact_person || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Registration Details</h4>
                  <p className="text-sm text-gray-600">
                    Registration Date: {selectedSupplier.created_at ? new Date(selectedSupplier.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Verification Status: {getVerificationStatus(selectedSupplier).text}
                  </p>
                  <p className="text-sm text-gray-600">
                    User Type: {selectedSupplier.user_type || 'supplier'}
                  </p>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-4">Verification Documents</h4>
              
              {documentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a4032] mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading documents...</p>
                </div>
              ) : supplierDocuments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No documents uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {supplierDocuments.map((document) => (
                    <div key={document.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{document.document_name || document.document_type}</h5>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          document.document_status === 'verified' 
                            ? 'bg-green-100 text-green-800'
                            : document.document_status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {document.document_status || 'pending'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Type: {document.document_type}</p>
                      {document.file_url && (
                        <a 
                          href={document.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          <DocumentTextIcon className="h-4 w-4 mr-1" />
                          View Document
                        </a>
                      )}
                      <div className="mt-3 text-xs text-gray-500">
                        <p>Size: {document.file_size ? `${Math.round(document.file_size / 1024)} KB` : 'Unknown'}</p>
                        <p>Uploaded: {document.created_at ? new Date(document.created_at).toLocaleDateString() : 'Unknown'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDocumentsModal(false);
                  setSelectedSupplier(null);
                  setSupplierDocuments([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {selectedSupplier.verification_status !== 'verified' && (
                <>
                  <button
                    onClick={() => handleApproveSupplier(selectedSupplier.supplier_id)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : 'Verify Supplier'}
                  </button>
                  <button
                    onClick={() => handleRejectSupplier(selectedSupplier.supplier_id)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : 'Reject Application'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
