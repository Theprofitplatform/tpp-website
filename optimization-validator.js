#!/usr/bin/env node

/**
 * OPTIMIZATION VALIDATOR
 * Validates performance optimizations implemented by the coder agent
 * Part of the hive mind collective intelligence system
 */

import puppeteer from 'puppeteer';
import { performance } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';

class OptimizationValidator {
    constructor(options = {}) {
        this.options = {
            baseUrl: options.baseUrl || 'http://localhost:4321/website/',
            testPages: options.testPages || [
                'index.html',
                'about.html',
                'contact.html',
                'pricing.html',
                'portfolio.html'
            ],
            iterations: options.iterations || 5,
            networkConditions: options.networkConditions || [
                { name: 'Fast 3G', latency: 75, downloadSpeed: 1.5 * 1024 * 1024 / 8 },
                { name: 'Slow 3G', latency: 300, downloadSpeed: 0.4 * 1024 * 1024 / 8 }
            ],
            ...options
        };

        this.validationResults = {
            timestamp: new Date().toISOString(),
            optimizationChecks: {},
            performanceImpact: {},
            regressionTests: {},
            recommendations: []
        };

        this.expectedOptimizations = {
            cssConsolidation: {
                description: 'CSS files should be consolidated to reduce HTTP requests',
                threshold: 3, // Maximum CSS files allowed
                weight: 'high'
            },
            jsBundling: {
                description: 'JavaScript files should be bundled and minified',
                threshold: 5, // Maximum JS files allowed
                weight: 'high'
            },
            imageOptimization: {
                description: 'Images should use lazy loading and modern formats',
                threshold: 0.8, // 80% of images should be lazy loaded
                weight: 'medium'
            },
            resourceHints: {
                description: 'Critical resources should have preconnect/dns-prefetch hints',
                threshold: 3, // Minimum resource hints
                weight: 'medium'
            },
            compressionEnabled: {
                description: 'Text resources should be compressed (gzip/brotli)',
                threshold: 0.8, // 80% of text resources should be compressed
                weight: 'high'
            },
            cachingHeaders: {
                description: 'Static resources should have proper cache headers',
                threshold: 0.9, // 90% of static resources should be cacheable
                weight: 'high'
            },
            criticalCss: {
                description: 'Critical CSS should be inlined for faster rendering',
                threshold: true, // Should have inline critical CSS
                weight: 'medium'
            },
            asyncJavaScript: {
                description: 'Non-critical JavaScript should be loaded asynchronously',
                threshold: 0.7, // 70% of JS should be async/defer
                weight: 'medium'
            }
        };

        this.performanceThresholds = {
            fcp: { good: 1800, poor: 3000 },
            lcp: { good: 2500, poor: 4000 },
            cls: { good: 0.1, poor: 0.25 },
            fid: { good: 100, poor: 300 },
            ttfb: { good: 600, poor: 1500 },
            totalBlockingTime: { good: 200, poor: 600 },
            speedIndex: { good: 3400, poor: 5800 }
        };
    }

    async validateOptimizations() {
        console.log('✨ OPTIMIZATION VALIDATOR STARTING\n');
        console.log('═══════════════════════════════════════════════════════════\n');

        try {
            // Validate implementation of expected optimizations
            await this.validateOptimizationImplementation();

            // Measure performance impact of optimizations
            await this.measurePerformanceImpact();

            // Test optimization effectiveness under different conditions
            await this.testOptimizationEffectiveness();

            // Validate against baseline performance
            await this.validateAgainstBaseline();

            // Check for optimization regressions
            await this.checkOptimizationRegressions();

            // Generate validation report
            await this.generateValidationReport();

            console.log('\n✅ OPTIMIZATION VALIDATION COMPLETED');
            return this.validationResults;

        } catch (error) {
            console.error('\n❌ Optimization validation failed:', error.message);
            throw error;
        }
    }

    async validateOptimizationImplementation() {
        console.log('🔍 Validating optimization implementation...\n');

        this.validationResults.optimizationChecks = {};

        for (const page of this.options.testPages) {
            console.log(`Validating optimizations for ${page}...`);

            const pageValidation = await this.validatePageOptimizations(page);
            this.validationResults.optimizationChecks[page] = pageValidation;

            // Display results
            Object.entries(pageValidation.checks).forEach(([optimization, result]) => {
                const status = result.passed ? '✅' : '❌';
                const score = result.score?.toFixed(1) || 'N/A';
                console.log(`  ${optimization}: ${status} (${score})`);
            });

            console.log(`  Overall Score: ${pageValidation.overallScore.toFixed(1)}/100\n`);
        }
    }

    async validatePageOptimizations(page) {
        const browser = await puppeteer.launch({ headless: true });
        const browserPage = await browser.newPage();

        try {
            // Enable network monitoring
            await browserPage.setRequestInterception(true);
            const requests = [];
            const responses = [];

            browserPage.on('request', request => {
                requests.push(request);
                request.continue();
            });

            browserPage.on('response', response => {
                responses.push(response);
            });

            // Navigate to page
            await browserPage.goto(`${this.options.baseUrl}${page}`, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // Wait for page to fully load
            await this.sleep(3000);

            // Collect optimization metrics
            const optimizationData = await browserPage.evaluate(() => {
                return {
                    // CSS optimization metrics
                    cssFiles: document.querySelectorAll('link[rel="stylesheet"]').length,
                    inlineCssBlocks: document.querySelectorAll('style').length,
                    criticalCssInlined: document.head.innerHTML.includes('<style>'),

                    // JavaScript optimization metrics
                    jsFiles: document.querySelectorAll('script[src]').length,
                    inlineJsBlocks: document.querySelectorAll('script:not([src])').length,
                    asyncScripts: document.querySelectorAll('script[async], script[defer]').length,
                    totalScripts: document.querySelectorAll('script').length,

                    // Image optimization metrics
                    totalImages: document.querySelectorAll('img').length,
                    lazyLoadedImages: document.querySelectorAll('img[loading="lazy"]').length,
                    webpImages: document.querySelectorAll('img[src*=".webp"], source[srcset*=".webp"]').length,
                    responsiveImages: document.querySelectorAll('img[srcset], picture').length,

                    // Resource hints
                    preconnects: document.querySelectorAll('link[rel="preconnect"]').length,
                    dnsPrefetch: document.querySelectorAll('link[rel="dns-prefetch"]').length,
                    preloads: document.querySelectorAll('link[rel="preload"]').length,

                    // Meta optimization
                    hasViewport: !!document.querySelector('meta[name="viewport"]'),
                    hasCharset: !!document.querySelector('meta[charset]'),
                    hasDescription: !!document.querySelector('meta[name="description"]'),

                    // Performance API checks
                    performanceAPIAvailable: 'performance' in window,
                    observerAPIAvailable: 'PerformanceObserver' in window,
                    intersectionObserverAvailable: 'IntersectionObserver' in window
                };
            });

            // Analyze network requests
            const networkAnalysis = this.analyzeNetworkRequests(requests, responses);

            // Validate each optimization
            const checks = {};
            let totalScore = 0;
            let maxScore = 0;

            for (const [optimizationName, config] of Object.entries(this.expectedOptimizations)) {
                const result = this.validateSpecificOptimization(
                    optimizationName,
                    config,
                    optimizationData,
                    networkAnalysis
                );

                checks[optimizationName] = result;
                totalScore += result.score * this.getOptimizationWeight(config.weight);
                maxScore += 100 * this.getOptimizationWeight(config.weight);
            }

            const overallScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

            return {
                page,
                checks,
                overallScore,
                optimizationData,
                networkAnalysis,
                timestamp: Date.now()
            };

        } finally {
            await browser.close();
        }
    }

    validateSpecificOptimization(name, config, pageData, networkData) {
        let passed = false;
        let score = 0;
        let actualValue = 0;
        let details = '';

        switch (name) {
            case 'cssConsolidation':
                actualValue = pageData.cssFiles;
                passed = actualValue <= config.threshold;
                score = Math.max(0, 100 - ((actualValue - 1) / config.threshold) * 100);
                details = `${actualValue} CSS files found (threshold: ${config.threshold})`;
                break;

            case 'jsBundling':
                actualValue = pageData.jsFiles;
                passed = actualValue <= config.threshold;
                score = Math.max(0, 100 - ((actualValue - 1) / config.threshold) * 100);
                details = `${actualValue} JS files found (threshold: ${config.threshold})`;
                break;

            case 'imageOptimization':
                if (pageData.totalImages > 0) {
                    actualValue = pageData.lazyLoadedImages / pageData.totalImages;
                    passed = actualValue >= config.threshold;
                    score = Math.min(100, (actualValue / config.threshold) * 100);
                    details = `${(actualValue * 100).toFixed(1)}% images lazy loaded (threshold: ${(config.threshold * 100)}%)`;
                } else {
                    passed = true;
                    score = 100;
                    details = 'No images found';
                }
                break;

            case 'resourceHints':
                actualValue = pageData.preconnects + pageData.dnsPrefetch;
                passed = actualValue >= config.threshold;
                score = Math.min(100, (actualValue / config.threshold) * 100);
                details = `${actualValue} resource hints found (threshold: ${config.threshold})`;
                break;

            case 'compressionEnabled':
                actualValue = networkData.compressionRatio;
                passed = actualValue >= config.threshold;
                score = Math.min(100, (actualValue / config.threshold) * 100);
                details = `${(actualValue * 100).toFixed(1)}% resources compressed (threshold: ${(config.threshold * 100)}%)`;
                break;

            case 'cachingHeaders':
                actualValue = networkData.cacheableRatio;
                passed = actualValue >= config.threshold;
                score = Math.min(100, (actualValue / config.threshold) * 100);
                details = `${(actualValue * 100).toFixed(1)}% resources cacheable (threshold: ${(config.threshold * 100)}%)`;
                break;

            case 'criticalCss':
                actualValue = pageData.criticalCssInlined;
                passed = actualValue === config.threshold;
                score = actualValue ? 100 : 0;
                details = actualValue ? 'Critical CSS inlined' : 'No critical CSS found';
                break;

            case 'asyncJavaScript':
                if (pageData.totalScripts > 0) {
                    actualValue = pageData.asyncScripts / pageData.totalScripts;
                    passed = actualValue >= config.threshold;
                    score = Math.min(100, (actualValue / config.threshold) * 100);
                    details = `${(actualValue * 100).toFixed(1)}% scripts async/defer (threshold: ${(config.threshold * 100)}%)`;
                } else {
                    passed = true;
                    score = 100;
                    details = 'No scripts found';
                }
                break;
        }

        return {
            passed,
            score,
            actualValue,
            expectedValue: config.threshold,
            details,
            description: config.description
        };
    }

    analyzeNetworkRequests(requests, responses) {
        const textTypes = ['text/html', 'text/css', 'application/javascript', 'application/json'];
        const cacheableTypes = ['image/', 'text/css', 'application/javascript', 'font/'];

        let compressedCount = 0;
        let textResourceCount = 0;
        let cacheableCount = 0;
        let totalStaticResources = 0;

        responses.forEach(response => {
            const contentType = response.headers()['content-type'] || '';
            const contentEncoding = response.headers()['content-encoding'];
            const cacheControl = response.headers()['cache-control'];

            // Check compression
            if (textTypes.some(type => contentType.includes(type))) {
                textResourceCount++;
                if (contentEncoding && (contentEncoding.includes('gzip') || contentEncoding.includes('br'))) {
                    compressedCount++;
                }
            }

            // Check caching
            if (cacheableTypes.some(type => contentType.includes(type))) {
                totalStaticResources++;
                if (cacheControl && (
                    cacheControl.includes('max-age') ||
                    cacheControl.includes('public') ||
                    response.headers()['expires']
                )) {
                    cacheableCount++;
                }
            }
        });

        return {
            totalRequests: requests.length,
            totalResponses: responses.length,
            compressionRatio: textResourceCount > 0 ? compressedCount / textResourceCount : 0,
            cacheableRatio: totalStaticResources > 0 ? cacheableCount / totalStaticResources : 0,
            compressedCount,
            textResourceCount,
            cacheableCount,
            totalStaticResources
        };
    }

    async measurePerformanceImpact() {
        console.log('📊 Measuring performance impact of optimizations...\n');

        this.validationResults.performanceImpact = {};

        for (const page of this.options.testPages) {
            console.log(`Measuring performance impact for ${page}...`);

            const performanceResults = [];

            // Run multiple iterations for statistical significance
            for (let i = 0; i < this.options.iterations; i++) {
                const result = await this.measurePagePerformance(page);
                if (result.success) {
                    performanceResults.push(result);
                }
            }

            if (performanceResults.length > 0) {
                const stats = this.calculatePerformanceStatistics(performanceResults);
                this.validationResults.performanceImpact[page] = stats;

                console.log(`  FCP: ${stats.fcp.avg.toFixed(0)}ms ±${stats.fcp.stdDev.toFixed(0)}`);
                console.log(`  LCP: ${stats.lcp.avg.toFixed(0)}ms ±${stats.lcp.stdDev.toFixed(0)}`);
                console.log(`  CLS: ${stats.cls.avg.toFixed(3)} ±${stats.cls.stdDev.toFixed(3)}`);
                console.log(`  Load Time: ${stats.loadComplete.avg.toFixed(0)}ms`);

                // Grade the performance
                const grade = this.gradePerformance(stats);
                console.log(`  Performance Grade: ${grade}\n`);
            } else {
                console.log(`  ❌ Could not measure performance for ${page}\n`);
            }
        }
    }

    async measurePagePerformance(page) {
        const browser = await puppeteer.launch({ headless: true });
        const browserPage = await browser.newPage();

        try {
            // Enable performance monitoring
            await browserPage.evaluateOnNewDocument(() => {
                window.performanceMetrics = {};

                if ('PerformanceObserver' in window) {
                    const observer = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
                                window.performanceMetrics.fcp = entry.startTime;
                            } else if (entry.entryType === 'largest-contentful-paint') {
                                window.performanceMetrics.lcp = entry.startTime;
                            } else if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                                window.performanceMetrics.cls = (window.performanceMetrics.cls || 0) + entry.value;
                            } else if (entry.entryType === 'first-input') {
                                window.performanceMetrics.fid = entry.processingStart - entry.startTime;
                            } else if (entry.entryType === 'longtask') {
                                window.performanceMetrics.totalBlockingTime =
                                    (window.performanceMetrics.totalBlockingTime || 0) + Math.max(0, entry.duration - 50);
                            }
                        }
                    });

                    try {
                        observer.observe({
                            entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input', 'longtask']
                        });
                    } catch (e) {
                        // Some entry types might not be supported
                    }
                }
            });

            const startTime = performance.now();

            // Navigate to page
            const response = await browserPage.goto(`${this.options.baseUrl}${page}`, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // Wait for performance metrics to be collected
            await this.sleep(3000);

            const metrics = await browserPage.evaluate(() => {
                const timing = performance.timing;
                const navigation = performance.getEntriesByType('navigation')[0];

                return {
                    // Core Web Vitals
                    fcp: window.performanceMetrics?.fcp || 0,
                    lcp: window.performanceMetrics?.lcp || 0,
                    cls: window.performanceMetrics?.cls || 0,
                    fid: window.performanceMetrics?.fid || 0,
                    totalBlockingTime: window.performanceMetrics?.totalBlockingTime || 0,

                    // Navigation timing
                    ttfb: timing.responseStart - timing.navigationStart,
                    domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                    loadComplete: timing.loadEventEnd - timing.navigationStart,

                    // Calculated metrics
                    speedIndex: performance.now() - performance.timeOrigin, // Approximation

                    success: true
                };
            });

            return metrics;

        } catch (error) {
            return { success: false, error: error.message, page };
        } finally {
            await browser.close();
        }
    }

    calculatePerformanceStatistics(results) {
        const metrics = ['fcp', 'lcp', 'cls', 'fid', 'ttfb', 'domContentLoaded', 'loadComplete', 'totalBlockingTime', 'speedIndex'];
        const stats = {};

        metrics.forEach(metric => {
            const values = results.map(r => r[metric]).filter(v => v !== undefined && !isNaN(v));

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
                    stdDev: Math.sqrt(variance),
                    count: values.length
                };
            }
        });

        return stats;
    }

    gradePerformance(stats) {
        let totalScore = 0;
        let scoreCount = 0;

        // Grade core web vitals
        Object.entries(this.performanceThresholds).forEach(([metric, thresholds]) => {
            if (stats[metric]?.avg !== undefined) {
                const value = stats[metric].avg;
                let score = 100;

                if (value > thresholds.poor) {
                    score = 25;
                } else if (value > thresholds.good) {
                    // Linear interpolation between good and poor
                    const ratio = (value - thresholds.good) / (thresholds.poor - thresholds.good);
                    score = 100 - (ratio * 50);
                }

                totalScore += score;
                scoreCount++;
            }
        });

        const averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;

        if (averageScore >= 90) return 'A (Excellent)';
        if (averageScore >= 80) return 'B (Good)';
        if (averageScore >= 70) return 'C (Needs Improvement)';
        if (averageScore >= 60) return 'D (Poor)';
        return 'F (Critical)';
    }

    async testOptimizationEffectiveness() {
        console.log('🌐 Testing optimization effectiveness under different conditions...\n');

        for (const condition of this.options.networkConditions) {
            console.log(`Testing under ${condition.name} conditions...`);

            const conditionResults = {};

            for (const page of this.options.testPages.slice(0, 3)) { // Test first 3 pages
                const result = await this.testPageUnderCondition(page, condition);
                conditionResults[page] = result;

                console.log(`  ${page}: FCP ${result.fcp.toFixed(0)}ms, LCP ${result.lcp.toFixed(0)}ms`);
            }

            this.validationResults.performanceImpact[`${condition.name}_conditions`] = conditionResults;
        }

        console.log();
    }

    async testPageUnderCondition(page, networkCondition) {
        const browser = await puppeteer.launch({ headless: true });
        const browserPage = await browser.newPage();

        try {
            // Apply network throttling
            const client = await browserPage.target().createCDPSession();
            await client.send('Network.emulateNetworkConditions', {
                offline: false,
                latency: networkCondition.latency,
                downloadThroughput: networkCondition.downloadSpeed,
                uploadThroughput: networkCondition.downloadSpeed * 0.1
            });

            return await this.measurePagePerformance(page, browserPage);

        } finally {
            await browser.close();
        }
    }

    async validateAgainstBaseline() {
        console.log('📈 Validating against baseline performance...\n');

        try {
            // Try to load previous baseline results
            const baselineData = await this.loadBaselineResults();

            if (baselineData) {
                console.log('Comparing against previous baseline...');

                this.validationResults.regressionTests = {};

                for (const page of this.options.testPages) {
                    if (baselineData[page] && this.validationResults.performanceImpact[page]) {
                        const regression = this.calculateRegression(
                            this.validationResults.performanceImpact[page],
                            baselineData[page]
                        );

                        this.validationResults.regressionTests[page] = regression;

                        console.log(`  ${page}:`);
                        console.log(`    FCP: ${this.formatChange(regression.fcp.change)}%`);
                        console.log(`    LCP: ${this.formatChange(regression.lcp.change)}%`);
                        console.log(`    Load Time: ${this.formatChange(regression.loadComplete.change)}%`);
                    }
                }
            } else {
                console.log('No baseline data found - current results will serve as baseline');
            }
        } catch (error) {
            console.log('⚠️  Could not validate against baseline:', error.message);
        }

        console.log();
    }

    async checkOptimizationRegressions() {
        console.log('🔍 Checking for optimization regressions...\n');

        const regressions = [];

        // Check each page's optimization scores
        Object.entries(this.validationResults.optimizationChecks).forEach(([page, results]) => {
            Object.entries(results.checks).forEach(([optimization, check]) => {
                if (!check.passed && this.expectedOptimizations[optimization].weight === 'high') {
                    regressions.push({
                        page,
                        optimization,
                        severity: 'high',
                        issue: `${optimization} not properly implemented`,
                        details: check.details,
                        recommendation: check.description
                    });
                }
            });

            // Check overall score
            if (results.overallScore < 70) {
                regressions.push({
                    page,
                    optimization: 'overall',
                    severity: 'medium',
                    issue: `Low optimization score (${results.overallScore.toFixed(1)}/100)`,
                    recommendation: 'Review and improve optimization implementation'
                });
            }
        });

        if (regressions.length > 0) {
            console.log('⚠️  Optimization regressions detected:');
            regressions.forEach(regression => {
                console.log(`  ${regression.page}: ${regression.issue}`);
            });
        } else {
            console.log('✅ No optimization regressions detected');
        }

        this.validationResults.recommendations.push(...regressions);
        console.log();
    }

    async generateValidationReport() {
        console.log('📊 Generating optimization validation report...\n');

        const report = {
            summary: this.generateValidationSummary(),
            optimizationChecks: this.validationResults.optimizationChecks,
            performanceImpact: this.validationResults.performanceImpact,
            regressionTests: this.validationResults.regressionTests,
            recommendations: this.validationResults.recommendations,
            timestamp: this.validationResults.timestamp
        };

        // Save detailed results
        await fs.writeFile(
            path.join(process.cwd(), 'optimization-validation-results.json'),
            JSON.stringify(report, null, 2)
        );

        // Generate readable report
        const readableReport = this.generateReadableValidationReport(report);
        await fs.writeFile(
            path.join(process.cwd(), 'OPTIMIZATION_VALIDATION_REPORT.md'),
            readableReport
        );

        console.log('✅ Validation reports generated:');
        console.log('  📄 optimization-validation-results.json');
        console.log('  📋 OPTIMIZATION_VALIDATION_REPORT.md');

        // Display summary
        console.log('\n' + '═'.repeat(60));
        console.log('✨ OPTIMIZATION VALIDATION SUMMARY');
        console.log('═'.repeat(60));
        console.log(report.summary);
    }

    generateValidationSummary() {
        let summary = '';

        // Calculate overall optimization score
        const overallScores = Object.values(this.validationResults.optimizationChecks)
            .map(result => result.overallScore);
        const avgOptimizationScore = overallScores.length > 0
            ? overallScores.reduce((a, b) => a + b, 0) / overallScores.length
            : 0;

        summary += `Overall Optimization Score: ${avgOptimizationScore.toFixed(1)}/100\n`;

        // Performance impact summary
        if (Object.keys(this.validationResults.performanceImpact).length > 0) {
            const avgFCP = this.calculateAverageMetricFromImpact('fcp');
            const avgLCP = this.calculateAverageMetricFromImpact('lcp');

            summary += `Average FCP: ${avgFCP.toFixed(0)}ms\n`;
            summary += `Average LCP: ${avgLCP.toFixed(0)}ms\n`;
        }

        // Regression summary
        if (Object.keys(this.validationResults.regressionTests).length > 0) {
            const regressions = Object.values(this.validationResults.regressionTests);
            const improvements = regressions.filter(r => r.fcp?.improved || r.lcp?.improved).length;
            summary += `Performance Improvements: ${improvements}/${regressions.length} pages\n`;
        }

        // Issues summary
        const highSeverityIssues = this.validationResults.recommendations.filter(r => r.severity === 'high').length;
        summary += `High Priority Issues: ${highSeverityIssues}\n`;

        return summary;
    }

    calculateAverageMetricFromImpact(metric) {
        const values = Object.values(this.validationResults.performanceImpact)
            .filter(result => typeof result === 'object' && result[metric]?.avg)
            .map(result => result[metric].avg);

        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    }

    generateReadableValidationReport(report) {
        let markdown = `# Optimization Validation Report\n\n`;
        markdown += `**Generated:** ${report.timestamp}\n\n`;

        markdown += `## Summary\n\n${report.summary}\n\n`;

        // Optimization implementation status
        markdown += `## Optimization Implementation Status\n\n`;
        markdown += `| Page | Overall Score | CSS Consolidation | JS Bundling | Image Optimization | Async Loading |\n`;
        markdown += `|------|---------------|-------------------|-------------|--------------------|--------------|\n`;

        Object.entries(report.optimizationChecks).forEach(([page, results]) => {
            const score = results.overallScore.toFixed(1);
            const css = results.checks.cssConsolidation?.passed ? '✅' : '❌';
            const js = results.checks.jsBundling?.passed ? '✅' : '❌';
            const img = results.checks.imageOptimization?.passed ? '✅' : '❌';
            const async = results.checks.asyncJavaScript?.passed ? '✅' : '❌';

            markdown += `| ${page} | ${score}/100 | ${css} | ${js} | ${img} | ${async} |\n`;
        });

        markdown += '\n';

        // Performance impact
        if (Object.keys(report.performanceImpact).length > 0) {
            markdown += `## Performance Impact\n\n`;
            markdown += `| Page | FCP (ms) | LCP (ms) | CLS | Load Time (ms) |\n`;
            markdown += `|------|----------|----------|-----|----------------|\n`;

            Object.entries(report.performanceImpact).forEach(([page, stats]) => {
                if (typeof stats === 'object' && stats.fcp) {
                    const fcp = stats.fcp.avg.toFixed(0);
                    const lcp = stats.lcp.avg.toFixed(0);
                    const cls = stats.cls.avg.toFixed(3);
                    const load = stats.loadComplete.avg.toFixed(0);

                    markdown += `| ${page} | ${fcp} | ${lcp} | ${cls} | ${load} |\n`;
                }
            });

            markdown += '\n';
        }

        // Recommendations
        if (report.recommendations.length > 0) {
            markdown += `## Recommendations\n\n`;

            const priorities = ['high', 'medium', 'low'];
            priorities.forEach(priority => {
                const recs = report.recommendations.filter(r => r.severity === priority);
                if (recs.length > 0) {
                    markdown += `### ${priority.toUpperCase()} Priority\n\n`;
                    recs.forEach(rec => {
                        markdown += `- **${rec.page || 'General'}**: ${rec.issue}\n`;
                        markdown += `  - ${rec.recommendation}\n\n`;
                    });
                }
            });
        }

        return markdown;
    }

    calculateRegression(current, previous) {
        const metrics = ['fcp', 'lcp', 'cls', 'loadComplete'];
        const regression = {};

        metrics.forEach(metric => {
            if (current[metric]?.avg && previous[metric]?.avg) {
                const change = ((current[metric].avg - previous[metric].avg) / previous[metric].avg) * 100;
                regression[metric] = {
                    change,
                    current: current[metric].avg,
                    previous: previous[metric].avg,
                    improved: change < 0 // Negative change is improvement for performance metrics
                };
            }
        });

        return regression;
    }

    async loadBaselineResults() {
        try {
            const data = await fs.readFile('performance-test-results.json', 'utf8');
            const parsed = JSON.parse(data);
            return parsed.details?.baseline || parsed.baseline;
        } catch (error) {
            return null;
        }
    }

    getOptimizationWeight(weight) {
        const weights = { high: 3, medium: 2, low: 1 };
        return weights[weight] || 1;
    }

    formatChange(change) {
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(1)}`;
    }

    percentile(arr, p) {
        if (arr.length === 0) return 0;
        const index = Math.ceil(arr.length * p) - 1;
        return arr[Math.max(0, Math.min(index, arr.length - 1))];
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default OptimizationValidator;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const validator = new OptimizationValidator();
    validator.validateOptimizations().catch(console.error);
}