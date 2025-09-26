#!/usr/bin/env node

/**
 * Performance Bottleneck Detection System
 * Real-time bottleneck identification and optimization recommendations
 * Part of the Hive Mind Collective Intelligence System
 */

class PerformanceBottleneckDetector {
    constructor() {
        this.metrics = new Map();
        this.bottlenecks = new Map();
        this.thresholds = {
            // Response time thresholds (ms)
            ttfb: { good: 100, warning: 300, critical: 600 },
            lcp: { good: 1500, warning: 2500, critical: 4000 },
            fid: { good: 50, warning: 100, critical: 300 },
            cls: { good: 0.05, warning: 0.1, critical: 0.25 },

            // Resource thresholds
            memoryUsage: { good: 50, warning: 75, critical: 90 }, // percentage
            cpuUsage: { good: 50, warning: 75, critical: 90 }, // percentage
            networkLatency: { good: 50, warning: 150, critical: 500 }, // ms

            // Business metrics
            errorRate: { good: 0.1, warning: 1.0, critical: 5.0 }, // percentage
            concurrentUsers: { good: 100, warning: 500, critical: 1000 },

            // Performance patterns
            trendDegradation: { good: 5, warning: 15, critical: 30 } // percentage increase
        };

        this.detectionRules = new Map();
        this.optimizationStrategies = new Map();

        this.init();
    }

    init() {
        console.log('🔍 Initializing Performance Bottleneck Detection System...\n');

        this.setupDetectionRules();
        this.setupOptimizationStrategies();
        this.startRealTimeMonitoring();

        console.log('✅ Performance Bottleneck Detector ready\n');
    }

    setupDetectionRules() {
        // Sequential Processing Bottleneck
        this.detectionRules.set('sequential_processing', {
            name: 'Sequential Processing Bottleneck',
            detect: (metrics) => {
                const concurrentTasks = metrics.get('concurrent_tasks') || 1;
                const avgTaskTime = metrics.get('avg_task_time') || 0;
                const totalThroughput = metrics.get('throughput') || 0;

                return concurrentTasks === 1 && avgTaskTime > 1000 && totalThroughput < 10;
            },
            severity: 'critical',
            impact: 'high',
            category: 'execution'
        });

        // Memory Leak Detection
        this.detectionRules.set('memory_leak', {
            name: 'Memory Usage Growing Over Time',
            detect: (metrics) => {
                const memoryHistory = metrics.get('memory_history') || [];
                if (memoryHistory.length < 10) return false;

                const recent = memoryHistory.slice(-5);
                const earlier = memoryHistory.slice(-10, -5);
                const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
                const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;

                return (recentAvg - earlierAvg) / earlierAvg > 0.2; // 20% increase
            },
            severity: 'warning',
            impact: 'medium',
            category: 'memory'
        });

        // Resource Loading Bottleneck
        this.detectionRules.set('resource_loading', {
            name: 'Sequential Resource Loading',
            detect: (metrics) => {
                const resourceCount = metrics.get('resource_count') || 0;
                const parallelRequests = metrics.get('parallel_requests') || 1;
                const totalLoadTime = metrics.get('total_load_time') || 0;

                return resourceCount > 10 && parallelRequests < 6 && totalLoadTime > 2000;
            },
            severity: 'warning',
            impact: 'medium',
            category: 'network'
        });

        // CPU Intensive Task Detection
        this.detectionRules.set('cpu_intensive', {
            name: 'CPU-Intensive Task Blocking',
            detect: (metrics) => {
                const longTasks = metrics.get('long_tasks') || [];
                const cpuUsage = metrics.get('cpu_usage') || 0;

                return longTasks.filter(task => task > 50).length > 0 || cpuUsage > 80;
            },
            severity: 'critical',
            impact: 'high',
            category: 'cpu'
        });

        // Database Query Bottleneck
        this.detectionRules.set('database_query', {
            name: 'Slow Database Queries',
            detect: (metrics) => {
                const queryTimes = metrics.get('query_times') || [];
                const slowQueries = queryTimes.filter(time => time > 500);

                return slowQueries.length > queryTimes.length * 0.1; // More than 10% slow
            },
            severity: 'warning',
            impact: 'high',
            category: 'database'
        });

        // Cache Miss Pattern
        this.detectionRules.set('cache_miss', {
            name: 'High Cache Miss Rate',
            detect: (metrics) => {
                const cacheHitRate = metrics.get('cache_hit_rate') || 100;
                return cacheHitRate < 70; // Less than 70% hit rate
            },
            severity: 'warning',
            impact: 'medium',
            category: 'caching'
        });

        // Network Latency Issues
        this.detectionRules.set('network_latency', {
            name: 'High Network Latency',
            detect: (metrics) => {
                const networkLatency = metrics.get('network_latency') || 0;
                const failedRequests = metrics.get('failed_requests') || 0;
                const totalRequests = metrics.get('total_requests') || 1;

                return networkLatency > 200 || (failedRequests / totalRequests) > 0.05;
            },
            severity: 'warning',
            impact: 'high',
            category: 'network'
        });

        console.log(`📋 ${this.detectionRules.size} bottleneck detection rules configured`);
    }

    setupOptimizationStrategies() {
        // Sequential Processing Optimization
        this.optimizationStrategies.set('sequential_processing', [
            {
                strategy: 'Implement Worker Threads',
                priority: 'high',
                effort: 'medium',
                impact: 'high',
                description: 'Move CPU-intensive tasks to worker threads for parallel processing',
                implementation: 'Use Node.js worker_threads or Web Workers for browser'
            },
            {
                strategy: 'Batch Processing',
                priority: 'medium',
                effort: 'low',
                impact: 'medium',
                description: 'Group related operations to reduce overhead',
                implementation: 'Implement batching logic with configurable batch sizes'
            },
            {
                strategy: 'Asynchronous Processing',
                priority: 'high',
                effort: 'low',
                impact: 'high',
                description: 'Convert synchronous operations to async where possible',
                implementation: 'Use Promise.all() for parallel execution'
            }
        ]);

        // Memory Optimization
        this.optimizationStrategies.set('memory_leak', [
            {
                strategy: 'Implement Object Pooling',
                priority: 'medium',
                effort: 'high',
                impact: 'high',
                description: 'Reuse objects to reduce garbage collection pressure',
                implementation: 'Create pools for frequently used objects'
            },
            {
                strategy: 'Observer Cleanup',
                priority: 'high',
                effort: 'low',
                impact: 'medium',
                description: 'Properly disconnect observers and remove event listeners',
                implementation: 'Implement cleanup in destroy/unmount lifecycle'
            },
            {
                strategy: 'Memory Profiling',
                priority: 'medium',
                effort: 'medium',
                impact: 'low',
                description: 'Regular memory profiling to identify leaks',
                implementation: 'Use Chrome DevTools or Node.js --inspect'
            }
        ]);

        // Resource Loading Optimization
        this.optimizationStrategies.set('resource_loading', [
            {
                strategy: 'HTTP/2 Implementation',
                priority: 'high',
                effort: 'high',
                impact: 'high',
                description: 'Enable multiplexing and server push',
                implementation: 'Upgrade server to HTTP/2 with push capabilities'
            },
            {
                strategy: 'Resource Bundling',
                priority: 'medium',
                effort: 'medium',
                impact: 'medium',
                description: 'Bundle small resources to reduce request count',
                implementation: 'Use Webpack or similar bundling tool'
            },
            {
                strategy: 'CDN Implementation',
                priority: 'high',
                effort: 'medium',
                impact: 'high',
                description: 'Serve static resources from edge locations',
                implementation: 'Configure CloudFlare or AWS CloudFront'
            }
        ]);

        // CPU Optimization
        this.optimizationStrategies.set('cpu_intensive', [
            {
                strategy: 'Code Splitting',
                priority: 'high',
                effort: 'medium',
                impact: 'high',
                description: 'Split large bundles into smaller chunks',
                implementation: 'Implement dynamic imports and lazy loading'
            },
            {
                strategy: 'Algorithm Optimization',
                priority: 'high',
                effort: 'high',
                impact: 'high',
                description: 'Optimize algorithm complexity and data structures',
                implementation: 'Profile and refactor bottleneck algorithms'
            },
            {
                strategy: 'Debouncing/Throttling',
                priority: 'medium',
                effort: 'low',
                impact: 'medium',
                description: 'Limit frequency of expensive operations',
                implementation: 'Use lodash debounce/throttle or custom implementation'
            }
        ]);

        // Database Optimization
        this.optimizationStrategies.set('database_query', [
            {
                strategy: 'Query Optimization',
                priority: 'high',
                effort: 'medium',
                impact: 'high',
                description: 'Optimize slow queries with proper indexing',
                implementation: 'Analyze execution plans and add indexes'
            },
            {
                strategy: 'Connection Pooling',
                priority: 'medium',
                effort: 'low',
                impact: 'medium',
                description: 'Implement database connection pooling',
                implementation: 'Configure connection pool with proper limits'
            },
            {
                strategy: 'Caching Layer',
                priority: 'high',
                effort: 'medium',
                impact: 'high',
                description: 'Implement Redis or in-memory caching',
                implementation: 'Cache frequently accessed query results'
            }
        ]);

        // Caching Optimization
        this.optimizationStrategies.set('cache_miss', [
            {
                strategy: 'Cache Strategy Optimization',
                priority: 'high',
                effort: 'medium',
                impact: 'high',
                description: 'Improve cache hit rates with better strategies',
                implementation: 'Implement LRU, TTL, or intelligent invalidation'
            },
            {
                strategy: 'Multi-Layer Caching',
                priority: 'medium',
                effort: 'high',
                impact: 'high',
                description: 'Implement multiple cache layers',
                implementation: 'Memory -> Redis -> Database hierarchy'
            },
            {
                strategy: 'Cache Warming',
                priority: 'low',
                effort: 'low',
                impact: 'medium',
                description: 'Pre-populate cache with likely-needed data',
                implementation: 'Background job to warm frequently accessed items'
            }
        ]);

        // Network Optimization
        this.optimizationStrategies.set('network_latency', [
            {
                strategy: 'Request Optimization',
                priority: 'high',
                effort: 'low',
                impact: 'medium',
                description: 'Reduce number and size of network requests',
                implementation: 'Combine requests and compress payloads'
            },
            {
                strategy: 'Timeout Configuration',
                priority: 'medium',
                effort: 'low',
                impact: 'low',
                description: 'Optimize timeout and retry logic',
                implementation: 'Set appropriate timeouts and exponential backoff'
            },
            {
                strategy: 'Load Balancing',
                priority: 'high',
                effort: 'high',
                impact: 'high',
                description: 'Distribute load across multiple servers',
                implementation: 'Configure nginx or cloud load balancer'
            }
        ]);

        console.log(`🔧 ${this.optimizationStrategies.size} optimization strategies configured`);
    }

    analyzeBottlenecks(metricsData) {
        const detectedBottlenecks = [];

        // Convert metrics to Map for consistent access
        const metrics = new Map(Object.entries(metricsData || {}));

        // Run detection rules
        for (const [ruleId, rule] of this.detectionRules) {
            try {
                if (rule.detect(metrics)) {
                    const bottleneck = {
                        id: ruleId,
                        name: rule.name,
                        severity: rule.severity,
                        impact: rule.impact,
                        category: rule.category,
                        detectedAt: Date.now(),
                        metrics: this.getRelevantMetrics(metrics, rule.category),
                        recommendations: this.getOptimizationRecommendations(ruleId)
                    };

                    detectedBottlenecks.push(bottleneck);
                    this.bottlenecks.set(ruleId, bottleneck);
                }
            } catch (error) {
                console.warn(`Error running detection rule ${ruleId}:`, error.message);
            }
        }

        return detectedBottlenecks;
    }

    getRelevantMetrics(metrics, category) {
        const relevantMetrics = {};

        switch (category) {
            case 'execution':
                relevantMetrics.concurrent_tasks = metrics.get('concurrent_tasks');
                relevantMetrics.avg_task_time = metrics.get('avg_task_time');
                relevantMetrics.throughput = metrics.get('throughput');
                break;
            case 'memory':
                relevantMetrics.memory_usage = metrics.get('memory_usage');
                relevantMetrics.memory_history = metrics.get('memory_history');
                break;
            case 'network':
                relevantMetrics.network_latency = metrics.get('network_latency');
                relevantMetrics.resource_count = metrics.get('resource_count');
                relevantMetrics.parallel_requests = metrics.get('parallel_requests');
                relevantMetrics.total_load_time = metrics.get('total_load_time');
                break;
            case 'cpu':
                relevantMetrics.cpu_usage = metrics.get('cpu_usage');
                relevantMetrics.long_tasks = metrics.get('long_tasks');
                break;
            case 'database':
                relevantMetrics.query_times = metrics.get('query_times');
                break;
            case 'caching':
                relevantMetrics.cache_hit_rate = metrics.get('cache_hit_rate');
                break;
        }

        return relevantMetrics;
    }

    getOptimizationRecommendations(bottleneckId) {
        return this.optimizationStrategies.get(bottleneckId) || [];
    }

    calculateBottleneckScore(bottleneck) {
        const severityScores = { critical: 100, warning: 60, info: 20 };
        const impactScores = { high: 3, medium: 2, low: 1 };

        const severityScore = severityScores[bottleneck.severity] || 20;
        const impactMultiplier = impactScores[bottleneck.impact] || 1;

        return Math.min(100, severityScore * impactMultiplier);
    }

    generateBottleneckReport(bottlenecks) {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalBottlenecks: bottlenecks.length,
                criticalCount: bottlenecks.filter(b => b.severity === 'critical').length,
                warningCount: bottlenecks.filter(b => b.severity === 'warning').length,
                categories: this.groupBy(bottlenecks, 'category'),
                overallRisk: this.calculateOverallRisk(bottlenecks)
            },
            bottlenecks: bottlenecks.sort((a, b) =>
                this.calculateBottleneckScore(b) - this.calculateBottleneckScore(a)
            ),
            recommendations: this.generatePrioritizedRecommendations(bottlenecks)
        };

        return report;
    }

    calculateOverallRisk(bottlenecks) {
        if (bottlenecks.length === 0) return 'low';

        const criticalCount = bottlenecks.filter(b => b.severity === 'critical').length;
        const warningCount = bottlenecks.filter(b => b.severity === 'warning').length;

        if (criticalCount > 2) return 'critical';
        if (criticalCount > 0 || warningCount > 5) return 'high';
        if (warningCount > 2) return 'medium';
        return 'low';
    }

    generatePrioritizedRecommendations(bottlenecks) {
        const allRecommendations = [];

        for (const bottleneck of bottlenecks) {
            for (const recommendation of bottleneck.recommendations) {
                allRecommendations.push({
                    ...recommendation,
                    bottleneckId: bottleneck.id,
                    bottleneckName: bottleneck.name,
                    bottleneckSeverity: bottleneck.severity,
                    score: this.calculateRecommendationScore(recommendation, bottleneck)
                });
            }
        }

        return allRecommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // Top 10 recommendations
    }

    calculateRecommendationScore(recommendation, bottleneck) {
        const priorityScores = { high: 3, medium: 2, low: 1 };
        const effortScores = { low: 3, medium: 2, high: 1 }; // Lower effort = higher score
        const impactScores = { high: 3, medium: 2, low: 1 };
        const severityScores = { critical: 3, warning: 2, info: 1 };

        return (
            priorityScores[recommendation.priority] * 3 +
            effortScores[recommendation.effort] * 2 +
            impactScores[recommendation.impact] * 3 +
            severityScores[bottleneck.severity] * 2
        );
    }

    startRealTimeMonitoring() {
        console.log('📊 Starting real-time bottleneck monitoring...\n');

        setInterval(() => {
            this.collectMetrics()
                .then(metrics => {
                    const bottlenecks = this.analyzeBottlenecks(metrics);
                    if (bottlenecks.length > 0) {
                        this.handleDetectedBottlenecks(bottlenecks);
                    }
                })
                .catch(error => {
                    console.error('Error in bottleneck monitoring:', error.message);
                });
        }, 10000); // Check every 10 seconds
    }

    async collectMetrics() {
        // Simulate metrics collection
        // In real implementation, this would collect from actual monitoring systems
        return {
            concurrent_tasks: Math.floor(Math.random() * 10) + 1,
            avg_task_time: Math.random() * 2000 + 500,
            throughput: Math.random() * 50 + 10,
            memory_usage: Math.random() * 100,
            memory_history: Array.from({length: 10}, () => Math.random() * 100),
            cpu_usage: Math.random() * 100,
            long_tasks: Array.from({length: Math.floor(Math.random() * 5)}, () => Math.random() * 100 + 50),
            network_latency: Math.random() * 300 + 50,
            resource_count: Math.floor(Math.random() * 20) + 5,
            parallel_requests: Math.floor(Math.random() * 10) + 1,
            total_load_time: Math.random() * 3000 + 1000,
            query_times: Array.from({length: 10}, () => Math.random() * 1000 + 100),
            cache_hit_rate: Math.random() * 100,
            failed_requests: Math.floor(Math.random() * 5),
            total_requests: 100
        };
    }

    handleDetectedBottlenecks(bottlenecks) {
        const report = this.generateBottleneckReport(bottlenecks);

        console.log('\n🚨 PERFORMANCE BOTTLENECKS DETECTED');
        console.log('═'.repeat(50));
        console.log(`Overall Risk: ${report.summary.overallRisk.toUpperCase()}`);
        console.log(`Total Bottlenecks: ${report.summary.totalBottlenecks}`);
        console.log(`Critical: ${report.summary.criticalCount}, Warning: ${report.summary.warningCount}\n`);

        // Display top 3 bottlenecks
        const topBottlenecks = bottlenecks.slice(0, 3);
        for (const bottleneck of topBottlenecks) {
            const emoji = bottleneck.severity === 'critical' ? '🔴' : '🟡';
            console.log(`${emoji} ${bottleneck.name}`);
            console.log(`   Severity: ${bottleneck.severity} | Impact: ${bottleneck.impact}`);
            console.log(`   Category: ${bottleneck.category}`);

            if (bottleneck.recommendations.length > 0) {
                const topRec = bottleneck.recommendations[0];
                console.log(`   💡 Top Recommendation: ${topRec.strategy}`);
                console.log(`      Priority: ${topRec.priority} | Effort: ${topRec.effort} | Impact: ${topRec.impact}`);
            }
            console.log();
        }

        // Save detailed report
        this.saveBottleneckReport(report);

        // Trigger alerts for critical bottlenecks
        const criticalBottlenecks = bottlenecks.filter(b => b.severity === 'critical');
        if (criticalBottlenecks.length > 0) {
            this.triggerCriticalAlert(criticalBottlenecks);
        }
    }

    saveBottleneckReport(report) {
        const reportPath = `bottleneck-report-${Date.now()}.json`;
        try {
            require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
            console.log(`📄 Detailed report saved: ${reportPath}`);
        } catch (error) {
            console.error('Failed to save bottleneck report:', error.message);
        }
    }

    triggerCriticalAlert(criticalBottlenecks) {
        console.log('\n🚨 CRITICAL PERFORMANCE ALERT 🚨');
        console.log(`${criticalBottlenecks.length} critical bottleneck(s) detected!`);

        for (const bottleneck of criticalBottlenecks) {
            console.log(`- ${bottleneck.name}`);
        }

        console.log('\nImmediate action required to prevent performance degradation.');
    }

    // Utility methods
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    }

    // Public API for external integration
    getBottleneckSummary() {
        const bottlenecks = Array.from(this.bottlenecks.values());
        return this.generateBottleneckReport(bottlenecks);
    }

    getOptimizationStrategies(category = null) {
        if (category) {
            return this.optimizationStrategies.get(category) || [];
        }
        return Object.fromEntries(this.optimizationStrategies);
    }

    // Store results in hive mind collective memory
    async storeInCollectiveMemory() {
        const summary = this.getBottleneckSummary();
        const memoryData = {
            type: 'performance_bottleneck_analysis',
            timestamp: Date.now(),
            summary,
            detectionRules: Array.from(this.detectionRules.keys()),
            optimizationStrategies: Array.from(this.optimizationStrategies.keys())
        };

        try {
            const fs = require('fs').promises;
            await fs.mkdir('memory', { recursive: true });
            await fs.writeFile(
                'memory/performance-bottlenecks.json',
                JSON.stringify(memoryData, null, 2)
            );
            console.log('📊 Bottleneck analysis stored in collective memory');
        } catch (error) {
            console.log('⚠️  Could not store in collective memory:', error.message);
        }
    }
}

// Initialize and start monitoring
const detector = new PerformanceBottleneckDetector();

// Export for use in other modules
module.exports = PerformanceBottleneckDetector;

// Store in collective memory periodically
setInterval(() => {
    detector.storeInCollectiveMemory();
}, 60000); // Every minute

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Performance Bottleneck Detector...');
    detector.storeInCollectiveMemory();
    process.exit(0);
});