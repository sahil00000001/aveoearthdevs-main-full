import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { supabase } from '@/lib/supabase';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  User, 
  Mail, 
  Lock, 
  Eye,
  EyeOff,
  Facebook,
  Loader2,
  Settings,
  Database,
  Globe,
  Shield
} from 'lucide-react';

// Google icon component as a simple SVG
const GoogleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

interface AuthTestResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: any;
}

const AuthDebugger: React.FC = () => {
  const { user, userProfile, session, loading, signUp, signIn, signInWithGoogle, signInWithFacebook, signOut } = useAuth();
  
  // Test states
  const [testResults, setTestResults] = useState<AuthTestResult[]>([]);
  const [runningTests, setRunningTests] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('buyer');
  const [showPassword, setShowPassword] = useState(false);
  
  // Environment check
  const [envStatus, setEnvStatus] = useState<any>(null);
  
  useEffect(() => {
    checkEnvironment();
  }, []);

  const checkEnvironment = () => {
    const env = {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      backendUrl: import.meta.env.VITE_BACKEND_URL,
      aiServiceUrl: import.meta.env.VITE_AI_SERVICE_URL,
      hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
      hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      hasBackendUrl: !!import.meta.env.VITE_BACKEND_URL,
      hasAiServiceUrl: !!import.meta.env.VITE_AI_SERVICE_URL
    };
    setEnvStatus(env);
  };

  const addTestResult = (test: string, status: AuthTestResult['status'], message: string, details?: any) => {
    setTestResults(prev => [...prev, { test, status, message, details }]);
  };

  const runComprehensiveTests = async () => {
    setRunningTests(true);
    setTestResults([]);
    
    try {
      // Test 1: Environment Variables
      addTestResult('Environment Check', 'pending', 'Checking environment variables...');
      
      if (!envStatus?.hasSupabaseUrl || !envStatus?.hasSupabaseKey) {
        addTestResult('Environment Check', 'error', 'Missing Supabase environment variables');
      } else {
        addTestResult('Environment Check', 'success', 'All required environment variables present');
      }
      
      // Test 2: Supabase Connection
      addTestResult('Supabase Connection', 'pending', 'Testing Supabase connection...');
      
      try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) {
          addTestResult('Supabase Connection', 'error', `Supabase connection failed: ${error.message}`);
        } else {
          addTestResult('Supabase Connection', 'success', 'Supabase connection successful');
        }
      } catch (error) {
        addTestResult('Supabase Connection', 'error', `Supabase connection error: ${error}`);
      }
      
      // Test 3: Backend Connection
      addTestResult('Backend Connection', 'pending', 'Testing backend connection...');
      
      try {
        const response = await fetch(`${envStatus?.backendUrl || 'http://localhost:8080'}/`);
        if (response.ok) {
          addTestResult('Backend Connection', 'success', 'Backend connection successful');
        } else {
          addTestResult('Backend Connection', 'warning', `Backend responded with status: ${response.status}`);
        }
      } catch (error) {
        addTestResult('Backend Connection', 'warning', `Backend connection failed: ${error}`);
      }
      
      // Test 4: Auth Context
      addTestResult('Auth Context', 'pending', 'Checking auth context...');
      
      if (loading) {
        addTestResult('Auth Context', 'warning', 'Auth context is still loading');
      } else {
        addTestResult('Auth Context', 'success', 'Auth context initialized');
      }
      
      // Test 5: Current Session
      addTestResult('Current Session', 'pending', 'Checking current session...');
      
      if (session) {
        addTestResult('Current Session', 'success', `User logged in: ${user?.email}`);
      } else {
        addTestResult('Current Session', 'warning', 'No active session');
      }
      
      // Test 6: User Profile
      addTestResult('User Profile', 'pending', 'Checking user profile...');
      
      if (userProfile) {
        addTestResult('User Profile', 'success', `Profile loaded: ${userProfile.name} (${userProfile.role})`);
      } else if (user) {
        addTestResult('User Profile', 'warning', 'User exists but no profile found');
      } else {
        addTestResult('User Profile', 'warning', 'No user profile available');
      }
      
    } catch (error) {
      addTestResult('Test Suite', 'error', `Test suite failed: ${error}`);
    } finally {
      setRunningTests(false);
    }
  };

  const testEmailSignup = async () => {
    if (!email || !password || !name) {
      addTestResult('Email Signup', 'error', 'Please fill in all required fields');
      return;
    }
    
    addTestResult('Email Signup', 'pending', 'Testing email signup...');
    
    try {
      const { error } = await signUp(email, password, name, role, phone);
      if (error) {
        addTestResult('Email Signup', 'error', `Signup failed: ${error.message}`);
      } else {
        addTestResult('Email Signup', 'success', 'Email signup successful');
      }
    } catch (error) {
      addTestResult('Email Signup', 'error', `Signup error: ${error}`);
    }
  };

  const testEmailSignin = async () => {
    if (!email || !password) {
      addTestResult('Email Signin', 'error', 'Please fill in email and password');
      return;
    }
    
    addTestResult('Email Signin', 'pending', 'Testing email signin...');
    
    try {
      const { error } = await signIn(email, password);
      if (error) {
        addTestResult('Email Signin', 'error', `Signin failed: ${error.message}`);
      } else {
        addTestResult('Email Signin', 'success', 'Email signin successful');
      }
    } catch (error) {
      addTestResult('Email Signin', 'error', `Signin error: ${error}`);
    }
  };

  const testGoogleSignin = async () => {
    addTestResult('Google Signin', 'pending', 'Testing Google signin...');
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        addTestResult('Google Signin', 'error', `Google signin failed: ${error.message}`);
      } else {
        addTestResult('Google Signin', 'success', 'Google signin initiated successfully');
      }
    } catch (error) {
      addTestResult('Google Signin', 'error', `Google signin error: ${error}`);
    }
  };

  const testFacebookSignin = async () => {
    addTestResult('Facebook Signin', 'pending', 'Testing Facebook signin...');
    
    try {
      const { error } = await signInWithFacebook();
      if (error) {
        addTestResult('Facebook Signin', 'error', `Facebook signin failed: ${error.message}`);
      } else {
        addTestResult('Facebook Signin', 'success', 'Facebook signin initiated successfully');
      }
    } catch (error) {
      addTestResult('Facebook Signin', 'error', `Facebook signin error: ${error}`);
    }
  };

  const testSignout = async () => {
    addTestResult('Signout', 'pending', 'Testing signout...');
    
    try {
      await signOut();
      addTestResult('Signout', 'success', 'Signout successful');
    } catch (error) {
      addTestResult('Signout', 'error', `Signout error: ${error}`);
    }
  };

  const getStatusIcon = (status: AuthTestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'pending': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return null;
    }
  };

  const getStatusColor = (status: AuthTestResult['status']) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'pending': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🔐 Authentication Debugger</h1>
        <p className="text-gray-600">Comprehensive authentication testing and debugging tool</p>
      </div>

      {/* Environment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Environment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span className="text-sm">Supabase URL:</span>
              <Badge variant={envStatus?.hasSupabaseUrl ? 'default' : 'destructive'}>
                {envStatus?.hasSupabaseUrl ? 'Set' : 'Missing'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Supabase Key:</span>
              <Badge variant={envStatus?.hasSupabaseKey ? 'default' : 'destructive'}>
                {envStatus?.hasSupabaseKey ? 'Set' : 'Missing'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="text-sm">Backend URL:</span>
              <Badge variant={envStatus?.hasBackendUrl ? 'default' : 'secondary'}>
                {envStatus?.hasBackendUrl ? 'Set' : 'Default'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="text-sm">AI Service:</span>
              <Badge variant={envStatus?.hasAiServiceUrl ? 'default' : 'secondary'}>
                {envStatus?.hasAiServiceUrl ? 'Set' : 'Default'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Auth Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Current Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Loading:</span>
              <Badge variant={loading ? 'secondary' : 'default'}>
                {loading ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">User:</span>
              <Badge variant={user ? 'default' : 'secondary'}>
                {user ? user.email : 'Not logged in'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Session:</span>
              <Badge variant={session ? 'default' : 'secondary'}>
                {session ? 'Active' : 'None'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Profile:</span>
              <Badge variant={userProfile ? 'default' : 'secondary'}>
                {userProfile ? `${userProfile.name} (${userProfile.role})` : 'None'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Test Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={runComprehensiveTests} 
              disabled={runningTests}
              className="flex items-center gap-2"
            >
              {runningTests ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Run All Tests
            </Button>
            <Button 
              onClick={checkEnvironment} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Check Environment
            </Button>
            <Button 
              onClick={() => setTestResults([])} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Authentication Tests */}
      <Tabs defaultValue="signup" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="signup">Email Signup</TabsTrigger>
          <TabsTrigger value="signin">Email Signin</TabsTrigger>
          <TabsTrigger value="oauth">OAuth</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="signup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Signup Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Name *</Label>
                  <Input
                    id="signup-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email *</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone</Label>
                  <Input
                    id="signup-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-role">Role</Label>
                  <select
                    id="signup-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="supplier">Supplier</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <Button onClick={testEmailSignup} className="w-full">
                Test Email Signup
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Signin Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={testEmailSignin} className="flex-1">
                  Test Email Signin
                </Button>
                <Button onClick={testSignout} variant="outline">
                  Test Signout
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="oauth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>OAuth Authentication Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={testGoogleSignin} className="flex items-center gap-2">
                  <GoogleIcon className="w-4 h-4" />
                  Test Google Signin
                </Button>
                <Button onClick={testFacebookSignin} className="flex items-center gap-2">
                  <Facebook className="w-4 h-4" />
                  Test Facebook Signin
                </Button>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  OAuth tests will redirect to the provider's authentication page. 
                  This is expected behavior for OAuth flows.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Test Results ({testResults.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No test results yet. Run some tests to see results here.
                  </div>
                ) : (
                  testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div className="flex-1">
                          <div className="font-medium">{result.test}</div>
                          <div className="text-sm text-gray-600">{result.message}</div>
                          {result.details && (
                            <div className="text-xs text-gray-500 mt-1">
                              {JSON.stringify(result.details)}
          </div>
        )}
      </div>
                        <Badge variant={result.status === 'success' ? 'default' : result.status === 'error' ? 'destructive' : 'secondary'}>
                          {result.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthDebugger;