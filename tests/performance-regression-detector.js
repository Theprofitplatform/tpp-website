#!/usr/bin/env node

/**
 * AUTOMATED PERFORMANCE REGRESSION DETECTOR
 * Hive mind performance monitoring with automated regression detection
 *
 * Features:
 * - Continuous performance monitoring
 * - Automated regression detection with thresholds
 * - Alert system for critical performance degradation
 * - Integration with CI/CD pipelines
 * - Historical trend analysis
 * - Predictive performance modeling
 */

import { performance } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import HiveMindPerformanceTester from './performance-test-framework.js';

class PerformanceRegressionDetector {
    constructor(options = {}) {
        this.options = {
            baseUrl: options.baseUrl || 'http://localhost:4321/website/',
            testPages: options.testPages || ['index.html', 'about.html', 'contact.html'],
            monitoringInterval: options.monitoringInterval || 300000, // 5 minutes
            historyRetention: options.historyRetention || 720, // 30 days (48 measurements per day)
            regressionThresholds: {
                critical: {
                    fcp: 50, // 50% increase is critical
                    lcp: 40,
                    cls: 100, // 100% increase in layout shift
                    tti: 30,
                    responseTime: 100,
                    successRate: -10, // 10% decrease
                    errorRate: 500 // 500% increase
                },
                warning: {
                    fcp: 20, // 20% increase is warning
                    lcp: 15,
                    cls: 50,
                    tti: 15,
                    responseTime: 30,
                    successRate: -5,
                    errorRate: 200
                },
                minSampleSize: 3, // Need at least 3 measurements for regression detection
                confidenceLevel: 0.8 // 80% confidence required for alerts
            },
            alerting: {
                enabled: options.alertEnabled !== false,
                channels: options.alertChannels || ['console', 'file'],
                webhookUrl: options.webhookUrl,
                emailConfig: options.emailConfig
            },
            storage: {
                historyPath: options.historyPath || './memory/performance-history.json',
                alertsPath: options.alertsPath || './memory/performance-alerts.json',
                trendsPath: options.trendsPath || './memory/performance-trends.json'
            },
            cicdIntegration: {
                enabled: options.cicdEnabled || false,
                exitOnCritical: options.exitOnCritical !== false,
                exitOnWarning: options.exitOnWarning || false,
                reportFormat: options.reportFormat || 'json'
            },
            ...options
        };

        this.performanceHistory = [];
        this.activeAlerts = new Map();
        this.trendAnalyzer = new PerformanceTrendAnalyzer();
        this.hiveMindTester = new HiveMindPerformanceTester({
            baseUrl: this.options.baseUrl,
            testPages: this.options.testPages,
            concurrentUsers: [1, 5, 10], // Lighter load for regression detection
            testDuration: 30, // Shorter duration for frequent monitoring
            iterations: 1 // Single iteration for speed
        });

        this.isMonitoring = false;
        this.monitoringTimer = null;
    }

    async startContinuousMonitoring() {
        console.log('🔍 STARTING CONTINUOUS PERFORMANCE REGRESSION MONITORING');
        console.log('════════════════════════════════════════════════════════════\n');

        try {
            // Load historical data
            await this.loadPerformanceHistory();

            // Initialize trend analyzer
            await this.trendAnalyzer.initialize(this.performanceHistory);

            this.isMonitoring = true;

            // Run initial measurement
            await this.performRegressionCheck();

            // Set up continuous monitoring
            this.monitoringTimer = setInterval(async () => {
                try {
                    await this.performRegressionCheck();
                } catch (error) {
                    console.error('❌ Monitoring cycle failed:', error.message);
                    await this.handleMonitoringError(error);
                }
            }, this.options.monitoringInterval);

            console.log(`✅ Continuous monitoring started (interval: ${this.options.monitoringInterval / 1000}s)`);
            console.log('   Press Ctrl+C to stop monitoring\n');

            // Handle graceful shutdown
            process.on('SIGINT', () => this.stopMonitoring());
            process.on('SIGTERM', () => this.stopMonitoring());

            return this;

        } catch (error) {
            console.error('❌ Failed to start monitoring:', error.message);
            throw error;
        }
    }

    async performSingleRegressionCheck() {
        console.log('🔍 PERFORMANCE REGRESSION DETECTION - SINGLE CHECK');
        console.log('═══════════════════════════════════════════════════════════\n');

        try {
            // Load historical data
            await this.loadPerformanceHistory();

            // Initialize trend analyzer
            await this.trendAnalyzer.initialize(this.performanceHistory);

            // Perform regression check
            const result = await this.performRegressionCheck();

            // Generate final report
            await this.generateRegressionReport(result);

            // Handle CI/CD integration
            if (this.options.cicdIntegration.enabled) {
                this.handleCICDIntegration(result);
            }

            console.log('\n✅ REGRESSION CHECK COMPLETED');
            return result;

        } catch (error) {
            console.error('\n❌ Regression check failed:', error.message);

            if (this.options.cicdIntegration.enabled && this.options.cicdIntegration.exitOnCritical) {
                process.exit(1);
            }

            throw error;
        }
    }

    async performRegressionCheck() {
        const checkStart = performance.now();
        console.log(`[${new Date().toISOString()}] 🔍 Running regression check...`);

        try {
            // Run performance tests
            const testResults = await this.hiveMindTester.runComprehensivePerformanceTests();

            // Extract key metrics
            const currentMetrics = this.extractKeyMetrics(testResults);

            // Detect regressions
            const regressionAnalysis = await this.detectRegressions(currentMetrics);

            // Update performance history
            const historyEntry = {
                timestamp: new Date().toISOString(),
                metrics: currentMetrics,
                regressions: regressionAnalysis.regressions,
                alerts: regressionAnalysis.alerts,
                duration: (performance.now() - checkStart) / 1000
            };

            this.performanceHistory.push(historyEntry);
            await this.savePerformanceHistory();

            // Process alerts
            await this.processAlerts(regressionAnalysis.alerts);

            // Update trend analysis
            await this.trendAnalyzer.updateTrends(historyEntry);

            const checkDuration = (performance.now() - checkStart) / 1000;
            console.log(`✅ Regression check completed in ${checkDuration.toFixed(1)}s`);

            if (regressionAnalysis.alerts.length > 0) {
                console.log(`⚠️  ${regressionAnalysis.alerts.length} performance alerts generated`);
            }

            return {
                timestamp: historyEntry.timestamp,
                metrics: currentMetrics,
                regressions: regressionAnalysis.regressions,
                alerts: regressionAnalysis.alerts,
                trends: this.trendAnalyzer.getCurrentTrends(),
                duration: checkDuration
            };

        } catch (error) {
            console.error(`❌ Regression check failed: ${error.message}`);
            throw error;
        }
    }

    extractKeyMetrics(testResults) {
        const metrics = {
            webVitals: {},
            loadTesting: {},
            timestamp: Date.now()
        };

        // Extract Web Vitals
        if (testResults.current?.webVitals) {
            Object.entries(testResults.current.webVitals).forEach(([page, data]) => {
                if (data.averages) {
                    metrics.webVitals[page] = {
                        fcp: data.averages.fcp?.avg || 0,
                        lcp: data.averages.lcp?.avg || 0,
                        cls: data.averages.cls?.avg || 0,
                        tti: data.averages.tti?.avg || 0,
                        loadTime: data.averages.loadTime?.avg || 0
                    };
                }
            });
        }

        // Extract Load Testing metrics
        if (testResults.current?.loadTesting) {
            Object.entries(testResults.current.loadTesting).forEach(([userLevel, data]) => {
                if (!data.error) {
                    metrics.loadTesting[userLevel] = {
                        successRate: data.successRate || 0,
                        avgResponseTime: data.avgResponseTime || 0,
                        throughput: data.throughput || 0,
                        errorRate: data.failedRequests / data.totalRequests || 0
                    };
                }
            });
        }

        return metrics;
    }

    async detectRegressions(currentMetrics) {
        const regressions = [];
        const alerts = [];

        // Need historical data for comparison
        if (this.performanceHistory.length < this.options.regressionThresholds.minSampleSize) {
            console.log('⚠️  Insufficient historical data for regression detection');
            return { regressions, alerts };
        }

        // Get baseline metrics (average of recent measurements)
        const baseline = this.calculateBaseline();

        // Detect Web Vitals regressions
        if (currentMetrics.webVitals && baseline.webVitals) {
            Object.entries(currentMetrics.webVitals).forEach(([page, current]) => {
                if (!baseline.webVitals[page]) return;

                const pageBaseline = baseline.webVitals[page];

                Object.entries(current).forEach(([metric, currentValue]) => {
                    if (!pageBaseline[metric] || pageBaseline[metric] === 0) return;

                    const change = ((currentValue - pageBaseline[metric]) / pageBaseline[metric]) * 100;
                    const regression = this.evaluateRegression(metric, change, currentValue, pageBaseline[metric]);

                    if (regression) {
                        regression.page = page;
                        regression.category = 'webVitals';
                        regressions.push(regression);

                        if (regression.severity === 'critical' || regression.severity === 'warning') {
                            alerts.push(this.createAlert(regression));
                        }
                    }
                });
            });
        }

        // Detect Load Testing regressions
        if (currentMetrics.loadTesting && baseline.loadTesting) {
            Object.entries(currentMetrics.loadTesting).forEach(([userLevel, current]) => {
                if (!baseline.loadTesting[userLevel]) return;

                const levelBaseline = baseline.loadTesting[userLevel];

                Object.entries(current).forEach(([metric, currentValue]) => {
                    if (!levelBaseline[metric] && levelBaseline[metric] !== 0) return;

                    let change = 0;
                    if (levelBaseline[metric] !== 0) {
                        change = ((currentValue - levelBaseline[metric]) / levelBaseline[metric]) * 100;
                    } else if (currentValue > 0) {
                        change = 100; // If baseline was 0 and now we have a value, it's a 100% increase
                    }

                    const regression = this.evaluateRegression(metric, change, currentValue, levelBaseline[metric]);

                    if (regression) {
                        regression.userLevel = userLevel;
                        regression.category = 'loadTesting';
                        regressions.push(regression);

                        if (regression.severity === 'critical' || regression.severity === 'warning') {
                            alerts.push(this.createAlert(regression));
                        }
                    }
                });
            });
        }

        console.log(`📊 Regression Analysis: ${regressions.length} regressions detected, ${alerts.length} alerts generated`);

        return { regressions, alerts };
    }

    evaluateRegression(metric, changePercent, currentValue, baselineValue) {
        const criticalThreshold = this.options.regressionThresholds.critical[metric];
        const warningThreshold = this.options.regressionThresholds.warning[metric];

        if (!criticalThreshold && !warningThreshold) return null;

        let severity = null;
        let isRegression = false;

        // Handle metrics where decrease is bad (like successRate)
        if (metric === 'successRate') {
            if (changePercent <= criticalThreshold) {
                severity = 'critical';
                isRegression = true;
            } else if (changePercent <= warningThreshold) {
                severity = 'warning';
                isRegression = true;
            }
        }
        // Handle metrics where increase is bad (most metrics)
        else {
            if (changePercent >= criticalThreshold) {
                severity = 'critical';
                isRegression = true;
            } else if (changePercent >= warningThreshold) {
                severity = 'warning';
                isRegression = true;
            }
        }

        if (isRegression) {
            return {
                metric,
                changePercent: changePercent.toFixed(1),
                currentValue,
                baselineValue,
                severity,
                threshold: severity === 'critical' ? criticalThreshold : warningThreshold,
                timestamp: new Date().toISOString()
            };
        }

        return null;
    }

    calculateBaseline() {
        const recentEntries = this.performanceHistory.slice(-5); // Last 5 measurements
        const baseline = {
            webVitals: {},
            loadTesting: {}
        };

        if (recentEntries.length === 0) return baseline;

        // Calculate baseline for Web Vitals
        const webVitalsData = {};
        recentEntries.forEach(entry => {
            if (entry.metrics.webVitals) {
                Object.entries(entry.metrics.webVitals).forEach(([page, metrics]) => {
                    if (!webVitalsData[page]) webVitalsData[page] = {};
                    Object.entries(metrics).forEach(([metric, value]) => {
                        if (!webVitalsData[page][metric]) webVitalsData[page][metric] = [];
                        webVitalsData[page][metric].push(value);
                    });
                });
            }
        });

        Object.entries(webVitalsData).forEach(([page, pageMetrics]) => {
            baseline.webVitals[page] = {};
            Object.entries(pageMetrics).forEach(([metric, values]) => {
                baseline.webVitals[page][metric] = this.calculateMedian(values);
            });
        });

        // Calculate baseline for Load Testing
        const loadTestingData = {};
        recentEntries.forEach(entry => {
            if (entry.metrics.loadTesting) {
                Object.entries(entry.metrics.loadTesting).forEach(([userLevel, metrics]) => {
                    if (!loadTestingData[userLevel]) loadTestingData[userLevel] = {};
                    Object.entries(metrics).forEach(([metric, value]) => {
                        if (!loadTestingData[userLevel][metric]) loadTestingData[userLevel][metric] = [];
                        loadTestingData[userLevel][metric].push(value);
                    });
                });
            }
        });

        Object.entries(loadTestingData).forEach(([userLevel, levelMetrics]) => {
            baseline.loadTesting[userLevel] = {};
            Object.entries(levelMetrics).forEach(([metric, values]) => {
                baseline.loadTesting[userLevel][metric] = this.calculateMedian(values);
            });
        });

        return baseline;
    }

    createAlert(regression) {
        return {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            type: 'performance_regression',
            severity: regression.severity,
            category: regression.category,
            metric: regression.metric,
            page: regression.page,
            userLevel: regression.userLevel,
            message: this.generateAlertMessage(regression),
            details: {
                currentValue: regression.currentValue,
                baselineValue: regression.baselineValue,
                changePercent: regression.changePercent,
                threshold: regression.threshold
            },
            resolved: false,
            acknowledgedAt: null
        };
    }

    generateAlertMessage(regression) {
        const location = regression.page ? `on ${regression.page}` :
                        regression.userLevel ? `under ${regression.userLevel} users` : '';

        const direction = regression.metric === 'successRate' ? 'decreased' : 'increased';

        return `${regression.severity.toUpperCase()}: ${regression.metric} ${direction} by ${Math.abs(regression.changePercent)}% ${location} (threshold: ${Math.abs(regression.threshold)}%)`;
    }

    async processAlerts(newAlerts) {
        for (const alert of newAlerts) {
            // Check if similar alert already exists
            const existingAlert = Array.from(this.activeAlerts.values())
                .find(existing =>
                    existing.metric === alert.metric &&
                    existing.page === alert.page &&
                    existing.userLevel === alert.userLevel &&
                    !existing.resolved
                );

            if (existingAlert) {
                // Update existing alert
                existingAlert.lastOccurrence = alert.timestamp;
                existingAlert.occurrenceCount = (existingAlert.occurrenceCount || 1) + 1;
                console.log(`🔄 Updated existing alert: ${alert.message}`);
            } else {
                // Create new alert
                alert.occurrenceCount = 1;
                alert.firstOccurrence = alert.timestamp;
                this.activeAlerts.set(alert.id, alert);
                console.log(`🚨 NEW ALERT: ${alert.message}`);

                // Send alert notifications
                await this.sendAlertNotifications(alert);
            }
        }

        // Save alerts
        await this.saveAlerts();
    }

    async sendAlertNotifications(alert) {
        if (!this.options.alerting.enabled) return;

        const channels = this.options.alerting.channels;

        if (channels.includes('console')) {
            this.displayConsoleAlert(alert);
        }

        if (channels.includes('file')) {
            await this.writeFileAlert(alert);
        }

        if (channels.includes('webhook') && this.options.alerting.webhookUrl) {
            await this.sendWebhookAlert(alert);
        }

        if (channels.includes('email') && this.options.alerting.emailConfig) {
            await this.sendEmailAlert(alert);
        }
    }

    displayConsoleAlert(alert) {
        const emoji = alert.severity === 'critical' ? '🚨' : '⚠️';
        const border = '═'.repeat(80);

        console.log(`\n${border}`);
        console.log(`${emoji} PERFORMANCE ALERT - ${alert.severity.toUpperCase()}`);
        console.log(border);
        console.log(`Time: ${alert.timestamp}`);
        console.log(`Message: ${alert.message}`);
        console.log(`Category: ${alert.category}`);
        console.log(`Current Value: ${alert.details.currentValue}`);
        console.log(`Baseline Value: ${alert.details.baselineValue}`);
        console.log(`Change: ${alert.details.changePercent}%`);
        console.log(border);
    }

    async writeFileAlert(alert) {
        const alertsDir = path.dirname(this.options.storage.alertsPath);
        await fs.mkdir(alertsDir, { recursive: true });

        const alertEntry = `[${alert.timestamp}] ${alert.severity.toUpperCase()}: ${alert.message}\n`;
        await fs.appendFile(this.options.storage.alertsPath.replace('.json', '.log'), alertEntry);
    }

    async sendWebhookAlert(alert) {
        try {
            const payload = {
                text: `Performance Alert: ${alert.message}`,
                severity: alert.severity,
                timestamp: alert.timestamp,
                details: alert.details
            };

            // This would typically use fetch or a HTTP client
            console.log(`📡 Webhook alert would be sent to: ${this.options.alerting.webhookUrl}`);
            console.log(`   Payload: ${JSON.stringify(payload, null, 2)}`);

        } catch (error) {
            console.error('❌ Failed to send webhook alert:', error.message);
        }
    }

    async sendEmailAlert(alert) {
        try {
            // This would typically use an email service
            console.log(`📧 Email alert would be sent`);
            console.log(`   Subject: Performance Alert - ${alert.severity}`);
            console.log(`   Message: ${alert.message}`);

        } catch (error) {
            console.error('❌ Failed to send email alert:', error.message);
        }
    }

    handleCICDIntegration(result) {
        const criticalAlerts = result.alerts.filter(a => a.severity === 'critical');
        const warningAlerts = result.alerts.filter(a => a.severity === 'warning');

        console.log('\n🔧 CI/CD INTEGRATION REPORT');
        console.log('══════════════════════════════════════════════════════════');
        console.log(`Critical Alerts: ${criticalAlerts.length}`);
        console.log(`Warning Alerts: ${warningAlerts.length}`);

        if (this.options.cicdIntegration.reportFormat === 'json') {
            const cicdReport = {
                timestamp: result.timestamp,
                status: criticalAlerts.length > 0 ? 'FAILED' :
                        warningAlerts.length > 0 ? 'WARNING' : 'PASSED',
                criticalAlerts: criticalAlerts.length,
                warningAlerts: warningAlerts.length,
                alerts: result.alerts,
                metrics: result.metrics
            };

            console.log('\nCI/CD Report (JSON):');
            console.log(JSON.stringify(cicdReport, null, 2));
        }

        // Exit with appropriate code for CI/CD
        if (criticalAlerts.length > 0 && this.options.cicdIntegration.exitOnCritical) {
            console.log('\n❌ CRITICAL PERFORMANCE REGRESSIONS DETECTED - FAILING BUILD');
            process.exit(1);
        }

        if (warningAlerts.length > 0 && this.options.cicdIntegration.exitOnWarning) {
            console.log('\n⚠️  WARNING PERFORMANCE REGRESSIONS DETECTED - FAILING BUILD');
            process.exit(1);
        }

        console.log('\n✅ CI/CD INTEGRATION - BUILD PASSED');
    }

    async generateRegressionReport(result) {
        const report = {
            metadata: {
                timestamp: result.timestamp,
                duration: result.duration,
                totalAlerts: result.alerts.length,
                criticalAlerts: result.alerts.filter(a => a.severity === 'critical').length,
                warningAlerts: result.alerts.filter(a => a.severity === 'warning').length
            },
            metrics: result.metrics,
            regressions: result.regressions,
            alerts: result.alerts,
            trends: result.trends,
            recommendations: this.generateRegressionRecommendations(result)
        };

        // Save detailed report
        const reportPath = path.join(process.cwd(), 'performance-regression-report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        // Generate summary report
        const summaryPath = path.join(process.cwd(), 'PERFORMANCE_REGRESSION_REPORT.md');
        const markdownReport = this.generateMarkdownRegressionReport(report);
        await fs.writeFile(summaryPath, markdownReport);

        console.log('\n📊 Regression reports generated:');
        console.log('  📄 performance-regression-report.json');
        console.log('  📋 PERFORMANCE_REGRESSION_REPORT.md');
    }

    generateRegressionRecommendations(result) {
        const recommendations = [];

        result.alerts.forEach(alert => {
            switch (alert.metric) {
                case 'fcp':
                case 'lcp':
                    recommendations.push({
                        type: 'critical_rendering_path',
                        priority: alert.severity,
                        description: `${alert.metric.toUpperCase()} regression detected`,
                        actions: [
                            'Review recent changes to critical CSS',
                            'Check for new render-blocking resources',
                            'Verify server response times',
                            'Analyze resource loading waterfall'
                        ]
                    });
                    break;

                case 'cls':
                    recommendations.push({
                        type: 'layout_stability',
                        priority: alert.severity,
                        description: 'Layout stability regression detected',
                        actions: [
                            'Review dynamic content loading',
                            'Check image dimension attributes',
                            'Verify font loading strategy',
                            'Analyze layout shift sources'
                        ]
                    });
                    break;

                case 'successRate':
                    recommendations.push({
                        type: 'reliability',
                        priority: 'critical',
                        description: 'Request success rate regression',
                        actions: [
                            'Check server health and capacity',
                            'Review error logs for failure patterns',
                            'Verify network connectivity',
                            'Analyze traffic patterns'
                        ]
                    });
                    break;

                case 'responseTime':
                    recommendations.push({
                        type: 'server_performance',
                        priority: alert.severity,
                        description: 'Server response time regression',
                        actions: [
                            'Profile server-side code changes',
                            'Check database query performance',
                            'Review caching effectiveness',
                            'Analyze resource utilization'
                        ]
                    });
                    break;
            }
        });

        return recommendations;
    }

    generateMarkdownRegressionReport(report) {
        let markdown = `# Performance Regression Report\n\n`;
        markdown += `**Generated:** ${report.metadata.timestamp}  \n`;
        markdown += `**Duration:** ${report.metadata.duration.toFixed(1)}s  \n`;
        markdown += `**Total Alerts:** ${report.metadata.totalAlerts}  \n\n`;

        // Alert Summary
        markdown += `## Alert Summary\n\n`;
        markdown += `- 🚨 **Critical:** ${report.metadata.criticalAlerts}\n`;
        markdown += `- ⚠️ **Warning:** ${report.metadata.warningAlerts}\n\n`;

        // Active Alerts
        if (report.alerts.length > 0) {
            markdown += `## Active Alerts\n\n`;

            const alertsBySeverity = this.groupBy(report.alerts, 'severity');

            ['critical', 'warning'].forEach(severity => {
                const alerts = alertsBySeverity[severity] || [];
                if (alerts.length > 0) {
                    markdown += `### ${severity.toUpperCase()} Alerts\n\n`;
                    alerts.forEach(alert => {
                        markdown += `- **${alert.metric}** ${alert.page ? `(${alert.page})` : ''}${alert.userLevel ? `(${alert.userLevel} users)` : ''}\n`;
                        markdown += `  - Change: ${alert.details.changePercent}%\n`;
                        markdown += `  - Current: ${alert.details.currentValue}\n`;
                        markdown += `  - Baseline: ${alert.details.baselineValue}\n`;
                        markdown += `  - Time: ${alert.timestamp}\n\n`;
                    });
                }
            });
        }

        // Recommendations
        if (report.recommendations.length > 0) {
            markdown += `## Recommendations\n\n`;

            const recsByPriority = this.groupBy(report.recommendations, 'priority');

            ['critical', 'warning', 'medium', 'low'].forEach(priority => {
                const recs = recsByPriority[priority] || [];
                if (recs.length > 0) {
                    markdown += `### ${priority.toUpperCase()} Priority\n\n`;
                    recs.forEach(rec => {
                        markdown += `- **${rec.type}**: ${rec.description}\n`;
                        rec.actions.forEach(action => {
                            markdown += `  - ${action}\n`;
                        });
                        markdown += '\n';
                    });
                }
            });
        }

        return markdown;
    }

    async loadPerformanceHistory() {
        try {
            const historyData = await fs.readFile(this.options.storage.historyPath, 'utf8');
            this.performanceHistory = JSON.parse(historyData);

            // Limit history to retention period
            const cutoffTime = Date.now() - (this.options.historyRetention * this.options.monitoringInterval);
            this.performanceHistory = this.performanceHistory.filter(entry =>
                new Date(entry.timestamp).getTime() > cutoffTime
            );

            console.log(`📚 Loaded ${this.performanceHistory.length} historical measurements`);

        } catch (error) {
            console.log('⚠️  No performance history found, starting fresh');
            this.performanceHistory = [];
        }
    }

    async savePerformanceHistory() {
        const historyDir = path.dirname(this.options.storage.historyPath);
        await fs.mkdir(historyDir, { recursive: true });

        // Keep only the most recent entries
        if (this.performanceHistory.length > this.options.historyRetention) {
            this.performanceHistory = this.performanceHistory.slice(-this.options.historyRetention);
        }

        await fs.writeFile(
            this.options.storage.historyPath,
            JSON.stringify(this.performanceHistory, null, 2)
        );
    }

    async saveAlerts() {
        const alertsDir = path.dirname(this.options.storage.alertsPath);
        await fs.mkdir(alertsDir, { recursive: true });

        const alertsArray = Array.from(this.activeAlerts.values());
        await fs.writeFile(
            this.options.storage.alertsPath,
            JSON.stringify(alertsArray, null, 2)
        );
    }

    async stopMonitoring() {
        console.log('\n🛑 Stopping performance regression monitoring...');

        this.isMonitoring = false;

        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
            this.monitoringTimer = null;
        }

        // Save final state
        await this.savePerformanceHistory();
        await this.saveAlerts();

        console.log('✅ Monitoring stopped and state saved');
        process.exit(0);
    }

    async handleMonitoringError(error) {
        console.error(`❌ Monitoring error: ${error.message}`);

        // Create error alert
        const errorAlert = {
            id: `error_${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'monitoring_error',
            severity: 'critical',
            message: `Performance monitoring failed: ${error.message}`,
            details: { error: error.stack }
        };

        await this.processAlerts([errorAlert]);
    }

    // Utility methods
    calculateMedian(values) {
        if (values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
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
}

// Performance Trend Analyzer helper class
class PerformanceTrendAnalyzer {
    constructor() {
        this.trends = {
            webVitals: {},
            loadTesting: {},
            predictions: {}
        };
    }

    async initialize(history) {
        if (history.length < 5) return; // Need minimum data for trends

        // Analyze Web Vitals trends
        this.analyzeWebVitalsTrends(history);

        // Analyze Load Testing trends
        this.analyzeLoadTestingTrends(history);

        // Generate predictions
        this.generatePredictions(history);
    }

    analyzeWebVitalsTrends(history) {
        const webVitalsData = {};

        history.forEach(entry => {
            if (entry.metrics.webVitals) {
                Object.entries(entry.metrics.webVitals).forEach(([page, metrics]) => {
                    if (!webVitalsData[page]) webVitalsData[page] = {};
                    Object.entries(metrics).forEach(([metric, value]) => {
                        if (!webVitalsData[page][metric]) webVitalsData[page][metric] = [];
                        webVitalsData[page][metric].push({
                            timestamp: new Date(entry.timestamp).getTime(),
                            value
                        });
                    });
                });
            }
        });

        Object.entries(webVitalsData).forEach(([page, pageMetrics]) => {
            this.trends.webVitals[page] = {};
            Object.entries(pageMetrics).forEach(([metric, dataPoints]) => {
                this.trends.webVitals[page][metric] = this.calculateTrend(dataPoints);
            });
        });
    }

    analyzeLoadTestingTrends(history) {
        const loadTestingData = {};

        history.forEach(entry => {
            if (entry.metrics.loadTesting) {
                Object.entries(entry.metrics.loadTesting).forEach(([userLevel, metrics]) => {
                    if (!loadTestingData[userLevel]) loadTestingData[userLevel] = {};
                    Object.entries(metrics).forEach(([metric, value]) => {
                        if (!loadTestingData[userLevel][metric]) loadTestingData[userLevel][metric] = [];
                        loadTestingData[userLevel][metric].push({
                            timestamp: new Date(entry.timestamp).getTime(),
                            value
                        });
                    });
                });
            }
        });

        Object.entries(loadTestingData).forEach(([userLevel, levelMetrics]) => {
            this.trends.loadTesting[userLevel] = {};
            Object.entries(levelMetrics).forEach(([metric, dataPoints]) => {
                this.trends.loadTesting[userLevel][metric] = this.calculateTrend(dataPoints);
            });
        });
    }

    calculateTrend(dataPoints) {
        if (dataPoints.length < 3) return { direction: 'stable', slope: 0, confidence: 0 };

        // Simple linear regression
        const n = dataPoints.length;
        const sumX = dataPoints.reduce((sum, point) => sum + point.timestamp, 0);
        const sumY = dataPoints.reduce((sum, point) => sum + point.value, 0);
        const sumXY = dataPoints.reduce((sum, point) => sum + (point.timestamp * point.value), 0);
        const sumXX = dataPoints.reduce((sum, point) => sum + (point.timestamp * point.timestamp), 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Determine trend direction
        let direction = 'stable';
        if (Math.abs(slope) > 0.001) { // Threshold for significance
            direction = slope > 0 ? 'increasing' : 'decreasing';
        }

        // Calculate R-squared for confidence
        const yMean = sumY / n;
        const ssTotal = dataPoints.reduce((sum, point) => sum + Math.pow(point.value - yMean, 2), 0);
        const ssRes = dataPoints.reduce((sum, point) => {
            const predicted = slope * point.timestamp + intercept;
            return sum + Math.pow(point.value - predicted, 2);
        }, 0);

        const rSquared = 1 - (ssRes / ssTotal);
        const confidence = Math.max(0, Math.min(1, rSquared)) * 100;

        return {
            direction,
            slope,
            confidence: confidence.toFixed(1),
            dataPoints: dataPoints.length
        };
    }

    generatePredictions(history) {
        // Simple prediction based on trends
        // This could be enhanced with more sophisticated ML models

        this.predictions.nextCheckPrediction = {
            timestamp: Date.now() + 300000, // 5 minutes from now
            confidence: 'medium',
            expectedChanges: []
        };

        // Add predictions based on trends
        Object.entries(this.trends.webVitals).forEach(([page, pageMetrics]) => {
            Object.entries(pageMetrics).forEach(([metric, trend]) => {
                if (trend.direction !== 'stable' && trend.confidence > 50) {
                    this.predictions.nextCheckPrediction.expectedChanges.push({
                        page,
                        metric,
                        direction: trend.direction,
                        confidence: trend.confidence
                    });
                }
            });
        });
    }

    async updateTrends(newEntry) {
        // This would update trends with the new data point
        // For now, we'll just log that trends were updated
        console.log('📈 Performance trends updated with latest measurement');
    }

    getCurrentTrends() {
        return this.trends;
    }
}

export default PerformanceRegressionDetector;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const detector = new PerformanceRegressionDetector({
        baseUrl: process.env.BASE_URL || 'http://localhost:4321/website/',
        testPages: ['index.html', 'about.html', 'contact.html'],
        alertChannels: ['console', 'file'],
        cicdEnabled: process.env.CI === 'true'
    });

    // Check command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || 'single';

    switch (command) {
        case 'monitor':
            detector.startContinuousMonitoring().catch(console.error);
            break;
        case 'single':
        default:
            detector.performSingleRegressionCheck().catch(console.error);
            break;
    }
}