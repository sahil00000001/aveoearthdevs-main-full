import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useVendorAuth } from '@/hooks/useVendorAuth';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  MoreVertical,
  Package,
  Star,
  Leaf,
  Zap,
  BarChart3,
  ArrowLeft,
  LogOut
} from 'lucide-react';

const VendorProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { vendor, loading, signOut, isAuthenticated } = useVendorAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      navigate('/vendor');
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest/5 via-moss/10 to-clay/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-forest rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Package className="w-8 h-8 text-white" />
          </div>
          <p className="text-forest text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null;
  }

  // Mock products data
  const products = [
    {
      id: 1,
      name: 'Organic Bamboo Bed Sheets',
      image: '/api/placeholder/120/120',
      price: 2499,
      originalPrice: 2999,
      stock: 45,
      status: 'active',
      sales: 234,
      rating: 4.8,
      sustainability: 95,
      category: 'Home & Living',
      dateAdded: '2024-01-10'
    },
    {
      id: 2,
      name: 'Eco-Friendly Water Bottle',
      image: '/api/placeholder/120/120',
      price: 1299,
      originalPrice: 1599,
      stock: 78,
      status: 'active',
      sales: 189,
      rating: 4.6,
      sustainability: 92,
      category: 'Personal Care',
      dateAdded: '2024-01-08'
    },
    {
      id: 3,
      name: 'Sustainable Cotton Tote Bag',
      image: '/api/placeholder/120/120',
      price: 799,
      originalPrice: 999,
      stock: 0,
      status: 'out_of_stock',
      sales: 156,
      rating: 4.7,
      sustainability: 88,
      category: 'Accessories',
      dateAdded: '2024-01-05'
    },
    {
      id: 4,
      name: 'Bamboo Cutlery Set',
      image: '/api/placeholder/120/120',
      price: 899,
      originalPrice: 1199,
      stock: 23,
      status: 'active',
      sales: 98,
      rating: 4.5,
      sustainability: 90,
      category: 'Home & Living',
      dateAdded: '2024-01-03'
    },
    {
      id: 5,
      name: 'Natural Loofah Sponge',
      image: '/api/placeholder/120/120',
      price: 399,
      originalPrice: 499,
      stock: 67,
      status: 'active',
      sales: 145,
      rating: 4.9,
      sustainability: 99,
      category: 'Personal Care',
      dateAdded: '2024-01-01'
    },
    {
      id: 6,
      name: 'Hemp Yoga Mat',
      image: '/api/placeholder/120/120',
      price: 2499,
      originalPrice: 2999,
      stock: 12,
      status: 'low_stock',
      sales: 67,
      rating: 4.4,
      sustainability: 93,
      category: 'Fitness',
      dateAdded: '2023-12-28'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'out_of_stock': return 'Out of Stock';
      case 'low_stock': return 'Low Stock';
      case 'draft': return 'Draft';
      default: return status;
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="p-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-forest hover:text-moss hover:scale-110 transition-all duration-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-forest mb-2 bg-gradient-to-r from-forest to-moss bg-clip-text text-transparent">
                Product Management
              </h1>
              <p className="text-muted-foreground text-lg">Manage your sustainable product catalog</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-forest to-moss hover:from-moss hover:to-clay text-white px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:animate-pulse">
            <Plus className="w-5 h-5 mr-2" />
            Add New Product
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white/95 backdrop-blur-md border-forest/30 shadow-2xl hover:shadow-3xl transition-all duration-500 mb-8 group">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative group/search">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-hover/search:text-forest transition-colors duration-300" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 border-2 border-forest/20 focus:border-forest focus:ring-4 focus:ring-forest/20 rounded-2xl bg-white/90 backdrop-blur-sm transition-all duration-300 hover:border-forest/40"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border-2 border-forest/20 rounded-2xl focus:border-forest focus:ring-4 focus:ring-forest/20 bg-white/90 backdrop-blur-sm hover:border-forest/40 transition-all duration-300"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="draft">Draft</option>
                </select>
                <Button className="bg-gradient-to-r from-forest to-moss hover:from-moss hover:to-clay text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => (
            <Card 
              key={product.id} 
              className="bg-white/95 backdrop-blur-md border-forest/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 group relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-forest/5 to-moss/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-6 relative z-10">
                {/* Product Image and Status */}
                <div className="relative mb-4 group/image">
                  <div className="w-full h-48 bg-gradient-to-br from-forest/20 to-moss/20 rounded-3xl flex items-center justify-center group-hover/image:from-moss/20 group-hover/image:to-clay/20 transition-all duration-500 group-hover/image:scale-105">
                    <div className="text-5xl group-hover/image:animate-bounce-slow">🌱</div>
                  </div>
                  <Badge className={`absolute top-3 right-3 ${getStatusColor(product.status)} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {getStatusLabel(product.status)}
                  </Badge>
                  <div className="absolute top-3 left-3 flex items-center gap-1 bg-gradient-to-r from-forest to-moss text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Leaf className="w-3 h-3 animate-spin" />
                    <span>{product.sustainability}%</span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-forest text-xl mb-2 line-clamp-2 group-hover:text-moss transition-colors duration-300">{product.name}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{product.category}</p>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-forest group-hover:text-moss transition-colors duration-300">{formatPrice(product.price)}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-forest/5 group-hover:bg-forest/10 transition-colors duration-300">
                      <Package className="w-4 h-4 text-forest group-hover:text-moss transition-colors duration-300" />
                      <div>
                        <span className="text-muted-foreground block text-xs">Stock</span>
                        <span className="font-bold text-forest group-hover:text-moss transition-colors duration-300">{product.stock}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-moss/5 group-hover:bg-moss/10 transition-colors duration-300">
                      <Star className="w-4 h-4 text-yellow-500 fill-current animate-pulse-slow" />
                      <div>
                        <span className="text-muted-foreground block text-xs">Rating</span>
                        <span className="font-bold text-forest group-hover:text-moss transition-colors duration-300">{product.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sales */}
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-green-50 group-hover:bg-green-100 transition-colors duration-300">
                    <Zap className="w-4 h-4 text-green-600 animate-bounce-slow" />
                    <div>
                      <span className="text-muted-foreground text-xs">Sales</span>
                      <span className="font-bold text-green-600 block">{product.sales} units</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1 bg-gradient-to-r from-forest to-moss hover:from-moss hover:to-clay text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" className="flex-1 bg-gradient-to-r from-moss to-clay hover:from-clay hover:to-forest text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl transition-all duration-300 hover:scale-105">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <Card className="bg-white/90 backdrop-blur-sm border-forest/20 shadow-lg">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-forest mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first product'}
              </p>
              <Button className="bg-forest hover:bg-moss text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              <Button variant="outline" className="border-forest text-forest hover:bg-forest hover:text-white">
                Previous
              </Button>
              <Button className="bg-forest text-white">1</Button>
              <Button variant="outline" className="border-forest text-forest hover:bg-forest hover:text-white">
                2
              </Button>
              <Button variant="outline" className="border-forest text-forest hover:bg-forest hover:text-white">
                3
              </Button>
              <Button variant="outline" className="border-forest text-forest hover:bg-forest hover:text-white">
                Next
              </Button>
            </div>
          </div>
        )}
    </div>
  );
};

export default VendorProducts;
