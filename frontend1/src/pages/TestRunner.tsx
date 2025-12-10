import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { automatedTester } from '../utils/automatedTester';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  Loader2,
  Download,
  RefreshCw,
  Bug,
  Shield,
  Zap,
  Eye,
  Smartphone,
  Database,
  Monitor
} from 'lucide-react';

interface TestResult {
  success: boolean;
  message: string;
  details: any;
  timestamp: Date;
}

const TestRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);
    setCurrentTest('Initializing automated testing...');

    try {
      // Clear previous results
      automatedTester.clearResults();

      // Run the full system test
      await automatedTester.runFullSystemTest();

      // Get results
      const testResults = automatedTester.getResults();
      setResults(testResults);

      setCurrentTest('Testing completed!');
      setProgress(100);

    } catch (error) {
      console.error('Test execution failed:', error);
      setCurrentTest('Testing failed!');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  };

  const getTestIcon = (message: string) => {
    if (message.includes('System Health')) return <Monitor className="h-4 w-4" />;
    if (message.includes('Frontend')) return <Monitor className="h-4 w-4" />;
    if (message.includes('Backend')) return <Database className="h-4 w-4" />;
    if (message.includes('AI')) return <Zap className="h-4 w-4" />;
    if (message.includes('Performance')) return <Zap className="h-4 w-4" />;
    if (message.includes('Security')) return <Shield className="h-4 w-4" />;
    if (message.includes('Accessibility')) return <Eye className="h-4 w-4" />;
    if (message.includes('PWA')) return <Smartphone className="h-4 w-4" />;
    if (message.includes('Comprehensive')) return <Bug className="h-4 w-4" />;
    if (message.includes('Bug')) return <Bug className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  const failedTests = results.filter(r => !r.success).length;
  const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Automated Test Runner
          </h1>
          <p className="text-xl text-gray-600">
            Comprehensive testing and debugging for the entire website
          </p>
        </div>

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-6 w-6" />
              Test Control Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={runTests}
                  disabled={isRunning}
                  className="bg-[hsl(var(--forest-deep))] hover:bg-[hsl(157_75%_12%)] text-white px-8 py-3"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Run All Tests
                    </>
                  )}
                </Button>
                
                {results.length > 0 && (
                  <Button
                    onClick={() => {
                      const data = {
                        timestamp: new Date().toISOString(),
                        totalTests,
                        passedTests,
                        failedTests,
                        successRate,
                        results
                      };
                      const dataStr = JSON.stringify(data, null, 2);
                      const dataBlob = new Blob([dataStr], { type: 'application/json' });
                      const url = URL.createObjectURL(dataBlob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `test-results-${new Date().toISOString()}.json`;
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

              <div className="text-right">
                <div className="text-2xl font-bold text-[hsl(var(--forest-deep))]">
                  {successRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        {isRunning && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-800">Running Automated Tests</h3>
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

        {/* Summary Stats */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Tests</p>
                    <p className="text-2xl font-bold">{totalTests}</p>
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
                    <p className="text-2xl font-bold text-green-600">{passedTests}</p>
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
                    <p className="text-2xl font-bold text-red-600">{failedTests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-purple-600">{successRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Test Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(result.success)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getTestIcon(result.message)}
                        <h4 className="font-medium text-sm">{result.message}</h4>
                        <Badge className={getStatusColor(result.success)}>
                          {result.success ? 'PASS' : 'FAIL'}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-2">
                        {result.timestamp.toLocaleString()}
                      </p>
                      
                      {result.details && (
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Test Categories</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• System Health Check</li>
                    <li>• Frontend Components</li>
                    <li>• Backend Integration</li>
                    <li>• AI Features</li>
                    <li>• Performance Testing</li>
                    <li>• Security Analysis</li>
                    <li>• Accessibility Check</li>
                    <li>• PWA Features</li>
                    <li>• Comprehensive Testing</li>
                    <li>• Bug Detection & Fixing</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">What Gets Tested</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Component rendering and functionality</li>
                    <li>• API endpoints and responses</li>
                    <li>• Performance metrics and optimization</li>
                    <li>• Security vulnerabilities</li>
                    <li>• Accessibility compliance</li>
                    <li>• PWA installation and features</li>
                    <li>• Memory usage and leaks</li>
                    <li>• Error handling and boundaries</li>
                    <li>• Cross-browser compatibility</li>
                    <li>• Real-time functionality</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestRunner;

















