import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle, 
  ArrowRight, 
  Leaf, 
  BarChart3, 
  Package, 
  Users,
  Award,
  Sparkles
} from 'lucide-react';

const OnboardingComplete: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate('/vendor/dashboard');
  };

  const features = [
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track your sales, orders, and performance metrics'
    },
    {
      icon: Package,
      title: 'Product Management',
      description: 'Add, edit, and manage your product catalog'
    },
    {
      icon: Users,
      title: 'Customer Insights',
      description: 'Understand your customers and their preferences'
    },
    {
      icon: Award,
      title: 'Sustainability Impact',
      description: 'Monitor your environmental and social impact'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest/5 via-background to-moss/5 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-forest to-moss rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <h1 className="text-4xl font-headline font-bold text-charcoal">
                Welcome to AveoEarth!
              </h1>
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <p className="text-xl text-charcoal/70 mb-2">
              Your vendor account has been successfully created
            </p>
            <p className="text-charcoal/60">
              You're now ready to start selling sustainable products on our platform
            </p>
          </div>

          {/* What's Next */}
          <div className="mb-8">
            <h2 className="text-2xl font-headline font-bold text-charcoal mb-6">
              What's Next?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="p-4 border-2 border-forest/10 rounded-xl hover:border-forest/20 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-forest/10 rounded-full flex items-center justify-center">
                        <Icon className="w-4 h-4 text-forest" />
                      </div>
                      <h3 className="font-semibold text-charcoal">{feature.title}</h3>
                    </div>
                    <p className="text-sm text-charcoal/70 text-left">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mb-8 p-6 bg-gradient-to-br from-forest/5 to-moss/5 rounded-xl border border-forest/10">
            <h3 className="font-semibold text-charcoal mb-4">Your Impact Starts Now</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-forest">0</div>
                <div className="text-sm text-charcoal/70">Products Listed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-forest">0</div>
                <div className="text-sm text-charcoal/70">Orders Received</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-forest">0</div>
                <div className="text-sm text-charcoal/70">Trees Planted</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              onClick={handleGoToDashboard}
              className="btn-primary px-8 py-3 text-lg w-full md:w-auto"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <div className="text-sm text-charcoal/60">
              Need help getting started?{' '}
              <a href="/vendor/support" className="text-forest hover:text-moss font-medium">
                Contact our support team
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-forest/10">
            <div className="flex items-center justify-center gap-2 text-charcoal/60">
              <Leaf className="w-4 h-4" />
              <span className="text-sm">Thank you for choosing sustainable commerce</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingComplete;
