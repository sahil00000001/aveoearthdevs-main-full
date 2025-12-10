import { useState, useEffect } from 'react';
import productsService from '../../../services/productsService';
import EditProductModal from './EditProductModal';

export default function ProductRow({ product, onProductUpdated }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [localVisibility, setLocalVisibility] = useState(product.visibility);

  useEffect(() => {
    setLocalVisibility(product.visibility);
  }, [product.visibility]);

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setIsLoading(true);
    try {
      await productsService.deleteProduct(product.id);
      if (onProductUpdated) onProductUpdated();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVisibility = async () => {
    const newVisibility = localVisibility === 'hidden' ? 'visible' : 'hidden';
    setIsToggling(true);
    try {
      await productsService.toggleProductVisibility(product.id, localVisibility);
      setLocalVisibility(newVisibility);
      if (onProductUpdated) onProductUpdated();
    } catch (error) {
      console.error('Failed to toggle product visibility:', error);
      alert('Failed to update product visibility');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
    <div className="bg-white rounded-[14px] border border-[#989898] p-3 sm:p-4 h-auto sm:h-[94px] flex flex-col sm:flex-row sm:items-center">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 w-full sm:items-center">
        {/* Product Image and Details */}
        <div className="col-span-1 sm:col-span-4 flex items-center">
          <div className="w-[48px] h-[48px] sm:w-[58px] sm:h-[58px] bg-[#d9d9d9] rounded-[4px] overflow-hidden mr-3 sm:mr-4 flex items-center justify-center flex-shrink-0">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="#666666" strokeWidth="2"/>
                <circle cx="8.5" cy="8.5" r="1.5" stroke="#666666" strokeWidth="2"/>
                <polyline points="21,15 16,10 5,21" stroke="#666666" strokeWidth="2"/>
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[12px] sm:text-[14px] font-poppins font-medium text-black mb-1 truncate">
              {product.name}
            </h4>
            <p className="text-[11px] sm:text-[12px] font-poppins font-medium text-[#8b8b8b] mb-1 truncate">
              {product.vendor}
            </p>
            <p className="text-[11px] sm:text-[12px] font-poppins font-medium text-[#010101] line-clamp-2 sm:line-clamp-1">
              {product.description}
            </p>
          </div>
        </div>
        
        {/* Category */}
        <div className="col-span-1 sm:col-span-2 text-left sm:text-right">
          <span className="text-[11px] sm:text-[12px] font-poppins font-medium text-black">
            {product.category}
          </span>
        </div>
        
        {/* Price */}
        <div className="col-span-1 sm:col-span-1 text-left sm:text-right">
          <span className="text-[11px] sm:text-[12px] font-poppins font-medium text-black">
            {product.price}
          </span>
        </div>
        
        {/* Stock */}
        <div className="col-span-1 sm:col-span-1 text-left sm:text-right">
          <span className="text-[11px] sm:text-[12px] font-poppins font-medium text-black">
            {product.inventory?.[0]?.available_quantity || product.inventory?.[0]?.quantity || 0}
          </span>
        </div>
        
        {/* Status */}
        <div className="col-span-1 sm:col-span-2 text-left sm:text-right">
          <div className="flex flex-col gap-1">
            <span 
              className="text-[9px] sm:text-[10px] font-poppins font-medium px-2 sm:px-3 py-1 rounded-[4px] w-fit sm:w-auto"
              style={{ 
                backgroundColor: product.statusColor || '#000',
                color: 'white'
              }}
            >
              {product.statusText || product.status}
            </span>
            <span 
              className={`text-[8px] sm:text-[9px] font-poppins font-medium px-1 sm:px-2 py-0.5 rounded-[3px] w-fit sm:w-auto ${
                localVisibility === 'hidden' 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-green-100 text-green-600'
              }`}
            >
              {localVisibility === 'hidden' ? 'Hidden' : 'Visible'}
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="col-span-1 sm:col-span-2 text-left sm:text-right">
          <div className="flex justify-start sm:justify-end gap-1 sm:gap-2">
            {/* Visibility Toggle */}
            <button 
              onClick={handleToggleVisibility}
              disabled={isLoading || isToggling}
              className={`w-[28px] h-[28px] sm:w-[33px] sm:h-[31px] border rounded-[5px] flex items-center justify-center hover:opacity-80 transition-colors ${
                localVisibility !== 'hidden' 
                  ? 'bg-green-100 border-green-300' 
                  : 'bg-gray-100 border-gray-300'
              }`}
              title={localVisibility !== 'hidden' ? 'Hide Product' : 'Show Product'}
            >
              {isToggling ? (
                <svg width="14" height="14" viewBox="0 0 50 50" aria-hidden="true">
                  <circle cx="25" cy="25" r="20" fill="none" stroke="#6b7280" strokeWidth="4" strokeLinecap="round" strokeDasharray="31.4 31.4">
                    <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.8s" repeatCount="indefinite" />
                  </circle>
                </svg>
              ) : (localVisibility !== 'hidden' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#10b981" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" stroke="#10b981" strokeWidth="2"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#6b7280" strokeWidth="2"/>
                  <line x1="1" y1="1" x2="23" y2="23" stroke="#6b7280" strokeWidth="2"/>
                </svg>
              ))}
            </button>
            
            {/* Edit Button */}
            <button 
              onClick={handleEdit}
              disabled={isLoading}
              className="w-[28px] h-[28px] sm:w-[33px] sm:h-[31px] bg-white border border-[#666666] rounded-[5px] flex items-center justify-center hover:bg-gray-50"
              title="Edit Product"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {/* Delete Button */}
            <button 
              onClick={handleDelete}
              disabled={isLoading}
              className="w-[28px] h-[28px] sm:w-[33px] sm:h-[31px] bg-white border border-[#666666] rounded-[5px] flex items-center justify-center hover:bg-red-50 hover:border-red-300"
              title="Delete Product"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="3,6 5,6 21,6" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="10" y1="11" x2="10" y2="17" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="14" y1="11" x2="14" y2="17" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    {/* Edit Product Modal */}
    <EditProductModal
      isOpen={showEditModal}
      onClose={() => setShowEditModal(false)}
      productId={product.id}
      onProductUpdated={onProductUpdated}
    />
    </>
  );
}
