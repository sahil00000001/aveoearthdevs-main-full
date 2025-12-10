// Comprehensive testing system that integrates all testing utilities
import { websiteDebugger } from './debugger';
import { bugFixer } from './bugFixer';

interface ComprehensiveTestResult {
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

class ComprehensiveTester {
  private isRunning: boolean = false;
  private onProgress?: (progress: number, message: string) => void;
  private onComplete?: (result: ComprehensiveTestResult) => void;

  constructor() {
    this.isRunning = false;
  }

  async runComprehensiveTest(
    onProgress?: (progress: number, message: string) => void,
    onComplete?: (result: ComprehensiveTestResult) => void
  ): Promise<ComprehensiveTestResult> {
    if (this.isRunning) {
      throw new Error('Test is already running');
    }

    this.isRunning = true;
    this.onProgress = onProgress;
    this.onComplete = onComplete;

    const startTime = Date.now();
    const result: ComprehensiveTestResult = {
      timestamp: new Date(),
      duration: 0,
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        bugsFound: 0,
        bugsFixed: 0,
        healthScore: 0
      },
      debugReport: null,
      bugReport: null,
      performance: {
        pageLoadTime: 0,
        memoryUsage: 0,
        bundleSize: 0,
        apiResponseTime: 0
      },
      security: {
        vulnerabilities: 0,
        xssProtection: false,
        csrfProtection: false,
        inputValidation: false
      },
      accessibility: {
        ariaLabels: 0,
        keyboardNavigation: false,
        colorContrast: false,
        altText: 0
      },
      recommendations: []
    };

    try {
      // Step 1: Run comprehensive debugging
      this.updateProgress(10, 'Running comprehensive debugging...');
      const debugReport = await websiteDebugger.runComprehensiveTests();
      result.debugReport = debugReport;
      result.summary.totalTests = debugReport.totalTests;
      result.summary.passed = debugReport.passed;
      result.summary.failed = debugReport.failed;
      result.summary.warnings = debugReport.warnings;

      // Step 2: Run bug detection
      this.updateProgress(30, 'Detecting bugs and issues...');
      const bugs = await bugFixer.runComprehensiveBugCheck();
      result.bugReport = bugs;
      result.summary.bugsFound = bugs.length;

      // Step 3: Performance testing
      this.updateProgress(50, 'Testing performance...');
      const performance = await this.testPerformance();
      result.performance = performance;

      // Step 4: Security testing
      this.updateProgress(70, 'Testing security...');
      const security = await this.testSecurity();
      result.security = security;

      // Step 5: Accessibility testing
      this.updateProgress(85, 'Testing accessibility...');
      const accessibility = await this.testAccessibility();
      result.accessibility = accessibility;

      // Step 6: Auto-fix bugs
      this.updateProgress(90, 'Attempting to auto-fix bugs...');
      const fixedBugs = await bugFixer.autoFixBugs();
      result.summary.bugsFixed = fixedBugs.length;

      // Step 7: Generate recommendations
      this.updateProgress(95, 'Generating recommendations...');
      result.recommendations = this.generateRecommendations(result);

      // Step 8: Calculate health score
      this.updateProgress(98, 'Calculating health score...');
      result.summary.healthScore = this.calculateHealthScore(result);

      // Complete
      result.duration = Date.now() - startTime;
      this.updateProgress(100, 'Testing completed!');

      if (this.onComplete) {
        this.onComplete(result);
      }

      return result;

    } catch (error) {
      console.error('Comprehensive test failed:', error);
      result.duration = Date.now() - startTime;
      result.recommendations.push('Fix critical errors before running tests again');
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  private updateProgress(progress: number, message: string): void {
    if (this.onProgress) {
      this.onProgress(progress, message);
    }
  }

  private async testPerformance(): Promise<any> {
    const performance: any = {
      pageLoadTime: 0,
      memoryUsage: 0,
      bundleSize: 0,
      apiResponseTime: 0
    };

    try {
      // Test page load time
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        performance.pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart;
      }

      // Test memory usage
      const memory = (performance as any).memory;
      if (memory) {
        performance.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      }

      // Test bundle size (estimate)
      const scripts = document.querySelectorAll('script[src]');
      performance.bundleSize = scripts.length * 100; // Estimate 100KB per script

      // Test API response time
      const startTime = performance.now();
      try {
        await fetch('/api/health');
      } catch (error) {
        // Expected in development
      }
      performance.apiResponseTime = performance.now() - startTime;

    } catch (error) {
      console.error('Performance testing failed:', error);
    }

    return performance;
  }

  private async testSecurity(): Promise<any> {
    const security: any = {
      vulnerabilities: 0,
      xssProtection: false,
      csrfProtection: false,
      inputValidation: false
    };

    try {
      // Test XSS protection
      const inputs = document.querySelectorAll('input, textarea');
      const sanitizedInputs = Array.from(inputs).filter(input => 
        input.hasAttribute('data-sanitized')
      );
      security.xssProtection = sanitizedInputs.length > 0;

      // Test CSRF protection
      const csrfToken = document.querySelector('meta[name="csrf-token"]');
      security.csrfProtection = !!csrfToken;

      // Test input validation
      const forms = document.querySelectorAll('form');
      const validatedForms = Array.from(forms).filter(form => 
        form.hasAttribute('data-validated')
      );
      security.inputValidation = validatedForms.length > 0;

      // Count vulnerabilities
      security.vulnerabilities = [
        !security.xssProtection,
        !security.csrfProtection,
        !security.inputValidation
      ].filter(Boolean).length;

    } catch (error) {
      console.error('Security testing failed:', error);
    }

    return security;
  }

  private async testAccessibility(): Promise<any> {
    const accessibility: any = {
      ariaLabels: 0,
      keyboardNavigation: false,
      colorContrast: false,
      altText: 0
    };

    try {
      // Test ARIA labels
      const ariaElements = document.querySelectorAll('[aria-label], [aria-describedby], [role]');
      accessibility.ariaLabels = ariaElements.length;

      // Test keyboard navigation
      const focusableElements = document.querySelectorAll('button, input, select, textarea, a[href]');
      accessibility.keyboardNavigation = focusableElements.length > 0;

      // Test alt text
      const images = document.querySelectorAll('img[alt]');
      accessibility.altText = images.length;

      // Test color contrast (simplified)
      const hasColorContrast = document.querySelector('[data-color-contrast]');
      accessibility.colorContrast = !!hasColorContrast;

    } catch (error) {
      console.error('Accessibility testing failed:', error);
    }

    return accessibility;
  }

  private generateRecommendations(result: ComprehensiveTestResult): string[] {
    const recommendations: string[] = [];

    // Performance recommendations
    if (result.performance.pageLoadTime > 3000) {
      recommendations.push('Optimize page load time - consider code splitting and lazy loading');
    }
    if (result.performance.memoryUsage > 100) {
      recommendations.push('Reduce memory usage - check for memory leaks and optimize components');
    }
    if (result.performance.bundleSize > 1000) {
      recommendations.push('Optimize bundle size - consider tree shaking and removing unused code');
    }

    // Security recommendations
    if (result.security.vulnerabilities > 0) {
      recommendations.push('Fix security vulnerabilities - implement proper input validation and sanitization');
    }
    if (!result.security.xssProtection) {
      recommendations.push('Implement XSS protection - sanitize all user inputs');
    }
    if (!result.security.csrfProtection) {
      recommendations.push('Implement CSRF protection - add CSRF tokens to forms');
    }

    // Accessibility recommendations
    if (result.accessibility.ariaLabels < 10) {
      recommendations.push('Add more ARIA labels for better screen reader support');
    }
    if (result.accessibility.altText < 5) {
      recommendations.push('Add alt text to images for better accessibility');
    }
    if (!result.accessibility.keyboardNavigation) {
      recommendations.push('Ensure all interactive elements are keyboard accessible');
    }

    // Bug recommendations
    if (result.summary.bugsFound > 0) {
      recommendations.push(`Fix ${result.summary.bugsFound} detected bugs to improve stability`);
    }

    // General recommendations
    if (result.summary.healthScore < 80) {
      recommendations.push('Overall health score is low - focus on critical issues first');
    }

    return recommendations;
  }

  private calculateHealthScore(result: ComprehensiveTestResult): number {
    let score = 100;

    // Deduct points for failed tests
    if (result.summary.totalTests > 0) {
      const failureRate = result.summary.failed / result.summary.totalTests;
      score -= failureRate * 30;
    }

    // Deduct points for bugs
    score -= result.summary.bugsFound * 2;

    // Deduct points for performance issues
    if (result.performance.pageLoadTime > 3000) score -= 10;
    if (result.performance.memoryUsage > 100) score -= 5;
    if (result.performance.bundleSize > 1000) score -= 5;

    // Deduct points for security issues
    score -= result.security.vulnerabilities * 5;

    // Deduct points for accessibility issues
    if (result.accessibility.ariaLabels < 10) score -= 5;
    if (result.accessibility.altText < 5) score -= 5;
    if (!result.accessibility.keyboardNavigation) score -= 10;

    return Math.max(0, Math.round(score));
  }

  isTestRunning(): boolean {
    return this.isRunning;
  }

  stopTest(): void {
    this.isRunning = false;
  }
}

export const comprehensiveTester = new ComprehensiveTester();
export default comprehensiveTester;

















