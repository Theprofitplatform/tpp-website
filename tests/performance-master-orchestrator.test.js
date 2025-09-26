/**
 * The Profit Platform - Performance Master Orchestrator Tests
 * Comprehensive test suite for the master orchestrator
 */

describe('Performance Master Orchestrator', () => {
    let performanceMasterOrchestrator;
    let mockPerformanceOptimizer;
    let mockJSBundlerOptimizer;
    let mockCSSOptimizer;
    let mockResourceLoaderOptimizer;

    beforeEach(() => {
        // Reset DOM
        document.head.innerHTML = '';
        document.body.innerHTML = '';

        // Mock individual optimizers
        mockPerformanceOptimizer = {
            getMetrics: jest.fn(() => ({
                loadTime: 2000,
                largestContentfulPaint: 2400,
                firstInputDelay: 80,
                cumulativeLayoutShift: 0.05,
                memoryUsage: {
                    usedJSHeapSize: 50000000,
                    jsHeapSizeLimit: 100000000
                }
            })),
            calculatePerformanceScore: jest.fn(() => 85),
            generateRecommendations: jest.fn(() => []),
            generateReport: jest.fn(() => ({
                summary: { overallScore: 85 }
            })),
            destroy: jest.fn()
        };

        mockJSBundlerOptimizer = {
            getOptimizationStats: jest.fn(() => ({
                compressionRatio: 35,
                modulesProcessed: 5,
                optimizationsApplied: ['minification', 'dead-code-removal']
            })),
            getBundleManifest: jest.fn(() => ({
                version: '1.0.0',
                bundles: {}
            })),
            getLoadedBundles: jest.fn(() => []),
            destroy: jest.fn()
        };

        mockCSSOptimizer = {
            getOptimizationStats: jest.fn(() => ({
                compressionRatio: 45,
                removedRules: 10,
                consolidatedFiles: 3
            })),
            generateReport: jest.fn(() => ({
                optimization: { compressionRatio: 45 }
            })),
            destroy: jest.fn()
        };

        mockResourceLoaderOptimizer = {
            getLoadingStats: jest.fn(() => ({
                cacheHitRate: 75,
                averageLoadTime: 300,
                totalRequests: 20,
                cachedRequests: 15
            })),
            generateOptimizationReport: jest.fn(() => ({
                performance: { cacheHitRate: 75 }
            })),
            generateRecommendations: jest.fn(() => []),
            optimizeImagesForLowBandwidth: jest.fn(),
            aggressivelyPreloadResources: jest.fn(),
            destroy: jest.fn()
        };

        // Mock global optimizers
        window.PerformanceOptimizer = jest.fn(() => mockPerformanceOptimizer);
        window.JSBundlerOptimizer = jest.fn(() => mockJSBundlerOptimizer);
        window.CSSOptimizer = jest.fn(() => mockCSSOptimizer);
        window.ResourceLoaderOptimizer = jest.fn(() => mockResourceLoaderOptimizer);

        // Mock navigator.connection
        Object.defineProperty(navigator, 'connection', {
            value: {
                effectiveType: '4g',
                downlink: 5,
                rtt: 50,
                saveData: false,
                addEventListener: jest.fn()
            },
            configurable: true
        });

        // Mock performance.now
        performance.now = jest.fn(() => 1000);

        // Initialize orchestrator
        performanceMasterOrchestrator = new PerformanceMasterOrchestrator({
            debugMode: true,
            automaticOptimization: true
        });
    });

    afterEach(() => {
        if (performanceMasterOrchestrator) {
            performanceMasterOrchestrator.destroy();
        }
        jest.restoreAllMocks();
    });

    describe('Initialization', () => {
        test('should initialize all optimizers', async () => {
            await new Promise(resolve => setTimeout(resolve, 0)); // Allow async init

            expect(window.PerformanceOptimizer).toHaveBeenCalled();
            expect(window.JSBundlerOptimizer).toHaveBeenCalled();
            expect(window.CSSOptimizer).toHaveBeenCalled();
            expect(window.ResourceLoaderOptimizer).toHaveBeenCalled();

            expect(performanceMasterOrchestrator.status.initialized).toBe(true);
            expect(performanceMasterOrchestrator.status.optimizationsActive).toBe(true);
        });

        test('should handle optimizer initialization failures gracefully', async () => {
            window.PerformanceOptimizer = jest.fn(() => {
                throw new Error('Initialization failed');
            });

            const orchestrator = new PerformanceMasterOrchestrator();
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(orchestrator.status.errors.length).toBeGreaterThan(0);
            expect(orchestrator.status.errors[0].context).toContain('Performance Optimizer');
        });

        test('should record initialization metrics', async () => {
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(performanceMasterOrchestrator.metrics.initialization).toBeTruthy();
            expect(performanceMasterOrchestrator.metrics.initialization.success).toBe(true);
            expect(typeof performanceMasterOrchestrator.metrics.initialization.duration).toBe('number');
        });
    });

    describe('Bundle Strategy Determination', () => {
        test('should choose single strategy for few scripts', () => {
            // Create 3 scripts
            for (let i = 0; i < 3; i++) {
                const script = document.createElement('script');
                script.src = `/test${i}.js`;
                document.head.appendChild(script);
            }

            const strategy = performanceMasterOrchestrator.determineBundleStrategy();
            expect(strategy).toBe('single');
        });

        test('should choose dynamic strategy for medium script count', () => {
            // Create 7 scripts
            for (let i = 0; i < 7; i++) {
                const script = document.createElement('script');
                script.src = `/test${i}.js`;
                document.head.appendChild(script);
            }

            const strategy = performanceMasterOrchestrator.determineBundleStrategy();
            expect(strategy).toBe('dynamic');
        });

        test('should choose split strategy for many scripts', () => {
            // Create 15 scripts
            for (let i = 0; i < 15; i++) {
                const script = document.createElement('script');
                script.src = `/test${i}.js`;
                document.head.appendChild(script);
            }

            const strategy = performanceMasterOrchestrator.determineBundleStrategy();
            expect(strategy).toBe('split');
        });
    });

    describe('Performance Score Calculation', () => {
        test('should calculate overall performance score correctly', async () => {
            await new Promise(resolve => setTimeout(resolve, 0));

            performanceMasterOrchestrator.calculateOverallPerformanceScore();

            // Score should be weighted average of all optimizers
            // Performance: 85 * 0.4 = 34
            // JS Bundle: min(100, 35*2) * 0.2 = 14 (70 * 0.2)
            // CSS: min(100, 45*1.5) * 0.2 = 13.5 (67.5 * 0.2)
            // Resource: min(100, 75*1.2) * 0.2 = 18 (90 * 0.2)
            // Total: 79.5

            expect(performanceMasterOrchestrator.metrics.overallPerformanceScore).toBeCloseTo(79.5, 1);
        });

        test('should handle missing optimizers gracefully', () => {
            const orchestrator = new PerformanceMasterOrchestrator();
            orchestrator.optimizers.performance = null;
            orchestrator.optimizers.jsBundle = null;
            orchestrator.optimizers.css = null;
            orchestrator.optimizers.resourceLoader = null;

            orchestrator.calculateOverallPerformanceScore();

            expect(orchestrator.metrics.overallPerformanceScore).toBe(0);
        });
    });

    describe('Adaptive Optimization', () => {
        test('should adapt to slow network conditions', () => {
            navigator.connection.effectiveType = '2g';
            navigator.connection.downlink = 0.3;

            performanceMasterOrchestrator.adaptToNetworkConditions();

            expect(mockResourceLoaderOptimizer.optimizeImagesForLowBandwidth).toHaveBeenCalled();
            expect(mockResourceLoaderOptimizer.options.prefetching).toBe(false);
        });

        test('should adapt to fast network conditions', () => {
            navigator.connection.effectiveType = '4g';
            navigator.connection.downlink = 10;

            performanceMasterOrchestrator.adaptToNetworkConditions();

            expect(mockResourceLoaderOptimizer.aggressivelyPreloadResources).toHaveBeenCalled();
            expect(mockResourceLoaderOptimizer.options.prefetching).toBe(true);
        });

        test('should trigger adaptive optimizations on performance degradation', async () => {
            // Set initial score
            performanceMasterOrchestrator.metrics.overallPerformanceScore = 80;

            // Mock degraded performance
            mockPerformanceOptimizer.calculatePerformanceScore.mockReturnValue(60);

            const runAdaptiveSpy = jest.spyOn(performanceMasterOrchestrator, 'runAdaptiveOptimizations')
                .mockResolvedValue();

            await performanceMasterOrchestrator.checkPerformanceMetrics();

            expect(runAdaptiveSpy).toHaveBeenCalled();
        });

        test('should optimize LCP when threshold exceeded', async () => {
            mockPerformanceOptimizer.getMetrics.mockReturnValue({
                largestContentfulPaint: 3000, // Above threshold
                firstInputDelay: 50,
                cumulativeLayoutShift: 0.05
            });

            const optimizeLCPSpy = jest.spyOn(performanceMasterOrchestrator, 'optimizeLCP')
                .mockResolvedValue();

            await performanceMasterOrchestrator.runAdaptiveOptimizations();

            expect(optimizeLCPSpy).toHaveBeenCalled();
        });

        test('should optimize FID when threshold exceeded', async () => {
            mockPerformanceOptimizer.getMetrics.mockReturnValue({
                largestContentfulPaint: 2000,
                firstInputDelay: 150, // Above threshold
                cumulativeLayoutShift: 0.05
            });

            const optimizeFIDSpy = jest.spyOn(performanceMasterOrchestrator, 'optimizeFID')
                .mockResolvedValue();

            await performanceMasterOrchestrator.runAdaptiveOptimizations();

            expect(optimizeFIDSpy).toHaveBeenCalled();
        });

        test('should optimize CLS when threshold exceeded', async () => {
            mockPerformanceOptimizer.getMetrics.mockReturnValue({
                largestContentfulPaint: 2000,
                firstInputDelay: 50,
                cumulativeLayoutShift: 0.15 // Above threshold
            });

            const optimizeCLSSpy = jest.spyOn(performanceMasterOrchestrator, 'optimizeCLS')
                .mockResolvedValue();

            await performanceMasterOrchestrator.runAdaptiveOptimizations();

            expect(optimizeCLSSpy).toHaveBeenCalled();
        });

        test('should optimize memory usage when threshold exceeded', async () => {
            mockPerformanceOptimizer.getMetrics.mockReturnValue({
                largestContentfulPaint: 2000,
                firstInputDelay: 50,
                cumulativeLayoutShift: 0.05,
                memoryUsage: {
                    usedJSHeapSize: 80000000,
                    jsHeapSizeLimit: 100000000 // 80% usage
                }
            });

            const optimizeMemorySpy = jest.spyOn(performanceMasterOrchestrator, 'optimizeMemoryUsage')
                .mockResolvedValue();

            await performanceMasterOrchestrator.runAdaptiveOptimizations();

            expect(optimizeMemorySpy).toHaveBeenCalled();
        });
    });

    describe('Performance Modes', () => {
        test('should enable data saving mode correctly', () => {
            performanceMasterOrchestrator.enableDataSavingMode();

            expect(mockResourceLoaderOptimizer.optimizeImagesForLowBandwidth).toHaveBeenCalled();
            expect(mockResourceLoaderOptimizer.options.prefetching).toBe(false);
        });

        test('should enable optimal performance mode correctly', () => {
            performanceMasterOrchestrator.enableOptimalPerformanceMode();

            expect(mockResourceLoaderOptimizer.options.prefetching).toBe(true);
            expect(mockResourceLoaderOptimizer.aggressivelyPreloadResources).toHaveBeenCalled();
        });

        test('should pause non-critical optimizations', () => {
            performanceMasterOrchestrator.performanceMonitoringInterval = 123;

            performanceMasterOrchestrator.pauseNonCriticalOptimizations();

            expect(performanceMasterOrchestrator.performanceMonitoringInterval).toBeNull();
        });

        test('should resume optimizations', () => {
            performanceMasterOrchestrator.performanceMonitoringInterval = null;
            performanceMasterOrchestrator.options.adaptiveOptimization = true;

            performanceMasterOrchestrator.resumeOptimizations();

            expect(performanceMasterOrchestrator.performanceMonitoringInterval).toBeTruthy();
        });
    });

    describe('Error Handling', () => {
        test('should handle and track errors', () => {
            const error = new Error('Test error');

            performanceMasterOrchestrator.handleError('Test context', error);

            expect(performanceMasterOrchestrator.status.errors.length).toBe(1);
            expect(performanceMasterOrchestrator.status.errors[0].context).toBe('Test context');
            expect(performanceMasterOrchestrator.status.errors[0].message).toBe('Test error');
        });

        test('should limit error history to 50 entries', () => {
            // Add 60 errors
            for (let i = 0; i < 60; i++) {
                performanceMasterOrchestrator.handleError(`Error ${i}`, new Error(`Message ${i}`));
            }

            expect(performanceMasterOrchestrator.status.errors.length).toBe(50);
            expect(performanceMasterOrchestrator.status.errors[0].context).toBe('Error 10'); // First 10 removed
        });

        test('should handle long tasks', () => {
            const breakUpTasksSpy = jest.spyOn(performanceMasterOrchestrator, 'breakUpLongTasks')
                .mockResolvedValue();

            performanceMasterOrchestrator.handleLongTask(250);

            setTimeout(() => {
                expect(breakUpTasksSpy).toHaveBeenCalled();
            }, 150);
        });

        test('should handle high memory usage', () => {
            const optimizeMemorySpy = jest.spyOn(performanceMasterOrchestrator, 'optimizeMemoryUsage')
                .mockResolvedValue();

            performanceMasterOrchestrator.handleHighMemoryUsage(90);

            setTimeout(() => {
                expect(optimizeMemorySpy).toHaveBeenCalled();
            }, 150);
        });
    });

    describe('Monitoring', () => {
        test('should setup performance monitoring', () => {
            const monitorSpy = jest.spyOn(performanceMasterOrchestrator, 'monitorPagePerformance');
            const userInteractionsSpy = jest.spyOn(performanceMasterOrchestrator, 'monitorUserInteractions');
            const errorTrackingSpy = jest.spyOn(performanceMasterOrchestrator, 'setupErrorTracking');

            performanceMasterOrchestrator.setupMonitoring();

            expect(monitorSpy).toHaveBeenCalled();
            expect(userInteractionsSpy).toHaveBeenCalled();
            expect(errorTrackingSpy).toHaveBeenCalled();
        });

        test('should track user interactions', () => {
            performanceMasterOrchestrator.monitorUserInteractions();

            const clickEvent = new Event('click');
            const scrollEvent = new Event('scroll');
            const keyEvent = new Event('keydown');

            document.dispatchEvent(clickEvent);
            document.dispatchEvent(scrollEvent);
            document.dispatchEvent(keyEvent);

            expect(performanceMasterOrchestrator.interactionMetrics.clicks).toBe(1);
            expect(performanceMasterOrchestrator.interactionMetrics.scrolls).toBe(1);
            expect(performanceMasterOrchestrator.interactionMetrics.keystrokes).toBe(1);
            expect(performanceMasterOrchestrator.interactionMetrics.firstInteraction).toBeTruthy();
        });

        test('should track errors and unhandled rejections', () => {
            performanceMasterOrchestrator.setupErrorTracking();

            const errorEvent = new ErrorEvent('error', {
                message: 'Test error',
                filename: 'test.js',
                lineno: 10,
                colno: 5
            });

            const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
                promise: Promise.reject('Test rejection'),
                reason: 'Test rejection'
            });

            window.dispatchEvent(errorEvent);
            window.dispatchEvent(rejectionEvent);

            // Should have captured both errors
            expect(performanceMasterOrchestrator.status.errors.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Recommendations', () => {
        test('should generate comprehensive recommendations', () => {
            mockPerformanceOptimizer.generateRecommendations.mockReturnValue([
                { priority: 'high', category: 'LCP', message: 'Optimize images' }
            ]);

            mockResourceLoaderOptimizer.generateRecommendations.mockReturnValue([
                { priority: 'medium', category: 'Caching', message: 'Enable caching' }
            ]);

            performanceMasterOrchestrator.metrics.overallPerformanceScore = 60; // Low score

            performanceMasterOrchestrator.generateRecommendations();

            const recommendations = performanceMasterOrchestrator.metrics.recommendations;
            expect(recommendations.length).toBeGreaterThan(0);

            // Should include recommendations from optimizers
            expect(recommendations.some(r => r.category === 'LCP')).toBe(true);
            expect(recommendations.some(r => r.category === 'Caching')).toBe(true);

            // Should include orchestrator-specific recommendation for low score
            expect(recommendations.some(r => r.category === 'Overall Performance')).toBe(true);

            // Should be sorted by priority
            const highPriorityFirst = recommendations.findIndex(r => r.priority === 'high');
            const mediumPriorityFirst = recommendations.findIndex(r => r.priority === 'medium');
            expect(highPriorityFirst).toBeLessThan(mediumPriorityFirst);
        });
    });

    describe('Public API', () => {
        test('should generate comprehensive performance report', async () => {
            await new Promise(resolve => setTimeout(resolve, 0));

            const report = performanceMasterOrchestrator.getPerformanceReport();

            expect(report).toHaveProperty('overall');
            expect(report).toHaveProperty('optimizers');
            expect(report).toHaveProperty('metrics');

            expect(report.overall.score).toBeTruthy();
            expect(report.overall.status).toBeTruthy();
            expect(report.overall.recommendations).toBeInstanceOf(Array);

            expect(report.optimizers.performance).toBeTruthy();
            expect(report.optimizers.jsBundle).toBeTruthy();
            expect(report.optimizers.css).toBeTruthy();
            expect(report.optimizers.resourceLoader).toBeTruthy();

            expect(report.metrics.initialization).toBeTruthy();
            expect(report.metrics.optimizationResults).toBeTruthy();
        });

        test('should run manual optimization', async () => {
            const adaptiveSpy = jest.spyOn(performanceMasterOrchestrator, 'runAdaptiveOptimizations')
                .mockResolvedValue();

            const report = await performanceMasterOrchestrator.runManualOptimization();

            expect(adaptiveSpy).toHaveBeenCalled();
            expect(report).toHaveProperty('overall');
            expect(report).toHaveProperty('optimizers');
        });

        test('should enable/disable specific optimizers', () => {
            const runOptimizationSpy = jest.spyOn(performanceMasterOrchestrator, 'runOptimization')
                .mockResolvedValue();

            performanceMasterOrchestrator.enableOptimizer('performance');

            expect(runOptimizationSpy).toHaveBeenCalledWith('performance', expect.any(Function));

            // Should handle non-existent optimizers
            performanceMasterOrchestrator.enableOptimizer('nonexistent');
            performanceMasterOrchestrator.disableOptimizer('nonexistent');
        });
    });

    describe('Utility Methods', () => {
        test('should detect debug mode correctly', () => {
            // Already in debug mode from constructor
            expect(performanceMasterOrchestrator.isDebugMode()).toBe(true);

            // Test localhost detection
            Object.defineProperty(window.location, 'hostname', {
                value: 'localhost',
                configurable: true
            });

            expect(performanceMasterOrchestrator.isDebugMode()).toBe(true);

            // Test query parameter detection
            Object.defineProperty(window.location, 'search', {
                value: '?debug=true',
                configurable: true
            });

            expect(performanceMasterOrchestrator.isDebugMode()).toBe(true);
        });

        test('should determine CSS unused removal appropriately', () => {
            // Should not remove in debug mode
            expect(performanceMasterOrchestrator.shouldRemoveUnusedCSS()).toBe(false);

            // Create new orchestrator without debug mode
            const prodOrchestrator = new PerformanceMasterOrchestrator({ debugMode: false });
            Object.defineProperty(window.location, 'hostname', {
                value: 'example.com',
                configurable: true
            });

            expect(prodOrchestrator.shouldRemoveUnusedCSS()).toBe(true);
        });

        test('should determine prefetching appropriately', () => {
            // Good connection should enable prefetching
            expect(performanceMasterOrchestrator.shouldEnablePrefetching()).toBe(true);

            // Poor connection should disable prefetching
            navigator.connection.effectiveType = '2g';
            navigator.connection.downlink = 0.5;

            expect(performanceMasterOrchestrator.shouldEnablePrefetching()).toBe(false);
        });
    });

    describe('Cleanup', () => {
        test('should properly cleanup all resources', () => {
            performanceMasterOrchestrator.performanceMonitoringInterval = 123;

            performanceMasterOrchestrator.destroy();

            expect(performanceMasterOrchestrator.performanceMonitoringInterval).toBeNull();
            expect(mockPerformanceOptimizer.destroy).toHaveBeenCalled();
            expect(mockJSBundlerOptimizer.destroy).toHaveBeenCalled();
            expect(mockCSSOptimizer.destroy).toHaveBeenCalled();
            expect(mockResourceLoaderOptimizer.destroy).toHaveBeenCalled();

            expect(performanceMasterOrchestrator.status.initialized).toBe(false);
            expect(performanceMasterOrchestrator.status.optimizationsActive).toBe(false);
            expect(performanceMasterOrchestrator.status.errors).toEqual([]);
        });
    });

    describe('Page Visibility Handling', () => {
        test('should pause optimizations when page is hidden', () => {
            const pauseSpy = jest.spyOn(performanceMasterOrchestrator, 'pauseNonCriticalOptimizations');

            // Simulate page becoming hidden
            Object.defineProperty(document, 'hidden', { value: true, configurable: true });

            const visibilityEvent = new Event('visibilitychange');
            document.dispatchEvent(visibilityEvent);

            expect(pauseSpy).toHaveBeenCalled();
        });

        test('should resume optimizations when page becomes visible', () => {
            const resumeSpy = jest.spyOn(performanceMasterOrchestrator, 'resumeOptimizations');

            // Simulate page becoming visible
            Object.defineProperty(document, 'hidden', { value: false, configurable: true });

            const visibilityEvent = new Event('visibilitychange');
            document.dispatchEvent(visibilityEvent);

            expect(resumeSpy).toHaveBeenCalled();
        });
    });
});