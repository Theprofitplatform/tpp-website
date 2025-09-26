#!/usr/bin/env node

/**
 * COMPREHENSIVE PERFORMANCE TEST SUITE
 * Advanced performance testing with load testing, stress testing, and benchmark analysis
 * Designed for hive mind collective intelligence system optimization validation
 */

import puppeteer from 'puppeteer';
import { performance } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

class PerformanceTestSuite {
    constructor(options = {}) {
        this.options = {
            baseUrl: options.baseUrl || 'http://localhost:4321/website/',
            testPages: options.testPages || [
                'index.html',
                'about.html',
                'contact.html',
                'pricing.html',
                'portfolio.html',
                'web-design.html',
                'seo.html'
            ],
            concurrentUsers: options.concurrentUsers || [1, 5, 10, 20, 50],
            testDuration: options.testDuration || 60, // seconds
            warmupRequests: options.warmupRequests || 10,
            iterations: options.iterations || 3,
            ...options
        };

        this.testResults = {
            timestamp: new Date().toISOString(),
            baseline: {},
            loadTests: {},
            stressTests: {},
            regressionTests: {},
            optimizationValidation: {},
            benchmarks: {},
            errors: []
        };

        this.metrics = {
            coreWebVitals: ['fcp', 'lcp', 'cls', 'fid', 'ttfb'],
            performanceMetrics: ['domContentLoaded', 'loadComplete', 'firstByte', 'totalRequestTime'],
            resourceMetrics: ['totalRequests', 'totalSize', 'slowestResource', 'failedRequests'],
            optimizationMetrics: ['cacheHitRate', 'compressionRatio', 'cdnUsage', 'lazyLoadEfficiency']
        };

        this.thresholds = {
            fcp: { good: 1800, poor: 3000 },
            lcp: { good: 2500, poor: 4000 },
            cls: { good: 0.1, poor: 0.25 },
            fid: { good: 100, poor: 300 },
            ttfb: { good: 600, poor: 1500 },
            domContentLoaded: { good: 2000, poor: 4000 },
            loadComplete: { good: 3000, poor: 6000 },
            totalSize: { good: 500000, poor: 2000000 }, // bytes
            errorRate: { good: 0.01, poor: 0.05 }
        };
    }

    async runAllTests() {
        console.log('🚀 COMPREHENSIVE PERFORMANCE TEST SUITE STARTING\n');
        console.log('═══════════════════════════════════════════════════════════\n');

        try {
            // Validate test environment
            await this.validateTestEnvironment();

            // Run baseline performance tests
            await this.runBaselineTests();

            // Run load tests with increasing concurrent users
            await this.runLoadTests();

            // Run stress tests to find breaking points
            await this.runStressTests();

            // Run regression tests against previous results
            await this.runRegressionTests();

            // Validate optimization implementations
            await this.validateOptimizations();

            // Run comparative benchmarks
            await this.runBenchmarkComparisons();

            // Generate comprehensive report
            await this.generateComprehensiveReport();

            console.log('\n✅ ALL PERFORMANCE TESTS COMPLETED SUCCESSFULLY');
            return this.testResults;

        } catch (error) {
            this.testResults.errors.push({
                type: 'test_suite_error',
                message: error.message,
                timestamp: Date.now()
            });
            console.error('\n❌ Test suite failed:', error.message);
            throw error;
        }
    }

    async validateTestEnvironment() {
        console.log('🔍 Validating test environment...\n');

        // Check if local server is running
        try {
            const response = await fetch(this.options.baseUrl);
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            console.log('✅ Local server is responsive');
        } catch (error) {
            throw new Error(`Test server not available at ${this.options.baseUrl}: ${error.message}`);
        }

        // Check test pages availability
        for (const page of this.options.testPages) {
            try {
                const response = await fetch(`${this.options.baseUrl}${page}`);
                if (!response.ok) {
                    console.log(`⚠️  Warning: ${page} returned ${response.status}`);
                }
            } catch (error) {
                console.log(`⚠️  Warning: ${page} is not accessible`);
            }
        }

        // Check system resources
        const systemInfo = await this.getSystemInfo();
        console.log(`🖥️  System: ${systemInfo.platform}, Memory: ${systemInfo.memory}MB`);
        console.log(`📊 Test Configuration: ${this.options.concurrentUsers.length} load levels, ${this.options.iterations} iterations\n`);
    }

    async runBaselineTests() {
        console.log('📊 Running baseline performance tests...\n');

        this.testResults.baseline = {};

        for (const page of this.options.testPages) {
            console.log(`Testing baseline for ${page}...`);

            const pageResults = [];

            for (let i = 0; i < this.options.iterations; i++) {
                const result = await this.measurePagePerformance(page);
                pageResults.push(result);
            }

            // Calculate statistics
            const stats = this.calculateStatistics(pageResults);
            this.testResults.baseline[page] = stats;

            console.log(`  FCP: ${stats.fcp.avg.toFixed(0)}ms (±${stats.fcp.stdDev.toFixed(0)})`);
            console.log(`  LCP: ${stats.lcp.avg.toFixed(0)}ms (±${stats.lcp.stdDev.toFixed(0)})`);
            console.log(`  Load: ${stats.loadComplete.avg.toFixed(0)}ms`);
            console.log(`  Size: ${(stats.totalSize.avg / 1024).toFixed(1)}KB`);
        }

        console.log('\n✅ Baseline tests completed\n');
    }

    async runLoadTests() {
        console.log('⚡ Running load tests with concurrent users...\n');

        this.testResults.loadTests = {};

        for (const userCount of this.options.concurrentUsers) {
            console.log(`Testing with ${userCount} concurrent users...`);

            const loadTestResult = await this.runLoadTest(userCount);
            this.testResults.loadTests[`${userCount}_users`] = loadTestResult;

            console.log(`  Avg Response Time: ${loadTestResult.avgResponseTime.toFixed(0)}ms`);
            console.log(`  Success Rate: ${(loadTestResult.successRate * 100).toFixed(1)}%`);
            console.log(`  Throughput: ${loadTestResult.requestsPerSecond.toFixed(1)} req/s`);
            console.log(`  95th Percentile: ${loadTestResult.p95ResponseTime.toFixed(0)}ms`);

            // Brief cooldown between tests
            await this.sleep(2000);
        }

        console.log('\n✅ Load tests completed\n');
    }

    async runLoadTest(userCount) {
        const testDuration = this.options.testDuration * 1000; // Convert to milliseconds
        const startTime = performance.now();
        const results = [];
        const promises = [];

        // Spawn concurrent users
        for (let i = 0; i < userCount; i++) {
            const userPromise = this.simulateUser(startTime, testDuration, i);
            promises.push(userPromise);
        }

        // Wait for all users to complete
        const userResults = await Promise.allSettled(promises);

        // Flatten results
        userResults.forEach(result => {
            if (result.status === 'fulfilled') {
                results.push(...result.value);
            }
        });

        // Calculate metrics
        const successfulRequests = results.filter(r => r.success);
        const totalRequests = results.length;
        const actualDuration = (performance.now() - startTime) / 1000; // Convert to seconds

        const responseTimes = successfulRequests.map(r => r.responseTime);
        responseTimes.sort((a, b) => a - b);

        return {
            userCount,
            totalRequests,
            successfulRequests: successfulRequests.length,
            successRate: successfulRequests.length / totalRequests,
            avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0,
            minResponseTime: Math.min(...responseTimes) || 0,
            maxResponseTime: Math.max(...responseTimes) || 0,
            p50ResponseTime: this.percentile(responseTimes, 0.5) || 0,
            p95ResponseTime: this.percentile(responseTimes, 0.95) || 0,
            p99ResponseTime: this.percentile(responseTimes, 0.99) || 0,
            requestsPerSecond: successfulRequests.length / actualDuration,
            duration: actualDuration,
            errors: results.filter(r => !r.success).map(r => r.error)
        };
    }

    async simulateUser(startTime, testDuration, userId) {
        const results = [];
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();

            while (performance.now() - startTime < testDuration) {
                // Randomly select a page to test
                const randomPage = this.options.testPages[
                    Math.floor(Math.random() * this.options.testPages.length)
                ];

                const requestStart = performance.now();

                try {
                    const response = await page.goto(
                        `${this.options.baseUrl}${randomPage}`,
                        {
                            waitUntil: 'networkidle2',
                            timeout: 10000
                        }
                    );

                    const responseTime = performance.now() - requestStart;

                    results.push({
                        userId,
                        page: randomPage,
                        responseTime,
                        success: response.ok(),
                        statusCode: response.status(),
                        timestamp: Date.now()
                    });

                    // Random think time between requests (1-5 seconds)
                    await this.sleep(1000 + Math.random() * 4000);

                } catch (error) {
                    results.push({
                        userId,
                        page: randomPage,
                        responseTime: performance.now() - requestStart,
                        success: false,
                        error: error.message,
                        timestamp: Date.now()
                    });
                }
            }
        } finally {
            await browser.close();
        }

        return results;
    }

    async runStressTests() {
        console.log('💪 Running stress tests to find breaking points...\n');

        this.testResults.stressTests = {};

        // Gradually increase load until we find breaking point
        const stressLevels = [50, 100, 200, 500, 1000];
        let breakingPoint = null;

        for (const userCount of stressLevels) {
            console.log(`Stress testing with ${userCount} concurrent users...`);

            const stressResult = await this.runStressTest(userCount);
            this.testResults.stressTests[`${userCount}_users`] = stressResult;

            console.log(`  Success Rate: ${(stressResult.successRate * 100).toFixed(1)}%`);
            console.log(`  Avg Response: ${stressResult.avgResponseTime.toFixed(0)}ms`);
            console.log(`  Error Rate: ${(stressResult.errorRate * 100).toFixed(1)}%`);

            // Check if this is the breaking point
            if (stressResult.successRate < 0.95 || stressResult.avgResponseTime > 10000) {
                breakingPoint = userCount;
                console.log(`🚨 Breaking point detected at ${userCount} concurrent users`);
                break;
            }

            // Cooldown between stress tests
            await this.sleep(5000);
        }

        this.testResults.stressTests.breakingPoint = breakingPoint;
        console.log('\n✅ Stress tests completed\n');
    }

    async runStressTest(userCount) {
        // Shorter duration for stress tests
        const stressDuration = 30; // seconds
        return this.runLoadTest(userCount, stressDuration);
    }

    async runRegressionTests() {
        console.log('🔄 Running regression tests against previous results...\n');

        this.testResults.regressionTests = {};

        try {
            // Try to load previous test results
            const previousResults = await this.loadPreviousResults();

            if (previousResults) {
                console.log('📊 Comparing against previous baseline...');

                for (const page of this.options.testPages) {
                    if (previousResults.baseline[page] && this.testResults.baseline[page]) {
                        const current = this.testResults.baseline[page];
                        const previous = previousResults.baseline[page];

                        const regression = this.calculateRegression(current, previous);
                        this.testResults.regressionTests[page] = regression;

                        console.log(`  ${page}:`);
                        console.log(`    FCP: ${this.formatChange(regression.fcp)}%`);
                        console.log(`    LCP: ${this.formatChange(regression.lcp)}%`);
                        console.log(`    Load Time: ${this.formatChange(regression.loadComplete)}%`);
                    }
                }
            } else {
                console.log('📝 No previous results found - establishing new baseline');
            }
        } catch (error) {
            console.log('⚠️  Could not load previous results:', error.message);
        }

        console.log('\n✅ Regression tests completed\n');
    }

    async validateOptimizations() {
        console.log('✨ Validating optimization implementations...\n');

        this.testResults.optimizationValidation = {};

        for (const page of this.options.testPages) {
            console.log(`Validating optimizations for ${page}...`);

            const validationResult = await this.validatePageOptimizations(page);
            this.testResults.optimizationValidation[page] = validationResult;

            console.log(`  CSS Consolidation: ${validationResult.cssConsolidation ? '✅' : '❌'}`);
            console.log(`  JS Bundling: ${validationResult.jsBundling ? '✅' : '❌'}`);
            console.log(`  Image Lazy Loading: ${validationResult.lazyLoading ? '✅' : '❌'}`);
            console.log(`  Resource Hints: ${validationResult.resourceHints ? '✅' : '❌'}`);
            console.log(`  Compression: ${validationResult.compression ? '✅' : '❌'}`);
        }

        console.log('\n✅ Optimization validation completed\n');
    }

    async validatePageOptimizations(page) {
        const browser = await puppeteer.launch({ headless: true });
        const browserPage = await browser.newPage();

        try {
            // Enable network monitoring
            await browserPage.setRequestInterception(true);
            const requests = [];

            browserPage.on('request', request => {
                requests.push(request);
                request.continue();
            });

            await browserPage.goto(`${this.options.baseUrl}${page}`, {
                waitUntil: 'networkidle2'
            });

            // Wait for page to fully load
            await this.sleep(3000);

            // Check optimizations
            const validationResult = await browserPage.evaluate(() => {
                return {
                    // CSS optimization checks
                    cssFiles: document.querySelectorAll('link[rel="stylesheet"]').length,
                    cssConsolidation: document.querySelectorAll('link[rel="stylesheet"]').length <= 2,

                    // JavaScript optimization checks
                    jsFiles: document.querySelectorAll('script[src]').length,
                    jsBundling: document.querySelectorAll('script[src]').length <= 3,
                    asyncScripts: document.querySelectorAll('script[async], script[defer]').length,

                    // Image optimization checks
                    totalImages: document.querySelectorAll('img').length,
                    lazyLoadedImages: document.querySelectorAll('img[loading="lazy"]').length,
                    lazyLoading: document.querySelectorAll('img[loading="lazy"]').length > 0,
                    webpImages: document.querySelectorAll('img[src*=".webp"]').length,

                    // Resource hints
                    preconnects: document.querySelectorAll('link[rel="preconnect"]').length,
                    dnsPrefetch: document.querySelectorAll('link[rel="dns-prefetch"]').length,
                    resourceHints: document.querySelectorAll('link[rel="preconnect"], link[rel="dns-prefetch"]').length > 0,

                    // Performance API availability
                    performanceAPI: 'performance' in window,
                    observerAPI: 'PerformanceObserver' in window,
                    intersectionObserver: 'IntersectionObserver' in window
                };
            });

            // Check compression headers
            const compressionCheck = await this.checkCompressionHeaders(requests);
            validationResult.compression = compressionCheck.hasCompression;
            validationResult.compressionRatio = compressionCheck.ratio;

            return validationResult;

        } finally {
            await browser.close();
        }
    }

    async checkCompressionHeaders(requests) {
        const compressedRequests = requests.filter(req => {
            const response = req.response();
            if (!response) return false;

            const contentEncoding = response.headers()['content-encoding'];
            return contentEncoding && (
                contentEncoding.includes('gzip') ||
                contentEncoding.includes('br') ||
                contentEncoding.includes('deflate')
            );
        });

        return {
            hasCompression: compressedRequests.length > 0,
            ratio: requests.length > 0 ? compressedRequests.length / requests.length : 0
        };
    }

    async runBenchmarkComparisons() {
        console.log('🏁 Running benchmark comparisons...\n');

        this.testResults.benchmarks = {};

        // Compare against common performance benchmarks
        const benchmarks = {
            'Fast 3G': { latency: 150, downloadSpeed: 1.5 * 1024 * 1024 / 8 }, // 1.5 Mbps
            'Slow 3G': { latency: 300, downloadSpeed: 0.4 * 1024 * 1024 / 8 }   // 0.4 Mbps
        };

        for (const [networkName, networkConditions] of Object.entries(benchmarks)) {
            console.log(`Testing under ${networkName} conditions...`);

            const benchmarkResult = await this.runNetworkBenchmark(networkConditions);
            this.testResults.benchmarks[networkName] = benchmarkResult;

            console.log(`  Avg Load Time: ${benchmarkResult.avgLoadTime.toFixed(0)}ms`);
            console.log(`  FCP: ${benchmarkResult.avgFCP.toFixed(0)}ms`);
            console.log(`  LCP: ${benchmarkResult.avgLCP.toFixed(0)}ms`);
        }

        console.log('\n✅ Benchmark comparisons completed\n');
    }

    async runNetworkBenchmark(networkConditions) {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        try {
            // Apply network throttling
            const client = await page.target().createCDPSession();
            await client.send('Network.emulateNetworkConditions', {
                offline: false,
                latency: networkConditions.latency,
                downloadThroughput: networkConditions.downloadSpeed,
                uploadThroughput: networkConditions.downloadSpeed * 0.1
            });

            const results = [];

            for (const testPage of this.options.testPages.slice(0, 3)) { // Test first 3 pages
                const pageResult = await this.measurePagePerformance(testPage, page);
                results.push(pageResult);
            }

            return this.calculateStatistics(results);

        } finally {
            await browser.close();
        }
    }

    async measurePagePerformance(page, browserPage = null) {
        const shouldCloseBrowser = !browserPage;
        const browser = shouldCloseBrowser ? await puppeteer.launch({ headless: true }) : null;
        const testPage = browserPage || await browser.newPage();

        try {
            // Enable performance monitoring
            await testPage.evaluateOnNewDocument(() => {
                window.performanceData = {};

                // Core Web Vitals observer
                if ('PerformanceObserver' in window) {
                    const observer = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
                                window.performanceData.fcp = entry.startTime;
                            } else if (entry.entryType === 'largest-contentful-paint') {
                                window.performanceData.lcp = entry.startTime;
                            } else if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                                window.performanceData.cls = (window.performanceData.cls || 0) + entry.value;
                            } else if (entry.entryType === 'first-input') {
                                window.performanceData.fid = entry.processingStart - entry.startTime;
                            }
                        }
                    });

                    try {
                        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input'] });
                    } catch (e) {
                        // Some entry types might not be supported
                    }
                }
            });

            const startTime = performance.now();

            const response = await testPage.goto(`${this.options.baseUrl}${page}`, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            const loadTime = performance.now() - startTime;

            // Wait for performance metrics to be collected
            await this.sleep(2000);

            const metrics = await testPage.evaluate(() => {
                const timing = performance.timing;
                const navigation = performance.getEntriesByType('navigation')[0];
                const resources = performance.getEntriesByType('resource');

                return {
                    // Core Web Vitals
                    fcp: window.performanceData?.fcp || 0,
                    lcp: window.performanceData?.lcp || 0,
                    cls: window.performanceData?.cls || 0,
                    fid: window.performanceData?.fid || 0,

                    // Navigation timing
                    domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                    loadComplete: timing.loadEventEnd - timing.navigationStart,
                    firstByte: timing.responseStart - timing.navigationStart,
                    totalRequestTime: loadTime,

                    // Resource metrics
                    totalRequests: resources.length,
                    totalSize: resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0),
                    slowestResource: Math.max(...resources.map(r => r.duration)) || 0,
                    failedRequests: resources.filter(r => r.responseStatus >= 400).length,

                    // Page metrics
                    domElements: document.getElementsByTagName('*').length,

                    // Status
                    success: true,
                    statusCode: response?.status() || 0
                };
            });

            return metrics;

        } catch (error) {
            return {
                success: false,
                error: error.message,
                page: page
            };
        } finally {
            if (shouldCloseBrowser && browser) {
                await browser.close();
            }
        }
    }

    calculateStatistics(results) {
        const successfulResults = results.filter(r => r.success);

        if (successfulResults.length === 0) {
            return { error: 'No successful measurements' };
        }

        const stats = {};

        // Calculate stats for each metric
        for (const metric of [...this.metrics.coreWebVitals, ...this.metrics.performanceMetrics, ...this.metrics.resourceMetrics]) {
            const values = successfulResults.map(r => r[metric]).filter(v => v !== undefined && !isNaN(v));

            if (values.length > 0) {
                values.sort((a, b) => a - b);

                const sum = values.reduce((a, b) => a + b, 0);
                const mean = sum / values.length;
                const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;

                stats[metric] = {
                    min: Math.min(...values),
                    max: Math.max(...values),
                    avg: mean,
                    median: this.percentile(values, 0.5),
                    p95: this.percentile(values, 0.95),
                    p99: this.percentile(values, 0.99),
                    stdDev: Math.sqrt(variance),
                    count: values.length
                };
            }
        }

        return stats;
    }

    calculateRegression(current, previous) {
        const regression = {};

        for (const metric of [...this.metrics.coreWebVitals, ...this.metrics.performanceMetrics]) {
            if (current[metric]?.avg && previous[metric]?.avg) {
                const change = ((current[metric].avg - previous[metric].avg) / previous[metric].avg) * 100;
                regression[metric] = {
                    change: change,
                    current: current[metric].avg,
                    previous: previous[metric].avg,
                    improved: change < 0 // Negative change is improvement for performance metrics
                };
            }
        }

        return regression;
    }

    async generateComprehensiveReport() {
        console.log('📊 Generating comprehensive performance report...\n');

        const report = {
            summary: this.generateExecutiveSummary(),
            details: this.testResults,
            recommendations: this.generateRecommendations(),
            timestamp: new Date().toISOString()
        };

        // Save detailed results
        await fs.writeFile(
            path.join(process.cwd(), 'performance-test-results.json'),
            JSON.stringify(report, null, 2)
        );

        // Generate human-readable report
        const readableReport = this.generateReadableReport(report);
        await fs.writeFile(
            path.join(process.cwd(), 'PERFORMANCE_TEST_REPORT.md'),
            readableReport
        );

        console.log('✅ Reports generated:');
        console.log('  📄 performance-test-results.json (detailed data)');
        console.log('  📋 PERFORMANCE_TEST_REPORT.md (human-readable)');

        // Display summary
        console.log('\n' + '═'.repeat(60));
        console.log('🎯 PERFORMANCE TEST SUMMARY');
        console.log('═'.repeat(60));
        console.log(report.summary);
    }

    generateExecutiveSummary() {
        let summary = '';

        // Overall performance grade
        const overallGrade = this.calculateOverallGrade();
        summary += `Overall Performance Grade: ${overallGrade.grade} (${overallGrade.score}/100)\n\n`;

        // Key findings
        summary += 'Key Findings:\n';

        if (this.testResults.baseline) {
            const avgFCP = this.calculateAverageMetric('fcp');
            const avgLCP = this.calculateAverageMetric('lcp');

            summary += `• Average FCP: ${avgFCP.toFixed(0)}ms ${this.getGradeEmoji(avgFCP, 'fcp')}\n`;
            summary += `• Average LCP: ${avgLCP.toFixed(0)}ms ${this.getGradeEmoji(avgLCP, 'lcp')}\n`;
        }

        if (this.testResults.loadTests) {
            const maxConcurrent = Math.max(...Object.keys(this.testResults.loadTests)
                .filter(k => k !== 'breakingPoint')
                .map(k => parseInt(k.split('_')[0])));
            summary += `• Maximum concurrent users tested: ${maxConcurrent}\n`;
        }

        if (this.testResults.stressTests?.breakingPoint) {
            summary += `• Breaking point: ${this.testResults.stressTests.breakingPoint} concurrent users\n`;
        }

        return summary;
    }

    generateRecommendations() {
        const recommendations = [];

        // Performance recommendations
        if (this.testResults.baseline) {
            const avgFCP = this.calculateAverageMetric('fcp');
            const avgLCP = this.calculateAverageMetric('lcp');

            if (avgFCP > this.thresholds.fcp.poor) {
                recommendations.push({
                    priority: 'high',
                    category: 'performance',
                    issue: 'First Contentful Paint is too slow',
                    recommendation: 'Optimize critical rendering path, inline critical CSS, remove render-blocking resources'
                });
            }

            if (avgLCP > this.thresholds.lcp.poor) {
                recommendations.push({
                    priority: 'high',
                    category: 'performance',
                    issue: 'Largest Contentful Paint is too slow',
                    recommendation: 'Optimize images, implement proper lazy loading, improve server response time'
                });
            }
        }

        // Load testing recommendations
        if (this.testResults.stressTests?.breakingPoint && this.testResults.stressTests.breakingPoint < 100) {
            recommendations.push({
                priority: 'medium',
                category: 'scalability',
                issue: 'Low breaking point for concurrent users',
                recommendation: 'Implement caching, optimize database queries, consider CDN implementation'
            });
        }

        return recommendations;
    }

    generateReadableReport(report) {
        let markdown = `# Performance Test Report\n\n`;
        markdown += `**Generated:** ${report.timestamp}\n\n`;
        markdown += `## Executive Summary\n\n`;
        markdown += report.summary + '\n\n';

        // Baseline Performance
        if (this.testResults.baseline) {
            markdown += `## Baseline Performance\n\n`;
            markdown += `| Page | FCP (ms) | LCP (ms) | Load Time (ms) | Size (KB) |\n`;
            markdown += `|------|----------|----------|----------------|----------|\n`;

            for (const [page, stats] of Object.entries(this.testResults.baseline)) {
                const fcp = stats.fcp?.avg?.toFixed(0) || 'N/A';
                const lcp = stats.lcp?.avg?.toFixed(0) || 'N/A';
                const load = stats.loadComplete?.avg?.toFixed(0) || 'N/A';
                const size = stats.totalSize?.avg ? (stats.totalSize.avg / 1024).toFixed(1) : 'N/A';

                markdown += `| ${page} | ${fcp} | ${lcp} | ${load} | ${size} |\n`;
            }
            markdown += '\n';
        }

        // Load Test Results
        if (this.testResults.loadTests) {
            markdown += `## Load Test Results\n\n`;
            markdown += `| Concurrent Users | Success Rate | Avg Response (ms) | Throughput (req/s) |\n`;
            markdown += `|------------------|--------------|------------------|--------------------|\n`;

            for (const [key, result] of Object.entries(this.testResults.loadTests)) {
                if (key === 'breakingPoint') continue;

                const users = result.userCount;
                const successRate = (result.successRate * 100).toFixed(1);
                const avgResponse = result.avgResponseTime?.toFixed(0) || 'N/A';
                const throughput = result.requestsPerSecond?.toFixed(1) || 'N/A';

                markdown += `| ${users} | ${successRate}% | ${avgResponse} | ${throughput} |\n`;
            }
            markdown += '\n';
        }

        // Recommendations
        if (report.recommendations.length > 0) {
            markdown += `## Recommendations\n\n`;

            const priorities = ['high', 'medium', 'low'];
            for (const priority of priorities) {
                const recs = report.recommendations.filter(r => r.priority === priority);
                if (recs.length > 0) {
                    markdown += `### ${priority.toUpperCase()} Priority\n\n`;
                    for (const rec of recs) {
                        markdown += `- **${rec.issue}**: ${rec.recommendation}\n`;
                    }
                    markdown += '\n';
                }
            }
        }

        return markdown;
    }

    calculateOverallGrade() {
        let totalScore = 0;
        let scoreCount = 0;

        if (this.testResults.baseline) {
            const avgFCP = this.calculateAverageMetric('fcp');
            const avgLCP = this.calculateAverageMetric('lcp');

            totalScore += this.getMetricScore(avgFCP, 'fcp');
            totalScore += this.getMetricScore(avgLCP, 'lcp');
            scoreCount += 2;
        }

        const overallScore = scoreCount > 0 ? totalScore / scoreCount : 0;
        let grade = 'F';

        if (overallScore >= 90) grade = 'A';
        else if (overallScore >= 80) grade = 'B';
        else if (overallScore >= 70) grade = 'C';
        else if (overallScore >= 60) grade = 'D';

        return { score: Math.round(overallScore), grade };
    }

    calculateAverageMetric(metric) {
        if (!this.testResults.baseline) return 0;

        const values = Object.values(this.testResults.baseline)
            .map(stats => stats[metric]?.avg)
            .filter(v => v !== undefined && !isNaN(v));

        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    }

    getMetricScore(value, metric) {
        const thresholds = this.thresholds[metric];
        if (!thresholds) return 50;

        if (value <= thresholds.good) return 100;
        if (value <= thresholds.poor) {
            // Linear interpolation between good and poor
            const ratio = (value - thresholds.good) / (thresholds.poor - thresholds.good);
            return 100 - (ratio * 50);
        }
        return 25; // Below poor threshold
    }

    getGradeEmoji(value, metric) {
        const thresholds = this.thresholds[metric];
        if (!thresholds) return '';

        if (value <= thresholds.good) return '🟢';
        if (value <= thresholds.poor) return '🟡';
        return '🔴';
    }

    formatChange(change) {
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(1)}`;
    }

    async loadPreviousResults() {
        try {
            const data = await fs.readFile('performance-test-results.json', 'utf8');
            return JSON.parse(data).details;
        } catch (error) {
            return null;
        }
    }

    async getSystemInfo() {
        return {
            platform: process.platform,
            memory: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        };
    }

    percentile(arr, p) {
        if (arr.length === 0) return 0;
        const index = Math.ceil(arr.length * p) - 1;
        return arr[Math.max(0, Math.min(index, arr.length - 1))];
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Store results in hive mind collective memory
    async storeInCollectiveMemory() {
        const memoryData = {
            type: 'performance_test_results',
            timestamp: Date.now(),
            results: this.testResults,
            summary: this.generateExecutiveSummary(),
            metrics: {
                avgFCP: this.calculateAverageMetric('fcp'),
                avgLCP: this.calculateAverageMetric('lcp'),
                overallGrade: this.calculateOverallGrade()
            }
        };

        // Store in hive mind memory system
        try {
            await fs.writeFile(
                path.join(process.cwd(), 'memory/performance-test-results.json'),
                JSON.stringify(memoryData, null, 2)
            );
            console.log('📊 Results stored in collective memory');
        } catch (error) {
            console.log('⚠️  Could not store in collective memory:', error.message);
        }
    }
}

// Export for use in other modules
export default PerformanceTestSuite;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const suite = new PerformanceTestSuite();

    suite.runAllTests()
        .then(() => suite.storeInCollectiveMemory())
        .catch(console.error);
}