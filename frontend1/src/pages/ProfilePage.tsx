import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useQuery } from '@tanstack/react-query';
import { backendApi } from '@/services/backendApi';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Settings,
  Shield,
  Heart,
  Package,
  Leaf,
  Edit,
  Camera,
  LogOut,
  Award,
  TreePine,
  Recycle,
  Truck,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    alternate_address: ''
  });

  const { user, userProfile, updateProfile, signOut, loadUserProfile } = useAuth();
  const { getTotalItems } = useCart();
  const { data: wishlist } = useWishlist();
  
  // Fetch orders for the orders tab
  const { data: ordersResponse, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return null;
      return await backendApi.getOrders(1, 10);
    },
    enabled: !!user && activeTab === 'orders'
  });
  
  const orders = ordersResponse?.items || [];

  // Load profile data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        city: userProfile.city || '',
        state: userProfile.state || '',
        zip_code: userProfile.zip_code || '',
        alternate_address: userProfile.alternate_address || ''
      });
    }
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      console.log('🔄 Saving profile with data:', formData);
      const { error } = await updateProfile(formData);
      if (error) {
        console.error('❌ Error updating profile:', error);
        alert(`Failed to update profile: ${error.message || 'Unknown error'}`);
      } else {
        console.log('✅ Profile updated successfully');
        setIsEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('❌ Exception updating profile:', error);
      alert(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <User className="w-16 h-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-semibold text-charcoal">Please Sign In</h2>
          <p className="text-muted-foreground">You need to be signed in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <User className="w-16 h-16 text-muted-foreground mx-auto animate-pulse" />
          <h2 className="text-2xl font-semibold text-charcoal">Loading Profile...</h2>
          <p className="text-muted-foreground">Please wait while we load your profile data.</p>
          <button 
            onClick={() => loadUserProfile()}
            className="px-4 py-2 bg-forest text-white rounded-lg hover:bg-moss transition-colors"
          >
            Retry Loading Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-moss text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <User className="w-8 h-8" />
              <h1 className="text-4xl lg:text-5xl font-headline font-bold">
                My Profile
              </h1>
            </div>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Manage your account and track your sustainable journey
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 bg-gradient-moss rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {userProfile.name?.charAt(0) || 'U'}
                    </div>
                    <Button
                      size="sm"
                      className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-charcoal">{userProfile.name || 'User'}</h3>
                    <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Member since</span>
                      <span>{new Date(userProfile.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Orders</span>
                      <span>0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Wishlist</span>
                      <span>{wishlist?.length || 0}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="w-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Eco Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-moss/10 rounded-lg">
                  <TreePine className="w-8 h-8 text-moss mx-auto mb-2" />
                  <div className="text-2xl font-bold text-forest">3</div>
                  <div className="text-sm text-muted-foreground">Trees Planted</div>
                </div>
                <div className="text-center p-4 bg-moss/10 rounded-lg">
                  <Recycle className="w-8 h-8 text-moss mx-auto mb-2" />
                  <div className="text-2xl font-bold text-forest">2.5kg</div>
                  <div className="text-sm text-muted-foreground">CO₂ Offset</div>
                </div>
                <div className="text-center p-4 bg-moss/10 rounded-lg">
                  <Leaf className="w-8 h-8 text-moss mx-auto mb-2" />
                  <div className="text-2xl font-bold text-forest">15</div>
                  <div className="text-sm text-muted-foreground">Plastic Items Saved</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Personal Information</CardTitle>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {isEditing ? 'Cancel' : 'Edit'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={isEditing ? formData.name : userProfile.name || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={userProfile.email || ''}
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={isEditing ? formData.phone : userProfile.phone || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          name="address"
                          value={isEditing ? formData.address : userProfile.address || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={isEditing ? formData.city : userProfile.city || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          value={isEditing ? formData.state : userProfile.state || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip_code">ZIP Code</Label>
                        <Input
                          id="zip_code"
                          name="zip_code"
                          value={isEditing ? formData.zip_code : userProfile.zip_code || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    {/* Alternate Address Section */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-lg font-semibold text-charcoal mb-4">Alternate Address</h4>
                      <div className="space-y-2">
                        <Label htmlFor="alternate_address">Alternate Address</Label>
                        <Input
                          id="alternate_address"
                          name="alternate_address"
                          value={isEditing ? formData.alternate_address : userProfile.alternate_address || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter alternate address (optional)"
                        />
                      </div>
                    </div>
                    
                    {isEditing && (
                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSaveProfile}>
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ordersLoading ? (
                      <div className="text-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-forest" />
                        <p className="text-muted-foreground">Loading orders...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-charcoal mb-2">No orders yet</h3>
                        <p className="text-muted-foreground mb-4">Your order history will appear here</p>
                        <Button onClick={() => navigate('/products')}>
                          Start Shopping
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order: any) => {
                          const getStatusColor = (status: string) => {
                            const colors: Record<string, string> = {
                              pending: 'bg-yellow-100 text-yellow-800',
                              confirmed: 'bg-blue-100 text-blue-800',
                              processing: 'bg-blue-100 text-blue-800',
                              shipped: 'bg-purple-100 text-purple-800',
                              delivered: 'bg-green-100 text-green-800',
                              cancelled: 'bg-red-100 text-red-800',
                              returned: 'bg-gray-100 text-gray-800'
                            };
                            return colors[status] || 'bg-gray-100 text-gray-800';
                          };
                          
                          const getStatusIcon = (status: string) => {
                            if (status === 'shipped' || status === 'delivered') return Truck;
                            if (status === 'delivered') return CheckCircle;
                            if (status === 'cancelled') return XCircle;
                            return Clock;
                          };
                          
                          const StatusIcon = getStatusIcon(order.status);
                          const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;
                          const formatDate = (dateString: string) => {
                            if (!dateString) return 'N/A';
                            return new Date(dateString).toLocaleDateString('en-IN', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            });
                          };
                          
                          return (
                            <Card key={order.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                      <h3 className="font-semibold text-lg">Order #{order.id?.substring(0, 8)}</h3>
                                      <Badge className={`${getStatusColor(order.status)} text-xs`}>
                                        <StatusIcon className="w-3 h-3 mr-1" />
                                        {order.status}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(order.created_at)}
                                      </span>
                                      <span>{formatPrice(order.total_amount)}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => navigate(`/orders?order_id=${order.id}`)}
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      View
                                    </Button>
                                    {(order.status === 'shipped' || order.status === 'delivered') && (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => navigate(`/track-order?order_id=${order.id}`)}
                                      >
                                        <Truck className="w-4 h-4 mr-1" />
                                        Track
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <div className="border-t pt-4">
                                  <div className="space-y-2">
                                    {order.items?.slice(0, 3).map((item: any, idx: number) => (
                                      <div key={idx} className="flex items-center gap-3 text-sm">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                          <img
                                            src={item.product?.image_url || '/api/placeholder/40/40'}
                                            alt={item.product?.name || 'Product'}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium truncate">{item.product?.name || 'Product'}</div>
                                          <div className="text-muted-foreground">
                                            Qty: {item.quantity} × {formatPrice(item.price)}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    {order.items?.length > 3 && (
                                      <div className="text-sm text-muted-foreground pt-2">
                                        +{order.items.length - 3} more item(s)
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                        {orders.length >= 10 && (
                          <div className="text-center pt-4">
                            <Button variant="outline" onClick={() => navigate('/orders')}>
                              View All Orders
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Wishlist Tab */}
              <TabsContent value="wishlist" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>My Wishlist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-charcoal mb-2">
                        {wishlist?.length || 0} items in wishlist
                      </h3>
                      <p className="text-muted-foreground">
                        {wishlist?.length === 0 
                          ? 'Your wishlist is empty' 
                          : 'View your saved items'
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Notifications</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Email notifications</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Order updates</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Marketing emails</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Privacy</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Make profile public</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Show eco impact stats</span>
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button variant="destructive">
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;