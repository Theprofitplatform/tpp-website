/**
 * The Profit Platform - JavaScript Bundler and Optimizer
 * Advanced JavaScript bundling, minification, and optimization
 */

class JSBundlerOptimizer {
    constructor(options = {}) {
        this.options = {
            minify: true,
            sourceMaps: false,
            treeshaking: true,
            compressionLevel: 'high',
            targetEnvironment: 'modern',
            bundleStrategy: 'split', // 'single', 'split', 'dynamic'
            ...options
        };

        this.bundles = new Map();
        this.dependencies = new Map();
        this.moduleRegistry = new Map();
        this.optimizationStats = {
            originalSize: 0,
            optimizedSize: 0,
            compressionRatio: 0,
            modulesProcessed: 0,
            optimizationsApplied: []
        };

        this.init();
    }

    init() {
        this.setupModuleLoader();
        this.detectExistingModules();
        this.createOptimizedBundles();
    }

    // ================================
    // MODULE DETECTION & ANALYSIS
    // ================================

    detectExistingModules() {
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const modules = new Map();

        scripts.forEach(script => {
            const src = script.src;
            const filename = src.split('/').pop();

            if (this.isOptimizableModule(filename)) {
                modules.set(filename, {
                    url: src,
                    element: script,
                    size: this.estimateFileSize(script),
                    priority: this.calculateModulePriority(script),
                    dependencies: this.extractDependencies(script)
                });
            }
        });

        this.moduleRegistry = modules;
        return modules;
    }

    isOptimizableModule(filename) {
        const excludePatterns = [
            /gtag|analytics|tracking/i,
            /jquery|lodash|react|vue/i, // Large libraries
            /\.min\./i, // Already minified
            /cdn\.|external\./i // External CDN files
        ];

        return !excludePatterns.some(pattern => pattern.test(filename));
    }

    estimateFileSize(scriptElement) {
        // Try to get actual size from resource timing
        const resourceEntry = performance.getEntriesByName(scriptElement.src)[0];
        if (resourceEntry) {
            return resourceEntry.transferSize || resourceEntry.decodedBodySize || 0;
        }

        // Estimate based on common patterns
        const filename = scriptElement.src.split('/').pop().toLowerCase();
        if (filename.includes('consolidated')) return 50000;
        if (filename.includes('pricing')) return 30000;
        if (filename.includes('navigation')) return 20000;
        if (filename.includes('component')) return 15000;

        return 10000; // Default estimate
    }

    calculateModulePriority(scriptElement) {
        let priority = 0;

        // Critical modules get higher priority
        if (scriptElement.hasAttribute('data-critical') ||
            scriptElement.src.includes('critical') ||
            scriptElement.src.includes('navigation')) {
            priority += 100;
        }

        // Above-fold modules
        if (this.isAboveFoldModule(scriptElement)) {
            priority += 50;
        }

        // Frequently used modules
        if (this.isFrequentlyUsedModule(scriptElement)) {
            priority += 30;
        }

        // Size penalty (smaller files get higher priority for bundling)
        const size = this.estimateFileSize(scriptElement);
        if (size < 5000) priority += 20;
        else if (size < 15000) priority += 10;

        return priority;
    }

    extractDependencies(scriptElement) {
        const dependencies = [];
        const src = scriptElement.src;

        // Common dependency patterns
        if (src.includes('navigation')) {
            dependencies.push('mobile-nav', 'dropdown');
        }
        if (src.includes('pricing')) {
            dependencies.push('components', 'animations');
        }
        if (src.includes('service')) {
            dependencies.push('components', 'animations');
        }

        return dependencies;
    }

    isAboveFoldModule(scriptElement) {
        return scriptElement.src.includes('navigation') ||
               scriptElement.src.includes('hero') ||
               scriptElement.src.includes('critical');
    }

    isFrequentlyUsedModule(scriptElement) {
        const commonModules = ['navigation', 'components', 'utilities'];
        return commonModules.some(module => scriptElement.src.includes(module));
    }

    // ================================
    // BUNDLING STRATEGIES
    // ================================

    createOptimizedBundles() {
        const modules = Array.from(this.moduleRegistry.entries());

        if (this.options.bundleStrategy === 'single') {
            this.createSingleBundle(modules);
        } else if (this.options.bundleStrategy === 'split') {
            this.createSplitBundles(modules);
        } else if (this.options.bundleStrategy === 'dynamic') {
            this.createDynamicBundles(modules);
        }

        this.generateBundleManifest();
    }

    createSingleBundle(modules) {
        const bundle = {
            name: 'app-bundle.js',
            modules: modules.map(([name, info]) => name),
            priority: 100,
            size: modules.reduce((total, [, info]) => total + info.size, 0),
            loadStrategy: 'immediate'
        };

        this.bundles.set('app-bundle', bundle);
    }

    createSplitBundles(modules) {
        // Critical bundle - immediate load
        const criticalModules = modules.filter(([, info]) => info.priority >= 100);
        if (criticalModules.length > 0) {
            this.bundles.set('critical-bundle', {
                name: 'critical-bundle.js',
                modules: criticalModules.map(([name]) => name),
                priority: 100,
                size: criticalModules.reduce((total, [, info]) => total + info.size, 0),
                loadStrategy: 'immediate'
            });
        }

        // Main bundle - defer load
        const mainModules = modules.filter(([, info]) => info.priority >= 30 && info.priority < 100);
        if (mainModules.length > 0) {
            this.bundles.set('main-bundle', {
                name: 'main-bundle.js',
                modules: mainModules.map(([name]) => name),
                priority: 50,
                size: mainModules.reduce((total, [, info]) => total + info.size, 0),
                loadStrategy: 'defer'
            });
        }

        // Lazy bundle - lazy load
        const lazyModules = modules.filter(([, info]) => info.priority < 30);
        if (lazyModules.length > 0) {
            this.bundles.set('lazy-bundle', {
                name: 'lazy-bundle.js',
                modules: lazyModules.map(([name]) => name),
                priority: 10,
                size: lazyModules.reduce((total, [, info]) => total + info.size, 0),
                loadStrategy: 'lazy'
            });
        }
    }

    createDynamicBundles(modules) {
        // Route-based bundling
        const routeBundles = new Map();

        modules.forEach(([name, info]) => {
            const route = this.inferRouteFromModule(name);

            if (!routeBundles.has(route)) {
                routeBundles.set(route, []);
            }

            routeBundles.get(route).push([name, info]);
        });

        routeBundles.forEach((routeModules, route) => {
            this.bundles.set(`${route}-bundle`, {
                name: `${route}-bundle.js`,
                modules: routeModules.map(([name]) => name),
                priority: this.calculateRoutePriority(route),
                size: routeModules.reduce((total, [, info]) => total + info.size, 0),
                loadStrategy: route === 'home' ? 'immediate' : 'prefetch',
                route: route
            });
        });
    }

    inferRouteFromModule(moduleName) {
        if (moduleName.includes('pricing')) return 'pricing';
        if (moduleName.includes('service')) return 'services';
        if (moduleName.includes('portfolio')) return 'portfolio';
        if (moduleName.includes('contact')) return 'contact';
        if (moduleName.includes('about')) return 'about';

        return 'home'; // Default
    }

    calculateRoutePriority(route) {
        const routePriorities = {
            'home': 100,
            'services': 80,
            'pricing': 70,
            'portfolio': 50,
            'about': 40,
            'contact': 60
        };

        return routePriorities[route] || 30;
    }

    // ================================
    // OPTIMIZATION TECHNIQUES
    // ================================

    optimizeBundle(bundleCode) {
        let optimizedCode = bundleCode;
        const originalSize = bundleCode.length;

        // Apply optimizations
        optimizedCode = this.removeDeadCode(optimizedCode);
        optimizedCode = this.optimizeLoops(optimizedCode);
        optimizedCode = this.inlineSmallFunctions(optimizedCode);
        optimizedCode = this.optimizeStringOperations(optimizedCode);
        optimizedCode = this.optimizeDOMOperations(optimizedCode);
        optimizedCode = this.minifyCode(optimizedCode);

        const optimizedSize = optimizedCode.length;
        const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;

        this.optimizationStats.originalSize += originalSize;
        this.optimizationStats.optimizedSize += optimizedSize;
        this.optimizationStats.compressionRatio =
            ((this.optimizationStats.originalSize - this.optimizationStats.optimizedSize) /
             this.optimizationStats.originalSize) * 100;

        return optimizedCode;
    }

    removeDeadCode(code) {
        // Remove unused variables and functions
        let optimizedCode = code;

        // Remove debug code
        optimizedCode = optimizedCode.replace(/console\.(log|debug|info)\([^;]*\);?\s*/g, '');

        // Remove comments
        optimizedCode = optimizedCode.replace(/\/\*[\s\S]*?\*\//g, '');
        optimizedCode = optimizedCode.replace(/\/\/.*$/gm, '');

        // Remove empty functions
        optimizedCode = optimizedCode.replace(/function\s+\w+\(\)\s*{\s*}/g, '');

        this.optimizationStats.optimizationsApplied.push('dead-code-removal');
        return optimizedCode;
    }

    optimizeLoops(code) {
        let optimizedCode = code;

        // Optimize for loops
        optimizedCode = optimizedCode.replace(
            /for\s*\(\s*(?:var|let|const)\s+(\w+)\s*=\s*0;\s*\1\s*<\s*(.+?)\.length;\s*\1\+\+\s*\)/g,
            'for(let $1=0,len=$2.length;$1<len;$1++)'
        );

        // Optimize forEach to for loops where beneficial
        optimizedCode = optimizedCode.replace(
            /(\w+)\.forEach\(function\((\w+),?\s*(\w+)?\)\s*{([^}]+)}\)/g,
            'for(let $3=0;$3<$1.length;$3++){let $2=$1[$3];$4}'
        );

        this.optimizationStats.optimizationsApplied.push('loop-optimization');
        return optimizedCode;
    }

    inlineSmallFunctions(code) {
        let optimizedCode = code;

        // Inline small utility functions
        const functionPattern = /function\s+(\w+)\([^)]*\)\s*{\s*return\s+([^;]+);\s*}/g;
        const functions = new Map();

        // Extract small functions
        optimizedCode = optimizedCode.replace(functionPattern, (match, name, body) => {
            if (body.length < 50) {
                functions.set(name, body);
                return ''; // Remove the function definition
            }
            return match;
        });

        // Replace function calls with inline code
        functions.forEach((body, name) => {
            const callPattern = new RegExp(`\\b${name}\\(([^)]*)\\)`, 'g');
            optimizedCode = optimizedCode.replace(callPattern, `(${body})`);
        });

        if (functions.size > 0) {
            this.optimizationStats.optimizationsApplied.push('function-inlining');
        }

        return optimizedCode;
    }

    optimizeStringOperations(code) {
        let optimizedCode = code;

        // Optimize string concatenation
        optimizedCode = optimizedCode.replace(
            /(\w+)\s*\+=\s*['"`]([^'"`]+)['"`]/g,
            '$1+="$2"'
        );

        // Template literals for multiple concatenations
        optimizedCode = optimizedCode.replace(
            /'([^']*?)'\s*\+\s*(\w+)\s*\+\s*'([^']*?)'/g,
            '`$1${$2}$3`'
        );

        this.optimizationStats.optimizationsApplied.push('string-optimization');
        return optimizedCode;
    }

    optimizeDOMOperations(code) {
        let optimizedCode = code;

        // Cache DOM queries
        const domQueryPattern = /document\.querySelector\(['"`]([^'"`]+)['"`]\)/g;
        const queries = new Set();

        optimizedCode = optimizedCode.replace(domQueryPattern, (match, selector) => {
            const varName = `_${selector.replace(/[^a-zA-Z0-9]/g, '_')}`;
            queries.add(`const ${varName} = document.querySelector('${selector}');`);
            return varName;
        });

        // Add cached queries at the top
        if (queries.size > 0) {
            optimizedCode = Array.from(queries).join('\n') + '\n' + optimizedCode;
            this.optimizationStats.optimizationsApplied.push('dom-optimization');
        }

        return optimizedCode;
    }

    minifyCode(code) {
        if (!this.options.minify) return code;

        let minified = code;

        // Remove extra whitespace
        minified = minified.replace(/\s+/g, ' ');
        minified = minified.replace(/;\s*}/g, '}');
        minified = minified.replace(/{\s*/g, '{');
        minified = minified.replace(/}\s*/g, '}');
        minified = minified.replace(/,\s*/g, ',');

        // Remove unnecessary semicolons
        minified = minified.replace(/;+/g, ';');
        minified = minified.replace(/;}/g, '}');

        this.optimizationStats.optimizationsApplied.push('minification');
        return minified;
    }

    // ================================
    // BUNDLE LOADING & MANAGEMENT
    // ================================

    async loadBundle(bundleName) {
        const bundle = this.bundles.get(bundleName);
        if (!bundle) {
            throw new Error(`Bundle '${bundleName}' not found`);
        }

        const startTime = performance.now();

        try {
            const code = await this.fetchBundleCode(bundle);
            const optimizedCode = this.optimizeBundle(code);

            this.executeBundle(optimizedCode, bundle);

            const loadTime = performance.now() - startTime;
            this.reportBundleMetrics(bundleName, bundle, loadTime);

        } catch (error) {
            console.error(`Failed to load bundle '${bundleName}':`, error);
            this.fallbackToOriginalScripts(bundle);
        }
    }

    async fetchBundleCode(bundle) {
        // In a real implementation, this would fetch from server
        // For now, simulate by combining existing scripts
        const modulePromises = bundle.modules.map(async (moduleName) => {
            const moduleInfo = this.moduleRegistry.get(moduleName);
            if (moduleInfo) {
                return await this.fetchModuleCode(moduleInfo.url);
            }
            return '';
        });

        const moduleCodes = await Promise.all(modulePromises);
        return moduleCodes.join('\n\n');
    }

    async fetchModuleCode(url) {
        try {
            const response = await fetch(url);
            return await response.text();
        } catch (error) {
            console.warn(`Failed to fetch module from ${url}:`, error);
            return '';
        }
    }

    executeBundle(code, bundle) {
        try {
            // Create script element
            const script = document.createElement('script');
            script.textContent = code;
            script.dataset.bundle = bundle.name;
            script.dataset.loadStrategy = bundle.loadStrategy;

            // Add to document
            document.head.appendChild(script);

            this.optimizationStats.modulesProcessed += bundle.modules.length;

        } catch (error) {
            console.error(`Failed to execute bundle '${bundle.name}':`, error);
            throw error;
        }
    }

    fallbackToOriginalScripts(bundle) {
        console.log(`Falling back to original scripts for bundle: ${bundle.name}`);

        bundle.modules.forEach(moduleName => {
            const moduleInfo = this.moduleRegistry.get(moduleName);
            if (moduleInfo && moduleInfo.element) {
                // Re-enable original script if it was disabled
                moduleInfo.element.disabled = false;
            }
        });
    }

    // ================================
    // LOADING STRATEGIES
    // ================================

    setupModuleLoader() {
        // Immediate loading for critical bundles
        this.loadImmediateBundles();

        // Defer loading for non-critical bundles
        this.setupDeferredLoading();

        // Lazy loading for optional bundles
        this.setupLazyLoading();

        // Prefetching for likely-needed bundles
        this.setupPrefetching();
    }

    loadImmediateBundles() {
        this.bundles.forEach((bundle, name) => {
            if (bundle.loadStrategy === 'immediate') {
                this.loadBundle(name);
            }
        });
    }

    setupDeferredLoading() {
        document.addEventListener('DOMContentLoaded', () => {
            this.bundles.forEach((bundle, name) => {
                if (bundle.loadStrategy === 'defer') {
                    setTimeout(() => this.loadBundle(name), 100);
                }
            });
        });
    }

    setupLazyLoading() {
        const lazyBundles = Array.from(this.bundles.entries())
            .filter(([, bundle]) => bundle.loadStrategy === 'lazy');

        if (lazyBundles.length === 0) return;

        // Load lazy bundles on user interaction
        const loadLazyBundles = () => {
            lazyBundles.forEach(([name]) => {
                this.loadBundle(name);
            });

            // Remove listeners after first interaction
            document.removeEventListener('scroll', loadLazyBundles, { once: true });
            document.removeEventListener('click', loadLazyBundles, { once: true });
            document.removeEventListener('touchstart', loadLazyBundles, { once: true });
        };

        document.addEventListener('scroll', loadLazyBundles, { once: true, passive: true });
        document.addEventListener('click', loadLazyBundles, { once: true });
        document.addEventListener('touchstart', loadLazyBundles, { once: true, passive: true });

        // Also load after a delay as fallback
        setTimeout(() => {
            lazyBundles.forEach(([name]) => {
                this.loadBundle(name);
            });
        }, 5000);
    }

    setupPrefetching() {
        this.bundles.forEach((bundle, name) => {
            if (bundle.loadStrategy === 'prefetch') {
                this.prefetchBundle(name);
            }
        });
    }

    prefetchBundle(bundleName) {
        const bundle = this.bundles.get(bundleName);
        if (!bundle) return;

        // Create prefetch link
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = `/bundles/${bundle.name}`;
        link.dataset.bundle = bundleName;

        document.head.appendChild(link);
    }

    // ================================
    // BUNDLE MANIFEST & REPORTING
    // ================================

    generateBundleManifest() {
        const manifest = {
            version: '1.0.0',
            timestamp: Date.now(),
            bundles: {},
            optimization: this.optimizationStats,
            strategy: this.options.bundleStrategy
        };

        this.bundles.forEach((bundle, name) => {
            manifest.bundles[name] = {
                ...bundle,
                hash: this.generateBundleHash(bundle),
                dependencies: this.resolveBundleDependencies(bundle)
            };
        });

        this.bundleManifest = manifest;
        return manifest;
    }

    generateBundleHash(bundle) {
        // Simple hash for cache busting
        const content = JSON.stringify(bundle.modules.sort());
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    resolveBundleDependencies(bundle) {
        const dependencies = new Set();

        bundle.modules.forEach(moduleName => {
            const moduleInfo = this.moduleRegistry.get(moduleName);
            if (moduleInfo && moduleInfo.dependencies) {
                moduleInfo.dependencies.forEach(dep => dependencies.add(dep));
            }
        });

        return Array.from(dependencies);
    }

    reportBundleMetrics(bundleName, bundle, loadTime) {
        const metrics = {
            bundleName,
            loadTime,
            moduleCount: bundle.modules.length,
            bundleSize: bundle.size,
            compressionRatio: this.optimizationStats.compressionRatio,
            optimizationsApplied: this.optimizationStats.optimizationsApplied
        };

        // Report to analytics
        if (typeof gtag === 'function') {
            gtag('event', 'bundle_loaded', {
                event_category: 'Performance',
                event_label: bundleName,
                value: Math.round(loadTime)
            });
        }

        // Custom event for monitoring
        window.dispatchEvent(new CustomEvent('bundleLoaded', {
            detail: metrics
        }));

        console.log(`Bundle '${bundleName}' loaded in ${loadTime.toFixed(2)}ms`, metrics);
    }

    // ================================
    // PUBLIC API
    // ================================

    getOptimizationStats() {
        return { ...this.optimizationStats };
    }

    getBundleManifest() {
        return this.bundleManifest;
    }

    getLoadedBundles() {
        const loadedBundles = [];
        document.querySelectorAll('script[data-bundle]').forEach(script => {
            loadedBundles.push({
                name: script.dataset.bundle,
                strategy: script.dataset.loadStrategy,
                size: script.textContent.length
            });
        });
        return loadedBundles;
    }

    // ================================
    // CLEANUP
    // ================================

    destroy() {
        this.bundles.clear();
        this.moduleRegistry.clear();
        this.dependencies.clear();
    }
}

// Initialize the bundler optimizer
const jsBundlerOptimizer = new JSBundlerOptimizer({
    bundleStrategy: 'split',
    minify: true,
    compressionLevel: 'high'
});

// Export for use
window.JSBundlerOptimizer = JSBundlerOptimizer;
window.jsBundlerOptimizer = jsBundlerOptimizer;