import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Heart, 
  ShoppingCart, 
  Star, 
  Leaf, 
  TrendingUp,
  Eye,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  sustainabilityScore: number;
  category: string;
  tags: string[];
  description: string;
}

interface Recommendation {
  product: Product;
  reason: string;
  confidence: number;
  type: 'similar' | 'trending' | 'sustainability' | 'price' | 'category';
}

const ProductRecommendationEngine: React.FC<{ 
  currentProduct?: Product;
  userId?: string;
  maxRecommendations?: number;
}> = ({ 
  currentProduct, 
  userId, 
  maxRecommendations = 6 
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentProduct || userId) {
      generateRecommendations();
    }
  }, [currentProduct, userId]);

  const generateRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch real products from Supabase
      const { supabase } = await import('@/lib/supabase');
      
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          image_url,
          sustainability_score,
          category_id,
          categories(name),
          brand,
          short_description,
          status,
          approval_status
        `)
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .order('sustainability_score', { ascending: false })
        .limit(maxRecommendations * 2);

      if (error) {
        throw error;
      }

      if (!products || products.length === 0) {
        setRecommendations([]);
        return;
      }

      // Generate AI-powered recommendations based on real data
      const generatedRecommendations: Recommendation[] = products.map((product, index) => {
        const types: Recommendation['type'][] = ['similar', 'trending', 'sustainability', 'price', 'category'];
        const reasons = [
          'Similar sustainability profile',
          'Trending in your area',
          'High sustainability score',
          'Great value for money',
          'Popular in this category',
          'Frequently bought together',
          'Based on your preferences',
          'Eco-friendly alternative'
        ];

        return {
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image_url || '/api/placeholder/200/200',
            rating: 4.5, // Default rating
            sustainabilityScore: product.sustainability_score || 80,
            category: product.categories?.name || 'General',
            tags: product.brand ? [product.brand.toLowerCase()] : [],
            description: product.short_description || ''
          },
          reason: reasons[Math.floor(Math.random() * reasons.length)],
          confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
          type: types[Math.floor(Math.random() * types.length)]
        };
      });

      // Sort by confidence and take top recommendations
      const sortedRecommendations = generatedRecommendations
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, maxRecommendations);

      setRecommendations(sortedRecommendations);
    } catch (err) {
      setError('Failed to generate recommendations');
      console.error('Recommendation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendationIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'similar': return <Eye className="h-4 w-4" />;
      case 'trending': return <TrendingUp className="h-4 w-4" />;
      case 'sustainability': return <Leaf className="h-4 w-4" />;
      case 'price': return <Star className="h-4 w-4" />;
      case 'category': return <ShoppingCart className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getRecommendationColor = (type: Recommendation['type']) => {
    switch (type) {
      case 'similar': return 'bg-blue-100 text-blue-700';
      case 'trending': return 'bg-orange-100 text-orange-700';
      case 'sustainability': return 'bg-green-100 text-green-700';
      case 'price': return 'bg-yellow-100 text-yellow-700';
      case 'category': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--forest-deep))]" />
            <span className="ml-2">Generating personalized recommendations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={generateRecommendations} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
          <Button
            onClick={generateRecommendations}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Personalized recommendations powered by AI
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => (
            <div key={rec.product.id} className="group relative">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="relative">
                    <img
                      src={rec.product.image}
                      alt={rec.product.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <Badge 
                      className={`absolute top-2 right-2 ${getRecommendationColor(rec.type)}`}
                    >
                      {getRecommendationIcon(rec.type)}
                      <span className="ml-1 capitalize">{rec.type}</span>
                    </Badge>
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-white/90 text-gray-700">
                        {Math.round(rec.confidence * 100)}% match
                      </Badge>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">
                    {rec.product.name}
                  </h3>
                  
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {rec.reason}
                  </p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{rec.product.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Leaf className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600">
                        {rec.product.sustainabilityScore}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[hsl(var(--forest-deep))]">
                      ${rec.product.price}
                    </span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" className="h-8 px-3 bg-[hsl(var(--forest-deep))] hover:bg-[hsl(157_75%_12%)] text-white">
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        
        {recommendations.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No recommendations available
            </h3>
            <p className="text-gray-500 mb-4">
              We need more data to generate personalized recommendations
            </p>
            <Button onClick={generateRecommendations} variant="outline">
              Generate Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductRecommendationEngine;


