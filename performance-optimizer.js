/**
 * The Profit Platform - Performance Optimization System
 * Advanced performance optimizations with monitoring and metrics
 */

class PerformanceOptimizer {
    constructor() {
        this.metrics = {
            loadTime: 0,
            domContentLoaded: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            firstInputDelay: 0,
            cumulativeLayoutShift: 0,
            resourceTimings: new Map(),
            memoryUsage: null,
            scriptExecutionTime: new Map()
        };

        this.observers = new Map();
        this.optimizations = {
            imageOptimization: true,
            lazyLoading: true,
            resourceBundling: true,
            caching: true,
            compressionGzip: true,
            criticalCSS: true,
            preloading: true,
            deferLoading: true
        };

        this.init();
    }

    init() {
        this.measureCoreWebVitals();
        this.setupPerformanceObservers();
        this.initializeOptimizations();
        this.startMemoryMonitoring();
    }

    // ================================
    // CORE WEB VITALS MEASUREMENT
    // ================================

    measureCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        this.observeLCP();

        // First Input Delay (FID)
        this.observeFID();

        // Cumulative Layout Shift (CLS)
        this.observeCLS();

        // Navigation timing
        this.measureNavigationTiming();
    }

    observeLCP() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.largestContentfulPaint = lastEntry.startTime;
                this.reportMetric('LCP', lastEntry.startTime);
            });

            observer.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.set('lcp', observer);
        }
    }

    observeFID() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    if (entry.name === 'first-input') {
                        this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
                        this.reportMetric('FID', this.metrics.firstInputDelay);
                    }
                });
            });

            observer.observe({ entryTypes: ['first-input'] });
            this.observers.set('fid', observer);
        }
    }

    observeCLS() {
        if ('PerformanceObserver' in window) {
            let clsValue = 0;
            let clsEntries = [];

            const observer = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        const firstSessionEntry = clsEntries[0];
                        const lastSessionEntry = clsEntries[clsEntries.length - 1];

                        if (!firstSessionEntry ||
                            (entry.startTime - lastSessionEntry.startTime) > 1000 ||
                            (entry.startTime - firstSessionEntry.startTime) > 5000) {
                            clsEntries = [entry];
                        } else {
                            clsEntries.push(entry);
                        }

                        const sessionValue = clsEntries.reduce((sum, e) => sum + e.value, 0);
                        if (sessionValue > clsValue) {
                            clsValue = sessionValue;
                            this.metrics.cumulativeLayoutShift = clsValue;
                            this.reportMetric('CLS', clsValue);
                        }
                    }
                });
            });

            observer.observe({ entryTypes: ['layout-shift'] });
            this.observers.set('cls', observer);
        }
    }

    measureNavigationTiming() {
        if (performance.timing) {
            const timing = performance.timing;
            this.metrics.loadTime = timing.loadEventEnd - timing.navigationStart;
            this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;

            // First Contentful Paint
            if (performance.getEntriesByName('first-contentful-paint').length > 0) {
                this.metrics.firstContentfulPaint = performance.getEntriesByName('first-contentful-paint')[0].startTime;
            }
        }
    }

    // ================================
    // PERFORMANCE OBSERVERS
    // ================================

    setupPerformanceObservers() {
        this.observeResourceTiming();
        this.observeLongTasks();
        this.observeElementTiming();
    }

    observeResourceTiming() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    this.metrics.resourceTimings.set(entry.name, {
                        loadTime: entry.responseEnd - entry.requestStart,
                        size: entry.transferSize || 0,
                        type: entry.initiatorType,
                        cached: entry.transferSize === 0 && entry.decodedBodySize > 0
                    });
                });
            });

            observer.observe({ entryTypes: ['resource'] });
            this.observers.set('resource', observer);
        }
    }

    observeLongTasks() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    if (entry.duration > 50) {
                        console.warn(`Long task detected: ${entry.duration}ms`, entry);
                        this.reportMetric('LONG_TASK', entry.duration);
                    }
                });
            });

            try {
                observer.observe({ entryTypes: ['longtask'] });
                this.observers.set('longtask', observer);
            } catch (e) {
                // Long task observer not supported
            }
        }
    }

    observeElementTiming() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    console.log(`Element timing: ${entry.identifier} - ${entry.loadTime}ms`);
                });
            });

            try {
                observer.observe({ entryTypes: ['element'] });
                this.observers.set('element', observer);
            } catch (e) {
                // Element timing not supported
            }
        }
    }

    // ================================
    // OPTIMIZATION IMPLEMENTATIONS
    // ================================

    initializeOptimizations() {
        this.implementImageOptimization();
        this.implementLazyLoading();
        this.implementResourceBundling();
        this.implementCaching();
        this.implementPreloading();
        this.implementDeferLoading();
    }

    implementImageOptimization() {
        if (!this.optimizations.imageOptimization) return;

        // Convert images to WebP where supported
        const images = document.querySelectorAll('img[data-optimize]');
        const supportsWebP = this.supportsWebP();

        images.forEach(img => {
            if (supportsWebP && !img.src.includes('.webp')) {
                const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');

                // Test if WebP version exists
                this.testImageExists(webpSrc).then(exists => {
                    if (exists) {
                        img.src = webpSrc;
                    }
                });
            }

            // Add loading="lazy" for images below fold
            if (this.isBelowFold(img)) {
                img.loading = 'lazy';
            }
        });
    }

    implementLazyLoading() {
        if (!this.optimizations.lazyLoading) return;

        const lazyElements = document.querySelectorAll('[data-lazy]');

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;

                        if (element.dataset.lazy === 'image') {
                            this.loadLazyImage(element);
                        } else if (element.dataset.lazy === 'script') {
                            this.loadLazyScript(element);
                        } else if (element.dataset.lazy === 'iframe') {
                            this.loadLazyIframe(element);
                        }

                        observer.unobserve(element);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            lazyElements.forEach(element => observer.observe(element));
        }
    }

    implementResourceBundling() {
        if (!this.optimizations.resourceBundling) return;

        // Bundle small CSS files
        this.bundleSmallCSS();

        // Bundle small JS files
        this.bundleSmallJS();
    }

    implementCaching() {
        if (!this.optimizations.caching) return;

        // Implement service worker for caching
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw-performance.js')
                .then(registration => {
                    console.log('Performance SW registered:', registration);
                })
                .catch(error => {
                    console.error('Performance SW registration failed:', error);
                });
        }

        // Implement memory cache for frequently accessed data
        this.implementMemoryCache();
    }

    implementPreloading() {
        if (!this.optimizations.preloading) return;

        // Preload critical resources
        this.preloadCriticalResources();

        // Prefetch likely next page resources
        this.prefetchNextPageResources();
    }

    implementDeferLoading() {
        if (!this.optimizations.deferLoading) return;

        // Defer non-critical JavaScript
        this.deferNonCriticalJS();

        // Defer non-critical CSS
        this.deferNonCriticalCSS();
    }

    // ================================
    // HELPER METHODS
    // ================================

    supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    testImageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }

    isBelowFold(element) {
        const rect = element.getBoundingClientRect();
        return rect.top > window.innerHeight;
    }

    loadLazyImage(img) {
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }
        if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
        }
        img.classList.add('loaded');
    }

    loadLazyScript(element) {
        const script = document.createElement('script');
        if (element.dataset.src) {
            script.src = element.dataset.src;
        }
        if (element.dataset.type) {
            script.type = element.dataset.type;
        }
        script.async = true;
        document.head.appendChild(script);
    }

    loadLazyIframe(iframe) {
        if (iframe.dataset.src) {
            iframe.src = iframe.dataset.src;
            iframe.removeAttribute('data-src');
        }
        iframe.classList.add('loaded');
    }

    bundleSmallCSS() {
        const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        const smallSheets = stylesheets.filter(sheet => {
            // Logic to identify small stylesheets
            return sheet.dataset.size && parseInt(sheet.dataset.size) < 5000;
        });

        if (smallSheets.length > 2) {
            // Combine small stylesheets
            this.combineStylesheets(smallSheets);
        }
    }

    bundleSmallJS() {
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const smallScripts = scripts.filter(script => {
            return script.dataset.size && parseInt(script.dataset.size) < 10000;
        });

        if (smallScripts.length > 2) {
            // Combine small scripts
            this.combineScripts(smallScripts);
        }
    }

    implementMemoryCache() {
        this.memoryCache = new Map();
        this.maxCacheSize = 50;

        window.performanceCache = {
            get: (key) => this.memoryCache.get(key),
            set: (key, value) => {
                if (this.memoryCache.size >= this.maxCacheSize) {
                    const firstKey = this.memoryCache.keys().next().value;
                    this.memoryCache.delete(firstKey);
                }
                this.memoryCache.set(key, value);
            },
            has: (key) => this.memoryCache.has(key),
            delete: (key) => this.memoryCache.delete(key),
            clear: () => this.memoryCache.clear()
        };
    }

    preloadCriticalResources() {
        const criticalResources = [
            '/css/critical.min.css',
            '/js/critical.min.js',
            '/fonts/inter-regular.woff2'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';

            if (resource.endsWith('.css')) {
                link.as = 'style';
            } else if (resource.endsWith('.js')) {
                link.as = 'script';
            } else if (resource.includes('/fonts/')) {
                link.as = 'font';
                link.type = 'font/woff2';
                link.crossOrigin = 'anonymous';
            }

            link.href = resource;
            document.head.appendChild(link);
        });
    }

    prefetchNextPageResources() {
        const links = document.querySelectorAll('a[href]');
        const internalLinks = Array.from(links).filter(link =>
            link.hostname === window.location.hostname &&
            !link.href.includes('#') &&
            link.href !== window.location.href
        );

        // Prefetch top 3 most likely next pages
        internalLinks.slice(0, 3).forEach(link => {
            const prefetchLink = document.createElement('link');
            prefetchLink.rel = 'prefetch';
            prefetchLink.href = link.href;
            document.head.appendChild(prefetchLink);
        });
    }

    deferNonCriticalJS() {
        const scripts = document.querySelectorAll('script[src]:not([data-critical])');
        scripts.forEach(script => {
            if (!script.defer && !script.async) {
                script.defer = true;
            }
        });
    }

    deferNonCriticalCSS() {
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
        stylesheets.forEach(stylesheet => {
            if (!stylesheet.media || stylesheet.media === 'all') {
                stylesheet.media = 'print';
                stylesheet.onload = function() {
                    this.media = 'all';
                };
            }
        });
    }

    // ================================
    // MEMORY MONITORING
    // ================================

    startMemoryMonitoring() {
        if ('memory' in performance) {
            setInterval(() => {
                this.metrics.memoryUsage = {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                };

                // Alert if memory usage is high
                const memoryUsagePercent = (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100;
                if (memoryUsagePercent > 80) {
                    console.warn(`High memory usage: ${memoryUsagePercent.toFixed(2)}%`);
                    this.reportMetric('HIGH_MEMORY_USAGE', memoryUsagePercent);
                }
            }, 10000);
        }
    }

    // ================================
    // REPORTING & ANALYTICS
    // ================================

    reportMetric(name, value) {
        // Report to analytics
        if (typeof gtag === 'function') {
            gtag('event', 'performance_metric', {
                event_category: 'Performance',
                event_label: name,
                value: Math.round(value)
            });
        }

        // Console logging for development
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('test')) {
            console.log(`Performance Metric - ${name}: ${value}`);
        }

        // Custom event for other monitoring tools
        window.dispatchEvent(new CustomEvent('performanceMetric', {
            detail: { name, value }
        }));
    }

    getMetrics() {
        return {
            ...this.metrics,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null
        };
    }

    generateReport() {
        const metrics = this.getMetrics();

        return {
            summary: {
                overallScore: this.calculatePerformanceScore(metrics),
                coreWebVitals: {
                    lcp: metrics.largestContentfulPaint,
                    fid: metrics.firstInputDelay,
                    cls: metrics.cumulativeLayoutShift
                },
                loadingMetrics: {
                    loadTime: metrics.loadTime,
                    domContentLoaded: metrics.domContentLoaded,
                    firstContentfulPaint: metrics.firstContentfulPaint
                }
            },
            detailed: metrics,
            recommendations: this.generateRecommendations(metrics)
        };
    }

    calculatePerformanceScore(metrics) {
        let score = 100;

        // LCP penalty
        if (metrics.largestContentfulPaint > 2500) score -= 20;
        else if (metrics.largestContentfulPaint > 4000) score -= 40;

        // FID penalty
        if (metrics.firstInputDelay > 100) score -= 15;
        else if (metrics.firstInputDelay > 300) score -= 30;

        // CLS penalty
        if (metrics.cumulativeLayoutShift > 0.1) score -= 15;
        else if (metrics.cumulativeLayoutShift > 0.25) score -= 30;

        // Load time penalty
        if (metrics.loadTime > 3000) score -= 10;
        else if (metrics.loadTime > 5000) score -= 20;

        return Math.max(0, score);
    }

    generateRecommendations(metrics) {
        const recommendations = [];

        if (metrics.largestContentfulPaint > 2500) {
            recommendations.push({
                priority: 'high',
                category: 'LCP',
                message: 'Optimize largest contentful paint by optimizing images and critical resources'
            });
        }

        if (metrics.firstInputDelay > 100) {
            recommendations.push({
                priority: 'high',
                category: 'FID',
                message: 'Reduce first input delay by optimizing JavaScript execution'
            });
        }

        if (metrics.cumulativeLayoutShift > 0.1) {
            recommendations.push({
                priority: 'medium',
                category: 'CLS',
                message: 'Reduce layout shifts by setting image dimensions and avoiding dynamic content'
            });
        }

        if (metrics.loadTime > 3000) {
            recommendations.push({
                priority: 'medium',
                category: 'Loading',
                message: 'Optimize page load time by reducing bundle sizes and optimizing resources'
            });
        }

        return recommendations;
    }

    // ================================
    // CLEANUP
    // ================================

    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();

        if (this.memoryCache) {
            this.memoryCache.clear();
        }
    }
}

// Initialize performance optimizer
const performanceOptimizer = new PerformanceOptimizer();

// Export for use in other modules
window.PerformanceOptimizer = PerformanceOptimizer;
window.performanceOptimizer = performanceOptimizer;

// Expose methods globally for debugging
if (window.location.hostname === 'localhost' || window.location.hostname.includes('test')) {
    window.getPerformanceReport = () => performanceOptimizer.generateReport();
    window.getPerformanceMetrics = () => performanceOptimizer.getMetrics();
}