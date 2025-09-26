/**
 * AUTOMATED PERFORMANCE PROFILING SYSTEM
 * Comprehensive performance analysis and bottleneck detection
 * Real-time monitoring and automated optimization recommendations
 */

import { test, expect } from '@playwright/test';
import { performance } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';

class AutomatedPerformanceProfiler {
  constructor() {
    this.profiles = new Map();
    this.benchmarks = new Map();
    this.performanceBaseline = null;
    this.regressionThreshold = 0.2; // 20% performance degradation threshold
    this.criticalMetrics = {
      firstContentfulPaint: 1500, // 1.5s
      largestContentfulPaint: 2500, // 2.5s
      cumulativeLayoutShift: 0.1,
      firstInputDelay: 100, // 100ms
      totalBlockingTime: 200, // 200ms
      speedIndex: 3000 // 3s
    };
    this.profilingResults = [];
  }

  async initializeProfiler(page) {
    console.log('🔍 Initializing performance profiler...');

    // Enable performance monitoring
    await page.evaluate(() => {
      // Enhanced performance observer
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            window.performanceEntries = window.performanceEntries || [];
            window.performanceEntries.push({
              name: entry.name,
              entryType: entry.entryType,
              startTime: entry.startTime,
              duration: entry.duration,
              timestamp: Date.now()
            });
          }
        });

        observer.observe({ entryTypes: [
          'navigation', 'resource', 'paint', 'largest-contentful-paint',
          'first-input', 'layout-shift', 'longtask', 'mark', 'measure'
        ]});
      }

      // Memory monitoring
      if ('memory' in performance) {
        setInterval(() => {
          window.memorySnapshots = window.memorySnapshots || [];
          window.memorySnapshots.push({
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
            timestamp: Date.now()
          });

          // Keep only last 100 snapshots
          if (window.memorySnapshots.length > 100) {
            window.memorySnapshots = window.memorySnapshots.slice(-100);
          }
        }, 1000);
      }

      // Resource timing analysis
      const trackResourceLoading = () => {
        const resources = performance.getEntriesByType('resource');
        window.resourceAnalysis = {
          totalResources: resources.length,
          slowResources: resources.filter(r => r.duration > 1000),
          largeResources: resources.filter(r => r.transferSize > 100000),
          failedResources: resources.filter(r => r.transferSize === 0),
          resourceTypes: resources.reduce((acc, r) => {
            const type = r.name.split('.').pop() || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {}),
          timestamp: Date.now()
        };
      };

      // Track every 5 seconds
      setInterval(trackResourceLoading, 5000);
      trackResourceLoading(); // Initial call
    });
  }

  async profilePageLoad(page, url) {
    console.log(`📊 Profiling page load: ${url}`);

    const profileStart = performance.now();
    const loadProfile = {
      url,
      startTime: profileStart,
      phases: {},
      metrics: {},
      resources: {},
      issues: []
    };

    try {
      // Start navigation timing
      const navigationStart = performance.now();

      await page.goto(url, { waitUntil: 'domcontentloaded' });

      // Wait for additional resources and paint events
      await page.waitForTimeout(3000);

      loadProfile.phases.navigation = performance.now() - navigationStart;

      // Collect detailed metrics
      const detailedMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paintEntries = performance.getEntriesByType('paint');
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        const layoutShifts = performance.getEntriesByType('layout-shift');
        const longTasks = performance.getEntriesByType('longtask');

        const metrics = {
          // Core Web Vitals
          firstContentfulPaint: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint: lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0,
          cumulativeLayoutShift: layoutShifts.reduce((sum, entry) => sum + entry.value, 0),
          totalBlockingTime: longTasks.reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0),

          // Navigation timing
          navigationTiming: navigation ? {
            domainLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcpConnect: navigation.connectEnd - navigation.connectStart,
            tlsHandshake: navigation.secureConnectionStart > 0 ?
              navigation.connectEnd - navigation.secureConnectionStart : 0,
            request: navigation.responseStart - navigation.requestStart,
            response: navigation.responseEnd - navigation.responseStart,
            domProcessing: navigation.domContentLoadedEventStart - navigation.responseEnd,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            onLoad: navigation.loadEventEnd - navigation.loadEventStart,
            totalTime: navigation.loadEventEnd - navigation.navigationStart
          } : {},

          // Resource analysis
          resourceAnalysis: window.resourceAnalysis || {},

          // Memory snapshots
          memoryProfile: window.memorySnapshots ? {
            current: window.memorySnapshots[window.memorySnapshots.length - 1],
            peak: window.memorySnapshots.reduce((max, snapshot) =>
              snapshot.usedJSHeapSize > max.usedJSHeapSize ? snapshot : max,
              window.memorySnapshots[0] || { usedJSHeapSize: 0 }
            ),
            growth: window.memorySnapshots.length > 1 ?
              window.memorySnapshots[window.memorySnapshots.length - 1].usedJSHeapSize -
              window.memorySnapshots[0].usedJSHeapSize : 0
          } : {},

          // Performance entries
          performanceEntries: window.performanceEntries || []
        };

        // Calculate Speed Index (simplified)
        const visualProgress = [];
        let lastTime = 0;

        performance.getEntriesByType('paint').forEach(entry => {
          visualProgress.push({ time: entry.startTime, progress: 0.1 });
        });

        if (lcpEntries.length > 0) {
          visualProgress.push({ time: lcpEntries[lcpEntries.length - 1].startTime, progress: 0.85 });
        }

        visualProgress.push({ time: navigation ? navigation.loadEventEnd : 0, progress: 1.0 });

        let speedIndex = 0;
        for (let i = 1; i < visualProgress.length; i++) {
          const timeDelta = visualProgress[i].time - visualProgress[i - 1].time;
          const avgProgress = (visualProgress[i].progress + visualProgress[i - 1].progress) / 2;
          speedIndex += timeDelta * (1 - avgProgress);
        }

        metrics.speedIndex = speedIndex;

        return metrics;
      });

      loadProfile.metrics = detailedMetrics;

      // Analyze for performance issues
      loadProfile.issues = this.analyzePerformanceIssues(detailedMetrics);

      // Calculate performance score
      loadProfile.performanceScore = this.calculatePerformanceScore(detailedMetrics);

    } catch (error) {
      loadProfile.error = error.message;
      loadProfile.issues.push({
        type: 'fatal_error',
        severity: 'critical',
        message: `Page load failed: ${error.message}`,
        impact: 'high'
      });
    }

    loadProfile.endTime = performance.now();
    loadProfile.totalDuration = loadProfile.endTime - loadProfile.startTime;

    return loadProfile;
  }

  analyzePerformanceIssues(metrics) {
    const issues = [];

    // Core Web Vitals analysis
    if (metrics.firstContentfulPaint > this.criticalMetrics.firstContentfulPaint) {
      issues.push({
        type: 'slow_fcp',
        severity: 'high',
        message: `First Contentful Paint (${Math.round(metrics.firstContentfulPaint)}ms) exceeds recommended threshold (${this.criticalMetrics.firstContentfulPaint}ms)`,
        impact: 'User perceives slow initial loading',
        recommendations: [
          'Optimize critical rendering path',
          'Minimize render-blocking resources',
          'Implement resource hints (preload, prefetch)',
          'Reduce server response time'
        ]
      });
    }

    if (metrics.largestContentfulPaint > this.criticalMetrics.largestContentfulPaint) {
      issues.push({
        type: 'slow_lcp',
        severity: 'high',
        message: `Largest Contentful Paint (${Math.round(metrics.largestContentfulPaint)}ms) exceeds recommended threshold (${this.criticalMetrics.largestContentfulPaint}ms)`,
        impact: 'Main content appears slowly to users',
        recommendations: [
          'Optimize largest content element (images, text blocks)',
          'Implement lazy loading for below-fold content',
          'Use responsive images with proper sizing',
          'Optimize web fonts loading'
        ]
      });
    }

    if (metrics.cumulativeLayoutShift > this.criticalMetrics.cumulativeLayoutShift) {
      issues.push({
        type: 'high_cls',
        severity: 'medium',
        message: `Cumulative Layout Shift (${metrics.cumulativeLayoutShift.toFixed(3)}) exceeds recommended threshold (${this.criticalMetrics.cumulativeLayoutShift})`,
        impact: 'Content shifts causing poor user experience',
        recommendations: [
          'Add size attributes to images and videos',
          'Reserve space for dynamic content',
          'Avoid inserting content above existing content',
          'Use CSS containment for layout changes'
        ]
      });
    }

    if (metrics.totalBlockingTime > this.criticalMetrics.totalBlockingTime) {
      issues.push({
        type: 'high_tbt',
        severity: 'high',
        message: `Total Blocking Time (${Math.round(metrics.totalBlockingTime)}ms) exceeds recommended threshold (${this.criticalMetrics.totalBlockingTime}ms)`,
        impact: 'Page appears unresponsive to user input',
        recommendations: [
          'Break up long-running JavaScript tasks',
          'Code-split JavaScript bundles',
          'Remove unused JavaScript',
          'Implement web workers for heavy computations'
        ]
      });
    }

    // Resource-specific issues
    if (metrics.resourceAnalysis?.slowResources?.length > 0) {
      issues.push({
        type: 'slow_resources',
        severity: 'medium',
        message: `${metrics.resourceAnalysis.slowResources.length} resources taking >1s to load`,
        impact: 'Slow resource loading affects overall page performance',
        recommendations: [
          'Optimize slow-loading resources',
          'Implement CDN for static assets',
          'Compress images and other assets',
          'Consider lazy loading for non-critical resources'
        ]
      });
    }

    if (metrics.resourceAnalysis?.largeResources?.length > 0) {
      issues.push({
        type: 'large_resources',
        severity: 'medium',
        message: `${metrics.resourceAnalysis.largeResources.length} resources >100KB in size`,
        impact: 'Large resources increase bandwidth usage and load time',
        recommendations: [
          'Compress large assets',
          'Implement progressive loading for large images',
          'Split large JavaScript bundles',
          'Use modern image formats (WebP, AVIF)'
        ]
      });
    }

    // Memory issues
    if (metrics.memoryProfile?.growth > 50 * 1024 * 1024) { // 50MB growth
      issues.push({
        type: 'memory_leak',
        severity: 'high',
        message: `High memory growth detected (${Math.round(metrics.memoryProfile.growth / (1024 * 1024))}MB)`,
        impact: 'Potential memory leak causing performance degradation',
        recommendations: [
          'Profile JavaScript for memory leaks',
          'Remove unused event listeners',
          'Clear interval/timeout references',
          'Optimize DOM manipulation'
        ]
      });
    }

    return issues;
  }

  calculatePerformanceScore(metrics) {
    const weights = {
      firstContentfulPaint: 0.15,
      largestContentfulPaint: 0.25,
      cumulativeLayoutShift: 0.15,
      totalBlockingTime: 0.25,
      speedIndex: 0.20
    };

    let score = 0;

    // FCP scoring
    const fcpScore = metrics.firstContentfulPaint <= 1800 ?
      Math.max(0, (1800 - metrics.firstContentfulPaint) / 1800) : 0;
    score += fcpScore * weights.firstContentfulPaint;

    // LCP scoring
    const lcpScore = metrics.largestContentfulPaint <= 2500 ?
      Math.max(0, (2500 - metrics.largestContentfulPaint) / 2500) : 0;
    score += lcpScore * weights.largestContentfulPaint;

    // CLS scoring
    const clsScore = Math.max(0, (0.1 - metrics.cumulativeLayoutShift) / 0.1);
    score += clsScore * weights.cumulativeLayoutShift;

    // TBT scoring
    const tbtScore = metrics.totalBlockingTime <= 200 ?
      Math.max(0, (200 - metrics.totalBlockingTime) / 200) : 0;
    score += tbtScore * weights.totalBlockingTime;

    // Speed Index scoring
    const siScore = metrics.speedIndex <= 3000 ?
      Math.max(0, (3000 - metrics.speedIndex) / 3000) : 0;
    score += siScore * weights.speedIndex;

    return Math.round(score * 100);
  }

  async profileCriticalUserJourneys(page) {
    console.log('🗺️ Profiling critical user journeys...');

    const journeys = [
      {
        name: 'Homepage Visit',
        path: '/',
        actions: []
      },
      {
        name: 'Services Navigation',
        path: '/',
        actions: [
          { type: 'click', selector: 'nav a[href*="services"]' },
          { type: 'wait', duration: 2000 },
          { type: 'scroll', direction: 'down', distance: 500 }
        ]
      },
      {
        name: 'Contact Form Journey',
        path: '/',
        actions: [
          { type: 'click', selector: 'nav a[href*="contact"]' },
          { type: 'fill', selector: 'input[name*="name"]', value: 'Test User' },
          { type: 'fill', selector: 'input[name*="email"]', value: 'test@example.com' },
          { type: 'fill', selector: 'textarea', value: 'Test message' }
        ]
      },
      {
        name: 'Portfolio Browse',
        path: '/',
        actions: [
          { type: 'click', selector: 'nav a[href*="portfolio"]' },
          { type: 'wait', duration: 1000 },
          { type: 'scroll', direction: 'down', distance: 1000 }
        ]
      }
    ];

    const journeyProfiles = [];

    for (const journey of journeys) {
      try {
        console.log(`📍 Profiling journey: ${journey.name}`);

        const journeyStart = performance.now();
        await page.goto(journey.path);

        // Execute journey actions
        for (const action of journey.actions) {
          const actionStart = performance.now();

          try {
            switch (action.type) {
              case 'click':
                await page.click(action.selector);
                break;
              case 'fill':
                await page.fill(action.selector, action.value);
                break;
              case 'scroll':
                await page.evaluate(({ direction, distance }) => {
                  const scrollAmount = direction === 'down' ? distance : -distance;
                  window.scrollBy(0, scrollAmount);
                }, action);
                break;
              case 'wait':
                await page.waitForTimeout(action.duration);
                break;
            }

            const actionDuration = performance.now() - actionStart;

            // Record action performance
            action.performance = {
              duration: actionDuration,
              success: true
            };

          } catch (error) {
            action.performance = {
              duration: performance.now() - actionStart,
              success: false,
              error: error.message
            };
          }
        }

        const journeyDuration = performance.now() - journeyStart;

        // Collect journey metrics
        const journeyMetrics = await page.evaluate(() => {
          const resources = performance.getEntriesByType('resource');
          const paint = performance.getEntriesByType('paint');

          return {
            resourceCount: resources.length,
            totalTransferSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
            paintEvents: paint.length,
            memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0
          };
        });

        journeyProfiles.push({
          name: journey.name,
          path: journey.path,
          duration: journeyDuration,
          actions: journey.actions,
          metrics: journeyMetrics,
          performanceScore: this.calculateJourneyScore(journeyDuration, journeyMetrics)
        });

      } catch (error) {
        journeyProfiles.push({
          name: journey.name,
          path: journey.path,
          error: error.message,
          success: false
        });
      }
    }

    return journeyProfiles;
  }

  calculateJourneyScore(duration, metrics) {
    let score = 100;

    // Penalize long journeys
    if (duration > 5000) score -= 20;
    else if (duration > 3000) score -= 10;

    // Penalize high memory usage
    if (metrics.memoryUsage > 100 * 1024 * 1024) score -= 15; // 100MB
    else if (metrics.memoryUsage > 50 * 1024 * 1024) score -= 10; // 50MB

    // Penalize large transfer sizes
    if (metrics.totalTransferSize > 5 * 1024 * 1024) score -= 15; // 5MB
    else if (metrics.totalTransferSize > 2 * 1024 * 1024) score -= 10; // 2MB

    return Math.max(0, score);
  }

  async generatePerformanceReport(profiles, journeyProfiles) {
    const reportPath = `/home/abhi/projects/tpp/tests/performance-profile-report-${Date.now()}.json`;

    const summary = {
      totalProfiles: profiles.length,
      averageScore: profiles.reduce((sum, p) => sum + p.performanceScore, 0) / profiles.length,
      criticalIssues: profiles.reduce((sum, p) => sum + p.issues.filter(i => i.severity === 'critical').length, 0),
      highIssues: profiles.reduce((sum, p) => sum + p.issues.filter(i => i.severity === 'high').length, 0),
      mediumIssues: profiles.reduce((sum, p) => sum + p.issues.filter(i => i.severity === 'medium').length, 0),
    };

    const report = {
      timestamp: new Date().toISOString(),
      summary,
      criticalMetrics: this.criticalMetrics,
      profiles: profiles.map(p => ({
        url: p.url,
        performanceScore: p.performanceScore,
        metrics: {
          firstContentfulPaint: p.metrics.firstContentfulPaint,
          largestContentfulPaint: p.metrics.largestContentfulPaint,
          cumulativeLayoutShift: p.metrics.cumulativeLayoutShift,
          totalBlockingTime: p.metrics.totalBlockingTime,
          speedIndex: p.metrics.speedIndex
        },
        issues: p.issues,
        totalDuration: p.totalDuration
      })),
      journeyProfiles,
      recommendations: this.generateOptimizationRecommendations(profiles)
    };

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📈 Performance profile report saved: ${reportPath}`);

    return report;
  }

  generateOptimizationRecommendations(profiles) {
    const allIssues = profiles.flatMap(p => p.issues);
    const issueTypes = {};

    // Group issues by type
    allIssues.forEach(issue => {
      if (!issueTypes[issue.type]) {
        issueTypes[issue.type] = [];
      }
      issueTypes[issue.type].push(issue);
    });

    const recommendations = [];

    // Generate recommendations based on most common issues
    Object.entries(issueTypes)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5) // Top 5 issue types
      .forEach(([type, issues]) => {
        const severity = issues.some(i => i.severity === 'critical') ? 'critical' :
                        issues.some(i => i.severity === 'high') ? 'high' : 'medium';

        recommendations.push({
          type: 'optimization',
          priority: severity,
          description: `${issues.length} instances of ${type} detected across tested pages`,
          actions: issues[0].recommendations || ['Investigate and resolve ' + type],
          affectedUrls: profiles
            .filter(p => p.issues.some(i => i.type === type))
            .map(p => p.url)
        });
      });

    return recommendations;
  }
}

// Test Suite Implementation
test.describe('Automated Performance Profiling Suite', () => {
  let profiler;

  test.beforeAll(async () => {
    profiler = new AutomatedPerformanceProfiler();
  });

  test('Initialize Performance Baseline', async ({ page }) => {
    await profiler.initializeProfiler(page);
    const baseline = await profiler.profilePageLoad(page, '/');

    profiler.performanceBaseline = baseline;
    profiler.profilingResults.push(baseline);

    expect(baseline.performanceScore).toBeGreaterThan(60); // Minimum 60% score
    expect(baseline.issues.filter(i => i.severity === 'critical').length).toBe(0);
  });

  test('Profile Homepage Performance', async ({ page }) => {
    await profiler.initializeProfiler(page);
    const profile = await profiler.profilePageLoad(page, '/');

    profiler.profilingResults.push(profile);

    expect(profile.metrics.firstContentfulPaint).toBeLessThan(profiler.criticalMetrics.firstContentfulPaint);
    expect(profile.metrics.largestContentfulPaint).toBeLessThan(profiler.criticalMetrics.largestContentfulPaint);
    expect(profile.metrics.cumulativeLayoutShift).toBeLessThan(profiler.criticalMetrics.cumulativeLayoutShift);
  });

  test('Profile All Key Pages', async ({ page }) => {
    const keyPages = ['/', '/services', '/portfolio', '/contact'];
    const pageProfiles = [];

    await profiler.initializeProfiler(page);

    for (const pagePath of keyPages) {
      const profile = await profiler.profilePageLoad(page, pagePath);
      pageProfiles.push(profile);
      profiler.profilingResults.push(profile);
    }

    // All pages should meet minimum performance standards
    pageProfiles.forEach(profile => {
      expect(profile.performanceScore).toBeGreaterThan(50); // Minimum 50% for all pages
    });

    const avgScore = pageProfiles.reduce((sum, p) => sum + p.performanceScore, 0) / pageProfiles.length;
    expect(avgScore).toBeGreaterThan(65); // Average should be 65%+
  });

  test('Profile Critical User Journeys', async ({ page }) => {
    await profiler.initializeProfiler(page);
    const journeyProfiles = await profiler.profileCriticalUserJourneys(page);

    // All journeys should complete successfully
    journeyProfiles.forEach(journey => {
      expect(journey.success !== false).toBe(true);
      expect(journey.performanceScore).toBeGreaterThan(70); // Higher bar for user journeys
    });
  });

  test('Detect Performance Regressions', async ({ page }) => {
    if (!profiler.performanceBaseline) {
      test.skip('No baseline established');
    }

    await profiler.initializeProfiler(page);
    const currentProfile = await profiler.profilePageLoad(page, '/');

    const baseline = profiler.performanceBaseline;
    const regressionThreshold = profiler.regressionThreshold;

    // Check for regressions in key metrics
    const fcpRegression = (currentProfile.metrics.firstContentfulPaint - baseline.metrics.firstContentfulPaint) / baseline.metrics.firstContentfulPaint;
    const lcpRegression = (currentProfile.metrics.largestContentfulPaint - baseline.metrics.largestContentfulPaint) / baseline.metrics.largestContentfulPaint;

    expect(fcpRegression).toBeLessThan(regressionThreshold);
    expect(lcpRegression).toBeLessThan(regressionThreshold);

    if (fcpRegression > regressionThreshold) {
      console.warn(`⚠️ FCP regression detected: ${(fcpRegression * 100).toFixed(1)}% slower than baseline`);
    }

    if (lcpRegression > regressionThreshold) {
      console.warn(`⚠️ LCP regression detected: ${(lcpRegression * 100).toFixed(1)}% slower than baseline`);
    }
  });

  test.afterAll(async () => {
    if (profiler.profilingResults.length > 0) {
      const journeyProfiles = []; // Would be populated from journey tests
      const report = await profiler.generatePerformanceReport(profiler.profilingResults, journeyProfiles);

      console.log('🎯 Performance Profiling Complete');
      console.log(`📊 Average Performance Score: ${report.summary.averageScore.toFixed(1)}%`);
      console.log(`🚨 Critical Issues: ${report.summary.criticalIssues}`);
      console.log(`⚠️ High Issues: ${report.summary.highIssues}`);
      console.log(`ℹ️ Medium Issues: ${report.summary.mediumIssues}`);
    }
  });
});