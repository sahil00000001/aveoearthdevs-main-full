import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Wifi, 
  Battery, 
  X,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Leaf,
  ShoppingBag,
  Heart,
  Star
} from 'lucide-react';

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [installStep, setInstallStep] = useState(0);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as any);
      setShowInstallBanner(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setInstallStep(1);
      } else {
        setInstallStep(2);
      }
    } catch (error) {
      console.error('Installation failed:', error);
      setInstallStep(3);
    }
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
    // Store dismissal in localStorage to not show again for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const getInstallSteps = () => [
    {
      icon: <Download className="h-6 w-6" />,
      title: "Install AveoEarth",
      description: "Add to your home screen for quick access",
      action: "Tap Install"
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Installation Complete",
      description: "AveoEarth is now installed on your device",
      action: "Open App"
    },
    {
      icon: <X className="h-6 w-6" />,
      title: "Installation Declined",
      description: "You can install later from your browser menu",
      action: "Maybe Later"
    },
    {
      icon: <X className="h-6 w-6" />,
      title: "Installation Failed",
      description: "Something went wrong. Please try again later",
      action: "Try Again"
    }
  ];

  const getFeatures = () => [
    {
      icon: <Leaf className="h-5 w-5" />,
      title: "Sustainable Shopping",
      description: "Discover eco-friendly products"
    },
    {
      icon: <ShoppingBag className="h-5 w-5" />,
      title: "Quick Checkout",
      description: "Fast and secure payments"
    },
    {
      icon: <Heart className="h-5 w-5" />,
      title: "Wishlist & Favorites",
      description: "Save products you love"
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "Loyalty Rewards",
      description: "Earn points and get discounts"
    }
  ];

  if (isInstalled) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-medium text-green-800">App Installed</h3>
              <p className="text-sm text-green-600">AveoEarth is installed on your device</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!showInstallBanner) {
    return null;
  }

  const steps = getInstallSteps();
  const currentStep = steps[installStep];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-[hsl(var(--forest-deep))]" />
              Install App
            </CardTitle>
            <Button
              onClick={dismissBanner}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Step */}
          <div className="flex items-center gap-3 p-3 bg-[hsl(var(--forest-deep))]/5 rounded-lg">
            <div className="p-2 bg-[hsl(var(--forest-deep))]/10 rounded-full">
              {currentStep.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{currentStep.title}</h4>
              <p className="text-sm text-gray-600">{currentStep.description}</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">App Features:</h4>
            <div className="grid grid-cols-2 gap-2">
              {getFeatures().map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className="text-[hsl(var(--forest-deep))]">
                    {feature.icon}
                  </div>
                  <div>
                    <p className="font-medium">{feature.title}</p>
                    <p className="text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Why Install?</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <Battery className="h-3 w-3 text-green-500" />
                <span>Faster loading and better performance</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Wifi className="h-3 w-3 text-blue-500" />
                <span>Works offline with cached content</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Smartphone className="h-3 w-3 text-purple-500" />
                <span>Native app-like experience</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Monitor className="h-3 w-3 text-orange-500" />
                <span>Push notifications for updates</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-[hsl(var(--forest-deep))] hover:bg-[hsl(157_75%_12%)] text-white"
              disabled={installStep === 1}
            >
              {installStep === 0 && (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Install Now
                </>
              )}
              {installStep === 1 && (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Installed!
                </>
              )}
              {installStep === 2 && (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Maybe Later
                </>
              )}
              {installStep === 3 && (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
            <Button
              onClick={dismissBanner}
              variant="outline"
              className="px-4"
            >
              Dismiss
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === installStep 
                    ? 'bg-[hsl(var(--forest-deep))]' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstaller;

















