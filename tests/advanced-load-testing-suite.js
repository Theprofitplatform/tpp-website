/**
 * ADVANCED LOAD TESTING SUITE
 * Simulates realistic user behavior patterns and load scenarios
 * Tests system performance under various load conditions
 */

import { test, expect } from '@playwright/test';
import { performance } from 'perf_hooks';
import fs from 'fs/promises';
import crypto from 'crypto';

class AdvancedLoadTester {
  constructor() {
    this.testMetrics = [];
    this.userJourneyPatterns = [];
    this.performanceThresholds = {
      responseTime: 3000,
      throughput: 100, // requests per second
      errorRate: 0.05, // 5% maximum error rate
      concurrentUsers: 100
    };
    this.userBehaviorProfiles = this.defineUserProfiles();
    this.realWorldScenarios = this.defineRealWorldScenarios();
  }

  defineUserProfiles() {
    return {
      'speed_scanner': {
        name: 'Speed Scanner',
        description: 'Users who quickly scan content and bounce',
        sessionDuration: { min: 10000, max: 30000 }, // 10-30 seconds
        pageViews: { min: 1, max: 3 },
        scrollBehavior: 'fast_scroll',
        interactionProbability: 0.2,
        bounceRate: 0.7,
        actions: ['scroll', 'quick_navigation']
      },
      'research_explorer': {
        name: 'Research Explorer',
        description: 'Users who thoroughly explore content',
        sessionDuration: { min: 120000, max: 600000 }, // 2-10 minutes
        pageViews: { min: 5, max: 15 },
        scrollBehavior: 'detailed_read',
        interactionProbability: 0.8,
        bounceRate: 0.2,
        actions: ['scroll', 'navigation', 'form_interaction', 'click_links']
      },
      'goal_oriented': {
        name: 'Goal Oriented',
        description: 'Users with specific objectives (contact, pricing)',
        sessionDuration: { min: 45000, max: 180000 }, // 45s-3 minutes
        pageViews: { min: 2, max: 6 },
        scrollBehavior: 'target_focused',
        interactionProbability: 0.9,
        bounceRate: 0.3,
        actions: ['navigation', 'form_interaction', 'contact_actions']
      },
      'mobile_casual': {
        name: 'Mobile Casual',
        description: 'Mobile users with limited attention',
        sessionDuration: { min: 15000, max: 90000 }, // 15s-90s
        pageViews: { min: 1, max: 4 },
        scrollBehavior: 'mobile_scroll',
        interactionProbability: 0.4,
        bounceRate: 0.6,
        actions: ['scroll', 'tap_navigation', 'swipe_actions']
      }
    };
  }

  defineRealWorldScenarios() {
    return {
      'business_hours_peak': {
        name: 'Business Hours Peak',
        description: 'High traffic during business hours',
        userMix: {
          'research_explorer': 0.4,
          'goal_oriented': 0.3,
          'speed_scanner': 0.2,
          'mobile_casual': 0.1
        },
        trafficPattern: 'gradual_increase',
        peakUsers: 80,
        duration: 300000 // 5 minutes
      },
      'viral_traffic_spike': {
        name: 'Viral Traffic Spike',
        description: 'Sudden spike from social media or news',
        userMix: {
          'speed_scanner': 0.6,
          'mobile_casual': 0.3,
          'research_explorer': 0.1,
          'goal_oriented': 0.0
        },
        trafficPattern: 'immediate_spike',
        peakUsers: 200,
        duration: 180000 // 3 minutes
      },
      'marketing_campaign': {
        name: 'Marketing Campaign',
        description: 'Sustained traffic from marketing efforts',
        userMix: {
          'goal_oriented': 0.5,
          'research_explorer': 0.3,
          'speed_scanner': 0.15,
          'mobile_casual': 0.05
        },
        trafficPattern: 'sustained_load',
        peakUsers: 120,
        duration: 600000 // 10 minutes
      },
      'off_hours_baseline': {
        name: 'Off Hours Baseline',
        description: 'Normal low traffic periods',
        userMix: {
          'research_explorer': 0.4,
          'goal_oriented': 0.3,
          'speed_scanner': 0.2,
          'mobile_casual': 0.1
        },
        trafficPattern: 'steady_low',
        peakUsers: 15,
        duration: 300000 // 5 minutes
      }
    };
  }

  async simulateUserBehavior(page, profile, sessionId) {
    const startTime = performance.now();
    const sessionMetrics = {
      sessionId,
      profile: profile.name,
      startTime,
      actions: [],
      errors: [],
      performance: {}
    };

    try {
      // Calculate session parameters based on profile
      const sessionDuration = this.randomBetween(profile.sessionDuration.min, profile.sessionDuration.max);
      const targetPageViews = this.randomBetween(profile.pageViews.min, profile.pageViews.max);
      const sessionEndTime = startTime + sessionDuration;

      console.log(`👤 Starting ${profile.name} session: ${sessionId}`);

      // Initial page load
      const loadStart = performance.now();
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const loadTime = performance.now() - loadStart;

      sessionMetrics.actions.push({
        action: 'page_load',
        page: 'home',
        timestamp: performance.now(),
        duration: loadTime,
        success: true
      });

      let pageViewCount = 1;

      // Continue session until time limit or page view limit reached
      while (performance.now() < sessionEndTime && pageViewCount < targetPageViews) {
        try {
          await this.executeUserAction(page, profile, sessionMetrics);
          pageViewCount++;

          // Think time between actions
          const thinkTime = this.calculateThinkTime(profile);
          await page.waitForTimeout(thinkTime);

        } catch (error) {
          sessionMetrics.errors.push({
            error: error.message,
            timestamp: performance.now(),
            action: 'user_action'
          });

          // Continue session even with errors (realistic behavior)
          await page.waitForTimeout(1000);
        }

        // Check if user bounces early
        if (Math.random() < profile.bounceRate && pageViewCount === 1) {
          break;
        }
      }

      // Collect final performance metrics
      const finalMetrics = await this.collectPageMetrics(page);
      sessionMetrics.performance = finalMetrics;

    } catch (error) {
      sessionMetrics.errors.push({
        error: error.message,
        timestamp: performance.now(),
        action: 'session_error'
      });
    }

    sessionMetrics.endTime = performance.now();
    sessionMetrics.totalDuration = sessionMetrics.endTime - sessionMetrics.startTime;

    return sessionMetrics;
  }

  async executeUserAction(page, profile, sessionMetrics) {
    const action = this.selectWeightedAction(profile.actions);
    const actionStart = performance.now();

    try {
      switch (action) {
        case 'scroll':
          await this.executeScrollBehavior(page, profile.scrollBehavior);
          break;

        case 'navigation':
        case 'quick_navigation':
        case 'tap_navigation':
          await this.executeNavigation(page, action === 'quick_navigation');
          break;

        case 'form_interaction':
          await this.executeFormInteraction(page);
          break;

        case 'contact_actions':
          await this.executeContactActions(page);
          break;

        case 'click_links':
          await this.executeRandomLinkClick(page);
          break;

        case 'swipe_actions':
          await this.executeMobileGestures(page);
          break;

        default:
          await this.executeScrollBehavior(page, 'fast_scroll');
      }

      const actionDuration = performance.now() - actionStart;
      sessionMetrics.actions.push({
        action,
        timestamp: performance.now(),
        duration: actionDuration,
        success: true
      });

    } catch (error) {
      const actionDuration = performance.now() - actionStart;
      sessionMetrics.actions.push({
        action,
        timestamp: performance.now(),
        duration: actionDuration,
        success: false,
        error: error.message
      });
    }
  }

  async executeScrollBehavior(page, scrollType) {
    const scrollActions = {
      'fast_scroll': async () => {
        // Quick scroll to bottom then back up
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        await page.waitForTimeout(500);
        await page.evaluate(() => {
          window.scrollTo(0, 0);
        });
      },

      'detailed_read': async () => {
        // Gradual scroll with reading pauses
        const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
        const steps = 5;
        const stepSize = scrollHeight / steps;

        for (let i = 1; i <= steps; i++) {
          await page.evaluate((y) => {
            window.scrollTo(0, y);
          }, stepSize * i);
          await page.waitForTimeout(this.randomBetween(1000, 3000));
        }
      },

      'target_focused': async () => {
        // Scroll to specific sections quickly
        const sections = await page.locator('section, .section, [id*="section"]').all();
        if (sections.length > 0) {
          const targetSection = sections[Math.floor(Math.random() * sections.length)];
          await targetSection.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1000);
        }
      },

      'mobile_scroll': async () => {
        // Short, quick scrolls typical of mobile
        for (let i = 0; i < 3; i++) {
          await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight * 0.7);
          });
          await page.waitForTimeout(this.randomBetween(500, 1500));
        }
      }
    };

    const scrollAction = scrollActions[scrollType] || scrollActions['fast_scroll'];
    await scrollAction();
  }

  async executeNavigation(page, isQuick = false) {
    const navLinks = await page.locator('nav a, .nav a, header a').all();

    if (navLinks.length > 0) {
      const randomLink = navLinks[Math.floor(Math.random() * navLinks.length)];
      const href = await randomLink.getAttribute('href');

      if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
        await randomLink.click();

        if (!isQuick) {
          await page.waitForLoadState('domcontentloaded');
        }
      }
    }
  }

  async executeFormInteraction(page) {
    // Look for contact forms or input fields
    const forms = await page.locator('form').all();

    if (forms.length > 0) {
      const form = forms[0];

      // Fill text inputs
      const textInputs = await form.locator('input[type="text"], input[type="email"], input[name*="name"], input[name*="email"]').all();

      for (const input of textInputs) {
        const name = await input.getAttribute('name') || await input.getAttribute('placeholder') || '';

        if (name.toLowerCase().includes('name')) {
          await input.fill('Test User');
        } else if (name.toLowerCase().includes('email')) {
          await input.fill('test@example.com');
        } else {
          await input.fill('Test input');
        }

        await page.waitForTimeout(500);
      }

      // Fill textareas
      const textareas = await form.locator('textarea').all();
      for (const textarea of textareas) {
        await textarea.fill('This is a test message from load testing.');
        await page.waitForTimeout(500);
      }
    }
  }

  async executeContactActions(page) {
    // Look for contact-specific elements
    const contactElements = [
      'a[href*="contact"]',
      'button[name*="contact"]',
      'a[href^="tel:"]',
      'a[href^="mailto:"]',
      '.contact-button',
      '#contact-form'
    ];

    for (const selector of contactElements) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          await element.click();
          await page.waitForTimeout(1000);
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }
  }

  async executeRandomLinkClick(page) {
    const links = await page.locator('a:not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"])').all();

    if (links.length > 0) {
      const randomLink = links[Math.floor(Math.random() * links.length)];
      try {
        await randomLink.click();
        await page.waitForTimeout(1000);
      } catch (error) {
        // Link might not be clickable, continue
      }
    }
  }

  async executeMobileGestures(page) {
    // Simulate mobile-like interactions
    await page.touchscreen.tap(200, 200);
    await page.waitForTimeout(500);

    // Simulate swipe
    await page.mouse.move(200, 300);
    await page.mouse.down();
    await page.mouse.move(200, 100);
    await page.mouse.up();
    await page.waitForTimeout(500);
  }

  calculateThinkTime(profile) {
    const baseThinkTime = 2000; // 2 seconds base
    const profileMultiplier = {
      'Speed Scanner': 0.3,
      'Research Explorer': 1.5,
      'Goal Oriented': 0.8,
      'Mobile Casual': 0.5
    };

    const multiplier = profileMultiplier[profile.name] || 1;
    return Math.floor(baseThinkTime * multiplier * (0.5 + Math.random()));
  }

  selectWeightedAction(actions) {
    return actions[Math.floor(Math.random() * actions.length)];
  }

  randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async collectPageMetrics(page) {
    return await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];

      return {
        loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
        domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        resourceCount: performance.getEntriesByType('resource').length,
        memoryUsage: performance.memory ? {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize
        } : null
      };
    });
  }

  async executeLoadScenario(context, scenario, scenarioName) {
    console.log(`🚀 Executing load scenario: ${scenarioName}`);

    const scenarioStart = performance.now();
    const sessionPromises = [];
    const scenarioMetrics = {
      name: scenarioName,
      startTime: scenarioStart,
      sessions: [],
      errors: [],
      performanceMetrics: {
        totalRequests: 0,
        successfulRequests: 0,
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: Infinity
      }
    };

    // Generate users based on scenario mix
    const totalUsers = scenario.peakUsers;
    const userMix = scenario.userMix;

    let userCount = 0;
    for (const [profileName, percentage] of Object.entries(userMix)) {
      const usersForProfile = Math.floor(totalUsers * percentage);
      const profile = this.userBehaviorProfiles[profileName];

      for (let i = 0; i < usersForProfile; i++) {
        const sessionId = `${scenarioName}_${profileName}_${userCount++}`;

        const sessionPromise = this.createUserSession(context, profile, sessionId)
          .then(sessionMetrics => {
            scenarioMetrics.sessions.push(sessionMetrics);
            return sessionMetrics;
          })
          .catch(error => {
            scenarioMetrics.errors.push({
              sessionId,
              error: error.message,
              timestamp: performance.now()
            });
          });

        sessionPromises.push(sessionPromise);

        // Stagger user creation based on traffic pattern
        const delay = this.calculateUserSpawnDelay(scenario.trafficPattern, i, usersForProfile);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Wait for all sessions to complete
    const sessionResults = await Promise.allSettled(sessionPromises);

    // Calculate aggregate metrics
    const successfulSessions = sessionResults.filter(r => r.status === 'fulfilled').map(r => r.value);

    if (successfulSessions.length > 0) {
      const responseTimes = successfulSessions.map(s => s.totalDuration);

      scenarioMetrics.performanceMetrics = {
        totalRequests: successfulSessions.length,
        successfulRequests: successfulSessions.filter(s => s.errors.length === 0).length,
        avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
        maxResponseTime: Math.max(...responseTimes),
        minResponseTime: Math.min(...responseTimes),
        errorRate: (scenarioResults.length - successfulSessions.length) / scenarioResults.length,
        throughput: successfulSessions.length / ((performance.now() - scenarioStart) / 1000)
      };
    }

    scenarioMetrics.endTime = performance.now();
    scenarioMetrics.totalDuration = scenarioMetrics.endTime - scenarioMetrics.startTime;

    return scenarioMetrics;
  }

  async createUserSession(context, profile, sessionId) {
    const page = await context.newPage();

    try {
      return await this.simulateUserBehavior(page, profile, sessionId);
    } finally {
      await page.close();
    }
  }

  calculateUserSpawnDelay(trafficPattern, userIndex, totalUsers) {
    switch (trafficPattern) {
      case 'immediate_spike':
        return Math.random() * 100; // 0-100ms

      case 'gradual_increase':
        return (userIndex / totalUsers) * 10000; // Spread over 10 seconds

      case 'sustained_load':
        return Math.random() * 5000; // 0-5 seconds

      case 'steady_low':
        return userIndex * 2000; // Every 2 seconds

      default:
        return Math.random() * 1000;
    }
  }

  async generateLoadTestReport(scenarioResults) {
    const reportPath = `/home/abhi/projects/tpp/tests/load-test-report-${Date.now()}.json`;

    const aggregateMetrics = {
      totalScenarios: scenarioResults.length,
      totalSessions: scenarioResults.reduce((sum, s) => sum + s.sessions.length, 0),
      totalErrors: scenarioResults.reduce((sum, s) => sum + s.errors.length, 0),
      avgThroughput: scenarioResults.reduce((sum, s) => sum + (s.performanceMetrics.throughput || 0), 0) / scenarioResults.length,
      avgErrorRate: scenarioResults.reduce((sum, s) => sum + (s.performanceMetrics.errorRate || 0), 0) / scenarioResults.length
    };

    const report = {
      timestamp: new Date().toISOString(),
      summary: aggregateMetrics,
      performanceThresholds: this.performanceThresholds,
      scenarios: scenarioResults,
      recommendations: this.generateLoadTestRecommendations(aggregateMetrics, scenarioResults)
    };

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Load test report saved: ${reportPath}`);

    return report;
  }

  generateLoadTestRecommendations(aggregateMetrics, scenarioResults) {
    const recommendations = [];

    if (aggregateMetrics.avgErrorRate > this.performanceThresholds.errorRate) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        description: `Error rate (${(aggregateMetrics.avgErrorRate * 100).toFixed(1)}%) exceeds threshold (${(this.performanceThresholds.errorRate * 100).toFixed(1)}%)`,
        actions: [
          'Implement proper error handling for all user interactions',
          'Add retry mechanisms for failed requests',
          'Investigate and fix root causes of errors',
          'Add comprehensive error logging and monitoring'
        ]
      });
    }

    if (aggregateMetrics.avgThroughput < this.performanceThresholds.throughput) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        description: `Throughput (${aggregateMetrics.avgThroughput.toFixed(1)} req/s) below target (${this.performanceThresholds.throughput} req/s)`,
        actions: [
          'Optimize server response times',
          'Implement CDN for static assets',
          'Add resource caching strategies',
          'Consider load balancing for high traffic'
        ]
      });
    }

    return recommendations;
  }
}

// Test Suite Implementation
test.describe('Advanced Load Testing Suite', () => {
  let loadTester;

  test.beforeAll(async () => {
    loadTester = new AdvancedLoadTester();
  });

  test('Business Hours Peak Load Simulation', async ({ browser }) => {
    const context = await browser.newContext();
    const scenario = loadTester.realWorldScenarios['business_hours_peak'];

    const results = await loadTester.executeLoadScenario(context, scenario, 'business_hours_peak');

    expect(results.performanceMetrics.errorRate).toBeLessThan(loadTester.performanceThresholds.errorRate);
    expect(results.performanceMetrics.avgResponseTime).toBeLessThan(loadTester.performanceThresholds.responseTime);

    await context.close();
  });

  test('Viral Traffic Spike Stress Test', async ({ browser }) => {
    const context = await browser.newContext();
    const scenario = loadTester.realWorldScenarios['viral_traffic_spike'];

    const results = await loadTester.executeLoadScenario(context, scenario, 'viral_traffic_spike');

    // Higher tolerance for viral spikes
    expect(results.performanceMetrics.errorRate).toBeLessThan(0.15); // 15% for extreme load
    expect(results.performanceMetrics.avgResponseTime).toBeLessThan(8000); // 8 seconds for spike

    await context.close();
  });

  test('Marketing Campaign Sustained Load', async ({ browser }) => {
    const context = await browser.newContext();
    const scenario = loadTester.realWorldScenarios['marketing_campaign'];

    const results = await loadTester.executeLoadScenario(context, scenario, 'marketing_campaign');

    expect(results.performanceMetrics.errorRate).toBeLessThan(loadTester.performanceThresholds.errorRate);
    expect(results.performanceMetrics.avgResponseTime).toBeLessThan(loadTester.performanceThresholds.responseTime);

    await context.close();
  });

  test('Off Hours Baseline Performance', async ({ browser }) => {
    const context = await browser.newContext();
    const scenario = loadTester.realWorldScenarios['off_hours_baseline'];

    const results = await loadTester.executeLoadScenario(context, scenario, 'off_hours_baseline');

    // Stricter thresholds for low load
    expect(results.performanceMetrics.errorRate).toBeLessThan(0.01); // 1% for low load
    expect(results.performanceMetrics.avgResponseTime).toBeLessThan(2000); // 2 seconds for low load

    await context.close();
  });

  test.afterAll(async ({ browser }) => {
    // Collect all test results
    const allResults = loadTester.testMetrics;

    if (allResults.length > 0) {
      const report = await loadTester.generateLoadTestReport(allResults);
      console.log('🏁 Advanced Load Testing Complete');
      console.log(`📈 Average Throughput: ${report.summary.avgThroughput.toFixed(1)} req/s`);
      console.log(`❌ Error Rate: ${(report.summary.avgErrorRate * 100).toFixed(2)}%`);
      console.log(`📊 Total Sessions: ${report.summary.totalSessions}`);
    }
  });
});