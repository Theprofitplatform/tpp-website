/**
 * The Profit Platform - Resource Loader Optimizer
 * Advanced resource loading, preloading, and caching optimizations
 */

class ResourceLoaderOptimizer {
    constructor(options = {}) {
        this.options = {
            preloading: true,
            prefetching: true,
            lazyLoading: true,
            serviceWorkerCaching: true,
            resourceHints: true,
            compressionOptimization: true,
            adaptiveLoading: true,
            connectionAware: true,
            ...options
        };

        this.resources = new Map();
        this.preloadQueue = [];
        this.prefetchQueue = [];
        this.lazyQueue = [];
        this.cacheStrategies = new Map();
        this.networkInfo = null;
        this.loadingStats = {
            totalRequests: 0,
            cachedRequests: 0,
            failedRequests: 0,
            totalBytes: 0,
            savedBytes: 0,
            averageLoadTime: 0
        };

        this.priorities = {
            CRITICAL: 100,
            HIGH: 80,
            MEDIUM: 60,
            LOW: 40,
            LAZY: 20
        };

        this.init();
    }

    init() {
        this.detectNetworkConditions();
        this.setupResourceObservers();
        this.initializeResourceStrategies();
        this.setupServiceWorker();
        this.startResourceOptimization();
    }

    // ================================
    // NETWORK CONDITIONS & ADAPTATION
    // ================================

    detectNetworkConditions() {
        if ('connection' in navigator) {
            this.networkInfo = {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            };

            // Listen for network changes
            navigator.connection.addEventListener('change', () => {
                this.updateNetworkConditions();
                this.adaptLoadingStrategy();
            });
        }

        // Estimate network speed based on initial resource loading
        this.estimateNetworkSpeed();
    }

    updateNetworkConditions() {
        if ('connection' in navigator) {
            this.networkInfo = {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            };
        }
    }

    adaptLoadingStrategy() {
        const isSlowConnection = this.networkInfo?.effectiveType === 'slow-2g' ||
                               this.networkInfo?.effectiveType === '2g' ||
                               this.networkInfo?.downlink < 0.5;

        const isSaveDataEnabled = this.networkInfo?.saveData;

        if (isSlowConnection || isSaveDataEnabled) {
            this.enableDataSavingMode();
        } else {
            this.enableOptimalLoadingMode();
        }
    }

    enableDataSavingMode() {
        console.log('Enabling data saving mode for slow connection');

        // Reduce image quality
        this.optimizeImagesForLowBandwidth();

        // Defer non-critical resources
        this.deferNonCriticalResources();

        // Reduce preloading
        this.preloadQueue = this.preloadQueue.filter(resource =>
            resource.priority >= this.priorities.HIGH
        );

        // Disable prefetching
        this.options.prefetching = false;
    }

    enableOptimalLoadingMode() {
        console.log('Enabling optimal loading mode for good connection');

        this.options.preloading = true;
        this.options.prefetching = true;
        this.aggressivelyPreloadResources();
    }

    estimateNetworkSpeed() {
        const startTime = performance.now();
        const testImage = new Image();

        testImage.onload = () => {
            const endTime = performance.now();
            const loadTime = endTime - startTime;
            const estimatedSpeed = loadTime < 100 ? 'fast' :
                                 loadTime < 300 ? 'medium' : 'slow';

            this.networkSpeed = estimatedSpeed;
            console.log(`Estimated network speed: ${estimatedSpeed} (${loadTime}ms)`);
        };

        // Use a small test image
        testImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }

    // ================================
    // RESOURCE DISCOVERY & ANALYSIS
    // ================================

    setupResourceObservers() {
        // Observe new resources being added
        this.observeDOM();

        // Monitor resource performance
        this.observeResourceTiming();

        // Track resource usage
        this.observeResourceUsage();
    }

    observeDOM() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        this.analyzeNewElement(node);
                    }
                });
            });
        });

        observer.observe(document, {
            childList: true,
            subtree: true
        });

        this.domObserver = observer;
    }

    analyzeNewElement(element) {
        // Check for resources in the new element
        const resources = this.extractResourcesFromElement(element);

        resources.forEach(resource => {
            this.registerResource(resource);
            this.optimizeResource(resource);
        });
    }

    extractResourcesFromElement(element) {
        const resources = [];

        // Images
        const images = element.tagName === 'IMG' ? [element] :
                      element.querySelectorAll('img');
        images.forEach(img => {
            resources.push({
                type: 'image',
                element: img,
                url: img.src || img.dataset.src,
                priority: this.calculateResourcePriority(img),
                loading: img.loading,
                critical: this.isAboveFold(img)
            });
        });

        // Scripts
        const scripts = element.tagName === 'SCRIPT' ? [element] :
                       element.querySelectorAll('script[src]');
        scripts.forEach(script => {
            resources.push({
                type: 'script',
                element: script,
                url: script.src,
                priority: this.calculateResourcePriority(script),
                defer: script.defer,
                async: script.async,
                critical: script.dataset.critical !== undefined
            });
        });

        // Stylesheets
        const stylesheets = element.tagName === 'LINK' && element.rel === 'stylesheet' ? [element] :
                           element.querySelectorAll('link[rel="stylesheet"]');
        stylesheets.forEach(link => {
            resources.push({
                type: 'stylesheet',
                element: link,
                url: link.href,
                priority: this.calculateResourcePriority(link),
                media: link.media,
                critical: link.dataset.critical !== undefined
            });
        });

        // Videos
        const videos = element.tagName === 'VIDEO' ? [element] :
                      element.querySelectorAll('video');
        videos.forEach(video => {
            resources.push({
                type: 'video',
                element: video,
                url: video.src || video.currentSrc,
                priority: this.calculateResourcePriority(video),
                preload: video.preload,
                autoplay: video.autoplay
            });
        });

        return resources;
    }

    calculateResourcePriority(element) {
        let priority = this.priorities.MEDIUM;

        // Critical resources
        if (element.hasAttribute('data-critical') ||
            element.classList.contains('critical')) {
            priority = this.priorities.CRITICAL;
        }

        // Above-fold resources
        else if (this.isAboveFold(element)) {
            priority = this.priorities.HIGH;
        }

        // Navigation and header resources
        else if (this.isNavigationResource(element)) {
            priority = this.priorities.HIGH;
        }

        // Below-fold resources
        else if (this.isBelowFold(element)) {
            priority = this.priorities.LOW;
        }

        // Hidden or lazy resources
        else if (element.hasAttribute('data-lazy') ||
                element.loading === 'lazy') {
            priority = this.priorities.LAZY;
        }

        return priority;
    }

    isAboveFold(element) {
        const rect = element.getBoundingClientRect();
        const viewHeight = window.innerHeight || document.documentElement.clientHeight;

        return rect.top < viewHeight && rect.bottom > 0;
    }

    isBelowFold(element) {
        const rect = element.getBoundingClientRect();
        const viewHeight = window.innerHeight || document.documentElement.clientHeight;

        return rect.top > viewHeight;
    }

    isNavigationResource(element) {
        return element.closest('nav, header, .navigation') !== null ||
               element.id?.includes('nav') ||
               element.className?.includes('nav');
    }

    registerResource(resource) {
        const key = resource.url || `inline-${Date.now()}`;
        this.resources.set(key, {
            ...resource,
            registered: Date.now(),
            loadTime: null,
            size: null,
            cached: false,
            optimized: false
        });

        this.categorizeResource(resource);
    }

    categorizeResource(resource) {
        if (resource.priority >= this.priorities.CRITICAL) {
            this.preloadQueue.push(resource);
        } else if (resource.priority >= this.priorities.MEDIUM) {
            this.prefetchQueue.push(resource);
        } else if (resource.priority <= this.priorities.LAZY) {
            this.lazyQueue.push(resource);
        }
    }

    // ================================
    // RESOURCE OPTIMIZATION STRATEGIES
    // ================================

    initializeResourceStrategies() {
        // Analyze existing resources
        this.analyzeExistingResources();

        // Setup loading strategies
        this.setupPreloading();
        this.setupPrefetching();
        this.setupLazyLoading();
        this.setupResourceHints();
    }

    analyzeExistingResources() {
        // Analyze images
        document.querySelectorAll('img').forEach(img => {
            const resource = {
                type: 'image',
                element: img,
                url: img.src,
                priority: this.calculateResourcePriority(img)
            };
            this.registerResource(resource);
        });

        // Analyze scripts
        document.querySelectorAll('script[src]').forEach(script => {
            const resource = {
                type: 'script',
                element: script,
                url: script.src,
                priority: this.calculateResourcePriority(script)
            };
            this.registerResource(resource);
        });

        // Analyze stylesheets
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            const resource = {
                type: 'stylesheet',
                element: link,
                url: link.href,
                priority: this.calculateResourcePriority(link)
            };
            this.registerResource(resource);
        });
    }

    setupPreloading() {
        if (!this.options.preloading) return;

        // Sort by priority
        this.preloadQueue.sort((a, b) => b.priority - a.priority);

        // Preload critical resources
        this.preloadQueue.slice(0, 5).forEach(resource => {
            this.preloadResource(resource);
        });
    }

    preloadResource(resource) {
        if (resource.element?.hasAttribute('data-preloaded')) return;

        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.url;

        // Set appropriate 'as' attribute
        switch (resource.type) {
            case 'image':
                link.as = 'image';
                break;
            case 'script':
                link.as = 'script';
                break;
            case 'stylesheet':
                link.as = 'style';
                break;
            case 'font':
                link.as = 'font';
                link.crossOrigin = 'anonymous';
                break;
        }

        // Set priority hint if supported
        if ('fetchpriority' in link) {
            link.fetchpriority = resource.priority >= this.priorities.HIGH ? 'high' : 'low';
        }

        document.head.appendChild(link);

        if (resource.element) {
            resource.element.dataset.preloaded = 'true';
        }

        console.log(`Preloaded ${resource.type}: ${resource.url}`);
    }

    setupPrefetching() {
        if (!this.options.prefetching) return;

        // Prefetch likely-needed resources after page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.prefetchResources();
            }, 2000);
        });
    }

    prefetchResources() {
        // Prefetch next page resources
        this.prefetchNextPageResources();

        // Prefetch important assets
        this.prefetchQueue.slice(0, 3).forEach(resource => {
            this.prefetchResource(resource);
        });
    }

    prefetchNextPageResources() {
        const links = document.querySelectorAll('a[href]');
        const internalLinks = Array.from(links).filter(link =>
            link.hostname === window.location.hostname &&
            !link.href.includes('#')
        );

        // Prefetch top 3 most likely next pages
        internalLinks.slice(0, 3).forEach(link => {
            const prefetchLink = document.createElement('link');
            prefetchLink.rel = 'prefetch';
            prefetchLink.href = link.href;
            document.head.appendChild(prefetchLink);
        });
    }

    prefetchResource(resource) {
        if (resource.element?.hasAttribute('data-prefetched')) return;

        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = resource.url;

        document.head.appendChild(link);

        if (resource.element) {
            resource.element.dataset.prefetched = 'true';
        }

        console.log(`Prefetched ${resource.type}: ${resource.url}`);
    }

    setupLazyLoading() {
        if (!this.options.lazyLoading) return;

        this.setupIntersectionObserver();
        this.processLazyQueue();
    }

    setupIntersectionObserver() {
        const options = {
            rootMargin: '50px 0px',
            threshold: 0.01
        };

        this.lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadLazyResource(entry.target);
                    this.lazyObserver.unobserve(entry.target);
                }
            });
        }, options);
    }

    processLazyQueue() {
        this.lazyQueue.forEach(resource => {
            if (resource.element) {
                this.makeLazy(resource);
            }
        });
    }

    makeLazy(resource) {
        const element = resource.element;

        if (resource.type === 'image') {
            this.makeLazyImage(element);
        } else if (resource.type === 'video') {
            this.makeLazyVideo(element);
        } else if (resource.type === 'script') {
            this.makeLazyScript(element);
        }

        this.lazyObserver.observe(element);
    }

    makeLazyImage(img) {
        if (img.src && !img.dataset.src) {
            img.dataset.src = img.src;
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        }

        if (img.srcset && !img.dataset.srcset) {
            img.dataset.srcset = img.srcset;
            img.removeAttribute('srcset');
        }

        img.loading = 'lazy';
        img.classList.add('lazy');
    }

    makeLazyVideo(video) {
        video.preload = 'none';
        video.dataset.lazy = 'true';
        video.classList.add('lazy');
    }

    makeLazyScript(script) {
        if (script.src && !script.dataset.src) {
            script.dataset.src = script.src;
            script.removeAttribute('src');
            script.dataset.lazy = 'true';
        }
    }

    loadLazyResource(element) {
        if (element.tagName === 'IMG') {
            this.loadLazyImage(element);
        } else if (element.tagName === 'VIDEO') {
            this.loadLazyVideo(element);
        } else if (element.tagName === 'SCRIPT') {
            this.loadLazyScript(element);
        }
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

        img.classList.remove('lazy');
        img.classList.add('loaded');
    }

    loadLazyVideo(video) {
        video.preload = 'metadata';
        video.load();
        video.classList.remove('lazy');
        video.classList.add('loaded');
    }

    loadLazyScript(script) {
        if (script.dataset.src) {
            const newScript = document.createElement('script');
            newScript.src = script.dataset.src;
            newScript.async = true;

            script.parentNode.replaceChild(newScript, script);
        }
    }

    setupResourceHints() {
        if (!this.options.resourceHints) return;

        this.addDNSPrefetch();
        this.addPreconnect();
        this.addModulePreload();
    }

    addDNSPrefetch() {
        const domains = this.extractExternalDomains();

        domains.forEach(domain => {
            if (!document.querySelector(`link[rel="dns-prefetch"][href*="${domain}"]`)) {
                const link = document.createElement('link');
                link.rel = 'dns-prefetch';
                link.href = `//${domain}`;
                document.head.appendChild(link);
            }
        });
    }

    addPreconnect() {
        const criticalDomains = [
            'fonts.googleapis.com',
            'fonts.gstatic.com',
            'cdnjs.cloudflare.com'
        ];

        criticalDomains.forEach(domain => {
            if (!document.querySelector(`link[rel="preconnect"][href*="${domain}"]`)) {
                const link = document.createElement('link');
                link.rel = 'preconnect';
                link.href = `https://${domain}`;
                link.crossOrigin = 'anonymous';
                document.head.appendChild(link);
            }
        });
    }

    addModulePreload() {
        const moduleScripts = document.querySelectorAll('script[type="module"]');

        moduleScripts.forEach(script => {
            if (script.src && !script.dataset.preloaded) {
                const link = document.createElement('link');
                link.rel = 'modulepreload';
                link.href = script.src;
                document.head.appendChild(link);

                script.dataset.preloaded = 'true';
            }
        });
    }

    extractExternalDomains() {
        const domains = new Set();
        const resources = document.querySelectorAll('[src], [href]');

        resources.forEach(element => {
            const url = element.src || element.href;

            if (url) {
                try {
                    const urlObj = new URL(url);
                    if (urlObj.hostname !== window.location.hostname) {
                        domains.add(urlObj.hostname);
                    }
                } catch (e) {
                    // Invalid URL
                }
            }
        });

        return Array.from(domains);
    }

    // ================================
    // SERVICE WORKER CACHING
    // ================================

    setupServiceWorker() {
        if (!this.options.serviceWorkerCaching || !('serviceWorker' in navigator)) {
            return;
        }

        this.registerServiceWorker();
    }

    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw-resource-cache.js');

            registration.addEventListener('updatefound', () => {
                console.log('New service worker available');
            });

            // Send resource list to service worker
            if (registration.active) {
                this.sendResourceListToSW(registration.active);
            }

        } catch (error) {
            console.error('Service worker registration failed:', error);
        }
    }

    sendResourceListToSW(serviceWorker) {
        const resourceList = Array.from(this.resources.entries()).map(([url, resource]) => ({
            url,
            type: resource.type,
            priority: resource.priority,
            cacheStrategy: this.getCacheStrategy(resource)
        }));

        serviceWorker.postMessage({
            type: 'UPDATE_RESOURCE_LIST',
            resources: resourceList
        });
    }

    getCacheStrategy(resource) {
        if (resource.type === 'image') {
            return 'cache-first';
        } else if (resource.type === 'script' || resource.type === 'stylesheet') {
            return 'stale-while-revalidate';
        } else {
            return 'network-first';
        }
    }

    // ================================
    // PERFORMANCE MONITORING
    // ================================

    observeResourceTiming() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    this.processResourceTimingEntry(entry);
                });
            });

            observer.observe({ entryTypes: ['resource'] });
            this.resourceTimingObserver = observer;
        }
    }

    processResourceTimingEntry(entry) {
        const resource = this.resources.get(entry.name);

        if (resource) {
            resource.loadTime = entry.responseEnd - entry.startTime;
            resource.size = entry.transferSize || entry.decodedBodySize;
            resource.cached = entry.transferSize === 0 && entry.decodedBodySize > 0;

            this.updateLoadingStats(resource);
        }

        this.loadingStats.totalRequests++;

        if (entry.transferSize === 0 && entry.decodedBodySize > 0) {
            this.loadingStats.cachedRequests++;
        }

        this.loadingStats.totalBytes += entry.transferSize || 0;
    }

    updateLoadingStats(resource) {
        if (resource.cached) {
            this.loadingStats.savedBytes += resource.size || 0;
        }

        // Update average load time
        const totalLoadTime = Array.from(this.resources.values())
            .filter(r => r.loadTime)
            .reduce((sum, r) => sum + r.loadTime, 0);

        const loadedCount = Array.from(this.resources.values())
            .filter(r => r.loadTime).length;

        this.loadingStats.averageLoadTime = loadedCount > 0 ? totalLoadTime / loadedCount : 0;
    }

    observeResourceUsage() {
        // Monitor which resources are actually used
        const usageObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                if (entry.entryType === 'paint' || entry.entryType === 'navigation') {
                    this.markResourcesAsUsed();
                }
            });
        });

        try {
            usageObserver.observe({ entryTypes: ['paint', 'navigation'] });
        } catch (e) {
            // Observer not supported
        }
    }

    markResourcesAsUsed() {
        // Mark visible images as used
        document.querySelectorAll('img').forEach(img => {
            if (this.isInViewport(img)) {
                const resource = this.resources.get(img.src);
                if (resource) {
                    resource.used = true;
                }
            }
        });

        // Mark loaded scripts as used
        document.querySelectorAll('script[src]').forEach(script => {
            const resource = this.resources.get(script.src);
            if (resource) {
                resource.used = true;
            }
        });
    }

    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
        );
    }

    // ================================
    // IMAGE OPTIMIZATION
    // ================================

    optimizeImagesForLowBandwidth() {
        document.querySelectorAll('img').forEach(img => {
            if (!img.dataset.optimized) {
                this.optimizeImageElement(img);
                img.dataset.optimized = 'true';
            }
        });
    }

    optimizeImageElement(img) {
        // Add loading="lazy" if not already set
        if (!img.loading) {
            img.loading = 'lazy';
        }

        // Reduce quality for JPEG images on slow connections
        if (this.networkSpeed === 'slow' && img.src.match(/\.jpe?g$/i)) {
            this.reduceImageQuality(img);
        }

        // Add responsive images if not present
        if (!img.srcset && !img.dataset.srcset) {
            this.addResponsiveImages(img);
        }
    }

    reduceImageQuality(img) {
        // This would typically be handled server-side
        // Here we just add a parameter for quality reduction
        if (img.src && !img.src.includes('quality=')) {
            const separator = img.src.includes('?') ? '&' : '?';
            img.src += `${separator}quality=80`;
        }
    }

    addResponsiveImages(img) {
        const src = img.src;
        if (!src) return;

        // Generate responsive image URLs (server-side implementation would be better)
        const sizes = [480, 768, 1024];
        const srcset = sizes.map(size =>
            `${src}?w=${size} ${size}w`
        ).join(', ');

        img.srcset = srcset;
        img.sizes = '(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw';
    }

    // ================================
    // RESOURCE OPTIMIZATION
    // ================================

    startResourceOptimization() {
        // Start optimization after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.optimizeAllResources();
            });
        } else {
            this.optimizeAllResources();
        }
    }

    optimizeAllResources() {
        this.resources.forEach(resource => {
            this.optimizeResource(resource);
        });
    }

    optimizeResource(resource) {
        if (resource.optimized) return;

        switch (resource.type) {
            case 'image':
                this.optimizeImageResource(resource);
                break;
            case 'script':
                this.optimizeScriptResource(resource);
                break;
            case 'stylesheet':
                this.optimizeStylesheetResource(resource);
                break;
            case 'video':
                this.optimizeVideoResource(resource);
                break;
        }

        resource.optimized = true;
    }

    optimizeImageResource(resource) {
        const img = resource.element;
        if (!img) return;

        this.optimizeImageElement(img);

        // Add intersection observer for lazy loading
        if (resource.priority <= this.priorities.LOW && this.lazyObserver) {
            this.lazyObserver.observe(img);
        }
    }

    optimizeScriptResource(resource) {
        const script = resource.element;
        if (!script) return;

        // Add async/defer if not present
        if (!script.async && !script.defer) {
            if (resource.priority < this.priorities.HIGH) {
                script.defer = true;
            } else {
                script.async = true;
            }
        }
    }

    optimizeStylesheetResource(resource) {
        const link = resource.element;
        if (!link) return;

        // Non-critical stylesheets should be loaded asynchronously
        if (resource.priority < this.priorities.HIGH) {
            link.media = 'print';
            link.onload = function() {
                this.media = 'all';
            };
        }
    }

    optimizeVideoResource(resource) {
        const video = resource.element;
        if (!video) return;

        // Set preload based on priority
        if (resource.priority < this.priorities.HIGH) {
            video.preload = 'none';
        } else {
            video.preload = 'metadata';
        }
    }

    aggressivelyPreloadResources() {
        // Preload more resources on fast connections
        this.preloadQueue.slice(0, 10).forEach(resource => {
            this.preloadResource(resource);
        });
    }

    deferNonCriticalResources() {
        // Defer loading of non-critical resources
        this.resources.forEach(resource => {
            if (resource.priority < this.priorities.HIGH) {
                this.deferResource(resource);
            }
        });
    }

    deferResource(resource) {
        const element = resource.element;
        if (!element) return;

        if (resource.type === 'script') {
            element.defer = true;
        } else if (resource.type === 'stylesheet') {
            element.media = 'print';
            element.onload = function() { this.media = 'all'; };
        }
    }

    // ================================
    // PUBLIC API & REPORTING
    // ================================

    getLoadingStats() {
        return {
            ...this.loadingStats,
            cacheHitRate: this.loadingStats.totalRequests > 0 ?
                (this.loadingStats.cachedRequests / this.loadingStats.totalRequests) * 100 : 0,
            bandwidthSaved: this.loadingStats.savedBytes,
            resourceCount: this.resources.size
        };
    }

    getResourceReport() {
        const resources = Array.from(this.resources.values());

        return {
            summary: {
                total: resources.length,
                critical: resources.filter(r => r.priority >= this.priorities.CRITICAL).length,
                high: resources.filter(r => r.priority >= this.priorities.HIGH).length,
                optimized: resources.filter(r => r.optimized).length,
                cached: resources.filter(r => r.cached).length,
                unused: resources.filter(r => !r.used).length
            },
            loading: this.getLoadingStats(),
            network: this.networkInfo,
            strategies: {
                preloaded: this.preloadQueue.length,
                prefetched: this.prefetchQueue.length,
                lazy: this.lazyQueue.length
            }
        };
    }

    generateOptimizationReport() {
        return {
            performance: this.getLoadingStats(),
            resources: this.getResourceReport(),
            optimizations: {
                preloading: this.options.preloading,
                prefetching: this.options.prefetching,
                lazyLoading: this.options.lazyLoading,
                serviceWorkerCaching: this.options.serviceWorkerCaching,
                adaptiveLoading: this.options.adaptiveLoading
            },
            recommendations: this.generateRecommendations()
        };
    }

    generateRecommendations() {
        const recommendations = [];
        const stats = this.getLoadingStats();

        if (stats.cacheHitRate < 50) {
            recommendations.push({
                priority: 'high',
                category: 'Caching',
                message: 'Improve caching strategy to increase cache hit rate'
            });
        }

        if (stats.averageLoadTime > 1000) {
            recommendations.push({
                priority: 'high',
                category: 'Performance',
                message: 'Average resource load time is high, consider optimization'
            });
        }

        const unusedResources = Array.from(this.resources.values()).filter(r => !r.used).length;
        if (unusedResources > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'Efficiency',
                message: `${unusedResources} resources appear to be unused and could be removed`
            });
        }

        return recommendations;
    }

    // ================================
    // CLEANUP
    // ================================

    destroy() {
        if (this.domObserver) {
            this.domObserver.disconnect();
        }

        if (this.lazyObserver) {
            this.lazyObserver.disconnect();
        }

        if (this.resourceTimingObserver) {
            this.resourceTimingObserver.disconnect();
        }

        this.resources.clear();
        this.preloadQueue.length = 0;
        this.prefetchQueue.length = 0;
        this.lazyQueue.length = 0;
    }
}

// Initialize resource loader optimizer
const resourceLoaderOptimizer = new ResourceLoaderOptimizer({
    preloading: true,
    prefetching: true,
    lazyLoading: true,
    serviceWorkerCaching: true,
    adaptiveLoading: true,
    connectionAware: true
});

// Export for use
window.ResourceLoaderOptimizer = ResourceLoaderOptimizer;
window.resourceLoaderOptimizer = resourceLoaderOptimizer;