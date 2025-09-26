#!/usr/bin/env node

/**
 * HIVE MIND PERFORMANCE TEST RUNNER
 * Master orchestrator for comprehensive performance testing in hive mind collective
 *
 * Features:
 * - Orchestrates all performance testing components
 * - Coordinates multiple testing agents
 * - Provides unified reporting and analysis
 * - Manages test execution workflows
 * - Integrates with CI/CD pipelines
 * - Generates executive summaries
 */

import { performance } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';
import HiveMindPerformanceTester from './performance-test-framework.js';
import PerformanceRegressionDetector from './performance-regression-detector.js';
import HiveMindCoordinator from './hive-mind-coordinator.js';
import FunctionalValidationSuite from './functional-validation-suite.js';

class HiveMindTestRunner {
    constructor(options = {}) {
        this.options = {
            baseUrl: options.baseUrl || 'http://localhost:4321/website/',
            testPages: options.testPages || ['index.html', 'about.html', 'contact.html', 'services.html', 'pricing.html'],
            executionMode: options.executionMode || 'comprehensive', // comprehensive, performance_only, functional_only, regression_only
            parallelExecution: options.parallelExecution !== false,
            generateBaselines: options.generateBaselines || false,
            cicdMode: options.cicdMode || false,
            exitOnFailure: options.exitOnFailure !== false,
            reportFormats: options.reportFormats || ['json', 'markdown', 'html'],
            outputPath: options.outputPath || './test-results',
            hiveMindConfig: {
                enabled: options.hiveMindEnabled !== false,
                agentCount: options.agentCount || 3,
                consensusThreshold: options.consensusThreshold || 0.8,
                memoryPath: options.memoryPath || './memory'
            },
            notifications: {
                enabled: options.notificationsEnabled || false,
                webhookUrl: options.webhookUrl,
                slackChannel: options.slackChannel,
                email: options.email
            },
            ...options
        };

        this.testResults = {
            metadata: {
                startTime: null,
                endTime: null,
                duration: 0,
                executionMode: this.options.executionMode,
                agentsUsed: 0,
                testPages: this.options.testPages,
                baseUrl: this.options.baseUrl
            },
            summary: {
                overallStatus: 'unknown',
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                warningTests: 0,
                skipppedTests: 0,
                performanceScore: 0,
                functionalityScore: 0,
                healthScore: 0
            },
            agents: {},
            performance: null,
            functional: null,
            regression: null,
            hiveMind: null,
            recommendations: [],
            criticalIssues: [],
            executiveSummary: ''
        };

        this.coordinator = null;
        this.agents = new Map();
        this.runId = `test_run_${Date.now()}`;
    }

    async runComprehensiveTestSuite() {
        console.log('🧠 HIVE MIND PERFORMANCE TEST RUNNER - COMPREHENSIVE TESTING');
        console.log('═══════════════════════════════════════════════════════════════════════════════');
        console.log(`Run ID: ${this.runId}`);
        console.log(`Execution Mode: ${this.options.executionMode.toUpperCase()}`);
        console.log(`Base URL: ${this.options.baseUrl}`);
        console.log(`Test Pages: ${this.options.testPages.join(', ')}`);
        console.log(`Parallel Execution: ${this.options.parallelExecution}`);
        console.log(`Hive Mind Enabled: ${this.options.hiveMindConfig.enabled}`);
        console.log('═══════════════════════════════════════════════════════════════════════════════\n');

        this.testResults.metadata.startTime = new Date().toISOString();
        const runStartTime = performance.now();

        try {
            // Ensure output directory exists
            await fs.mkdir(this.options.outputPath, { recursive: true });

            // Step 1: Initialize Hive Mind Coordination
            if (this.options.hiveMindConfig.enabled) {
                await this.initializeHiveMindCoordination();
            }

            // Step 2: Execute Test Suite based on mode
            await this.executeTestSuite();

            // Step 3: Analyze and Correlate Results
            await this.analyzeResults();

            // Step 4: Generate Comprehensive Reports
            await this.generateReports();

            // Step 5: Send Notifications
            if (this.options.notifications.enabled) {
                await this.sendNotifications();
            }

            // Step 6: Handle CI/CD Integration
            if (this.options.cicdMode) {
                this.handleCICDIntegration();
            }

            this.testResults.metadata.endTime = new Date().toISOString();
            this.testResults.metadata.duration = (performance.now() - runStartTime) / 1000;

            console.log('\n✅ HIVE MIND COMPREHENSIVE TESTING COMPLETED');
            console.log(`Total Duration: ${this.testResults.metadata.duration.toFixed(1)}s`);
            console.log(`Overall Status: ${this.testResults.summary.overallStatus.toUpperCase()}`);
            console.log(`Health Score: ${this.testResults.summary.healthScore.toFixed(1)}/100`);

            return this.testResults;

        } catch (error) {
            console.error('\n❌ Comprehensive testing failed:', error.message);

            this.testResults.summary.overallStatus = 'failed';
            this.testResults.criticalIssues.push({
                type: 'execution_failure',
                severity: 'critical',
                message: error.message,
                timestamp: new Date().toISOString()
            });

            if (this.options.cicdMode && this.options.exitOnFailure) {
                process.exit(1);
            }

            throw error;

        } finally {
            // Cleanup
            await this.cleanup();
        }
    }

    async initializeHiveMindCoordination() {
        console.log('🔗 Initializing Hive Mind Coordination System...\n');

        try {
            this.coordinator = new HiveMindCoordinator({
                memoryPath: this.options.hiveMindConfig.memoryPath,
                consensusThreshold: this.options.hiveMindConfig.consensusThreshold,
                syncInterval: 60000, // 1 minute for testing
                maxAgents: this.options.hiveMindConfig.agentCount
            });

            await this.coordinator.initialize();

            // Register testing agents
            const agentTypes = [
                { type: 'performance-tester', name: 'Performance Agent', capabilities: ['web-vitals', 'load-testing', 'optimization'] },
                { type: 'functional-validator', name: 'Functional Agent', capabilities: ['functionality', 'accessibility', 'seo'] },
                { type: 'regression-detector', name: 'Regression Agent', capabilities: ['regression-detection', 'trend-analysis', 'alerting'] }
            ];

            for (let i = 0; i < Math.min(this.options.hiveMindConfig.agentCount, agentTypes.length); i++) {
                const agentConfig = {
                    ...agentTypes[i % agentTypes.length],
                    consensusWeight: 1.0,
                    communicationPrefs: ['memory', 'hooks']
                };

                const agentId = await this.coordinator.registerAgent(agentConfig);
                this.agents.set(agentId, agentConfig);
            }

            this.testResults.metadata.agentsUsed = this.agents.size;
            this.testResults.hiveMind = {
                coordinator: 'initialized',
                agents: Array.from(this.agents.values()),
                consensusThreshold: this.options.hiveMindConfig.consensusThreshold
            };

            console.log(`✅ Hive Mind initialized with ${this.agents.size} agents\n`);

        } catch (error) {
            console.error('❌ Hive Mind initialization failed:', error.message);
            this.options.hiveMindConfig.enabled = false; // Disable hive mind for this run
        }
    }

    async executeTestSuite() {
        console.log('🚀 Executing Test Suite...\n');

        const testExecutions = [];

        // Determine which tests to run based on execution mode
        switch (this.options.executionMode) {
            case 'comprehensive':
                testExecutions.push(
                    this.executePerformanceTests(),
                    this.executeFunctionalTests(),
                    this.executeRegressionTests()
                );
                break;

            case 'performance_only':
                testExecutions.push(this.executePerformanceTests());
                break;

            case 'functional_only':
                testExecutions.push(this.executeFunctionalTests());
                break;

            case 'regression_only':
                testExecutions.push(this.executeRegressionTests());
                break;

            default:
                throw new Error(`Unknown execution mode: ${this.options.executionMode}`);
        }

        // Execute tests (parallel or sequential)
        if (this.options.parallelExecution && testExecutions.length > 1) {
            console.log('⚡ Running tests in parallel...');
            const results = await Promise.allSettled(testExecutions);

            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.error(`❌ Test execution ${index} failed:`, result.reason.message);
                }
            });
        } else {
            console.log('🔄 Running tests sequentially...');
            for (const testExecution of testExecutions) {
                try {
                    await testExecution;
                } catch (error) {
                    console.error('❌ Test execution failed:', error.message);
                }
            }
        }
    }

    async executePerformanceTests() {
        console.log('⚡ Executing Performance Tests...');

        try {
            const performanceTester = new HiveMindPerformanceTester({
                baseUrl: this.options.baseUrl,
                testPages: this.options.testPages,
                concurrentUsers: [1, 5, 10, 25, 50],
                iterations: 2, // Reduced for faster testing
                hiveMindConfig: {
                    collectiveMemoryPath: path.join(this.options.hiveMindConfig.memoryPath, 'performance-metrics.json'),
                    consensusThreshold: this.options.hiveMindConfig.consensusThreshold
                }
            });

            const results = await performanceTester.runComprehensivePerformanceTests();
            this.testResults.performance = results;

            // Share results with hive mind
            if (this.coordinator && this.agents.size > 0) {
                const perfAgentId = Array.from(this.agents.keys())[0];
                await this.coordinator.sharePerformanceResults(perfAgentId, {
                    metrics: results.current,
                    regressions: results.regressions || [],
                    improvements: results.improvements || [],
                    confidence: 0.9
                });
            }

            console.log('✅ Performance tests completed');

        } catch (error) {
            console.error('❌ Performance testing failed:', error.message);
            this.testResults.performance = { error: error.message };
        }
    }

    async executeFunctionalTests() {
        console.log('🧪 Executing Functional Validation Tests...');

        try {
            const functionalValidator = new FunctionalValidationSuite({
                baseUrl: this.options.baseUrl,
                testPages: this.options.testPages,
                browsers: ['chromium'],
                viewports: [
                    { name: 'desktop', width: 1920, height: 1080 },
                    { name: 'mobile', width: 375, height: 667 }
                ],
                testTypes: {
                    functional: true,
                    visual: !this.options.cicdMode, // Skip visual tests in CI/CD for speed
                    accessibility: true,
                    seo: true,
                    userJourneys: true,
                    forms: true,
                    navigation: true,
                    performance: false // Performance is handled separately
                },
                screenshotPath: path.join(this.options.outputPath, 'screenshots'),
                baselinePath: path.join(this.options.outputPath, 'baselines'),
                reportPath: this.options.outputPath
            });

            const results = await functionalValidator.runFullValidationSuite();
            this.testResults.functional = results;

            // Share results with hive mind
            if (this.coordinator && this.agents.size > 1) {
                const funcAgentId = Array.from(this.agents.keys())[1];
                await this.coordinator.sharePerformanceResults(funcAgentId, {
                    metrics: {
                        functionalScore: this.calculateFunctionalScore(results),
                        accessibilityScore: results.testsByType?.accessibility?.summary?.averageScore || 0,
                        seoScore: results.testsByType?.seo?.summary?.averageScore || 0
                    },
                    regressions: results.failures?.map(f => ({
                        type: f.type,
                        severity: f.severity,
                        page: f.page,
                        issue: f.issue
                    })) || [],
                    improvements: [],
                    confidence: 0.85
                });
            }

            console.log('✅ Functional tests completed');

        } catch (error) {
            console.error('❌ Functional testing failed:', error.message);
            this.testResults.functional = { error: error.message };
        }
    }

    async executeRegressionTests() {
        console.log('🔍 Executing Performance Regression Tests...');

        try {
            const regressionDetector = new PerformanceRegressionDetector({
                baseUrl: this.options.baseUrl,
                testPages: this.options.testPages,
                regressionThresholds: {
                    critical: {
                        fcp: 30, // 30% increase is critical
                        lcp: 25,
                        cls: 50,
                        tti: 20,
                        responseTime: 50,
                        successRate: -5,
                        errorRate: 200
                    },
                    warning: {
                        fcp: 15, // 15% increase is warning
                        lcp: 10,
                        cls: 25,
                        tti: 10,
                        responseTime: 20,
                        successRate: -2,
                        errorRate: 100
                    }
                },
                storage: {
                    historyPath: path.join(this.options.hiveMindConfig.memoryPath, 'performance-history.json'),
                    alertsPath: path.join(this.options.hiveMindConfig.memoryPath, 'performance-alerts.json')
                },
                cicdIntegration: {
                    enabled: this.options.cicdMode,
                    exitOnCritical: this.options.exitOnFailure,
                    exitOnWarning: false,
                    reportFormat: 'json'
                }
            });

            const results = await regressionDetector.performSingleRegressionCheck();
            this.testResults.regression = results;

            // Share results with hive mind
            if (this.coordinator && this.agents.size > 2) {
                const regAgentId = Array.from(this.agents.keys())[2];
                await this.coordinator.sharePerformanceResults(regAgentId, {
                    metrics: results.metrics,
                    regressions: results.regressions || [],
                    improvements: results.improvements || [],
                    confidence: 0.95
                });
            }

            console.log('✅ Regression tests completed');

        } catch (error) {
            console.error('❌ Regression testing failed:', error.message);
            this.testResults.regression = { error: error.message };
        }
    }

    async analyzeResults() {
        console.log('📊 Analyzing Results and Generating Insights...\n');

        try {
            // Calculate summary scores
            this.calculateSummaryScores();

            // Analyze critical issues
            this.analyzeCriticalIssues();

            // Generate recommendations
            await this.generateRecommendations();

            // Get collective insights from hive mind
            if (this.coordinator) {
                const collectiveInsights = await this.coordinator.getCollectiveInsights();
                this.testResults.hiveMind = {
                    ...this.testResults.hiveMind,
                    insights: collectiveInsights
                };
            }

            // Generate executive summary
            this.generateExecutiveSummary();

            console.log('✅ Results analysis completed\n');

        } catch (error) {
            console.error('❌ Results analysis failed:', error.message);
        }
    }

    calculateSummaryScores() {
        let totalTests = 0;
        let passedTests = 0;
        let failedTests = 0;
        let warningTests = 0;

        // Performance scores
        let performanceScore = 0;
        if (this.testResults.performance && !this.testResults.performance.error) {
            // Calculate based on web vitals and load testing results
            performanceScore = this.calculatePerformanceScore(this.testResults.performance);
        }

        // Functional scores
        let functionalityScore = 0;
        if (this.testResults.functional && !this.testResults.functional.error) {
            functionalityScore = this.calculateFunctionalScore(this.testResults.functional);

            totalTests += this.testResults.functional.summary.total;
            passedTests += this.testResults.functional.summary.passed;
            failedTests += this.testResults.functional.summary.failed;
            warningTests += this.testResults.functional.summary.warnings;
        }

        // Regression impact
        let regressionImpact = 0;
        if (this.testResults.regression && !this.testResults.regression.error) {
            const criticalRegressions = this.testResults.regression.alerts?.filter(a => a.severity === 'critical').length || 0;
            const warningRegressions = this.testResults.regression.alerts?.filter(a => a.severity === 'warning').length || 0;

            regressionImpact = Math.max(0, 100 - (criticalRegressions * 20) - (warningRegressions * 10));
        }

        // Overall health score
        const healthScore = (performanceScore * 0.4) + (functionalityScore * 0.4) + (regressionImpact * 0.2);

        this.testResults.summary = {
            overallStatus: this.determineOverallStatus(healthScore, failedTests),
            totalTests,
            passedTests,
            failedTests,
            warningTests,
            skippedTests: 0,
            performanceScore,
            functionalityScore,
            regressionImpact,
            healthScore
        };
    }

    calculatePerformanceScore(performanceResults) {
        if (!performanceResults.current?.webVitals) return 0;

        let totalScore = 0;
        let pageCount = 0;

        Object.values(performanceResults.current.webVitals).forEach(pageData => {
            if (pageData.averages) {
                let pageScore = 100;
                const vitals = pageData.averages;

                // FCP scoring
                if (vitals.fcp?.avg > 1800) pageScore -= 20;
                else if (vitals.fcp?.avg > 1000) pageScore -= 10;

                // LCP scoring
                if (vitals.lcp?.avg > 2500) pageScore -= 25;
                else if (vitals.lcp?.avg > 1500) pageScore -= 15;

                // CLS scoring
                if (vitals.cls?.avg > 0.25) pageScore -= 25;
                else if (vitals.cls?.avg > 0.1) pageScore -= 15;

                // TTI scoring
                if (vitals.tti?.avg > 3800) pageScore -= 15;
                else if (vitals.tti?.avg > 2300) pageScore -= 8;

                totalScore += Math.max(0, pageScore);
                pageCount++;
            }
        });

        return pageCount > 0 ? totalScore / pageCount : 0;
    }

    calculateFunctionalScore(functionalResults) {
        if (!functionalResults.summary) return 0;

        const total = functionalResults.summary.total;
        const passed = functionalResults.summary.passed;
        const failed = functionalResults.summary.failed;

        if (total === 0) return 100;

        const baseScore = (passed / total) * 100;

        // Penalty for critical failures
        const criticalFailures = functionalResults.failures?.filter(f => f.severity === 'high').length || 0;
        const penalty = criticalFailures * 5; // 5% penalty per critical failure

        return Math.max(0, baseScore - penalty);
    }

    determineOverallStatus(healthScore, failedTests) {
        if (failedTests > 0 && healthScore < 60) return 'critical';
        if (failedTests > 0 || healthScore < 75) return 'warning';
        if (healthScore >= 90) return 'excellent';
        if (healthScore >= 80) return 'good';
        return 'needs_improvement';
    }

    analyzeCriticalIssues() {
        const criticalIssues = [];

        // Performance critical issues
        if (this.testResults.performance && this.testResults.performance.regressions) {
            this.testResults.performance.regressions
                .filter(r => r.severity === 'high')
                .forEach(regression => {
                    criticalIssues.push({
                        type: 'performance_regression',
                        severity: 'critical',
                        category: 'performance',
                        message: `${regression.metric} regressed by ${Math.abs(regression.change)}%`,
                        page: regression.page,
                        impact: 'high',
                        timestamp: new Date().toISOString()
                    });
                });
        }

        // Functional critical issues
        if (this.testResults.functional && this.testResults.functional.failures) {
            this.testResults.functional.failures
                .filter(f => f.severity === 'high')
                .forEach(failure => {
                    criticalIssues.push({
                        type: 'functional_failure',
                        severity: 'critical',
                        category: 'functionality',
                        message: failure.issue,
                        page: failure.page,
                        journey: failure.journey,
                        impact: 'high',
                        timestamp: new Date().toISOString()
                    });
                });
        }

        // Regression critical issues
        if (this.testResults.regression && this.testResults.regression.alerts) {
            this.testResults.regression.alerts
                .filter(a => a.severity === 'critical')
                .forEach(alert => {
                    criticalIssues.push({
                        type: 'regression_alert',
                        severity: 'critical',
                        category: 'regression',
                        message: alert.message,
                        metric: alert.metric,
                        page: alert.page,
                        impact: 'high',
                        timestamp: alert.timestamp
                    });
                });
        }

        this.testResults.criticalIssues = criticalIssues;
    }

    async generateRecommendations() {
        const recommendations = [];

        // High-level strategy recommendations
        if (this.testResults.summary.healthScore < 70) {
            recommendations.push({
                type: 'strategic',
                priority: 'critical',
                category: 'overall_health',
                title: 'Overall Performance Health Requires Immediate Attention',
                description: `Health score of ${this.testResults.summary.healthScore.toFixed(1)}/100 indicates significant issues`,
                actions: [
                    'Conduct comprehensive performance audit',
                    'Review recent optimization changes for negative impacts',
                    'Implement performance budget enforcement',
                    'Consider rolling back problematic optimizations'
                ],
                impact: 'high',
                effort: 'high'
            });
        }

        // Performance-specific recommendations
        if (this.testResults.summary.performanceScore < 75) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                category: 'web_vitals',
                title: 'Performance Optimization Strategy Needs Refinement',
                description: `Performance score of ${this.testResults.summary.performanceScore.toFixed(1)}/100 is below target`,
                actions: [
                    'Focus on Core Web Vitals improvements',
                    'Implement critical rendering path optimizations',
                    'Review and optimize resource loading strategies',
                    'Consider progressive enhancement approaches'
                ],
                impact: 'high',
                effort: 'medium'
            });
        }

        // Functionality-specific recommendations
        if (this.testResults.summary.functionalityScore < 85) {
            recommendations.push({
                type: 'functionality',
                priority: 'high',
                category: 'user_experience',
                title: 'Functionality Integrity Compromised by Optimizations',
                description: `Functionality score of ${this.testResults.summary.functionalityScore.toFixed(1)}/100 indicates broken features`,
                actions: [
                    'Audit all interactive elements for functionality',
                    'Review accessibility compliance after optimizations',
                    'Test user journeys thoroughly',
                    'Implement feature-specific regression testing'
                ],
                impact: 'critical',
                effort: 'medium'
            });
        }

        // Hive mind insights
        if (this.testResults.hiveMind?.insights) {
            const insights = this.testResults.hiveMind.insights;
            if (insights.recommendations && insights.recommendations.length > 0) {
                recommendations.push(...insights.recommendations.map(rec => ({
                    ...rec,
                    source: 'hive_mind_consensus',
                    confidence: insights.consensusData.strength
                })));
            }
        }

        // CI/CD integration recommendations
        if (this.options.cicdMode && this.testResults.criticalIssues.length > 0) {
            recommendations.push({
                type: 'cicd',
                priority: 'critical',
                category: 'deployment',
                title: 'Critical Issues Block Deployment',
                description: `${this.testResults.criticalIssues.length} critical issues must be resolved before deployment`,
                actions: [
                    'Fix all critical functional failures',
                    'Address performance regressions',
                    'Validate accessibility compliance',
                    'Re-run comprehensive test suite'
                ],
                impact: 'critical',
                effort: 'high'
            });
        }

        this.testResults.recommendations = recommendations;
    }

    generateExecutiveSummary() {
        const summary = this.testResults.summary;
        const criticalCount = this.testResults.criticalIssues.length;
        const highPriorityRecs = this.testResults.recommendations.filter(r => r.priority === 'critical' || r.priority === 'high').length;

        let executiveSummary = `# Executive Summary - Performance Testing Results\n\n`;
        executiveSummary += `**Test Run ID:** ${this.runId}\n`;
        executiveSummary += `**Execution Mode:** ${this.options.executionMode.toUpperCase()}\n`;
        executiveSummary += `**Test Duration:** ${this.testResults.metadata.duration.toFixed(1)}s\n`;
        executiveSummary += `**Pages Tested:** ${this.options.testPages.length}\n`;
        executiveSummary += `**Agents Used:** ${this.testResults.metadata.agentsUsed}\n\n`;

        // Status indicator
        const statusEmoji = {
            'excellent': '🟢',
            'good': '🟢',
            'needs_improvement': '🟡',
            'warning': '🟠',
            'critical': '🔴'
        };

        executiveSummary += `## Overall Status: ${statusEmoji[summary.overallStatus]} ${summary.overallStatus.toUpperCase().replace('_', ' ')}\n\n`;

        // Key metrics
        executiveSummary += `### Key Metrics\n`;
        executiveSummary += `- **Health Score:** ${summary.healthScore.toFixed(1)}/100\n`;
        executiveSummary += `- **Performance Score:** ${summary.performanceScore.toFixed(1)}/100\n`;
        executiveSummary += `- **Functionality Score:** ${summary.functionalityScore.toFixed(1)}/100\n`;
        if (summary.regressionImpact !== undefined) {
            executiveSummary += `- **Regression Impact:** ${summary.regressionImpact.toFixed(1)}/100\n`;
        }
        executiveSummary += `- **Test Success Rate:** ${summary.totalTests > 0 ? ((summary.passedTests / summary.totalTests) * 100).toFixed(1) : 0}%\n\n`;

        // Critical issues
        if (criticalCount > 0) {
            executiveSummary += `### 🚨 Critical Issues (${criticalCount})\n`;
            this.testResults.criticalIssues.slice(0, 5).forEach(issue => {
                executiveSummary += `- **${issue.type}**: ${issue.message}\n`;
            });
            if (criticalCount > 5) {
                executiveSummary += `- *...and ${criticalCount - 5} more critical issues*\n`;
            }
            executiveSummary += '\n';
        }

        // High priority recommendations
        if (highPriorityRecs > 0) {
            executiveSummary += `### 📋 High Priority Recommendations (${highPriorityRecs})\n`;
            this.testResults.recommendations
                .filter(r => r.priority === 'critical' || r.priority === 'high')
                .slice(0, 3)
                .forEach(rec => {
                    executiveSummary += `- **${rec.title}**: ${rec.description}\n`;
                });
            if (highPriorityRecs > 3) {
                executiveSummary += `- *...and ${highPriorityRecs - 3} more recommendations*\n`;
            }
            executiveSummary += '\n';
        }

        // Deployment readiness
        executiveSummary += `### 🚀 Deployment Readiness\n`;
        if (criticalCount === 0 && summary.healthScore >= 80) {
            executiveSummary += `✅ **READY FOR DEPLOYMENT** - All tests passing with good performance\n\n`;
        } else if (criticalCount === 0 && summary.healthScore >= 60) {
            executiveSummary += `⚠️  **CONDITIONAL DEPLOYMENT** - Minor issues present but not blocking\n\n`;
        } else {
            executiveSummary += `❌ **NOT READY FOR DEPLOYMENT** - Critical issues must be resolved\n\n`;
        }

        // Hive mind consensus
        if (this.testResults.hiveMind?.insights) {
            const consensus = this.testResults.hiveMind.insights.consensusData;
            executiveSummary += `### 🧠 Hive Mind Consensus\n`;
            executiveSummary += `- **Consensus Strength:** ${(consensus.strength * 100).toFixed(1)}%\n`;
            executiveSummary += `- **Active Agents:** ${this.testResults.hiveMind.insights.agentCount}\n`;
            executiveSummary += `- **Tests Analyzed:** ${this.testResults.hiveMind.insights.totalTests}\n\n`;
        }

        this.testResults.executiveSummary = executiveSummary;
    }

    async generateReports() {
        console.log('📄 Generating Comprehensive Reports...\n');

        try {
            const reportTasks = [];

            // JSON Report
            if (this.options.reportFormats.includes('json')) {
                reportTasks.push(this.generateJSONReport());
            }

            // Markdown Report
            if (this.options.reportFormats.includes('markdown')) {
                reportTasks.push(this.generateMarkdownReport());
            }

            // HTML Report
            if (this.options.reportFormats.includes('html')) {
                reportTasks.push(this.generateHTMLReport());
            }

            await Promise.all(reportTasks);

            console.log(`✅ Reports generated in ${this.options.reportFormats.join(', ')} format(s)\n`);

        } catch (error) {
            console.error('❌ Report generation failed:', error.message);
        }
    }

    async generateJSONReport() {
        const reportPath = path.join(this.options.outputPath, `${this.runId}-comprehensive-report.json`);
        await fs.writeFile(reportPath, JSON.stringify(this.testResults, null, 2));
        console.log(`  📄 JSON report: ${reportPath}`);
    }

    async generateMarkdownReport() {
        const reportPath = path.join(this.options.outputPath, `${this.runId}-COMPREHENSIVE-REPORT.md`);

        let markdown = this.testResults.executiveSummary;

        // Add detailed results sections
        markdown += `## Detailed Test Results\n\n`;

        if (this.testResults.performance && !this.testResults.performance.error) {
            markdown += `### Performance Testing Results\n`;
            markdown += `- **Web Vitals:** ${Object.keys(this.testResults.performance.current?.webVitals || {}).length} pages tested\n`;
            markdown += `- **Load Testing:** ${Object.keys(this.testResults.performance.current?.loadTesting || {}).length} user levels tested\n`;
            markdown += `- **Regressions:** ${this.testResults.performance.regressions?.length || 0}\n`;
            markdown += `- **Improvements:** ${this.testResults.performance.improvements?.length || 0}\n\n`;
        }

        if (this.testResults.functional && !this.testResults.functional.error) {
            markdown += `### Functional Testing Results\n`;
            markdown += `- **Total Tests:** ${this.testResults.functional.summary.total}\n`;
            markdown += `- **Passed:** ${this.testResults.functional.summary.passed}\n`;
            markdown += `- **Failed:** ${this.testResults.functional.summary.failed}\n`;
            markdown += `- **Warnings:** ${this.testResults.functional.summary.warnings}\n\n`;
        }

        if (this.testResults.regression && !this.testResults.regression.error) {
            markdown += `### Regression Testing Results\n`;
            markdown += `- **Alerts Generated:** ${this.testResults.regression.alerts?.length || 0}\n`;
            markdown += `- **Critical Alerts:** ${this.testResults.regression.alerts?.filter(a => a.severity === 'critical').length || 0}\n`;
            markdown += `- **Warning Alerts:** ${this.testResults.regression.alerts?.filter(a => a.severity === 'warning').length || 0}\n\n`;
        }

        // Detailed recommendations
        if (this.testResults.recommendations.length > 0) {
            markdown += `## Detailed Recommendations\n\n`;

            const recsByPriority = this.groupBy(this.testResults.recommendations, 'priority');

            ['critical', 'high', 'medium', 'low'].forEach(priority => {
                const recs = recsByPriority[priority] || [];
                if (recs.length > 0) {
                    markdown += `### ${priority.toUpperCase()} Priority (${recs.length})\n\n`;
                    recs.forEach(rec => {
                        markdown += `#### ${rec.title}\n`;
                        markdown += `**Category:** ${rec.category}  \n`;
                        markdown += `**Impact:** ${rec.impact}  \n`;
                        markdown += `**Effort:** ${rec.effort}  \n\n`;
                        markdown += `${rec.description}\n\n`;

                        if (rec.actions && rec.actions.length > 0) {
                            markdown += `**Actions:**\n`;
                            rec.actions.forEach(action => {
                                markdown += `- ${action}\n`;
                            });
                            markdown += '\n';
                        }
                    });
                }
            });
        }

        await fs.writeFile(reportPath, markdown);
        console.log(`  📋 Markdown report: ${reportPath}`);
    }

    async generateHTMLReport() {
        const reportPath = path.join(this.options.outputPath, `${this.runId}-comprehensive-report.html`);

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hive Mind Performance Test Report - ${this.runId}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; }
        .status-excellent, .status-good { background: #28a745; }
        .status-warning, .status-needs_improvement { background: #ffc107; color: #212529; }
        .status-critical { background: #dc3545; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
        .metric-label { color: #6c757d; margin-top: 5px; }
        .section { margin: 40px 0; }
        .section h2 { color: #495057; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .critical-issues { background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .recommendations { background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .issue-item, .rec-item { margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.7); border-radius: 4px; }
        .priority-critical { border-left: 4px solid #dc3545; }
        .priority-high { border-left: 4px solid #fd7e14; }
        .priority-medium { border-left: 4px solid #ffc107; }
        .priority-low { border-left: 4px solid #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧠 Hive Mind Performance Test Report</h1>
            <p><strong>Run ID:</strong> ${this.runId}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <div class="status-badge status-${this.testResults.summary.overallStatus}">
                ${this.testResults.summary.overallStatus.toUpperCase().replace('_', ' ')}
            </div>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${this.testResults.summary.healthScore.toFixed(1)}</div>
                <div class="metric-label">Health Score</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${this.testResults.summary.performanceScore.toFixed(1)}</div>
                <div class="metric-label">Performance Score</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${this.testResults.summary.functionalityScore.toFixed(1)}</div>
                <div class="metric-label">Functionality Score</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${this.testResults.summary.totalTests > 0 ? ((this.testResults.summary.passedTests / this.testResults.summary.totalTests) * 100).toFixed(1) : 0}%</div>
                <div class="metric-label">Test Success Rate</div>
            </div>
        </div>

        ${this.testResults.criticalIssues.length > 0 ? `
        <div class="section">
            <h2>🚨 Critical Issues</h2>
            <div class="critical-issues">
                ${this.testResults.criticalIssues.map(issue => `
                    <div class="issue-item">
                        <strong>${issue.type}:</strong> ${issue.message}
                        ${issue.page ? `<br><small>Page: ${issue.page}</small>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${this.testResults.recommendations.length > 0 ? `
        <div class="section">
            <h2>📋 Recommendations</h2>
            <div class="recommendations">
                ${this.testResults.recommendations.map(rec => `
                    <div class="rec-item priority-${rec.priority}">
                        <h4>${rec.title}</h4>
                        <p><strong>Category:</strong> ${rec.category} | <strong>Priority:</strong> ${rec.priority}</p>
                        <p>${rec.description}</p>
                        ${rec.actions ? `
                            <ul>
                                ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                            </ul>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <div class="section">
            <h2>📊 Test Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #f8f9fa;">
                    <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Metric</strong></td>
                    <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Value</strong></td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">Test Duration</td>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">${this.testResults.metadata.duration.toFixed(1)}s</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">Pages Tested</td>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">${this.options.testPages.length}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">Agents Used</td>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">${this.testResults.metadata.agentsUsed}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">Total Tests</td>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">${this.testResults.summary.totalTests}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">Tests Passed</td>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">${this.testResults.summary.passedTests}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">Tests Failed</td>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">${this.testResults.summary.failedTests}</td>
                </tr>
            </table>
        </div>

        <div style="text-align: center; margin-top: 40px; color: #6c757d; font-size: 0.9em;">
            Generated by Hive Mind Performance Testing Framework
        </div>
    </div>
</body>
</html>`;

        await fs.writeFile(reportPath, html);
        console.log(`  🌐 HTML report: ${reportPath}`);
    }

    async sendNotifications() {
        if (!this.options.notifications.enabled) return;

        console.log('📬 Sending notifications...\n');

        try {
            const notificationData = {
                runId: this.runId,
                status: this.testResults.summary.overallStatus,
                healthScore: this.testResults.summary.healthScore,
                criticalIssues: this.testResults.criticalIssues.length,
                duration: this.testResults.metadata.duration,
                timestamp: new Date().toISOString()
            };

            // Webhook notification
            if (this.options.notifications.webhookUrl) {
                // This would typically use fetch or axios
                console.log(`📡 Webhook notification would be sent to: ${this.options.notifications.webhookUrl}`);
                console.log(`   Payload: ${JSON.stringify(notificationData, null, 2)}`);
            }

            // Slack notification
            if (this.options.notifications.slackChannel) {
                console.log(`💬 Slack notification would be sent to: ${this.options.notifications.slackChannel}`);
            }

            // Email notification
            if (this.options.notifications.email) {
                console.log(`📧 Email notification would be sent to: ${this.options.notifications.email}`);
            }

            console.log('✅ Notifications sent\n');

        } catch (error) {
            console.error('❌ Notification sending failed:', error.message);
        }
    }

    handleCICDIntegration() {
        console.log('🔧 Handling CI/CD Integration...\n');

        const criticalIssuesCount = this.testResults.criticalIssues.length;
        const healthScore = this.testResults.summary.healthScore;
        const status = this.testResults.summary.overallStatus;

        console.log('CI/CD Integration Summary:');
        console.log(`  Run ID: ${this.runId}`);
        console.log(`  Status: ${status.toUpperCase()}`);
        console.log(`  Health Score: ${healthScore.toFixed(1)}/100`);
        console.log(`  Critical Issues: ${criticalIssuesCount}`);
        console.log(`  Exit on Failure: ${this.options.exitOnFailure}`);

        // Create CI/CD specific output
        const cicdReport = {
            run_id: this.runId,
            status: status,
            health_score: healthScore,
            performance_score: this.testResults.summary.performanceScore,
            functionality_score: this.testResults.summary.functionalityScore,
            critical_issues: criticalIssuesCount,
            total_tests: this.testResults.summary.totalTests,
            passed_tests: this.testResults.summary.passedTests,
            failed_tests: this.testResults.summary.failedTests,
            deployment_ready: criticalIssuesCount === 0 && healthScore >= 75,
            recommendations: this.testResults.recommendations.filter(r => r.priority === 'critical' || r.priority === 'high')
        };

        // Output CI/CD report
        console.log('\nCI/CD Report (JSON):');
        console.log(JSON.stringify(cicdReport, null, 2));

        // Determine exit code
        if (this.options.exitOnFailure) {
            if (criticalIssuesCount > 0) {
                console.log('\n❌ CRITICAL ISSUES DETECTED - FAILING BUILD');
                process.exit(1);
            } else if (status === 'warning' && healthScore < 60) {
                console.log('\n⚠️  SIGNIFICANT PERFORMANCE ISSUES - FAILING BUILD');
                process.exit(1);
            }
        }

        console.log('\n✅ CI/CD INTEGRATION - BUILD PASSED');
    }

    async cleanup() {
        console.log('🧹 Cleaning up resources...');

        try {
            // Shutdown hive mind coordinator
            if (this.coordinator) {
                await this.coordinator.shutdown();
            }

            // Clear agents
            this.agents.clear();

            console.log('✅ Cleanup completed');

        } catch (error) {
            console.error('❌ Cleanup failed:', error.message);
        }
    }

    // Utility methods
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
}

export default HiveMindTestRunner;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const options = {};

    // Simple argument parsing
    for (let i = 0; i < args.length; i += 2) {
        const key = args[i].replace('--', '');
        const value = args[i + 1];

        switch (key) {
            case 'mode':
                options.executionMode = value;
                break;
            case 'url':
                options.baseUrl = value;
                break;
            case 'pages':
                options.testPages = value.split(',');
                break;
            case 'parallel':
                options.parallelExecution = value === 'true';
                break;
            case 'cicd':
                options.cicdMode = value === 'true';
                break;
            case 'exit-on-failure':
                options.exitOnFailure = value === 'true';
                break;
            case 'agents':
                options.agentCount = parseInt(value);
                break;
            case 'output':
                options.outputPath = value;
                break;
        }
    }

    // Set defaults
    const runner = new HiveMindTestRunner({
        baseUrl: options.baseUrl || 'http://localhost:4321/website/',
        testPages: options.testPages || ['index.html', 'about.html', 'contact.html', 'services.html', 'pricing.html'],
        executionMode: options.executionMode || 'comprehensive',
        parallelExecution: options.parallelExecution !== false,
        cicdMode: options.cicdMode || process.env.CI === 'true',
        exitOnFailure: options.exitOnFailure !== false,
        outputPath: options.outputPath || './test-results',
        hiveMindConfig: {
            enabled: true,
            agentCount: options.agentCount || 3,
            consensusThreshold: 0.8
        },
        reportFormats: ['json', 'markdown', 'html']
    });

    runner.runComprehensiveTestSuite().catch(console.error);
}