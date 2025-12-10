import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { enhancedApi } from '@/services/enhancedApi';

interface ServiceStatus {
  backend: boolean;
  ai: boolean;
  verification: boolean;
}

const ServiceStatus = () => {
  const [status, setStatus] = useState<ServiceStatus>({
    backend: false,
    ai: false,
    verification: false,
  });
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkServices = async () => {
    setLoading(true);
    try {
      const serviceStatus = await enhancedApi.checkAllServices();
      setStatus(serviceStatus);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Error checking services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkServices();
    // Check services every 30 seconds
    const interval = setInterval(checkServices, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (isConnected: boolean) => {
    if (loading) {
      return <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />;
    }
    return isConnected ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusBadge = (isConnected: boolean) => {
    return (
      <Badge
        variant={isConnected ? 'default' : 'destructive'}
        className={isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
      >
        {isConnected ? 'Connected' : 'Offline'}
      </Badge>
    );
  };

  const allServicesConnected = status.backend && status.ai && status.verification;
  const someServicesConnected = status.backend || status.ai || status.verification;

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Service Status</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={checkServices}
            disabled={loading}
            className="h-8"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {lastChecked && (
            <span className="text-xs text-gray-500">
              Last checked: {lastChecked.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Backend Service */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            {getStatusIcon(status.backend)}
            <div>
              <p className="font-medium text-sm">Backend API</p>
              <p className="text-xs text-gray-500">Core e-commerce services</p>
            </div>
          </div>
          {getStatusBadge(status.backend)}
        </div>

        {/* AI Service */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            {getStatusIcon(status.ai)}
            <div>
              <p className="font-medium text-sm">AI Assistant</p>
              <p className="text-xs text-gray-500">Smart chatbot & recommendations</p>
            </div>
          </div>
          {getStatusBadge(status.ai)}
        </div>

        {/* Product Verification Service */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            {getStatusIcon(status.verification)}
            <div>
              <p className="font-medium text-sm">Product Verification</p>
              <p className="text-xs text-gray-500">AI-powered image verification</p>
            </div>
          </div>
          {getStatusBadge(status.verification)}
        </div>
      </div>

      {/* Overall Status */}
      <div className="mt-4 p-3 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {allServicesConnected ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : someServicesConnected ? (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="font-medium">
              {allServicesConnected
                ? 'All Services Connected'
                : someServicesConnected
                ? 'Partial Service Availability'
                : 'All Services Offline'}
            </span>
          </div>
          <Badge
            variant={allServicesConnected ? 'default' : 'secondary'}
            className={
              allServicesConnected
                ? 'bg-green-100 text-green-800'
                : someServicesConnected
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }
          >
            {allServicesConnected
              ? 'Fully Operational'
              : someServicesConnected
              ? 'Limited Functionality'
              : 'Offline Mode'}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {allServicesConnected
            ? 'All features are available and working optimally.'
            : someServicesConnected
            ? 'Some features may be limited. Core functionality is available with fallback options.'
            : 'Running in offline mode with limited functionality. Some features may not work as expected.'}
        </p>
      </div>
    </Card>
  );
};

export default ServiceStatus;
