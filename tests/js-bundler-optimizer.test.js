/**
 * The Profit Platform - JavaScript Bundler Optimizer Tests
 * Comprehensive test suite for JavaScript bundling and optimization features
 */

describe('JavaScript Bundler Optimizer', () => {
    let jsBundlerOptimizer;
    let mockFetch;

    beforeEach(() => {
        // Reset DOM
        document.head.innerHTML = '';
        document.body.innerHTML = '';

        // Mock fetch
        mockFetch = jest.fn();
        global.fetch = mockFetch;

        // Mock performance.getEntriesByName
        performance.getEntriesByName = jest.fn(() => []);

        // Initialize bundler optimizer
        jsBundlerOptimizer = new JSBundlerOptimizer({
            bundleStrategy: 'split',
            minify: true,
            compressionLevel: 'high'
        });
    });

    afterEach(() => {
        if (jsBundlerOptimizer) {
            jsBundlerOptimizer.destroy();
        }
        jest.restoreAllMocks();
    });

    describe('Module Detection', () => {
        test('should detect existing JavaScript modules', () => {
            const script1 = document.createElement('script');
            script1.src = '/js/navigation.js';
            document.head.appendChild(script1);

            const script2 = document.createElement('script');
            script2.src = '/js/pricing.js';
            document.head.appendChild(script2);

            const script3 = document.createElement('script');
            script3.src = 'https://cdn.example.com/external.js';
            document.head.appendChild(script3);

            const modules = jsBundlerOptimizer.detectExistingModules();

            expect(modules.size).toBe(2); // Only local modules
            expect(modules.has('navigation.js')).toBe(true);
            expect(modules.has('pricing.js')).toBe(true);
            expect(modules.has('external.js')).toBe(false);
        });

        test('should exclude already minified files', () => {
            const script = document.createElement('script');
            script.src = '/js/script.min.js';
            document.head.appendChild(script);

            const modules = jsBundlerOptimizer.detectExistingModules();

            expect(modules.has('script.min.js')).toBe(false);
        });

        test('should exclude tracking and analytics scripts', () => {
            const gtag = document.createElement('script');
            gtag.src = 'https://www.googletagmanager.com/gtag/js';
            document.head.appendChild(gtag);

            const analytics = document.createElement('script');
            analytics.src = '/js/analytics.js';
            document.head.appendChild(analytics);

            const modules = jsBundlerOptimizer.detectExistingModules();

            expect(modules.has('gtag.js')).toBe(false);
            expect(modules.has('analytics.js')).toBe(false);
        });

        test('should calculate module priority correctly', () => {
            const criticalScript = document.createElement('script');
            criticalScript.src = '/js/critical.js';
            criticalScript.dataset.critical = 'true';
            document.head.appendChild(criticalScript);

            const navigationScript = document.createElement('script');
            navigationScript.src = '/js/navigation.js';
            document.head.appendChild(navigationScript);

            const regularScript = document.createElement('script');
            regularScript.src = '/js/regular.js';
            document.head.appendChild(regularScript);

            const modules = jsBundlerOptimizer.detectExistingModules();

            expect(modules.get('critical.js').priority).toBeGreaterThan(
                modules.get('navigation.js').priority
            );
            expect(modules.get('navigation.js').priority).toBeGreaterThan(
                modules.get('regular.js').priority
            );
        });

        test('should estimate file sizes correctly', () => {
            const script = document.createElement('script');
            script.src = '/js/consolidated.js';
            document.head.appendChild(script);

            // Mock performance.getEntriesByName to return size
            performance.getEntriesByName = jest.fn(() => [{
                transferSize: 45000,
                decodedBodySize: 50000
            }]);

            const estimatedSize = jsBundlerOptimizer.estimateFileSize(script);

            expect(estimatedSize).toBe(45000);
        });
    });

    describe('Bundle Creation Strategies', () => {
        beforeEach(() => {
            // Create test modules
            const scripts = [
                { src: '/js/critical.js', priority: 100 },
                { src: '/js/navigation.js', priority: 80 },
                { src: '/js/components.js', priority: 60 },
                { src: '/js/utilities.js', priority: 20 }
            ];

            scripts.forEach(({ src, priority }) => {
                const script = document.createElement('script');
                script.src = src;
                if (priority >= 100) script.dataset.critical = 'true';
                document.head.appendChild(script);
            });

            jsBundlerOptimizer.detectExistingModules();
        });

        test('should create single bundle strategy', () => {
            jsBundlerOptimizer.options.bundleStrategy = 'single';
            jsBundlerOptimizer.createOptimizedBundles();

            const bundles = jsBundlerOptimizer.bundles;
            expect(bundles.size).toBe(1);
            expect(bundles.has('app-bundle')).toBe(true);

            const bundle = bundles.get('app-bundle');
            expect(bundle.modules.length).toBe(4);
            expect(bundle.loadStrategy).toBe('immediate');
        });

        test('should create split bundle strategy', () => {
            jsBundlerOptimizer.options.bundleStrategy = 'split';
            jsBundlerOptimizer.createOptimizedBundles();

            const bundles = jsBundlerOptimizer.bundles;
            expect(bundles.size).toBeGreaterThan(1);

            // Should have critical bundle
            const criticalBundle = Array.from(bundles.values())
                .find(b => b.loadStrategy === 'immediate');
            expect(criticalBundle).toBeTruthy();
            expect(criticalBundle.modules).toContain('critical.js');

            // Should have main bundle
            const mainBundle = Array.from(bundles.values())
                .find(b => b.loadStrategy === 'defer');
            expect(mainBundle).toBeTruthy();

            // Should have lazy bundle
            const lazyBundle = Array.from(bundles.values())
                .find(b => b.loadStrategy === 'lazy');
            expect(lazyBundle).toBeTruthy();
        });

        test('should create dynamic bundle strategy', () => {
            jsBundlerOptimizer.options.bundleStrategy = 'dynamic';
            jsBundlerOptimizer.createOptimizedBundles();

            const bundles = jsBundlerOptimizer.bundles;
            expect(bundles.size).toBeGreaterThan(0);

            // Should group by routes
            const homeBundle = Array.from(bundles.values())
                .find(b => b.route === 'home');
            expect(homeBundle).toBeTruthy();
        });
    });

    describe('Code Optimization', () => {
        const sampleCode = `
            // Debug code
            console.log('Debug message');
            console.debug('Debug info');

            /* Multi-line comment
               that should be removed */

            function unusedFunction() {
                // This function is empty
            }

            function add(a, b) {
                return a + b;
            }

            // For loop optimization test
            for (var i = 0; i < array.length; i++) {
                // Process array[i]
            }

            // String concatenation
            var message = 'Hello' + ' ' + name + '!';

            // DOM query
            var element = document.querySelector('#myId');
            var sameElement = document.querySelector('#myId');
        `;

        test('should remove dead code', () => {
            const optimizedCode = jsBundlerOptimizer.removeDeadCode(sampleCode);

            expect(optimizedCode).not.toContain('console.log');
            expect(optimizedCode).not.toContain('console.debug');
            expect(optimizedCode).not.toContain('/* Multi-line comment');
            expect(optimizedCode).not.toContain('function unusedFunction()');
        });

        test('should optimize loops', () => {
            const optimizedCode = jsBundlerOptimizer.optimizeLoops(sampleCode);

            expect(optimizedCode).toContain('for(let i=0,len=array.length;i<len;i++)');
        });

        test('should optimize string operations', () => {
            const optimizedCode = jsBundlerOptimizer.optimizeStringOperations(sampleCode);

            expect(optimizedCode).toContain('`Hello ${name}!`');
        });

        test('should optimize DOM operations', () => {
            const optimizedCode = jsBundlerOptimizer.optimizeDOMOperations(sampleCode);

            expect(optimizedCode).toContain('const _myId = document.querySelector(\'#myId\');');
            expect(optimizedCode.split('document.querySelector').length).toBe(2); // Only one query
        });

        test('should minify code', () => {
            const optimizedCode = jsBundlerOptimizer.minifyCode(sampleCode);

            expect(optimizedCode).not.toContain('\n\n');
            expect(optimizedCode).not.toContain('  '); // Multiple spaces
            expect(optimizedCode.length).toBeLessThan(sampleCode.length);
        });

        test('should apply full optimization pipeline', () => {
            const optimizedCode = jsBundlerOptimizer.optimizeBundle(sampleCode);
            const stats = jsBundlerOptimizer.getOptimizationStats();

            expect(optimizedCode.length).toBeLessThan(sampleCode.length);
            expect(stats.compressionRatio).toBeGreaterThan(0);
            expect(stats.optimizationsApplied.length).toBeGreaterThan(0);
        });
    });

    describe('Bundle Loading', () => {
        beforeEach(() => {
            mockFetch.mockResolvedValue({
                text: () => Promise.resolve('console.log("Test module");')
            });

            // Create a test bundle
            jsBundlerOptimizer.bundles.set('test-bundle', {
                name: 'test-bundle.js',
                modules: ['test.js'],
                priority: 50,
                size: 1000,
                loadStrategy: 'immediate'
            });

            jsBundlerOptimizer.moduleRegistry.set('test.js', {
                url: '/js/test.js',
                priority: 50,
                size: 1000
            });
        });

        test('should load bundle successfully', async () => {
            await jsBundlerOptimizer.loadBundle('test-bundle');

            const bundleScript = document.querySelector('script[data-bundle="test-bundle.js"]');
            expect(bundleScript).toBeTruthy();
            expect(bundleScript.textContent).toContain('console.log("Test module");');
        });

        test('should handle bundle loading failure', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            const fallbackSpy = jest.spyOn(jsBundlerOptimizer, 'fallbackToOriginalScripts');

            await jsBundlerOptimizer.loadBundle('test-bundle');

            expect(consoleSpy).toHaveBeenCalledWith(
                "Failed to load bundle 'test-bundle':",
                expect.any(Error)
            );
            expect(fallbackSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        test('should report bundle metrics', async () => {
            global.gtag = jest.fn();

            await jsBundlerOptimizer.loadBundle('test-bundle');

            expect(global.gtag).toHaveBeenCalledWith('event', 'bundle_loaded', {
                event_category: 'Performance',
                event_label: 'test-bundle',
                value: expect.any(Number)
            });
        });
    });

    describe('Loading Strategies', () => {
        beforeEach(() => {
            // Create test bundles with different strategies
            jsBundlerOptimizer.bundles.set('immediate-bundle', {
                name: 'immediate-bundle.js',
                modules: ['critical.js'],
                loadStrategy: 'immediate'
            });

            jsBundlerOptimizer.bundles.set('defer-bundle', {
                name: 'defer-bundle.js',
                modules: ['main.js'],
                loadStrategy: 'defer'
            });

            jsBundlerOptimizer.bundles.set('lazy-bundle', {
                name: 'lazy-bundle.js',
                modules: ['lazy.js'],
                loadStrategy: 'lazy'
            });

            jsBundlerOptimizer.bundles.set('prefetch-bundle', {
                name: 'prefetch-bundle.js',
                modules: ['prefetch.js'],
                loadStrategy: 'prefetch'
            });

            mockFetch.mockResolvedValue({
                text: () => Promise.resolve('// Test code')
            });
        });

        test('should load immediate bundles immediately', () => {
            const loadBundleSpy = jest.spyOn(jsBundlerOptimizer, 'loadBundle');

            jsBundlerOptimizer.loadImmediateBundles();

            expect(loadBundleSpy).toHaveBeenCalledWith('immediate-bundle');
            expect(loadBundleSpy).not.toHaveBeenCalledWith('defer-bundle');
            expect(loadBundleSpy).not.toHaveBeenCalledWith('lazy-bundle');
        });

        test('should setup deferred loading on DOMContentLoaded', (done) => {
            const loadBundleSpy = jest.spyOn(jsBundlerOptimizer, 'loadBundle');

            jsBundlerOptimizer.setupDeferredLoading();

            // Simulate DOMContentLoaded
            const event = new Event('DOMContentLoaded');
            document.dispatchEvent(event);

            setTimeout(() => {
                expect(loadBundleSpy).toHaveBeenCalledWith('defer-bundle');
                done();
            }, 150);
        });

        test('should setup lazy loading with event listeners', () => {
            const loadBundleSpy = jest.spyOn(jsBundlerOptimizer, 'loadBundle');

            jsBundlerOptimizer.setupLazyLoading();

            // Simulate scroll event
            const scrollEvent = new Event('scroll');
            document.dispatchEvent(scrollEvent);

            expect(loadBundleSpy).toHaveBeenCalledWith('lazy-bundle');
        });

        test('should create prefetch links', () => {
            jsBundlerOptimizer.setupPrefetching();

            const prefetchLink = document.querySelector('link[rel="prefetch"]');
            expect(prefetchLink).toBeTruthy();
            expect(prefetchLink.href).toContain('prefetch-bundle.js');
        });
    });

    describe('Bundle Manifest', () => {
        beforeEach(() => {
            jsBundlerOptimizer.bundles.set('test-bundle', {
                name: 'test-bundle.js',
                modules: ['module1.js', 'module2.js'],
                priority: 80,
                size: 5000,
                loadStrategy: 'defer'
            });

            jsBundlerOptimizer.moduleRegistry.set('module1.js', {
                dependencies: ['utils']
            });

            jsBundlerOptimizer.moduleRegistry.set('module2.js', {
                dependencies: ['components', 'utils']
            });
        });

        test('should generate bundle manifest', () => {
            const manifest = jsBundlerOptimizer.generateBundleManifest();

            expect(manifest).toHaveProperty('version');
            expect(manifest).toHaveProperty('timestamp');
            expect(manifest).toHaveProperty('bundles');
            expect(manifest).toHaveProperty('optimization');
            expect(manifest).toHaveProperty('strategy');

            expect(manifest.bundles).toHaveProperty('test-bundle');
            expect(manifest.bundles['test-bundle']).toHaveProperty('hash');
            expect(manifest.bundles['test-bundle']).toHaveProperty('dependencies');
        });

        test('should generate consistent hash for same modules', () => {
            const hash1 = jsBundlerOptimizer.generateBundleHash({
                modules: ['a.js', 'b.js']
            });

            const hash2 = jsBundlerOptimizer.generateBundleHash({
                modules: ['a.js', 'b.js']
            });

            expect(hash1).toBe(hash2);
        });

        test('should generate different hash for different modules', () => {
            const hash1 = jsBundlerOptimizer.generateBundleHash({
                modules: ['a.js', 'b.js']
            });

            const hash2 = jsBundlerOptimizer.generateBundleHash({
                modules: ['a.js', 'c.js']
            });

            expect(hash1).not.toBe(hash2);
        });

        test('should resolve bundle dependencies', () => {
            const manifest = jsBundlerOptimizer.generateBundleManifest();
            const dependencies = manifest.bundles['test-bundle'].dependencies;

            expect(dependencies).toContain('utils');
            expect(dependencies).toContain('components');
            expect(dependencies.length).toBe(2); // Deduplicated
        });
    });

    describe('Function Inlining Optimization', () => {
        const codeWithSmallFunctions = `
            function add(a, b) { return a + b; }
            function multiply(x, y) { return x * y; }
            function veryLongFunctionNameThatShouldNotBeInlinedBecauseItsTooLong(a, b, c, d, e, f) {
                return a + b + c + d + e + f;
            }

            var result1 = add(5, 3);
            var result2 = multiply(4, 2);
            var result3 = veryLongFunctionNameThatShouldNotBeInlinedBecauseItsTooLong(1, 2, 3, 4, 5, 6);
        `;

        test('should inline small functions', () => {
            const optimized = jsBundlerOptimizer.inlineSmallFunctions(codeWithSmallFunctions);

            expect(optimized).toContain('var result1 = (a + b);');
            expect(optimized).toContain('var result2 = (x * y);');
            expect(optimized).not.toContain('function add(a, b)');
            expect(optimized).not.toContain('function multiply(x, y)');
        });

        test('should not inline large functions', () => {
            const optimized = jsBundlerOptimizer.inlineSmallFunctions(codeWithSmallFunctions);

            expect(optimized).toContain('function veryLongFunctionNameThatShouldNotBeInlinedBecauseItsTooLong');
            expect(optimized).toContain('veryLongFunctionNameThatShouldNotBeInlinedBecauseItsTooLong(1, 2, 3, 4, 5, 6)');
        });
    });

    describe('Public API', () => {
        test('should return optimization stats', () => {
            jsBundlerOptimizer.optimizationStats = {
                originalSize: 10000,
                optimizedSize: 7000,
                compressionRatio: 30,
                modulesProcessed: 5,
                optimizationsApplied: ['minification', 'dead-code-removal']
            };

            const stats = jsBundlerOptimizer.getOptimizationStats();

            expect(stats.originalSize).toBe(10000);
            expect(stats.optimizedSize).toBe(7000);
            expect(stats.compressionRatio).toBe(30);
            expect(stats.modulesProcessed).toBe(5);
            expect(stats.optimizationsApplied).toContain('minification');
        });

        test('should return bundle manifest', () => {
            jsBundlerOptimizer.generateBundleManifest();
            const manifest = jsBundlerOptimizer.getBundleManifest();

            expect(manifest).toHaveProperty('version');
            expect(manifest).toHaveProperty('bundles');
        });

        test('should return loaded bundles', () => {
            // Create a mock loaded bundle script
            const script = document.createElement('script');
            script.dataset.bundle = 'test-bundle.js';
            script.dataset.loadStrategy = 'immediate';
            script.textContent = 'console.log("test");';
            document.head.appendChild(script);

            const loadedBundles = jsBundlerOptimizer.getLoadedBundles();

            expect(loadedBundles).toHaveLength(1);
            expect(loadedBundles[0]).toEqual({
                name: 'test-bundle.js',
                strategy: 'immediate',
                size: 19 // Length of script content
            });
        });
    });

    describe('Error Handling', () => {
        test('should handle invalid URLs gracefully', () => {
            const invalidScript = document.createElement('script');
            invalidScript.src = 'not-a-valid-url';
            document.head.appendChild(invalidScript);

            expect(() => {
                jsBundlerOptimizer.detectExistingModules();
            }).not.toThrow();
        });

        test('should handle missing bundles gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            try {
                await jsBundlerOptimizer.loadBundle('non-existent-bundle');
            } catch (error) {
                expect(error.message).toContain('Bundle \'non-existent-bundle\' not found');
            }

            consoleSpy.mockRestore();
        });

        test('should handle script execution errors', () => {
            const bundle = {
                name: 'error-bundle.js',
                modules: ['error.js'],
                loadStrategy: 'immediate'
            };

            const invalidCode = 'invalid javascript syntax {{{';

            expect(() => {
                jsBundlerOptimizer.executeBundle(invalidCode, bundle);
            }).toThrow();
        });
    });

    describe('Cleanup', () => {
        test('should clear all data structures on destroy', () => {
            jsBundlerOptimizer.bundles.set('test', {});
            jsBundlerOptimizer.moduleRegistry.set('test', {});
            jsBundlerOptimizer.dependencies.set('test', []);

            jsBundlerOptimizer.destroy();

            expect(jsBundlerOptimizer.bundles.size).toBe(0);
            expect(jsBundlerOptimizer.moduleRegistry.size).toBe(0);
            expect(jsBundlerOptimizer.dependencies.size).toBe(0);
        });
    });

    describe('Route-based Bundling', () => {
        test('should infer routes from module names correctly', () => {
            expect(jsBundlerOptimizer.inferRouteFromModule('pricing-calculator.js')).toBe('pricing');
            expect(jsBundlerOptimizer.inferRouteFromModule('service-animations.js')).toBe('services');
            expect(jsBundlerOptimizer.inferRouteFromModule('portfolio-gallery.js')).toBe('portfolio');
            expect(jsBundlerOptimizer.inferRouteFromModule('contact-form.js')).toBe('contact');
            expect(jsBundlerOptimizer.inferRouteFromModule('about-team.js')).toBe('about');
            expect(jsBundlerOptimizer.inferRouteFromModule('main-navigation.js')).toBe('home');
        });

        test('should calculate route priorities correctly', () => {
            expect(jsBundlerOptimizer.calculateRoutePriority('home')).toBe(100);
            expect(jsBundlerOptimizer.calculateRoutePriority('services')).toBe(80);
            expect(jsBundlerOptimizer.calculateRoutePriority('pricing')).toBe(70);
            expect(jsBundlerOptimizer.calculateRoutePriority('contact')).toBe(60);
            expect(jsBundlerOptimizer.calculateRoutePriority('portfolio')).toBe(50);
            expect(jsBundlerOptimizer.calculateRoutePriority('about')).toBe(40);
            expect(jsBundlerOptimizer.calculateRoutePriority('unknown')).toBe(30);
        });
    });
});