/**
 * CONTINUOUS PERFORMANCE TESTING PIPELINE
 * Automated CI/CD integration for performance monitoring
 * Real-time performance regression detection and alerting
 */

import { test, expect } from '@playwright/test';
import { performance } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

class ContinuousPerformancePipeline {
  constructor() {
    this.pipelineConfig = {
      performanceThresholds: {
        homepage: {
          firstContentfulPaint: 2000,
          largestContentfulPaint: 3000,
          cumulativeLayoutShift: 0.1,
          totalBlockingTime: 300,
          speedIndex: 4000,
          performanceScore: 75
        },
        subpages: {
          firstContentfulPaint: 2500,
          largestContentfulPaint: 3500,
          cumulativeLayoutShift: 0.15,
          totalBlockingTime: 400,
          speedIndex: 5000,
          performanceScore: 70
        }
      },
      regressionThreshold: 15, // 15% regression triggers alert
      historyRetentionDays: 30,
      alertingEnabled: true,
      buildQualityGates: true
    };

    this.performanceHistory = new Map();
    this.currentBuildMetrics = {};
    this.regressionAlerts = [];
    this.buildStatus = {
      passed: false,
      score: 0,
      issues: [],
      timestamp: Date.now()
    };
  }

  async initializePipeline() {
    console.log('🔄 Initializing Continuous Performance Pipeline...');

    // Load historical performance data
    await this.loadPerformanceHistory();

    // Set up build environment detection
    this.detectBuildEnvironment();

    // Configure quality gates
    this.setupQualityGates();

    console.log('✅ Pipeline initialized successfully');
  }

  async loadPerformanceHistory() {
    try {
      const historyPath = '/home/abhi/projects/tpp/tests/performance-history.json';
      const historyData = await fs.readFile(historyPath, 'utf8');
      const history = JSON.parse(historyData);

      // Convert to Map and filter by retention period
      const cutoffDate = Date.now() - (this.pipelineConfig.historyRetentionDays * 24 * 60 * 60 * 1000);

      Object.entries(history).forEach(([url, records]) => {
        const filteredRecords = records.filter(record => record.timestamp > cutoffDate);
        if (filteredRecords.length > 0) {
          this.performanceHistory.set(url, filteredRecords);
        }
      });

      console.log(`📚 Loaded performance history for ${this.performanceHistory.size} URLs`);

    } catch (error) {
      console.log('📝 No existing performance history found, starting fresh');
      this.performanceHistory = new Map();
    }
  }

  detectBuildEnvironment() {
    this.buildEnvironment = {
      isCi: !!process.env.CI,
      buildId: process.env.BUILD_ID || process.env.GITHUB_RUN_ID || Date.now().toString(),
      branch: process.env.BRANCH_NAME || process.env.GITHUB_REF_NAME || 'main',
      commit: process.env.COMMIT_SHA || process.env.GITHUB_SHA || this.getGitCommit(),
      buildNumber: process.env.BUILD_NUMBER || process.env.GITHUB_RUN_NUMBER || '1',
      pullRequest: process.env.PULL_REQUEST_NUMBER || process.env.GITHUB_PR_NUMBER || null
    };

    console.log(`🏗️ Build Environment:`, this.buildEnvironment);
  }

  getGitCommit() {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
      return 'unknown';
    }
  }

  setupQualityGates() {
    if (this.pipelineConfig.buildQualityGates) {
      console.log('🚪 Quality gates enabled - build will fail on performance regressions');
    } else {
      console.log('ℹ️ Quality gates disabled - performance issues will be logged only');
    }
  }

  async runPerformanceAudit(page, url, pageType = 'subpages') {
    console.log(`🔍 Running performance audit for: ${url}`);

    const auditStart = performance.now();
    const audit = {
      url,
      pageType,
      timestamp: Date.now(),
      buildInfo: this.buildEnvironment,
      metrics: {},
      issues: [],
      passed: false,
      score: 0
    };

    try {
      // Navigate and wait for page to stabilize
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000); // Allow for paint events and layout shifts

      // Collect Core Web Vitals and other performance metrics
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const metrics = {
            timestamp: Date.now()
          };

          // Navigation timing
          const navigation = performance.getEntriesByType('navigation')[0];
          if (navigation) {
            metrics.navigationTiming = {
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
              loadComplete: navigation.loadEventEnd - navigation.navigationStart,
              firstByte: navigation.responseStart - navigation.navigationStart
            };
          }

          // Core Web Vitals
          const paintEntries = performance.getEntriesByType('paint');
          const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
          const layoutShifts = performance.getEntriesByType('layout-shift');
          const longTasks = performance.getEntriesByType('longtask');

          metrics.firstContentfulPaint = paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0;
          metrics.largestContentfulPaint = lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0;
          metrics.cumulativeLayoutShift = layoutShifts.reduce((sum, entry) => sum + entry.value, 0);
          metrics.totalBlockingTime = longTasks.reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0);

          // Calculate Speed Index (simplified)
          let speedIndex = 0;
          if (navigation) {
            const milestones = [
              { time: metrics.firstContentfulPaint, progress: 0.2 },
              { time: metrics.largestContentfulPaint, progress: 0.8 },
              { time: navigation.loadEventEnd - navigation.navigationStart, progress: 1.0 }
            ];

            for (let i = 1; i < milestones.length; i++) {
              const timeDelta = milestones[i].time - milestones[i - 1].time;
              const avgProgress = (milestones[i].progress + milestones[i - 1].progress) / 2;
              speedIndex += timeDelta * (1 - avgProgress);
            }
          }
          metrics.speedIndex = speedIndex;

          // Resource analysis
          const resources = performance.getEntriesByType('resource');
          metrics.resourceMetrics = {
            totalRequests: resources.length,
            totalTransferSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
            slowResources: resources.filter(r => r.duration > 1000).length,
            failedResources: resources.filter(r => r.transferSize === 0 && r.duration > 0).length
          };

          // Memory usage
          if (performance.memory) {
            metrics.memoryUsage = {
              usedJSHeapSize: performance.memory.usedJSHeapSize,
              totalJSHeapSize: performance.memory.totalJSHeapSize,
              jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
          }

          resolve(metrics);
        });
      });

      audit.metrics = metrics;

      // Apply thresholds and calculate score
      const thresholds = this.pipelineConfig.performanceThresholds[pageType];
      audit.score = this.calculatePerformanceScore(metrics, thresholds);
      audit.issues = this.analyzeMetricsForIssues(metrics, thresholds, url);
      audit.passed = audit.score >= thresholds.performanceScore && audit.issues.filter(i => i.severity === 'critical').length === 0;

      // Check for regressions against historical data
      await this.detectPerformanceRegressions(url, metrics, audit);

      // Store metrics for future comparison
      await this.storeMetrics(url, audit);

    } catch (error) {
      audit.error = error.message;
      audit.issues.push({
        type: 'audit_failure',
        severity: 'critical',
        message: `Performance audit failed: ${error.message}`,
        impact: 'Cannot assess performance'
      });
    }

    audit.duration = performance.now() - auditStart;
    return audit;
  }

  calculatePerformanceScore(metrics, thresholds) {
    const weights = {
      firstContentfulPaint: 0.2,
      largestContentfulPaint: 0.25,
      cumulativeLayoutShift: 0.15,
      totalBlockingTime: 0.25,
      speedIndex: 0.15
    };

    let score = 0;

    // FCP score
    const fcpScore = Math.max(0, Math.min(100, 100 - (metrics.firstContentfulPaint / thresholds.firstContentfulPaint) * 100));
    score += (fcpScore / 100) * weights.firstContentfulPaint;

    // LCP score
    const lcpScore = Math.max(0, Math.min(100, 100 - (metrics.largestContentfulPaint / thresholds.largestContentfulPaint) * 100));
    score += (lcpScore / 100) * weights.largestContentfulPaint;

    // CLS score (inverted - lower is better)
    const clsScore = Math.max(0, Math.min(100, (thresholds.cumulativeLayoutShift - metrics.cumulativeLayoutShift) / thresholds.cumulativeLayoutShift * 100));
    score += (clsScore / 100) * weights.cumulativeLayoutShift;

    // TBT score
    const tbtScore = Math.max(0, Math.min(100, 100 - (metrics.totalBlockingTime / thresholds.totalBlockingTime) * 100));
    score += (tbtScore / 100) * weights.totalBlockingTime;

    // Speed Index score
    const siScore = Math.max(0, Math.min(100, 100 - (metrics.speedIndex / thresholds.speedIndex) * 100));
    score += (siScore / 100) * weights.speedIndex;

    return Math.round(score * 100);
  }

  analyzeMetricsForIssues(metrics, thresholds, url) {
    const issues = [];

    if (metrics.firstContentfulPaint > thresholds.firstContentfulPaint) {
      issues.push({
        type: 'slow_fcp',
        severity: 'high',
        metric: 'First Contentful Paint',
        actual: Math.round(metrics.firstContentfulPaint),
        threshold: thresholds.firstContentfulPaint,
        message: `FCP (${Math.round(metrics.firstContentfulPaint)}ms) exceeds threshold (${thresholds.firstContentfulPaint}ms)`,
        url
      });
    }

    if (metrics.largestContentfulPaint > thresholds.largestContentfulPaint) {
      issues.push({
        type: 'slow_lcp',
        severity: 'high',
        metric: 'Largest Contentful Paint',
        actual: Math.round(metrics.largestContentfulPaint),
        threshold: thresholds.largestContentfulPaint,
        message: `LCP (${Math.round(metrics.largestContentfulPaint)}ms) exceeds threshold (${thresholds.largestContentfulPaint}ms)`,
        url
      });
    }

    if (metrics.cumulativeLayoutShift > thresholds.cumulativeLayoutShift) {
      issues.push({
        type: 'high_cls',
        severity: 'medium',
        metric: 'Cumulative Layout Shift',
        actual: metrics.cumulativeLayoutShift.toFixed(3),
        threshold: thresholds.cumulativeLayoutShift,
        message: `CLS (${metrics.cumulativeLayoutShift.toFixed(3)}) exceeds threshold (${thresholds.cumulativeLayoutShift})`,
        url
      });
    }

    if (metrics.totalBlockingTime > thresholds.totalBlockingTime) {
      issues.push({
        type: 'high_tbt',
        severity: 'high',
        metric: 'Total Blocking Time',
        actual: Math.round(metrics.totalBlockingTime),
        threshold: thresholds.totalBlockingTime,
        message: `TBT (${Math.round(metrics.totalBlockingTime)}ms) exceeds threshold (${thresholds.totalBlockingTime}ms)`,
        url
      });
    }

    if (metrics.speedIndex > thresholds.speedIndex) {
      issues.push({
        type: 'slow_speed_index',
        severity: 'medium',
        metric: 'Speed Index',
        actual: Math.round(metrics.speedIndex),
        threshold: thresholds.speedIndex,
        message: `Speed Index (${Math.round(metrics.speedIndex)}ms) exceeds threshold (${thresholds.speedIndex}ms)`,
        url
      });
    }

    // Resource-based issues
    if (metrics.resourceMetrics.failedResources > 0) {
      issues.push({
        type: 'failed_resources',
        severity: 'critical',
        metric: 'Failed Resources',
        actual: metrics.resourceMetrics.failedResources,
        message: `${metrics.resourceMetrics.failedResources} resources failed to load`,
        url
      });
    }

    if (metrics.resourceMetrics.slowResources > 5) {
      issues.push({
        type: 'slow_resources',
        severity: 'medium',
        metric: 'Slow Resources',
        actual: metrics.resourceMetrics.slowResources,
        message: `${metrics.resourceMetrics.slowResources} resources took >1s to load`,
        url
      });
    }

    return issues;
  }

  async detectPerformanceRegressions(url, currentMetrics, audit) {
    const history = this.performanceHistory.get(url);

    if (!history || history.length === 0) {
      console.log(`📝 No historical data for ${url}, establishing baseline`);
      return;
    }

    // Get recent baseline (average of last 5 builds)
    const recentHistory = history.slice(-5);
    const baseline = this.calculateBaseline(recentHistory);

    const regressions = [];
    const regressionThreshold = this.pipelineConfig.regressionThreshold / 100; // Convert to decimal

    const metricsToCheck = ['firstContentfulPaint', 'largestContentfulPaint', 'totalBlockingTime', 'speedIndex'];

    metricsToCheck.forEach(metric => {
      if (baseline[metric] && currentMetrics[metric]) {
        const regression = (currentMetrics[metric] - baseline[metric]) / baseline[metric];

        if (regression > regressionThreshold) {
          const regressionData = {
            url,
            metric,
            regression: Math.round(regression * 100),
            current: Math.round(currentMetrics[metric]),
            baseline: Math.round(baseline[metric]),
            severity: regression > 0.3 ? 'critical' : 'high',
            message: `${metric} regressed by ${Math.round(regression * 100)}% (${Math.round(currentMetrics[metric])}ms vs ${Math.round(baseline[metric])}ms baseline)`
          };

          regressions.push(regressionData);
          this.regressionAlerts.push(regressionData);

          audit.issues.push({
            type: 'performance_regression',
            severity: regressionData.severity,
            metric: regressionData.metric,
            message: regressionData.message,
            url
          });
        }
      }
    });

    if (regressions.length > 0) {
      console.log(`⚠️ ${regressions.length} performance regressions detected for ${url}`);
      audit.regressions = regressions;
    }
  }

  calculateBaseline(history) {
    const baseline = {};

    if (history.length === 0) return baseline;

    const metricsToAverage = ['firstContentfulPaint', 'largestContentfulPaint', 'cumulativeLayoutShift', 'totalBlockingTime', 'speedIndex'];

    metricsToAverage.forEach(metric => {
      const values = history
        .map(h => h.metrics?.[metric])
        .filter(v => v !== undefined && v !== null);

      if (values.length > 0) {
        baseline[metric] = values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    });

    return baseline;
  }

  async storeMetrics(url, audit) {
    if (!this.performanceHistory.has(url)) {
      this.performanceHistory.set(url, []);
    }

    const history = this.performanceHistory.get(url);
    history.push({
      timestamp: audit.timestamp,
      buildId: audit.buildInfo.buildId,
      branch: audit.buildInfo.branch,
      commit: audit.buildInfo.commit,
      metrics: audit.metrics,
      score: audit.score,
      passed: audit.passed
    });

    // Keep only last 100 entries per URL
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    this.performanceHistory.set(url, history);
  }

  async savePerformanceHistory() {
    const historyPath = '/home/abhi/projects/tpp/tests/performance-history.json';
    const historyObject = Object.fromEntries(this.performanceHistory);

    await fs.writeFile(historyPath, JSON.stringify(historyObject, null, 2));
    console.log(`💾 Performance history saved to ${historyPath}`);
  }

  async generatePipelineReport(audits) {
    const reportPath = `/home/abhi/projects/tpp/tests/pipeline-report-${this.buildEnvironment.buildId}.json`;

    const summary = {
      buildInfo: this.buildEnvironment,
      timestamp: new Date().toISOString(),
      totalAudits: audits.length,
      passedAudits: audits.filter(a => a.passed).length,
      failedAudits: audits.filter(a => !a.passed).length,
      averageScore: audits.reduce((sum, a) => sum + a.score, 0) / audits.length,
      totalIssues: audits.reduce((sum, a) => sum + a.issues.length, 0),
      criticalIssues: audits.reduce((sum, a) => sum + a.issues.filter(i => i.severity === 'critical').length, 0),
      regressions: this.regressionAlerts.length,
      buildPassed: audits.every(a => a.passed) && this.regressionAlerts.filter(r => r.severity === 'critical').length === 0
    };

    const report = {
      summary,
      audits: audits.map(audit => ({
        url: audit.url,
        pageType: audit.pageType,
        passed: audit.passed,
        score: audit.score,
        metrics: {
          firstContentfulPaint: Math.round(audit.metrics.firstContentfulPaint || 0),
          largestContentfulPaint: Math.round(audit.metrics.largestContentfulPaint || 0),
          cumulativeLayoutShift: parseFloat((audit.metrics.cumulativeLayoutShift || 0).toFixed(3)),
          totalBlockingTime: Math.round(audit.metrics.totalBlockingTime || 0),
          speedIndex: Math.round(audit.metrics.speedIndex || 0)
        },
        issues: audit.issues,
        regressions: audit.regressions || []
      })),
      regressionAlerts: this.regressionAlerts,
      thresholds: this.pipelineConfig.performanceThresholds,
      recommendations: this.generatePipelineRecommendations(audits)
    };

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Also create a summary for CI systems
    await this.generateCiSummary(report, reportPath);

    this.buildStatus = {
      passed: summary.buildPassed,
      score: Math.round(summary.averageScore),
      issues: summary.totalIssues,
      criticalIssues: summary.criticalIssues,
      regressions: summary.regressions,
      timestamp: Date.now()
    };

    console.log(`📊 Pipeline report generated: ${reportPath}`);
    return report;
  }

  async generateCiSummary(report, reportPath) {
    const summaryPath = '/home/abhi/projects/tpp/tests/ci-summary.txt';
    const summary = report.summary;

    const summaryText = `
PERFORMANCE TEST RESULTS
========================

Build: ${summary.buildInfo.buildId}
Branch: ${summary.buildInfo.branch}
Commit: ${summary.buildInfo.commit}

SUMMARY
-------
✅ Passed: ${summary.passedAudits}/${summary.totalAudits} audits
📊 Average Score: ${Math.round(summary.averageScore)}%
🚨 Critical Issues: ${summary.criticalIssues}
⚠️  Total Issues: ${summary.totalIssues}
📈 Performance Regressions: ${summary.regressions}

BUILD STATUS: ${summary.buildPassed ? '✅ PASSED' : '❌ FAILED'}

${summary.buildPassed ? '' : `
FAILURE REASONS:
${report.audits.filter(a => !a.passed).map(a => `- ${a.url}: Score ${a.score}% (threshold: ${this.pipelineConfig.performanceThresholds[a.pageType].performanceScore}%)`).join('\n')}
${this.regressionAlerts.filter(r => r.severity === 'critical').map(r => `- CRITICAL REGRESSION: ${r.message}`).join('\n')}
`}

DETAILED RESULTS:
----------------
${report.audits.map(audit => `
${audit.url} (${audit.pageType})
  Score: ${audit.score}% ${audit.passed ? '✅' : '❌'}
  FCP: ${audit.metrics.firstContentfulPaint}ms
  LCP: ${audit.metrics.largestContentfulPaint}ms
  CLS: ${audit.metrics.cumulativeLayoutShift}
  TBT: ${audit.metrics.totalBlockingTime}ms
  Issues: ${audit.issues.length}
`).join('')}

Full report: ${reportPath}
`;

    await fs.writeFile(summaryPath, summaryText);

    // Output to console for CI visibility
    console.log(summaryText);
  }

  generatePipelineRecommendations(audits) {
    const recommendations = [];
    const allIssues = audits.flatMap(a => a.issues);

    // Group issues by type
    const issueGroups = {};
    allIssues.forEach(issue => {
      if (!issueGroups[issue.type]) {
        issueGroups[issue.type] = [];
      }
      issueGroups[issue.type].push(issue);
    });

    // Generate recommendations for most common issues
    Object.entries(issueGroups)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5)
      .forEach(([type, issues]) => {
        const severity = issues.some(i => i.severity === 'critical') ? 'critical' :
                        issues.some(i => i.severity === 'high') ? 'high' : 'medium';

        recommendations.push({
          type: 'pipeline_optimization',
          priority: severity,
          description: `${issues.length} instances of ${type} across tested pages`,
          affectedPages: [...new Set(issues.map(i => i.url))],
          suggestedActions: this.getActionsForIssueType(type)
        });
      });

    return recommendations;
  }

  getActionsForIssueType(issueType) {
    const actionMap = {
      'slow_fcp': [
        'Optimize critical rendering path',
        'Minimize render-blocking resources',
        'Implement resource preloading',
        'Optimize server response time'
      ],
      'slow_lcp': [
        'Optimize main content images',
        'Implement lazy loading',
        'Use responsive images',
        'Optimize web fonts'
      ],
      'high_cls': [
        'Add size attributes to images',
        'Reserve space for dynamic content',
        'Avoid DOM insertions above fold',
        'Use CSS containment'
      ],
      'high_tbt': [
        'Split large JavaScript bundles',
        'Remove unused JavaScript',
        'Use web workers',
        'Optimize third-party scripts'
      ],
      'performance_regression': [
        'Investigate recent code changes',
        'Review new dependencies',
        'Check for memory leaks',
        'Profile JavaScript performance'
      ]
    };

    return actionMap[issueType] || [`Address ${issueType} issues`];
  }

  getExitCode() {
    if (!this.pipelineConfig.buildQualityGates) {
      return 0; // Always pass when quality gates are disabled
    }

    return this.buildStatus.passed ? 0 : 1;
  }
}

// Test Suite Implementation
test.describe('Continuous Performance Pipeline', () => {
  let pipeline;

  test.beforeAll(async () => {
    pipeline = new ContinuousPerformancePipeline();
    await pipeline.initializePipeline();
  });

  test('Homepage Performance Audit', async ({ page }) => {
    const audit = await pipeline.runPerformanceAudit(page, '/', 'homepage');

    pipeline.currentBuildMetrics.homepage = audit;

    expect(audit.passed).toBe(true);
    expect(audit.score).toBeGreaterThanOrEqual(pipeline.pipelineConfig.performanceThresholds.homepage.performanceScore);
  });

  test('Services Page Performance Audit', async ({ page }) => {
    const audit = await pipeline.runPerformanceAudit(page, '/services', 'subpages');

    pipeline.currentBuildMetrics.services = audit;

    expect(audit.passed).toBe(true);
    expect(audit.score).toBeGreaterThanOrEqual(pipeline.pipelineConfig.performanceThresholds.subpages.performanceScore);
  });

  test('Portfolio Page Performance Audit', async ({ page }) => {
    const audit = await pipeline.runPerformanceAudit(page, '/portfolio', 'subpages');

    pipeline.currentBuildMetrics.portfolio = audit;

    expect(audit.passed).toBe(true);
    expect(audit.score).toBeGreaterThanOrEqual(pipeline.pipelineConfig.performanceThresholds.subpages.performanceScore);
  });

  test('Contact Page Performance Audit', async ({ page }) => {
    const audit = await pipeline.runPerformanceAudit(page, '/contact', 'subpages');

    pipeline.currentBuildMetrics.contact = audit;

    expect(audit.passed).toBe(true);
    expect(audit.score).toBeGreaterThanOrEqual(pipeline.pipelineConfig.performanceThresholds.subpages.performanceScore);
  });

  test.afterAll(async () => {
    // Save performance history
    await pipeline.savePerformanceHistory();

    // Generate comprehensive pipeline report
    const allAudits = Object.values(pipeline.currentBuildMetrics);
    const report = await pipeline.generatePipelineReport(allAudits);

    console.log(`\n🏁 CONTINUOUS PERFORMANCE PIPELINE COMPLETE`);
    console.log(`📊 Build Score: ${report.summary.averageScore.toFixed(1)}%`);
    console.log(`✅ Passed: ${report.summary.passedAudits}/${report.summary.totalAudits}`);
    console.log(`🚨 Critical Issues: ${report.summary.criticalIssues}`);
    console.log(`📈 Regressions: ${report.summary.regressions}`);
    console.log(`🏗️ Build Status: ${report.summary.buildPassed ? 'PASSED' : 'FAILED'}`);

    // Set exit code for CI systems
    if (!report.summary.buildPassed && pipeline.pipelineConfig.buildQualityGates) {
      console.log(`❌ Build failed due to performance issues`);
      process.exitCode = 1;
    }
  });
});