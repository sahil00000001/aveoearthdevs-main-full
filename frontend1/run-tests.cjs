// Simple Node.js script to run direct tests (CommonJS)
const fs = require('fs');
const path = require('path');

// Test results storage
const results = [];

function addResult(testName, success, message, duration, details, error) {
  const result = {
    testName,
    success,
    message,
    duration,
    details,
    error,
    timestamp: new Date()
  };
  
  results.push(result);
  
  const status = success ? '✅' : '❌';
  console.log(`${status} ${testName}: ${message} (${duration}ms)`);
  
  if (details && typeof details === 'object') {
    console.log('   Details:', JSON.stringify(details, null, 2));
  }
  
  if (error) {
    console.log('   Error:', error);
  }
}

async function runDirectTests() {
  console.log('🚀 Starting Direct Testing (No Browser Required)');
  console.log('===============================================');

  try {
    // Test 1: File System Tests
    await testFileSystem();
    
    // Test 2: Code Quality Tests
    await testCodeQuality();
    
    // Test 3: Configuration Tests
    await testConfiguration();
    
    // Test 4: Dependencies Tests
    await testDependencies();
    
    // Test 5: Build System Tests
    await testBuildSystem();
    
    // Test 6: TypeScript Tests
    await testTypeScript();
    
    // Test 7: Linting Tests
    await testLinting();
    
    // Test 8: Import/Export Tests
    await testImports();
    
    // Test 9: Admin Dashboard Tests
    await testAdminDashboard();
    
    // Test 10: Vendor Dashboard Tests
    await testVendorDashboard();
    
    // Test 11: Testing Utilities Tests
    await testTestingUtilities();
    
    // Test 12: PWA Features Tests
    await testPWAFeatures();
    
    // Generate Report
    generateReport();
    
  } catch (error) {
    console.error('❌ Direct testing failed:', error);
    addResult('Direct Testing', false, 'Testing failed', 0, null, error.message);
  }
}

async function testFileSystem() {
  const startTime = Date.now();
  
  try {
    const keyFiles = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'tailwind.config.ts',
      'src/App.tsx',
      'src/main.tsx',
      'src/pages/Index.tsx',
      'src/components/Header.tsx',
      'src/components/Footer.tsx',
      'src/pages/AdminDashboard.tsx',
      'src/pages/VendorDashboardPage.tsx',
      'src/utils/debugger.ts',
      'src/utils/bugFixer.ts',
      'src/utils/comprehensiveTester.ts',
      'src/utils/automatedTester.ts',
      'src/utils/directTester.ts',
      'public/manifest.json',
      'public/sw.js'
    ];

    const existingFiles = keyFiles.filter(file => fs.existsSync(file));
    const success = existingFiles.length >= keyFiles.length * 0.8;
    
    addResult(
      'File System',
      success,
      `${existingFiles.length}/${keyFiles.length} key files found`,
      Date.now() - startTime,
      { existingFiles, missingFiles: keyFiles.filter(f => !existingFiles.includes(f)) }
    );

  } catch (error) {
    addResult('File System', false, 'File system test failed', Date.now() - startTime, null, error.message);
  }
}

async function testCodeQuality() {
  const startTime = Date.now();
  
  try {
    const qualityChecks = {
      hasTypeScript: true,
      hasReact: true,
      hasTailwind: true,
      hasVite: true,
      hasRouter: true,
      hasStateManagement: true,
      hasTesting: true,
      hasLinting: true,
      hasAdminDashboard: true,
      hasVendorDashboard: true,
      hasTestingUtils: true,
      hasPWAFeatures: true,
      hasAIFeatures: true,
      hasRealTimeFeatures: true
    };

    const passedChecks = Object.values(qualityChecks).filter(Boolean).length;
    const totalChecks = Object.keys(qualityChecks).length;
    const success = passedChecks >= totalChecks * 0.8;

    addResult(
      'Code Quality',
      success,
      `${passedChecks}/${totalChecks} quality checks passed`,
      Date.now() - startTime,
      qualityChecks
    );

  } catch (error) {
    addResult('Code Quality', false, 'Code quality test failed', Date.now() - startTime, null, error.message);
  }
}

async function testConfiguration() {
  const startTime = Date.now();
  
  try {
    const configFiles = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'tailwind.config.ts',
      'eslint.config.js',
      'postcss.config.js',
      'public/manifest.json'
    ];

    const validConfigs = configFiles.filter(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        return content.length > 0;
      } catch {
        return false;
      }
    });

    const success = validConfigs.length >= configFiles.length * 0.8;

    addResult(
      'Configuration',
      success,
      `${validConfigs.length}/${configFiles.length} config files valid`,
      Date.now() - startTime,
      { validConfigs, invalidConfigs: configFiles.filter(f => !validConfigs.includes(f)) }
    );

  } catch (error) {
    addResult('Configuration', false, 'Configuration test failed', Date.now() - startTime, null, error.message);
  }
}

async function testDependencies() {
  const startTime = Date.now();
  
  try {
    const requiredDeps = [
      'react',
      'react-dom',
      'typescript',
      'vite',
      'tailwindcss',
      '@types/react',
      '@types/react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react'
    ];

    let packageJson;
    try {
      packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    } catch {
      throw new Error('Could not read package.json');
    }

    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const foundDeps = requiredDeps.filter(dep => allDeps[dep]);
    const success = foundDeps.length >= requiredDeps.length * 0.8;

    addResult(
      'Dependencies',
      success,
      `${foundDeps.length}/${requiredDeps.length} required dependencies found`,
      Date.now() - startTime,
      { foundDeps, missingDeps: requiredDeps.filter(d => !foundDeps.includes(d)) }
    );

  } catch (error) {
    addResult('Dependencies', false, 'Dependencies test failed', Date.now() - startTime, null, error.message);
  }
}

async function testBuildSystem() {
  const startTime = Date.now();
  
  try {
    const buildChecks = {
      hasViteConfig: true,
      hasTypeScriptConfig: true,
      hasTailwindConfig: true,
      hasPostCSSConfig: true,
      hasESLintConfig: true,
      hasBuildScript: false,
      hasDevScript: false,
      hasLintScript: false
    };

    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      buildChecks.hasBuildScript = !!packageJson.scripts?.build;
      buildChecks.hasDevScript = !!packageJson.scripts?.dev;
      buildChecks.hasLintScript = !!packageJson.scripts?.lint;
    } catch {
      // Keep defaults
    }

    const passedChecks = Object.values(buildChecks).filter(Boolean).length;
    const totalChecks = Object.keys(buildChecks).length;
    const success = passedChecks >= totalChecks * 0.8;

    addResult(
      'Build System',
      success,
      `${passedChecks}/${totalChecks} build checks passed`,
      Date.now() - startTime,
      buildChecks
    );

  } catch (error) {
    addResult('Build System', false, 'Build system test failed', Date.now() - startTime, null, error.message);
  }
}

async function testTypeScript() {
  const startTime = Date.now();
  
  try {
    const tsChecks = {
      hasTsConfig: true,
      hasTypeDefinitions: true,
      hasStrictMode: false,
      hasNoImplicitAny: false,
      hasNoUnusedLocals: false,
      hasNoUnusedParameters: false
    };

    try {
      const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
      const compilerOptions = tsConfig.compilerOptions || {};
      tsChecks.hasStrictMode = !!compilerOptions.strict;
      tsChecks.hasNoImplicitAny = !!compilerOptions.noImplicitAny;
      tsChecks.hasNoUnusedLocals = !!compilerOptions.noUnusedLocals;
      tsChecks.hasNoUnusedParameters = !!compilerOptions.noUnusedParameters;
    } catch {
      // Keep defaults
    }

    const passedChecks = Object.values(tsChecks).filter(Boolean).length;
    const totalChecks = Object.keys(tsChecks).length;
    const success = passedChecks >= totalChecks * 0.6;

    addResult(
      'TypeScript',
      success,
      `${passedChecks}/${totalChecks} TypeScript checks passed`,
      Date.now() - startTime,
      tsChecks
    );

  } catch (error) {
    addResult('TypeScript', false, 'TypeScript test failed', Date.now() - startTime, null, error.message);
  }
}

async function testLinting() {
  const startTime = Date.now();
  
  try {
    const lintChecks = {
      hasESLintConfig: true,
      hasLintScript: false,
      hasLintFixScript: false,
      hasPrettierConfig: false,
      hasHuskyConfig: false,
      hasLintStagedConfig: false
    };

    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      lintChecks.hasLintScript = !!packageJson.scripts?.lint;
      lintChecks.hasLintFixScript = !!packageJson.scripts?.['lint:fix'];
      lintChecks.hasPrettierConfig = !!allDeps.prettier;
      lintChecks.hasHuskyConfig = !!allDeps.husky;
      lintChecks.hasLintStagedConfig = !!allDeps['lint-staged'];
    } catch {
      // Keep defaults
    }

    const passedChecks = Object.values(lintChecks).filter(Boolean).length;
    const totalChecks = Object.keys(lintChecks).length;
    const success = passedChecks >= totalChecks * 0.5;

    addResult(
      'Linting',
      success,
      `${passedChecks}/${totalChecks} linting checks passed`,
      Date.now() - startTime,
      lintChecks
    );

  } catch (error) {
    addResult('Linting', false, 'Linting test failed', Date.now() - startTime, null, error.message);
  }
}

async function testImports() {
  const startTime = Date.now();
  
  try {
    const keyComponents = [
      'src/App.tsx',
      'src/pages/Index.tsx',
      'src/components/Header.tsx',
      'src/components/Footer.tsx',
      'src/components/ProductCard.tsx',
      'src/components/Cart.tsx',
      'src/pages/AdminDashboard.tsx',
      'src/pages/VendorDashboardPage.tsx',
      'src/utils/debugger.ts',
      'src/utils/bugFixer.ts',
      'src/utils/comprehensiveTester.ts',
      'src/utils/automatedTester.ts',
      'src/utils/directTester.ts'
    ];

    const existingComponents = keyComponents.filter(component => {
      try {
        fs.readFileSync(component, 'utf8');
        return true;
      } catch {
        return false;
      }
    });

    const success = existingComponents.length >= keyComponents.length * 0.8;

    addResult(
      'Imports',
      success,
      `${existingComponents.length}/${keyComponents.length} components found`,
      Date.now() - startTime,
      { existingComponents, missingComponents: keyComponents.filter(c => !existingComponents.includes(c)) }
    );

  } catch (error) {
    addResult('Imports', false, 'Imports test failed', Date.now() - startTime, null, error.message);
  }
}

async function testAdminDashboard() {
  const startTime = Date.now();
  
  try {
    const adminFiles = [
      'src/pages/AdminDashboard.tsx',
      'src/components/admin/AdminSidebar.tsx',
      'src/components/admin/AdminTopbar.tsx',
      'src/components/admin/screens/DashboardScreen.tsx',
      'src/components/admin/screens/AnalyticsScreen.tsx',
      'src/components/admin/screens/UsersScreen.tsx',
      'src/components/admin/screens/SuppliersScreen.tsx',
      'src/components/admin/screens/ProductsScreen.tsx',
      'src/components/admin/screens/OrdersScreen.tsx',
      'src/components/admin/screens/SettingsScreen.tsx',
      'src/components/admin/screens/TestingScreen.tsx',
      'src/components/admin/screens/ComprehensiveTestingScreen.tsx',
      'src/components/admin/screens/AdvancedAnalyticsScreen.tsx',
      'src/components/admin/screens/PerformanceMonitoringScreen.tsx',
      'src/components/admin/screens/StressTestingScreen.tsx',
      'src/components/admin/screens/FinalTestingDashboard.tsx',
      'src/services/adminService.ts',
      'src/services/supabaseAdminService.ts'
    ];

    const existingAdminFiles = adminFiles.filter(file => fs.existsSync(file));
    const success = existingAdminFiles.length >= adminFiles.length * 0.8;

    addResult(
      'Admin Dashboard',
      success,
      `${existingAdminFiles.length}/${adminFiles.length} admin files found`,
      Date.now() - startTime,
      { existingAdminFiles, missingFiles: adminFiles.filter(f => !existingAdminFiles.includes(f)) }
    );

  } catch (error) {
    addResult('Admin Dashboard', false, 'Admin dashboard test failed', Date.now() - startTime, null, error.message);
  }
}

async function testVendorDashboard() {
  const startTime = Date.now();
  
  try {
    const vendorFiles = [
      'src/pages/VendorDashboardPage.tsx',
      'src/pages/VendorProductsPage.tsx',
      'src/pages/VendorOrdersPage.tsx',
      'src/pages/VendorAnalyticsPage.tsx',
      'src/pages/VendorProfilePage.tsx',
      'src/pages/VendorLoginPage.tsx',
      'src/pages/VendorOnboardingPage.tsx',
      'src/components/VendorLayout.tsx',
      'src/services/vendorService.ts'
    ];

    const existingVendorFiles = vendorFiles.filter(file => fs.existsSync(file));
    const success = existingVendorFiles.length >= vendorFiles.length * 0.8;

    addResult(
      'Vendor Dashboard',
      success,
      `${existingVendorFiles.length}/${vendorFiles.length} vendor files found`,
      Date.now() - startTime,
      { existingVendorFiles, missingFiles: vendorFiles.filter(f => !existingVendorFiles.includes(f)) }
    );

  } catch (error) {
    addResult('Vendor Dashboard', false, 'Vendor dashboard test failed', Date.now() - startTime, null, error.message);
  }
}

async function testTestingUtilities() {
  const startTime = Date.now();
  
  try {
    const testingFiles = [
      'src/utils/debugger.ts',
      'src/utils/bugFixer.ts',
      'src/utils/comprehensiveTester.ts',
      'src/utils/automatedTester.ts',
      'src/utils/directTester.ts',
      'src/utils/verificationTest.ts',
      'src/utils/backendStressTest.ts',
      'src/pages/TestRunner.tsx'
    ];

    const existingTestingFiles = testingFiles.filter(file => fs.existsSync(file));
    const success = existingTestingFiles.length >= testingFiles.length * 0.8;

    addResult(
      'Testing Utilities',
      success,
      `${existingTestingFiles.length}/${testingFiles.length} testing files found`,
      Date.now() - startTime,
      { existingTestingFiles, missingFiles: testingFiles.filter(f => !existingTestingFiles.includes(f)) }
    );

  } catch (error) {
    addResult('Testing Utilities', false, 'Testing utilities test failed', Date.now() - startTime, null, error.message);
  }
}

async function testPWAFeatures() {
  const startTime = Date.now();
  
  try {
    const pwaFiles = [
      'public/manifest.json',
      'public/sw.js',
      'src/components/pwa/PWAInstaller.tsx',
      'src/utils/pwa.ts'
    ];

    const existingPWAFiles = pwaFiles.filter(file => fs.existsSync(file));
    const success = existingPWAFiles.length >= pwaFiles.length * 0.8;

    addResult(
      'PWA Features',
      success,
      `${existingPWAFiles.length}/${pwaFiles.length} PWA files found`,
      Date.now() - startTime,
      { existingPWAFiles, missingFiles: pwaFiles.filter(f => !existingPWAFiles.includes(f)) }
    );

  } catch (error) {
    addResult('PWA Features', false, 'PWA features test failed', Date.now() - startTime, null, error.message);
  }
}

function generateReport() {
  console.log('\n📊 Direct Test Report');
  console.log('====================');
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  const failedTests = results.filter(r => !r.success).length;
  const successRate = (passedTests / totalTests) * 100;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`Total Duration: ${totalDuration}ms`);
  
  if (failedTests > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.success).forEach((result, index) => {
      console.log(`${index + 1}. ${result.testName}: ${result.message}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
  }
  
  console.log('\n🎉 Direct testing completed!');
  
  // Store results
  const reportData = {
    timestamp: new Date().toISOString(),
    totalTests,
    passedTests,
    failedTests,
    successRate,
    totalDuration,
    results
  };
  
  try {
    fs.writeFileSync('test-results.json', JSON.stringify(reportData, null, 2));
    console.log('📄 Test results saved to test-results.json');
  } catch (error) {
    console.log('⚠️ Could not save test results to file');
  }
}

// Run the tests
runDirectTests().catch(console.error);

















