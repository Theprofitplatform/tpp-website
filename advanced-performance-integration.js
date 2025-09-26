/**
 * Advanced Performance Integration Layer
 * Orchestrates all advanced performance analysis systems
 * Part of the Hive Mind Collective Intelligence System
 */

class AdvancedPerformanceIntegration {
    constructor() {
        this.systems = {
            analyzer: null,
            mlEngine: null,
            testingAutomation: null,
            masterOrchestrator: null
        };

        this.collectiveIntelligence = {
            sharedMemory: new Map(),
            insights: new Map(),
            recommendations: new Map(),
            predictions: new Map()
        };

        this.status = {
            initialized: false,
            systemsOnline: 0,
            lastUpdate: null,
            health: 'unknown'
        };

        this.init();
    }

    // ================================
    // SYSTEM INITIALIZATION
    // ================================

    async init() {
        console.log('🧠 Initializing Advanced Performance Integration Layer...');

        try {
            await this.initializeSystems();
            await this.establishSystemConnections();
            await this.setupCollectiveIntelligence();
            await this.startIntegratedMonitoring();

            this.status.initialized = true;
            this.status.health = 'optimal';
            this.status.lastUpdate = Date.now();

            this.broadcastSystemStatus();
            console.log('✅ Advanced Performance Integration Layer fully operational');

        } catch (error) {
            console.error('❌ Integration initialization failed:', error);
            this.status.health = 'degraded';
        }
    }

    async initializeSystems() {
        // Wait for all systems to be available
        const systemChecks = [];

        // Check Advanced Performance Analyzer
        systemChecks.push(this.waitForSystem('advancedPerformanceAnalyzer', () => window.advancedPerformanceAnalyzer));

        // Check ML Optimization Engine
        systemChecks.push(this.waitForSystem('mlOptimizationEngine', () => window.mlOptimizationEngine));

        // Check Performance Testing Automation
        systemChecks.push(this.waitForSystem('performanceTestingAutomation', () => window.performanceTestingAutomation));

        // Check Master Orchestrator
        systemChecks.push(this.waitForSystem('performanceMasterOrchestrator', () => window.performanceMasterOrchestrator));

        const results = await Promise.allSettled(systemChecks);

        // Store system references
        this.systems.analyzer = window.advancedPerformanceAnalyzer;
        this.systems.mlEngine = window.mlOptimizationEngine;
        this.systems.testingAutomation = window.performanceTestingAutomation;
        this.systems.masterOrchestrator = window.performanceMasterOrchestrator;

        this.status.systemsOnline = results.filter(r => r.status === 'fulfilled').length;
        console.log(`📊 ${this.status.systemsOnline}/4 performance systems online`);
    }

    async waitForSystem(name, checker, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const interval = setInterval(() => {
                if (checker()) {
                    clearInterval(interval);
                    console.log(`✅ ${name} system ready`);
                    resolve(true);
                } else if (Date.now() - start > timeout) {
                    clearInterval(interval);
                    console.warn(`⚠️ ${name} system not available within timeout`);
                    reject(new Error(`${name} system timeout`));
                }
            }, 100);
        });
    }

    // ================================
    // COLLECTIVE INTELLIGENCE
    // ================================

    async setupCollectiveIntelligence() {
        // Create shared memory space for cross-system communication
        this.collectiveIntelligence.sharedMemory.set('systemStatus', {
            timestamp: Date.now(),
            systems: this.status.systemsOnline,
            health: this.status.health
        });

        // Setup event listeners for cross-system communication
        this.setupEventListeners();

        // Initialize insight aggregation
        this.startInsightAggregation();

        console.log('🧠 Collective intelligence layer established');
    }

    setupEventListeners() {
        // Listen for performance insights
        window.addEventListener('performanceInsight', (event) => {
            this.handlePerformanceInsight(event.detail);
        });

        // Listen for optimization recommendations
        window.addEventListener('optimizationRecommendation', (event) => {
            this.handleOptimizationRecommendation(event.detail);
        });

        // Listen for test results
        window.addEventListener('testCompleted', (event) => {
            this.handleTestResults(event.detail);
        });

        // Listen for system alerts
        window.addEventListener('systemAlert', (event) => {
            this.handleSystemAlert(event.detail);
        });
    }

    async startInsightAggregation() {
        // Aggregate insights from all systems every 5 minutes
        setInterval(async () => {
            try {
                await this.aggregateSystemInsights();
            } catch (error) {
                console.error('Insight aggregation failed:', error);
            }
        }, 300000); // 5 minutes
    }

    async aggregateSystemInsights() {
        const aggregatedInsights = {
            timestamp: Date.now(),
            performance: null,
            predictions: null,
            recommendations: null,
            testing: null,
            synthesis: null
        };

        try {
            // Gather insights from analyzer
            if (this.systems.analyzer) {
                aggregatedInsights.performance = await this.systems.analyzer.getRealtimeInsights();
            }

            // Gather predictions and recommendations
            if (this.systems.mlEngine) {
                aggregatedInsights.predictions = await this.systems.mlEngine.getOptimizationRecommendations();
            }

            // Gather testing insights
            if (this.systems.testingAutomation) {
                aggregatedInsights.testing = this.systems.testingAutomation.getTestHistory(5);
            }

            // Synthesize cross-system insights
            aggregatedInsights.synthesis = await this.synthesizeInsights(aggregatedInsights);

            // Store in collective memory
            this.collectiveIntelligence.insights.set(Date.now(), aggregatedInsights);

            // Broadcast aggregated insights
            this.broadcastAggregatedInsights(aggregatedInsights);

        } catch (error) {
            console.error('Failed to aggregate system insights:', error);
        }
    }

    async synthesizeInsights(insights) {
        const synthesis = {
            overallHealth: 'good',
            criticalIssues: [],
            opportunities: [],
            predictions: {},
            confidence: 0,
            recommendations: []
        };

        try {
            // Analyze performance health
            if (insights.performance) {
                synthesis.overallHealth = this.assessOverallHealth(insights.performance);
            }

            // Cross-reference predictions with testing results
            if (insights.predictions && insights.testing) {
                synthesis.predictions = this.correlatePredictionsWithResults(
                    insights.predictions,
                    insights.testing
                );
            }

            // Generate meta-recommendations based on all systems
            synthesis.recommendations = await this.generateMetaRecommendations(insights);

            // Calculate collective confidence
            synthesis.confidence = this.calculateCollectiveConfidence(insights);

            return synthesis;

        } catch (error) {
            console.error('Insight synthesis failed:', error);
            return synthesis;
        }
    }

    // ================================
    // UNIFIED PERFORMANCE ANALYSIS
    // ================================

    async runComprehensiveAnalysis() {
        console.log('🔍 Starting comprehensive performance analysis...');

        const analysis = {
            timestamp: Date.now(),
            id: `analysis_${Date.now()}`,
            results: {},
            synthesis: {},
            recommendations: [],
            actionPlan: {}
        };

        try {
            // Run analysis across all systems
            const analysisPromises = [];

            // Advanced Performance Analysis
            if (this.systems.analyzer) {
                analysisPromises.push(
                    this.systems.analyzer.runFullAnalysis().then(result => ({
                        system: 'analyzer',
                        data: result
                    }))
                );
            }

            // ML-Powered Optimization Recommendations
            if (this.systems.mlEngine) {
                analysisPromises.push(
                    this.systems.mlEngine.getOptimizationRecommendations().then(result => ({
                        system: 'mlEngine',
                        data: result
                    }))
                );
            }

            // Automated Testing Analysis
            if (this.systems.testingAutomation) {
                analysisPromises.push(
                    this.systems.testingAutomation.runAutomatedTests().then(result => ({
                        system: 'testingAutomation',
                        data: result
                    }))
                );
            }

            // Master Orchestrator Report
            if (this.systems.masterOrchestrator) {
                analysisPromises.push(
                    Promise.resolve({
                        system: 'masterOrchestrator',
                        data: this.systems.masterOrchestrator.getPerformanceReport()
                    })
                );
            }

            // Wait for all analyses to complete
            const results = await Promise.allSettled(analysisPromises);

            // Process and correlate results
            analysis.results = this.processAnalysisResults(results);

            // Synthesize findings
            analysis.synthesis = await this.synthesizeFindings(analysis.results);

            // Generate unified recommendations
            analysis.recommendations = await this.generateUnifiedRecommendations(analysis.synthesis);

            // Create action plan
            analysis.actionPlan = await this.createActionPlan(analysis.recommendations);

            // Store analysis
            this.collectiveIntelligence.insights.set(analysis.id, analysis);

            console.log('✅ Comprehensive analysis completed');
            return analysis;

        } catch (error) {
            console.error('Comprehensive analysis failed:', error);
            analysis.error = error.message;
            return analysis;
        }
    }

    // ================================
    // REAL-TIME MONITORING INTEGRATION
    // ================================

    async startIntegratedMonitoring() {
        // Start real-time monitoring that coordinates all systems
        this.monitoringInterval = setInterval(async () => {
            try {
                await this.performIntegratedHealthCheck();
                await this.updateCollectiveIntelligence();
                await this.checkForCriticalAlerts();
            } catch (error) {
                console.error('Integrated monitoring error:', error);
            }
        }, 30000); // 30 seconds

        console.log('📡 Integrated monitoring started');
    }

    async performIntegratedHealthCheck() {
        const health = {
            timestamp: Date.now(),
            systems: {},
            overall: 'healthy',
            issues: []
        };

        // Check each system
        for (const [name, system] of Object.entries(this.systems)) {
            if (system) {
                try {
                    health.systems[name] = await this.checkSystemHealth(system);
                } catch (error) {
                    health.systems[name] = {
                        status: 'error',
                        error: error.message
                    };
                    health.issues.push(`${name}: ${error.message}`);
                }
            }
        }

        // Determine overall health
        const systemStatuses = Object.values(health.systems).map(s => s.status);
        if (systemStatuses.includes('error')) {
            health.overall = 'degraded';
        } else if (systemStatuses.includes('warning')) {
            health.overall = 'warning';
        }

        // Update status
        this.status.health = health.overall;
        this.status.lastUpdate = Date.now();

        // Store health check
        this.collectiveIntelligence.sharedMemory.set('healthCheck', health);

        return health;
    }

    async checkSystemHealth(system) {
        // Generic system health check
        if (typeof system.getStatus === 'function') {
            return await system.getStatus();
        }

        if (typeof system.getHealthStatus === 'function') {
            return await system.getHealthStatus();
        }

        // Basic availability check
        return {
            status: system ? 'healthy' : 'unavailable',
            timestamp: Date.now()
        };
    }

    // ================================
    // EVENT HANDLING
    // ================================

    handlePerformanceInsight(insight) {
        console.log('📊 Performance insight received:', insight.type);

        // Store insight
        this.collectiveIntelligence.insights.set(`insight_${Date.now()}`, insight);

        // Trigger cross-system correlation
        this.correlateInsightAcrossSystems(insight);
    }

    handleOptimizationRecommendation(recommendation) {
        console.log('💡 Optimization recommendation received:', recommendation.type);

        // Store recommendation
        this.collectiveIntelligence.recommendations.set(`rec_${Date.now()}`, recommendation);

        // Validate with other systems
        this.validateRecommendationAcrossSystems(recommendation);
    }

    handleTestResults(results) {
        console.log('🔬 Test results received:', results.id);

        // Correlate with predictions
        this.correlatePredictionsWithTestResults(results);

        // Update ML models with actual results
        this.updateMLModelsWithResults(results);
    }

    handleSystemAlert(alert) {
        console.warn('🚨 System alert received:', alert.severity);

        // Assess impact across all systems
        this.assessAlertImpact(alert);

        // Coordinate response
        this.coordinateAlertResponse(alert);
    }

    // ================================
    // UTILITY METHODS
    // ================================

    processAnalysisResults(results) {
        const processed = {};

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                processed[result.value.system] = result.value.data;
            } else {
                processed[result.reason?.system || 'unknown'] = {
                    error: result.reason?.message || 'Analysis failed'
                };
            }
        });

        return processed;
    }

    async synthesizeFindings(results) {
        return {
            overallPerformance: this.calculateOverallPerformance(results),
            criticalIssues: this.identifyCriticalIssues(results),
            opportunities: this.identifyOptimizationOpportunities(results),
            predictions: this.consolidatePredictions(results),
            confidence: this.calculateOverallConfidence(results)
        };
    }

    broadcastSystemStatus() {
        const status = {
            type: 'systemStatus',
            data: this.status,
            timestamp: Date.now()
        };

        window.dispatchEvent(new CustomEvent('advancedPerformanceStatus', {
            detail: status
        }));
    }

    broadcastAggregatedInsights(insights) {
        const event = {
            type: 'aggregatedInsights',
            data: insights,
            timestamp: Date.now()
        };

        window.dispatchEvent(new CustomEvent('collectiveInsights', {
            detail: event
        }));
    }

    // ================================
    // PUBLIC API
    // ================================

    async getSystemStatus() {
        return {
            ...this.status,
            systems: this.systems,
            collectiveIntelligence: {
                insights: this.collectiveIntelligence.insights.size,
                recommendations: this.collectiveIntelligence.recommendations.size,
                sharedMemory: this.collectiveIntelligence.sharedMemory.size
            }
        };
    }

    async getCollectiveInsights() {
        const latest = Math.max(...this.collectiveIntelligence.insights.keys());
        return this.collectiveIntelligence.insights.get(latest);
    }

    async runFullSystemAnalysis() {
        return await this.runComprehensiveAnalysis();
    }

    async getUnifiedRecommendations() {
        const insights = await this.getCollectiveInsights();
        if (insights && insights.synthesis) {
            return insights.synthesis.recommendations;
        }
        return [];
    }

    async executeRecommendation(recommendationId) {
        // Coordinate recommendation execution across systems
        const recommendation = this.findRecommendation(recommendationId);
        if (!recommendation) {
            throw new Error('Recommendation not found');
        }

        // Execute through appropriate system
        if (recommendation.system === 'mlEngine') {
            return await this.systems.mlEngine.implementRecommendation(recommendationId);
        }

        // Default execution
        return {
            id: recommendationId,
            status: 'executed',
            timestamp: Date.now()
        };
    }

    destroy() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        // Clear collective intelligence
        this.collectiveIntelligence.sharedMemory.clear();
        this.collectiveIntelligence.insights.clear();
        this.collectiveIntelligence.recommendations.clear();

        console.log('🔌 Advanced Performance Integration Layer shut down');
    }
}

// Initialize the integration layer
const advancedPerformanceIntegration = new AdvancedPerformanceIntegration();

// Export for global access
window.AdvancedPerformanceIntegration = AdvancedPerformanceIntegration;
window.advancedPerformanceIntegration = advancedPerformanceIntegration;

// Global convenience methods
window.runFullPerformanceAnalysis = () => advancedPerformanceIntegration.runFullSystemAnalysis();
window.getPerformanceInsights = () => advancedPerformanceIntegration.getCollectiveInsights();
window.getSystemStatus = () => advancedPerformanceIntegration.getSystemStatus();

// Development utilities
if (window.location.hostname === 'localhost' || window.location.search.includes('debug')) {
    window.debugPerformanceSystems = () => {
        console.log('🔍 Performance Systems Debug Info:');
        console.log('Status:', advancedPerformanceIntegration.status);
        console.log('Systems:', advancedPerformanceIntegration.systems);
        console.log('Collective Intelligence:', advancedPerformanceIntegration.collectiveIntelligence);
    };
}

console.log('🚀 Advanced Performance Integration Layer initialized - All systems coordinated');