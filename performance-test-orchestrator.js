#!/usr/bin/env node

/**
 * PERFORMANCE TEST ORCHESTRATOR
 * Coordinates all performance testing components for the hive mind collective intelligence system
 * Manages test execution, data collection, and integration with collective memory
 */

import PerformanceTestSuite from './performance-test-suite.js';
import StressTestAnalyzer from './stress-test-analyzer.js';
import OptimizationValidator from './optimization-validator.js';
import { performance } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';

class PerformanceTestOrchestrator {
    constructor(options = {}) {
        this.options = {
            baseUrl: options.baseUrl || 'http://localhost:4321/website/',
            testSuites: options.testSuites || ['baseline', 'load', 'stress', 'optimization'],
            parallelExecution: options.parallelExecution || false,
            reportingLevel: options.reportingLevel || 'comprehensive', // minimal, standard, comprehensive
            memoryIntegration: options.memoryIntegration !== false, // Default true
            autoRemediation: options.autoRemediation || false,
            continuousMode: options.continuousMode || false,
            ...options
        };

        this.testResults = {
            orchestrationId: this.generateOrchestrationId(),
            timestamp: new Date().toISOString(),
            configuration: this.options,
            testSuiteResults: {},
            aggregatedMetrics: {},
            insights: {},
            recommendations: [],
            executionMetrics: {},
            hiveMemoryIntegration: {}
        };

        this.testComponents = {
            performanceTestSuite: null,
            stressTestAnalyzer: null,
            optimizationValidator: null
        };

        this.executionQueue = [];
        this.isRunning = false;
    }

    async orchestratePerformanceTests() {
        console.log('🎭 PERFORMANCE TEST ORCHESTRATOR STARTING\n');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`Orchestration ID: ${this.testResults.orchestrationId}`);
        console.log(`Test Suites: ${this.options.testSuites.join(', ')}`);
        console.log(`Execution Mode: ${this.options.parallelExecution ? 'Parallel' : 'Sequential'}`);
        console.log('═══════════════════════════════════════════════════════════\n');

        const startTime = performance.now();
        this.isRunning = true;

        try {
            // Initialize test components
            await this.initializeTestComponents();

            // Load previous test data for comparison
            await this.loadHistoricalData();

            // Execute test suites based on configuration
            if (this.options.parallelExecution) {
                await this.executeTestSuitesParallel();
            } else {
                await this.executeTestSuitesSequential();
            }

            // Aggregate and analyze results
            await this.aggregateResults();

            // Generate insights and recommendations
            await this.generateInsights();

            // Integrate with hive mind collective memory
            if (this.options.memoryIntegration) {
                await this.integrateWithHiveMemory();
            }

            // Generate comprehensive reports
            await this.generateComprehensiveReports();

            // Auto-remediation if enabled
            if (this.options.autoRemediation) {
                await this.executeAutoRemediation();
            }

            const totalDuration = (performance.now() - startTime) / 1000;
            this.testResults.executionMetrics = {
                totalDuration,
                testSuitesExecuted: Object.keys(this.testResults.testSuiteResults).length,
                success: true
            };

            console.log('\n✅ PERFORMANCE TEST ORCHESTRATION COMPLETED SUCCESSFULLY');
            console.log(`Total execution time: ${totalDuration.toFixed(2)} seconds\n`);

            return this.testResults;

        } catch (error) {
            const totalDuration = (performance.now() - startTime) / 1000;
            this.testResults.executionMetrics = {
                totalDuration,
                error: error.message,
                success: false
            };

            console.error('\n❌ Performance test orchestration failed:', error.message);
            throw error;
        } finally {
            this.isRunning = false;
        }
    }

    async initializeTestComponents() {
        console.log('🔧 Initializing test components...\n');

        const componentOptions = {
            baseUrl: this.options.baseUrl,
            testPages: this.options.testPages || [
                'index.html',
                'about.html',
                'contact.html',
                'pricing.html',
                'portfolio.html'
            ]
        };

        if (this.options.testSuites.includes('baseline') || this.options.testSuites.includes('load')) {
            this.testComponents.performanceTestSuite = new PerformanceTestSuite(componentOptions);
            console.log('✅ Performance Test Suite initialized');
        }

        if (this.options.testSuites.includes('stress')) {
            this.testComponents.stressTestAnalyzer = new StressTestAnalyzer({
                ...componentOptions,
                maxConcurrentUsers: 500,
                stepSize: 25
            });
            console.log('✅ Stress Test Analyzer initialized');
        }

        if (this.options.testSuites.includes('optimization')) {
            this.testComponents.optimizationValidator = new OptimizationValidator(componentOptions);
            console.log('✅ Optimization Validator initialized');
        }

        console.log();
    }

    async loadHistoricalData() {
        console.log('📚 Loading historical test data...\n');

        try {
            // Try to load previous orchestration results
            const historicalFiles = [
                'performance-test-results.json',
                'stress-test-results.json',
                'optimization-validation-results.json',
                'orchestration-history.json'
            ];

            this.testResults.historicalData = {};

            for (const file of historicalFiles) {
                try {
                    const data = await fs.readFile(path.join(process.cwd(), file), 'utf8');
                    const parsed = JSON.parse(data);
                    this.testResults.historicalData[file] = {
                        data: parsed,
                        timestamp: parsed.timestamp || 'unknown',
                        lastModified: (await fs.stat(path.join(process.cwd(), file))).mtime
                    };
                    console.log(`✅ Loaded historical data: ${file}`);
                } catch (error) {
                    console.log(`ℹ️  No historical data found: ${file}`);
                }
            }

            console.log();

        } catch (error) {
            console.log('⚠️  Could not load historical data:', error.message);
        }
    }

    async executeTestSuitesSequential() {
        console.log('🔄 Executing test suites sequentially...\n');

        for (const suiteType of this.options.testSuites) {
            await this.executeTestSuite(suiteType);
        }
    }

    async executeTestSuitesParallel() {
        console.log('⚡ Executing test suites in parallel...\n');

        const promises = this.options.testSuites.map(suiteType =>
            this.executeTestSuite(suiteType)
        );

        const results = await Promise.allSettled(promises);

        results.forEach((result, index) => {
            const suiteType = this.options.testSuites[index];
            if (result.status === 'rejected') {
                console.error(`❌ ${suiteType} test suite failed:`, result.reason);
                this.testResults.testSuiteResults[suiteType] = {
                    error: result.reason,
                    success: false
                };
            }
        });
    }

    async executeTestSuite(suiteType) {
        console.log(`🚀 Executing ${suiteType} test suite...`);
        const startTime = performance.now();

        try {
            let result;

            switch (suiteType) {
                case 'baseline':
                case 'load':
                    if (this.testComponents.performanceTestSuite) {
                        result = await this.testComponents.performanceTestSuite.runAllTests();
                    }
                    break;

                case 'stress':
                    if (this.testComponents.stressTestAnalyzer) {
                        result = await this.testComponents.stressTestAnalyzer.runStressTestAnalysis();
                    }
                    break;

                case 'optimization':
                    if (this.testComponents.optimizationValidator) {
                        result = await this.testComponents.optimizationValidator.validateOptimizations();
                    }
                    break;

                default:
                    throw new Error(`Unknown test suite type: ${suiteType}`);
            }

            const duration = (performance.now() - startTime) / 1000;

            this.testResults.testSuiteResults[suiteType] = {
                result,
                duration,
                success: true,
                timestamp: new Date().toISOString()
            };

            console.log(`✅ ${suiteType} test suite completed in ${duration.toFixed(2)}s\n`);

        } catch (error) {
            const duration = (performance.now() - startTime) / 1000;

            this.testResults.testSuiteResults[suiteType] = {
                error: error.message,
                duration,
                success: false,
                timestamp: new Date().toISOString()
            };

            console.error(`❌ ${suiteType} test suite failed:`, error.message);
        }
    }

    async aggregateResults() {
        console.log('📊 Aggregating test results...\n');

        this.testResults.aggregatedMetrics = {
            performance: {},
            optimization: {},
            scalability: {},
            reliability: {}
        };

        // Aggregate performance metrics
        if (this.testResults.testSuiteResults.baseline?.result?.baseline) {
            const baselineResults = this.testResults.testSuiteResults.baseline.result.baseline;

            this.testResults.aggregatedMetrics.performance = this.calculateAggregatePerformanceMetrics(baselineResults);
            console.log('✅ Performance metrics aggregated');
        }

        // Aggregate optimization metrics
        if (this.testResults.testSuiteResults.optimization?.result?.optimizationChecks) {
            const optimizationResults = this.testResults.testSuiteResults.optimization.result.optimizationChecks;

            this.testResults.aggregatedMetrics.optimization = this.calculateAggregateOptimizationMetrics(optimizationResults);
            console.log('✅ Optimization metrics aggregated');
        }

        // Aggregate scalability metrics
        if (this.testResults.testSuiteResults.stress?.result?.breakingPoints) {
            const stressResults = this.testResults.testSuiteResults.stress.result.breakingPoints;

            this.testResults.aggregatedMetrics.scalability = this.calculateAggregateScalabilityMetrics(stressResults);
            console.log('✅ Scalability metrics aggregated');
        }

        // Calculate overall health score
        this.testResults.aggregatedMetrics.overallHealthScore = this.calculateOverallHealthScore();
        console.log(`📈 Overall Health Score: ${this.testResults.aggregatedMetrics.overallHealthScore}/100\n`);
    }

    calculateAggregatePerformanceMetrics(baselineResults) {
        const pages = Object.keys(baselineResults);
        const metrics = ['fcp', 'lcp', 'cls', 'loadComplete', 'totalSize'];

        const aggregated = {
            pageCount: pages.length,
            averages: {},
            medians: {},
            grades: {}
        };

        metrics.forEach(metric => {
            const values = pages
                .map(page => baselineResults[page][metric]?.avg)
                .filter(v => v !== undefined && !isNaN(v));

            if (values.length > 0) {
                aggregated.averages[metric] = values.reduce((a, b) => a + b, 0) / values.length;

                const sorted = values.slice().sort((a, b) => a - b);
                aggregated.medians[metric] = sorted[Math.floor(sorted.length / 2)];

                aggregated.grades[metric] = this.gradeMetric(metric, aggregated.averages[metric]);
            }
        });

        return aggregated;
    }

    calculateAggregateOptimizationMetrics(optimizationResults) {
        const pages = Object.keys(optimizationResults);

        const aggregated = {
            pageCount: pages.length,
            overallScores: [],
            optimizationPass: {},
            recommendations: 0
        };

        pages.forEach(page => {
            const result = optimizationResults[page];
            aggregated.overallScores.push(result.overallScore);

            Object.entries(result.checks).forEach(([optimization, check]) => {
                if (!aggregated.optimizationPass[optimization]) {
                    aggregated.optimizationPass[optimization] = { passed: 0, total: 0 };
                }

                aggregated.optimizationPass[optimization].total++;
                if (check.passed) {
                    aggregated.optimizationPass[optimization].passed++;
                }
            });
        });

        aggregated.averageScore = aggregated.overallScores.reduce((a, b) => a + b, 0) / aggregated.overallScores.length;

        return aggregated;
    }

    calculateAggregateScalabilityMetrics(stressResults) {
        const userCounts = Object.keys(stressResults).map(Number).filter(n => !isNaN(n));

        if (userCounts.length === 0) {
            return { breakingPoint: null, maxTested: 0 };
        }

        userCounts.sort((a, b) => a - b);

        // Find breaking point
        let breakingPoint = null;
        for (const userCount of userCounts) {
            const result = stressResults[userCount];
            if (result.successRate < 0.95 || result.avgResponseTime > 5000) {
                breakingPoint = userCount;
                break;
            }
        }

        const maxTested = Math.max(...userCounts);
        const maxSuccessfulThroughput = Math.max(
            ...userCounts.map(count => stressResults[count].requestsPerSecond || 0)
        );

        return {
            breakingPoint,
            maxTested,
            maxSuccessfulThroughput,
            scalabilityGrade: this.gradeScalability(breakingPoint, maxTested)
        };
    }

    calculateOverallHealthScore() {
        let totalScore = 0;
        let scoreComponents = 0;

        // Performance score (40% weight)
        if (this.testResults.aggregatedMetrics.performance.averages) {
            const performanceScore = this.calculatePerformanceScore();
            totalScore += performanceScore * 0.4;
            scoreComponents += 0.4;
        }

        // Optimization score (30% weight)
        if (this.testResults.aggregatedMetrics.optimization.averageScore) {
            totalScore += this.testResults.aggregatedMetrics.optimization.averageScore * 0.3;
            scoreComponents += 0.3;
        }

        // Scalability score (20% weight)
        if (this.testResults.aggregatedMetrics.scalability.scalabilityGrade) {
            const scalabilityScore = this.gradeToScore(this.testResults.aggregatedMetrics.scalability.scalabilityGrade);
            totalScore += scalabilityScore * 0.2;
            scoreComponents += 0.2;
        }

        // Reliability score (10% weight) - based on error rates
        const reliabilityScore = this.calculateReliabilityScore();
        totalScore += reliabilityScore * 0.1;
        scoreComponents += 0.1;

        return scoreComponents > 0 ? Math.round(totalScore / scoreComponents) : 0;
    }

    calculatePerformanceScore() {
        const metrics = this.testResults.aggregatedMetrics.performance.averages;
        let score = 100;

        // FCP scoring
        if (metrics.fcp) {
            if (metrics.fcp > 3000) score -= 20;
            else if (metrics.fcp > 1800) score -= 10;
        }

        // LCP scoring
        if (metrics.lcp) {
            if (metrics.lcp > 4000) score -= 30;
            else if (metrics.lcp > 2500) score -= 15;
        }

        // Load time scoring
        if (metrics.loadComplete) {
            if (metrics.loadComplete > 6000) score -= 25;
            else if (metrics.loadComplete > 3000) score -= 10;
        }

        return Math.max(0, score);
    }

    calculateReliabilityScore() {
        // Calculate based on error rates and test failures
        let score = 100;

        Object.values(this.testResults.testSuiteResults).forEach(suite => {
            if (!suite.success) {
                score -= 25; // Penalize test suite failures
            }
        });

        return Math.max(0, score);
    }

    async generateInsights() {
        console.log('🧠 Generating performance insights...\n');

        this.testResults.insights = {
            performance: [],
            optimization: [],
            scalability: [],
            trends: [],
            critical_issues: []
        };

        // Performance insights
        if (this.testResults.aggregatedMetrics.performance.averages) {
            this.generatePerformanceInsights();
        }

        // Optimization insights
        if (this.testResults.aggregatedMetrics.optimization) {
            this.generateOptimizationInsights();
        }

        // Scalability insights
        if (this.testResults.aggregatedMetrics.scalability) {
            this.generateScalabilityInsights();
        }

        // Historical trends
        if (this.testResults.historicalData) {
            this.generateTrendInsights();
        }

        // Consolidate recommendations
        this.consolidateRecommendations();

        console.log(`✅ Generated ${Object.values(this.testResults.insights).flat().length} insights\n`);
    }

    generatePerformanceInsights() {
        const performance = this.testResults.aggregatedMetrics.performance;

        if (performance.averages.fcp > 3000) {
            this.testResults.insights.critical_issues.push({
                type: 'performance',
                severity: 'critical',
                metric: 'First Contentful Paint',
                value: `${performance.averages.fcp.toFixed(0)}ms`,
                threshold: '1800ms',
                impact: 'Users experience significant delay before seeing content',
                recommendation: 'Optimize critical rendering path and reduce render-blocking resources'
            });
        }

        if (performance.averages.lcp > 4000) {
            this.testResults.insights.critical_issues.push({
                type: 'performance',
                severity: 'critical',
                metric: 'Largest Contentful Paint',
                value: `${performance.averages.lcp.toFixed(0)}ms`,
                threshold: '2500ms',
                impact: 'Poor user experience and SEO ranking impact',
                recommendation: 'Optimize images, implement proper lazy loading, improve server response time'
            });
        }

        // Add performance insights
        this.testResults.insights.performance.push({
            observation: `Average page load time across ${performance.pageCount} pages is ${performance.averages.loadComplete?.toFixed(0)}ms`,
            category: 'load_time',
            impact: performance.averages.loadComplete > 3000 ? 'negative' : 'positive'
        });
    }

    generateOptimizationInsights() {
        const optimization = this.testResults.aggregatedMetrics.optimization;

        this.testResults.insights.optimization.push({
            observation: `Overall optimization score: ${optimization.averageScore.toFixed(1)}/100 across ${optimization.pageCount} pages`,
            category: 'implementation',
            impact: optimization.averageScore >= 80 ? 'positive' : 'negative'
        });

        // Check specific optimization pass rates
        Object.entries(optimization.optimizationPass).forEach(([opt, data]) => {
            const passRate = (data.passed / data.total) * 100;
            if (passRate < 80) {
                this.testResults.insights.optimization.push({
                    observation: `${opt} is only implemented on ${passRate.toFixed(1)}% of pages`,
                    category: 'missing_optimization',
                    impact: 'negative',
                    recommendation: `Implement ${opt} across all pages for consistent performance`
                });
            }
        });
    }

    generateScalabilityInsights() {
        const scalability = this.testResults.aggregatedMetrics.scalability;

        if (scalability.breakingPoint) {
            this.testResults.insights.scalability.push({
                observation: `System breaks at ${scalability.breakingPoint} concurrent users`,
                category: 'capacity_limit',
                impact: 'negative',
                recommendation: 'Implement horizontal scaling and caching strategies'
            });
        } else {
            this.testResults.insights.scalability.push({
                observation: `System handled up to ${scalability.maxTested} concurrent users successfully`,
                category: 'capacity',
                impact: 'positive'
            });
        }

        this.testResults.insights.scalability.push({
            observation: `Maximum throughput: ${scalability.maxSuccessfulThroughput?.toFixed(1)} requests/second`,
            category: 'throughput',
            impact: scalability.maxSuccessfulThroughput > 10 ? 'positive' : 'negative'
        });
    }

    generateTrendInsights() {
        // Compare with historical data to identify trends
        const historical = this.testResults.historicalData;

        if (historical['performance-test-results.json']?.data?.details?.baseline) {
            const previousBaseline = historical['performance-test-results.json'].data.details.baseline;
            const currentBaseline = this.testResults.testSuiteResults.baseline?.result?.baseline;

            if (currentBaseline) {
                const trends = this.calculatePerformanceTrends(previousBaseline, currentBaseline);
                this.testResults.insights.trends.push(...trends);
            }
        }
    }

    calculatePerformanceTrends(previous, current) {
        const trends = [];
        const commonPages = Object.keys(previous).filter(page => current[page]);

        commonPages.forEach(page => {
            const prevFCP = previous[page].fcp?.avg;
            const currFCP = current[page].fcp?.avg;

            if (prevFCP && currFCP) {
                const change = ((currFCP - prevFCP) / prevFCP) * 100;
                if (Math.abs(change) > 10) {
                    trends.push({
                        page,
                        metric: 'FCP',
                        change: `${change.toFixed(1)}%`,
                        direction: change > 0 ? 'worsened' : 'improved',
                        impact: change > 0 ? 'negative' : 'positive'
                    });
                }
            }
        });

        return trends;
    }

    consolidateRecommendations() {
        // Collect all recommendations from test suites
        Object.values(this.testResults.testSuiteResults).forEach(suite => {
            if (suite.result?.recommendations) {
                this.testResults.recommendations.push(...suite.result.recommendations);
            }
        });

        // Add recommendations from insights
        Object.values(this.testResults.insights).flat().forEach(insight => {
            if (insight.recommendation) {
                this.testResults.recommendations.push({
                    type: insight.category,
                    priority: insight.impact === 'negative' ? 'high' : 'medium',
                    description: insight.observation,
                    recommendation: insight.recommendation
                });
            }
        });

        // Deduplicate and prioritize
        this.testResults.recommendations = this.deduplicateRecommendations(this.testResults.recommendations);
    }

    deduplicateRecommendations(recommendations) {
        const seen = new Set();
        return recommendations.filter(rec => {
            const key = `${rec.type}-${rec.description}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    async integrateWithHiveMemory() {
        console.log('🧠 Integrating with hive mind collective memory...\n');

        try {
            // Ensure memory directory exists
            const memoryDir = path.join(process.cwd(), 'memory');
            await fs.mkdir(memoryDir, { recursive: true });

            // Store test results in collective memory
            const memoryEntry = {
                orchestrationId: this.testResults.orchestrationId,
                timestamp: this.testResults.timestamp,
                type: 'performance_test_orchestration',
                data: {
                    aggregatedMetrics: this.testResults.aggregatedMetrics,
                    insights: this.testResults.insights,
                    recommendations: this.testResults.recommendations,
                    overallHealthScore: this.testResults.aggregatedMetrics.overallHealthScore,
                    executionMetrics: this.testResults.executionMetrics
                },
                metadata: {
                    testSuites: this.options.testSuites,
                    executionMode: this.options.parallelExecution ? 'parallel' : 'sequential',
                    pagesTested: this.options.testPages?.length || 0
                }
            };

            // Store in collective memory
            await fs.writeFile(
                path.join(memoryDir, `orchestration-${this.testResults.orchestrationId}.json`),
                JSON.stringify(memoryEntry, null, 2)
            );

            // Update orchestration history
            await this.updateOrchestrationHistory(memoryEntry);

            this.testResults.hiveMemoryIntegration = {
                stored: true,
                memoryEntryId: memoryEntry.orchestrationId,
                timestamp: memoryEntry.timestamp
            };

            console.log('✅ Test results integrated with hive mind collective memory');
            console.log(`📁 Memory entry ID: ${memoryEntry.orchestrationId}\n`);

        } catch (error) {
            console.error('❌ Failed to integrate with hive mind memory:', error.message);
            this.testResults.hiveMemoryIntegration = {
                stored: false,
                error: error.message
            };
        }
    }

    async updateOrchestrationHistory(memoryEntry) {
        const historyFile = path.join(process.cwd(), 'orchestration-history.json');

        let history = [];
        try {
            const data = await fs.readFile(historyFile, 'utf8');
            history = JSON.parse(data);
        } catch (error) {
            // File doesn't exist, start with empty history
        }

        // Add new entry and keep last 50 orchestrations
        history.unshift({
            orchestrationId: memoryEntry.orchestrationId,
            timestamp: memoryEntry.timestamp,
            overallHealthScore: memoryEntry.data.overallHealthScore,
            testSuites: memoryEntry.metadata.testSuites,
            duration: memoryEntry.data.executionMetrics?.totalDuration
        });

        history = history.slice(0, 50);

        await fs.writeFile(historyFile, JSON.stringify(history, null, 2));
    }

    async generateComprehensiveReports() {
        console.log('📊 Generating comprehensive orchestration reports...\n');

        // Generate master orchestration report
        const masterReport = this.generateMasterReport();
        await fs.writeFile(
            path.join(process.cwd(), 'PERFORMANCE_ORCHESTRATION_REPORT.md'),
            masterReport
        );

        // Generate executive summary
        const executiveSummary = this.generateExecutiveSummary();
        await fs.writeFile(
            path.join(process.cwd(), 'PERFORMANCE_EXECUTIVE_SUMMARY.md'),
            executiveSummary
        );

        // Generate detailed JSON report
        await fs.writeFile(
            path.join(process.cwd(), 'performance-orchestration-results.json'),
            JSON.stringify(this.testResults, null, 2)
        );

        console.log('✅ Comprehensive reports generated:');
        console.log('  📋 PERFORMANCE_ORCHESTRATION_REPORT.md (detailed analysis)');
        console.log('  📄 PERFORMANCE_EXECUTIVE_SUMMARY.md (executive overview)');
        console.log('  📊 performance-orchestration-results.json (raw data)\n');
    }

    generateMasterReport() {
        let report = `# Performance Test Orchestration Report\n\n`;
        report += `**Orchestration ID:** ${this.testResults.orchestrationId}\n`;
        report += `**Generated:** ${this.testResults.timestamp}\n`;
        report += `**Overall Health Score:** ${this.testResults.aggregatedMetrics.overallHealthScore}/100\n\n`;

        // Executive Summary
        report += `## Executive Summary\n\n`;
        report += this.generateExecutiveSummaryText() + '\n\n';

        // Test Suite Results
        report += `## Test Suite Results\n\n`;
        Object.entries(this.testResults.testSuiteResults).forEach(([suite, result]) => {
            const status = result.success ? '✅' : '❌';
            const duration = result.duration?.toFixed(2) || 'N/A';
            report += `- **${suite}**: ${status} (${duration}s)\n`;
        });
        report += '\n';

        // Performance Metrics
        if (this.testResults.aggregatedMetrics.performance.averages) {
            report += `## Performance Metrics\n\n`;
            report += `| Metric | Average | Grade |\n`;
            report += `|--------|---------|-------|\n`;

            const perf = this.testResults.aggregatedMetrics.performance;
            Object.entries(perf.averages).forEach(([metric, value]) => {
                const formattedValue = this.formatMetricValue(metric, value);
                const grade = perf.grades[metric] || 'N/A';
                report += `| ${metric.toUpperCase()} | ${formattedValue} | ${grade} |\n`;
            });
            report += '\n';
        }

        // Critical Issues
        if (this.testResults.insights.critical_issues.length > 0) {
            report += `## Critical Issues\n\n`;
            this.testResults.insights.critical_issues.forEach(issue => {
                report += `- **${issue.metric}**: ${issue.value} (threshold: ${issue.threshold})\n`;
                report += `  - Impact: ${issue.impact}\n`;
                report += `  - Recommendation: ${issue.recommendation}\n\n`;
            });
        }

        // Recommendations
        if (this.testResults.recommendations.length > 0) {
            report += `## Recommendations\n\n`;
            const priorities = ['high', 'medium', 'low'];

            priorities.forEach(priority => {
                const recs = this.testResults.recommendations.filter(r => r.priority === priority);
                if (recs.length > 0) {
                    report += `### ${priority.toUpperCase()} Priority\n\n`;
                    recs.forEach(rec => {
                        report += `- ${rec.description}: ${rec.recommendation}\n`;
                    });
                    report += '\n';
                }
            });
        }

        return report;
    }

    generateExecutiveSummary() {
        let summary = `# Performance Executive Summary\n\n`;
        summary += `**Date:** ${new Date().toLocaleDateString()}\n`;
        summary += `**Overall Health Score:** ${this.testResults.aggregatedMetrics.overallHealthScore}/100\n\n`;

        summary += this.generateExecutiveSummaryText();

        return summary;
    }

    generateExecutiveSummaryText() {
        let text = '';

        const healthScore = this.testResults.aggregatedMetrics.overallHealthScore;
        let healthGrade = 'Poor';
        if (healthScore >= 90) healthGrade = 'Excellent';
        else if (healthScore >= 80) healthGrade = 'Good';
        else if (healthScore >= 70) healthGrade = 'Fair';

        text += `## Overall Assessment: ${healthGrade} (${healthScore}/100)\n\n`;

        // Performance summary
        if (this.testResults.aggregatedMetrics.performance.averages) {
            const avgFCP = this.testResults.aggregatedMetrics.performance.averages.fcp;
            const avgLCP = this.testResults.aggregatedMetrics.performance.averages.lcp;

            text += `### Performance Highlights\n`;
            text += `- Average First Contentful Paint: ${avgFCP?.toFixed(0)}ms\n`;
            text += `- Average Largest Contentful Paint: ${avgLCP?.toFixed(0)}ms\n`;
            text += `- Pages tested: ${this.testResults.aggregatedMetrics.performance.pageCount}\n\n`;
        }

        // Critical issues count
        const criticalIssues = this.testResults.insights.critical_issues.length;
        if (criticalIssues > 0) {
            text += `### Immediate Attention Required\n`;
            text += `${criticalIssues} critical performance issues identified that require immediate remediation.\n\n`;
        }

        // Scalability summary
        if (this.testResults.aggregatedMetrics.scalability.breakingPoint) {
            text += `### Scalability Concerns\n`;
            text += `System capacity limited to ${this.testResults.aggregatedMetrics.scalability.breakingPoint} concurrent users.\n\n`;
        }

        return text;
    }

    async executeAutoRemediation() {
        console.log('🔧 Executing auto-remediation...\n');

        // This would implement automatic fixes based on the recommendations
        // For now, we'll just log what would be done

        const highPriorityRecs = this.testResults.recommendations.filter(r => r.priority === 'high');

        if (highPriorityRecs.length > 0) {
            console.log('🔧 Auto-remediation would address:');
            highPriorityRecs.forEach(rec => {
                console.log(`  - ${rec.description}`);
            });
            console.log('\n⚠️  Auto-remediation is not implemented yet - manual intervention required\n');
        } else {
            console.log('✅ No high-priority issues requiring auto-remediation\n');
        }
    }

    // Utility methods
    generateOrchestrationId() {
        return `orch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    gradeMetric(metric, value) {
        const thresholds = {
            fcp: { good: 1800, poor: 3000 },
            lcp: { good: 2500, poor: 4000 },
            cls: { good: 0.1, poor: 0.25 },
            loadComplete: { good: 3000, poor: 6000 }
        };

        const threshold = thresholds[metric];
        if (!threshold) return 'N/A';

        if (value <= threshold.good) return 'A';
        if (value <= threshold.poor) return 'B';
        return 'C';
    }

    gradeScalability(breakingPoint, maxTested) {
        if (!breakingPoint) {
            if (maxTested >= 500) return 'A';
            if (maxTested >= 200) return 'B';
            return 'C';
        }

        if (breakingPoint >= 500) return 'A';
        if (breakingPoint >= 200) return 'B';
        if (breakingPoint >= 50) return 'C';
        return 'D';
    }

    gradeToScore(grade) {
        const scores = { A: 95, B: 85, C: 75, D: 60 };
        return scores[grade] || 0;
    }

    formatMetricValue(metric, value) {
        if (metric.includes('time') || metric === 'fcp' || metric === 'lcp') {
            return `${value.toFixed(0)}ms`;
        }
        if (metric === 'cls') {
            return value.toFixed(3);
        }
        if (metric === 'totalSize') {
            return `${(value / 1024).toFixed(1)}KB`;
        }
        return value.toFixed(1);
    }
}

export default PerformanceTestOrchestrator;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const orchestrator = new PerformanceTestOrchestrator({
        testSuites: process.argv.includes('--stress')
            ? ['baseline', 'load', 'stress', 'optimization']
            : ['baseline', 'optimization'],
        parallelExecution: process.argv.includes('--parallel'),
        reportingLevel: 'comprehensive'
    });

    orchestrator.orchestratePerformanceTests().catch(console.error);
}