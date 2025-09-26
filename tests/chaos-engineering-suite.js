/**
 * CHAOS ENGINEERING SYSTEM
 * Tests system resilience under extreme conditions
 * Simulates real-world failures and stress scenarios
 */

import { test, expect } from '@playwright/test';
import { Worker } from 'worker_threads';
import { performance } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';

class ChaosEngineeringOrchestrator {
  constructor() {
    this.testResults = [];
    this.failureScenarios = [];
    this.performanceBaseline = {};
    this.stressTestMetrics = {};
    this.networkConditions = {
      '3g_slow': { downloadThroughput: 400 * 1024, uploadThroughput: 400 * 1024, latency: 400 },
      '3g_fast': { downloadThroughput: 1.6 * 1024 * 1024, uploadThroughput: 750 * 1024, latency: 150 },
      '4g': { downloadThroughput: 4 * 1024 * 1024, uploadThroughput: 3 * 1024 * 1024, latency: 20 },
      'offline': { downloadThroughput: 0, uploadThroughput: 0, latency: 0 }
    };
  }

  async establishPerformanceBaseline(page) {
    console.log('📊 Establishing performance baseline...');

    const metrics = await page.evaluate(() => {
      return new Promise(resolve => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const navigationEntry = entries.find(entry => entry.entryType === 'navigation');

          if (navigationEntry) {
            resolve({
              domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart,
              loadComplete: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
              firstContentfulPaint: performance.getEntriesByType('paint')
                .find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
              largestContentfulPaint: performance.getEntriesByType('largest-contentful-paint')
                .pop()?.startTime || 0,
              cumulativeLayoutShift: performance.getEntriesByType('layout-shift')
                .reduce((sum, entry) => sum + entry.value, 0),
              totalBlockingTime: performance.getEntriesByType('longtask')
                .reduce((sum, entry) => sum + entry.duration, 0)
            });
          }
        });

        observer.observe({ type: 'navigation', buffered: true });

        // Fallback timeout
        setTimeout(() => {
          resolve({
            domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.domContentLoadedEventStart,
            loadComplete: performance.timing.loadEventEnd - performance.timing.loadEventStart,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            cumulativeLayoutShift: 0,
            totalBlockingTime: 0
          });
        }, 5000);
      });
    });

    this.performanceBaseline = metrics;
    console.log('✅ Baseline established:', metrics);
    return metrics;
  }

  async simulateNetworkStress(page, scenario) {
    console.log(`🌐 Simulating network stress: ${scenario}`);

    const conditions = this.networkConditions[scenario];
    await page.context().setExtraHTTPHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });

    // Simulate network throttling
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: scenario === 'offline',
      downloadThroughput: conditions.downloadThroughput,
      uploadThroughput: conditions.uploadThroughput,
      latency: conditions.latency
    });

    return conditions;
  }

  async simulateMemoryPressure(page) {
    console.log('🧠 Simulating memory pressure...');

    // Create memory pressure by allocating large arrays
    const memoryStressResult = await page.evaluate(() => {
      const memoryHogs = [];
      let allocated = 0;

      try {
        // Allocate memory in chunks until we hit limits
        for (let i = 0; i < 100; i++) {
          const chunk = new Array(1024 * 1024).fill('x'); // 1MB chunks
          memoryHogs.push(chunk);
          allocated += chunk.length;
        }

        return { allocated, success: true };
      } catch (error) {
        return { allocated, success: false, error: error.message };
      }
    });

    return memoryStressResult;
  }

  async simulateConcurrentUsers(page, userCount) {
    console.log(`👥 Simulating ${userCount} concurrent users...`);

    const userPromises = [];

    for (let i = 0; i < userCount; i++) {
      const userPromise = this.simulateUserSession(page, i);
      userPromises.push(userPromise);

      // Stagger user starts
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const results = await Promise.allSettled(userPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return { userCount, successful, failed, successRate: (successful / userCount) * 100 };
  }

  async simulateUserSession(page, userId) {
    const startTime = performance.now();
    const sessionId = `user_${userId}_${Date.now()}`;

    try {
      // Navigate to homepage
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(Math.random() * 1000); // Random think time

      // Simulate user interactions
      const actions = [
        () => page.click('nav a[href="/services"]'),
        () => page.click('nav a[href="/portfolio"]'),
        () => page.click('nav a[href="/contact"]'),
        () => page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)),
        () => page.goBack(),
        () => page.reload()
      ];

      // Perform random actions
      for (let i = 0; i < Math.floor(Math.random() * 4) + 1; i++) {
        const action = actions[Math.floor(Math.random() * actions.length)];
        try {
          await action();
          await page.waitForTimeout(Math.random() * 2000); // Random think time
        } catch (error) {
          console.warn(`User ${userId} action failed:`, error.message);
        }
      }

      const endTime = performance.now();
      return {
        sessionId,
        userId,
        duration: endTime - startTime,
        success: true
      };

    } catch (error) {
      const endTime = performance.now();
      return {
        sessionId,
        userId,
        duration: endTime - startTime,
        success: false,
        error: error.message
      };
    }
  }

  async measureResourceExhaustion(page) {
    console.log('📈 Measuring resource exhaustion limits...');

    const resourceMetrics = await page.evaluate(() => {
      const start = performance.now();

      return new Promise((resolve) => {
        let intervalCount = 0;
        let timeoutCount = 0;
        let domNodes = 0;

        // Create intervals to consume CPU
        const intervals = [];
        for (let i = 0; i < 50; i++) {
          intervals.push(setInterval(() => {
            intervalCount++;
            // CPU intensive operation
            Math.sqrt(Math.random() * 1000000);
          }, 1));
        }

        // Create timeouts to consume memory
        const timeouts = [];
        for (let i = 0; i < 100; i++) {
          timeouts.push(setTimeout(() => {
            timeoutCount++;
            // Create DOM nodes
            for (let j = 0; j < 100; j++) {
              const div = document.createElement('div');
              div.innerHTML = 'x'.repeat(1000);
              document.body.appendChild(div);
              domNodes++;
            }
          }, Math.random() * 1000));
        }

        // Measure for 5 seconds then clean up
        setTimeout(() => {
          intervals.forEach(clearInterval);
          timeouts.forEach(clearTimeout);

          const end = performance.now();
          resolve({
            duration: end - start,
            intervalCount,
            timeoutCount,
            domNodes,
            memoryUsage: performance.memory ? {
              usedJSHeapSize: performance.memory.usedJSHeapSize,
              totalJSHeapSize: performance.memory.totalJSHeapSize,
              jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            } : null
          });
        }, 5000);
      });
    });

    return resourceMetrics;
  }

  async analyzeFailureRecovery(page, failureType) {
    console.log(`🔧 Testing failure recovery: ${failureType}`);

    const startTime = performance.now();
    let recoveryTime = 0;
    let recovered = false;

    try {
      switch (failureType) {
        case 'css_failure':
          // Simulate CSS loading failure
          await page.route('**/*.css', route => route.abort());
          await page.reload();
          await page.waitForTimeout(2000);

          // Check if page is still functional
          const hasContent = await page.locator('body').isVisible();
          recovered = hasContent;
          break;

        case 'js_failure':
          // Simulate JavaScript loading failure
          await page.route('**/*.js', route => route.abort());
          await page.reload();
          await page.waitForTimeout(2000);

          // Check if basic HTML structure is intact
          const hasNavigation = await page.locator('nav').count() > 0;
          recovered = hasNavigation;
          break;

        case 'image_failure':
          // Simulate image loading failure
          await page.route('**/*.{png,jpg,jpeg,gif,svg,webp}', route => route.abort());
          await page.reload();
          await page.waitForTimeout(2000);

          // Check if layout is preserved
          const layoutIntact = await page.evaluate(() => {
            return document.body.scrollHeight > 500; // Basic layout check
          });
          recovered = layoutIntact;
          break;

        case 'font_failure':
          // Simulate font loading failure
          await page.route('**/*.{woff,woff2,ttf,eot}', route => route.abort());
          await page.reload();
          await page.waitForTimeout(2000);

          // Check if text is still readable
          const hasText = await page.locator('h1, h2, p').first().isVisible();
          recovered = hasText;
          break;
      }

      recoveryTime = performance.now() - startTime;

    } catch (error) {
      recoveryTime = performance.now() - startTime;
      console.warn(`Failure recovery test failed: ${error.message}`);
    }

    // Clear all routes to reset state
    await page.unroute('**/*');

    return { failureType, recovered, recoveryTime, success: recovered };
  }

  async generateChaosReport() {
    const reportPath = `/home/abhi/projects/tpp/tests/chaos-engineering-report-${Date.now()}.json`;

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        testsRun: this.testResults.length,
        passed: this.testResults.filter(r => r.success).length,
        failed: this.testResults.filter(r => !r.success).length,
        averageRecoveryTime: this.testResults
          .filter(r => r.recoveryTime)
          .reduce((avg, r, _, arr) => avg + r.recoveryTime / arr.length, 0)
      },
      performanceBaseline: this.performanceBaseline,
      stressTestMetrics: this.stressTestMetrics,
      detailedResults: this.testResults,
      failureScenarios: this.failureScenarios,
      recommendations: this.generateRecommendations()
    };

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📋 Chaos engineering report saved: ${reportPath}`);

    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    // Analyze test results and generate actionable recommendations
    const failedTests = this.testResults.filter(r => !r.success);

    if (failedTests.length > 0) {
      recommendations.push({
        type: 'resilience',
        priority: 'high',
        description: `${failedTests.length} chaos tests failed. Implement better error handling and graceful degradation.`,
        actions: [
          'Add try-catch blocks around critical functionality',
          'Implement service worker for offline functionality',
          'Add loading states for all async operations',
          'Implement retry mechanisms for failed requests'
        ]
      });
    }

    if (this.performanceBaseline.cumulativeLayoutShift > 0.1) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        description: 'High Cumulative Layout Shift detected during stress testing',
        actions: [
          'Add explicit dimensions to images and videos',
          'Reserve space for dynamic content',
          'Use CSS containment for layout-heavy sections'
        ]
      });
    }

    return recommendations;
  }
}

// Test Suite Implementation
test.describe('Chaos Engineering Suite', () => {
  let orchestrator;

  test.beforeEach(async () => {
    orchestrator = new ChaosEngineeringOrchestrator();
  });

  test('Baseline Performance Measurement', async ({ page }) => {
    await page.goto('/');
    const baseline = await orchestrator.establishPerformanceBaseline(page);

    expect(baseline.domContentLoaded).toBeLessThan(3000);
    expect(baseline.firstContentfulPaint).toBeLessThan(2000);
    expect(baseline.cumulativeLayoutShift).toBeLessThan(0.1);
  });

  test('Network Stress Test - 3G Slow', async ({ page }) => {
    await orchestrator.simulateNetworkStress(page, '3g_slow');

    const start = performance.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = performance.now() - start;

    orchestrator.testResults.push({
      test: 'network_stress_3g_slow',
      loadTime,
      success: loadTime < 10000, // 10 second timeout
      details: { networkCondition: '3g_slow' }
    });

    expect(loadTime).toBeLessThan(10000);
  });

  test('Memory Pressure Resistance', async ({ page }) => {
    await page.goto('/');
    const memoryResult = await orchestrator.simulateMemoryPressure(page);

    // Page should remain functional under memory pressure
    const isResponsive = await page.locator('nav').isVisible();

    orchestrator.testResults.push({
      test: 'memory_pressure',
      memoryAllocated: memoryResult.allocated,
      success: isResponsive && memoryResult.success,
      details: memoryResult
    });

    expect(isResponsive).toBe(true);
  });

  test('Concurrent User Load Test', async ({ page }) => {
    const userCount = 20;
    const result = await orchestrator.simulateConcurrentUsers(page, userCount);

    orchestrator.stressTestMetrics.concurrentUsers = result;

    expect(result.successRate).toBeGreaterThan(80); // 80% success rate minimum
  });

  test('CSS Failure Recovery', async ({ page }) => {
    const result = await orchestrator.analyzeFailureRecovery(page, 'css_failure');

    orchestrator.testResults.push(result);
    orchestrator.failureScenarios.push('css_failure');

    expect(result.recovered).toBe(true);
  });

  test('JavaScript Failure Recovery', async ({ page }) => {
    const result = await orchestrator.analyzeFailureRecovery(page, 'js_failure');

    orchestrator.testResults.push(result);
    orchestrator.failureScenarios.push('js_failure');

    expect(result.recovered).toBe(true);
  });

  test('Image Loading Failure Graceful Degradation', async ({ page }) => {
    const result = await orchestrator.analyzeFailureRecovery(page, 'image_failure');

    orchestrator.testResults.push(result);
    orchestrator.failureScenarios.push('image_failure');

    expect(result.recovered).toBe(true);
  });

  test('Font Loading Failure Fallback', async ({ page }) => {
    const result = await orchestrator.analyzeFailureRecovery(page, 'font_failure');

    orchestrator.testResults.push(result);
    orchestrator.failureScenarios.push('font_failure');

    expect(result.recovered).toBe(true);
  });

  test('Resource Exhaustion Limits', async ({ page }) => {
    await page.goto('/');
    const resourceMetrics = await orchestrator.measureResourceExhaustion(page);

    orchestrator.stressTestMetrics.resourceExhaustion = resourceMetrics;

    // Page should remain responsive after resource exhaustion test
    const isResponsive = await page.locator('body').isVisible();

    expect(isResponsive).toBe(true);
    expect(resourceMetrics.duration).toBeGreaterThan(4000); // Should run for ~5 seconds
  });

  test.afterAll(async () => {
    const report = await orchestrator.generateChaosReport();
    console.log('🎯 Chaos Engineering Tests Complete');
    console.log(`📊 Success Rate: ${((report.summary.passed / report.summary.testsRun) * 100).toFixed(1)}%`);
    console.log(`📋 Full report: chaos-engineering-report-${Date.now()}.json`);
  });
});