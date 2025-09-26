#!/usr/bin/env node

/**
 * STRESS TEST ANALYZER
 * Advanced stress testing to find breaking points and performance bottlenecks
 * Part of the hive mind performance testing collective
 */

import { Worker } from 'worker_threads';
import { performance } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';

class StressTestAnalyzer {
    constructor(options = {}) {
        this.options = {
            baseUrl: options.baseUrl || 'http://localhost:4321/website/',
            testPages: options.testPages || ['index.html', 'about.html', 'contact.html'],
            maxConcurrentUsers: options.maxConcurrentUsers || 1000,
            stepSize: options.stepSize || 25,
            testDuration: options.testDuration || 30, // seconds
            rampUpTime: options.rampUpTime || 10, // seconds
            thresholds: {
                successRate: 0.95,
                avgResponseTime: 5000, // ms
                errorRate: 0.05,
                memoryLimit: 1024 * 1024 * 1024, // 1GB
                cpuLimit: 80 // percentage
            },
            ...options
        };

        this.testResults = {
            timestamp: new Date().toISOString(),
            breakingPoints: {},
            bottlenecks: [],
            resourceUsage: {},
            errorPatterns: [],
            recommendations: []
        };

        this.activeWorkers = new Set();
        this.resourceMonitor = null;
    }

    async runStressTestAnalysis() {
        console.log('💪 STRESS TEST ANALYZER STARTING\n');
        console.log('═══════════════════════════════════════════════════════════\n');

        try {
            // Start resource monitoring
            await this.startResourceMonitoring();

            // Run progressive stress tests
            await this.runProgressiveStressTests();

            // Find resource bottlenecks
            await this.analyzeResourceBottlenecks();

            // Test memory leaks
            await this.testMemoryLeaks();

            // Test error patterns
            await this.analyzeErrorPatterns();

            // Generate stress test report
            await this.generateStressTestReport();

            console.log('\n✅ STRESS TEST ANALYSIS COMPLETED');
            return this.testResults;

        } catch (error) {
            console.error('\n❌ Stress test analysis failed:', error.message);
            throw error;
        } finally {
            await this.cleanup();
        }
    }

    async startResourceMonitoring() {
        console.log('📊 Starting resource monitoring...\n');

        this.resourceMonitor = setInterval(async () => {
            const usage = process.memoryUsage();
            const cpuUsage = process.cpuUsage();

            this.testResults.resourceUsage[Date.now()] = {
                memory: {
                    rss: usage.rss,
                    heapTotal: usage.heapTotal,
                    heapUsed: usage.heapUsed,
                    external: usage.external
                },
                cpu: {
                    user: cpuUsage.user,
                    system: cpuUsage.system
                }
            };
        }, 1000);
    }

    async runProgressiveStressTests() {
        console.log('🚀 Running progressive stress tests...\n');

        let currentUsers = this.options.stepSize;
        let breakingPointFound = false;

        while (currentUsers <= this.options.maxConcurrentUsers && !breakingPointFound) {
            console.log(`Testing with ${currentUsers} concurrent users...`);

            const stressResult = await this.runStressTest(currentUsers);
            this.testResults.breakingPoints[currentUsers] = stressResult;

            console.log(`  Success Rate: ${(stressResult.successRate * 100).toFixed(1)}%`);
            console.log(`  Avg Response: ${stressResult.avgResponseTime.toFixed(0)}ms`);
            console.log(`  Error Rate: ${(stressResult.errorRate * 100).toFixed(1)}%`);
            console.log(`  Throughput: ${stressResult.requestsPerSecond.toFixed(1)} req/s`);

            // Check if we've reached breaking point
            if (this.isBreakingPoint(stressResult)) {
                console.log(`🚨 BREAKING POINT DETECTED at ${currentUsers} users`);
                breakingPointFound = true;

                // Test a few more levels to confirm
                await this.confirmBreakingPoint(currentUsers);
                break;
            }

            // Check system resource limits
            if (await this.checkResourceLimits()) {
                console.log(`🚨 RESOURCE LIMITS REACHED at ${currentUsers} users`);
                break;
            }

            currentUsers += this.options.stepSize;

            // Cool down period
            console.log('  Cooling down...\n');
            await this.sleep(5000);
        }
    }

    async runStressTest(userCount) {
        const startTime = performance.now();
        const requests = [];
        const errors = [];
        const workers = [];

        // Calculate requests per worker
        const workersCount = Math.min(userCount, 50); // Max 50 workers
        const requestsPerWorker = Math.ceil(userCount / workersCount);

        console.log(`  Spawning ${workersCount} workers, ${requestsPerWorker} requests each...`);

        // Spawn worker threads for stress testing
        const workerPromises = Array.from({ length: workersCount }, (_, i) => {
            return this.spawnStressWorker(i, requestsPerWorker);
        });

        try {
            const workerResults = await Promise.allSettled(workerPromises);

            // Collect results from all workers
            workerResults.forEach(result => {
                if (result.status === 'fulfilled') {
                    requests.push(...result.value.requests);
                    errors.push(...result.value.errors);
                } else {
                    console.error(`  Worker failed: ${result.reason}`);
                    errors.push({ type: 'worker_failure', message: result.reason });
                }
            });

            const totalTime = (performance.now() - startTime) / 1000;
            const successfulRequests = requests.filter(r => r.success);

            return {
                userCount,
                totalRequests: requests.length,
                successfulRequests: successfulRequests.length,
                failedRequests: requests.length - successfulRequests.length,
                successRate: successfulRequests.length / requests.length || 0,
                errorRate: (requests.length - successfulRequests.length) / requests.length || 0,
                avgResponseTime: this.calculateAverage(successfulRequests.map(r => r.responseTime)),
                minResponseTime: Math.min(...successfulRequests.map(r => r.responseTime)) || 0,
                maxResponseTime: Math.max(...successfulRequests.map(r => r.responseTime)) || 0,
                p95ResponseTime: this.percentile(successfulRequests.map(r => r.responseTime).sort((a, b) => a - b), 0.95) || 0,
                requestsPerSecond: successfulRequests.length / totalTime,
                duration: totalTime,
                errors: errors,
                memoryPeak: this.getMemoryPeak(),
                timestamp: Date.now()
            };

        } catch (error) {
            throw new Error(`Stress test failed: ${error.message}`);
        }
    }

    async spawnStressWorker(workerId, requestCount) {
        return new Promise((resolve, reject) => {
            const worker = new Worker(`
                const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
                const puppeteer = require('puppeteer');
                const { performance } = require('perf_hooks');

                async function runWorkerRequests(workerId, requestCount, baseUrl, testPages) {
                    const requests = [];
                    const errors = [];

                    let browser;

                    try {
                        browser = await puppeteer.launch({
                            headless: true,
                            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
                        });

                        const page = await browser.newPage();

                        for (let i = 0; i < requestCount; i++) {
                            const randomPage = testPages[Math.floor(Math.random() * testPages.length)];
                            const requestStart = performance.now();

                            try {
                                const response = await page.goto(\`\${baseUrl}\${randomPage}\`, {
                                    timeout: 10000,
                                    waitUntil: 'networkidle2'
                                });

                                const responseTime = performance.now() - requestStart;

                                requests.push({
                                    workerId,
                                    page: randomPage,
                                    responseTime,
                                    success: response.ok(),
                                    statusCode: response.status(),
                                    timestamp: Date.now()
                                });

                            } catch (error) {
                                const responseTime = performance.now() - requestStart;

                                requests.push({
                                    workerId,
                                    page: randomPage,
                                    responseTime,
                                    success: false,
                                    error: error.message,
                                    timestamp: Date.now()
                                });

                                errors.push({
                                    workerId,
                                    type: 'request_error',
                                    message: error.message,
                                    page: randomPage
                                });
                            }

                            // Small delay between requests
                            await new Promise(resolve => setTimeout(resolve, 50));
                        }

                    } finally {
                        if (browser) {
                            await browser.close();
                        }
                    }

                    return { requests, errors };
                }

                // Execute worker
                if (!isMainThread) {
                    const { workerId, requestCount, baseUrl, testPages } = workerData;
                    runWorkerRequests(workerId, requestCount, baseUrl, testPages)
                        .then(result => parentPort.postMessage(result))
                        .catch(error => parentPort.postMessage({ error: error.message }));
                }
            `, {
                eval: true,
                workerData: {
                    workerId,
                    requestCount,
                    baseUrl: this.options.baseUrl,
                    testPages: this.options.testPages
                }
            });

            this.activeWorkers.add(worker);

            worker.on('message', (result) => {
                this.activeWorkers.delete(worker);
                if (result.error) {
                    reject(new Error(result.error));
                } else {
                    resolve(result);
                }
            });

            worker.on('error', (error) => {
                this.activeWorkers.delete(worker);
                reject(error);
            });

            worker.on('exit', (code) => {
                this.activeWorkers.delete(worker);
                if (code !== 0) {
                    reject(new Error(`Worker stopped with exit code ${code}`));
                }
            });
        });
    }

    isBreakingPoint(result) {
        return (
            result.successRate < this.options.thresholds.successRate ||
            result.avgResponseTime > this.options.thresholds.avgResponseTime ||
            result.errorRate > this.options.thresholds.errorRate
        );
    }

    async confirmBreakingPoint(userCount) {
        console.log('🔍 Confirming breaking point...');

        // Test a few more levels around the breaking point
        const testLevels = [
            userCount - this.options.stepSize,
            userCount,
            userCount + this.options.stepSize
        ];

        for (const level of testLevels) {
            if (level > 0) {
                console.log(`  Re-testing with ${level} users...`);
                const result = await this.runStressTest(level);

                if (this.isBreakingPoint(result)) {
                    console.log(`    ❌ Confirmed breaking point at ${level} users`);
                } else {
                    console.log(`    ✅ Stable performance at ${level} users`);
                }

                await this.sleep(2000);
            }
        }
    }

    async checkResourceLimits() {
        const usage = process.memoryUsage();
        const memoryUsageGB = usage.heapUsed / 1024 / 1024 / 1024;

        if (memoryUsageGB > 1) { // 1GB limit
            console.log(`⚠️  High memory usage: ${memoryUsageGB.toFixed(2)}GB`);
            return true;
        }

        return false;
    }

    async analyzeResourceBottlenecks() {
        console.log('🔍 Analyzing resource bottlenecks...\n');

        const resourceHistory = Object.values(this.testResults.resourceUsage);

        if (resourceHistory.length === 0) {
            console.log('⚠️  No resource usage data collected');
            return;
        }

        // Memory analysis
        const memoryUsage = resourceHistory.map(r => r.memory.heapUsed);
        const memoryGrowthRate = this.calculateGrowthRate(memoryUsage);

        // Find memory spikes
        const memorySpikes = this.findSpikes(memoryUsage, 0.5); // 50% spike threshold

        console.log(`📊 Memory Analysis:`);
        console.log(`   Peak Usage: ${(Math.max(...memoryUsage) / 1024 / 1024).toFixed(2)}MB`);
        console.log(`   Growth Rate: ${memoryGrowthRate.toFixed(2)}% per minute`);
        console.log(`   Memory Spikes: ${memorySpikes.length} detected`);

        if (memoryGrowthRate > 10) {
            this.testResults.bottlenecks.push({
                type: 'memory_leak',
                severity: 'high',
                description: `Memory growing at ${memoryGrowthRate.toFixed(2)}% per minute`,
                recommendation: 'Investigate potential memory leaks in application code'
            });
        }

        if (memorySpikes.length > 5) {
            this.testResults.bottlenecks.push({
                type: 'memory_spikes',
                severity: 'medium',
                description: `${memorySpikes.length} memory spikes detected`,
                recommendation: 'Optimize garbage collection or reduce memory allocation bursts'
            });
        }
    }

    async testMemoryLeaks() {
        console.log('🔍 Testing for memory leaks...\n');

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        try {
            const initialMemory = process.memoryUsage().heapUsed;
            console.log(`Initial memory: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`);

            // Run repeated page loads to detect leaks
            for (let i = 0; i < 50; i++) {
                const randomPage = this.options.testPages[Math.floor(Math.random() * this.options.testPages.length)];

                await page.goto(`${this.options.baseUrl}${randomPage}`, {
                    waitUntil: 'networkidle2',
                    timeout: 10000
                });

                // Force garbage collection if available
                if (global.gc) {
                    global.gc();
                }

                if (i % 10 === 0) {
                    const currentMemory = process.memoryUsage().heapUsed;
                    console.log(`  After ${i + 1} loads: ${(currentMemory / 1024 / 1024).toFixed(2)}MB`);
                }
            }

            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;
            const memoryIncreasePercent = (memoryIncrease / initialMemory) * 100;

            console.log(`Final memory: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`);
            console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB (${memoryIncreasePercent.toFixed(1)}%)`);

            if (memoryIncreasePercent > 50) {
                this.testResults.bottlenecks.push({
                    type: 'potential_memory_leak',
                    severity: 'high',
                    description: `Memory increased by ${memoryIncreasePercent.toFixed(1)}% during repeated page loads`,
                    recommendation: 'Investigate event listeners, closures, and DOM references that may not be cleaned up'
                });
            }

        } finally {
            await browser.close();
        }
    }

    async analyzeErrorPatterns() {
        console.log('🔍 Analyzing error patterns...\n');

        const allErrors = [];

        // Collect all errors from stress tests
        Object.values(this.testResults.breakingPoints).forEach(result => {
            if (result.errors) {
                allErrors.push(...result.errors);
            }
        });

        if (allErrors.length === 0) {
            console.log('✅ No errors detected during stress testing');
            return;
        }

        // Categorize errors
        const errorTypes = {};
        const errorPages = {};

        allErrors.forEach(error => {
            // Group by error type
            const type = error.type || 'unknown';
            if (!errorTypes[type]) {
                errorTypes[type] = [];
            }
            errorTypes[type].push(error);

            // Group by page
            if (error.page) {
                if (!errorPages[error.page]) {
                    errorPages[error.page] = [];
                }
                errorPages[error.page].push(error);
            }
        });

        console.log('📊 Error Analysis:');
        console.log(`   Total Errors: ${allErrors.length}`);

        Object.entries(errorTypes).forEach(([type, errors]) => {
            console.log(`   ${type}: ${errors.length} occurrences`);

            if (errors.length > 10) {
                this.testResults.errorPatterns.push({
                    type: type,
                    count: errors.length,
                    severity: 'high',
                    description: `High frequency of ${type} errors`,
                    recommendation: this.getErrorRecommendation(type)
                });
            }
        });

        Object.entries(errorPages).forEach(([page, errors]) => {
            if (errors.length > 5) {
                console.log(`   ${page}: ${errors.length} errors`);
            }
        });
    }

    getErrorRecommendation(errorType) {
        const recommendations = {
            'timeout_error': 'Optimize page loading speed or increase timeout limits',
            'network_error': 'Check server capacity and network connectivity',
            'memory_error': 'Optimize memory usage and implement proper cleanup',
            'worker_failure': 'Review worker thread implementation and error handling',
            'request_error': 'Investigate server-side issues and response handling'
        };

        return recommendations[errorType] || 'Review application logs and implement proper error handling';
    }

    async generateStressTestReport() {
        console.log('📊 Generating stress test report...\n');

        const report = {
            summary: this.generateStressSummary(),
            breakingPoints: this.testResults.breakingPoints,
            bottlenecks: this.testResults.bottlenecks,
            errorPatterns: this.testResults.errorPatterns,
            recommendations: this.generateStressRecommendations(),
            resourceUsage: this.summarizeResourceUsage(),
            timestamp: this.testResults.timestamp
        };

        // Save detailed results
        await fs.writeFile(
            path.join(process.cwd(), 'stress-test-results.json'),
            JSON.stringify(report, null, 2)
        );

        // Generate readable report
        const readableReport = this.generateReadableStressReport(report);
        await fs.writeFile(
            path.join(process.cwd(), 'STRESS_TEST_REPORT.md'),
            readableReport
        );

        console.log('✅ Stress test reports generated:');
        console.log('  📄 stress-test-results.json');
        console.log('  📋 STRESS_TEST_REPORT.md');

        // Display summary
        console.log('\n' + '═'.repeat(60));
        console.log('💪 STRESS TEST SUMMARY');
        console.log('═'.repeat(60));
        console.log(report.summary);
    }

    generateStressSummary() {
        let summary = '';

        // Find breaking point
        const breakingPointUsers = this.findBreakingPointUsers();
        if (breakingPointUsers) {
            summary += `🚨 Breaking Point: ${breakingPointUsers} concurrent users\n`;
        } else {
            const maxTested = Math.max(...Object.keys(this.testResults.breakingPoints).map(Number));
            summary += `✅ No breaking point found up to ${maxTested} concurrent users\n`;
        }

        // Resource bottlenecks
        if (this.testResults.bottlenecks.length > 0) {
            const highSeverity = this.testResults.bottlenecks.filter(b => b.severity === 'high').length;
            summary += `⚠️  Resource Bottlenecks: ${this.testResults.bottlenecks.length} found (${highSeverity} high severity)\n`;
        } else {
            summary += `✅ No resource bottlenecks detected\n`;
        }

        // Error patterns
        if (this.testResults.errorPatterns.length > 0) {
            summary += `❌ Error Patterns: ${this.testResults.errorPatterns.length} identified\n`;
        } else {
            summary += `✅ No significant error patterns\n`;
        }

        return summary;
    }

    generateStressRecommendations() {
        const recommendations = [...this.testResults.bottlenecks, ...this.testResults.errorPatterns];

        // Add general recommendations based on findings
        const breakingPointUsers = this.findBreakingPointUsers();
        if (breakingPointUsers && breakingPointUsers < 100) {
            recommendations.push({
                type: 'scalability',
                severity: 'high',
                description: 'Low concurrent user capacity',
                recommendation: 'Implement horizontal scaling, caching layer, and optimize database queries'
            });
        }

        return recommendations;
    }

    findBreakingPointUsers() {
        for (const [userCount, result] of Object.entries(this.testResults.breakingPoints)) {
            if (this.isBreakingPoint(result)) {
                return parseInt(userCount);
            }
        }
        return null;
    }

    summarizeResourceUsage() {
        const resourceHistory = Object.values(this.testResults.resourceUsage);
        if (resourceHistory.length === 0) return {};

        const memoryUsage = resourceHistory.map(r => r.memory.heapUsed);

        return {
            memoryPeak: Math.max(...memoryUsage),
            memoryAverage: this.calculateAverage(memoryUsage),
            memoryGrowthRate: this.calculateGrowthRate(memoryUsage),
            samples: resourceHistory.length
        };
    }

    generateReadableStressReport(report) {
        let markdown = `# Stress Test Report\n\n`;
        markdown += `**Generated:** ${report.timestamp}\n\n`;

        markdown += `## Summary\n\n${report.summary}\n\n`;

        if (report.bottlenecks.length > 0) {
            markdown += `## Resource Bottlenecks\n\n`;
            report.bottlenecks.forEach(bottleneck => {
                markdown += `- **${bottleneck.type}** (${bottleneck.severity}): ${bottleneck.description}\n`;
                markdown += `  - Recommendation: ${bottleneck.recommendation}\n\n`;
            });
        }

        if (report.errorPatterns.length > 0) {
            markdown += `## Error Patterns\n\n`;
            report.errorPatterns.forEach(pattern => {
                markdown += `- **${pattern.type}**: ${pattern.count} occurrences\n`;
                markdown += `  - ${pattern.description}\n`;
                markdown += `  - Recommendation: ${pattern.recommendation}\n\n`;
            });
        }

        if (report.recommendations.length > 0) {
            markdown += `## Recommendations\n\n`;
            const priorities = ['high', 'medium', 'low'];

            priorities.forEach(priority => {
                const recs = report.recommendations.filter(r => r.severity === priority);
                if (recs.length > 0) {
                    markdown += `### ${priority.toUpperCase()} Priority\n\n`;
                    recs.forEach(rec => {
                        markdown += `- ${rec.description}: ${rec.recommendation}\n`;
                    });
                    markdown += '\n';
                }
            });
        }

        return markdown;
    }

    // Utility methods
    calculateAverage(numbers) {
        if (numbers.length === 0) return 0;
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
    }

    calculateGrowthRate(values) {
        if (values.length < 2) return 0;
        const first = values[0];
        const last = values[values.length - 1];
        return ((last - first) / first) * 100;
    }

    findSpikes(values, threshold) {
        const spikes = [];
        for (let i = 1; i < values.length; i++) {
            const change = (values[i] - values[i - 1]) / values[i - 1];
            if (change > threshold) {
                spikes.push({ index: i, change });
            }
        }
        return spikes;
    }

    percentile(arr, p) {
        if (arr.length === 0) return 0;
        const index = Math.ceil(arr.length * p) - 1;
        return arr[Math.max(0, Math.min(index, arr.length - 1))];
    }

    getMemoryPeak() {
        return Math.max(...Object.values(this.testResults.resourceUsage).map(r => r.memory.heapUsed)) || 0;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async cleanup() {
        // Stop resource monitoring
        if (this.resourceMonitor) {
            clearInterval(this.resourceMonitor);
        }

        // Terminate any remaining workers
        for (const worker of this.activeWorkers) {
            await worker.terminate();
        }
        this.activeWorkers.clear();
    }
}

export default StressTestAnalyzer;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const analyzer = new StressTestAnalyzer();
    analyzer.runStressTestAnalysis().catch(console.error);
}