import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { runVerificationTests, runStressTest } from '../../../utils/verificationTest';
import { runBackendStressTest, runQuickHealthCheck, runAITest } from '../../../utils/backendStressTest';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap, 
  Brain, 
  Server, 
  AlertTriangle,
  BarChart3,
  Loader2
} from 'lucide-react';

interface TestResult {
  name: string;
  status: 'running' | 'passed' | 'failed' | 'pending';
  duration?: number;
  details?: any;
  error?: string;
}

const TestingScreen: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setTests(prev => [...prev, { name: testName, status: 'running' }]);
    
    try {
      const startTime = Date.now();
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      setTests(prev => prev.map(t => 
        t.name === testName 
          ? { ...t, status: 'passed', duration, details: result }
          : t
      ));
    } catch (error) {
      setTests(prev => prev.map(t => 
        t.name === testName 
          ? { ...t, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' }
          : t
      ));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setTests([]);
    
    const testSuite = [
      { name: 'Product Verification Tests', fn: runVerificationTests },
      { name: 'Verification Stress Test', fn: () => runStressTest(50) },
      { name: 'Backend Health Check', fn: () => runQuickHealthCheck() },
      { name: 'AI Endpoint Tests', fn: () => runAITest() },
      { name: 'Full Backend Stress Test', fn: () => runBackendStressTest() }
    ];
    
    for (let i = 0; i < testSuite.length; i++) {
      const test = testSuite[i];
      setProgress((i / testSuite.length) * 100);
      await runTest(test.name, test.fn);
    }
    
    setProgress(100);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-700';
      case 'passed':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const totalTests = tests.length;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">System Testing & Monitoring</h1>
        <Button 
          onClick={runAllTests} 
          disabled={isRunning}
          className="bg-[hsl(var(--forest-deep))] hover:bg-[hsl(157_75%_12%)] text-white"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run All Tests
            </>
          )}
        </Button>
      </div>

      {/* Test Summary */}
      {totalTests > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Tests</p>
                  <p className="text-2xl font-bold">{totalTests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Passed</p>
                  <p className="text-2xl font-bold text-green-600">{passedTests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{failedTests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress Bar */}
      {isRunning && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Running tests...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Test Results</h2>
        
        {tests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No tests run yet</h3>
              <p className="text-gray-500">Click "Run All Tests" to start comprehensive system testing</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tests.map((test, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <h3 className="font-medium text-gray-900">{test.name}</h3>
                        {test.duration && (
                          <p className="text-sm text-gray-500">
                            Completed in {test.duration}ms
                          </p>
                        )}
                        {test.error && (
                          <p className="text-sm text-red-600 mt-1">{test.error}</p>
                        )}
                      </div>
                    </div>
                    
                    <Badge className={getStatusColor(test.status)}>
                      {test.status}
                    </Badge>
                  </div>
                  
                  {test.details && test.status === 'passed' && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Test Details:</h4>
                      <pre className="text-xs text-gray-600 overflow-x-auto">
                        {JSON.stringify(test.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              onClick={() => runTest('Health Check', () => runQuickHealthCheck())}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Server className="h-4 w-4" />
              Health Check
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => runTest('AI Test', () => runAITest())}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              AI Test
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => runTest('Verification Test', () => runVerificationTests())}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Verification Test
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestingScreen;

















