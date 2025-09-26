#!/usr/bin/env node

/**
 * PERFORMANCE TEST EXECUTION SCRIPT
 * Simple interface to run all performance testing components
 * Designed for easy integration with hive mind agents
 */

import PerformanceTestOrchestrator from './performance-test-orchestrator.js';
import { performance } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';

class PerformanceTestRunner {
    constructor() {
        this.config = {
            baseUrl: process.env.BASE_URL || 'http://localhost:4321/website/',
            testPages: [
                'index.html',
                'about.html',
                'contact.html',
                'pricing.html',
                'portfolio.html',
                'web-design.html',
                'seo.html'
            ],
            modes: {
                quick: ['baseline', 'optimization'],
                standard: ['baseline', 'load', 'optimization'],
                comprehensive: ['baseline', 'load', 'stress', 'optimization']
            }
        };
    }

    async run(mode = 'standard', options = {}) {
        console.log('🎯 PERFORMANCE TEST RUNNER\n');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`Mode: ${mode}`);
        console.log(`Base URL: ${this.config.baseUrl}`);
        console.log(`Test Pages: ${this.config.testPages.length}`);
        console.log('═══════════════════════════════════════════════════════════\n');

        const startTime = performance.now();

        try {
            // Validate test environment
            await this.validateEnvironment();

            // Configure test suites based on mode
            const testSuites = this.config.modes[mode] || this.config.modes.standard;

            // Initialize orchestrator
            const orchestrator = new PerformanceTestOrchestrator({
                baseUrl: this.config.baseUrl,
                testPages: this.config.testPages,
                testSuites: testSuites,
                parallelExecution: options.parallel || false,
                reportingLevel: 'comprehensive',
                memoryIntegration: true,
                ...options
            });

            // Execute tests
            const results = await orchestrator.orchestratePerformanceTests();

            // Display results summary
            this.displayResultsSummary(results);

            // Store in hive mind memory
            await this.storeInHiveMemory(results);

            const totalDuration = (performance.now() - startTime) / 1000;
            console.log(`\n✅ Performance testing completed in ${totalDuration.toFixed(2)} seconds`);

            return results;

        } catch (error) {
            const totalDuration = (performance.now() - startTime) / 1000;
            console.error(`\n❌ Performance testing failed after ${totalDuration.toFixed(2)} seconds:`, error.message);
            throw error;
        }
    }

    async validateEnvironment() {
        console.log('🔍 Validating test environment...\n');

        // Check if server is running
        try {
            const response = await fetch(this.config.baseUrl);
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            console.log('✅ Test server is responsive');
        } catch (error) {
            throw new Error(`Test server not available at ${this.config.baseUrl}: ${error.message}`);
        }

        // Check test pages availability
        let availablePages = 0;
        for (const page of this.config.testPages) {
            try {
                const response = await fetch(`${this.config.baseUrl}${page}`);
                if (response.ok) {
                    availablePages++;
                } else {
                    console.log(`⚠️  ${page} returned ${response.status}`);
                }
            } catch (error) {
                console.log(`⚠️  ${page} is not accessible: ${error.message}`);
            }
        }

        console.log(`📊 ${availablePages}/${this.config.testPages.length} test pages available\n`);

        if (availablePages === 0) {
            throw new Error('No test pages are accessible');
        }
    }

    displayResultsSummary(results) {
        console.log('\n' + '═'.repeat(60));
        console.log('📊 PERFORMANCE TEST RESULTS SUMMARY');
        console.log('═'.repeat(60));

        // Overall health score
        const healthScore = results.aggregatedMetrics?.overallHealthScore || 0;
        let healthStatus = 'CRITICAL';
        if (healthScore >= 90) healthStatus = 'EXCELLENT';
        else if (healthScore >= 80) healthStatus = 'GOOD';
        else if (healthScore >= 70) healthStatus = 'FAIR';
        else if (healthScore >= 60) healthStatus = 'POOR';

        console.log(`🎯 Overall Health Score: ${healthScore}/100 (${healthStatus})\n`);

        // Performance metrics
        if (results.aggregatedMetrics?.performance?.averages) {
            const perf = results.aggregatedMetrics.performance;
            console.log('⚡ Performance Metrics:');

            if (perf.averages.fcp) {
                const fcpStatus = perf.averages.fcp <= 1800 ? '🟢' : perf.averages.fcp <= 3000 ? '🟡' : '🔴';
                console.log(`   First Contentful Paint: ${perf.averages.fcp.toFixed(0)}ms ${fcpStatus}`);
            }

            if (perf.averages.lcp) {
                const lcpStatus = perf.averages.lcp <= 2500 ? '🟢' : perf.averages.lcp <= 4000 ? '🟡' : '🔴';
                console.log(`   Largest Contentful Paint: ${perf.averages.lcp.toFixed(0)}ms ${lcpStatus}`);
            }

            if (perf.averages.loadComplete) {
                const loadStatus = perf.averages.loadComplete <= 3000 ? '🟢' : perf.averages.loadComplete <= 6000 ? '🟡' : '🔴';
                console.log(`   Page Load Time: ${perf.averages.loadComplete.toFixed(0)}ms ${loadStatus}`);
            }

            console.log();
        }

        // Test suite results
        console.log('🧪 Test Suite Results:');
        Object.entries(results.testSuiteResults || {}).forEach(([suite, result]) => {
            const status = result.success ? '✅' : '❌';
            const duration = result.duration?.toFixed(2) || 'N/A';
            console.log(`   ${suite}: ${status} (${duration}s)`);
        });

        // Critical issues
        const criticalIssues = results.insights?.critical_issues?.length || 0;
        if (criticalIssues > 0) {
            console.log(`\n🚨 Critical Issues: ${criticalIssues} requiring immediate attention`);
        }

        // Scalability
        if (results.aggregatedMetrics?.scalability?.breakingPoint) {
            console.log(`\n📈 Scalability: Breaking point at ${results.aggregatedMetrics.scalability.breakingPoint} concurrent users`);
        } else if (results.aggregatedMetrics?.scalability?.maxTested) {
            console.log(`\n📈 Scalability: Handled up to ${results.aggregatedMetrics.scalability.maxTested} concurrent users`);
        }

        // Recommendations
        const highPriorityRecs = results.recommendations?.filter(r => r.priority === 'high')?.length || 0;
        if (highPriorityRecs > 0) {
            console.log(`\n💡 High Priority Recommendations: ${highPriorityRecs}`);
        }

        console.log('\n📋 Reports generated:');
        console.log('   PERFORMANCE_ORCHESTRATION_REPORT.md');
        console.log('   PERFORMANCE_EXECUTIVE_SUMMARY.md');
        console.log('   performance-orchestration-results.json');

        console.log('═'.repeat(60));
    }

    async storeInHiveMemory(results) {
        try {
            // Ensure memory directory exists
            const memoryDir = path.join(process.cwd(), 'memory');
            await fs.mkdir(memoryDir, { recursive: true });

            // Create summary for hive mind consumption
            const hiveSummary = {
                timestamp: new Date().toISOString(),
                type: 'performance_test_summary',
                orchestrationId: results.orchestrationId,
                healthScore: results.aggregatedMetrics?.overallHealthScore || 0,
                criticalIssues: results.insights?.critical_issues?.length || 0,
                testResults: {
                    performance: {
                        fcp: results.aggregatedMetrics?.performance?.averages?.fcp || 0,
                        lcp: results.aggregatedMetrics?.performance?.averages?.lcp || 0,
                        loadTime: results.aggregatedMetrics?.performance?.averages?.loadComplete || 0
                    },
                    optimization: {
                        score: results.aggregatedMetrics?.optimization?.averageScore || 0
                    },
                    scalability: {
                        breakingPoint: results.aggregatedMetrics?.scalability?.breakingPoint || null,
                        maxTested: results.aggregatedMetrics?.scalability?.maxTested || 0
                    }
                },
                recommendations: results.recommendations?.filter(r => r.priority === 'high') || [],
                status: results.aggregatedMetrics?.overallHealthScore >= 80 ? 'good' :
                       results.aggregatedMetrics?.overallHealthScore >= 60 ? 'warning' : 'critical'
            };

            // Store in hive memory
            await fs.writeFile(
                path.join(memoryDir, 'latest-performance-test.json'),
                JSON.stringify(hiveSummary, null, 2)
            );

            console.log('\n🧠 Results stored in hive mind collective memory');

        } catch (error) {
            console.error('⚠️  Could not store in hive memory:', error.message);
        }
    }

    // Quick test methods for different scenarios
    async runQuickTest() {
        console.log('🏃 Running quick performance test...\n');
        return this.run('quick', { parallelExecution: true });
    }

    async runStandardTest() {
        console.log('🚶 Running standard performance test...\n');
        return this.run('standard');
    }

    async runComprehensiveTest() {
        console.log('🚀 Running comprehensive performance test...\n');
        return this.run('comprehensive', { parallelExecution: true });
    }

    async runOptimizationValidation() {
        console.log('✨ Running optimization validation only...\n');
        return this.run('quick', { testSuites: ['optimization'] });
    }

    async runLoadTestOnly() {
        console.log('⚡ Running load test only...\n');
        return this.run('standard', { testSuites: ['load'] });
    }

    // Configuration methods
    setBaseUrl(url) {
        this.config.baseUrl = url;
        console.log(`📍 Base URL updated to: ${url}`);
    }

    addTestPage(page) {
        if (!this.config.testPages.includes(page)) {
            this.config.testPages.push(page);
            console.log(`📄 Added test page: ${page}`);
        }
    }

    removeTestPage(page) {
        const index = this.config.testPages.indexOf(page);
        if (index > -1) {
            this.config.testPages.splice(index, 1);
            console.log(`📄 Removed test page: ${page}`);
        }
    }

    // Utility methods for hive mind agents
    async getLastTestResults() {
        try {
            const memoryPath = path.join(process.cwd(), 'memory/latest-performance-test.json');
            const data = await fs.readFile(memoryPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return null;
        }
    }

    async isPerformanceGood() {
        const lastResults = await this.getLastTestResults();
        return lastResults ? lastResults.healthScore >= 80 : false;
    }

    async getCriticalIssues() {
        const lastResults = await this.getLastTestResults();
        return lastResults ? lastResults.recommendations : [];
    }

    // Static helper methods
    static async runQuick() {
        const runner = new PerformanceTestRunner();
        return runner.runQuickTest();
    }

    static async runStandard() {
        const runner = new PerformanceTestRunner();
        return runner.runStandardTest();
    }

    static async runComprehensive() {
        const runner = new PerformanceTestRunner();
        return runner.runComprehensiveTest();
    }
}

// Command line interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const runner = new PerformanceTestRunner();

    const args = process.argv.slice(2);
    const mode = args[0] || 'standard';
    const options = {};

    // Parse command line options
    if (args.includes('--parallel')) {
        options.parallelExecution = true;
    }

    if (args.includes('--quick')) {
        runner.runQuickTest().catch(console.error);
    } else if (args.includes('--comprehensive')) {
        runner.runComprehensiveTest().catch(console.error);
    } else if (args.includes('--optimization')) {
        runner.runOptimizationValidation().catch(console.error);
    } else if (args.includes('--load')) {
        runner.runLoadTestOnly().catch(console.error);
    } else {
        runner.run(mode, options).catch(console.error);
    }
}

export default PerformanceTestRunner;