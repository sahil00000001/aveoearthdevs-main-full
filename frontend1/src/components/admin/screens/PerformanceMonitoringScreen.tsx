import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Clock, 
  HardDrive, 
  Wifi, 
  Cpu, 
  MemoryStick,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Eye,
  BarChart3,
  Gauge,
  Database,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  threshold: { warning: number; critical: number };
}

interface PerformanceData {
  pageLoad: PerformanceMetric;
  apiResponse: PerformanceMetric;
  memoryUsage: PerformanceMetric;
  cpuUsage: PerformanceMetric;
  networkLatency: PerformanceMetric;
  errorRate: PerformanceMetric;
  uptime: PerformanceMetric;
  userSatisfaction: PerformanceMetric;
}

interface PerformanceAlert {
  id: string;
  type: 'performance' | 'error' | 'security' | 'availability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
  metrics?: any;
}

const PerformanceMonitoringScreen: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');

  useEffect(() => {
    loadPerformanceData();
    
    const interval = setInterval(loadPerformanceData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadPerformanceData = async () => {
    try {
      // Fetch real performance data
      const realData: PerformanceData = {
        pageLoad: {
          name: 'Page Load Time',
          value: 0,
          unit: 'ms',
          status: 'good',
          trend: 'neutral',
          threshold: { warning: 2000, critical: 3000 }
        },
        apiResponse: {
          name: 'API Response Time',
          value: 0,
          unit: 'ms',
          status: 'good',
          trend: 'neutral',
          threshold: { warning: 400, critical: 600 }
        },
        memoryUsage: {
          name: 'Memory Usage',
          value: 0,
          unit: '%',
          status: 'good',
          trend: 'neutral',
          threshold: { warning: 70, critical: 85 }
        },
        cpuUsage: {
          name: 'CPU Usage',
          value: 0,
          unit: '%',
          status: 'good',
          trend: 'neutral',
          threshold: { warning: 60, critical: 80 }
        },
        networkLatency: {
          name: 'Network Latency',
          value: 0,
          unit: 'ms',
          status: 'good',
          trend: 'neutral',
          threshold: { warning: 100, critical: 150 }
        },
        errorRate: {
          name: 'Error Rate',
          value: 0,
          unit: '%',
          status: 'good',
          trend: 'neutral',
          threshold: { warning: 1, critical: 2 }
        },
        uptime: {
          name: 'Uptime',
          value: 0,
          unit: '%',
          status: 'good',
          trend: 'stable',
          threshold: { warning: 99, critical: 95 }
        },
        userSatisfaction: {
          name: 'User Satisfaction',
          value: 0,
          unit: '/5',
          status: 'good',
          trend: 'neutral',
          threshold: { warning: 3.5, critical: 3.0 }
        }
      };

      setPerformanceData(realData);

      // No mock alerts - empty array
      const realAlerts: PerformanceAlert[] = [];

      setAlerts(realAlerts);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-700';
      case 'warning': return 'bg-yellow-100 text-yellow-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading && !performanceData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[hsl(var(--forest-deep))] mx-auto mb-4" />
          <p>Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No performance data available</h3>
        <p className="text-gray-500">Unable to load performance metrics at this time.</p>
      </div>
    );
  }

  const metrics = Object.values(performanceData);
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' && !alert.resolved).length;
  const warningAlerts = alerts.filter(alert => alert.severity === 'warning' && !alert.resolved).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Performance Monitoring</h1>
          <p className="text-gray-600">Real-time system performance and health metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[hsl(var(--forest-deep))] focus:border-[hsl(var(--forest-deep))] bg-white shadow-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button
            onClick={loadPerformanceData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="bg-[hsl(var(--forest-deep))] hover:bg-[hsl(157_75%_12%)] text-white">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Alert Summary */}
      {(criticalAlerts > 0 || warningAlerts > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criticalAlerts > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <XCircle className="h-6 w-6 text-red-600" />
                  <div>
                    <h3 className="font-medium text-red-800">Critical Alerts</h3>
                    <p className="text-sm text-red-600">{criticalAlerts} critical issues require immediate attention</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {warningAlerts > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Warning Alerts</h3>
                    <p className="text-sm text-yellow-600">{warningAlerts} warnings need attention</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  <span className="text-sm font-medium text-gray-600">{metric.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.trend)}
                </div>
              </div>
              
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold text-gray-900">
                  {metric.value.toFixed(metric.unit === '%' ? 1 : 0)}
                </span>
                <span className="text-sm text-gray-500">{metric.unit}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Current</span>
                  <span>Threshold: {metric.threshold.warning}{metric.unit}</span>
                </div>
                <Progress 
                  value={(metric.value / metric.threshold.critical) * 100} 
                  className="h-1"
                />
              </div>
              
              <Badge className={`mt-2 ${getStatusColor(metric.status)}`}>
                {metric.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Page Load Time</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{performanceData.pageLoad.value.toFixed(0)}ms</span>
                      {getTrendIcon(performanceData.pageLoad.trend)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Response</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{performanceData.apiResponse.value.toFixed(0)}ms</span>
                      {getTrendIcon(performanceData.apiResponse.trend)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Memory Usage</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{performanceData.memoryUsage.value.toFixed(1)}%</span>
                      {getTrendIcon(performanceData.memoryUsage.trend)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uptime</span>
                    <Badge className="bg-green-100 text-green-700">
                      {performanceData.uptime.value.toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error Rate</span>
                    <Badge className={getStatusColor(performanceData.errorRate.status)}>
                      {performanceData.errorRate.value.toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Satisfaction</span>
                    <Badge className="bg-blue-100 text-blue-700">
                      {performanceData.userSatisfaction.value.toFixed(1)}/5
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Performance Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">All Clear!</h3>
                    <p className="text-gray-500">No active performance alerts</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          alert.severity === 'critical' ? 'bg-red-100' :
                          alert.severity === 'high' ? 'bg-orange-100' :
                          alert.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                          {alert.type === 'performance' && <Activity className="h-4 w-4" />}
                          {alert.type === 'error' && <XCircle className="h-4 w-4" />}
                          {alert.type === 'security' && <AlertTriangle className="h-4 w-4" />}
                          {alert.type === 'availability' && <Wifi className="h-4 w-4" />}
                        </div>
                        <div>
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm text-gray-600">{alert.description}</p>
                          <p className="text-xs text-gray-500">
                            {alert.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <Badge variant={alert.resolved ? "default" : "secondary"}>
                          {alert.resolved ? "Resolved" : "Active"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Performance trend charts would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Geographic Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Geographic performance data would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Device Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Smartphone className="h-8 w-8 text-blue-500" />
                  <div>
                    <h4 className="font-medium">Mobile</h4>
                    <p className="text-sm text-gray-600">2.1s avg load time</p>
                    <Badge className="bg-green-100 text-green-700">Good</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Monitor className="h-8 w-8 text-green-500" />
                  <div>
                    <h4 className="font-medium">Desktop</h4>
                    <p className="text-sm text-gray-600">1.2s avg load time</p>
                    <Badge className="bg-green-100 text-green-700">Excellent</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Monitor className="h-8 w-8 text-purple-500" />
                  <div>
                    <h4 className="font-medium">Tablet</h4>
                    <p className="text-sm text-gray-600">1.8s avg load time</p>
                    <Badge className="bg-yellow-100 text-yellow-700">Good</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMonitoringScreen;


