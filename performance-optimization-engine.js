/**
 * The Profit Platform - Advanced Performance Optimization Engine
 * Comprehensive performance optimizations with real-time monitoring and adaptive loading
 */

class PerformanceOptimizationEngine {
    constructor(options = {}) {
        this.options = {
            // Critical resource optimization
            criticalCSSInline: true,
            deferNonCritical: true,
            bundleResources: true,

            // Image optimization
            webpConversion: true,
            lazyLoading: true,
            progressiveJPEG: true,

            // JavaScript optimization
            codesplitting: true,
            dynamicImports: true,
            bundleCompression: true,

            // Caching strategy
            serviceWorker: true,
            browserCache: true,
            memoryCache: true,

            // Performance monitoring
            realTimeMetrics: true,
            automaticOptimization: true,
            adaptiveLoading: true,

            ...options
        };

        this.metrics = {
            // Core Web Vitals
            lcp: null,
            fid: null,
            cls: null,
            fcp: null,
            ttfb: null,

            // Resource metrics
            resourceCount: 0,
            totalSize: 0,
            cacheHitRatio: 0,

            // Custom metrics
            aboveFoldTime: 0,
            interactivityTime: 0,
            scrollResponsiveness: 0
        };

        this.observers = new Map();
        this.resourceQueue = new Map();
        this.criticalResources = new Set();
        this.optimizationStats = {
            cssOptimized: false,
            imagesOptimized: 0,
            jsOptimized: false,
            cacheImplemented: false
        };

        this.init();
    }

    async init() {
        console.log('🚀 Initializing Performance Optimization Engine...');

        // Start performance monitoring first
        this.initializeMetricsCollection();

        // Implement optimizations in order of impact
        await this.optimizeCriticalResources();
        await this.optimizeImageLoading();
        await this.optimizeJavaScript();
        await this.implementCaching();

        // Start adaptive optimization
        this.startAdaptiveOptimization();

        console.log('✅ Performance Optimization Engine initialized');
        this.generateInitialReport();
    }

    // ================================
    // CRITICAL RESOURCE OPTIMIZATION
    // ================================

    async optimizeCriticalResources() {
        if (!this.options.criticalCSSInline) return;

        console.log('🎨 Optimizing critical resources...');

        // Identify critical CSS
        const criticalCSS = await this.extractCriticalCSS();

        // Inline critical CSS
        this.inlineCriticalCSS(criticalCSS);

        // Defer non-critical CSS
        this.deferNonCriticalCSS();

        // Bundle remaining stylesheets
        if (this.options.bundleResources) {
            this.bundleStylesheets();
        }

        this.optimizationStats.cssOptimized = true;
    }

    async extractCriticalCSS() {
        const viewportHeight = window.innerHeight;
        const criticalElements = [];

        // Find above-fold elements
        document.querySelectorAll('*').forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.top < viewportHeight && rect.height > 0) {
                criticalElements.push(element);
            }
        });

        // Extract styles for critical elements
        const criticalRules = new Set();
        const stylesheets = Array.from(document.styleSheets);

        for (const stylesheet of stylesheets) {
            try {
                const rules = Array.from(stylesheet.cssRules || stylesheet.rules || []);

                for (const rule of rules) {
                    if (rule.type === CSSRule.STYLE_RULE) {
                        // Check if rule applies to critical elements
                        const matchesCritical = criticalElements.some(el => {
                            try {
                                return el.matches(rule.selectorText);
                            } catch (e) {
                                return false;
                            }
                        });

                        if (matchesCritical) {
                            criticalRules.add(rule.cssText);
                        }
                    }
                }
            } catch (e) {
                console.warn('Could not access stylesheet:', stylesheet.href);
            }
        }

        return Array.from(criticalRules).join('\n');
    }

    inlineCriticalCSS(criticalCSS) {
        if (!criticalCSS) return;

        // Remove existing critical inline styles
        document.querySelectorAll('style[data-critical]').forEach(style => {
            style.remove();
        });

        // Create optimized critical CSS
        const style = document.createElement('style');
        style.setAttribute('data-critical', 'true');
        style.textContent = this.minifyCSS(criticalCSS);

        // Insert at the beginning of head
        document.head.insertBefore(style, document.head.firstChild);

        console.log(`✅ Inlined ${criticalCSS.length} bytes of critical CSS`);
    }

    deferNonCriticalCSS() {
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');

        stylesheets.forEach(link => {
            // Skip if already deferred
            if (link.dataset.deferred) return;

            // Create deferred loading
            const media = link.media;
            link.media = 'print';
            link.dataset.deferred = 'true';

            link.addEventListener('load', function() {
                this.media = media || 'all';
            });

            // Fallback for browsers without load event support
            setTimeout(() => {
                if (link.media === 'print') {
                    link.media = media || 'all';
                }
            }, 3000);
        });

        console.log(`✅ Deferred ${stylesheets.length} non-critical stylesheets`);
    }

    bundleStylesheets() {
        const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"][data-deferred]'));

        if (stylesheets.length < 2) return;

        // Group stylesheets by media type
        const groups = new Map();
        stylesheets.forEach(link => {
            const media = link.media === 'print' ? 'all' : link.media;
            if (!groups.has(media)) {
                groups.set(media, []);
            }
            groups.get(media).push(link);
        });

        // Bundle each group
        groups.forEach(async (links, media) => {
            if (links.length > 1) {
                await this.createBundledStylesheet(links, media);
            }
        });
    }

    async createBundledStylesheet(links, media) {
        const cssContent = [];

        for (const link of links) {
            try {
                const response = await fetch(link.href);
                const css = await response.text();
                cssContent.push(`/* ${link.href} */\n${css}`);
            } catch (e) {
                console.warn('Failed to fetch stylesheet:', link.href);
            }
        }

        if (cssContent.length === 0) return;

        // Create bundled stylesheet
        const bundledCSS = this.minifyCSS(cssContent.join('\n'));
        const blob = new Blob([bundledCSS], { type: 'text/css' });
        const url = URL.createObjectURL(blob);

        // Create new bundled link
        const bundledLink = document.createElement('link');
        bundledLink.rel = 'stylesheet';
        bundledLink.href = url;
        bundledLink.media = media;
        bundledLink.dataset.bundled = 'true';

        // Remove original links and add bundled one
        links.forEach(link => link.remove());
        document.head.appendChild(bundledLink);

        console.log(`✅ Bundled ${links.length} stylesheets for media: ${media}`);
    }

    minifyCSS(css) {
        return css
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
            .replace(/\s+/g, ' ') // Collapse whitespace
            .replace(/\s*([{}:;,>+~])\s*/g, '$1') // Remove spaces around punctuation
            .replace(/;}/g, '}') // Remove unnecessary semicolons
            .trim();
    }

    // ================================
    // IMAGE OPTIMIZATION
    // ================================

    async optimizeImageLoading() {
        console.log('🖼️ Optimizing image loading...');

        if (this.options.webpConversion) {
            await this.implementWebPImages();
        }

        if (this.options.lazyLoading) {
            this.implementLazyLoading();
        }

        this.implementProgressiveLoading();
        this.optimizationStats.imagesOptimized = document.querySelectorAll('img').length;
    }

    async implementWebPImages() {
        const images = document.querySelectorAll('img[src]');
        const supportsWebP = await this.detectWebPSupport();

        if (!supportsWebP) {
            console.log('❌ WebP not supported, skipping conversion');
            return;
        }

        images.forEach(img => {
            // Skip if already optimized
            if (img.dataset.webpOptimized) return;

            const originalSrc = img.src;
            const webpSrc = this.getWebPVersion(originalSrc);

            // Test if WebP version exists
            this.testImage(webpSrc).then(exists => {
                if (exists) {
                    // Create picture element for WebP with fallback
                    this.convertToPictureElement(img, webpSrc, originalSrc);
                }
            });
        });
    }

    async detectWebPSupport() {
        return new Promise(resolve => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    getWebPVersion(src) {
        return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }

    testImage(src) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = src;
        });
    }

    convertToPictureElement(img, webpSrc, fallbackSrc) {
        const picture = document.createElement('picture');

        // WebP source
        const webpSource = document.createElement('source');
        webpSource.type = 'image/webp';
        webpSource.srcset = webpSrc;

        // Fallback source
        const fallbackSource = document.createElement('source');
        fallbackSource.type = this.getMimeType(fallbackSrc);
        fallbackSource.srcset = fallbackSrc;

        // Clone img with optimization attributes
        const optimizedImg = img.cloneNode(true);
        optimizedImg.src = fallbackSrc;
        optimizedImg.dataset.webpOptimized = 'true';

        // Assemble picture element
        picture.appendChild(webpSource);
        picture.appendChild(fallbackSource);
        picture.appendChild(optimizedImg);

        // Replace original image
        img.parentNode.replaceChild(picture, img);
    }

    getMimeType(src) {
        if (src.includes('.jpg') || src.includes('.jpeg')) return 'image/jpeg';
        if (src.includes('.png')) return 'image/png';
        if (src.includes('.gif')) return 'image/gif';
        return 'image/jpeg';
    }

    implementLazyLoading() {
        const images = document.querySelectorAll('img:not([data-lazy-loaded])');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            images.forEach(img => {
                // Mark images below fold for lazy loading
                if (this.isBelowFold(img)) {
                    // Store original src
                    if (img.src) {
                        img.dataset.src = img.src;
                        img.src = this.generatePlaceholder(img);
                    }

                    imageObserver.observe(img);
                } else {
                    // Load above-fold images immediately
                    this.loadImage(img);
                }
            });

            this.observers.set('images', imageObserver);
        } else {
            // Fallback for browsers without IntersectionObserver
            images.forEach(img => this.loadImage(img));
        }

        console.log(`✅ Implemented lazy loading for ${images.length} images`);
    }

    isBelowFold(element) {
        const rect = element.getBoundingClientRect();
        return rect.top > window.innerHeight * 1.25; // 25% buffer
    }

    generatePlaceholder(img) {
        const width = img.getAttribute('width') || 300;
        const height = img.getAttribute('height') || 200;

        // Create SVG placeholder
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3ELoading...%3C/text%3E%3C/svg%3E`;
    }

    loadImage(img) {
        if (img.dataset.lazyLoaded) return;

        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }

        img.dataset.lazyLoaded = 'true';
        img.classList.add('lazy-loaded');

        // Add fade-in effect
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s';

        img.onload = () => {
            img.style.opacity = '1';
        };
    }

    implementProgressiveLoading() {
        const images = document.querySelectorAll('img[data-progressive]');

        images.forEach(img => {
            const lowQualitySrc = img.dataset.lowQuality;
            const highQualitySrc = img.dataset.src || img.src;

            if (!lowQualitySrc) return;

            // Load low quality version first
            img.src = lowQualitySrc;
            img.classList.add('progressive-loading');

            // Preload high quality version
            const highQualityImg = new Image();
            highQualityImg.onload = () => {
                img.src = highQualitySrc;
                img.classList.remove('progressive-loading');
                img.classList.add('progressive-loaded');
            };
            highQualityImg.src = highQualitySrc;
        });
    }

    // ================================
    // JAVASCRIPT OPTIMIZATION
    // ================================

    async optimizeJavaScript() {
        console.log('⚡ Optimizing JavaScript...');

        if (this.options.codesplitting) {
            await this.implementCodeSplitting();
        }

        if (this.options.dynamicImports) {
            this.implementDynamicImports();
        }

        this.deferNonCriticalScripts();
        this.optimizationStats.jsOptimized = true;
    }

    async implementCodeSplitting() {
        // Identify and split non-critical JavaScript
        const scripts = document.querySelectorAll('script[src]:not([data-critical])');

        const criticalFeatures = ['navigation', 'hero', 'critical'];
        const deferredScripts = [];

        scripts.forEach(script => {
            const src = script.src;
            const isCritical = criticalFeatures.some(feature =>
                src.includes(feature) || script.dataset.critical !== undefined
            );

            if (!isCritical) {
                deferredScripts.push(script);
            }
        });

        // Load deferred scripts after page load
        if (deferredScripts.length > 0) {
            window.addEventListener('load', () => {
                deferredScripts.forEach(script => {
                    script.setAttribute('defer', '');
                });
            });
        }

        console.log(`✅ Split ${deferredScripts.length} non-critical scripts`);
    }

    implementDynamicImports() {
        // Create dynamic import helper
        window.loadFeature = async (featureName) => {
            if (this.loadedFeatures?.has(featureName)) {
                return this.loadedFeatures.get(featureName);
            }

            try {
                const module = await import(`/js/features/${featureName}.js`);
                if (!this.loadedFeatures) this.loadedFeatures = new Map();
                this.loadedFeatures.set(featureName, module);
                return module;
            } catch (error) {
                console.warn(`Failed to load feature: ${featureName}`, error);
                return null;
            }
        };

        // Implement on-demand loading for interactive elements
        this.setupInteractionBasedLoading();
    }

    setupInteractionBasedLoading() {
        // Load features on first interaction
        const interactiveElements = {
            '[data-feature="modal"]': 'modal',
            '[data-feature="carousel"]': 'carousel',
            '[data-feature="tabs"]': 'tabs',
            '[data-feature="accordion"]': 'accordion'
        };

        Object.entries(interactiveElements).forEach(([selector, feature]) => {
            document.querySelectorAll(selector).forEach(element => {
                const loadOnInteraction = () => {
                    window.loadFeature(feature).then(module => {
                        if (module && module.init) {
                            module.init(element);
                        }
                    });
                    element.removeEventListener('mouseenter', loadOnInteraction);
                    element.removeEventListener('click', loadOnInteraction);
                };

                element.addEventListener('mouseenter', loadOnInteraction, { once: true });
                element.addEventListener('click', loadOnInteraction, { once: true });
            });
        });
    }

    deferNonCriticalScripts() {
        const scripts = document.querySelectorAll('script[src]:not([data-critical]):not([async]):not([defer])');

        scripts.forEach(script => {
            if (!script.src.includes('gtag') && !script.src.includes('analytics')) {
                script.defer = true;
            }
        });

        console.log(`✅ Deferred ${scripts.length} non-critical scripts`);
    }

    // ================================
    // CACHING IMPLEMENTATION
    // ================================

    async implementCaching() {
        console.log('💾 Implementing caching strategies...');

        if (this.options.serviceWorker) {
            await this.registerServiceWorker();
        }

        if (this.options.browserCache) {
            this.optimizeBrowserCaching();
        }

        if (this.options.memoryCache) {
            this.implementMemoryCache();
        }

        this.optimizationStats.cacheImplemented = true;
    }

    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('Service Worker not supported');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.register('/performance-sw.js', {
                scope: '/'
            });

            console.log('✅ Performance Service Worker registered');

            // Listen for updates
            registration.addEventListener('updatefound', () => {
                console.log('🔄 Service Worker update found');
            });

        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);

            // Create service worker inline if file doesn't exist
            this.createInlineServiceWorker();
        }
    }

    createInlineServiceWorker() {
        const swCode = `
            const CACHE_NAME = 'tpp-performance-v1';
            const CRITICAL_RESOURCES = [
                '/',
                '/css/critical.min.css',
                '/js/consolidated.js',
                '/images/logo.webp'
            ];

            self.addEventListener('install', event => {
                event.waitUntil(
                    caches.open(CACHE_NAME)
                        .then(cache => cache.addAll(CRITICAL_RESOURCES))
                );
            });

            self.addEventListener('fetch', event => {
                event.respondWith(
                    caches.match(event.request)
                        .then(response => response || fetch(event.request))
                );
            });
        `;

        const blob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);

        navigator.serviceWorker.register(swUrl);
    }

    optimizeBrowserCaching() {
        // Add cache-busting for dynamic content
        const dynamicResources = document.querySelectorAll('link[href], script[src]');

        dynamicResources.forEach(element => {
            const url = element.href || element.src;
            if (url && !url.includes('?') && this.shouldCacheBust(url)) {
                const cacheBustParam = `v=${Date.now()}`;
                if (element.href) {
                    element.href += `?${cacheBustParam}`;
                } else if (element.src) {
                    element.src += `?${cacheBustParam}`;
                }
            }
        });
    }

    shouldCacheBust(url) {
        // Don't cache-bust external resources or already versioned files
        return !url.includes('://') &&
               !url.includes('.min.') &&
               !url.includes('?v=');
    }

    implementMemoryCache() {
        if (window.performanceCache) return;

        const cache = new Map();
        const maxSize = 50;

        window.performanceCache = {
            get: (key) => cache.get(key),
            set: (key, value) => {
                if (cache.size >= maxSize) {
                    const firstKey = cache.keys().next().value;
                    cache.delete(firstKey);
                }
                cache.set(key, {
                    value,
                    timestamp: Date.now()
                });
            },
            has: (key) => cache.has(key),
            delete: (key) => cache.delete(key),
            clear: () => cache.clear()
        };

        console.log('✅ Memory cache implemented');
    }

    // ================================
    // PERFORMANCE MONITORING
    // ================================

    initializeMetricsCollection() {
        if (!this.options.realTimeMetrics) return;

        console.log('📊 Initializing performance monitoring...');

        this.setupWebVitalsObservers();
        this.setupResourceObserver();
        this.setupCustomMetrics();

        // Report metrics periodically
        setInterval(() => {
            this.reportMetrics();
        }, 30000); // Every 30 seconds
    }

    setupWebVitalsObservers() {
        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
            });

            try {
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                this.observers.set('lcp', lcpObserver);
            } catch (e) {
                console.warn('LCP observer not supported');
            }
        }

        // First Input Delay
        if ('PerformanceEventTiming' in window) {
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.name === 'first-input') {
                        this.metrics.fid = entry.processingStart - entry.startTime;
                    }
                });
            });

            try {
                fidObserver.observe({ entryTypes: ['first-input'] });
                this.observers.set('fid', fidObserver);
            } catch (e) {
                console.warn('FID observer not supported');
            }
        }

        // Cumulative Layout Shift
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                    this.metrics.cls = clsValue;
                }
            });
        });

        try {
            clsObserver.observe({ entryTypes: ['layout-shift'] });
            this.observers.set('cls', clsObserver);
        } catch (e) {
            console.warn('CLS observer not supported');
        }
    }

    setupResourceObserver() {
        if ('PerformanceObserver' in window) {
            const resourceObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();

                entries.forEach(entry => {
                    this.metrics.resourceCount++;
                    this.metrics.totalSize += entry.transferSize || 0;

                    // Track cache hit ratio
                    if (entry.transferSize === 0 && entry.decodedBodySize > 0) {
                        this.metrics.cacheHitRatio++;
                    }
                });
            });

            try {
                resourceObserver.observe({ entryTypes: ['resource'] });
                this.observers.set('resource', resourceObserver);
            } catch (e) {
                console.warn('Resource observer not supported');
            }
        }
    }

    setupCustomMetrics() {
        // Measure above-fold render time
        const aboveFoldElements = document.querySelectorAll('[data-above-fold]');
        if (aboveFoldElements.length > 0) {
            const startTime = performance.now();

            const checkAboveFoldComplete = () => {
                const allLoaded = Array.from(aboveFoldElements).every(el => {
                    if (el.tagName === 'IMG') {
                        return el.complete;
                    }
                    return el.offsetHeight > 0;
                });

                if (allLoaded) {
                    this.metrics.aboveFoldTime = performance.now() - startTime;
                } else {
                    requestAnimationFrame(checkAboveFoldComplete);
                }
            };

            checkAboveFoldComplete();
        }

        // Measure interactivity time
        this.measureInteractivityTime();

        // Measure scroll responsiveness
        this.measureScrollResponsiveness();
    }

    measureInteractivityTime() {
        const startTime = performance.now();

        const checkInteractivity = () => {
            // Check if main thread is responsive
            const isInteractive = document.readyState === 'complete' &&
                                   !this.hasLongTasks();

            if (isInteractive) {
                this.metrics.interactivityTime = performance.now() - startTime;
            } else {
                setTimeout(checkInteractivity, 100);
            }
        };

        if (document.readyState === 'complete') {
            checkInteractivity();
        } else {
            window.addEventListener('load', checkInteractivity);
        }
    }

    hasLongTasks() {
        // Simple heuristic: check if there are pending high-priority tasks
        return performance.now() - this.lastFrameTime > 50;
    }

    measureScrollResponsiveness() {
        let lastScrollTime = 0;
        let scrollSamples = [];

        const handleScroll = () => {
            const now = performance.now();
            const delta = now - lastScrollTime;

            if (lastScrollTime > 0) {
                scrollSamples.push(delta);

                // Keep only recent samples
                if (scrollSamples.length > 10) {
                    scrollSamples.shift();
                }

                // Calculate average responsiveness
                const avgDelta = scrollSamples.reduce((a, b) => a + b, 0) / scrollSamples.length;
                this.metrics.scrollResponsiveness = Math.max(0, 100 - avgDelta);
            }

            lastScrollTime = now;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    reportMetrics() {
        const report = {
            timestamp: Date.now(),
            url: window.location.href,
            metrics: { ...this.metrics },
            optimizations: { ...this.optimizationStats },
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null
        };

        // Report to analytics
        if (typeof gtag === 'function') {
            gtag('event', 'performance_report', {
                event_category: 'Performance',
                custom_parameters: {
                    lcp: Math.round(this.metrics.lcp || 0),
                    fid: Math.round(this.metrics.fid || 0),
                    cls: Math.round((this.metrics.cls || 0) * 1000) / 1000
                }
            });
        }

        // Custom event for other monitoring
        window.dispatchEvent(new CustomEvent('performanceReport', {
            detail: report
        }));

        console.log('📊 Performance report:', report);
    }

    // ================================
    // ADAPTIVE OPTIMIZATION
    // ================================

    startAdaptiveOptimization() {
        if (!this.options.automaticOptimization) return;

        console.log('🧠 Starting adaptive optimization...');

        // Monitor performance continuously
        setInterval(() => {
            this.performAdaptiveOptimizations();
        }, 60000); // Every minute
    }

    performAdaptiveOptimizations() {
        // Adjust based on connection quality
        if (navigator.connection) {
            const connection = navigator.connection;

            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                this.enableDataSaverMode();
            } else if (connection.effectiveType === '4g') {
                this.enableHighQualityMode();
            }
        }

        // Adjust based on performance metrics
        if (this.metrics.lcp > 4000) {
            this.optimizeForLCP();
        }

        if (this.metrics.cls > 0.25) {
            this.optimizeForCLS();
        }

        if (this.metrics.fid > 300) {
            this.optimizeForFID();
        }
    }

    enableDataSaverMode() {
        console.log('📱 Enabling data saver mode...');

        // Reduce image quality
        document.querySelectorAll('img[data-high-quality]').forEach(img => {
            const lowQualitySrc = img.dataset.lowQuality;
            if (lowQualitySrc) {
                img.src = lowQualitySrc;
            }
        });

        // Disable non-essential features
        document.body.classList.add('data-saver-mode');
    }

    enableHighQualityMode() {
        console.log('🚀 Enabling high quality mode...');

        // Load high quality images
        document.querySelectorAll('img[data-high-quality]').forEach(img => {
            const highQualitySrc = img.dataset.highQuality;
            if (highQualitySrc) {
                img.src = highQualitySrc;
            }
        });

        // Enable enhanced features
        document.body.classList.add('high-quality-mode');
    }

    optimizeForLCP() {
        console.log('🎯 Optimizing for LCP...');

        // Preload LCP element if not already done
        const lcpCandidates = document.querySelectorAll('img, h1, [data-lcp-candidate]');
        lcpCandidates.forEach(element => {
            if (!element.dataset.preloaded) {
                if (element.tagName === 'IMG') {
                    this.preloadImage(element.src);
                }
                element.dataset.preloaded = 'true';
            }
        });
    }

    optimizeForCLS() {
        console.log('📐 Optimizing for CLS...');

        // Add dimensions to images without them
        document.querySelectorAll('img:not([width]):not([height])').forEach(img => {
            if (img.naturalWidth && img.naturalHeight) {
                img.setAttribute('width', img.naturalWidth);
                img.setAttribute('height', img.naturalHeight);
            }
        });

        // Reserve space for dynamic content
        document.querySelectorAll('[data-dynamic-content]').forEach(element => {
            if (!element.style.minHeight) {
                element.style.minHeight = '100px';
            }
        });
    }

    optimizeForFID() {
        console.log('⚡ Optimizing for FID...');

        // Break up long tasks
        this.scheduleIdleWork();

        // Defer non-essential JavaScript
        document.querySelectorAll('script[data-non-essential]').forEach(script => {
            if (!script.defer) {
                script.defer = true;
            }
        });
    }

    preloadImage(src) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    }

    scheduleIdleWork() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                // Perform non-essential work during idle time
                this.performMaintenanceTasks();
            });
        }
    }

    performMaintenanceTasks() {
        // Clear old cache entries
        if (window.performanceCache) {
            window.performanceCache.clear();
        }

        // Update metrics
        this.updateMetrics();
    }

    updateMetrics() {
        // Update TTFB
        if (performance.timing) {
            this.metrics.ttfb = performance.timing.responseStart - performance.timing.requestStart;
        }

        // Update FCP
        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
        if (fcpEntry) {
            this.metrics.fcp = fcpEntry.startTime;
        }
    }

    // ================================
    // PUBLIC API
    // ================================

    getMetrics() {
        return { ...this.metrics };
    }

    getOptimizationStats() {
        return { ...this.optimizationStats };
    }

    generatePerformanceReport() {
        return {
            timestamp: Date.now(),
            url: window.location.href,
            metrics: this.getMetrics(),
            optimizations: this.getOptimizationStats(),
            recommendations: this.generateRecommendations()
        };
    }

    generateRecommendations() {
        const recommendations = [];

        if (this.metrics.lcp > 2500) {
            recommendations.push({
                type: 'LCP',
                priority: 'high',
                message: 'Optimize largest contentful paint by improving image loading and critical CSS'
            });
        }

        if (this.metrics.fid > 100) {
            recommendations.push({
                type: 'FID',
                priority: 'high',
                message: 'Reduce first input delay by optimizing JavaScript execution'
            });
        }

        if (this.metrics.cls > 0.1) {
            recommendations.push({
                type: 'CLS',
                priority: 'medium',
                message: 'Improve layout stability by setting image dimensions and avoiding layout shifts'
            });
        }

        return recommendations;
    }

    generateInitialReport() {
        const report = this.generatePerformanceReport();
        console.log('📋 Initial Performance Report:', report);

        // Store in memory cache for later reference
        if (window.performanceCache) {
            window.performanceCache.set('initial_report', report);
        }

        return report;
    }

    // ================================
    // CLEANUP
    // ================================

    destroy() {
        console.log('🧹 Cleaning up Performance Optimization Engine...');

        // Disconnect all observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();

        // Clear caches
        if (window.performanceCache) {
            window.performanceCache.clear();
        }

        // Remove event listeners
        window.removeEventListener('load', this.handleLoad);
        window.removeEventListener('scroll', this.handleScroll);
    }
}

// Initialize the Performance Optimization Engine
const performanceEngine = new PerformanceOptimizationEngine({
    criticalCSSInline: true,
    deferNonCritical: true,
    bundleResources: true,
    webpConversion: true,
    lazyLoading: true,
    codeSpitting: true,
    serviceWorker: true,
    realTimeMetrics: true,
    automaticOptimization: true,
    adaptiveLoading: true
});

// Export for global use
window.PerformanceOptimizationEngine = PerformanceOptimizationEngine;
window.performanceEngine = performanceEngine;

// Debugging interface for development
if (window.location.hostname === 'localhost' || window.location.hostname.includes('test')) {
    window.getPerformanceReport = () => performanceEngine.generatePerformanceReport();
    window.getPerformanceMetrics = () => performanceEngine.getMetrics();
    window.getOptimizationStats = () => performanceEngine.getOptimizationStats();
}