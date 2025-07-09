/**
 * INTEGRATION TESTING SAFEGUARDS
 * 
 * Runtime tests that verify critical data flows are working correctly
 * These tests run automatically and alert if the pipeline is broken
 */

import { validatePersonaData, validateChatMessage, safeExtractAnalysisContent } from '../validation/dataValidation';
import { dataFlowMonitor } from '../monitoring/dataFlowMonitor';

interface SafeguardTest {
  name: string;
  description: string;
  test: () => Promise<boolean> | boolean;
  critical: boolean; // If true, failure indicates a breaking change
}

interface SafeguardResult {
  testName: string;
  passed: boolean;
  error?: string;
  duration: number;
  critical: boolean;
}

interface SafeguardReport {
  timestamp: number;
  totalTests: number;
  passed: number;
  failed: number;
  criticalFailures: number;
  results: SafeguardResult[];
}

class IntegrationSafeguards {
  private tests: SafeguardTest[] = [];

  constructor() {
    this.registerCoreTests();
  }

  /**
   * Register core integration tests
   */
  private registerCoreTests(): void {
    // Test 1: Persona data validation
    this.registerTest({
      name: 'persona-data-validation',
      description: 'Validates that persona data structure is correct',
      critical: true,
      test: () => {
        const mockPersonaData = {
          analysis: 'Test analysis content',
          synthesis_summary: 'Test summary',
          persona_feedback: { clarity: 'Test feedback' }
        };

        const result = validatePersonaData(mockPersonaData);
        return result.isValid;
      }
    });

    // Test 2: Chat message validation
    this.registerTest({
      name: 'chat-message-validation',
      description: 'Validates chat message structure',
      critical: true,
      test: () => {
        const mockMessage = {
          id: 'test-id',
          role: 'clarity',
          content: 'Test content',
          timestamp: new Date()
        };

        const result = validateChatMessage(mockMessage);
        return result.isValid;
      }
    });

    // Test 3: Analysis content extraction
    this.registerTest({
      name: 'analysis-content-extraction',
      description: 'Tests that analysis content can be extracted from persona data',
      critical: true,
      test: () => {
        const testCases = [
          { analysis: 'Primary analysis content' },
          { synthesis_summary: 'Fallback summary content' },
          { persona_feedback: { clarity: 'Nested feedback content' } },
          {} // Empty case should return fallback
        ];

        for (const testCase of testCases) {
          const extracted = safeExtractAnalysisContent(testCase);
          if (!extracted || extracted.trim().length === 0) {
            return false;
          }
        }

        return true;
      }
    });

    // Test 4: Data flow monitoring
    this.registerTest({
      name: 'data-flow-monitoring',
      description: 'Verifies that data flow monitoring is working',
      critical: false,
      test: () => {
        // Test that monitoring can track events
        dataFlowMonitor.trackSuccess('test', 'safeguard-test', { test: true });
        const metrics = dataFlowMonitor.getMetrics();
        return metrics.totalEvents > 0;
      }
    });

    // Test 5: Error boundary functionality
    this.registerTest({
      name: 'error-boundary-stability',
      description: 'Tests error handling mechanisms',
      critical: false,
      test: () => {
        try {
          // Test error handling in validation
          const result = validatePersonaData(null);
          return !result.isValid && result.errors.length > 0;
        } catch (error) {
          return false;
        }
      }
    });

    // Test 6: Fallback content generation
    this.registerTest({
      name: 'fallback-content-generation',
      description: 'Ensures fallback content is generated when data is missing',
      critical: true,
      test: () => {
        const emptyData = {};
        const nullData = null;
        const invalidData = { invalid: 'structure' };

        const results = [
          safeExtractAnalysisContent(emptyData),
          safeExtractAnalysisContent(nullData),
          safeExtractAnalysisContent(invalidData)
        ];

        // All should return non-empty fallback content
        return results.every(result => 
          result && result.trim().length > 0 && 
          !result.includes('undefined') && 
          !result.includes('null')
        );
      }
    });
  }

  /**
   * Register a custom test
   */
  registerTest(test: SafeguardTest): void {
    this.tests.push(test);
  }

  /**
   * Run all registered tests
   */
  async runAllTests(): Promise<SafeguardReport> {
    const startTime = Date.now();
    const results: SafeguardResult[] = [];

    console.group('🧪 Running Integration Safeguards');

    for (const test of this.tests) {
      const testStartTime = Date.now();
      let passed = false;
      let error: string | undefined;

      try {
        const result = await test.test();
        passed = Boolean(result);
      } catch (e) {
        passed = false;
        error = e instanceof Error ? e.message : String(e);
      }

      const duration = Date.now() - testStartTime;
      const result: SafeguardResult = {
        testName: test.name,
        passed,
        error,
        duration,
        critical: test.critical
      };

      results.push(result);

      // Log individual test results
      const status = passed ? '✅' : '❌';
      const criticalFlag = test.critical ? '🚨 CRITICAL' : '';
      console.log(`${status} ${test.name} (${duration}ms) ${criticalFlag}`);
      
      if (!passed) {
        console.warn(`   Description: ${test.description}`);
        if (error) console.warn(`   Error: ${error}`);
      }
    }

    const report: SafeguardReport = {
      timestamp: Date.now(),
      totalTests: this.tests.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      criticalFailures: results.filter(r => !r.passed && r.critical).length,
      results
    };

    console.log(`📊 Safeguard Report: ${report.passed}/${report.totalTests} passed`);
    if (report.criticalFailures > 0) {
      console.error(`🚨 ${report.criticalFailures} CRITICAL FAILURES DETECTED`);
    }
    console.groupEnd();

    // Store report for debugging
    this.storeReport(report);

    return report;
  }

  /**
   * Run only critical tests
   */
  async runCriticalTests(): Promise<SafeguardResult[]> {
    const criticalTests = this.tests.filter(test => test.critical);
    const results: SafeguardResult[] = [];

    for (const test of criticalTests) {
      const testStartTime = Date.now();
      let passed = false;
      let error: string | undefined;

      try {
        const result = await test.test();
        passed = Boolean(result);
      } catch (e) {
        passed = false;
        error = e instanceof Error ? e.message : String(e);
      }

      results.push({
        testName: test.name,
        passed,
        error,
        duration: Date.now() - testStartTime,
        critical: true
      });
    }

    return results;
  }

  /**
   * Check if the system is healthy
   */
  async isSystemHealthy(): Promise<boolean> {
    const criticalResults = await this.runCriticalTests();
    return criticalResults.every(result => result.passed);
  }

  /**
   * Store test report for debugging
   */
  private storeReport(report: SafeguardReport): void {
    try {
      const reports = JSON.parse(localStorage.getItem('goblin-safeguard-reports') || '[]');
      reports.push(report);
      
      // Keep only last 10 reports
      const recentReports = reports.slice(-10);
      localStorage.setItem('goblin-safeguard-reports', JSON.stringify(recentReports));
    } catch (error) {
      console.warn('Failed to store safeguard report:', error);
    }
  }

  /**
   * Get stored test reports
   */
  getStoredReports(): SafeguardReport[] {
    try {
      return JSON.parse(localStorage.getItem('goblin-safeguard-reports') || '[]');
    } catch {
      return [];
    }
  }
}

// Global instance
export const integrationSafeguards = new IntegrationSafeguards();

// Convenience functions
export const runSafeguards = integrationSafeguards.runAllTests.bind(integrationSafeguards);
export const checkSystemHealth = integrationSafeguards.isSystemHealthy.bind(integrationSafeguards);
export const runCriticalTests = integrationSafeguards.runCriticalTests.bind(integrationSafeguards);
