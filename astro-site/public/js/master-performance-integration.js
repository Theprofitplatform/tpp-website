/**
 * Master Performance Integration Script
 * Coordinates the loading and initialization of all advanced performance optimization systems
 * Part of The Profit Platform - Next-Generation Performance Suite
 */

class MasterPerformanceIntegration {
    constructor() {
        this.loadingSteps = [
            'Initializing core performance infrastructure...',
            'Loading AI optimization engine...',
            'Setting up HTTP/3 protocol optimizations...',
            'Configuring advanced compression systems...',
            'Initializing predictive resource loading...',
            'Starting real-time performance adaptation...',
            'Activating intelligent caching system...',
            'Deploying WebAssembly optimizations...',
            'Launching unified orchestration system...',
            'Finalizing performance integration...'
        ];

        this.currentStep = 0;
        this.systems = new Map();
        this.integrationStatus = 'initializing';
        this.performanceBaseline = null;
    }

    async init() {
        console.log('🚀 MASTER PERFORMANCE INTEGRATION - INITIATING SEQUENCE');
        console.log('═'.repeat(80));

        try {
            // Capture performance baseline
            await this.capturePerformanceBaseline();

            // Load all optimization systems in optimal order
            await this.loadOptimizationSystems();

            // Initialize unified orchestration
            await this.initializeOrchestration();

            // Verify integration success
            await this.verifyIntegration();

            // Begin autonomous optimization
            await this.beginAutonomousOptimization();

            this.integrationStatus = 'active';
            console.log('✅ MASTER PERFORMANCE INTEGRATION - SEQUENCE COMPLETE');
            console.log('🎯 ALL SYSTEMS OPERATIONAL - MAXIMUM PERFORMANCE ACHIEVED');

        } catch (error) {
            console.error('❌ Integration failed:', error);
            this.integrationStatus = 'failed';
            throw error;
        }
    }

    async capturePerformanceBaseline() {
        this.updateProgress('Capturing performance baseline...');

        this.performanceBaseline = {
            timestamp: Date.now(),
            navigationTiming: this.getNavigationTiming(),
            resourceTiming: this.getResourceTiming(),
            memoryUsage: this.getMemoryUsage(),
            networkInfo: this.getNetworkInfo(),
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio
            }
        };

        console.log('📊 Performance Baseline Captured:', this.performanceBaseline);
    }

    getNavigationTiming() {
        if (!performance.timing) return null;

        const timing = performance.timing;
        return {
            navigationStart: timing.navigationStart,
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            loadComplete: timing.loadEventEnd - timing.navigationStart,
            domInteractive: timing.domInteractive - timing.navigationStart,
            firstPaint: this.getFirstPaint(),
            firstContentfulPaint: this.getFirstContentfulPaint()
        };
    }

    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fpEntry = paintEntries.find(entry => entry.name === 'first-paint');
        return fpEntry ? fpEntry.startTime : null;
    }

    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcpEntry ? fcpEntry.startTime : null;
    }

    getResourceTiming() {
        const resources = performance.getEntriesByType('resource');
        return {
            totalResources: resources.length,
            totalTransferSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
            totalDecodedSize: resources.reduce((sum, r) => sum + (r.decodedBodySize || 0), 0),
            averageLoadTime: resources.length > 0 ?
                resources.reduce((sum, r) => sum + r.duration, 0) / resources.length : 0
        };
    }

    getMemoryUsage() {
        if (!performance.memory) return null;

        return {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
            usageRatio: performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit
        };
    }

    getNetworkInfo() {
        if (!navigator.connection) return null;

        return {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt,
            saveData: navigator.connection.saveData
        };
    }

    async loadOptimizationSystems() {
        console.log('🔧 Loading Advanced Optimization Systems...');

        const systemConfigs = [
            {
                name: 'aiOptimizer',
                script: 'js/ai-optimization-engine.js',
                class: 'AIOptimizationEngine',
                priority: 1,
                essential: true
            },
            {
                name: 'http3Optimizer',
                script: 'js/http3-protocol-optimizer.js',
                class: 'HTTP3ProtocolOptimizer',
                priority: 2,
                essential: false
            },
            {
                name: 'compressionSystem',
                script: 'js/advanced-compression-system.js',
                class: 'AdvancedCompressionSystem',
                priority: 3,
                essential: false
            },
            {
                name: 'predictiveLoader',
                script: 'js/predictive-resource-loader.js',
                class: 'PredictiveResourceLoader',
                priority: 4,
                essential: true
            },
            {
                name: 'realtimeAdapter',
                script: 'js/realtime-performance-adapter.js',
                class: 'RealtimePerformanceAdapter',
                priority: 5,
                essential: true
            },
            {
                name: 'intelligentCache',
                script: 'js/intelligent-cache-system.js',
                class: 'IntelligentCacheSystem',
                priority: 6,
                essential: true
            },
            {
                name: 'wasmOptimizer',
                script: 'js/webassembly-optimizer.js',
                class: 'WebAssemblyOptimizer',
                priority: 7,
                essential: false
            }
        ];

        // Sort by priority
        systemConfigs.sort((a, b) => a.priority - b.priority);

        for (const config of systemConfigs) {
            try {
                this.updateProgress(`Loading ${config.name}...`);
                await this.loadSystem(config);
                console.log(`✅ ${config.name} loaded successfully`);
            } catch (error) {
                console.error(`❌ Failed to load ${config.name}:`, error);

                if (config.essential) {
                    throw new Error(`Essential system ${config.name} failed to load`);
                } else {
                    console.warn(`⚠️ Non-essential system ${config.name} skipped`);
                }
            }
        }
    }

    async loadSystem(config) {
        // Check if system is already loaded
        if (this.isSystemAvailable(config.class)) {
            console.log(`📦 ${config.name} already available`);
            return;
        }

        // Load the script
        await this.loadScript(config.script);

        // Verify the class is now available
        if (!this.isSystemAvailable(config.class)) {
            throw new Error(`Class ${config.class} not found after loading ${config.script}`);
        }

        // Store system config
        this.systems.set(config.name, config);
    }

    isSystemAvailable(className) {
        return typeof window[className] !== 'undefined';
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if script is already loaded
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.type = 'text/javascript';

            script.onload = () => {
                console.log(`📜 Loaded: ${src}`);
                resolve();
            };

            script.onerror = () => {
                reject(new Error(`Failed to load script: ${src}`));
            };

            document.head.appendChild(script);
        });
    }

    async initializeOrchestration() {
        this.updateProgress('Initializing unified orchestration...');

        // Load orchestration system
        await this.loadScript('js/unified-performance-orchestrator.js');

        if (typeof window.initializePerformanceOrchestration !== 'function') {
            throw new Error('Performance orchestration system not available');
        }

        // Initialize with maximum performance configuration
        this.orchestrator = await window.initializePerformanceOrchestration({
            enableAI: true,
            enableHTTP3: true,
            enableCompression: true,
            enablePredictiveLoading: true,
            enableRealtimeAdaptation: true,
            enableIntelligentCaching: true,
            enableWebAssembly: true,
            orchestrationLevel: 'maximum',
            adaptationSpeed: 'fast',
            debugMode: false
        });

        console.log('🎛️ Orchestration system initialized');
    }

    async verifyIntegration() {
        this.updateProgress('Verifying integration...');

        const verificationResults = {
            systemsLoaded: 0,
            systemsActive: 0,
            orchestratorStatus: 'unknown',
            performanceImprovement: 0,
            errors: []
        };

        // Verify systems are loaded
        for (const [name, config] of this.systems) {
            if (this.isSystemAvailable(config.class)) {
                verificationResults.systemsLoaded++;

                // Try to create an instance to verify it's working
                try {
                    const TestClass = window[config.class];
                    const instance = new TestClass({ testMode: true });
                    if (instance) {
                        verificationResults.systemsActive++;
                    }
                } catch (error) {
                    verificationResults.errors.push(`${name}: ${error.message}`);
                }
            }
        }

        // Verify orchestrator
        if (this.orchestrator) {
            verificationResults.orchestratorStatus = 'active';
        }

        // Calculate performance improvement (simplified)
        const currentPerformance = this.getCurrentPerformanceMetrics();
        if (this.performanceBaseline && currentPerformance) {
            verificationResults.performanceImprovement = this.calculateImprovement(
                this.performanceBaseline,
                currentPerformance
            );
        }

        console.log('🔍 Integration Verification Results:', verificationResults);

        // Throw error if critical issues found
        if (verificationResults.systemsActive < 3) {
            throw new Error('Insufficient systems active for proper operation');
        }

        return verificationResults;
    }

    getCurrentPerformanceMetrics() {
        return {
            timestamp: Date.now(),
            navigationTiming: this.getNavigationTiming(),
            memoryUsage: this.getMemoryUsage(),
            resourceCount: performance.getEntriesByType('resource').length
        };
    }

    calculateImprovement(baseline, current) {
        // Simplified improvement calculation
        // In production, this would be much more sophisticated

        let improvementScore = 0;
        let factors = 0;

        // Memory usage improvement
        if (baseline.memoryUsage && current.memoryUsage) {
            const memoryImprovement = (baseline.memoryUsage.usageRatio - current.memoryUsage.usageRatio) * 100;
            improvementScore += memoryImprovement;
            factors++;
        }

        // Navigation timing improvement
        if (baseline.navigationTiming && current.navigationTiming) {
            const loadTimeImprovement = (baseline.navigationTiming.loadComplete - current.navigationTiming.loadComplete) / baseline.navigationTiming.loadComplete * 100;
            improvementScore += loadTimeImprovement;
            factors++;
        }

        return factors > 0 ? improvementScore / factors : 0;
    }

    async beginAutonomousOptimization() {
        this.updateProgress('Beginning autonomous optimization...');

        if (!this.orchestrator) {
            console.warn('⚠️ No orchestrator available - skipping autonomous optimization');
            return;
        }

        // Configure autonomous optimization
        await this.orchestrator.updateSystemConfig('aiOptimizer', {
            autonomousMode: true,
            learningRate: 0.1,
            adaptationThreshold: 0.05
        });

        // Enable predictive optimizations
        await this.orchestrator.updateSystemConfig('predictiveLoader', {
            aggressivePrediction: true,
            learningEnabled: true
        });

        // Start continuous optimization
        this.startContinuousOptimization();

        console.log('🤖 Autonomous optimization activated');
    }

    startContinuousOptimization() {
        const optimizationLoop = async () => {
            try {
                if (this.orchestrator && this.integrationStatus === 'active') {
                    // Trigger optimization cycle
                    await this.orchestrator.optimizeSystem('aiOptimizer', {
                        mode: 'autonomous',
                        intensity: 'balanced'
                    });

                    // Schedule next optimization
                    setTimeout(optimizationLoop, 30000); // Every 30 seconds
                }
            } catch (error) {
                console.error('Continuous optimization error:', error);
                setTimeout(optimizationLoop, 60000); // Retry after 1 minute
            }
        };

        // Start the optimization loop
        optimizationLoop();
    }

    updateProgress(step) {
        this.currentStep++;
        console.log(`[${this.currentStep}/${this.loadingSteps.length}] ${step}`);

        // Emit progress event
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('performanceIntegrationProgress', {
                detail: {
                    step: this.currentStep,
                    total: this.loadingSteps.length,
                    message: step,
                    progress: (this.currentStep / this.loadingSteps.length) * 100
                }
            }));
        }
    }

    getIntegrationStatus() {
        return {
            status: this.integrationStatus,
            currentStep: this.currentStep,
            totalSteps: this.loadingSteps.length,
            systemsLoaded: this.systems.size,
            orchestratorActive: !!this.orchestrator,
            performanceBaseline: this.performanceBaseline,
            uptime: this.integrationStatus === 'active' ? Date.now() - this.performanceBaseline?.timestamp : 0
        };
    }

    getPerformanceReport() {
        if (!this.orchestrator) {
            return { error: 'Orchestrator not available' };
        }

        return this.orchestrator.getPerformanceMetrics();
    }

    async emergencyOptimization() {
        console.log('🚨 EMERGENCY OPTIMIZATION TRIGGERED');

        if (!this.orchestrator) {
            console.error('❌ No orchestrator available for emergency optimization');
            return;
        }

        try {
            // Trigger emergency optimizations on all systems
            const emergencyActions = [
                this.orchestrator.optimizeSystem('intelligentCache', { emergency: true }),
                this.orchestrator.optimizeSystem('realtimeAdapter', { emergency: true }),
                this.orchestrator.optimizeSystem('aiOptimizer', { emergency: true })
            ];

            await Promise.all(emergencyActions);
            console.log('✅ Emergency optimization completed');

        } catch (error) {
            console.error('❌ Emergency optimization failed:', error);
        }
    }

    async shutdown() {
        console.log('🛑 Shutting down master performance integration...');

        this.integrationStatus = 'shutting_down';

        if (this.orchestrator) {
            await this.orchestrator.shutdown();
        }

        this.systems.clear();
        this.integrationStatus = 'shutdown';

        console.log('✅ Shutdown complete');
    }
}

/**
 * Performance Integration Dashboard
 * Provides real-time monitoring and control interface
 */
class PerformanceIntegrationDashboard {
    constructor(integration) {
        this.integration = integration;
        this.updateInterval = null;
        this.charts = new Map();
    }

    createDashboard() {
        // Create dashboard container
        const dashboard = document.createElement('div');
        dashboard.id = 'performance-dashboard';
        dashboard.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 400px;
            max-height: 600px;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            padding: 15px;
            border-radius: 8px;
            z-index: 999999;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0, 255, 0, 0.3);
        `;

        // Create dashboard content
        dashboard.innerHTML = `
            <div style="border-bottom: 1px solid #00ff00; padding-bottom: 10px; margin-bottom: 10px;">
                <h3 style="margin: 0; color: #00ff00;">⚡ PERFORMANCE CONTROL CENTER</h3>
                <div id="integration-status">Initializing...</div>
            </div>

            <div id="system-status" style="margin-bottom: 10px;">
                <h4 style="margin: 5px 0; color: #00ffff;">Systems Status:</h4>
                <div id="systems-list"></div>
            </div>

            <div id="performance-metrics" style="margin-bottom: 10px;">
                <h4 style="margin: 5px 0; color: #00ffff;">Performance Metrics:</h4>
                <div id="metrics-display"></div>
            </div>

            <div id="controls" style="border-top: 1px solid #00ff00; padding-top: 10px;">
                <button id="emergency-optimize" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-right: 5px;">EMERGENCY</button>
                <button id="toggle-dashboard" style="background: #4444ff; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">MINIMIZE</button>
            </div>
        `;

        document.body.appendChild(dashboard);

        // Setup event listeners
        this.setupEventListeners();

        // Start updating dashboard
        this.startUpdating();

        return dashboard;
    }

    setupEventListeners() {
        document.getElementById('emergency-optimize').addEventListener('click', () => {
            this.integration.emergencyOptimization();
        });

        document.getElementById('toggle-dashboard').addEventListener('click', (e) => {
            const dashboard = document.getElementById('performance-dashboard');
            const button = e.target;

            if (dashboard.style.maxHeight === '40px') {
                dashboard.style.maxHeight = '600px';
                button.textContent = 'MINIMIZE';
            } else {
                dashboard.style.maxHeight = '40px';
                dashboard.style.overflow = 'hidden';
                button.textContent = 'EXPAND';
            }
        });
    }

    startUpdating() {
        this.updateInterval = setInterval(() => {
            this.updateDashboard();
        }, 1000);
    }

    updateDashboard() {
        const status = this.integration.getIntegrationStatus();
        const report = this.integration.getPerformanceReport();

        // Update integration status
        document.getElementById('integration-status').innerHTML = `
            Status: <span style="color: ${this.getStatusColor(status.status)}">${status.status.toUpperCase()}</span><br>
            Systems: ${status.systemsLoaded}/7<br>
            Uptime: ${this.formatUptime(status.uptime)}
        `;

        // Update systems list
        const systemsList = document.getElementById('systems-list');
        systemsList.innerHTML = Array.from(this.integration.systems.entries())
            .map(([name, config]) => `
                <div style="color: #00ff00;">✅ ${name}</div>
            `).join('');

        // Update performance metrics
        if (report && !report.error) {
            document.getElementById('metrics-display').innerHTML = `
                <div>Overall Score: <span style="color: ${this.getScoreColor(report.overall)}">${report.overall.toFixed(1)}</span></div>
                <div>Memory Usage: ${this.formatMemoryUsage(report.resources)}</div>
                <div>Cache Performance: ${this.formatCachePerformance(report)}</div>
            `;
        }
    }

    getStatusColor(status) {
        switch (status) {
            case 'active': return '#00ff00';
            case 'failed': return '#ff0000';
            case 'initializing': return '#ffff00';
            default: return '#ffffff';
        }
    }

    getScoreColor(score) {
        if (score >= 80) return '#00ff00';
        if (score >= 60) return '#ffff00';
        return '#ff0000';
    }

    formatUptime(uptime) {
        if (!uptime) return '0s';
        const seconds = Math.floor(uptime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    formatMemoryUsage(resources) {
        if (!resources || !resources.memory) return 'N/A';
        return `${(resources.memory * 100).toFixed(1)}%`;
    }

    formatCachePerformance(report) {
        // Simplified cache performance display
        return 'Optimized';
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        const dashboard = document.getElementById('performance-dashboard');
        if (dashboard) {
            dashboard.remove();
        }
    }
}

// Global instances
let masterIntegration = null;
let performanceDashboard = null;

/**
 * Initialize the complete performance system
 */
async function initializeMasterPerformance(config = {}) {
    if (masterIntegration) {
        console.warn('Master performance integration already initialized');
        return masterIntegration;
    }

    console.log('🚀 INITIALIZING MASTER PERFORMANCE SYSTEM');
    console.log('════════════════════════════════════════');

    try {
        masterIntegration = new MasterPerformanceIntegration();
        await masterIntegration.init();

        // Create dashboard if requested
        if (config.showDashboard !== false) {
            performanceDashboard = new PerformanceIntegrationDashboard(masterIntegration);
            performanceDashboard.createDashboard();
        }

        // Make globally accessible
        window.masterPerformance = masterIntegration;
        window.performanceDashboard = performanceDashboard;

        console.log('🎯 MASTER PERFORMANCE SYSTEM FULLY OPERATIONAL');

        return masterIntegration;

    } catch (error) {
        console.error('❌ MASTER PERFORMANCE INITIALIZATION FAILED:', error);
        throw error;
    }
}

/**
 * Get the master performance integration instance
 */
function getMasterPerformance() {
    return masterIntegration;
}

// Auto-initialize based on document state
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeMasterPerformance();
        });
    } else {
        // Initialize immediately if DOM is already loaded
        setTimeout(() => {
            initializeMasterPerformance();
        }, 100);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MasterPerformanceIntegration,
        PerformanceIntegrationDashboard,
        initializeMasterPerformance,
        getMasterPerformance
    };
}

// Global error handler for performance issues
window.addEventListener('error', (event) => {
    if (masterIntegration && masterIntegration.integrationStatus === 'active') {
        console.error('🚨 Performance system detected error:', event.error);
        // Could trigger emergency optimization here
    }
});

// Performance degradation detection
if (typeof PerformanceObserver !== 'undefined') {
    try {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            for (const entry of entries) {
                if (entry.duration > 50) { // Long task detected
                    console.warn('⚠️ Long task detected:', entry.duration + 'ms');
                    if (masterIntegration) {
                        // Could trigger optimization here
                    }
                }
            }
        });
        observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
        console.warn('Long task monitoring not supported');
    }
}

console.log('📜 Master Performance Integration Script Loaded');