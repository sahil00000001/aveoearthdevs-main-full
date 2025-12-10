import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVendorAuth } from '@/hooks/useVendorAuth';
import { vendorProductService, VendorProduct, ProductCategory } from '@/services/vendorProductService';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Package, 
  Image as ImageIcon,
  Upload,
  Save,
  X,
  Star,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Leaf,
  Zap,
  AlertCircle
} from 'lucide-react';

const VendorProductsPage = () => {
  const { vendor, isAuthenticated, loading: vendorLoading } = useVendorAuth();
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<VendorProduct>>({
    name: '',
    description: '',
    short_description: '',
    category_id: '',
    brand: '',
    sku: '',
    price: 0,
    compare_price: 0,
    cost_price: 0,
    stock_quantity: 0,
    min_stock_quantity: 0,
    weight: 0,
    images: [],
    tags: [],
    is_active: true,
    is_featured: false,
    is_digital: false,
    requires_shipping: true,
    taxable: true,
    tax_rate: 0,
    sustainability_rating: 0,
    eco_friendly_features: [],
    certifications: [],
    materials: [],
    packaging_type: '',
    return_policy_days: 30,
    warranty_period_days: 0,
    handling_time_days: 1,
    variants: []
  });

  const loadProducts = React.useCallback(async () => {
    // Use mock vendor ID if no vendor from auth
    const vendorId = vendor?.id || 'mock-vendor-1';
    
    setIsLoading(true);
    try {
      // Simulate a quick load for mock data
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const { products: productList, total } = await vendorProductService.getProducts(vendorId, {
        search: searchTerm,
        status: statusFilter === 'all' ? undefined : statusFilter as any,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        page: currentPage,
        limit: 12
      });
      setProducts(productList);
      setTotalProducts(total);
    } catch (error) {
      console.error('Error loading products:', error);
      // Even on error, stop loading
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [vendor?.id, searchTerm, statusFilter, categoryFilter, currentPage]);

  const loadCategories = React.useCallback(async () => {
    try {
      const categoriesList = await vendorProductService.getCategories();
      setCategories(categoriesList);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  useEffect(() => {
    // Wait for vendor auth to finish loading
    if (vendorLoading) {
      return;
    }

    // Load data immediately if vendor session exists (for mock version)
    const session = localStorage.getItem('vendorSession');
    if (session || vendor?.id) {
      loadProducts();
      loadCategories();
    } else {
      // If no vendor and no session, stop loading
      setIsLoading(false);
    }
  }, [vendor, vendorLoading, loadProducts, loadCategories]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field as keyof typeof prev] as string[] || []), value]
        : (prev[field as keyof typeof prev] as string[] || []).filter(item => item !== value)
    }));
  };

  const handleImageUpload = async (file: File) => {
    if (!vendor?.id) return;

    try {
      const imageUrl = await vendorProductService.uploadProductImage('temp', file, formData.images?.length || 0);
      if (imageUrl) {
        handleInputChange('images', [...(formData.images || []), imageUrl]);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Use backend API for product creation/update
      const { backendApi } = await import('@/services/backendApi');
      
      const productFormData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            productFormData.append(key, JSON.stringify(value));
          } else if (typeof value === 'object') {
            productFormData.append(key, JSON.stringify(value));
          } else {
            productFormData.append(key, String(value));
          }
        }
      });
      
      let product;
      if (editingProduct) {
        // TODO: Implement update endpoint
        throw new Error('Update not yet implemented - use create for now');
      } else {
        product = await backendApi.createProduct(productFormData);
        if (product) {
          setProducts(prev => [product, ...prev]);
        }
      }
      
      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(`Failed to save product: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      alert('Please select a CSV file to upload');
      return;
    }
    
    setBulkUploading(true);
    console.log('Starting bulk upload with file:', bulkFile.name, 'Size:', bulkFile.size);
    
    try {
      // Use backend API for bulk CSV upload
      const { backendApi } = await import('@/services/backendApi');
      console.log('Backend API imported, calling bulkImportCSV...');
      
      const result = await backendApi.bulkImportCSV(bulkFile);
      
      console.log('Bulk upload result:', result);
      
      if (!result || !result.results) {
        throw new Error('Invalid response from server');
      }
      
      // Refresh products list
      await loadProducts();
      setBulkUploadOpen(false);
      setBulkFile(null);
      
      // Show success message
      alert(`Bulk upload completed: ${result.results.successful} successful, ${result.results.failed} failed`);
    } catch (error: any) {
      console.error('Bulk upload failed:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        response: error?.response,
        status: error?.status
      });
      alert(`Bulk upload failed: ${error?.message || error?.response?.data?.detail || 'Unknown error'}. Please check the console for details.`);
    } finally {
      setBulkUploading(false);
      console.log('Bulk upload finished, loading state reset');
    }
  };

  const handleEdit = (product: VendorProduct) => {
    setEditingProduct(product);
    setFormData(product);
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const success = await vendorProductService.deleteProduct(productId);
      if (success) {
        setProducts(prev => prev.filter(p => p.id !== productId));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleToggleStatus = async (productId: string, isActive: boolean) => {
    try {
      const success = await vendorProductService.toggleProductStatus(productId, isActive);
      if (success) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_active: isActive } : p));
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      short_description: '',
      category_id: '',
      brand: '',
      sku: '',
      price: 0,
      compare_price: 0,
      cost_price: 0,
      stock_quantity: 0,
      min_stock_quantity: 0,
      weight: 0,
      images: [],
      tags: [],
      is_active: true,
      is_featured: false,
      is_digital: false,
      requires_shipping: true,
      taxable: true,
      tax_rate: 0,
      sustainability_rating: 0,
      eco_friendly_features: [],
      certifications: [],
      materials: [],
      packaging_type: '',
      return_policy_days: 30,
      warranty_period_days: 0,
      handling_time_days: 1,
      variants: []
    });
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    resetForm();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-forest rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Package className="w-8 h-8 text-white" />
            </div>
            <p className="text-forest text-lg">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-forest mb-2">Product Management</h1>
            <p className="text-muted-foreground">Manage your products and inventory</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleNewProduct} className="bg-gradient-to-r from-forest to-moss hover:from-moss hover:to-clay text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
            <Button onClick={() => setBulkUploadOpen(true)} variant="outline" className="border-forest text-forest hover:bg-forest hover:text-white">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 relative overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleToggleStatus(product.id, !product.is_active)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {product.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(product)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(product.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="absolute top-2 left-2">
                    <Badge variant={product.is_active ? 'default' : 'secondary'}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-forest line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.short_description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-forest">₹{product.price}</span>
                      {product.compare_price && product.compare_price > product.price && (
                        <span className="text-sm text-muted-foreground line-through">₹{product.compare_price}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">4.5</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Stock: {product.stock_quantity}</span>
                    <div className="flex items-center gap-1">
                      <Leaf className="w-4 h-4 text-green-600" />
                      <span>{product.sustainability_rating}%</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {product.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {product.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{product.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first product</p>
              <Button onClick={handleNewProduct} className="bg-gradient-to-r from-forest to-moss hover:from-moss hover:to-clay text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalProducts > 12 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 py-2 text-sm text-muted-foreground">
                Page {currentPage} of {Math.ceil(totalProducts / 12)}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalProducts / 12), prev + 1))}
                disabled={currentPage >= Math.ceil(totalProducts / 12)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku || ''}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="Enter SKU"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="short_description">Short Description</Label>
                <Input
                  id="short_description"
                  value={formData.short_description || ''}
                  onChange={(e) => handleInputChange('short_description', e.target.value)}
                  placeholder="Brief product description"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed product description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category_id">Category *</Label>
                  <Select value={formData.category_id || ''} onValueChange={(value) => handleInputChange('category_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand || ''}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="Brand name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight || ''}
                    onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                    placeholder="0.0"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pricing</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="compare_price">Compare Price</Label>
                  <Input
                    id="compare_price"
                    type="number"
                    value={formData.compare_price || ''}
                    onChange={(e) => handleInputChange('compare_price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cost_price">Cost Price</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    value={formData.cost_price || ''}
                    onChange={(e) => handleInputChange('cost_price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Inventory</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity || ''}
                    onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="min_stock_quantity">Min Stock Quantity</Label>
                  <Input
                    id="min_stock_quantity"
                    type="number"
                    value={formData.min_stock_quantity || ''}
                    onChange={(e) => handleInputChange('min_stock_quantity', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Product Images</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images?.map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded-lg relative overflow-hidden">
                    <img src={image} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 w-6 h-6 p-0"
                      onClick={() => handleInputChange('images', formData.images?.filter((_, i) => i !== index) || [])}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                
                {(!formData.images || formData.images.length < 8) && (
                  <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer text-sm text-gray-600"
                      >
                        Add Image
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sustainability */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sustainability</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sustainability_rating">Sustainability Rating (0-100)</Label>
                  <Input
                    id="sustainability_rating"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.sustainability_rating || ''}
                    onChange={(e) => handleInputChange('sustainability_rating', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="packaging_type">Packaging Type</Label>
                  <Input
                    id="packaging_type"
                    value={formData.packaging_type || ''}
                    onChange={(e) => handleInputChange('packaging_type', e.target.value)}
                    placeholder="e.g., Recyclable, Biodegradable"
                  />
                </div>
              </div>

              <div>
                <Label>Eco-friendly Features</Label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Recycled Materials', 'Biodegradable', 'Carbon Neutral', 'Zero Waste', 'Organic', 'Fair Trade'].map((feature) => (
                    <label key={feature} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.eco_friendly_features?.includes(feature) || false}
                        onChange={(e) => handleArrayChange('eco_friendly_features', feature, e.target.checked)}
                        className="rounded border-gray-300 text-forest focus:ring-forest"
                      />
                      <span className="text-sm">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Product'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkUploadOpen} onOpenChange={setBulkUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Upload Products</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="bulk-file">CSV File</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Create sample CSV content
                    const csvHeaders = [
                      'name',
                      'description',
                      'short_description',
                      'price',
                      'compare_price',
                      'cost_price',
                      'stock_quantity',
                      'min_stock_quantity',
                      'category_id',
                      'brand',
                      'sku',
                      'weight',
                      'dimensions',
                      'materials',
                      'care_instructions',
                      'sustainability_notes',
                      'tags',
                      'is_active',
                      'is_featured',
                      'is_digital',
                      'requires_shipping',
                      'taxable',
                      'tax_rate',
                      'return_policy_days',
                      'warranty_period_days',
                      'handling_time_days'
                    ];
                    
                    // Use first available category ID, or placeholder if none
                    const sampleCategoryId = categories.length > 0 ? categories[0].id : '<category_id>';
                    
                    const csvSample = [
                      csvHeaders.join(','),
                      `Sample Product 1,"This is a detailed description of the product","Short description",99.99,129.99,50.00,100,10,${sampleCategoryId},"Brand Name","SKU-001",0.5,"10x10x5 cm","Bamboo, Cotton","Hand wash only","Eco-friendly materials",tag1|tag2|tag3,true,false,false,true,true,18,30,0,1`,
                      `Sample Product 2,"Another product description","Another short description",149.99,199.99,75.00,50,5,${sampleCategoryId},"Another Brand","SKU-002",1.0,"15x15x8 cm","Recycled Plastic","Machine wash","100% recycled",tag4|tag5,true,true,false,true,true,18,30,0,2`
                    ].join('\n');
                    
                    // Create blob and download
                    const blob = new Blob([csvSample], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', 'product_bulk_upload_sample.csv');
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="text-xs"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Download Sample CSV
                </Button>
              </div>
              <Input
                id="bulk-file"
                type="file"
                accept=".csv"
                onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-2">
                Upload a CSV file with columns: name, description, short_description, price, stock_quantity, category_id, is_active, is_featured, weight, dimensions, materials, care_instructions, sustainability_notes, tags
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Note: Replace &lt;category_id&gt; in the sample CSV with actual category IDs from your categories list.
              </p>
            </div>
            {bulkFile && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">Selected file: {bulkFile.name}</p>
                <p className="text-xs text-gray-500">Size: {(bulkFile.size / 1024).toFixed(1)} KB</p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setBulkUploadOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkUpload} 
              disabled={!bulkFile || bulkUploading}
              className="bg-gradient-to-r from-forest to-moss hover:from-moss hover:to-clay text-white"
            >
              {bulkUploading ? 'Uploading...' : 'Upload Products'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorProductsPage;