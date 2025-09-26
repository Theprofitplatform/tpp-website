/**
 * The Profit Platform - Resource Bundler & Code Splitting Optimizer
 * Advanced JavaScript bundling, code splitting, and dynamic loading
 */

class ResourceBundlerOptimizer {
    constructor(options = {}) {
        this.options = {
            // Code splitting
            enableCodeSplitting: true,
            chunkSizeLimit: 250000, // 250KB chunks
            dynamicImportThreshold: 50000, // 50KB threshold for dynamic imports

            // Bundle optimization
            bundleCompression: true,
            deadCodeElimination: true,
            treeShaking: true,

            // Loading strategies
            preloadCritical: true,
            lazyLoadNonCritical: true,
            prefetchNextPage: true,

            // Caching strategies
            bundleVersioning: true,
            longTermCaching: true,
            serviceWorkerCache: true,

            // Performance monitoring
            loadTimeTracking: true,
            bundleAnalytics: true,
            errorTracking: true,

            ...options
        };

        this.bundles = new Map();
        this.loadedChunks = new Set();
        this.loadingChunks = new Map();
        this.dependencies = new Map();

        this.stats = {
            totalBundles: 0,
            totalSize: 0,
            compressedSize: 0,
            loadTime: 0,
            cacheHits: 0,
            errorCount: 0
        };

        this.criticalFeatures = new Set([
            'navigation',
            'hero',
            'header',
            'footer',
            'critical-ui'
        ]);

        this.init();
    }

    async init() {
        console.log('📦 Initializing Resource Bundler Optimizer...');

        // Analyze current resources
        await this.analyzeCurrentResources();

        // Implement code splitting
        if (this.options.enableCodeSplitting) {
            await this.implementCodeSplitting();
        }

        // Set up dynamic loading system
        this.setupDynamicLoading();

        // Optimize existing bundles
        await this.optimizeExistingBundles();

        // Set up performance monitoring
        this.setupPerformanceMonitoring();

        console.log('✅ Resource Bundler Optimizer initialized');
        this.generateBundleReport();
    }

    // ================================
    // RESOURCE ANALYSIS
    // ================================

    async analyzeCurrentResources() {
        console.log('🔍 Analyzing current resources...');

        const scripts = document.querySelectorAll('script[src]');
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');

        // Analyze JavaScript files
        for (const script of scripts) {
            await this.analyzeJavaScriptFile(script);
        }

        // Analyze CSS files
        for (const stylesheet of stylesheets) {
            await this.analyzeCSSFile(stylesheet);
        }

        console.log(`📊 Analyzed ${scripts.length} JS files and ${stylesheets.length} CSS files`);
    }

    async analyzeJavaScriptFile(script) {
        const url = script.src;
        if (!url) return;

        try {
            const response = await fetch(url);
            const content = await response.text();
            const size = content.length;

            const analysis = {
                url,
                size,
                content,
                type: 'javascript',
                critical: this.isCriticalResource(url),
                dependencies: this.extractDependencies(content),
                features: this.extractFeatures(content),
                loadPriority: this.calculateLoadPriority(url, content)
            };

            this.bundles.set(url, analysis);
            this.stats.totalSize += size;

        } catch (error) {
            console.warn('Failed to analyze JS file:', url, error);
        }
    }

    async analyzeCSSFile(stylesheet) {
        const url = stylesheet.href;
        if (!url) return;

        try {
            const response = await fetch(url);
            const content = await response.text();
            const size = content.length;

            const analysis = {
                url,
                size,
                content,
                type: 'css',
                critical: this.isCriticalResource(url),
                selectors: this.extractCSSSelectors(content),
                mediaQueries: this.extractMediaQueries(content),
                loadPriority: this.calculateLoadPriority(url, content)
            };

            this.bundles.set(url, analysis);
            this.stats.totalSize += size;

        } catch (error) {
            console.warn('Failed to analyze CSS file:', url, error);
        }
    }

    isCriticalResource(url) {
        return this.criticalFeatures.some(feature =>
            url.includes(feature) || url.includes('critical')
        );
    }

    extractDependencies(content) {
        const dependencies = new Set();

        // Extract import statements
        const importPattern = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
        let match;

        while ((match = importPattern.exec(content)) !== null) {
            dependencies.add(match[1]);
        }

        // Extract require statements
        const requirePattern = /require\(['"`]([^'"`]+)['"`]\)/g;
        while ((match = requirePattern.exec(content)) !== null) {
            dependencies.add(match[1]);
        }

        return Array.from(dependencies);
    }

    extractFeatures(content) {
        const features = new Set();

        // Common feature patterns
        const featurePatterns = [
            { pattern: /modal|Modal/g, feature: 'modal' },
            { pattern: /carousel|Carousel|slider|Slider/g, feature: 'carousel' },
            { pattern: /tab|Tab/g, feature: 'tabs' },
            { pattern: /accordion|Accordion/g, feature: 'accordion' },
            { pattern: /dropdown|Dropdown/g, feature: 'dropdown' },
            { pattern: /tooltip|Tooltip/g, feature: 'tooltip' },
            { pattern: /gallery|Gallery/g, feature: 'gallery' },
            { pattern: /chart|Chart|graph/g, feature: 'charts' },
            { pattern: /map|Map|location/g, feature: 'maps' },
            { pattern: /video|Video|player/g, feature: 'video' }
        ];

        featurePatterns.forEach(({ pattern, feature }) => {
            if (pattern.test(content)) {
                features.add(feature);
            }
        });

        return Array.from(features);
    }

    extractCSSSelectors(content) {
        const selectorPattern = /([^{]+)\{[^}]*\}/g;
        const selectors = [];
        let match;

        while ((match = selectorPattern.exec(content)) !== null) {
            selectors.push(match[1].trim());
        }

        return selectors;
    }

    extractMediaQueries(content) {
        const mediaPattern = /@media\s*([^{]+)\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
        const mediaQueries = [];
        let match;

        while ((match = mediaPattern.exec(content)) !== null) {
            mediaQueries.push(match[1].trim());
        }

        return mediaQueries;
    }

    calculateLoadPriority(url, content) {
        let priority = 0;

        // Critical resources get highest priority
        if (this.isCriticalResource(url)) priority += 100;

        // Above-fold functionality
        if (content.includes('hero') || content.includes('header')) priority += 80;

        // Navigation and layout
        if (content.includes('nav') || content.includes('menu')) priority += 70;

        // Interactive elements
        if (content.includes('click') || content.includes('addEventListener')) priority += 50;

        // Utilities and helpers
        if (url.includes('util') || url.includes('helper')) priority += 30;

        return priority;
    }

    // ================================
    // CODE SPLITTING IMPLEMENTATION
    // ================================

    async implementCodeSplitting() {
        console.log('✂️ Implementing code splitting...');

        const bundleGroups = this.createBundleGroups();

        for (const [groupName, bundles] of bundleGroups) {
            await this.createCodeSplitBundle(groupName, bundles);
        }
    }

    createBundleGroups() {
        const groups = new Map();

        // Group by features and load priority
        this.bundles.forEach((bundle, url) => {
            let groupName = 'main';

            if (bundle.critical) {
                groupName = 'critical';
            } else if (bundle.features.length > 0) {
                groupName = bundle.features[0]; // Primary feature
            } else if (bundle.loadPriority < 50) {
                groupName = 'deferred';
            }

            if (!groups.has(groupName)) {
                groups.set(groupName, []);
            }

            groups.get(groupName).push(bundle);
        });

        return groups;
    }

    async createCodeSplitBundle(groupName, bundles) {
        if (bundles.length === 0) return;

        const totalSize = bundles.reduce((sum, bundle) => sum + bundle.size, 0);

        // Only split if bundle exceeds threshold
        if (totalSize < this.options.chunkSizeLimit) return;

        console.log(`📦 Creating code split bundle for ${groupName} (${bundles.length} files, ${totalSize} bytes)`);

        // Combine and optimize bundle content
        const combinedContent = this.combineJavaScript(bundles);
        const optimizedContent = this.optimizeJavaScript(combinedContent);

        // Create blob URL for the bundle
        const blob = new Blob([optimizedContent], { type: 'application/javascript' });
        const bundleUrl = URL.createObjectURL(blob);

        // Register the bundle
        this.registerBundle(groupName, {
            url: bundleUrl,
            size: optimizedContent.length,
            originalSize: totalSize,
            bundles: bundles.map(b => b.url),
            critical: bundles.some(b => b.critical),
            features: [...new Set(bundles.flatMap(b => b.features))]
        });

        // Remove original script tags for non-critical bundles
        if (groupName !== 'critical') {
            bundles.forEach(bundle => {
                const script = document.querySelector(`script[src="${bundle.url}"]`);
                if (script) {
                    script.remove();
                }
            });
        }

        this.stats.totalBundles++;
        this.stats.compressedSize += optimizedContent.length;
    }

    combineJavaScript(bundles) {
        const jsContent = bundles
            .filter(bundle => bundle.type === 'javascript')
            .map(bundle => `\n/* ${bundle.url} */\n${bundle.content}`)
            .join('\n');

        return this.wrapInIIFE(jsContent);
    }

    wrapInIIFE(content) {
        return `
(function() {
    'use strict';

    ${content}

})();
`;
    }

    optimizeJavaScript(content) {
        let optimized = content;

        if (this.options.deadCodeElimination) {
            optimized = this.removeDeadCode(optimized);
        }

        if (this.options.bundleCompression) {
            optimized = this.minifyJavaScript(optimized);
        }

        return optimized;
    }

    removeDeadCode(content) {
        // Simple dead code elimination
        return content
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
            .replace(/\/\/.*$/gm, '') // Remove line comments
            .replace(/console\.log\([^)]*\);?/g, '') // Remove console.logs
            .replace(/debugger;?/g, ''); // Remove debugger statements
    }

    minifyJavaScript(content) {
        // Basic minification
        return content
            .replace(/\s+/g, ' ') // Collapse whitespace
            .replace(/;\s*}/g, '}') // Remove unnecessary semicolons
            .replace(/\s*{\s*/g, '{') // Remove spaces around braces
            .replace(/\s*}\s*/g, '}')
            .replace(/\s*;\s*/g, ';') // Clean up semicolons
            .trim();
    }

    registerBundle(name, bundle) {
        this.bundles.set(name, bundle);

        // Create loading function
        window[`load${this.toPascalCase(name)}Bundle`] = () => {
            return this.loadBundle(name);
        };

        console.log(`📦 Registered bundle: ${name}`);
    }

    toPascalCase(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ================================
    // DYNAMIC LOADING SYSTEM
    // ================================

    setupDynamicLoading() {
        console.log('🔄 Setting up dynamic loading system...');

        // Create global loader
        window.loadFeature = (featureName) => {
            return this.loadFeatureBundle(featureName);
        };

        // Set up intersection observers for feature loading
        this.setupFeatureObservers();

        // Set up route-based loading
        this.setupRouteBasedLoading();

        // Set up interaction-based loading
        this.setupInteractionBasedLoading();
    }

    async loadFeatureBundle(featureName) {
        if (this.loadedChunks.has(featureName)) {
            return Promise.resolve();
        }

        if (this.loadingChunks.has(featureName)) {
            return this.loadingChunks.get(featureName);
        }

        const loadPromise = this.loadBundle(featureName);
        this.loadingChunks.set(featureName, loadPromise);

        try {
            await loadPromise;
            this.loadedChunks.add(featureName);
            this.loadingChunks.delete(featureName);
            console.log(`✅ Loaded feature bundle: ${featureName}`);
        } catch (error) {
            this.loadingChunks.delete(featureName);
            console.error(`❌ Failed to load feature bundle: ${featureName}`, error);
            throw error;
        }

        return loadPromise;
    }

    async loadBundle(bundleName) {
        const bundle = this.bundles.get(bundleName);
        if (!bundle) {
            throw new Error(`Bundle not found: ${bundleName}`);
        }

        const startTime = performance.now();

        // Load the script
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = bundle.url;
            script.async = true;

            script.onload = () => {
                const loadTime = performance.now() - startTime;
                this.stats.loadTime += loadTime;

                // Track analytics
                if (typeof gtag === 'function') {
                    gtag('event', 'bundle_loaded', {
                        event_category: 'Performance',
                        event_label: bundleName,
                        value: Math.round(loadTime)
                    });
                }

                resolve();
            };

            script.onerror = () => {
                this.stats.errorCount++;
                reject(new Error(`Failed to load bundle: ${bundleName}`));
            };

            document.head.appendChild(script);
        });
    }

    setupFeatureObservers() {
        if (!('IntersectionObserver' in window)) return;

        const featureElements = {
            '[data-feature="modal"]': 'modal',
            '[data-feature="carousel"]': 'carousel',
            '[data-feature="tabs"]': 'tabs',
            '[data-feature="accordion"]': 'accordion',
            '[data-feature="gallery"]': 'gallery',
            '[data-feature="charts"]': 'charts'
        };

        Object.entries(featureElements).forEach(([selector, feature]) => {
            const elements = document.querySelectorAll(selector);

            if (elements.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadFeatureBundle(feature);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '100px 0px',
                threshold: 0.01
            });

            elements.forEach(el => observer.observe(el));
        });
    }

    setupRouteBasedLoading() {
        // Load bundles based on current page
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index';

        const routeMap = {
            'pricing': ['pricing', 'calculator'],
            'services': ['services', 'accordion'],
            'portfolio': ['gallery', 'modal'],
            'contact': ['maps', 'form-validation']
        };

        if (routeMap[page]) {
            routeMap[page].forEach(feature => {
                this.loadFeatureBundle(feature);
            });
        }
    }

    setupInteractionBasedLoading() {
        // Load features on first user interaction
        const interactionEvents = ['mousedown', 'touchstart', 'keydown'];
        let hasInteracted = false;

        const handleInteraction = () => {
            if (hasInteracted) return;
            hasInteracted = true;

            // Load deferred bundle on first interaction
            this.loadFeatureBundle('deferred');

            // Remove listeners
            interactionEvents.forEach(event => {
                document.removeEventListener(event, handleInteraction, { passive: true });
            });
        };

        interactionEvents.forEach(event => {
            document.addEventListener(event, handleInteraction, { passive: true });
        });
    }

    // ================================
    // BUNDLE OPTIMIZATION
    // ================================

    async optimizeExistingBundles() {
        console.log('⚡ Optimizing existing bundles...');

        // Preload critical bundles
        if (this.options.preloadCritical) {
            await this.preloadCriticalBundles();
        }

        // Set up prefetching for likely next bundles
        if (this.options.prefetchNextPage) {
            this.prefetchNextPageBundles();
        }

        // Implement bundle versioning
        if (this.options.bundleVersioning) {
            this.implementBundleVersioning();
        }
    }

    async preloadCriticalBundles() {
        const criticalBundles = Array.from(this.bundles.values())
            .filter(bundle => bundle.critical);

        console.log(`⚡ Preloading ${criticalBundles.length} critical bundles...`);

        criticalBundles.forEach(bundle => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'script';
            link.href = bundle.url;
            document.head.appendChild(link);
        });
    }

    prefetchNextPageBundles() {
        // Identify likely next page bundles based on navigation
        const navLinks = document.querySelectorAll('nav a, .nav a, .navigation a');
        const prefetchMap = {
            '/pricing': ['pricing', 'calculator'],
            '/services': ['services', 'accordion'],
            '/portfolio': ['gallery', 'modal'],
            '/contact': ['maps', 'form-validation']
        };

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (prefetchMap[href]) {
                // Prefetch on hover
                link.addEventListener('mouseenter', () => {
                    prefetchMap[href].forEach(feature => {
                        if (this.bundles.has(feature)) {
                            const bundle = this.bundles.get(feature);
                            const prefetchLink = document.createElement('link');
                            prefetchLink.rel = 'prefetch';
                            prefetchLink.as = 'script';
                            prefetchLink.href = bundle.url;
                            document.head.appendChild(prefetchLink);
                        }
                    });
                }, { once: true });
            }
        });
    }

    implementBundleVersioning() {
        // Add version parameter to bundle URLs
        const version = Date.now().toString(36);

        this.bundles.forEach((bundle, name) => {
            if (bundle.url && !bundle.url.includes('?v=')) {
                bundle.url += `?v=${version}`;
                this.bundles.set(name, bundle);
            }
        });

        console.log(`🏷️ Applied version ${version} to all bundles`);
    }

    // ================================
    // PERFORMANCE MONITORING
    // ================================

    setupPerformanceMonitoring() {
        if (!this.options.loadTimeTracking) return;

        console.log('📊 Setting up bundle performance monitoring...');

        // Monitor bundle loading times
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();

                entries.forEach(entry => {
                    if (entry.initiatorType === 'script') {
                        this.trackBundlePerformance(entry);
                    }
                });
            });

            observer.observe({ entryTypes: ['resource'] });
        }

        // Set up periodic reporting
        setInterval(() => {
            this.reportBundleMetrics();
        }, 30000); // Every 30 seconds
    }

    trackBundlePerformance(entry) {
        const bundleName = this.findBundleByUrl(entry.name);
        if (!bundleName) return;

        const metrics = {
            name: bundleName,
            loadTime: entry.duration,
            size: entry.transferSize,
            cached: entry.transferSize === 0 && entry.decodedBodySize > 0
        };

        if (metrics.cached) {
            this.stats.cacheHits++;
        }

        // Report to analytics
        if (this.options.bundleAnalytics && typeof gtag === 'function') {
            gtag('event', 'bundle_performance', {
                event_category: 'Performance',
                custom_parameters: {
                    bundle_name: bundleName,
                    load_time: Math.round(metrics.loadTime),
                    cached: metrics.cached
                }
            });
        }
    }

    findBundleByUrl(url) {
        for (const [name, bundle] of this.bundles.entries()) {
            if (bundle.url === url || url.includes(bundle.url)) {
                return name;
            }
        }
        return null;
    }

    reportBundleMetrics() {
        const report = {
            timestamp: Date.now(),
            totalBundles: this.stats.totalBundles,
            totalSize: this.stats.totalSize,
            compressedSize: this.stats.compressedSize,
            compressionRatio: ((this.stats.totalSize - this.stats.compressedSize) / this.stats.totalSize * 100).toFixed(1),
            averageLoadTime: this.stats.loadTime / Math.max(this.stats.totalBundles, 1),
            cacheHitRate: (this.stats.cacheHits / Math.max(this.stats.totalBundles, 1) * 100).toFixed(1),
            errorRate: (this.stats.errorCount / Math.max(this.stats.totalBundles, 1) * 100).toFixed(1)
        };

        console.log('📊 Bundle Performance Report:', report);

        // Custom event for monitoring tools
        window.dispatchEvent(new CustomEvent('bundleMetrics', {
            detail: report
        }));
    }

    // ================================
    // PUBLIC API
    // ================================

    generateBundleReport() {
        const report = {
            timestamp: Date.now(),
            bundles: Array.from(this.bundles.entries()).map(([name, bundle]) => ({
                name,
                size: bundle.size,
                critical: bundle.critical,
                features: bundle.features || [],
                loaded: this.loadedChunks.has(name)
            })),
            stats: { ...this.stats },
            optimization: {
                compressionRatio: ((this.stats.totalSize - this.stats.compressedSize) / this.stats.totalSize * 100).toFixed(1) + '%',
                bundleCount: this.stats.totalBundles,
                averageLoadTime: Math.round(this.stats.loadTime / Math.max(this.stats.totalBundles, 1)) + 'ms'
            }
        };

        console.log('📋 Bundle Optimization Report:', report);
        return report;
    }

    getBundleStats() {
        return { ...this.stats };
    }

    getLoadedBundles() {
        return Array.from(this.loadedChunks);
    }

    // ================================
    // CLEANUP
    // ================================

    destroy() {
        console.log('🧹 Cleaning up Resource Bundler Optimizer...');

        // Revoke blob URLs
        this.bundles.forEach(bundle => {
            if (bundle.url && bundle.url.startsWith('blob:')) {
                URL.revokeObjectURL(bundle.url);
            }
        });

        // Clear maps
        this.bundles.clear();
        this.loadedChunks.clear();
        this.loadingChunks.clear();
        this.dependencies.clear();
    }
}

// Initialize the Resource Bundler Optimizer
const bundlerOptimizer = new ResourceBundlerOptimizer({
    enableCodeSplitting: true,
    bundleCompression: true,
    preloadCritical: true,
    lazyLoadNonCritical: true,
    loadTimeTracking: true,
    bundleAnalytics: true
});

// Export for global use
window.ResourceBundlerOptimizer = ResourceBundlerOptimizer;
window.bundlerOptimizer = bundlerOptimizer;

// Helper functions for manual bundle management
window.loadBundle = (name) => bundlerOptimizer.loadFeatureBundle(name);
window.getBundleReport = () => bundlerOptimizer.generateBundleReport();

console.log('📦 Resource Bundler Optimizer initialized');