#!/usr/bin/env node

/**
 * HIVE MIND PERFORMANCE COORDINATION SYSTEM
 * Collective intelligence coordination for performance testing agents
 *
 * Features:
 * - Agent coordination and consensus mechanisms
 * - Collective memory sharing and synchronization
 * - Test strategy consensus and optimization
 * - Cross-agent communication and data sharing
 * - Performance trend analysis across agents
 * - Automated coordination hooks
 */

import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';

class HiveMindCoordinator extends EventEmitter {
    constructor(options = {}) {
        super();

        this.options = {
            memoryPath: options.memoryPath || './memory',
            coordinationPath: options.coordinationPath || './memory/coordination',
            agentRegistryPath: options.agentRegistryPath || './memory/agent-registry.json',
            collectiveMemoryPath: options.collectiveMemoryPath || './memory/collective-memory.json',
            consensusThreshold: options.consensusThreshold || 0.8,
            syncInterval: options.syncInterval || 30000, // 30 seconds
            maxAgents: options.maxAgents || 10,
            retentionPeriod: options.retentionPeriod || 7 * 24 * 60 * 60 * 1000, // 7 days
            coordinationHooks: {
                enabled: options.coordinationHooks !== false,
                preTest: options.preTestHook || null,
                postTest: options.postTestHook || null,
                onRegression: options.onRegressionHook || null,
                onImprovement: options.onImprovementHook || null
            },
            ...options
        };

        this.agents = new Map();
        this.collectiveMemory = {
            performanceMetrics: {},
            testStrategies: {},
            optimizations: {},
            regressions: [],
            improvements: [],
            consensus: {},
            lastSync: null
        };

        this.syncTimer = null;
        this.isCoordinating = false;
    }

    async initialize() {
        console.log('🧠 INITIALIZING HIVE MIND COORDINATION SYSTEM');
        console.log('═══════════════════════════════════════════════════════════\n');

        try {
            // Ensure memory directories exist
            await this.ensureDirectoryStructure();

            // Load existing collective memory
            await this.loadCollectiveMemory();

            // Load agent registry
            await this.loadAgentRegistry();

            // Start coordination synchronization
            await this.startCoordinationSync();

            this.isCoordinating = true;
            console.log('✅ Hive mind coordination system initialized');
            console.log(`   Registered agents: ${this.agents.size}`);
            console.log(`   Sync interval: ${this.options.syncInterval / 1000}s`);
            console.log(`   Consensus threshold: ${this.options.consensusThreshold}\n`);

            return this;

        } catch (error) {
            console.error('❌ Failed to initialize hive mind coordination:', error.message);
            throw error;
        }
    }

    async registerAgent(agentConfig) {
        const agentId = agentConfig.id || `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const agent = {
            id: agentId,
            type: agentConfig.type || 'unknown',
            name: agentConfig.name || `Agent ${agentId}`,
            capabilities: agentConfig.capabilities || [],
            status: 'active',
            registeredAt: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            metrics: {
                testsRun: 0,
                regressionsDetected: 0,
                improvementsFound: 0,
                accuracy: 0,
                uptime: 0
            },
            coordination: {
                consensusWeight: agentConfig.consensusWeight || 1.0,
                trustScore: 1.0,
                communicationPrefs: agentConfig.communicationPrefs || ['memory', 'hooks']
            },
            ...agentConfig
        };

        this.agents.set(agentId, agent);
        await this.saveAgentRegistry();

        console.log(`🤝 Agent registered: ${agent.name} (${agent.type})`);
        console.log(`   ID: ${agentId}`);
        console.log(`   Capabilities: ${agent.capabilities.join(', ')}`);
        console.log(`   Consensus weight: ${agent.coordination.consensusWeight}\n`);

        // Emit agent registration event
        this.emit('agent:registered', agent);

        // Execute coordination hooks
        if (this.options.coordinationHooks.enabled) {
            await this.executeCoordinationHook('agent:registered', { agent });
        }

        return agentId;
    }

    async sharePerformanceResults(agentId, results) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not registered`);
        }

        // Update agent metrics
        agent.metrics.testsRun += 1;
        agent.lastSeen = new Date().toISOString();

        if (results.regressions) {
            agent.metrics.regressionsDetected += results.regressions.length;
        }
        if (results.improvements) {
            agent.metrics.improvementsFound += results.improvements.length;
        }

        // Add results to collective memory
        const memoryEntry = {
            agentId,
            agentType: agent.type,
            timestamp: new Date().toISOString(),
            results,
            confidence: results.confidence || 0.8
        };

        // Store performance metrics
        if (results.metrics) {
            if (!this.collectiveMemory.performanceMetrics[agentId]) {
                this.collectiveMemory.performanceMetrics[agentId] = [];
            }
            this.collectiveMemory.performanceMetrics[agentId].push(memoryEntry);
        }

        // Store regressions
        if (results.regressions && results.regressions.length > 0) {
            results.regressions.forEach(regression => {
                this.collectiveMemory.regressions.push({
                    ...regression,
                    detectedBy: agentId,
                    timestamp: memoryEntry.timestamp,
                    confidence: results.confidence || 0.8
                });
            });

            // Execute regression hook
            if (this.options.coordinationHooks.onRegression) {
                await this.executeCoordinationHook('regression', { agent, regressions: results.regressions });
            }
        }

        // Store improvements
        if (results.improvements && results.improvements.length > 0) {
            results.improvements.forEach(improvement => {
                this.collectiveMemory.improvements.push({
                    ...improvement,
                    detectedBy: agentId,
                    timestamp: memoryEntry.timestamp,
                    confidence: results.confidence || 0.8
                });
            });

            // Execute improvement hook
            if (this.options.coordinationHooks.onImprovement) {
                await this.executeCoordinationHook('improvement', { agent, improvements: results.improvements });
            }
        }

        // Update collective memory
        await this.saveCollectiveMemory();
        await this.saveAgentRegistry();

        console.log(`📊 Results shared by ${agent.name}:`);
        console.log(`   Regressions: ${results.regressions?.length || 0}`);
        console.log(`   Improvements: ${results.improvements?.length || 0}`);
        console.log(`   Confidence: ${(results.confidence * 100).toFixed(1)}%\n`);

        // Emit results shared event
        this.emit('results:shared', { agent, results });

        // Trigger consensus analysis
        await this.analyzeConsensus();

        return memoryEntry;
    }

    async getCollectiveInsights() {
        console.log('🧠 Generating collective insights from hive mind...\n');

        const insights = {
            timestamp: new Date().toISOString(),
            agentCount: this.agents.size,
            totalTests: Array.from(this.agents.values()).reduce((sum, agent) => sum + agent.metrics.testsRun, 0),
            consensusData: this.collectiveMemory.consensus,
            trends: await this.analyzeTrends(),
            recommendations: await this.generateCollectiveRecommendations(),
            hotspots: await this.identifyPerformanceHotspots(),
            predictions: await this.generatePredictiveInsights()
        };

        console.log('📈 Collective Insights Generated:');
        console.log(`   Active agents: ${insights.agentCount}`);
        console.log(`   Total tests analyzed: ${insights.totalTests}`);
        console.log(`   Performance hotspots: ${insights.hotspots.length}`);
        console.log(`   Consensus strength: ${(insights.consensusData.strength * 100).toFixed(1)}%\n`);

        return insights;
    }

    async analyzeConsensus() {
        console.log('🗳️  Analyzing consensus across hive mind agents...');

        const recentRegressions = this.collectiveMemory.regressions
            .filter(r => Date.now() - new Date(r.timestamp).getTime() < 24 * 60 * 60 * 1000); // Last 24 hours

        const recentImprovements = this.collectiveMemory.improvements
            .filter(i => Date.now() - new Date(i.timestamp).getTime() < 24 * 60 * 60 * 1000); // Last 24 hours

        // Group findings by metric and page
        const consensusGroups = {};

        // Process regressions
        recentRegressions.forEach(regression => {
            const key = `${regression.page || 'all'}_${regression.metric}_regression`;
            if (!consensusGroups[key]) {
                consensusGroups[key] = {
                    type: 'regression',
                    metric: regression.metric,
                    page: regression.page,
                    reports: [],
                    consensus: false,
                    confidence: 0
                };
            }
            consensusGroups[key].reports.push(regression);
        });

        // Process improvements
        recentImprovements.forEach(improvement => {
            const key = `${improvement.page || 'all'}_${improvement.metric}_improvement`;
            if (!consensusGroups[key]) {
                consensusGroups[key] = {
                    type: 'improvement',
                    metric: improvement.metric,
                    page: improvement.page,
                    reports: [],
                    consensus: false,
                    confidence: 0
                };
            }
            consensusGroups[key].reports.push(improvement);
        });

        // Calculate consensus for each group
        const consensusResults = [];

        Object.entries(consensusGroups).forEach(([key, group]) => {
            const uniqueAgents = new Set(group.reports.map(r => r.detectedBy));
            const totalAgents = this.agents.size;
            const reportingAgents = uniqueAgents.size;
            const consensusRatio = reportingAgents / Math.max(totalAgents, 1);

            // Weight by agent trust scores
            const weightedConfidence = group.reports.reduce((sum, report) => {
                const agent = this.agents.get(report.detectedBy);
                const trustWeight = agent ? agent.coordination.trustScore : 1.0;
                return sum + (report.confidence * trustWeight);
            }, 0) / group.reports.length;

            group.consensus = consensusRatio >= this.options.consensusThreshold;
            group.confidence = Math.min(consensusRatio * weightedConfidence, 1.0);
            group.reportingAgents = reportingAgents;
            group.totalAgents = totalAgents;

            if (group.consensus) {
                consensusResults.push(group);
            }
        });

        // Update collective memory consensus
        this.collectiveMemory.consensus = {
            timestamp: new Date().toISOString(),
            threshold: this.options.consensusThreshold,
            totalFindings: Object.keys(consensusGroups).length,
            consensusFindings: consensusResults.length,
            strength: consensusResults.length / Math.max(Object.keys(consensusGroups).length, 1),
            results: consensusResults
        };

        await this.saveCollectiveMemory();

        console.log(`   Consensus findings: ${consensusResults.length}/${Object.keys(consensusGroups).length}`);
        console.log(`   Consensus strength: ${(this.collectiveMemory.consensus.strength * 100).toFixed(1)}%`);

        // Emit consensus events
        consensusResults.forEach(result => {
            this.emit('consensus:reached', result);
        });

        return this.collectiveMemory.consensus;
    }

    async analyzeTrends() {
        const trends = {
            performance: {},
            regressions: {},
            improvements: {},
            agentPerformance: {}
        };

        // Analyze performance trends across time
        const timeWindow = 7 * 24 * 60 * 60 * 1000; // 7 days
        const cutoffTime = Date.now() - timeWindow;

        // Performance metric trends
        Object.entries(this.collectiveMemory.performanceMetrics).forEach(([agentId, entries]) => {
            const recentEntries = entries.filter(entry =>
                new Date(entry.timestamp).getTime() > cutoffTime
            );

            if (recentEntries.length < 2) return;

            const agent = this.agents.get(agentId);
            if (!agent) return;

            trends.performance[agentId] = this.calculatePerformanceTrend(recentEntries);
        });

        // Regression trends
        const recentRegressions = this.collectiveMemory.regressions
            .filter(r => new Date(r.timestamp).getTime() > cutoffTime);

        const regressionsByMetric = this.groupBy(recentRegressions, 'metric');
        Object.entries(regressionsByMetric).forEach(([metric, regressions]) => {
            trends.regressions[metric] = {
                count: regressions.length,
                frequency: regressions.length / (timeWindow / (24 * 60 * 60 * 1000)), // per day
                averageSeverity: this.calculateAverageSeverity(regressions),
                trend: this.calculateCountTrend(regressions, timeWindow)
            };
        });

        // Agent performance trends
        this.agents.forEach((agent, agentId) => {
            trends.agentPerformance[agentId] = {
                testsPerDay: agent.metrics.testsRun / (timeWindow / (24 * 60 * 60 * 1000)),
                accuracy: this.calculateAgentAccuracy(agent),
                trustScore: agent.coordination.trustScore,
                reliability: this.calculateAgentReliability(agent)
            };
        });

        return trends;
    }

    calculatePerformanceTrend(entries) {
        if (entries.length < 2) return { trend: 'stable', confidence: 0 };

        // Simple linear regression on timestamps vs key metrics
        const dataPoints = entries.map(entry => ({
            timestamp: new Date(entry.timestamp).getTime(),
            value: this.extractKeyMetricValue(entry.results)
        })).filter(point => point.value !== null);

        if (dataPoints.length < 2) return { trend: 'stable', confidence: 0 };

        const n = dataPoints.length;
        const sumX = dataPoints.reduce((sum, point) => sum + point.timestamp, 0);
        const sumY = dataPoints.reduce((sum, point) => sum + point.value, 0);
        const sumXY = dataPoints.reduce((sum, point) => sum + (point.timestamp * point.value), 0);
        const sumXX = dataPoints.reduce((sum, point) => sum + (point.timestamp * point.timestamp), 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

        let trend = 'stable';
        if (slope > 0.01) trend = 'improving';
        else if (slope < -0.01) trend = 'degrading';

        // Calculate R-squared for confidence
        const yMean = sumY / n;
        const intercept = (sumY - slope * sumX) / n;
        const ssTotal = dataPoints.reduce((sum, point) => sum + Math.pow(point.value - yMean, 2), 0);
        const ssRes = dataPoints.reduce((sum, point) => {
            const predicted = slope * point.timestamp + intercept;
            return sum + Math.pow(point.value - predicted, 2);
        }, 0);

        const rSquared = ssTotal > 0 ? Math.max(0, 1 - (ssRes / ssTotal)) : 0;

        return {
            trend,
            slope,
            confidence: rSquared,
            dataPoints: dataPoints.length
        };
    }

    extractKeyMetricValue(results) {
        // Extract a representative performance value from results
        // Priority: FCP > LCP > Load Time > Response Time

        if (results.metrics?.webVitals) {
            const pages = Object.values(results.metrics.webVitals);
            if (pages.length > 0) {
                const page = pages[0]; // Use first page as representative
                return page.fcp || page.lcp || page.loadTime || 0;
            }
        }

        if (results.metrics?.loadTesting) {
            const levels = Object.values(results.metrics.loadTesting);
            if (levels.length > 0) {
                const level = levels[0]; // Use first level as representative
                return level.avgResponseTime || 0;
            }
        }

        return null;
    }

    calculateAverageSeverity(regressions) {
        if (regressions.length === 0) return 0;

        const severityScores = regressions.map(r => {
            switch (r.severity) {
                case 'critical': return 3;
                case 'high': return 2;
                case 'medium': return 1;
                case 'low': return 0.5;
                default: return 1;
            }
        });

        return severityScores.reduce((sum, score) => sum + score, 0) / severityScores.length;
    }

    calculateCountTrend(items, timeWindow) {
        if (items.length < 2) return 'stable';

        const midpoint = Date.now() - (timeWindow / 2);
        const recentCount = items.filter(item => new Date(item.timestamp).getTime() > midpoint).length;
        const olderCount = items.filter(item => new Date(item.timestamp).getTime() <= midpoint).length;

        const ratio = recentCount / Math.max(olderCount, 1);

        if (ratio > 1.5) return 'increasing';
        if (ratio < 0.5) return 'decreasing';
        return 'stable';
    }

    calculateAgentAccuracy(agent) {
        // Accuracy based on how often agent findings align with consensus
        const agentRegressions = this.collectiveMemory.regressions.filter(r => r.detectedBy === agent.id);
        const agentImprovements = this.collectiveMemory.improvements.filter(i => i.detectedBy === agent.id);

        const totalFindings = agentRegressions.length + agentImprovements.length;
        if (totalFindings === 0) return 1.0;

        const consensusResults = this.collectiveMemory.consensus.results || [];
        const confirmedFindings = consensusResults.filter(result =>
            result.reports.some(report => report.detectedBy === agent.id)
        ).length;

        return confirmedFindings / totalFindings;
    }

    calculateAgentReliability(agent) {
        // Reliability based on uptime and consistent reporting
        const expectedReports = Math.floor((Date.now() - new Date(agent.registeredAt).getTime()) / (60 * 60 * 1000)); // Expected hourly reports
        const actualReports = agent.metrics.testsRun;

        return Math.min(actualReports / Math.max(expectedReports, 1), 1.0);
    }

    async generateCollectiveRecommendations() {
        const recommendations = [];
        const consensusResults = this.collectiveMemory.consensus.results || [];

        // Recommendations based on consensus findings
        consensusResults.forEach(result => {
            if (result.type === 'regression' && result.consensus) {
                recommendations.push({
                    type: 'performance_regression',
                    priority: 'high',
                    confidence: result.confidence,
                    description: `Consensus detected ${result.metric} regression${result.page ? ` on ${result.page}` : ''}`,
                    actions: this.getMetricSpecificActions(result.metric, 'regression'),
                    supportingAgents: result.reportingAgents,
                    evidence: result.reports.length
                });
            }
        });

        // Recommendations based on trends
        const trends = await this.analyzeTrends();

        Object.entries(trends.regressions).forEach(([metric, trend]) => {
            if (trend.frequency > 1 && trend.trend === 'increasing') { // More than 1 regression per day and increasing
                recommendations.push({
                    type: 'trend_analysis',
                    priority: 'medium',
                    confidence: 0.8,
                    description: `Increasing regression trend detected for ${metric} (${trend.frequency.toFixed(1)} per day)`,
                    actions: [
                        'Implement additional monitoring for this metric',
                        'Review recent changes affecting this metric',
                        'Consider implementing preventive measures',
                        'Set up early warning alerts'
                    ],
                    evidence: trend.count
                });
            }
        });

        // Recommendations for agent coordination
        if (this.agents.size < 3) {
            recommendations.push({
                type: 'agent_coordination',
                priority: 'medium',
                confidence: 1.0,
                description: 'Low agent count may reduce consensus reliability',
                actions: [
                    'Consider deploying additional monitoring agents',
                    'Implement redundant testing strategies',
                    'Lower consensus threshold temporarily',
                    'Increase testing frequency'
                ],
                evidence: this.agents.size
            });
        }

        return recommendations;
    }

    getMetricSpecificActions(metric, type) {
        const actions = {
            fcp: [
                'Optimize critical rendering path',
                'Review server response times',
                'Check for render-blocking resources',
                'Analyze resource loading waterfall'
            ],
            lcp: [
                'Optimize largest content elements',
                'Implement resource hints (preload)',
                'Check image optimization',
                'Review server-side performance'
            ],
            cls: [
                'Add size attributes to images',
                'Reserve space for dynamic content',
                'Optimize font loading strategy',
                'Review layout shift sources'
            ],
            tti: [
                'Optimize JavaScript execution',
                'Implement code splitting',
                'Review third-party scripts',
                'Analyze main thread blocking'
            ],
            responseTime: [
                'Profile server performance',
                'Optimize database queries',
                'Review caching strategies',
                'Check infrastructure scaling'
            ],
            successRate: [
                'Investigate server errors',
                'Review error handling',
                'Check system capacity',
                'Analyze failure patterns'
            ]
        };

        return actions[metric] || [
            'Investigate recent changes',
            'Review performance monitoring',
            'Implement targeted optimizations',
            'Set up detailed alerts'
        ];
    }

    async identifyPerformanceHotspots() {
        const hotspots = [];
        const consensusResults = this.collectiveMemory.consensus.results || [];

        // Group consensus results by page and metric
        const hotspotsMap = {};

        consensusResults.forEach(result => {
            if (result.type === 'regression' && result.consensus) {
                const key = `${result.page || 'global'}_${result.metric}`;
                if (!hotspotsMap[key]) {
                    hotspotsMap[key] = {
                        page: result.page,
                        metric: result.metric,
                        severity: 0,
                        frequency: 0,
                        confidence: 0,
                        reports: []
                    };
                }

                hotspotsMap[key].frequency += result.reports.length;
                hotspotsMap[key].confidence = Math.max(hotspotsMap[key].confidence, result.confidence);
                hotspotsMap[key].reports.push(...result.reports);

                // Calculate severity score
                const severityScore = result.reports.reduce((sum, report) => {
                    switch (report.severity) {
                        case 'critical': return sum + 4;
                        case 'high': return sum + 3;
                        case 'medium': return sum + 2;
                        case 'low': return sum + 1;
                        default: return sum + 1;
                    }
                }, 0) / result.reports.length;

                hotspotsMap[key].severity = Math.max(hotspotsMap[key].severity, severityScore);
            }
        });

        // Convert to array and sort by severity * frequency * confidence
        Object.values(hotspotsMap).forEach(hotspot => {
            hotspot.score = hotspot.severity * hotspot.frequency * hotspot.confidence;
            hotspots.push(hotspot);
        });

        return hotspots.sort((a, b) => b.score - a.score).slice(0, 10); // Top 10 hotspots
    }

    async generatePredictiveInsights() {
        const predictions = [];
        const trends = await this.analyzeTrends();

        // Predict future regressions based on trends
        Object.entries(trends.regressions).forEach(([metric, trend]) => {
            if (trend.trend === 'increasing' && trend.frequency > 0.5) {
                const predictedIncrease = trend.frequency * 1.2; // 20% increase projection
                predictions.push({
                    type: 'regression_prediction',
                    metric,
                    timeframe: '7_days',
                    prediction: `Expected ${predictedIncrease.toFixed(1)} ${metric} regressions in next 7 days`,
                    confidence: trend.frequency > 1 ? 'high' : 'medium',
                    recommendedActions: [
                        `Implement preventive monitoring for ${metric}`,
                        'Review upcoming changes that might affect this metric',
                        'Consider performance budget enforcement'
                    ]
                });
            }
        });

        // Predict agent performance
        Object.entries(trends.agentPerformance).forEach(([agentId, performance]) => {
            const agent = this.agents.get(agentId);
            if (!agent) return;

            if (performance.reliability < 0.8) {
                predictions.push({
                    type: 'agent_reliability',
                    agentId,
                    agentName: agent.name,
                    timeframe: 'immediate',
                    prediction: `Agent ${agent.name} showing reduced reliability (${(performance.reliability * 100).toFixed(1)}%)`,
                    confidence: 'high',
                    recommendedActions: [
                        'Check agent health and connectivity',
                        'Review agent configuration',
                        'Consider agent restart or replacement'
                    ]
                });
            }
        });

        return predictions;
    }

    async executeCoordinationHook(hookType, data) {
        if (!this.options.coordinationHooks.enabled) return;

        try {
            const hookFunction = this.options.coordinationHooks[hookType];
            if (typeof hookFunction === 'function') {
                await hookFunction(data);
            } else if (typeof hookFunction === 'string') {
                // Execute shell command
                const { spawn } = await import('child_process');
                const child = spawn(hookFunction, [], {
                    stdio: 'inherit',
                    env: {
                        ...process.env,
                        HOOK_TYPE: hookType,
                        HOOK_DATA: JSON.stringify(data)
                    }
                });

                await new Promise((resolve, reject) => {
                    child.on('close', (code) => {
                        if (code === 0) {
                            resolve();
                        } else {
                            reject(new Error(`Hook ${hookType} exited with code ${code}`));
                        }
                    });
                });
            }

            console.log(`🔗 Executed coordination hook: ${hookType}`);

        } catch (error) {
            console.error(`❌ Coordination hook failed (${hookType}):`, error.message);
        }
    }

    async startCoordinationSync() {
        if (this.syncTimer) return;

        this.syncTimer = setInterval(async () => {
            try {
                console.log(`[${new Date().toISOString()}] 🔄 Running coordination sync...`);

                // Update agent last seen times
                this.updateAgentStatus();

                // Clean up old data
                await this.cleanupOldData();

                // Analyze consensus
                await this.analyzeConsensus();

                // Update collective memory
                this.collectiveMemory.lastSync = new Date().toISOString();
                await this.saveCollectiveMemory();

                console.log('✅ Coordination sync completed\n');

            } catch (error) {
                console.error('❌ Coordination sync failed:', error.message);
            }
        }, this.options.syncInterval);

        console.log(`🔄 Coordination sync started (interval: ${this.options.syncInterval / 1000}s)`);
    }

    updateAgentStatus() {
        const now = Date.now();
        const staleThreshold = 5 * 60 * 1000; // 5 minutes

        this.agents.forEach((agent, agentId) => {
            const lastSeen = new Date(agent.lastSeen).getTime();
            const timeSinceLastSeen = now - lastSeen;

            if (timeSinceLastSeen > staleThreshold) {
                agent.status = 'stale';
            } else {
                agent.status = 'active';
            }

            // Update uptime
            agent.metrics.uptime = now - new Date(agent.registeredAt).getTime();
        });
    }

    async cleanupOldData() {
        const cutoffTime = Date.now() - this.options.retentionPeriod;

        // Clean up old performance metrics
        Object.keys(this.collectiveMemory.performanceMetrics).forEach(agentId => {
            this.collectiveMemory.performanceMetrics[agentId] =
                this.collectiveMemory.performanceMetrics[agentId].filter(entry =>
                    new Date(entry.timestamp).getTime() > cutoffTime
                );
        });

        // Clean up old regressions and improvements
        this.collectiveMemory.regressions = this.collectiveMemory.regressions
            .filter(r => new Date(r.timestamp).getTime() > cutoffTime);

        this.collectiveMemory.improvements = this.collectiveMemory.improvements
            .filter(i => new Date(i.timestamp).getTime() > cutoffTime);
    }

    async shutdown() {
        console.log('🛑 Shutting down hive mind coordination...');

        this.isCoordinating = false;

        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }

        // Save final state
        await this.saveCollectiveMemory();
        await this.saveAgentRegistry();

        console.log('✅ Hive mind coordination shutdown complete');
    }

    // Storage methods
    async ensureDirectoryStructure() {
        const directories = [
            this.options.memoryPath,
            this.options.coordinationPath,
            path.dirname(this.options.agentRegistryPath),
            path.dirname(this.options.collectiveMemoryPath)
        ];

        for (const dir of directories) {
            await fs.mkdir(dir, { recursive: true });
        }
    }

    async loadCollectiveMemory() {
        try {
            const data = await fs.readFile(this.options.collectiveMemoryPath, 'utf8');
            this.collectiveMemory = { ...this.collectiveMemory, ...JSON.parse(data) };
            console.log(`📚 Loaded collective memory: ${Object.keys(this.collectiveMemory.performanceMetrics).length} agent datasets`);
        } catch (error) {
            console.log('⚠️  No existing collective memory found, starting fresh');
        }
    }

    async saveCollectiveMemory() {
        await fs.writeFile(
            this.options.collectiveMemoryPath,
            JSON.stringify(this.collectiveMemory, null, 2)
        );
    }

    async loadAgentRegistry() {
        try {
            const data = await fs.readFile(this.options.agentRegistryPath, 'utf8');
            const agentsData = JSON.parse(data);

            this.agents.clear();
            Object.entries(agentsData).forEach(([id, agent]) => {
                this.agents.set(id, agent);
            });

            console.log(`🤖 Loaded agent registry: ${this.agents.size} agents`);
        } catch (error) {
            console.log('⚠️  No existing agent registry found, starting fresh');
        }
    }

    async saveAgentRegistry() {
        const agentsData = Object.fromEntries(this.agents.entries());
        await fs.writeFile(
            this.options.agentRegistryPath,
            JSON.stringify(agentsData, null, 2)
        );
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

    // Public API methods for agents
    async getAgentStatus(agentId) {
        return this.agents.get(agentId);
    }

    async getConsensusStatus() {
        return this.collectiveMemory.consensus;
    }

    async getCollectiveMemorySnapshot() {
        return {
            ...this.collectiveMemory,
            agentCount: this.agents.size,
            activeAgents: Array.from(this.agents.values()).filter(a => a.status === 'active').length
        };
    }
}

export default HiveMindCoordinator;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const coordinator = new HiveMindCoordinator({
        memoryPath: './memory',
        consensusThreshold: 0.8,
        syncInterval: 30000
    });

    coordinator.initialize().then(() => {
        console.log('🧠 Hive mind coordinator running...');
        console.log('   Press Ctrl+C to shutdown');

        // Handle graceful shutdown
        process.on('SIGINT', () => coordinator.shutdown().then(() => process.exit(0)));
        process.on('SIGTERM', () => coordinator.shutdown().then(() => process.exit(0)));

    }).catch(console.error);
}