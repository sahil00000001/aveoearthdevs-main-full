import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useProduct } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useAddToWishlistNew, useRemoveFromWishlistNew, useIsInWishlistNew } from '@/hooks/useWishlistNew';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { backendApi } from '@/services/backendApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Leaf, 
  Share2,
  Minus,
  Plus,
  Shield,
  Truck,
  RotateCcw,
  Award,
  ChevronLeft,
  ChevronRight,
  TreePine,
  Recycle
} from 'lucide-react';

const ProductPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  const { data: product, isLoading, error } = useProduct(productId!);
  const { addToCart } = useCart();
  const addToWishlist = useAddToWishlistNew();
  const removeFromWishlist = useRemoveFromWishlistNew();
  const { data: isInWishlist } = useIsInWishlistNew(productId!);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      if (!productId) return null;
      return await backendApi.getProductReviews(productId, 1, 50);
    },
    enabled: !!productId
  });

  const reviews = reviewsData?.data || reviewsData?.items || [];
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length
    : 0;

  const createReviewMutation = useMutation({
    mutationFn: async ({ rating, comment }: { rating: number; comment: string }) => {
      if (!productId) throw new Error('Product ID required');
      return await backendApi.createReview(productId, rating, comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
      });
      setReviewComment('');
      setReviewRating(5);
      setShowReviewForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAddToCart = () => {
    if (product) {
      if (product.stock && product.stock <= 0) {
        toast({
          title: "Out of stock",
          description: "This product is currently out of stock.",
          variant: "destructive",
        });
        return;
      }
      addToCart(product, quantity);
    }
  };

  const handleToggleWishlist = () => {
    if (user && product) {
      if (isInWishlist) {
        removeFromWishlist.mutate(product.id);
      } else {
        addToWishlist.mutate(product.id);
      }
    }
  };

  const handleSubmitReview = () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to submit a review.",
        variant: "destructive",
      });
      return;
    }
    if (!reviewComment.trim()) {
      toast({
        title: "Comment required",
        description: "Please enter your review comment.",
        variant: "destructive",
      });
      return;
    }
    createReviewMutation.mutate({ rating: reviewRating, comment: reviewComment });
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-forest border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Product not found</p>
          <Link to="/products" className="text-forest hover:underline mt-2 inline-block">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const productImages = product.image_url ? [product.image_url] : ['/api/placeholder/600/600'];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-4">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-forest">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-forest">Products</Link>
            <span>/</span>
            <span className="text-charcoal">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-forest' : 'border-border'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-headline font-bold text-charcoal mb-2">
                {product.name}
              </h1>
              <p className="text-muted-foreground text-lg">
                {product.description}
              </p>
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}</span>
                <span className="text-muted-foreground">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
              </div>
              {product.sustainability_score && (
                <Badge className="bg-moss/20 text-forest">
                  <Leaf className="w-3 h-3 mr-1" />
                  {product.sustainability_score}% Eco Score
                </Badge>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-charcoal">
                {formatPrice(product.price)}
              </span>
              {product.discount && product.discount > 0 && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.price / (1 - product.discount / 100))}
                  </span>
                  <Badge className="bg-clay text-white">
                    {product.discount}% OFF
                  </Badge>
                </>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.badges?.map((badge: string, index: number) => (
                <Badge key={index} variant="outline" className="border-moss text-forest">
                  {badge}
                </Badge>
              ))}
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-10 w-10"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 btn-primary"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                {user && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleToggleWishlist}
                    className="px-6"
                    disabled={addToWishlist.isPending || removeFromWishlist.isPending}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                )}
                <Button variant="outline" size="lg" className="px-6">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-moss" />
                <span>2 Year Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-moss" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-moss" />
                <span>30 Day Returns</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-moss" />
                <span>Eco Certified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="eco-impact">Eco Impact</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Specifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Material:</span>
                      <span className="ml-2 text-muted-foreground">Premium Bamboo</span>
                    </div>
                    <div>
                      <span className="font-medium">Dimensions:</span>
                      <span className="ml-2 text-muted-foreground">30cm x 15cm x 5cm</span>
                    </div>
                    <div>
                      <span className="font-medium">Weight:</span>
                      <span className="ml-2 text-muted-foreground">250g</span>
                    </div>
                    <div>
                      <span className="font-medium">Care:</span>
                      <span className="ml-2 text-muted-foreground">Hand wash recommended</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="eco-impact" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <TreePine className="w-5 h-5 text-moss" />
                    Environmental Impact
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-moss/10 rounded-lg">
                      <Recycle className="w-8 h-8 text-moss mx-auto mb-2" />
                      <div className="text-2xl font-bold text-forest">75%</div>
                      <div className="text-sm text-muted-foreground">Less CO₂ than plastic</div>
                    </div>
                    <div className="text-center p-4 bg-moss/10 rounded-lg">
                      <TreePine className="w-8 h-8 text-moss mx-auto mb-2" />
                      <div className="text-2xl font-bold text-forest">1</div>
                      <div className="text-sm text-muted-foreground">Tree planted per purchase</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Customer Reviews ({reviews.length})</h3>
                    {user && !showReviewForm && (
                      <Button onClick={() => setShowReviewForm(true)}>
                        Write a Review
                      </Button>
                    )}
                  </div>

                  {showReviewForm && (
                    <div className="mb-6 p-4 border rounded-lg bg-muted/30">
                      <h4 className="font-semibold mb-4">Write a Review</h4>
                      <div className="space-y-4">
                        <div>
                          <Label>Rating</Label>
                          <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`w-6 h-6 ${
                                    star <= reviewRating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="review-comment">Comment</Label>
                          <Textarea
                            id="review-comment"
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Share your experience with this product..."
                            rows={4}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSubmitReview}
                            disabled={createReviewMutation.isPending}
                          >
                            {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowReviewForm(false);
                              setReviewComment('');
                              setReviewRating(5);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {reviewsLoading ? (
                    <div className="text-center py-8">
                      <div className="w-6 h-6 border-2 border-forest border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-muted-foreground text-sm">Loading reviews...</p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                      {user && !showReviewForm && (
                        <Button onClick={() => setShowReviewForm(true)} className="mt-4">
                          Write a Review
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review: any) => (
                        <div key={review.id} className="border-b border-border pb-4 last:border-b-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">
                              {review.user?.name || review.user?.first_name || 'Anonymous'}
                            </span>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= (review.rating || 0)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;