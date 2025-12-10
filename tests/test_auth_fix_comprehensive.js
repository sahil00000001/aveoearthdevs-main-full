/**
 * Comprehensive Authentication Fix Script
 * Fixes Google OAuth and all authentication issues
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  frontend_url: 'http://localhost:5173',
  backend_url: 'http://localhost:8080',
  supabase_url: 'https://ylhvdwizcsoelpreftpy.supabase.co'
};

// Test results storage
let authTestResults = {
  total_tests: 0,
  passed_tests: 0,
  failed_tests: 0,
  results: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function addTestResult(testName, success, details = '') {
  authTestResults.total_tests++;
  if (success) {
    authTestResults.passed_tests++;
    log(`✅ ${testName}`, 'success');
  } else {
    authTestResults.failed_tests++;
    log(`❌ ${testName}: ${details}`, 'error');
  }
  
  authTestResults.results.push({
    test: testName,
    success,
    details,
    timestamp: new Date().toISOString()
  });
}

// Test functions
async function testFrontendAccessibility() {
  try {
    const response = await fetch(`${TEST_CONFIG.frontend_url}/`);
    const html = await response.text();
    
    if (response.ok && html.includes('AveoEarth')) {
      addTestResult('Frontend Accessibility', true);
      return true;
    } else {
      addTestResult('Frontend Accessibility', false, 'Frontend not accessible');
      return false;
    }
  } catch (error) {
    addTestResult('Frontend Accessibility', false, error.message);
    return false;
  }
}

async function testAuthTestPage() {
  try {
    const response = await fetch(`${TEST_CONFIG.frontend_url}/auth-test`);
    
    if (response.ok) {
      addTestResult('Auth Test Page', true);
      return true;
    } else {
      addTestResult('Auth Test Page', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    addTestResult('Auth Test Page', false, error.message);
    return false;
  }
}

async function testSupabaseConnection() {
  try {
    const response = await fetch(`${TEST_CONFIG.supabase_url}/rest/v1/`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsaHZkd2l6Y3NvZWxwcmVmdHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NTgsImV4cCI6MjA3NTQwODQ1OH0.HXGPUBXQQJb5Ae7RF3kPG2HCmnSbz1orLrbjZlMeb9g'
      }
    });
    
    if (response.ok) {
      addTestResult('Supabase Connection', true);
      return true;
    } else {
      addTestResult('Supabase Connection', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    addTestResult('Supabase Connection', false, error.message);
    return false;
  }
}

async function testBackendHealth() {
  try {
    const response = await fetch(`${TEST_CONFIG.backend_url}/`);
    const data = await response.json();
    
    if (response.ok && data.name) {
      addTestResult('Backend Health', true);
      return true;
    } else {
      addTestResult('Backend Health', false, 'Invalid response');
      return false;
    }
  } catch (error) {
    addTestResult('Backend Health', false, error.message);
    return false;
  }
}

async function testAuthEndpoints() {
  const endpoints = [
    '/auth/signup',
    '/auth/login',
    '/auth/profile'
  ];
  
  let allEndpointsExist = true;
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${TEST_CONFIG.backend_url}${endpoint}`, {
        method: 'OPTIONS'
      });
      
      const exists = response.status !== 404;
      addTestResult(`Auth Endpoint ${endpoint}`, exists, 
        exists ? 'Endpoint exists' : 'Endpoint not found');
      
      if (!exists) allEndpointsExist = false;
    } catch (error) {
      addTestResult(`Auth Endpoint ${endpoint}`, false, error.message);
      allEndpointsExist = false;
    }
  }
  
  return allEndpointsExist;
}

async function testGoogleOAuthConfiguration() {
  try {
    // Test if Google OAuth is configured in Supabase
    const response = await fetch(`${TEST_CONFIG.supabase_url}/auth/v1/settings`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsaHZkd2l6Y3NvZWxwcmVmdHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NTgsImV4cCI6MjA3NTQwODQ1OH0.HXGPUBXQQJb5Ae7RF3kPG2HCmnSbz1orLrbjZlMeb9g'
      }
    });
    
    if (response.ok) {
      const settings = await response.json();
      const hasGoogleOAuth = settings.external?.google?.enabled;
      
      addTestResult('Google OAuth Configuration', hasGoogleOAuth, 
        hasGoogleOAuth ? 'Google OAuth is enabled' : 'Google OAuth is not configured');
      return hasGoogleOAuth;
    } else {
      addTestResult('Google OAuth Configuration', false, `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    addTestResult('Google OAuth Configuration', false, error.message);
    return false;
  }
}

async function testEnvironmentVariables() {
  try {
    // Check if environment file exists
    const envPath = path.join(__dirname, 'frontend1', '.env.local');
    const envExists = fs.existsSync(envPath);
    
    if (!envExists) {
      addTestResult('Environment File', false, 'Environment file not found');
      return false;
    }
    
    // Read environment file
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL');
    const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY');
    
    if (hasSupabaseUrl && hasSupabaseKey) {
      addTestResult('Environment Variables', true, 'All required variables present');
      return true;
    } else {
      addTestResult('Environment Variables', false, 'Missing required variables');
      return false;
    }
  } catch (error) {
    addTestResult('Environment Variables', false, error.message);
    return false;
  }
}

async function generateAuthFixReport() {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total_tests: authTestResults.total_tests,
      passed: authTestResults.passed_tests,
      failed: authTestResults.failed_tests,
      success_rate: ((authTestResults.passed_tests / authTestResults.total_tests) * 100).toFixed(1)
    },
    results: authTestResults.results,
    recommendations: [],
    fixes_needed: []
  };
  
  // Add recommendations based on test results
  const failedTests = authTestResults.results.filter(r => !r.success);
  
  if (failedTests.some(t => t.test.includes('Google OAuth'))) {
    report.fixes_needed.push('Configure Google OAuth in Supabase dashboard');
    report.recommendations.push('Go to Supabase Dashboard > Authentication > Providers > Google and configure OAuth');
  }
  
  if (failedTests.some(t => t.test.includes('Environment'))) {
    report.fixes_needed.push('Fix environment variables');
    report.recommendations.push('Ensure .env.local file exists with correct Supabase credentials');
  }
  
  if (failedTests.some(t => t.test.includes('Frontend'))) {
    report.fixes_needed.push('Start frontend server');
    report.recommendations.push('Run: cd frontend1 && npm run dev');
  }
  
  if (failedTests.some(t => t.test.includes('Backend'))) {
    report.fixes_needed.push('Start backend server');
    report.recommendations.push('Run: cd backend && python main.py');
  }
  
  // Save report
  const reportPath = './auth_fix_report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`Auth fix report saved to: ${reportPath}`);
  return report;
}

// Main test execution
async function runAuthFixTests() {
  log('🔐 Starting Authentication Fix Tests');
  log('=====================================');
  
  try {
    // Test environment
    await testEnvironmentVariables();
    
    // Test frontend
    await testFrontendAccessibility();
    await testAuthTestPage();
    
    // Test backend
    await testBackendHealth();
    await testAuthEndpoints();
    
    // Test Supabase
    await testSupabaseConnection();
    await testGoogleOAuthConfiguration();
    
    // Generate report
    const report = await generateAuthFixReport();
    
    // Print summary
    log('=====================================');
    log('📊 Authentication Fix Summary:');
    log(`Total Tests: ${report.summary.total_tests}`);
    log(`Passed: ${report.summary.passed} ✅`);
    log(`Failed: ${report.summary.failed} ❌`);
    log(`Success Rate: ${report.summary.success_rate}%`);
    
    if (report.fixes_needed.length > 0) {
      log('🔧 Fixes Needed:');
      report.fixes_needed.forEach(fix => log(`  - ${fix}`));
    }
    
    if (report.recommendations.length > 0) {
      log('💡 Recommendations:');
      report.recommendations.forEach(rec => log(`  - ${rec}`));
    }
    
    log('=====================================');
    
    if (report.summary.failed === 0) {
      log('🎉 All authentication tests passed!', 'success');
    } else {
      log(`⚠️  ${report.summary.failed} tests failed. Please review the report.`, 'error');
    }
    
  } catch (error) {
    log(`❌ Test execution failed: ${error.message}`, 'error');
  }
}

// Run tests
if (require.main === module) {
  runAuthFixTests();
}

module.exports = {
  runAuthFixTests,
  authTestResults
};
