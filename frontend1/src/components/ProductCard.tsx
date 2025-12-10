import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Star, Leaf } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  sustainabilityScore: number;
  category: string;
  tags: string[];
  description: string;
  inStock: boolean;
  onSale: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist,
  onViewDetails
}) => {
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleAddToWishlist = () => {
    if (onAddToWishlist) {
      onAddToWishlist(product);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product);
    }
  };

  return (
    <Card className="mobile-product-card group hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product.image}
            alt={product.name}
            className="mobile-product-image group-hover:scale-105 transition-transform duration-300"
          />
          {product.onSale && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              Sale
            </Badge>
          )}
          <Button
            onClick={handleAddToWishlist}
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-600 hover:text-red-500"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="mobile-product-info">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="mobile-text-sm">
              {product.category}
            </Badge>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="mobile-text-sm font-medium">{product.rating}</span>
            </div>
          </div>
          
          <CardTitle className="mobile-heading-3 line-clamp-2 group-hover:text-[hsl(var(--forest-deep))] transition-colors">
            {product.name}
          </CardTitle>
          
          <p className="mobile-text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-green-500" />
            <span className="text-xs text-green-600 font-medium">
              {product.sustainabilityScore}% Sustainable
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[hsl(var(--forest-deep))]">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            
            <div className="flex gap-1">
              <Button
                onClick={handleViewDetails}
                variant="outline"
                size="sm"
                className="mobile-touch-target mobile-touch-feedback mobile-text-sm"
              >
                View
              </Button>
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                size="sm"
                className="mobile-touch-target mobile-touch-feedback bg-[hsl(var(--forest-deep))] hover:bg-[hsl(157_75%_12%)] text-white mobile-text-sm"
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
          </div>
          
          {!product.inStock && (
            <Badge variant="destructive" className="w-full justify-center">
              Out of Stock
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;






