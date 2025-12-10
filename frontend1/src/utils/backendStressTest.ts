// Backend and AI stress testing utility
// Tests various endpoints and AI features under load

interface TestResult {
  endpoint: string;
  method: string;
  duration: number;
  status: 'success' | 'error' | 'timeout';
  responseTime: number;
  error?: string;
}

class BackendStressTester {
  private baseUrl: string;
  private results: TestResult[] = [];

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  private async makeRequest(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any,
    timeout: number = 5000
  ): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return {
        endpoint,
        method,
        duration,
        status: 'success',
        responseTime: duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        endpoint,
        method,
        duration,
        status: error instanceof Error && error.name === 'AbortError' ? 'timeout' : 'error',
        responseTime: duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Test health endpoint
  async testHealthEndpoint(iterations: number = 10): Promise<TestResult[]> {
    console.log(`🏥 Testing health endpoint (${iterations} iterations)...`);
    const results: TestResult[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const result = await this.makeRequest('/health');
      results.push(result);
      console.log(`Health check ${i + 1}: ${result.status} (${result.duration}ms)`);
    }
    
    return results;
  }

  // Test AI endpoints
  async testAIEndpoints(iterations: number = 5): Promise<TestResult[]> {
    console.log(`🤖 Testing AI endpoints (${iterations} iterations)...`);
    const results: TestResult[] = [];
    
    const aiTests = [
      {
        endpoint: '/ai/chat',
        method: 'POST' as const,
        body: { message: 'Hello, how can you help with sustainable products?' }
      },
      {
        endpoint: '/ai/product-verification',
        method: 'POST' as const,
        body: {
          name: 'Bamboo Toothbrush',
          description: 'Eco-friendly bamboo toothbrush',
          materials: 'Bamboo, biodegradable bristles',
          sustainability_notes: '100% biodegradable'
        }
      },
      {
        endpoint: '/ai/product-suggestions',
        method: 'POST' as const,
        body: { category: 'sustainable-living', budget: 50 }
      }
    ];
    
    for (let i = 0; i < iterations; i++) {
      for (const test of aiTests) {
        const result = await this.makeRequest(test.endpoint, test.method, test.body, 10000);
        results.push(result);
        console.log(`AI ${test.endpoint} ${i + 1}: ${result.status} (${result.duration}ms)`);
      }
    }
    
    return results;
  }

  // Test vendor endpoints
  async testVendorEndpoints(iterations: number = 5): Promise<TestResult[]> {
    console.log(`🏪 Testing vendor endpoints (${iterations} iterations)...`);
    const results: TestResult[] = [];
    
    const vendorTests = [
      { endpoint: '/vendor/products', method: 'GET' as const },
      { endpoint: '/vendor/orders', method: 'GET' as const },
      { endpoint: '/vendor/analytics', method: 'GET' as const },
      { 
        endpoint: '/vendor/products', 
        method: 'POST' as const,
        body: {
          name: `Test Product ${Date.now()}`,
          description: 'Test product for stress testing',
          price: 10.99,
          category_id: '1'
        }
      }
    ];
    
    for (let i = 0; i < iterations; i++) {
      for (const test of vendorTests) {
        const result = await this.makeRequest(test.endpoint, test.method, test.body);
        results.push(result);
        console.log(`Vendor ${test.endpoint} ${i + 1}: ${result.status} (${result.duration}ms)`);
      }
    }
    
    return results;
  }

  // Test admin endpoints
  async testAdminEndpoints(iterations: number = 5): Promise<TestResult[]> {
    console.log(`👑 Testing admin endpoints (${iterations} iterations)...`);
    const results: TestResult[] = [];
    
    const adminTests = [
      { endpoint: '/admin/dashboard/stats', method: 'GET' as const },
      { endpoint: '/admin/analytics', method: 'GET' as const },
      { endpoint: '/admin/users', method: 'GET' as const },
      { endpoint: '/admin/products', method: 'GET' as const },
      { endpoint: '/admin/orders', method: 'GET' as const }
    ];
    
    for (let i = 0; i < iterations; i++) {
      for (const test of adminTests) {
        const result = await this.makeRequest(test.endpoint, test.method);
        results.push(result);
        console.log(`Admin ${test.endpoint} ${i + 1}: ${result.status} (${result.duration}ms)`);
      }
    }
    
    return results;
  }

  // Test concurrent requests
  async testConcurrentRequests(concurrency: number = 10, iterations: number = 5): Promise<TestResult[]> {
    console.log(`⚡ Testing concurrent requests (${concurrency} concurrent, ${iterations} iterations each)...`);
    const results: TestResult[] = [];
    
    const endpoints = [
      '/health',
      '/admin/dashboard/stats',
      '/vendor/products',
      '/ai/chat'
    ];
    
    for (let i = 0; i < iterations; i++) {
      const promises = [];
      
      for (let j = 0; j < concurrency; j++) {
        const endpoint = endpoints[j % endpoints.length];
        promises.push(this.makeRequest(endpoint));
      }
      
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
      
      console.log(`Concurrent batch ${i + 1}: ${batchResults.filter(r => r.status === 'success').length}/${concurrency} successful`);
    }
    
    return results;
  }

  // Run all tests
  async runAllTests(): Promise<{
    health: TestResult[];
    ai: TestResult[];
    vendor: TestResult[];
    admin: TestResult[];
    concurrent: TestResult[];
    summary: {
      totalTests: number;
      successful: number;
      failed: number;
      averageResponseTime: number;
      successRate: number;
    };
  }> {
    console.log('🚀 Starting comprehensive backend stress test...\n');
    
    const startTime = Date.now();
    
    // Run all test suites
    const [health, ai, vendor, admin, concurrent] = await Promise.all([
      this.testHealthEndpoint(10),
      this.testAIEndpoints(3),
      this.testVendorEndpoints(3),
      this.testAdminEndpoints(3),
      this.testConcurrentRequests(5, 3)
    ]);
    
    const allResults = [...health, ...ai, ...vendor, ...admin, ...concurrent];
    const totalTime = Date.now() - startTime;
    
    // Calculate summary
    const successful = allResults.filter(r => r.status === 'success').length;
    const failed = allResults.filter(r => r.status === 'error').length;
    const timeouts = allResults.filter(r => r.status === 'timeout').length;
    const averageResponseTime = allResults.reduce((sum, r) => sum + r.responseTime, 0) / allResults.length;
    const successRate = (successful / allResults.length) * 100;
    
    console.log('\n📊 STRESS TEST SUMMARY:');
    console.log(`⏱️  Total Time: ${totalTime}ms`);
    console.log(`🧪 Total Tests: ${allResults.length}`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏰ Timeouts: ${timeouts}`);
    console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`⚡ Average Response Time: ${averageResponseTime.toFixed(2)}ms`);
    console.log(`🚀 Throughput: ${(allResults.length / (totalTime / 1000)).toFixed(2)} requests/second`);
    
    return {
      health,
      ai,
      vendor,
      admin,
      concurrent,
      summary: {
        totalTests: allResults.length,
        successful,
        failed,
        averageResponseTime,
        successRate
      }
    };
  }
}

// Export functions for easy testing
export const runBackendStressTest = async (baseUrl?: string) => {
  const tester = new BackendStressTester(baseUrl);
  return await tester.runAllTests();
};

export const runQuickHealthCheck = async (baseUrl?: string) => {
  const tester = new BackendStressTester(baseUrl);
  return await tester.testHealthEndpoint(5);
};

export const runAITest = async (baseUrl?: string) => {
  const tester = new BackendStressTester(baseUrl);
  return await tester.testAIEndpoints(3);
};

export default BackendStressTester;

















