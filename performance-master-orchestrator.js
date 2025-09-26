/**
 * The Profit Platform - Performance Master Orchestrator
 * Coordinates all performance optimizations and provides unified control
 */

class PerformanceMasterOrchestrator {
    constructor(options = {}) {
        this.options = {
            enableAllOptimizations: true,
            performanceMonitoring: true,
            automaticOptimization: true,
            reportingEnabled: true,
            adaptiveOptimization: true,
            debugMode: false,
            ...options
        };

        this.optimizers = {
            performance: null,
            jsBundle: null,
            css: null,
            resourceLoader: null
        };

        this.metrics = {
            initialization: null,
            optimizationResults: new Map(),
            overallPerformanceScore: 0,
            recommendations: []
        };

        this.status = {
            initialized: false,
            optimizationsActive: false,
            lastOptimization: null,
            errors: []
        };

        this.init();
    }

    // ================================
    // INITIALIZATION & ORCHESTRATION
    // ================================

    async init() {
        const startTime = performance.now();

        try {
            await this.initializeOptimizers();
            await this.runInitialOptimizations();
            this.setupMonitoring();
            this.setupAdaptiveOptimization();

            const initTime = performance.now() - startTime;
            this.metrics.initialization = {
                duration: initTime,
                timestamp: Date.now(),
                success: true
            };

            this.status.initialized = true;
            this.status.optimizationsActive = true;

            this.log(`Performance Master Orchestrator initialized in ${initTime.toFixed(2)}ms`);
            this.reportInitialization();

        } catch (error) {
            this.handleError('Initialization failed', error);
            this.status.initialized = false;
        }
    }

    async initializeOptimizers() {
        const initPromises = [];

        // Initialize Performance Optimizer
        if (window.PerformanceOptimizer) {
            try {
                this.optimizers.performance = new PerformanceOptimizer();
                this.log('Performance Optimizer initialized');
            } catch (error) {
                this.handleError('Performance Optimizer initialization failed', error);
            }
        }

        // Initialize JS Bundler Optimizer
        if (window.JSBundlerOptimizer) {
            try {
                this.optimizers.jsBundle = new JSBundlerOptimizer({
                    bundleStrategy: this.determineBundleStrategy(),
                    minify: true,
                    compressionLevel: 'high'
                });
                this.log('JS Bundler Optimizer initialized');
            } catch (error) {
                this.handleError('JS Bundler Optimizer initialization failed', error);
            }
        }

        // Initialize CSS Optimizer
        if (window.CSSOptimizer) {
            try {
                this.optimizers.css = new CSSOptimizer({
                    criticalCSS: true,
                    consolidation: true,
                    minification: true,
                    unusedCSSRemoval: this.shouldRemoveUnusedCSS(),
                    inlineCritical: true,
                    deferNonCritical: true
                });
                this.log('CSS Optimizer initialized');
            } catch (error) {
                this.handleError('CSS Optimizer initialization failed', error);
            }
        }

        // Initialize Resource Loader Optimizer
        if (window.ResourceLoaderOptimizer) {
            try {
                this.optimizers.resourceLoader = new ResourceLoaderOptimizer({
                    preloading: true,
                    prefetching: this.shouldEnablePrefetching(),
                    lazyLoading: true,
                    serviceWorkerCaching: true,
                    adaptiveLoading: true,
                    connectionAware: true
                });
                this.log('Resource Loader Optimizer initialized');
            } catch (error) {
                this.handleError('Resource Loader Optimizer initialization failed', error);
            }
        }

        return Promise.all(initPromises);
    }

    async runInitialOptimizations() {
        this.log('Starting initial optimizations...');

        const optimizationPromises = [];

        // Run optimizations in parallel where possible
        if (this.optimizers.performance) {
            optimizationPromises.push(
                this.runOptimization('performance', () => {
                    // Performance optimizer runs automatically
                    return this.optimizers.performance.getMetrics();
                })
            );
        }

        if (this.optimizers.jsBundle) {
            optimizationPromises.push(
                this.runOptimization('jsBundle', async () => {
                    // Bundle optimization happens during initialization
                    return this.optimizers.jsBundle.getOptimizationStats();
                })
            );
        }

        if (this.optimizers.css) {
            optimizationPromises.push(
                this.runOptimization('css', async () => {
                    // CSS optimization happens during initialization
                    return this.optimizers.css.getOptimizationStats();
                })
            );
        }

        if (this.optimizers.resourceLoader) {
            optimizationPromises.push(
                this.runOptimization('resourceLoader', async () => {
                    // Resource optimization happens during initialization
                    return this.optimizers.resourceLoader.getLoadingStats();
                })
            );
        }

        await Promise.allSettled(optimizationPromises);

        this.calculateOverallPerformanceScore();
        this.generateRecommendations();

        this.log('Initial optimizations completed');
    }

    // ================================
    // OPTIMIZATION EXECUTION
    // ================================

    async runOptimization(optimizerName, optimizationFunction) {
        const startTime = performance.now();

        try {
            const result = await optimizationFunction();
            const duration = performance.now() - startTime;

            this.metrics.optimizationResults.set(optimizerName, {
                result,
                duration,
                timestamp: Date.now(),
                success: true
            });

            this.log(`${optimizerName} optimization completed in ${duration.toFixed(2)}ms`);
            return result;

        } catch (error) {
            const duration = performance.now() - startTime;

            this.metrics.optimizationResults.set(optimizerName, {
                error: error.message,
                duration,
                timestamp: Date.now(),
                success: false
            });

            this.handleError(`${optimizerName} optimization failed`, error);
            throw error;
        }
    }

    // ================================
    // ADAPTIVE OPTIMIZATION
    // ================================

    setupAdaptiveOptimization() {
        if (!this.options.adaptiveOptimization) return;

        // Monitor performance changes and adapt
        this.performanceMonitoringInterval = setInterval(() => {
            this.checkPerformanceMetrics();
        }, 30000); // Check every 30 seconds

        // React to network changes
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.adaptToNetworkConditions();
            });
        }

        // React to page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseNonCriticalOptimizations();
            } else {
                this.resumeOptimizations();
            }
        });

        this.log('Adaptive optimization enabled');
    }

    async checkPerformanceMetrics() {
        if (!this.optimizers.performance) return;

        const currentMetrics = this.optimizers.performance.getMetrics();
        const previousScore = this.metrics.overallPerformanceScore;

        this.calculateOverallPerformanceScore();
        const currentScore = this.metrics.overallPerformanceScore;

        // If performance has degraded significantly, trigger re-optimization
        if (previousScore - currentScore > 10) {
            this.log(`Performance degraded from ${previousScore} to ${currentScore}, triggering adaptive optimization`);
            await this.runAdaptiveOptimizations();
        }

        // Update recommendations if needed
        this.generateRecommendations();
    }

    async runAdaptiveOptimizations() {
        const currentMetrics = this.optimizers.performance?.getMetrics();

        if (!currentMetrics) return;

        const adaptations = [];

        // Adapt based on Core Web Vitals
        if (currentMetrics.largestContentfulPaint > 2500) {
            adaptations.push(this.optimizeLCP());
        }

        if (currentMetrics.firstInputDelay > 100) {
            adaptations.push(this.optimizeFID());
        }

        if (currentMetrics.cumulativeLayoutShift > 0.1) {
            adaptations.push(this.optimizeCLS());
        }

        // Memory pressure adaptations
        if (currentMetrics.memoryUsage) {
            const memoryUsagePercent = (currentMetrics.memoryUsage.usedJSHeapSize /
                                       currentMetrics.memoryUsage.jsHeapSizeLimit) * 100;

            if (memoryUsagePercent > 70) {
                adaptations.push(this.optimizeMemoryUsage());
            }
        }

        await Promise.allSettled(adaptations);

        this.status.lastOptimization = {
            type: 'adaptive',
            timestamp: Date.now(),
            adaptations: adaptations.length
        };
    }

    adaptToNetworkConditions() {
        if (!this.optimizers.resourceLoader) return;

        const connection = navigator.connection;
        const isSlowConnection = connection.effectiveType === 'slow-2g' ||
                                connection.effectiveType === '2g' ||
                                connection.downlink < 1;

        if (isSlowConnection) {
            this.enableDataSavingMode();
        } else {
            this.enableOptimalPerformanceMode();
        }

        this.log(`Adapted to network conditions: ${connection.effectiveType}`);
    }

    // ================================
    // SPECIFIC OPTIMIZATIONS
    // ================================

    async optimizeLCP() {
        this.log('Optimizing Largest Contentful Paint...');

        const optimizations = [];

        // Preload LCP image if identified
        if (this.optimizers.resourceLoader) {
            optimizations.push(this.preloadLCPImage());
        }

        // Inline critical CSS if not already done
        if (this.optimizers.css) {
            optimizations.push(this.ensureCriticalCSSInlined());
        }

        // Optimize JavaScript loading
        if (this.optimizers.jsBundle) {
            optimizations.push(this.optimizeJavaScriptForLCP());
        }

        await Promise.allSettled(optimizations);
    }

    async optimizeFID() {
        this.log('Optimizing First Input Delay...');

        const optimizations = [];

        // Defer non-critical JavaScript
        if (this.optimizers.jsBundle) {
            optimizations.push(this.deferNonCriticalJS());
        }

        // Break up long tasks
        optimizations.push(this.breakUpLongTasks());

        // Reduce JavaScript execution time
        optimizations.push(this.reduceJavaScriptExecutionTime());

        await Promise.allSettled(optimizations);
    }

    async optimizeCLS() {
        this.log('Optimizing Cumulative Layout Shift...');

        const optimizations = [];

        // Set size attributes on images and videos
        optimizations.push(this.setSizeAttributesOnMedia());

        // Preload fonts
        optimizations.push(this.preloadWebFonts());

        // Reserve space for dynamic content
        optimizations.push(this.reserveSpaceForDynamicContent());

        await Promise.allSettled(optimizations);
    }

    async optimizeMemoryUsage() {
        this.log('Optimizing memory usage...');

        const optimizations = [];

        // Clear unused resources
        optimizations.push(this.clearUnusedResources());

        // Optimize image loading
        optimizations.push(this.optimizeImageMemoryUsage());

        // Cleanup event listeners
        optimizations.push(this.cleanupEventListeners());

        await Promise.allSettled(optimizations);
    }

    // ================================
    // PERFORMANCE MODES
    // ================================

    enableDataSavingMode() {
        this.log('Enabling data saving mode');

        // Reduce image quality
        this.optimizers.resourceLoader?.optimizeImagesForLowBandwidth();

        // Disable prefetching
        if (this.optimizers.resourceLoader) {
            this.optimizers.resourceLoader.options.prefetching = false;
        }

        // Increase lazy loading threshold
        this.increaseLazyLoadingThreshold();

        // Minimize JavaScript bundles
        this.minimizeJavaScriptBundles();
    }

    enableOptimalPerformanceMode() {
        this.log('Enabling optimal performance mode');

        // Enable aggressive preloading
        if (this.optimizers.resourceLoader) {
            this.optimizers.resourceLoader.options.prefetching = true;
            this.optimizers.resourceLoader.aggressivelyPreloadResources();
        }

        // Optimize for high bandwidth
        this.optimizeForHighBandwidth();

        // Enable all optimizations
        this.enableAllOptimizations();
    }

    pauseNonCriticalOptimizations() {
        this.log('Pausing non-critical optimizations');

        // Stop adaptive monitoring
        if (this.performanceMonitoringInterval) {
            clearInterval(this.performanceMonitoringInterval);
            this.performanceMonitoringInterval = null;
        }

        // Pause lazy loading
        this.pauseLazyLoading();
    }

    resumeOptimizations() {
        this.log('Resuming optimizations');

        // Resume adaptive monitoring
        if (!this.performanceMonitoringInterval && this.options.adaptiveOptimization) {
            this.performanceMonitoringInterval = setInterval(() => {
                this.checkPerformanceMetrics();
            }, 30000);
        }

        // Resume lazy loading
        this.resumeLazyLoading();
    }

    // ================================
    // MONITORING & REPORTING
    // ================================

    setupMonitoring() {
        if (!this.options.performanceMonitoring) return;

        // Monitor page performance
        this.monitorPagePerformance();

        // Monitor user interactions
        this.monitorUserInteractions();

        // Set up error tracking
        this.setupErrorTracking();

        this.log('Performance monitoring enabled');
    }

    monitorPagePerformance() {
        // Monitor Core Web Vitals changes
        window.addEventListener('performanceMetric', (event) => {
            this.handlePerformanceMetric(event.detail);
        });

        // Monitor bundle loading
        window.addEventListener('bundleLoaded', (event) => {
            this.handleBundleLoaded(event.detail);
        });

        // Monitor resource loading
        this.monitorResourceLoading();
    }

    monitorUserInteractions() {
        const interactionMetrics = {
            clicks: 0,
            scrolls: 0,
            keystrokes: 0,
            firstInteraction: null
        };

        ['click', 'touchstart'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                interactionMetrics.clicks++;
                if (!interactionMetrics.firstInteraction) {
                    interactionMetrics.firstInteraction = performance.now();
                }
            }, { passive: true });
        });

        document.addEventListener('scroll', () => {
            interactionMetrics.scrolls++;
        }, { passive: true });

        document.addEventListener('keydown', () => {
            interactionMetrics.keystrokes++;
        });

        this.interactionMetrics = interactionMetrics;
    }

    setupErrorTracking() {
        window.addEventListener('error', (event) => {
            this.handleError('Runtime error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError('Unhandled promise rejection', {
                reason: event.reason,
                promise: event.promise
            });
        });
    }

    handlePerformanceMetric(metric) {
        if (this.options.debugMode) {
            console.log('Performance metric:', metric);
        }

        // Check if immediate action is needed
        if (metric.name === 'LONG_TASK' && metric.value > 200) {
            this.handleLongTask(metric.value);
        }

        if (metric.name === 'HIGH_MEMORY_USAGE' && metric.value > 85) {
            this.handleHighMemoryUsage(metric.value);
        }
    }

    handleBundleLoaded(bundleInfo) {
        this.log(`Bundle loaded: ${bundleInfo.bundleName} in ${bundleInfo.loadTime}ms`);

        // Report to analytics if available
        if (typeof gtag === 'function') {
            gtag('event', 'bundle_performance', {
                event_category: 'Performance',
                event_label: bundleInfo.bundleName,
                value: Math.round(bundleInfo.loadTime)
            });
        }
    }

    // ================================
    // UTILITY METHODS
    // ================================

    determineBundleStrategy() {
        // Determine optimal bundle strategy based on page characteristics
        const scriptCount = document.querySelectorAll('script[src]').length;

        if (scriptCount > 10) return 'split';
        if (scriptCount > 5) return 'dynamic';
        return 'single';
    }

    shouldRemoveUnusedCSS() {
        // Only remove unused CSS in production
        return !this.isDebugMode() && !window.location.hostname.includes('localhost');
    }

    shouldEnablePrefetching() {
        // Enable prefetching for good connections only
        const connection = navigator.connection;
        return !connection ||
               connection.effectiveType === '4g' ||
               connection.downlink > 1;
    }

    isDebugMode() {
        return this.options.debugMode ||
               window.location.search.includes('debug') ||
               window.location.hostname === 'localhost';
    }

    calculateOverallPerformanceScore() {
        let totalScore = 0;
        let scoringFactors = 0;

        // Performance Optimizer score
        if (this.optimizers.performance) {
            const metrics = this.optimizers.performance.getMetrics();
            const perfScore = this.optimizers.performance.calculatePerformanceScore(metrics);
            totalScore += perfScore * 0.4; // 40% weight
            scoringFactors += 0.4;
        }

        // JS Bundle Optimizer contribution
        if (this.optimizers.jsBundle) {
            const stats = this.optimizers.jsBundle.getOptimizationStats();
            const bundleScore = Math.min(100, stats.compressionRatio * 2); // Convert compression to score
            totalScore += bundleScore * 0.2; // 20% weight
            scoringFactors += 0.2;
        }

        // CSS Optimizer contribution
        if (this.optimizers.css) {
            const stats = this.optimizers.css.getOptimizationStats();
            const cssScore = Math.min(100, stats.compressionRatio * 1.5);
            totalScore += cssScore * 0.2; // 20% weight
            scoringFactors += 0.2;
        }

        // Resource Loader contribution
        if (this.optimizers.resourceLoader) {
            const stats = this.optimizers.resourceLoader.getLoadingStats();
            const resourceScore = Math.min(100, stats.cacheHitRate * 1.2);
            totalScore += resourceScore * 0.2; // 20% weight
            scoringFactors += 0.2;
        }

        this.metrics.overallPerformanceScore = scoringFactors > 0 ? totalScore / scoringFactors : 0;
    }

    generateRecommendations() {
        const recommendations = [];

        // Collect recommendations from each optimizer
        if (this.optimizers.performance) {
            const perfMetrics = this.optimizers.performance.getMetrics();
            const perfRecommendations = this.optimizers.performance.generateRecommendations(perfMetrics);
            recommendations.push(...perfRecommendations);
        }

        if (this.optimizers.resourceLoader) {
            const resourceRecommendations = this.optimizers.resourceLoader.generateRecommendations();
            recommendations.push(...resourceRecommendations);
        }

        // Add orchestrator-specific recommendations
        if (this.metrics.overallPerformanceScore < 70) {
            recommendations.push({
                priority: 'high',
                category: 'Overall Performance',
                message: 'Overall performance score is low. Consider enabling more aggressive optimizations.'
            });
        }

        // Sort by priority
        recommendations.sort((a, b) => {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        this.metrics.recommendations = recommendations.slice(0, 10); // Top 10 recommendations
    }

    // ================================
    // EVENT HANDLERS
    // ================================

    handleError(context, error) {
        const errorInfo = {
            context,
            message: error.message || error,
            timestamp: Date.now(),
            stack: error.stack || new Error().stack
        };

        this.status.errors.push(errorInfo);

        if (this.options.debugMode) {
            console.error(`Performance Orchestrator Error [${context}]:`, error);
        }

        // Keep only last 50 errors
        if (this.status.errors.length > 50) {
            this.status.errors = this.status.errors.slice(-50);
        }

        // Report critical errors
        if (typeof gtag === 'function') {
            gtag('event', 'performance_error', {
                event_category: 'Error',
                event_label: context,
                value: 1
            });
        }
    }

    handleLongTask(duration) {
        this.log(`Long task detected: ${duration}ms`);

        // Try to break up future long tasks
        setTimeout(() => {
            this.breakUpLongTasks();
        }, 100);
    }

    handleHighMemoryUsage(percentage) {
        this.log(`High memory usage: ${percentage}%`);

        // Trigger memory optimization
        setTimeout(() => {
            this.optimizeMemoryUsage();
        }, 100);
    }

    // ================================
    // PUBLIC API
    // ================================

    getPerformanceReport() {
        const report = {
            overall: {
                score: this.metrics.overallPerformanceScore,
                status: this.status,
                recommendations: this.metrics.recommendations
            },
            optimizers: {},
            metrics: {
                initialization: this.metrics.initialization,
                optimizationResults: Object.fromEntries(this.metrics.optimizationResults),
                interactions: this.interactionMetrics
            }
        };

        // Include reports from each optimizer
        if (this.optimizers.performance) {
            report.optimizers.performance = this.optimizers.performance.generateReport();
        }

        if (this.optimizers.jsBundle) {
            report.optimizers.jsBundle = {
                stats: this.optimizers.jsBundle.getOptimizationStats(),
                manifest: this.optimizers.jsBundle.getBundleManifest(),
                loadedBundles: this.optimizers.jsBundle.getLoadedBundles()
            };
        }

        if (this.optimizers.css) {
            report.optimizers.css = this.optimizers.css.generateReport();
        }

        if (this.optimizers.resourceLoader) {
            report.optimizers.resourceLoader = this.optimizers.resourceLoader.generateOptimizationReport();
        }

        return report;
    }

    async runManualOptimization() {
        this.log('Running manual optimization...');
        await this.runAdaptiveOptimizations();
        return this.getPerformanceReport();
    }

    enableOptimizer(optimizerName) {
        if (this.optimizers[optimizerName]) {
            this.log(`${optimizerName} optimizer enabled`);
            // Re-run specific optimizations
            this.runOptimization(optimizerName, async () => {
                return this.optimizers[optimizerName].getOptimizationStats?.() ||
                       this.optimizers[optimizerName].getMetrics?.() ||
                       this.optimizers[optimizerName].getLoadingStats?.() || {};
            });
        }
    }

    disableOptimizer(optimizerName) {
        if (this.optimizers[optimizerName]) {
            this.log(`${optimizerName} optimizer disabled`);
            // Could pause specific optimizer functionality here
        }
    }

    // ================================
    // UTILITY & LOGGING
    // ================================

    log(message) {
        if (this.options.debugMode) {
            console.log(`[Performance Orchestrator] ${message}`);
        }
    }

    reportInitialization() {
        if (!this.options.reportingEnabled) return;

        if (typeof gtag === 'function') {
            gtag('event', 'performance_orchestrator_init', {
                event_category: 'Performance',
                event_label: 'Initialized',
                value: Math.round(this.metrics.initialization.duration)
            });
        }
    }

    // ================================
    // CLEANUP
    // ================================

    destroy() {
        this.log('Destroying Performance Master Orchestrator...');

        // Clear intervals
        if (this.performanceMonitoringInterval) {
            clearInterval(this.performanceMonitoringInterval);
        }

        // Destroy individual optimizers
        Object.values(this.optimizers).forEach(optimizer => {
            if (optimizer && typeof optimizer.destroy === 'function') {
                optimizer.destroy();
            }
        });

        // Clear data
        this.optimizers = {};
        this.metrics.optimizationResults.clear();
        this.status.errors = [];

        this.status.initialized = false;
        this.status.optimizationsActive = false;
    }

    // ================================
    // PLACEHOLDER METHODS FOR SPECIFIC OPTIMIZATIONS
    // ================================

    async preloadLCPImage() {
        // Implementation would identify and preload LCP image
        return Promise.resolve();
    }

    async ensureCriticalCSSInlined() {
        // Implementation would ensure critical CSS is inlined
        return Promise.resolve();
    }

    async optimizeJavaScriptForLCP() {
        // Implementation would optimize JS loading for LCP
        return Promise.resolve();
    }

    async deferNonCriticalJS() {
        // Implementation would defer non-critical JavaScript
        return Promise.resolve();
    }

    async breakUpLongTasks() {
        // Implementation would break up long JavaScript tasks
        return Promise.resolve();
    }

    async reduceJavaScriptExecutionTime() {
        // Implementation would reduce JS execution time
        return Promise.resolve();
    }

    async setSizeAttributesOnMedia() {
        // Implementation would set size attributes on images/videos
        return Promise.resolve();
    }

    async preloadWebFonts() {
        // Implementation would preload web fonts
        return Promise.resolve();
    }

    async reserveSpaceForDynamicContent() {
        // Implementation would reserve space for dynamic content
        return Promise.resolve();
    }

    async clearUnusedResources() {
        // Implementation would clear unused resources from memory
        return Promise.resolve();
    }

    async optimizeImageMemoryUsage() {
        // Implementation would optimize image memory usage
        return Promise.resolve();
    }

    async cleanupEventListeners() {
        // Implementation would cleanup unused event listeners
        return Promise.resolve();
    }

    increaseLazyLoadingThreshold() {
        // Implementation would increase lazy loading threshold
    }

    minimizeJavaScriptBundles() {
        // Implementation would minimize JavaScript bundles
    }

    optimizeForHighBandwidth() {
        // Implementation would optimize for high bandwidth
    }

    enableAllOptimizations() {
        // Implementation would enable all available optimizations
    }

    pauseLazyLoading() {
        // Implementation would pause lazy loading
    }

    resumeLazyLoading() {
        // Implementation would resume lazy loading
    }

    monitorResourceLoading() {
        // Implementation would monitor resource loading performance
    }
}

// Initialize the master orchestrator
const performanceMasterOrchestrator = new PerformanceMasterOrchestrator({
    debugMode: window.location.hostname === 'localhost' ||
               window.location.search.includes('debug')
});

// Export for global access
window.PerformanceMasterOrchestrator = PerformanceMasterOrchestrator;
window.performanceMasterOrchestrator = performanceMasterOrchestrator;

// Expose performance report function globally for debugging
if (window.location.hostname === 'localhost' || window.location.search.includes('debug')) {
    window.getPerformanceReport = () => performanceMasterOrchestrator.getPerformanceReport();
    window.runManualOptimization = () => performanceMasterOrchestrator.runManualOptimization();
}