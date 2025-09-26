/**
 * The Profit Platform - Resource Loader Optimizer Tests
 * Comprehensive test suite for resource loading optimization features
 */

describe('Resource Loader Optimizer', () => {
    let resourceLoaderOptimizer;
    let mockIntersectionObserver;
    let mockMutationObserver;
    let mockPerformanceObserver;

    beforeEach(() => {
        // Reset DOM
        document.head.innerHTML = '';
        document.body.innerHTML = '';

        // Mock navigator.connection
        Object.defineProperty(navigator, 'connection', {
            value: {
                effectiveType: '4g',
                downlink: 2.5,
                rtt: 100,
                saveData: false,
                addEventListener: jest.fn()
            },
            configurable: true
        });

        // Mock performance.now
        performance.now = jest.fn(() => Date.now());

        // Mock IntersectionObserver
        mockIntersectionObserver = {
            observe: jest.fn(),
            unobserve: jest.fn(),
            disconnect: jest.fn()
        };

        global.IntersectionObserver = jest.fn(() => mockIntersectionObserver);

        // Mock MutationObserver
        mockMutationObserver = {
            observe: jest.fn(),
            disconnect: jest.fn()
        };

        global.MutationObserver = jest.fn(() => mockMutationObserver);

        // Mock PerformanceObserver
        mockPerformanceObserver = {
            observe: jest.fn(),
            disconnect: jest.fn()
        };

        global.PerformanceObserver = jest.fn(() => mockPerformanceObserver);

        // Mock Image constructor
        global.Image = class {
            constructor() {
                this.onload = null;
                this.onerror = null;
            }
            set src(url) {
                setTimeout(() => {
                    if (this.onload) this.onload();
                }, 0);
            }
        };

        // Mock getBoundingClientRect
        Element.prototype.getBoundingClientRect = jest.fn(() => ({
            top: 100,
            bottom: 200,
            left: 0,
            right: 100,
            width: 100,
            height: 100
        }));

        // Initialize resource loader optimizer
        resourceLoaderOptimizer = new ResourceLoaderOptimizer({
            preloading: true,
            prefetching: true,
            lazyLoading: true,
            serviceWorkerCaching: false, // Disable for tests
            adaptiveLoading: true,
            connectionAware: true
        });
    });

    afterEach(() => {
        if (resourceLoaderOptimizer) {
            resourceLoaderOptimizer.destroy();
        }
        jest.restoreAllMocks();
    });

    describe('Network Detection', () => {
        test('should detect network conditions correctly', () => {
            expect(resourceLoaderOptimizer.networkInfo).toEqual({
                effectiveType: '4g',
                downlink: 2.5,
                rtt: 100,
                saveData: false
            });
        });

        test('should enable data saving mode for slow connections', () => {
            navigator.connection.effectiveType = '2g';
            navigator.connection.downlink = 0.3;

            const optimizeSpy = jest.spyOn(resourceLoaderOptimizer, 'optimizeImagesForLowBandwidth');
            const deferSpy = jest.spyOn(resourceLoaderOptimizer, 'deferNonCriticalResources');

            resourceLoaderOptimizer.updateNetworkConditions();
            resourceLoaderOptimizer.adaptLoadingStrategy();

            expect(optimizeSpy).toHaveBeenCalled();
            expect(deferSpy).toHaveBeenCalled();
            expect(resourceLoaderOptimizer.options.prefetching).toBe(false);
        });

        test('should enable optimal loading mode for good connections', () => {
            navigator.connection.effectiveType = '4g';
            navigator.connection.downlink = 10;

            const preloadSpy = jest.spyOn(resourceLoaderOptimizer, 'aggressivelyPreloadResources');

            resourceLoaderOptimizer.updateNetworkConditions();
            resourceLoaderOptimizer.adaptLoadingStrategy();

            expect(resourceLoaderOptimizer.options.preloading).toBe(true);
            expect(resourceLoaderOptimizer.options.prefetching).toBe(true);
            expect(preloadSpy).toHaveBeenCalled();
        });

        test('should estimate network speed from image loading', (done) => {
            performance.now = jest.fn()
                .mockReturnValueOnce(0)    // Start time
                .mockReturnValueOnce(50);  // End time (fast connection)

            resourceLoaderOptimizer.estimateNetworkSpeed();

            setTimeout(() => {
                expect(resourceLoaderOptimizer.networkSpeed).toBe('fast');
                done();
            }, 10);
        });
    });

    describe('Resource Discovery', () => {
        test('should extract resources from new elements', () => {
            const div = document.createElement('div');
            div.innerHTML = `
                <img src="/test.jpg" alt="Test" loading="lazy">
                <script src="/test.js" defer></script>
                <link rel="stylesheet" href="/test.css">
                <video src="/test.mp4" preload="metadata"></video>
            `;

            const resources = resourceLoaderOptimizer.extractResourcesFromElement(div);

            expect(resources.length).toBe(4);

            const image = resources.find(r => r.type === 'image');
            expect(image).toBeTruthy();
            expect(image.url).toBe('/test.jpg');
            expect(image.loading).toBe('lazy');

            const script = resources.find(r => r.type === 'script');
            expect(script).toBeTruthy();
            expect(script.url).toBe('/test.js');
            expect(script.defer).toBe(true);

            const stylesheet = resources.find(r => r.type === 'stylesheet');
            expect(stylesheet).toBeTruthy();
            expect(stylesheet.url).toBe('/test.css');

            const video = resources.find(r => r.type === 'video');
            expect(video).toBeTruthy();
            expect(video.url).toBe('/test.mp4');
            expect(video.preload).toBe('metadata');
        });

        test('should calculate resource priority correctly', () => {
            const criticalImg = document.createElement('img');
            criticalImg.dataset.critical = 'true';

            const aboveFoldImg = document.createElement('img');
            aboveFoldImg.getBoundingClientRect = jest.fn(() => ({
                top: 100,
                bottom: 200,
                left: 0,
                right: 100
            }));

            const belowFoldImg = document.createElement('img');
            belowFoldImg.getBoundingClientRect = jest.fn(() => ({
                top: 1000,
                bottom: 1100,
                left: 0,
                right: 100
            }));

            const lazyImg = document.createElement('img');
            lazyImg.dataset.lazy = 'true';

            jest.spyOn(resourceLoaderOptimizer, 'isAboveFold')
                .mockImplementation(el => el === aboveFoldImg);

            jest.spyOn(resourceLoaderOptimizer, 'isBelowFold')
                .mockImplementation(el => el === belowFoldImg);

            const criticalPriority = resourceLoaderOptimizer.calculateResourcePriority(criticalImg);
            const aboveFoldPriority = resourceLoaderOptimizer.calculateResourcePriority(aboveFoldImg);
            const belowFoldPriority = resourceLoaderOptimizer.calculateResourcePriority(belowFoldImg);
            const lazyPriority = resourceLoaderOptimizer.calculateResourcePriority(lazyImg);

            expect(criticalPriority).toBe(resourceLoaderOptimizer.priorities.CRITICAL);
            expect(aboveFoldPriority).toBe(resourceLoaderOptimizer.priorities.HIGH);
            expect(belowFoldPriority).toBe(resourceLoaderOptimizer.priorities.LOW);
            expect(lazyPriority).toBe(resourceLoaderOptimizer.priorities.LAZY);
        });

        test('should register resources correctly', () => {
            const resource = {
                type: 'image',
                url: '/test.jpg',
                priority: resourceLoaderOptimizer.priorities.HIGH
            };

            resourceLoaderOptimizer.registerResource(resource);

            expect(resourceLoaderOptimizer.resources.has('/test.jpg')).toBe(true);

            const registeredResource = resourceLoaderOptimizer.resources.get('/test.jpg');
            expect(registeredResource.type).toBe('image');
            expect(registeredResource.priority).toBe(resourceLoaderOptimizer.priorities.HIGH);
            expect(registeredResource.registered).toBeTruthy();
        });

        test('should categorize resources into queues', () => {
            const criticalResource = { priority: resourceLoaderOptimizer.priorities.CRITICAL };
            const mediumResource = { priority: resourceLoaderOptimizer.priorities.MEDIUM };
            const lazyResource = { priority: resourceLoaderOptimizer.priorities.LAZY };

            resourceLoaderOptimizer.categorizeResource(criticalResource);
            resourceLoaderOptimizer.categorizeResource(mediumResource);
            resourceLoaderOptimizer.categorizeResource(lazyResource);

            expect(resourceLoaderOptimizer.preloadQueue).toContain(criticalResource);
            expect(resourceLoaderOptimizer.prefetchQueue).toContain(mediumResource);
            expect(resourceLoaderOptimizer.lazyQueue).toContain(lazyResource);
        });
    });

    describe('Preloading', () => {
        test('should preload critical resources', () => {
            const resource = {
                type: 'image',
                url: '/critical.jpg',
                priority: resourceLoaderOptimizer.priorities.HIGH,
                element: null
            };

            resourceLoaderOptimizer.preloadResource(resource);

            const preloadLink = document.head.querySelector('link[rel="preload"][href="/critical.jpg"]');
            expect(preloadLink).toBeTruthy();
            expect(preloadLink.as).toBe('image');
        });

        test('should set appropriate "as" attribute for different resource types', () => {
            const resources = [
                { type: 'image', url: '/test.jpg' },
                { type: 'script', url: '/test.js' },
                { type: 'stylesheet', url: '/test.css' },
                { type: 'font', url: '/test.woff2' }
            ];

            resources.forEach(resource => {
                resourceLoaderOptimizer.preloadResource(resource);
            });

            const imagePreload = document.head.querySelector('link[href="/test.jpg"]');
            const scriptPreload = document.head.querySelector('link[href="/test.js"]');
            const stylePreload = document.head.querySelector('link[href="/test.css"]');
            const fontPreload = document.head.querySelector('link[href="/test.woff2"]');

            expect(imagePreload.as).toBe('image');
            expect(scriptPreload.as).toBe('script');
            expect(stylePreload.as).toBe('style');
            expect(fontPreload.as).toBe('font');
            expect(fontPreload.crossOrigin).toBe('anonymous');
        });

        test('should not preload same resource twice', () => {
            const img = document.createElement('img');
            const resource = {
                type: 'image',
                url: '/test.jpg',
                element: img
            };

            resourceLoaderOptimizer.preloadResource(resource);
            resourceLoaderOptimizer.preloadResource(resource);

            const preloadLinks = document.head.querySelectorAll('link[href="/test.jpg"]');
            expect(preloadLinks.length).toBe(1);
            expect(img.dataset.preloaded).toBe('true');
        });
    });

    describe('Prefetching', () => {
        test('should prefetch next page resources', () => {
            const link1 = document.createElement('a');
            link1.href = '/page1';
            link1.hostname = window.location.hostname;

            const link2 = document.createElement('a');
            link2.href = '/page2';
            link2.hostname = window.location.hostname;

            const externalLink = document.createElement('a');
            externalLink.href = 'https://external.com/page';

            document.body.appendChild(link1);
            document.body.appendChild(link2);
            document.body.appendChild(externalLink);

            resourceLoaderOptimizer.prefetchNextPageResources();

            const prefetchLinks = document.head.querySelectorAll('link[rel="prefetch"]');
            expect(prefetchLinks.length).toBe(2); // Only internal links

            const hrefs = Array.from(prefetchLinks).map(link => link.href);
            expect(hrefs).toContain('/page1');
            expect(hrefs).toContain('/page2');
        });

        test('should prefetch resources correctly', () => {
            const resource = {
                type: 'script',
                url: '/deferred.js',
                element: null
            };

            resourceLoaderOptimizer.prefetchResource(resource);

            const prefetchLink = document.head.querySelector('link[rel="prefetch"][href="/deferred.js"]');
            expect(prefetchLink).toBeTruthy();
        });
    });

    describe('Lazy Loading', () => {
        test('should make images lazy correctly', () => {
            const img = document.createElement('img');
            img.src = '/test.jpg';
            img.srcset = '/test-2x.jpg 2x';

            resourceLoaderOptimizer.makeLazyImage(img);

            expect(img.dataset.src).toBe('/test.jpg');
            expect(img.dataset.srcset).toBe('/test-2x.jpg 2x');
            expect(img.src).toContain('data:image/gif');
            expect(img.hasAttribute('srcset')).toBe(false);
            expect(img.loading).toBe('lazy');
            expect(img.classList.contains('lazy')).toBe(true);
        });

        test('should make videos lazy correctly', () => {
            const video = document.createElement('video');
            video.src = '/test.mp4';
            video.preload = 'auto';

            resourceLoaderOptimizer.makeLazyVideo(video);

            expect(video.preload).toBe('none');
            expect(video.dataset.lazy).toBe('true');
            expect(video.classList.contains('lazy')).toBe(true);
        });

        test('should make scripts lazy correctly', () => {
            const script = document.createElement('script');
            script.src = '/test.js';

            resourceLoaderOptimizer.makeLazyScript(script);

            expect(script.dataset.src).toBe('/test.js');
            expect(script.hasAttribute('src')).toBe(false);
            expect(script.dataset.lazy).toBe('true');
        });

        test('should load lazy image when triggered', () => {
            const img = document.createElement('img');
            img.dataset.src = '/lazy-test.jpg';
            img.dataset.srcset = '/lazy-test-2x.jpg 2x';
            img.classList.add('lazy');

            resourceLoaderOptimizer.loadLazyImage(img);

            expect(img.src).toBe('/lazy-test.jpg');
            expect(img.srcset).toBe('/lazy-test-2x.jpg 2x');
            expect(img.hasAttribute('data-src')).toBe(false);
            expect(img.hasAttribute('data-srcset')).toBe(false);
            expect(img.classList.contains('lazy')).toBe(false);
            expect(img.classList.contains('loaded')).toBe(true);
        });

        test('should load lazy video when triggered', () => {
            const video = document.createElement('video');
            video.src = '/lazy-test.mp4';
            video.preload = 'none';
            video.classList.add('lazy');

            resourceLoaderOptimizer.loadLazyVideo(video);

            expect(video.preload).toBe('metadata');
            expect(video.classList.contains('lazy')).toBe(false);
            expect(video.classList.contains('loaded')).toBe(true);
        });

        test('should load lazy script when triggered', () => {
            const script = document.createElement('script');
            script.dataset.src = '/lazy-test.js';
            document.head.appendChild(script);

            resourceLoaderOptimizer.loadLazyScript(script);

            const newScript = document.head.querySelector('script[src="/lazy-test.js"]');
            expect(newScript).toBeTruthy();
            expect(newScript.async).toBe(true);
            expect(newScript).not.toBe(script); // Should be a new script element
        });
    });

    describe('Resource Hints', () => {
        test('should add DNS prefetch for external domains', () => {
            const img = document.createElement('img');
            img.src = 'https://cdn.example.com/image.jpg';
            document.body.appendChild(img);

            resourceLoaderOptimizer.addDNSPrefetch();

            const dnsPrefetch = document.head.querySelector('link[rel="dns-prefetch"]');
            expect(dnsPrefetch).toBeTruthy();
            expect(dnsPrefetch.href).toBe('//cdn.example.com');
        });

        test('should add preconnect for critical domains', () => {
            resourceLoaderOptimizer.addPreconnect();

            const preconnectLinks = document.head.querySelectorAll('link[rel="preconnect"]');
            expect(preconnectLinks.length).toBeGreaterThan(0);

            const fontsPreconnect = Array.from(preconnectLinks)
                .find(link => link.href.includes('fonts.googleapis.com'));
            expect(fontsPreconnect).toBeTruthy();
            expect(fontsPreconnect.crossOrigin).toBe('anonymous');
        });

        test('should add module preload for ES modules', () => {
            const moduleScript = document.createElement('script');
            moduleScript.type = 'module';
            moduleScript.src = '/module.js';
            document.head.appendChild(moduleScript);

            resourceLoaderOptimizer.addModulePreload();

            const modulePreload = document.head.querySelector('link[rel="modulepreload"]');
            expect(modulePreload).toBeTruthy();
            expect(modulePreload.href).toBe('/module.js');
            expect(moduleScript.dataset.preloaded).toBe('true');
        });

        test('should extract external domains correctly', () => {
            const img1 = document.createElement('img');
            img1.src = 'https://cdn.example.com/image1.jpg';

            const img2 = document.createElement('img');
            img2.src = 'https://assets.example.org/image2.jpg';

            const localImg = document.createElement('img');
            localImg.src = '/local-image.jpg';

            document.body.appendChild(img1);
            document.body.appendChild(img2);
            document.body.appendChild(localImg);

            const domains = resourceLoaderOptimizer.extractExternalDomains();

            expect(domains).toContain('cdn.example.com');
            expect(domains).toContain('assets.example.org');
            expect(domains).not.toContain(window.location.hostname);
        });
    });

    describe('Image Optimization', () => {
        test('should optimize images for low bandwidth', () => {
            const img1 = document.createElement('img');
            img1.src = '/test.jpg';

            const img2 = document.createElement('img');
            img2.src = '/test.png';
            img2.dataset.optimized = 'true'; // Already optimized

            document.body.appendChild(img1);
            document.body.appendChild(img2);

            resourceLoaderOptimizer.optimizeImagesForLowBandwidth();

            expect(img1.dataset.optimized).toBe('true');
            expect(img1.loading).toBe('lazy');

            // Should not re-optimize
            expect(img2.dataset.optimized).toBe('true');
        });

        test('should reduce JPEG quality on slow connections', () => {
            resourceLoaderOptimizer.networkSpeed = 'slow';

            const img = document.createElement('img');
            img.src = '/test.jpeg';

            resourceLoaderOptimizer.reduceImageQuality(img);

            expect(img.src).toContain('quality=80');
        });

        test('should add responsive images', () => {
            const img = document.createElement('img');
            img.src = '/test.jpg';

            resourceLoaderOptimizer.addResponsiveImages(img);

            expect(img.srcset).toContain('/test.jpg?w=480 480w');
            expect(img.srcset).toContain('/test.jpg?w=768 768w');
            expect(img.srcset).toContain('/test.jpg?w=1024 1024w');
            expect(img.sizes).toBe('(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw');
        });
    });

    describe('Performance Monitoring', () => {
        test('should process resource timing entries', () => {
            const entry = {
                name: '/test.js',
                startTime: 100,
                responseEnd: 300,
                transferSize: 5000,
                decodedBodySize: 5500
            };

            // Register the resource first
            resourceLoaderOptimizer.resources.set('/test.js', {
                type: 'script',
                loadTime: null,
                size: null,
                cached: false
            });

            resourceLoaderOptimizer.processResourceTimingEntry(entry);

            const resource = resourceLoaderOptimizer.resources.get('/test.js');
            expect(resource.loadTime).toBe(200); // 300 - 100
            expect(resource.size).toBe(5000);
            expect(resource.cached).toBe(false);

            expect(resourceLoaderOptimizer.loadingStats.totalRequests).toBe(1);
            expect(resourceLoaderOptimizer.loadingStats.totalBytes).toBe(5000);
        });

        test('should detect cached resources', () => {
            const cachedEntry = {
                name: '/cached.js',
                startTime: 100,
                responseEnd: 150,
                transferSize: 0,
                decodedBodySize: 3000
            };

            resourceLoaderOptimizer.resources.set('/cached.js', {});
            resourceLoaderOptimizer.processResourceTimingEntry(cachedEntry);

            expect(resourceLoaderOptimizer.loadingStats.cachedRequests).toBe(1);

            const resource = resourceLoaderOptimizer.resources.get('/cached.js');
            expect(resource.cached).toBe(true);
        });

        test('should update average load time correctly', () => {
            const resources = [
                { loadTime: 100 },
                { loadTime: 200 },
                { loadTime: 300 }
            ];

            resources.forEach((data, index) => {
                resourceLoaderOptimizer.resources.set(`/test${index}.js`, data);
            });

            resourceLoaderOptimizer.updateLoadingStats({});

            expect(resourceLoaderOptimizer.loadingStats.averageLoadTime).toBe(200);
        });
    });

    describe('Viewport Detection', () => {
        test('should detect elements in viewport correctly', () => {
            const inViewportElement = {
                getBoundingClientRect: () => ({
                    top: 0,
                    left: 0,
                    bottom: 100,
                    right: 100
                })
            };

            const outOfViewportElement = {
                getBoundingClientRect: () => ({
                    top: 1000,
                    left: 0,
                    bottom: 1100,
                    right: 100
                })
            };

            // Mock window dimensions
            Object.defineProperty(window, 'innerHeight', { value: 768 });
            Object.defineProperty(window, 'innerWidth', { value: 1024 });

            expect(resourceLoaderOptimizer.isInViewport(inViewportElement)).toBe(true);
            expect(resourceLoaderOptimizer.isInViewport(outOfViewportElement)).toBe(false);
        });

        test('should identify above-fold and below-fold elements', () => {
            const aboveFoldElement = {
                getBoundingClientRect: () => ({
                    top: 100,
                    bottom: 200,
                    left: 0,
                    right: 100
                })
            };

            const belowFoldElement = {
                getBoundingClientRect: () => ({
                    top: 1000,
                    bottom: 1100,
                    left: 0,
                    right: 100
                })
            };

            expect(resourceLoaderOptimizer.isAboveFold(aboveFoldElement)).toBe(true);
            expect(resourceLoaderOptimizer.isBelowFold(belowFoldElement)).toBe(true);

            expect(resourceLoaderOptimizer.isAboveFold(belowFoldElement)).toBe(false);
            expect(resourceLoaderOptimizer.isBelowFold(aboveFoldElement)).toBe(false);
        });
    });

    describe('Loading Statistics', () => {
        test('should return comprehensive loading stats', () => {
            resourceLoaderOptimizer.loadingStats = {
                totalRequests: 10,
                cachedRequests: 3,
                totalBytes: 50000,
                savedBytes: 15000,
                averageLoadTime: 250
            };

            resourceLoaderOptimizer.resources.set('test1', {});
            resourceLoaderOptimizer.resources.set('test2', {});

            const stats = resourceLoaderOptimizer.getLoadingStats();

            expect(stats.totalRequests).toBe(10);
            expect(stats.cachedRequests).toBe(3);
            expect(stats.cacheHitRate).toBe(30); // 3/10 * 100
            expect(stats.bandwidthSaved).toBe(15000);
            expect(stats.resourceCount).toBe(2);
            expect(stats.averageLoadTime).toBe(250);
        });
    });

    describe('Resource Report Generation', () => {
        beforeEach(() => {
            const resources = [
                { priority: resourceLoaderOptimizer.priorities.CRITICAL, optimized: true, cached: true, used: true },
                { priority: resourceLoaderOptimizer.priorities.HIGH, optimized: true, cached: false, used: true },
                { priority: resourceLoaderOptimizer.priorities.MEDIUM, optimized: false, cached: true, used: false },
                { priority: resourceLoaderOptimizer.priorities.LOW, optimized: true, cached: false, used: true }
            ];

            resources.forEach((data, index) => {
                resourceLoaderOptimizer.resources.set(`resource${index}`, data);
            });

            resourceLoaderOptimizer.preloadQueue = [{ url: 'preload1' }, { url: 'preload2' }];
            resourceLoaderOptimizer.prefetchQueue = [{ url: 'prefetch1' }];
            resourceLoaderOptimizer.lazyQueue = [{ url: 'lazy1' }, { url: 'lazy2' }, { url: 'lazy3' }];
        });

        test('should generate comprehensive resource report', () => {
            const report = resourceLoaderOptimizer.getResourceReport();

            expect(report.summary.total).toBe(4);
            expect(report.summary.critical).toBe(1);
            expect(report.summary.high).toBe(2); // critical + high
            expect(report.summary.optimized).toBe(3);
            expect(report.summary.cached).toBe(2);
            expect(report.summary.unused).toBe(1);

            expect(report.strategies.preloaded).toBe(2);
            expect(report.strategies.prefetched).toBe(1);
            expect(report.strategies.lazy).toBe(3);

            expect(report.network).toEqual(resourceLoaderOptimizer.networkInfo);
        });

        test('should generate optimization report with recommendations', () => {
            resourceLoaderOptimizer.loadingStats = {
                totalRequests: 10,
                cachedRequests: 2,
                averageLoadTime: 1500
            };

            const report = resourceLoaderOptimizer.generateOptimizationReport();

            expect(report).toHaveProperty('performance');
            expect(report).toHaveProperty('resources');
            expect(report).toHaveProperty('optimizations');
            expect(report).toHaveProperty('recommendations');

            const recommendations = report.recommendations;
            expect(recommendations.some(r => r.category === 'Caching')).toBe(true);
            expect(recommendations.some(r => r.category === 'Performance')).toBe(true);
        });
    });

    describe('Cache Strategy', () => {
        test('should return appropriate cache strategies', () => {
            const imageResource = { type: 'image' };
            const scriptResource = { type: 'script' };
            const otherResource = { type: 'video' };

            expect(resourceLoaderOptimizer.getCacheStrategy(imageResource)).toBe('cache-first');
            expect(resourceLoaderOptimizer.getCacheStrategy(scriptResource)).toBe('stale-while-revalidate');
            expect(resourceLoaderOptimizer.getCacheStrategy(otherResource)).toBe('network-first');
        });
    });

    describe('Error Handling', () => {
        test('should handle missing network connection gracefully', () => {
            Object.defineProperty(navigator, 'connection', {
                value: undefined,
                configurable: true
            });

            expect(() => {
                new ResourceLoaderOptimizer();
            }).not.toThrow();
        });

        test('should handle missing Performance Observer gracefully', () => {
            global.PerformanceObserver = undefined;

            expect(() => {
                resourceLoaderOptimizer.observeResourceTiming();
            }).not.toThrow();
        });

        test('should handle missing Intersection Observer gracefully', () => {
            global.IntersectionObserver = undefined;

            expect(() => {
                resourceLoaderOptimizer.setupIntersectionObserver();
            }).not.toThrow();
        });

        test('should handle invalid URLs gracefully', () => {
            const invalidImg = document.createElement('img');
            invalidImg.src = 'not-a-valid-url';

            expect(() => {
                resourceLoaderOptimizer.extractExternalDomains();
            }).not.toThrow();
        });
    });

    describe('Cleanup', () => {
        test('should properly cleanup all observers and data structures', () => {
            resourceLoaderOptimizer.resources.set('test', {});
            resourceLoaderOptimizer.preloadQueue.push({});
            resourceLoaderOptimizer.prefetchQueue.push({});
            resourceLoaderOptimizer.lazyQueue.push({});

            resourceLoaderOptimizer.destroy();

            expect(mockMutationObserver.disconnect).toHaveBeenCalled();
            expect(mockIntersectionObserver.disconnect).toHaveBeenCalled();
            expect(mockPerformanceObserver.disconnect).toHaveBeenCalled();

            expect(resourceLoaderOptimizer.resources.size).toBe(0);
            expect(resourceLoaderOptimizer.preloadQueue.length).toBe(0);
            expect(resourceLoaderOptimizer.prefetchQueue.length).toBe(0);
            expect(resourceLoaderOptimizer.lazyQueue.length).toBe(0);
        });
    });

    describe('Resource Optimization', () => {
        test('should optimize script resources correctly', () => {
            const script = document.createElement('script');
            script.src = '/test.js';

            const resource = {
                type: 'script',
                element: script,
                priority: resourceLoaderOptimizer.priorities.MEDIUM
            };

            resourceLoaderOptimizer.optimizeScriptResource(resource);

            expect(script.defer).toBe(true);
        });

        test('should optimize stylesheet resources correctly', () => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/test.css';

            const resource = {
                type: 'stylesheet',
                element: link,
                priority: resourceLoaderOptimizer.priorities.MEDIUM
            };

            resourceLoaderOptimizer.optimizeStylesheetResource(resource);

            expect(link.media).toBe('print');
            expect(typeof link.onload).toBe('function');
        });

        test('should optimize video resources correctly', () => {
            const video = document.createElement('video');
            video.src = '/test.mp4';
            video.preload = 'auto';

            const resource = {
                type: 'video',
                element: video,
                priority: resourceLoaderOptimizer.priorities.LOW
            };

            resourceLoaderOptimizer.optimizeVideoResource(resource);

            expect(video.preload).toBe('none');
        });
    });

    describe('Navigation Resource Detection', () => {
        test('should identify navigation resources correctly', () => {
            const nav = document.createElement('nav');
            const navScript = document.createElement('script');
            navScript.src = '/nav.js';
            nav.appendChild(navScript);

            const header = document.createElement('header');
            const headerImg = document.createElement('img');
            headerImg.src = '/logo.jpg';
            header.appendChild(headerImg);

            const navClassElement = document.createElement('div');
            navClassElement.className = 'main-navigation';
            const navCSS = document.createElement('link');
            navCSS.href = '/nav.css';
            navClassElement.appendChild(navCSS);

            document.body.appendChild(nav);
            document.body.appendChild(header);
            document.body.appendChild(navClassElement);

            expect(resourceLoaderOptimizer.isNavigationResource(navScript)).toBe(true);
            expect(resourceLoaderOptimizer.isNavigationResource(headerImg)).toBe(true);
            expect(resourceLoaderOptimizer.isNavigationResource(navCSS)).toBe(true);

            const regularDiv = document.createElement('div');
            expect(resourceLoaderOptimizer.isNavigationResource(regularDiv)).toBe(false);
        });
    });
});