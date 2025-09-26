#!/usr/bin/env node

/**
 * HIVE MIND PERFORMANCE TESTING FRAMEWORK
 * Comprehensive performance testing with collective intelligence integration
 *
 * Features:
 * - Load testing and stress testing
 * - Before/after optimization comparisons
 * - Automated regression detection
 * - Real-time performance monitoring
 * - Collective memory integration
 * - Consensus-based test strategies
 */

import { performance } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import { Worker } from 'worker_threads';
import StressTestAnalyzer from '../stress-test-analyzer.js';

class HiveMindPerformanceTester {
    constructor(options = {}) {
        this.options = {
            baseUrl: options.baseUrl || 'http://localhost:4321/website/',
            testPages: options.testPages || ['index.html', 'about.html', 'contact.html', 'services.html', 'pricing.html'],
            concurrentUsers: options.concurrentUsers || [1, 5, 10, 25, 50, 100],
            testDuration: options.testDuration || 60, // seconds
            warmupRequests: options.warmupRequests || 5,
            iterations: options.iterations || 3,
            thresholds: {
                fcp: 800, // First Contentful Paint (ms)
                lcp: 1200, // Largest Contentful Paint (ms)
                cls: 0.1, // Cumulative Layout Shift
                fid: 50, // First Input Delay (ms)
                tti: 1500, // Time to Interactive (ms)
                si: 1000, // Speed Index (ms)
                tbt: 150, // Total Blocking Time (ms)
                responseTime: 2000, // Server response time (ms)
                throughput: 10, // Minimum req/s
                errorRate: 0.05, // Maximum 5% error rate
                memoryUsage: 256 * 1024 * 1024, // 256MB
                cpuUsage: 80, // 80%
                networkBytes: 2 * 1024 * 1024 // 2MB total page size
            },
            hiveMindConfig: {
                collectiveMemoryPath: './memory/performance-metrics.json',
                consensusThreshold: 0.8,
                coordinationHooks: true,
                resultSharing: true
            },
            ...options
        };

        this.testResults = {
            timestamp: new Date().toISOString(),
            baseline: null,
            current: null,
            comparison: null,
            regressions: [],
            improvements: [],
            recommendations: [],
            hiveMindData: {}
        };

        this.performanceBaseline = null;
        this.stressAnalyzer = new StressTestAnalyzer({
            baseUrl: this.options.baseUrl,
            testPages: this.options.testPages
        });
    }

    async runComprehensivePerformanceTests() {
        console.log('🧠 HIVE MIND PERFORMANCE TESTING FRAMEWORK');
        console.log('═══════════════════════════════════════════════════════════\n');

        try {
            // Initialize hive mind coordination
            await this.initializeHiveMindCoordination();

            // Load baseline metrics from collective memory
            await this.loadPerformanceBaseline();

            // Run comprehensive performance test suite
            const testSuite = await this.executePerformanceTestSuite();

            // Analyze performance regressions and improvements
            await this.analyzePerformanceChanges(testSuite);

            // Run stress testing for optimization validation
            await this.validateOptimizationsUnderStress();

            // Share results with collective intelligence
            await this.shareResultsWithHiveMind();

            // Generate comprehensive report
            await this.generatePerformanceReport();

            console.log('\n✅ COMPREHENSIVE PERFORMANCE TESTING COMPLETED');
            return this.testResults;

        } catch (error) {
            console.error('\n❌ Performance testing failed:', error.message);
            throw error;
        }
    }

    async initializeHiveMindCoordination() {
        console.log('🔗 Initializing hive mind coordination...\n');

        // Ensure collective memory directory exists
        const memoryDir = path.dirname(this.options.hiveMindConfig.collectiveMemoryPath);
        await fs.mkdir(memoryDir, { recursive: true });

        // Register with other hive agents
        this.testResults.hiveMindData = {
            agentType: 'performance-tester',
            coordination: {
                initialized: Date.now(),
                consensusEnabled: this.options.hiveMindConfig.consensusThreshold > 0,
                hooks: this.options.hiveMindConfig.coordinationHooks,
                sharing: this.options.hiveMindConfig.resultSharing
            }
        };

        console.log('✅ Hive mind coordination initialized');
        console.log(`   Consensus threshold: ${this.options.hiveMindConfig.consensusThreshold}`);
        console.log(`   Coordination hooks: ${this.options.hiveMindConfig.coordinationHooks}`);
        console.log(`   Result sharing: ${this.options.hiveMindConfig.resultSharing}\n`);
    }

    async loadPerformanceBaseline() {
        console.log('📊 Loading performance baseline from collective memory...\n');

        try {
            const baselineData = await fs.readFile(this.options.hiveMindConfig.collectiveMemoryPath, 'utf8');
            this.performanceBaseline = JSON.parse(baselineData);

            console.log('✅ Performance baseline loaded:');
            console.log(`   Baseline timestamp: ${this.performanceBaseline.timestamp}`);
            console.log(`   Pages tested: ${this.performanceBaseline.pages?.length || 0}`);
            console.log(`   Metrics available: ${Object.keys(this.performanceBaseline.metrics || {}).length}\n`);

            this.testResults.baseline = this.performanceBaseline;

        } catch (error) {
            console.log('⚠️  No performance baseline found, creating new baseline...\n');
            this.performanceBaseline = null;
        }
    }

    async executePerformanceTestSuite() {
        console.log('🚀 Executing comprehensive performance test suite...\n');

        const testSuite = {
            webVitals: {},
            loadTesting: {},
            stressTesting: {},
            resourceOptimization: {},
            networkAnalysis: {},
            renderingPerformance: {}
        };

        // 1. Web Core Vitals Testing
        console.log('📊 Testing Web Core Vitals...');
        testSuite.webVitals = await this.testWebCoreVitals();

        // 2. Load Testing
        console.log('🔄 Running load testing...');
        testSuite.loadTesting = await this.runLoadTesting();

        // 3. Resource Optimization Testing
        console.log('🎯 Testing resource optimization...');
        testSuite.resourceOptimization = await this.testResourceOptimization();

        // 4. Network Analysis
        console.log('🌐 Analyzing network performance...');
        testSuite.networkAnalysis = await this.analyzeNetworkPerformance();

        // 5. Rendering Performance
        console.log('🖥️  Testing rendering performance...');
        testSuite.renderingPerformance = await this.testRenderingPerformance();

        this.testResults.current = testSuite;
        return testSuite;
    }

    async testWebCoreVitals() {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const vitalsResults = {};

        try {
            for (const testPage of this.options.testPages) {
                console.log(`  Testing ${testPage}...`);

                const page = await browser.newPage();

                // Enable performance timeline
                await page.setCacheEnabled(false);

                const vitals = [];

                // Collect Web Vitals
                for (let i = 0; i < this.options.iterations; i++) {
                    const startTime = performance.now();

                    await page.goto(`${this.options.baseUrl}${testPage}`, {
                        waitUntil: 'networkidle2',
                        timeout: 30000
                    });

                    // Measure Core Web Vitals
                    const metrics = await page.evaluate(() => {
                        return new Promise((resolve) => {
                            // Web Vitals measurement
                            const vitals = {};

                            // First Contentful Paint
                            const fcpObserver = new PerformanceObserver((list) => {
                                const entries = list.getEntries();
                                vitals.fcp = entries[entries.length - 1].startTime;
                            });

                            try {
                                fcpObserver.observe({ type: 'paint', buffered: true });
                            } catch (e) {
                                vitals.fcp = 0;
                            }

                            // Largest Contentful Paint
                            const lcpObserver = new PerformanceObserver((list) => {
                                const entries = list.getEntries();
                                vitals.lcp = entries[entries.length - 1].startTime;
                            });

                            try {
                                lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
                            } catch (e) {
                                vitals.lcp = 0;
                            }

                            // Layout Shift
                            let clsScore = 0;
                            const clsObserver = new PerformanceObserver((list) => {
                                for (const entry of list.getEntries()) {
                                    if (!entry.hadRecentInput) {
                                        clsScore += entry.value;
                                    }
                                }
                                vitals.cls = clsScore;
                            });

                            try {
                                clsObserver.observe({ type: 'layout-shift', buffered: true });
                            } catch (e) {
                                vitals.cls = 0;
                            }

                            // First Input Delay (simulated)
                            vitals.fid = 0; // Will be simulated through interaction testing

                            // Time to Interactive (estimated)
                            const navigationTiming = performance.getEntriesByType('navigation')[0];
                            if (navigationTiming) {
                                vitals.tti = navigationTiming.loadEventEnd - navigationTiming.navigationStart;
                            }

                            setTimeout(() => resolve(vitals), 2000);
                        });
                    });

                    const loadTime = performance.now() - startTime;

                    vitals.push({
                        iteration: i + 1,
                        loadTime,
                        ...metrics
                    });

                    // Cool down between iterations
                    await this.sleep(1000);
                }

                vitalsResults[testPage] = {
                    iterations: vitals,
                    averages: this.calculateVitalsAverages(vitals),
                    violations: this.checkVitalsViolations(vitals)
                };

                await page.close();
            }

        } finally {
            await browser.close();
        }

        return vitalsResults;
    }

    calculateVitalsAverages(vitals) {
        const metrics = ['fcp', 'lcp', 'cls', 'fid', 'tti', 'loadTime'];
        const averages = {};

        metrics.forEach(metric => {
            const values = vitals.map(v => v[metric] || 0).filter(v => v > 0);
            if (values.length > 0) {
                averages[metric] = {
                    avg: values.reduce((a, b) => a + b, 0) / values.length,
                    min: Math.min(...values),
                    max: Math.max(...values),
                    p95: this.percentile(values.sort((a, b) => a - b), 0.95)
                };
            }
        });

        return averages;
    }

    checkVitalsViolations(vitals) {
        const violations = [];

        vitals.forEach((vital, index) => {
            if (vital.fcp > this.options.thresholds.fcp) {
                violations.push({
                    iteration: index + 1,
                    metric: 'FCP',
                    value: vital.fcp,
                    threshold: this.options.thresholds.fcp,
                    severity: 'high'
                });
            }

            if (vital.lcp > this.options.thresholds.lcp) {
                violations.push({
                    iteration: index + 1,
                    metric: 'LCP',
                    value: vital.lcp,
                    threshold: this.options.thresholds.lcp,
                    severity: 'high'
                });
            }

            if (vital.cls > this.options.thresholds.cls) {
                violations.push({
                    iteration: index + 1,
                    metric: 'CLS',
                    value: vital.cls,
                    threshold: this.options.thresholds.cls,
                    severity: 'medium'
                });
            }
        });

        return violations;
    }

    async runLoadTesting() {
        const loadResults = {};

        for (const userCount of this.options.concurrentUsers) {
            console.log(`  Testing with ${userCount} concurrent users...`);

            const startTime = performance.now();
            const workers = [];
            const results = [];

            // Spawn workers for concurrent load testing
            const workerPromises = Array.from({ length: userCount }, (_, i) => {
                return this.spawnLoadTestWorker(i, userCount);
            });

            try {
                const workerResults = await Promise.allSettled(workerPromises);

                workerResults.forEach(result => {
                    if (result.status === 'fulfilled') {
                        results.push(...result.value);
                    }
                });

                const duration = (performance.now() - startTime) / 1000;
                const successfulRequests = results.filter(r => r.success);
                const failedRequests = results.filter(r => !r.success);

                loadResults[userCount] = {
                    totalRequests: results.length,
                    successfulRequests: successfulRequests.length,
                    failedRequests: failedRequests.length,
                    successRate: successfulRequests.length / results.length,
                    avgResponseTime: this.calculateAverage(successfulRequests.map(r => r.responseTime)),
                    p95ResponseTime: this.percentile(successfulRequests.map(r => r.responseTime).sort((a, b) => a - b), 0.95),
                    throughput: successfulRequests.length / duration,
                    duration,
                    errors: failedRequests.map(r => r.error),
                    violations: this.checkLoadTestViolations(successfulRequests, failedRequests)
                };

                console.log(`    Success rate: ${(loadResults[userCount].successRate * 100).toFixed(1)}%`);
                console.log(`    Avg response: ${loadResults[userCount].avgResponseTime.toFixed(0)}ms`);
                console.log(`    Throughput: ${loadResults[userCount].throughput.toFixed(1)} req/s`);

            } catch (error) {
                console.error(`    ❌ Load test failed for ${userCount} users:`, error.message);
                loadResults[userCount] = { error: error.message };
            }

            // Cool down between load levels
            await this.sleep(2000);
        }

        return loadResults;
    }

    async spawnLoadTestWorker(workerId, userCount) {
        return new Promise((resolve, reject) => {
            const worker = new Worker(`
                const puppeteer = require('puppeteer');
                const { performance } = require('perf_hooks');
                const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

                async function runLoadTestRequests(workerId, baseUrl, testPages, duration) {
                    const results = [];
                    const endTime = Date.now() + (duration * 1000);

                    let browser;

                    try {
                        browser = await puppeteer.launch({
                            headless: true,
                            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
                        });

                        const page = await browser.newPage();

                        while (Date.now() < endTime) {
                            const randomPage = testPages[Math.floor(Math.random() * testPages.length)];
                            const requestStart = performance.now();

                            try {
                                const response = await page.goto(\`\${baseUrl}\${randomPage}\`, {
                                    timeout: 15000,
                                    waitUntil: 'networkidle0'
                                });

                                const responseTime = performance.now() - requestStart;

                                results.push({
                                    workerId,
                                    page: randomPage,
                                    responseTime,
                                    success: response.ok(),
                                    statusCode: response.status(),
                                    timestamp: Date.now()
                                });

                            } catch (error) {
                                const responseTime = performance.now() - requestStart;

                                results.push({
                                    workerId,
                                    page: randomPage,
                                    responseTime,
                                    success: false,
                                    error: error.message,
                                    timestamp: Date.now()
                                });
                            }

                            await new Promise(resolve => setTimeout(resolve, 100));
                        }

                    } finally {
                        if (browser) {
                            await browser.close();
                        }
                    }

                    return results;
                }

                if (!isMainThread) {
                    const { workerId, baseUrl, testPages, duration } = workerData;
                    runLoadTestRequests(workerId, baseUrl, testPages, duration)
                        .then(result => parentPort.postMessage(result))
                        .catch(error => parentPort.postMessage({ error: error.message }));
                }
            `, {
                eval: true,
                workerData: {
                    workerId,
                    baseUrl: this.options.baseUrl,
                    testPages: this.options.testPages,
                    duration: this.options.testDuration
                }
            });

            worker.on('message', (result) => {
                if (result.error) {
                    reject(new Error(result.error));
                } else {
                    resolve(result);
                }
            });

            worker.on('error', reject);
        });
    }

    checkLoadTestViolations(successfulRequests, failedRequests) {
        const violations = [];

        // Check response time violations
        const avgResponseTime = this.calculateAverage(successfulRequests.map(r => r.responseTime));
        if (avgResponseTime > this.options.thresholds.responseTime) {
            violations.push({
                metric: 'avgResponseTime',
                value: avgResponseTime,
                threshold: this.options.thresholds.responseTime,
                severity: 'high'
            });
        }

        // Check error rate violations
        const totalRequests = successfulRequests.length + failedRequests.length;
        const errorRate = failedRequests.length / totalRequests;
        if (errorRate > this.options.thresholds.errorRate) {
            violations.push({
                metric: 'errorRate',
                value: errorRate,
                threshold: this.options.thresholds.errorRate,
                severity: 'high'
            });
        }

        return violations;
    }

    async testResourceOptimization() {
        const browser = await puppeteer.launch({ headless: true });
        const optimizationResults = {};

        try {
            for (const testPage of this.options.testPages) {
                console.log(`  Analyzing resource optimization for ${testPage}...`);

                const page = await browser.newPage();

                // Enable request interception to analyze resources
                await page.setRequestInterception(true);

                const resources = {
                    requests: [],
                    totalSize: 0,
                    compressionRatio: 0,
                    cacheHits: 0,
                    criticalResources: [],
                    renderBlocking: []
                };

                page.on('request', (request) => {
                    const resourceType = request.resourceType();
                    const url = request.url();

                    resources.requests.push({
                        url,
                        type: resourceType,
                        method: request.method(),
                        timestamp: Date.now()
                    });

                    request.continue();
                });

                page.on('response', (response) => {
                    const url = response.url();
                    const headers = response.headers();
                    const status = response.status();

                    // Calculate resource size and compression
                    const contentLength = parseInt(headers['content-length'] || '0');
                    const contentEncoding = headers['content-encoding'];

                    resources.totalSize += contentLength;

                    if (contentEncoding) {
                        resources.compressionRatio += contentLength;
                    }

                    // Check cache efficiency
                    if (headers['cache-control'] || headers['expires']) {
                        resources.cacheHits++;
                    }

                    // Identify critical resources
                    if (url.includes('.css') || url.includes('.js')) {
                        if (!headers['async'] && !headers['defer']) {
                            resources.renderBlocking.push({
                                url,
                                type: response.request().resourceType(),
                                size: contentLength
                            });
                        }
                    }
                });

                await page.goto(`${this.options.baseUrl}${testPage}`, {
                    waitUntil: 'networkidle0',
                    timeout: 30000
                });

                // Calculate optimization metrics
                optimizationResults[testPage] = {
                    totalRequests: resources.requests.length,
                    totalSize: resources.totalSize,
                    avgResourceSize: resources.totalSize / resources.requests.length,
                    compressionEfficiency: resources.compressionRatio / resources.totalSize,
                    cacheEfficiency: resources.cacheHits / resources.requests.length,
                    renderBlockingResources: resources.renderBlocking.length,
                    violations: this.checkOptimizationViolations(resources),
                    recommendations: this.generateOptimizationRecommendations(resources)
                };

                await page.close();
            }

        } finally {
            await browser.close();
        }

        return optimizationResults;
    }

    checkOptimizationViolations(resources) {
        const violations = [];

        // Check total page size
        if (resources.totalSize > this.options.thresholds.networkBytes) {
            violations.push({
                metric: 'totalPageSize',
                value: resources.totalSize,
                threshold: this.options.thresholds.networkBytes,
                severity: 'medium'
            });
        }

        // Check render-blocking resources
        if (resources.renderBlocking.length > 3) {
            violations.push({
                metric: 'renderBlockingResources',
                value: resources.renderBlocking.length,
                threshold: 3,
                severity: 'high'
            });
        }

        return violations;
    }

    generateOptimizationRecommendations(resources) {
        const recommendations = [];

        if (resources.compressionRatio / resources.totalSize < 0.7) {
            recommendations.push({
                type: 'compression',
                priority: 'high',
                description: 'Enable or improve compression for static assets',
                impact: 'Reduce bandwidth usage by 30-70%'
            });
        }

        if (resources.cacheHits / resources.requests.length < 0.8) {
            recommendations.push({
                type: 'caching',
                priority: 'medium',
                description: 'Implement proper cache headers for static resources',
                impact: 'Improve repeat visit performance by 50-80%'
            });
        }

        if (resources.renderBlocking.length > 0) {
            recommendations.push({
                type: 'renderBlocking',
                priority: 'high',
                description: 'Implement critical CSS and defer non-critical JavaScript',
                impact: 'Improve First Contentful Paint by 200-500ms'
            });
        }

        return recommendations;
    }

    async analyzeNetworkPerformance() {
        console.log('    Analyzing network efficiency and resource loading...');

        const browser = await puppeteer.launch({ headless: true });
        const networkResults = {};

        try {
            for (const testPage of this.options.testPages) {
                const page = await browser.newPage();

                const networkMetrics = {
                    requests: [],
                    domains: new Set(),
                    protocols: {},
                    timing: {},
                    efficiency: {}
                };

                // Track network requests
                page.on('response', (response) => {
                    const request = response.request();
                    const url = new URL(response.url());

                    networkMetrics.requests.push({
                        url: response.url(),
                        domain: url.hostname,
                        protocol: url.protocol,
                        method: request.method(),
                        resourceType: request.resourceType(),
                        status: response.status(),
                        size: parseInt(response.headers()['content-length'] || '0'),
                        timing: response.timing()
                    });

                    networkMetrics.domains.add(url.hostname);

                    const protocol = url.protocol;
                    networkMetrics.protocols[protocol] = (networkMetrics.protocols[protocol] || 0) + 1;
                });

                await page.goto(`${this.options.baseUrl}${testPage}`, {
                    waitUntil: 'networkidle0',
                    timeout: 30000
                });

                // Analyze network efficiency
                const totalRequests = networkMetrics.requests.length;
                const uniqueDomains = networkMetrics.domains.size;
                const avgConnectionTime = this.calculateAverage(
                    networkMetrics.requests
                        .map(r => r.timing?.connectEnd - r.timing?.connectStart)
                        .filter(t => t > 0)
                );

                networkResults[testPage] = {
                    totalRequests,
                    uniqueDomains,
                    domainSharding: uniqueDomains > 6,
                    http2Usage: (networkMetrics.protocols['https:'] || 0) / totalRequests,
                    avgConnectionTime,
                    networkEfficiency: this.calculateNetworkEfficiency(networkMetrics),
                    violations: this.checkNetworkViolations(networkMetrics),
                    recommendations: this.generateNetworkRecommendations(networkMetrics)
                };

                await page.close();
            }

        } finally {
            await browser.close();
        }

        return networkResults;
    }

    calculateNetworkEfficiency(networkMetrics) {
        const totalRequests = networkMetrics.requests.length;
        const cachedRequests = networkMetrics.requests.filter(r => r.status === 304).length;
        const compressedRequests = networkMetrics.requests.filter(r =>
            r.size > 0 && r.size < 1000 // Heuristic for compressed content
        ).length;

        return {
            cacheHitRatio: cachedRequests / totalRequests,
            compressionRatio: compressedRequests / totalRequests,
            averageRequestSize: this.calculateAverage(networkMetrics.requests.map(r => r.size))
        };
    }

    checkNetworkViolations(networkMetrics) {
        const violations = [];
        const totalRequests = networkMetrics.requests.length;

        if (networkMetrics.domains.size > 6) {
            violations.push({
                metric: 'domainSharding',
                value: networkMetrics.domains.size,
                threshold: 6,
                severity: 'medium'
            });
        }

        if ((networkMetrics.protocols['https:'] || 0) / totalRequests < 0.9) {
            violations.push({
                metric: 'httpsUsage',
                value: (networkMetrics.protocols['https:'] || 0) / totalRequests,
                threshold: 0.9,
                severity: 'high'
            });
        }

        return violations;
    }

    generateNetworkRecommendations(networkMetrics) {
        const recommendations = [];

        if (networkMetrics.domains.size > 6) {
            recommendations.push({
                type: 'domainSharding',
                priority: 'medium',
                description: 'Reduce domain sharding to improve connection efficiency',
                impact: 'Reduce connection overhead and improve HTTP/2 multiplexing'
            });
        }

        const httpsRatio = (networkMetrics.protocols['https:'] || 0) / networkMetrics.requests.length;
        if (httpsRatio < 1.0) {
            recommendations.push({
                type: 'security',
                priority: 'high',
                description: 'Migrate all resources to HTTPS',
                impact: 'Improve security and enable HTTP/2 benefits'
            });
        }

        return recommendations;
    }

    async testRenderingPerformance() {
        console.log('    Testing rendering performance and paint metrics...');

        const browser = await puppeteer.launch({ headless: true });
        const renderingResults = {};

        try {
            for (const testPage of this.options.testPages) {
                const page = await browser.newPage();

                // Enable performance monitoring
                await page.setCacheEnabled(false);

                const renderingMetrics = await page.evaluate(() => {
                    return new Promise((resolve) => {
                        const metrics = {
                            paintTimings: {},
                            layoutMetrics: {},
                            scriptMetrics: {}
                        };

                        // Paint timings
                        const paintObserver = new PerformanceObserver((list) => {
                            for (const entry of list.getEntries()) {
                                metrics.paintTimings[entry.name] = entry.startTime;
                            }
                        });
                        paintObserver.observe({ type: 'paint', buffered: true });

                        // Layout shift tracking
                        let cumulativeLayoutShift = 0;
                        const layoutObserver = new PerformanceObserver((list) => {
                            for (const entry of list.getEntries()) {
                                if (!entry.hadRecentInput) {
                                    cumulativeLayoutShift += entry.value;
                                }
                            }
                            metrics.layoutMetrics.cls = cumulativeLayoutShift;
                        });
                        layoutObserver.observe({ type: 'layout-shift', buffered: true });

                        // Long task tracking
                        const longTaskObserver = new PerformanceObserver((list) => {
                            const longTasks = list.getEntries();
                            metrics.scriptMetrics.longTasks = longTasks.length;
                            metrics.scriptMetrics.totalBlockingTime = longTasks
                                .reduce((total, task) => total + Math.max(0, task.duration - 50), 0);
                        });
                        longTaskObserver.observe({ type: 'longtask', buffered: true });

                        setTimeout(() => resolve(metrics), 3000);
                    });
                });

                await page.goto(`${this.options.baseUrl}${testPage}`, {
                    waitUntil: 'networkidle0',
                    timeout: 30000
                });

                const metrics = await renderingMetrics;

                renderingResults[testPage] = {
                    firstPaint: metrics.paintTimings['first-paint'] || 0,
                    firstContentfulPaint: metrics.paintTimings['first-contentful-paint'] || 0,
                    cumulativeLayoutShift: metrics.layoutMetrics.cls || 0,
                    longTasks: metrics.scriptMetrics.longTasks || 0,
                    totalBlockingTime: metrics.scriptMetrics.totalBlockingTime || 0,
                    violations: this.checkRenderingViolations(metrics),
                    recommendations: this.generateRenderingRecommendations(metrics)
                };

                await page.close();
            }

        } finally {
            await browser.close();
        }

        return renderingResults;
    }

    checkRenderingViolations(metrics) {
        const violations = [];

        const fcp = metrics.paintTimings['first-contentful-paint'] || 0;
        if (fcp > this.options.thresholds.fcp) {
            violations.push({
                metric: 'firstContentfulPaint',
                value: fcp,
                threshold: this.options.thresholds.fcp,
                severity: 'high'
            });
        }

        const cls = metrics.layoutMetrics.cls || 0;
        if (cls > this.options.thresholds.cls) {
            violations.push({
                metric: 'cumulativeLayoutShift',
                value: cls,
                threshold: this.options.thresholds.cls,
                severity: 'medium'
            });
        }

        const tbt = metrics.scriptMetrics.totalBlockingTime || 0;
        if (tbt > this.options.thresholds.tbt) {
            violations.push({
                metric: 'totalBlockingTime',
                value: tbt,
                threshold: this.options.thresholds.tbt,
                severity: 'high'
            });
        }

        return violations;
    }

    generateRenderingRecommendations(metrics) {
        const recommendations = [];

        if (metrics.scriptMetrics.longTasks > 5) {
            recommendations.push({
                type: 'scriptOptimization',
                priority: 'high',
                description: 'Optimize long-running JavaScript tasks',
                impact: 'Improve main thread responsiveness and reduce blocking time'
            });
        }

        if (metrics.layoutMetrics.cls > 0.1) {
            recommendations.push({
                type: 'layoutStability',
                priority: 'medium',
                description: 'Implement size attributes for images and reserve space for dynamic content',
                impact: 'Reduce unexpected layout shifts and improve user experience'
            });
        }

        return recommendations;
    }

    async analyzePerformanceChanges(currentResults) {
        console.log('🔍 Analyzing performance changes against baseline...\n');

        if (!this.performanceBaseline) {
            console.log('⚠️  No baseline available, saving current results as baseline...\n');
            await this.savePerformanceBaseline(currentResults);
            return;
        }

        const comparison = {
            regressions: [],
            improvements: [],
            neutral: [],
            overallTrend: 'stable'
        };

        // Compare Web Vitals
        if (this.performanceBaseline.webVitals && currentResults.webVitals) {
            const vitalsComparison = this.compareWebVitals(
                this.performanceBaseline.webVitals,
                currentResults.webVitals
            );
            comparison.regressions.push(...vitalsComparison.regressions);
            comparison.improvements.push(...vitalsComparison.improvements);
        }

        // Compare Load Testing
        if (this.performanceBaseline.loadTesting && currentResults.loadTesting) {
            const loadComparison = this.compareLoadTesting(
                this.performanceBaseline.loadTesting,
                currentResults.loadTesting
            );
            comparison.regressions.push(...loadComparison.regressions);
            comparison.improvements.push(...loadComparison.improvements);
        }

        // Determine overall trend
        const totalChanges = comparison.regressions.length + comparison.improvements.length;
        if (totalChanges > 0) {
            const regressionWeight = comparison.regressions.reduce((sum, r) => sum + (r.severity === 'high' ? 3 : 1), 0);
            const improvementWeight = comparison.improvements.reduce((sum, i) => sum + (i.severity === 'high' ? 3 : 1), 0);

            if (regressionWeight > improvementWeight * 1.5) {
                comparison.overallTrend = 'regressed';
            } else if (improvementWeight > regressionWeight * 1.5) {
                comparison.overallTrend = 'improved';
            }
        }

        this.testResults.comparison = comparison;
        this.testResults.regressions = comparison.regressions;
        this.testResults.improvements = comparison.improvements;

        // Generate recommendations based on analysis
        this.testResults.recommendations = this.generatePerformanceRecommendations(comparison);

        console.log('📊 Performance Analysis Results:');
        console.log(`   Overall Trend: ${comparison.overallTrend.toUpperCase()}`);
        console.log(`   Regressions: ${comparison.regressions.length}`);
        console.log(`   Improvements: ${comparison.improvements.length}`);
        console.log(`   Neutral: ${comparison.neutral.length}\n`);
    }

    compareWebVitals(baseline, current) {
        const comparison = { regressions: [], improvements: [] };

        Object.keys(current).forEach(page => {
            if (!baseline[page]) return;

            const baselineVitals = baseline[page].averages;
            const currentVitals = current[page].averages;

            Object.keys(currentVitals).forEach(metric => {
                if (!baselineVitals[metric]) return;

                const baselineValue = baselineVitals[metric].avg;
                const currentValue = currentVitals[metric].avg;
                const change = ((currentValue - baselineValue) / baselineValue) * 100;

                if (Math.abs(change) > 5) { // 5% threshold
                    const changeData = {
                        page,
                        metric,
                        baseline: baselineValue,
                        current: currentValue,
                        change: change.toFixed(1),
                        severity: Math.abs(change) > 20 ? 'high' : 'medium'
                    };

                    if (change > 0 && ['fcp', 'lcp', 'tti', 'loadTime'].includes(metric)) {
                        comparison.regressions.push(changeData);
                    } else if (change < 0 && ['fcp', 'lcp', 'tti', 'loadTime'].includes(metric)) {
                        comparison.improvements.push(changeData);
                    } else if (change > 0 && metric === 'cls') {
                        comparison.regressions.push(changeData);
                    } else if (change < 0 && metric === 'cls') {
                        comparison.improvements.push(changeData);
                    }
                }
            });
        });

        return comparison;
    }

    compareLoadTesting(baseline, current) {
        const comparison = { regressions: [], improvements: [] };

        Object.keys(current).forEach(userLevel => {
            if (!baseline[userLevel] || baseline[userLevel].error || current[userLevel].error) return;

            const baselineMetrics = baseline[userLevel];
            const currentMetrics = current[userLevel];

            // Compare success rate
            const successRateChange = ((currentMetrics.successRate - baselineMetrics.successRate) / baselineMetrics.successRate) * 100;
            if (Math.abs(successRateChange) > 2) { // 2% threshold
                const changeData = {
                    userLevel,
                    metric: 'successRate',
                    baseline: baselineMetrics.successRate,
                    current: currentMetrics.successRate,
                    change: successRateChange.toFixed(1),
                    severity: Math.abs(successRateChange) > 10 ? 'high' : 'medium'
                };

                if (successRateChange < 0) {
                    comparison.regressions.push(changeData);
                } else {
                    comparison.improvements.push(changeData);
                }
            }

            // Compare response time
            const responseTimeChange = ((currentMetrics.avgResponseTime - baselineMetrics.avgResponseTime) / baselineMetrics.avgResponseTime) * 100;
            if (Math.abs(responseTimeChange) > 10) { // 10% threshold
                const changeData = {
                    userLevel,
                    metric: 'avgResponseTime',
                    baseline: baselineMetrics.avgResponseTime,
                    current: currentMetrics.avgResponseTime,
                    change: responseTimeChange.toFixed(1),
                    severity: Math.abs(responseTimeChange) > 25 ? 'high' : 'medium'
                };

                if (responseTimeChange > 0) {
                    comparison.regressions.push(changeData);
                } else {
                    comparison.improvements.push(changeData);
                }
            }

            // Compare throughput
            const throughputChange = ((currentMetrics.throughput - baselineMetrics.throughput) / baselineMetrics.throughput) * 100;
            if (Math.abs(throughputChange) > 10) { // 10% threshold
                const changeData = {
                    userLevel,
                    metric: 'throughput',
                    baseline: baselineMetrics.throughput,
                    current: currentMetrics.throughput,
                    change: throughputChange.toFixed(1),
                    severity: Math.abs(throughputChange) > 25 ? 'high' : 'medium'
                };

                if (throughputChange < 0) {
                    comparison.regressions.push(changeData);
                } else {
                    comparison.improvements.push(changeData);
                }
            }
        });

        return comparison;
    }

    generatePerformanceRecommendations(comparison) {
        const recommendations = [];

        // Recommendations based on regressions
        comparison.regressions.forEach(regression => {
            switch (regression.metric) {
                case 'fcp':
                case 'lcp':
                    recommendations.push({
                        type: 'paint_optimization',
                        priority: regression.severity,
                        description: `${regression.metric.toUpperCase()} regressed by ${Math.abs(regression.change)}% on ${regression.page}`,
                        actions: [
                            'Optimize critical rendering path',
                            'Implement resource hints (preload, prefetch)',
                            'Minimize render-blocking resources',
                            'Optimize server response time'
                        ]
                    });
                    break;

                case 'cls':
                    recommendations.push({
                        type: 'layout_stability',
                        priority: regression.severity,
                        description: `Layout stability regressed by ${Math.abs(regression.change)}% on ${regression.page}`,
                        actions: [
                            'Add size attributes to images',
                            'Reserve space for dynamic content',
                            'Use CSS containment',
                            'Avoid font swapping'
                        ]
                    });
                    break;

                case 'successRate':
                    recommendations.push({
                        type: 'reliability',
                        priority: 'high',
                        description: `Success rate dropped by ${Math.abs(regression.change)}% under ${regression.userLevel} users`,
                        actions: [
                            'Investigate server capacity',
                            'Implement circuit breakers',
                            'Add retry logic',
                            'Scale infrastructure'
                        ]
                    });
                    break;

                case 'avgResponseTime':
                    recommendations.push({
                        type: 'response_time',
                        priority: regression.severity,
                        description: `Response time increased by ${Math.abs(regression.change)}% under ${regression.userLevel} users`,
                        actions: [
                            'Optimize database queries',
                            'Implement caching layers',
                            'Use CDN for static assets',
                            'Scale server resources'
                        ]
                    });
                    break;
            }
        });

        // Add general recommendations
        if (comparison.regressions.length > comparison.improvements.length) {
            recommendations.push({
                type: 'general',
                priority: 'high',
                description: 'Performance has generally regressed across multiple metrics',
                actions: [
                    'Run comprehensive performance profiling',
                    'Review recent code changes',
                    'Check infrastructure changes',
                    'Implement performance monitoring'
                ]
            });
        }

        return recommendations;
    }

    async validateOptimizationsUnderStress() {
        console.log('💪 Validating optimizations under stress conditions...\n');

        try {
            const stressResults = await this.stressAnalyzer.runStressTestAnalysis();

            this.testResults.stressValidation = {
                breakingPoint: stressResults.breakingPoints,
                bottlenecks: stressResults.bottlenecks,
                memoryLeaks: stressResults.bottlenecks.filter(b => b.type.includes('memory')),
                scalabilityIssues: stressResults.bottlenecks.filter(b => b.type === 'scalability'),
                validated: true
            };

            console.log('✅ Stress validation completed');
            console.log(`   Bottlenecks found: ${stressResults.bottlenecks.length}`);
            console.log(`   Memory issues: ${this.testResults.stressValidation.memoryLeaks.length}`);
            console.log(`   Scalability issues: ${this.testResults.stressValidation.scalabilityIssues.length}\n`);

        } catch (error) {
            console.error('❌ Stress validation failed:', error.message);
            this.testResults.stressValidation = { error: error.message, validated: false };
        }
    }

    async shareResultsWithHiveMind() {
        console.log('🧠 Sharing results with hive mind collective...\n');

        try {
            // Prepare hive mind data
            const hiveMindData = {
                timestamp: this.testResults.timestamp,
                agentType: 'performance-tester',
                testResults: {
                    summary: this.generateTestSummary(),
                    metrics: this.extractKeyMetrics(),
                    violations: this.extractViolations(),
                    recommendations: this.testResults.recommendations
                },
                consensus: {
                    performanceTrend: this.testResults.comparison?.overallTrend || 'unknown',
                    criticalIssues: this.testResults.regressions.filter(r => r.severity === 'high').length,
                    confidence: this.calculateConfidence()
                }
            };

            // Save to collective memory
            await fs.writeFile(
                this.options.hiveMindConfig.collectiveMemoryPath,
                JSON.stringify(hiveMindData, null, 2)
            );

            // Update hive mind coordination data
            this.testResults.hiveMindData.shared = {
                timestamp: Date.now(),
                dataSize: JSON.stringify(hiveMindData).length,
                consensus: hiveMindData.consensus
            };

            console.log('✅ Results shared with hive mind');
            console.log(`   Data size: ${(this.testResults.hiveMindData.shared.dataSize / 1024).toFixed(1)} KB`);
            console.log(`   Confidence: ${hiveMindData.consensus.confidence.toFixed(1)}%`);
            console.log(`   Performance trend: ${hiveMindData.consensus.performanceTrend}\n`);

        } catch (error) {
            console.error('❌ Failed to share with hive mind:', error.message);
        }
    }

    generateTestSummary() {
        return {
            pagesTests: this.options.testPages.length,
            totalRegressions: this.testResults.regressions.length,
            totalImprovements: this.testResults.improvements.length,
            overallTrend: this.testResults.comparison?.overallTrend || 'unknown',
            criticalIssues: this.testResults.regressions.filter(r => r.severity === 'high').length
        };
    }

    extractKeyMetrics() {
        const metrics = {};

        if (this.testResults.current?.webVitals) {
            Object.keys(this.testResults.current.webVitals).forEach(page => {
                const vitals = this.testResults.current.webVitals[page].averages;
                metrics[page] = {
                    fcp: vitals.fcp?.avg || 0,
                    lcp: vitals.lcp?.avg || 0,
                    cls: vitals.cls?.avg || 0,
                    tti: vitals.tti?.avg || 0,
                    loadTime: vitals.loadTime?.avg || 0
                };
            });
        }

        return metrics;
    }

    extractViolations() {
        const violations = [];

        if (this.testResults.current?.webVitals) {
            Object.values(this.testResults.current.webVitals).forEach(pageData => {
                violations.push(...pageData.violations);
            });
        }

        if (this.testResults.current?.loadTesting) {
            Object.values(this.testResults.current.loadTesting).forEach(loadData => {
                if (loadData.violations) {
                    violations.push(...loadData.violations);
                }
            });
        }

        return violations;
    }

    calculateConfidence() {
        const totalTests = this.options.testPages.length * this.options.iterations;
        const successfulTests = totalTests; // Assume all tests ran successfully for now
        const baselineAvailable = this.performanceBaseline ? 1 : 0;

        return Math.min(100, (successfulTests / totalTests * 80) + (baselineAvailable * 20));
    }

    async savePerformanceBaseline(testResults) {
        const baseline = {
            timestamp: this.testResults.timestamp,
            pages: this.options.testPages,
            metrics: this.extractKeyMetrics(),
            webVitals: testResults.webVitals,
            loadTesting: testResults.loadTesting,
            version: '1.0'
        };

        await fs.writeFile(
            this.options.hiveMindConfig.collectiveMemoryPath,
            JSON.stringify(baseline, null, 2)
        );

        console.log('✅ Performance baseline saved to collective memory\n');
    }

    async generatePerformanceReport() {
        console.log('📊 Generating comprehensive performance report...\n');

        const report = {
            metadata: {
                timestamp: this.testResults.timestamp,
                testDuration: `${this.options.testDuration}s per test`,
                pagesTestedated: this.options.testPages,
                concurrentUserLevels: this.options.concurrentUsers,
                iterations: this.options.iterations
            },
            summary: this.generateTestSummary(),
            results: this.testResults.current,
            comparison: this.testResults.comparison,
            violations: this.extractViolations(),
            recommendations: this.testResults.recommendations,
            stressValidation: this.testResults.stressValidation,
            hiveMindData: this.testResults.hiveMindData
        };

        // Save detailed JSON report
        await fs.writeFile(
            path.join(process.cwd(), 'performance-test-results.json'),
            JSON.stringify(report, null, 2)
        );

        // Generate readable markdown report
        const markdownReport = this.generateMarkdownReport(report);
        await fs.writeFile(
            path.join(process.cwd(), 'PERFORMANCE_TEST_REPORT.md'),
            markdownReport
        );

        console.log('✅ Performance reports generated:');
        console.log('  📄 performance-test-results.json');
        console.log('  📋 PERFORMANCE_TEST_REPORT.md');

        // Display summary
        this.displayReportSummary(report);
    }

    generateMarkdownReport(report) {
        let markdown = `# Performance Test Report\n\n`;
        markdown += `**Generated:** ${report.metadata.timestamp}  \n`;
        markdown += `**Hive Mind Agent:** Performance Tester  \n`;
        markdown += `**Test Duration:** ${report.metadata.testDuration}  \n`;
        markdown += `**Pages Tested:** ${report.metadata.pagesTestedated.join(', ')}  \n\n`;

        // Executive Summary
        markdown += `## Executive Summary\n\n`;
        const summary = report.summary;
        markdown += `- **Overall Trend:** ${summary.overallTrend?.toUpperCase() || 'UNKNOWN'}\n`;
        markdown += `- **Regressions:** ${summary.totalRegressions}\n`;
        markdown += `- **Improvements:** ${summary.totalImprovements}\n`;
        markdown += `- **Critical Issues:** ${summary.criticalIssues}\n\n`;

        // Performance Violations
        if (report.violations.length > 0) {
            markdown += `## Performance Violations\n\n`;
            const violationsBySeverity = this.groupBy(report.violations, 'severity');

            ['high', 'medium', 'low'].forEach(severity => {
                const violations = violationsBySeverity[severity] || [];
                if (violations.length > 0) {
                    markdown += `### ${severity.toUpperCase()} Priority\n\n`;
                    violations.forEach(violation => {
                        markdown += `- **${violation.metric}**: ${violation.value} (threshold: ${violation.threshold})\n`;
                    });
                    markdown += '\n';
                }
            });
        }

        // Recommendations
        if (report.recommendations.length > 0) {
            markdown += `## Recommendations\n\n`;
            const recsBySeverity = this.groupBy(report.recommendations, 'priority');

            ['high', 'medium', 'low'].forEach(priority => {
                const recs = recsBySeverity[priority] || [];
                if (recs.length > 0) {
                    markdown += `### ${priority.toUpperCase()} Priority\n\n`;
                    recs.forEach(rec => {
                        markdown += `- **${rec.type}**: ${rec.description}\n`;
                        if (rec.actions) {
                            rec.actions.forEach(action => {
                                markdown += `  - ${action}\n`;
                            });
                        }
                        markdown += '\n';
                    });
                }
            });
        }

        // Stress Validation
        if (report.stressValidation && report.stressValidation.validated) {
            markdown += `## Stress Test Validation\n\n`;
            markdown += `- **Bottlenecks Found:** ${report.stressValidation.bottlenecks.length}\n`;
            markdown += `- **Memory Issues:** ${report.stressValidation.memoryLeaks.length}\n`;
            markdown += `- **Scalability Issues:** ${report.stressValidation.scalabilityIssues.length}\n\n`;
        }

        // Hive Mind Coordination
        markdown += `## Hive Mind Coordination\n\n`;
        markdown += `- **Agent Type:** ${report.hiveMindData.agentType}\n`;
        markdown += `- **Results Shared:** ${report.hiveMindData.shared ? 'Yes' : 'No'}\n`;
        if (report.hiveMindData.shared) {
            markdown += `- **Confidence Level:** ${report.hiveMindData.shared.consensus?.confidence || 'N/A'}%\n`;
        }
        markdown += '\n';

        return markdown;
    }

    displayReportSummary(report) {
        console.log('\n' + '═'.repeat(80));
        console.log('🧠 HIVE MIND PERFORMANCE TEST SUMMARY');
        console.log('═'.repeat(80));

        const summary = report.summary;
        console.log(`Overall Trend: ${summary.overallTrend?.toUpperCase() || 'UNKNOWN'}`);
        console.log(`Pages Tested: ${summary.pagesTests}`);
        console.log(`Regressions: ${summary.totalRegressions}`);
        console.log(`Improvements: ${summary.totalImprovements}`);
        console.log(`Critical Issues: ${summary.criticalIssues}`);

        if (report.violations.length > 0) {
            console.log(`\nViolations Found: ${report.violations.length}`);
            const severityCounts = this.countBySeverity(report.violations);
            Object.entries(severityCounts).forEach(([severity, count]) => {
                console.log(`  ${severity}: ${count}`);
            });
        }

        if (report.recommendations.length > 0) {
            console.log(`\nRecommendations: ${report.recommendations.length}`);
            const priorityCounts = this.countByPriority(report.recommendations);
            Object.entries(priorityCounts).forEach(([priority, count]) => {
                console.log(`  ${priority}: ${count}`);
            });
        }

        if (report.stressValidation && report.stressValidation.validated) {
            console.log(`\nStress Test Results:`);
            console.log(`  Bottlenecks: ${report.stressValidation.bottlenecks.length}`);
            console.log(`  Memory Issues: ${report.stressValidation.memoryLeaks.length}`);
            console.log(`  Scalability Issues: ${report.stressValidation.scalabilityIssues.length}`);
        }

        console.log('\n' + '═'.repeat(80));
    }

    // Utility Methods
    calculateAverage(numbers) {
        if (numbers.length === 0) return 0;
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
    }

    percentile(arr, p) {
        if (arr.length === 0) return 0;
        const index = Math.ceil(arr.length * p) - 1;
        return arr[Math.max(0, Math.min(index, arr.length - 1))];
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key] || 'unknown';
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(item);
            return groups;
        }, {});
    }

    countBySeverity(violations) {
        return violations.reduce((counts, violation) => {
            const severity = violation.severity || 'unknown';
            counts[severity] = (counts[severity] || 0) + 1;
            return counts;
        }, {});
    }

    countByPriority(recommendations) {
        return recommendations.reduce((counts, rec) => {
            const priority = rec.priority || 'unknown';
            counts[priority] = (counts[priority] || 0) + 1;
            return counts;
        }, {});
    }
}

export default HiveMindPerformanceTester;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new HiveMindPerformanceTester({
        baseUrl: process.env.BASE_URL || 'http://localhost:4321/website/',
        testPages: ['index.html', 'about.html', 'contact.html', 'services.html', 'pricing.html']
    });

    tester.runComprehensivePerformanceTests().catch(console.error);
}