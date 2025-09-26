/**
 * The Profit Platform - Performance Optimizer Tests
 * Comprehensive test suite for performance optimization features
 */

describe('Performance Optimizer', () => {
    let performanceOptimizer;
    let mockPerformanceObserver;
    let mockIntersectionObserver;

    beforeEach(() => {
        // Reset DOM
        document.head.innerHTML = '';
        document.body.innerHTML = '';

        // Mock Performance Observer
        mockPerformanceObserver = {
            observe: jest.fn(),
            disconnect: jest.fn(),
            takeRecords: jest.fn(() => [])
        };

        // Mock Intersection Observer
        mockIntersectionObserver = {
            observe: jest.fn(),
            unobserve: jest.fn(),
            disconnect: jest.fn()
        };

        global.PerformanceObserver = jest.fn(() => mockPerformanceObserver);
        global.IntersectionObserver = jest.fn(() => mockIntersectionObserver);

        // Mock performance.timing
        Object.defineProperty(performance, 'timing', {
            value: {
                navigationStart: 1000,
                loadEventEnd: 3000,
                domContentLoadedEventEnd: 2000
            },
            configurable: true
        });

        // Mock performance.memory
        Object.defineProperty(performance, 'memory', {
            value: {
                usedJSHeapSize: 10000000,
                totalJSHeapSize: 20000000,
                jsHeapSizeLimit: 100000000
            },
            configurable: true
        });

        // Initialize performance optimizer
        performanceOptimizer = new PerformanceOptimizer();
    });

    afterEach(() => {
        if (performanceOptimizer) {
            performanceOptimizer.destroy();
        }
        jest.restoreAllMocks();
    });

    describe('Core Web Vitals Measurement', () => {
        test('should initialize performance observers', () => {
            expect(global.PerformanceObserver).toHaveBeenCalledTimes(4); // LCP, FID, CLS, Resource
            expect(mockPerformanceObserver.observe).toHaveBeenCalledWith({
                entryTypes: ['largest-contentful-paint']
            });
            expect(mockPerformanceObserver.observe).toHaveBeenCalledWith({
                entryTypes: ['first-input']
            });
            expect(mockPerformanceObserver.observe).toHaveBeenCalledWith({
                entryTypes: ['layout-shift']
            });
        });

        test('should measure navigation timing correctly', () => {
            const metrics = performanceOptimizer.getMetrics();

            expect(metrics.loadTime).toBe(2000); // 3000 - 1000
            expect(metrics.domContentLoaded).toBe(1000); // 2000 - 1000
        });

        test('should track memory usage', () => {
            const metrics = performanceOptimizer.getMetrics();

            expect(metrics.memoryUsage).toEqual({
                usedJSHeapSize: 10000000,
                totalJSHeapSize: 20000000,
                jsHeapSizeLimit: 100000000
            });
        });

        test('should report metrics to analytics', () => {
            global.gtag = jest.fn();

            performanceOptimizer.reportMetric('TEST_METRIC', 100);

            expect(global.gtag).toHaveBeenCalledWith('event', 'performance_metric', {
                event_category: 'Performance',
                event_label: 'TEST_METRIC',
                value: 100
            });
        });
    });

    describe('Image Optimization', () => {
        test('should optimize images with lazy loading', () => {
            // Create test image
            const img = document.createElement('img');
            img.src = 'test.jpg';
            img.dataset.optimize = 'true';
            document.body.appendChild(img);

            // Mock isBelowFold to return true
            jest.spyOn(performanceOptimizer, 'isBelowFold').mockReturnValue(true);

            performanceOptimizer.implementImageOptimization();

            expect(img.loading).toBe('lazy');
        });

        test('should convert to WebP when supported', async () => {
            const img = document.createElement('img');
            img.src = 'test.jpg';
            img.dataset.optimize = 'true';
            document.body.appendChild(img);

            // Mock WebP support
            jest.spyOn(performanceOptimizer, 'supportsWebP').mockReturnValue(true);
            jest.spyOn(performanceOptimizer, 'testImageExists').mockResolvedValue(true);

            await performanceOptimizer.implementImageOptimization();

            // Allow async operations to complete
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(img.src).toBe('test.webp');
        });

        test('should not convert to WebP when not supported', async () => {
            const img = document.createElement('img');
            img.src = 'test.jpg';
            img.dataset.optimize = 'true';
            document.body.appendChild(img);

            jest.spyOn(performanceOptimizer, 'supportsWebP').mockReturnValue(false);

            await performanceOptimizer.implementImageOptimization();

            expect(img.src).toBe('test.jpg');
        });
    });

    describe('Lazy Loading', () => {
        test('should initialize intersection observer for lazy elements', () => {
            const lazyImg = document.createElement('img');
            lazyImg.dataset.lazy = 'image';
            lazyImg.dataset.src = 'lazy-test.jpg';
            document.body.appendChild(lazyImg);

            performanceOptimizer.implementLazyLoading();

            expect(global.IntersectionObserver).toHaveBeenCalled();
            expect(mockIntersectionObserver.observe).toHaveBeenCalledWith(lazyImg);
        });

        test('should load lazy image when intersecting', () => {
            const img = document.createElement('img');
            img.dataset.src = 'lazy-test.jpg';
            img.dataset.srcset = 'lazy-test-2x.jpg 2x';

            performanceOptimizer.loadLazyImage(img);

            expect(img.src).toBe('lazy-test.jpg');
            expect(img.srcset).toBe('lazy-test-2x.jpg 2x');
            expect(img.hasAttribute('data-src')).toBe(false);
            expect(img.hasAttribute('data-srcset')).toBe(false);
            expect(img.classList.contains('loaded')).toBe(true);
        });

        test('should load lazy script when intersecting', () => {
            const script = document.createElement('script');
            script.dataset.src = 'lazy-script.js';
            script.dataset.type = 'text/javascript';
            document.head.appendChild(script);

            performanceOptimizer.loadLazyScript(script);

            // Check if new script was created and added
            const newScript = document.head.querySelector('script[src="lazy-script.js"]');
            expect(newScript).toBeTruthy();
            expect(newScript.async).toBe(true);
        });
    });

    describe('Resource Bundling', () => {
        test('should identify small CSS files for bundling', () => {
            const link1 = document.createElement('link');
            link1.rel = 'stylesheet';
            link1.href = 'small1.css';
            link1.dataset.size = '3000';

            const link2 = document.createElement('link');
            link2.rel = 'stylesheet';
            link2.href = 'small2.css';
            link2.dataset.size = '4000';

            const link3 = document.createElement('link');
            link3.rel = 'stylesheet';
            link3.href = 'large.css';
            link3.dataset.size = '10000';

            document.head.appendChild(link1);
            document.head.appendChild(link2);
            document.head.appendChild(link3);

            jest.spyOn(performanceOptimizer, 'combineStylesheets').mockImplementation(() => {});

            performanceOptimizer.bundleSmallCSS();

            expect(performanceOptimizer.combineStylesheets).toHaveBeenCalledWith([link1, link2]);
        });

        test('should identify small JS files for bundling', () => {
            const script1 = document.createElement('script');
            script1.src = 'small1.js';
            script1.dataset.size = '5000';

            const script2 = document.createElement('script');
            script2.src = 'small2.js';
            script2.dataset.size = '7000';

            const script3 = document.createElement('script');
            script3.src = 'large.js';
            script3.dataset.size = '20000';

            document.head.appendChild(script1);
            document.head.appendChild(script2);
            document.head.appendChild(script3);

            jest.spyOn(performanceOptimizer, 'combineScripts').mockImplementation(() => {});

            performanceOptimizer.bundleSmallJS();

            expect(performanceOptimizer.combineScripts).toHaveBeenCalledWith([script1, script2]);
        });
    });

    describe('Memory Cache', () => {
        test('should implement memory cache correctly', () => {
            performanceOptimizer.implementMemoryCache();

            const cache = window.performanceCache;

            expect(cache).toBeDefined();
            expect(typeof cache.get).toBe('function');
            expect(typeof cache.set).toBe('function');
            expect(typeof cache.has).toBe('function');
            expect(typeof cache.delete).toBe('function');
            expect(typeof cache.clear).toBe('function');
        });

        test('should store and retrieve cache values', () => {
            performanceOptimizer.implementMemoryCache();
            const cache = window.performanceCache;

            cache.set('test-key', 'test-value');

            expect(cache.has('test-key')).toBe(true);
            expect(cache.get('test-key')).toBe('test-value');
        });

        test('should respect max cache size', () => {
            performanceOptimizer.maxCacheSize = 2;
            performanceOptimizer.implementMemoryCache();
            const cache = window.performanceCache;

            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            cache.set('key3', 'value3'); // Should evict key1

            expect(cache.has('key1')).toBe(false);
            expect(cache.has('key2')).toBe(true);
            expect(cache.has('key3')).toBe(true);
        });
    });

    describe('Preloading', () => {
        test('should preload critical resources', () => {
            performanceOptimizer.preloadCriticalResources();

            const preloadLinks = document.head.querySelectorAll('link[rel="preload"]');
            expect(preloadLinks.length).toBeGreaterThan(0);

            const cssPreload = Array.from(preloadLinks).find(link =>
                link.href.includes('critical.min.css')
            );
            expect(cssPreload).toBeTruthy();
            expect(cssPreload.as).toBe('style');
        });

        test('should prefetch next page resources', () => {
            // Create test links
            const link1 = document.createElement('a');
            link1.href = '/page1';
            link1.hostname = window.location.hostname;

            const link2 = document.createElement('a');
            link2.href = '/page2';
            link2.hostname = window.location.hostname;

            document.body.appendChild(link1);
            document.body.appendChild(link2);

            performanceOptimizer.prefetchNextPageResources();

            const prefetchLinks = document.head.querySelectorAll('link[rel="prefetch"]');
            expect(prefetchLinks.length).toBe(2);
        });
    });

    describe('CSS and JS Deferring', () => {
        test('should defer non-critical JavaScript', () => {
            const script = document.createElement('script');
            script.src = 'non-critical.js';
            document.head.appendChild(script);

            performanceOptimizer.deferNonCriticalJS();

            expect(script.defer).toBe(true);
        });

        test('should not defer critical JavaScript', () => {
            const script = document.createElement('script');
            script.src = 'critical.js';
            script.dataset.critical = 'true';
            document.head.appendChild(script);

            performanceOptimizer.deferNonCriticalJS();

            expect(script.defer).toBe(false);
        });

        test('should defer non-critical CSS', () => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'non-critical.css';
            document.head.appendChild(link);

            performanceOptimizer.deferNonCriticalCSS();

            expect(link.media).toBe('print');
            expect(typeof link.onload).toBe('function');
        });

        test('should not defer critical CSS', () => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'critical.css';
            link.dataset.critical = 'true';
            document.head.appendChild(link);

            performanceOptimizer.deferNonCriticalCSS();

            expect(link.media).not.toBe('print');
        });
    });

    describe('Performance Scoring', () => {
        test('should calculate performance score correctly', () => {
            const metrics = {
                largestContentfulPaint: 2000,
                firstInputDelay: 50,
                cumulativeLayoutShift: 0.05,
                loadTime: 2500
            };

            const score = performanceOptimizer.calculatePerformanceScore(metrics);

            expect(score).toBe(100); // All metrics are good
        });

        test('should penalize poor LCP performance', () => {
            const metrics = {
                largestContentfulPaint: 3000,
                firstInputDelay: 50,
                cumulativeLayoutShift: 0.05,
                loadTime: 2500
            };

            const score = performanceOptimizer.calculatePerformanceScore(metrics);

            expect(score).toBe(80); // 20 point penalty for LCP > 2500ms
        });

        test('should penalize poor FID performance', () => {
            const metrics = {
                largestContentfulPaint: 2000,
                firstInputDelay: 150,
                cumulativeLayoutShift: 0.05,
                loadTime: 2500
            };

            const score = performanceOptimizer.calculatePerformanceScore(metrics);

            expect(score).toBe(85); // 15 point penalty for FID > 100ms
        });

        test('should penalize poor CLS performance', () => {
            const metrics = {
                largestContentfulPaint: 2000,
                firstInputDelay: 50,
                cumulativeLayoutShift: 0.15,
                loadTime: 2500
            };

            const score = performanceOptimizer.calculatePerformanceScore(metrics);

            expect(score).toBe(85); // 15 point penalty for CLS > 0.1
        });
    });

    describe('Recommendations Generation', () => {
        test('should generate LCP recommendations', () => {
            const metrics = {
                largestContentfulPaint: 3000,
                firstInputDelay: 50,
                cumulativeLayoutShift: 0.05,
                loadTime: 2500
            };

            const recommendations = performanceOptimizer.generateRecommendations(metrics);

            expect(recommendations).toContain(
                expect.objectContaining({
                    priority: 'high',
                    category: 'LCP',
                    message: expect.stringContaining('largest contentful paint')
                })
            );
        });

        test('should generate FID recommendations', () => {
            const metrics = {
                largestContentfulPaint: 2000,
                firstInputDelay: 150,
                cumulativeLayoutShift: 0.05,
                loadTime: 2500
            };

            const recommendations = performanceOptimizer.generateRecommendations(metrics);

            expect(recommendations).toContain(
                expect.objectContaining({
                    priority: 'high',
                    category: 'FID',
                    message: expect.stringContaining('first input delay')
                })
            );
        });

        test('should generate CLS recommendations', () => {
            const metrics = {
                largestContentfulPaint: 2000,
                firstInputDelay: 50,
                cumulativeLayoutShift: 0.15,
                loadTime: 2500
            };

            const recommendations = performanceOptimizer.generateRecommendations(metrics);

            expect(recommendations).toContain(
                expect.objectContaining({
                    priority: 'medium',
                    category: 'CLS',
                    message: expect.stringContaining('layout shifts')
                })
            );
        });
    });

    describe('Memory Monitoring', () => {
        test('should monitor memory usage', (done) => {
            // Mock high memory usage
            Object.defineProperty(performance, 'memory', {
                value: {
                    usedJSHeapSize: 85000000,
                    totalJSHeapSize: 90000000,
                    jsHeapSizeLimit: 100000000
                },
                configurable: true
            });

            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            const reportSpy = jest.spyOn(performanceOptimizer, 'reportMetric');

            performanceOptimizer.startMemoryMonitoring();

            // Wait for the interval to fire
            setTimeout(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('High memory usage: 85.00%')
                );
                expect(reportSpy).toHaveBeenCalledWith('HIGH_MEMORY_USAGE', 85);

                consoleSpy.mockRestore();
                done();
            }, 15);
        });
    });

    describe('Utility Functions', () => {
        test('should detect WebP support correctly', () => {
            // Mock canvas API
            const mockCanvas = {
                width: 0,
                height: 0,
                toDataURL: jest.fn(() => 'data:image/webp;base64,test')
            };

            document.createElement = jest.fn().mockReturnValue(mockCanvas);

            const supportsWebP = performanceOptimizer.supportsWebP();

            expect(mockCanvas.width).toBe(1);
            expect(mockCanvas.height).toBe(1);
            expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/webp');
            expect(supportsWebP).toBe(true);
        });

        test('should test image existence correctly', async () => {
            // Mock Image constructor
            global.Image = class {
                constructor() {
                    this.onload = null;
                    this.onerror = null;
                }

                set src(url) {
                    setTimeout(() => {
                        if (url.includes('exists')) {
                            this.onload();
                        } else {
                            this.onerror();
                        }
                    }, 0);
                }
            };

            const existsResult = await performanceOptimizer.testImageExists('exists.webp');
            const notExistsResult = await performanceOptimizer.testImageExists('notexists.webp');

            expect(existsResult).toBe(true);
            expect(notExistsResult).toBe(false);
        });

        test('should correctly identify below-fold elements', () => {
            const element = {
                getBoundingClientRect: () => ({
                    top: 1000,
                    bottom: 1100,
                    left: 0,
                    right: 100
                })
            };

            // Mock window.innerHeight
            Object.defineProperty(window, 'innerHeight', {
                writable: true,
                configurable: true,
                value: 768
            });

            const isBelowFold = performanceOptimizer.isBelowFold(element);

            expect(isBelowFold).toBe(true);
        });
    });

    describe('Report Generation', () => {
        test('should generate comprehensive performance report', () => {
            const report = performanceOptimizer.generateReport();

            expect(report).toHaveProperty('summary');
            expect(report).toHaveProperty('detailed');
            expect(report).toHaveProperty('recommendations');

            expect(report.summary).toHaveProperty('overallScore');
            expect(report.summary).toHaveProperty('coreWebVitals');
            expect(report.summary).toHaveProperty('loadingMetrics');

            expect(typeof report.summary.overallScore).toBe('number');
            expect(report.summary.overallScore).toBeGreaterThanOrEqual(0);
            expect(report.summary.overallScore).toBeLessThanOrEqual(100);
        });

        test('should include all core web vitals in report', () => {
            const report = performanceOptimizer.generateReport();

            expect(report.summary.coreWebVitals).toHaveProperty('lcp');
            expect(report.summary.coreWebVitals).toHaveProperty('fid');
            expect(report.summary.coreWebVitals).toHaveProperty('cls');
        });

        test('should include loading metrics in report', () => {
            const report = performanceOptimizer.generateReport();

            expect(report.summary.loadingMetrics).toHaveProperty('loadTime');
            expect(report.summary.loadingMetrics).toHaveProperty('domContentLoaded');
            expect(report.summary.loadingMetrics).toHaveProperty('firstContentfulPaint');
        });
    });

    describe('Cleanup', () => {
        test('should properly cleanup observers on destroy', () => {
            performanceOptimizer.destroy();

            expect(mockPerformanceObserver.disconnect).toHaveBeenCalled();
        });

        test('should clear memory cache on destroy', () => {
            performanceOptimizer.implementMemoryCache();
            const cache = window.performanceCache;

            cache.set('test', 'value');
            expect(cache.has('test')).toBe(true);

            performanceOptimizer.destroy();

            // Cache should be cleared but still accessible
            expect(cache.has('test')).toBe(false);
        });
    });

    describe('Event Dispatching', () => {
        test('should dispatch custom performance events', () => {
            const eventListener = jest.fn();
            window.addEventListener('performanceMetric', eventListener);

            performanceOptimizer.reportMetric('TEST_METRIC', 123);

            expect(eventListener).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {
                        name: 'TEST_METRIC',
                        value: 123
                    }
                })
            );

            window.removeEventListener('performanceMetric', eventListener);
        });
    });

    describe('Error Handling', () => {
        test('should handle missing Performance Observer gracefully', () => {
            global.PerformanceObserver = undefined;

            expect(() => {
                new PerformanceOptimizer();
            }).not.toThrow();
        });

        test('should handle missing Intersection Observer gracefully', () => {
            global.IntersectionObserver = undefined;

            expect(() => {
                performanceOptimizer.implementLazyLoading();
            }).not.toThrow();
        });

        test('should handle missing performance.timing gracefully', () => {
            Object.defineProperty(performance, 'timing', {
                value: undefined,
                configurable: true
            });

            expect(() => {
                performanceOptimizer.measureNavigationTiming();
            }).not.toThrow();
        });

        test('should handle missing performance.memory gracefully', () => {
            Object.defineProperty(performance, 'memory', {
                value: undefined,
                configurable: true
            });

            expect(() => {
                performanceOptimizer.startMemoryMonitoring();
            }).not.toThrow();
        });
    });
});