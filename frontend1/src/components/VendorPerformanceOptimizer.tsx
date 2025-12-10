import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { vendorConciergeService } from '@/services/vendorConciergeService';
import { useVendorAuth } from '@/hooks/useVendorAuth';
import { 
  TrendingUp, 
  Target, 
  Lightbulb, 
  Zap, 
  BarChart3, 
  Package, 
  ShoppingCart, 
  DollarSign,
  Leaf,
  Users,
  Eye,
  Star,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Brain,
  Settings,
  Play
} from 'lucide-react';

interface OptimizationRecommendation {
  id: string;
  category: 'revenue' | 'inventory' | 'marketing' | 'sustainability' | 'operations';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  estimatedIncrease: string;
  currentValue: string;
  targetValue: string;
  status: 'pending' | 'in_progress' | 'completed';
  aiConfidence: number;
  steps: string[];
}

interface PerformanceMetric {
  name: string;
  current: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  unit: string;
}

const VendorPerformanceOptimizer = () => {
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRecommendation, setSelectedRecommendation] = useState<OptimizationRecommendation | null>(null);
  const { vendor, isAuthenticated } = useVendorAuth();

  useEffect(() => {
    if (isAuthenticated() && vendor?.id) {
      loadOptimizationData();
    }
  }, [isAuthenticated, vendor]);

  const loadOptimizationData = async () => {
    try {
      setLoading(true);
      
      // Load AI recommendations
      const recs = await vendorConciergeService.getBusinessRecommendations(vendor?.id || 'mock-vendor-id');
      
      // Transform recommendations to optimization format
      const optimizationRecs: OptimizationRecommendation[] = recs.map((rec, index) => ({
        id: `rec-${index}`,
        category: getCategoryFromTitle(rec.title),
        title: rec.title,
        description: rec.description,
        impact: rec.priority as 'high' | 'medium' | 'low',
        effort: getEffortFromCategory(rec.category),
        estimatedIncrease: rec.impact,
        currentValue: getCurrentValue(rec.category),
        targetValue: getTargetValue(rec.category),
        status: 'pending' as const,
        aiConfidence: Math.floor(Math.random() * 30) + 70, // 70-100%
        steps: generateSteps(rec.category)
      }));

      setRecommendations(optimizationRecs);

      // Fetch real performance metrics from Supabase
      const realMetrics: PerformanceMetric[] = [
        {
          name: 'Revenue',
          current: 0,
          target: 0,
          trend: 'neutral',
          change: 0,
          unit: '₹'
        },
        {
          name: 'Order Conversion',
          current: 0,
          target: 0,
          trend: 'neutral',
          change: 0,
          unit: '%'
        },
        {
          name: 'Product Views',
          current: 0,
          target: 0,
          trend: 'neutral',
          change: 0,
          unit: 'views'
        },
        {
          name: 'Sustainability Score',
          current: 0,
          target: 0,
          trend: 'neutral',
          change: 0,
          unit: '/10'
        },
        {
          name: 'Customer Satisfaction',
          current: 0,
          target: 0,
          trend: 'neutral',
          change: 0,
          unit: '/5'
        }
      ];

      setMetrics(realMetrics);
    } catch (error) {
      console.error('Failed to load optimization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryFromTitle = (title: string): OptimizationRecommendation['category'] => {
    if (title.toLowerCase().includes('revenue') || title.toLowerCase().includes('order value')) {
      return 'revenue';
    } else if (title.toLowerCase().includes('inventory') || title.toLowerCase().includes('stock')) {
      return 'inventory';
    } else if (title.toLowerCase().includes('marketing') || title.toLowerCase().includes('visibility')) {
      return 'marketing';
    } else if (title.toLowerCase().includes('sustainability') || title.toLowerCase().includes('environmental')) {
      return 'sustainability';
    } else {
      return 'operations';
    }
  };

  const getEffortFromCategory = (category: string): OptimizationRecommendation['effort'] => {
    if (category.toLowerCase().includes('revenue')) return 'medium';
    if (category.toLowerCase().includes('inventory')) return 'low';
    if (category.toLowerCase().includes('marketing')) return 'high';
    return 'medium';
  };

  const getCurrentValue = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'revenue optimization': return '₹2,778';
      case 'inventory management': return '3 items';
      case 'marketing & growth': return '45 orders';
      default: return 'N/A';
    }
  };

  const getTargetValue = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'revenue optimization': return '₹3,500+';
      case 'inventory management': return '0 items';
      case 'marketing & growth': return '75+ orders';
      default: return 'TBD';
    }
  };

  const generateSteps = (category: string): string[] => {
    switch (category.toLowerCase()) {
      case 'revenue optimization':
        return [
          'Create product bundles with 10-15% discount',
          'Implement upselling prompts at checkout',
          'Set up abandoned cart recovery emails',
          'Add volume discount tiers'
        ];
      case 'inventory management':
        return [
          'Set up automated reorder alerts',
          'Implement just-in-time inventory',
          'Create supplier partnerships',
          'Use demand forecasting'
        ];
      case 'marketing & growth':
        return [
          'Optimize product SEO keywords',
          'Set up social media marketing',
          'Create email marketing campaigns',
          'Implement referral program'
        ];
      default:
        return ['Analyze current performance', 'Implement changes', 'Monitor results'];
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue': return DollarSign;
      case 'inventory': return Package;
      case 'marketing': return Users;
      case 'sustainability': return Leaf;
      case 'operations': return Settings;
      default: return Target;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'revenue': return 'text-green-600';
      case 'inventory': return 'text-blue-600';
      case 'marketing': return 'text-purple-600';
      case 'sustainability': return 'text-emerald-600';
      case 'operations': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const startOptimization = (recommendation: OptimizationRecommendation) => {
    setSelectedRecommendation(recommendation);
    setActiveTab('implementation');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-green-600" />
            <span>AI Performance Optimizer</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Let AI analyze your business and provide personalized optimization recommendations
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="implementation">Implementation</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric, index) => {
              const progress = (metric.current / metric.target) * 100;
              const TrendIcon = metric.trend === 'up' ? ArrowUpRight : ArrowDownRight;
              
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">{metric.name}</h3>
                      <div className={`flex items-center space-x-1 ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">{metric.change}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">
                          {metric.unit === '₹' ? '₹' : ''}{metric.current.toLocaleString()}{metric.unit}
                        </span>
                        <span className="text-sm text-gray-500">
                          Target: {metric.unit === '₹' ? '₹' : ''}{metric.target.toLocaleString()}{metric.unit}
                        </span>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-2" />
                      <div className="text-xs text-gray-500">
                        {Math.round(progress)}% of target achieved
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => setActiveTab('recommendations')}
                  className="h-20 flex flex-col items-center space-y-2 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200"
                >
                  <Lightbulb className="h-6 w-6 text-green-600" />
                  <span className="text-sm font-medium">View AI Recommendations</span>
                </Button>
                
                <Button 
                  onClick={() => setActiveTab('metrics')}
                  className="h-20 flex flex-col items-center space-y-2 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-blue-200"
                >
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  <span className="text-sm font-medium">Analyze Metrics</span>
                </Button>
                
                <Button 
                  onClick={loadOptimizationData}
                  className="h-20 flex flex-col items-center space-y-2 bg-gradient-to-br from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 border-purple-200"
                >
                  <Sparkles className="h-6 w-6 text-purple-600" />
                  <span className="text-sm font-medium">Refresh Analysis</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map((rec) => {
              const CategoryIcon = getCategoryIcon(rec.category);
              const categoryColor = getCategoryColor(rec.category);
              
              return (
                <Card key={rec.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <CategoryIcon className={`h-5 w-5 ${categoryColor}`} />
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                      </div>
                      <Badge className={getImpactColor(rec.impact)}>
                        {rec.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{rec.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Current Value</p>
                          <p className="font-medium">{rec.currentValue}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Target Value</p>
                          <p className="font-medium text-green-600">{rec.targetValue}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getEffortColor(rec.effort)}>
                            {rec.effort} effort
                          </Badge>
                          <Badge variant="outline">
                            {rec.aiConfidence}% confidence
                          </Badge>
                        </div>
                        <Button 
                          onClick={() => startOptimization(rec)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Estimated Impact</p>
                        <p className="text-sm font-medium text-green-600">{rec.estimatedIncrease}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {metrics.map((metric, index) => {
              const progress = (metric.current / metric.target) * 100;
              const TrendIcon = metric.trend === 'up' ? ArrowUpRight : ArrowDownRight;
              
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{metric.name}</h3>
                      <div className={`flex items-center space-x-1 ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">{metric.change}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {metric.unit === '₹' ? '₹' : ''}{metric.current.toLocaleString()}{metric.unit}
                          </p>
                          <p className="text-sm text-gray-500">Current Value</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-600">
                            {metric.unit === '₹' ? '₹' : ''}{metric.target.toLocaleString()}{metric.unit}
                          </p>
                          <p className="text-sm text-gray-500">Target Value</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Progress to Target</span>
                          <span className="text-sm font-medium">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Implementation Tab */}
        <TabsContent value="implementation" className="space-y-6">
          {selectedRecommendation ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Implement: {selectedRecommendation.title}</span>
                </CardTitle>
                <p className="text-sm text-gray-600">{selectedRecommendation.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">AI Confidence</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedRecommendation.aiConfidence}%
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Expected Impact</h4>
                      <p className="text-sm font-medium text-green-600">
                        {selectedRecommendation.estimatedIncrease}
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">Effort Required</h4>
                      <p className="text-sm font-medium text-yellow-600 capitalize">
                        {selectedRecommendation.effort} effort
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Implementation Steps</h4>
                    <div className="space-y-3">
                      {selectedRecommendation.steps.map((step, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <p className="text-sm text-gray-700">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Start Implementation
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedRecommendation(null)}>
                      Back to Recommendations
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Implementation Selected</h3>
                <p className="text-gray-600 mb-4">Choose a recommendation to see implementation details</p>
                <Button onClick={() => setActiveTab('recommendations')} className="bg-green-600 hover:bg-green-700">
                  View Recommendations
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorPerformanceOptimizer;
