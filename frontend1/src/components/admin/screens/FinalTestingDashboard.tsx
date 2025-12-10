import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { comprehensiveTester } from '../../../utils/comprehensiveTester';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Zap,
  Shield,
  Bug,
  Activity,
  Database,
  Globe,
  Smartphone,
  Monitor,
  Loader2,
  RefreshCw,
  Download,
  BarChart3,
  Cpu,
  HardDrive,
  Wifi,
  Eye,
  Settings,
  Wrench,
  TestTube,
  Target,
  FileText,
  Code,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Star,
  Award,
  Trophy,
  Flag
} from 'lucide-react';

interface TestResult {
  timestamp: Date;
  duration: number;
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    warnings: number;
    bugsFound: number;
    bugsFixed: number;
    healthScore: number;
  };
  debugReport: any;
  bugReport: any;
  performance: {
    pageLoadTime: number;
    memoryUsage: number;
    bundleSize: number;
    apiResponseTime: number;
  };
  security: {
    vulnerabilities: number;
    xssProtection: boolean;
    csrfProtection: boolean;
    inputValidation: boolean;
  };
  accessibility: {
    ariaLabels: number;
    keyboardNavigation: boolean;
    colorContrast: boolean;
    altText: number;
  };
  recommendations: string[];
}

const FinalTestingDashboard: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    // Load test history from localStorage
    const savedHistory = localStorage.getItem('testHistory');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setTestHistory(history);
      } catch (error) {
        console.error('Failed to load test history:', error);
      }
    }
  }, []);

  const runComprehensiveTest = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setProgress(0);
    setCurrentTest('Initializing comprehensive testing...');
    setTestResult(null);

    try {
      const result = await comprehensiveTester.runComprehensiveTest(
        (progress, message) => {
          setProgress(progress);
          setCurrentTest(message);
        },
        (result) => {
          setTestResult(result);
          setTestHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
          localStorage.setItem('testHistory', JSON.stringify([result, ...testHistory.slice(0, 9)]));
        }
      );

      setTestResult(result);
      setTestHistory(prev => [result, ...prev.slice(0, 9)]);
      localStorage.setItem('testHistory', JSON.stringify([result, ...testHistory.slice(0, 9)]));

    } catch (error) {
      console.error('Comprehensive test failed:', error);
      setCurrentTest('Testing failed!');
    } finally {
      setIsRunning(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    if (score >= 50) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
      case 'passed':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
      case 'passed':
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'fail':
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'running':
        return 'bg-blue-100 text-blue-700';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Final Testing Dashboard</h1>
          <p className="text-gray-600">Comprehensive testing and debugging for the entire website</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={runComprehensiveTest}
            disabled={isRunning}
            className="bg-[hsl(var(--forest-deep))] hover:bg-[hsl(157_75%_12%)] text-white px-6 py-3"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Run Comprehensive Test
              </>
            )}
          </Button>
          {testResult && (
            <Button
              onClick={() => {
                const dataStr = JSON.stringify(testResult, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `comprehensive-test-result-${new Date().toISOString()}.json`;
                link.click();
              }}
              variant="outline"
              className="px-6 py-3"
            >
              <Download className="h-5 w-5 mr-2" />
              Export Results
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      {isRunning && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-800">Running Comprehensive Tests</h3>
                  <p className="text-sm text-blue-600">{currentTest}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full h-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {testResult && (
        <div className="space-y-6">
          {/* Health Score */}
          <Card className={`border-2 ${getHealthScoreBg(testResult.summary.healthScore)}`}>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  <h2 className="text-2xl font-bold">Overall Health Score</h2>
                </div>
                <div className={`text-6xl font-bold ${getHealthScoreColor(testResult.summary.healthScore)} mb-2`}>
                  {testResult.summary.healthScore}
                </div>
                <p className="text-lg text-gray-600">out of 100</p>
                <div className="mt-4">
                  <Badge className={`${getHealthScoreBg(testResult.summary.healthScore)} text-lg px-4 py-2`}>
                    {testResult.summary.healthScore >= 90 ? 'Excellent' : 
                     testResult.summary.healthScore >= 70 ? 'Good' : 
                     testResult.summary.healthScore >= 50 ? 'Fair' : 'Needs Improvement'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TestTube className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Tests</p>
                    <p className="text-2xl font-bold">{testResult.summary.totalTests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Passed</p>
                    <p className="text-2xl font-bold text-green-600">{testResult.summary.passed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{testResult.summary.failed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Bug className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">Bugs Found</p>
                    <p className="text-2xl font-bold text-orange-600">{testResult.summary.bugsFound}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Results */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
              <TabsTrigger value="bugs">Bugs</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Test Results Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Total Tests</span>
                        <Badge variant="outline">{testResult.summary.totalTests}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Passed</span>
                        <Badge className="bg-green-100 text-green-700">{testResult.summary.passed}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Failed</span>
                        <Badge className="bg-red-100 text-red-700">{testResult.summary.failed}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Warnings</span>
                        <Badge className="bg-yellow-100 text-yellow-700">{testResult.summary.warnings}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Bugs Found</span>
                        <Badge className="bg-orange-100 text-orange-700">{testResult.summary.bugsFound}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Bugs Fixed</span>
                        <Badge className="bg-green-100 text-green-700">{testResult.summary.bugsFixed}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Test Duration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-[hsl(var(--forest-deep))] mb-2">
                        {Math.round(testResult.duration / 1000)}s
                      </div>
                      <p className="text-gray-600">Total test execution time</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="h-5 w-5" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Page Load Time</span>
                        <Badge className={testResult.performance.pageLoadTime > 3000 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                          {testResult.performance.pageLoadTime.toFixed(0)}ms
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Memory Usage</span>
                        <Badge className={testResult.performance.memoryUsage > 100 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                          {testResult.performance.memoryUsage}MB
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Bundle Size</span>
                        <Badge className={testResult.performance.bundleSize > 1000 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                          {testResult.performance.bundleSize}KB
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>API Response Time</span>
                        <Badge className={testResult.performance.apiResponseTime > 500 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                          {testResult.performance.apiResponseTime.toFixed(0)}ms
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Performance trend charts would be displayed here</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-gray-600">Vulnerabilities</p>
                        <p className="text-2xl font-bold text-red-600">{testResult.security.vulnerabilities}</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-gray-600">XSS Protection</p>
                        <p className="text-2xl font-bold text-green-600">{testResult.security.xssProtection ? '✓' : '✗'}</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-gray-600">CSRF Protection</p>
                        <p className="text-2xl font-bold text-green-600">{testResult.security.csrfProtection ? '✓' : '✗'}</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-gray-600">Input Validation</p>
                        <p className="text-2xl font-bold text-green-600">{testResult.security.inputValidation ? '✓' : '✗'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Accessibility Tab */}
            <TabsContent value="accessibility">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Accessibility Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-gray-600">ARIA Labels</p>
                        <p className="text-2xl font-bold text-blue-600">{testResult.accessibility.ariaLabels}</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-gray-600">Keyboard Navigation</p>
                        <p className="text-2xl font-bold text-green-600">{testResult.accessibility.keyboardNavigation ? '✓' : '✗'}</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-gray-600">Color Contrast</p>
                        <p className="text-2xl font-bold text-green-600">{testResult.accessibility.colorContrast ? '✓' : '✗'}</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-gray-600">Alt Text</p>
                        <p className="text-2xl font-bold text-blue-600">{testResult.accessibility.altText}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bugs Tab */}
            <TabsContent value="bugs">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="h-5 w-5" />
                    Detected Bugs & Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {testResult.bugReport && testResult.bugReport.length > 0 ? (
                      testResult.bugReport.map((bug: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Bug className="h-4 w-4 text-red-500" />
                              <h4 className="font-medium">{bug.title}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getSeverityColor(bug.severity)}>
                                {bug.severity}
                              </Badge>
                              <Badge variant="outline">
                                {bug.category}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{bug.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Priority: {bug.priority}/10</span>
                            <span>Status: {bug.status}</span>
                            <span>Created: {new Date(bug.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No bugs detected!</h3>
                        <p className="text-gray-500">The system is running smoothly</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {testResult.recommendations.length > 0 ? (
                      testResult.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                          <Flag className="h-5 w-5 text-blue-500 mt-0.5" />
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Award className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No recommendations!</h3>
                        <p className="text-gray-500">The system is performing optimally</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Test History */}
      {testHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Test History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testHistory.slice(0, 5).map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getHealthScoreBg(result.summary.healthScore)}`}></div>
                    <div>
                      <p className="font-medium">Test #{testHistory.length - index}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(result.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Health Score</p>
                      <p className={`text-lg font-bold ${getHealthScoreColor(result.summary.healthScore)}`}>
                        {result.summary.healthScore}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Tests</p>
                      <p className="text-lg font-bold">
                        {result.summary.passed}/{result.summary.totalTests}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="text-lg font-bold">
                        {Math.round(result.duration / 1000)}s
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinalTestingDashboard;

















