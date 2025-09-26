/**
 * The Profit Platform - Advanced Image Optimizer
 * WebP conversion, lazy loading, and progressive enhancement
 */

class AdvancedImageOptimizer {
    constructor(options = {}) {
        this.options = {
            // WebP conversion
            webpConversion: true,
            webpQuality: 85,
            fallbackSupport: true,

            // Lazy loading
            lazyLoading: true,
            rootMargin: '50px 0px',
            threshold: 0.01,

            // Progressive enhancement
            progressiveLoading: true,
            placeholderGeneration: true,
            blurredPlaceholders: true,

            // Responsive images
            responsiveImages: true,
            breakpoints: [480, 768, 1024, 1200, 1920],
            densityDescriptors: [1, 2],

            // Performance optimization
            preloadCritical: true,
            deferOffscreen: true,
            compressionOptimization: true,

            ...options
        };

        this.supportedFormats = {
            webp: false,
            avif: false,
            jpegXl: false
        };

        this.imageStats = {
            total: 0,
            optimized: 0,
            lazyLoaded: 0,
            webpConverted: 0,
            totalSavings: 0,
            loadingTime: 0
        };

        this.observers = new Map();
        this.imageQueue = new Map();
        this.loadedImages = new Set();

        this.init();
    }

    async init() {
        console.log('🖼️ Initializing Advanced Image Optimizer...');

        // Detect format support
        await this.detectFormatSupport();

        // Process existing images
        await this.processExistingImages();

        // Set up observers for dynamic content
        this.setupImageObservers();

        // Implement progressive loading
        if (this.options.progressiveLoading) {
            this.implementProgressiveLoading();
        }

        // Preload critical images
        if (this.options.preloadCritical) {
            this.preloadCriticalImages();
        }

        console.log('✅ Advanced Image Optimizer initialized');
        this.generateOptimizationReport();
    }

    // ================================
    // FORMAT DETECTION
    // ================================

    async detectFormatSupport() {
        console.log('🔍 Detecting image format support...');

        // Test WebP support
        this.supportedFormats.webp = await this.testImageFormat('webp');

        // Test AVIF support
        this.supportedFormats.avif = await this.testImageFormat('avif');

        // Test JPEG XL support (experimental)
        this.supportedFormats.jpegXl = await this.testImageFormat('jxl');

        console.log('📊 Format support:', this.supportedFormats);

        // Add CSS classes for format support
        document.documentElement.classList.toggle('webp', this.supportedFormats.webp);
        document.documentElement.classList.toggle('avif', this.supportedFormats.avif);
        document.documentElement.classList.toggle('jxl', this.supportedFormats.jpegXl);
    }

    async testImageFormat(format) {
        return new Promise(resolve => {
            const testImages = {
                webp: 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA',
                avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=',
                jxl: 'data:image/jxl;base64,/woIELASCAgYAFwASxLFgkWBwsKBZaKhgYGBwcFBYWFhYVChQoFBQWKhYWFhYaGBgYGBwsKBgYFBQWFhYWGhgYKBQoFBQWFhYWGBgYGBwsKBgYFBQWFhYWGhgYKBQoFBQWFhYWGBgYGBwsKBgYFBQWFhYWGhgYKBQoFBQWFhYWGBgYGBwsKBgYFBQWFhYWGhgYKBQoFBQWFhYWGBgYGBwsK'
            };

            if (!testImages[format]) {
                resolve(false);
                return;
            }

            const img = new Image();
            img.onload = () => resolve(img.width === 2 && img.height === 2);
            img.onerror = () => resolve(false);
            img.src = testImages[format];

            // Timeout after 1 second
            setTimeout(() => resolve(false), 1000);
        });
    }

    // ================================
    // IMAGE PROCESSING
    // ================================

    async processExistingImages() {
        const images = document.querySelectorAll('img');
        this.imageStats.total = images.length;

        console.log(`📸 Processing ${images.length} images...`);

        for (const img of images) {
            await this.optimizeImage(img);
        }

        console.log(`✅ Processed ${this.imageStats.optimized} images`);
    }

    async optimizeImage(img) {
        // Skip if already optimized
        if (img.dataset.optimized) return;

        const startTime = performance.now();

        try {
            // Generate optimized versions
            if (this.options.webpConversion) {
                await this.convertToModernFormats(img);
            }

            // Implement responsive images
            if (this.options.responsiveImages) {
                this.createResponsiveImage(img);
            }

            // Set up lazy loading
            if (this.options.lazyLoading && this.shouldLazyLoad(img)) {
                this.setupLazyLoading(img);
            }

            // Add progressive loading
            if (this.options.progressiveLoading) {
                this.addProgressiveLoading(img);
            }

            img.dataset.optimized = 'true';
            this.imageStats.optimized++;

            // Track performance
            const optimizationTime = performance.now() - startTime;
            this.imageStats.loadingTime += optimizationTime;

        } catch (error) {
            console.warn('Failed to optimize image:', img.src, error);
        }
    }

    async convertToModernFormats(img) {
        const originalSrc = img.src;
        if (!originalSrc || originalSrc.startsWith('data:')) return;

        const modernFormats = this.getOptimalFormats(originalSrc);
        if (modernFormats.length === 0) return;

        // Create picture element for format fallback
        const picture = this.createPictureElement(img, modernFormats, originalSrc);

        // Replace img with picture element
        img.parentNode.replaceChild(picture, img);

        this.imageStats.webpConverted++;
    }

    getOptimalFormats(src) {
        const formats = [];

        // Add supported modern formats in order of preference
        if (this.supportedFormats.avif) {
            formats.push({
                format: 'avif',
                src: this.getFormatVersion(src, 'avif'),
                type: 'image/avif'
            });
        }

        if (this.supportedFormats.webp) {
            formats.push({
                format: 'webp',
                src: this.getFormatVersion(src, 'webp'),
                type: 'image/webp'
            });
        }

        return formats;
    }

    getFormatVersion(src, format) {
        // Convert file extension
        return src.replace(/\.(jpg|jpeg|png)$/i, `.${format}`);
    }

    createPictureElement(originalImg, modernFormats, fallbackSrc) {
        const picture = document.createElement('picture');

        // Add modern format sources
        modernFormats.forEach(({ src, type }) => {
            const source = document.createElement('source');
            source.type = type;
            source.srcset = src;

            // Add responsive srcset if needed
            if (this.options.responsiveImages) {
                source.srcset = this.generateResponsiveSrcSet(src);
                source.sizes = this.generateSizes(originalImg);
            }

            picture.appendChild(source);
        });

        // Clone original img as fallback
        const fallbackImg = originalImg.cloneNode(true);
        fallbackImg.src = fallbackSrc;

        // Add responsive attributes to fallback
        if (this.options.responsiveImages) {
            fallbackImg.srcset = this.generateResponsiveSrcSet(fallbackSrc);
            fallbackImg.sizes = this.generateSizes(originalImg);
        }

        picture.appendChild(fallbackImg);

        // Copy picture-level attributes
        if (originalImg.alt) picture.setAttribute('alt', originalImg.alt);
        if (originalImg.className) picture.className = originalImg.className;

        return picture;
    }

    // ================================
    // RESPONSIVE IMAGES
    // ================================

    createResponsiveImage(img) {
        if (!img.src || img.srcset) return; // Already responsive or no src

        const responsiveSrcSet = this.generateResponsiveSrcSet(img.src);
        const sizes = this.generateSizes(img);

        if (responsiveSrcSet) {
            img.srcset = responsiveSrcSet;
            img.sizes = sizes;
        }
    }

    generateResponsiveSrcSet(baseSrc) {
        if (!baseSrc || baseSrc.startsWith('data:')) return '';

        const srcsetEntries = [];

        // Generate width-based descriptors
        this.options.breakpoints.forEach(width => {
            const responsiveSrc = this.getResponsiveVersion(baseSrc, width);
            srcsetEntries.push(`${responsiveSrc} ${width}w`);
        });

        // Generate density-based descriptors for smaller images
        this.options.densityDescriptors.forEach(density => {
            if (density > 1) {
                const densitySrc = this.getDensityVersion(baseSrc, density);
                srcsetEntries.push(`${densitySrc} ${density}x`);
            }
        });

        return srcsetEntries.join(', ');
    }

    getResponsiveVersion(src, width) {
        // Convention: image-name-{width}.ext
        const lastDotIndex = src.lastIndexOf('.');
        if (lastDotIndex === -1) return src;

        return src.slice(0, lastDotIndex) + `-${width}` + src.slice(lastDotIndex);
    }

    getDensityVersion(src, density) {
        // Convention: image-name@{density}x.ext
        const lastDotIndex = src.lastIndexOf('.');
        if (lastDotIndex === -1) return src;

        return src.slice(0, lastDotIndex) + `@${density}x` + src.slice(lastDotIndex);
    }

    generateSizes(img) {
        // Analyze image context to generate appropriate sizes
        const computedStyle = window.getComputedStyle(img);
        const maxWidth = computedStyle.maxWidth;

        // Default sizes based on common patterns
        if (img.closest('.hero, .banner')) {
            return '100vw';
        }

        if (img.closest('.grid, .gallery')) {
            return '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw';
        }

        if (img.closest('.sidebar, .aside')) {
            return '(max-width: 768px) 100vw, 300px';
        }

        // Default responsive sizes
        return '(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw';
    }

    // ================================
    // LAZY LOADING
    // ================================

    setupImageObservers() {
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported, skipping lazy loading');
            return;
        }

        // Create intersection observer for lazy loading
        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadLazyImage(entry.target);
                    lazyObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: this.options.rootMargin,
            threshold: this.options.threshold
        });

        this.observers.set('lazy', lazyObserver);

        // Observer for dynamic image loading
        const dynamicObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const images = node.tagName === 'IMG' ?
                                      [node] :
                                      node.querySelectorAll('img');

                        images.forEach(img => this.optimizeImage(img));
                    }
                });
            });
        });

        dynamicObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.observers.set('dynamic', dynamicObserver);
    }

    shouldLazyLoad(img) {
        // Don't lazy load if explicitly disabled
        if (img.dataset.noLazy) return false;

        // Don't lazy load critical images
        if (img.closest('[data-critical]')) return false;

        // Check if image is above the fold
        const rect = img.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        return rect.top > viewportHeight;
    }

    setupLazyLoading(img) {
        // Store original sources
        if (img.src) {
            img.dataset.src = img.src;
            img.src = this.generatePlaceholder(img);
        }

        if (img.srcset) {
            img.dataset.srcset = img.srcset;
            img.removeAttribute('srcset');
        }

        // Handle picture elements
        const picture = img.closest('picture');
        if (picture) {
            const sources = picture.querySelectorAll('source');
            sources.forEach(source => {
                if (source.srcset) {
                    source.dataset.srcset = source.srcset;
                    source.removeAttribute('srcset');
                }
            });
        }

        // Add to lazy loading queue
        const lazyObserver = this.observers.get('lazy');
        if (lazyObserver) {
            lazyObserver.observe(img);
        }

        img.classList.add('lazy-image');
        this.imageStats.lazyLoaded++;
    }

    loadLazyImage(img) {
        if (this.loadedImages.has(img)) return;

        // Restore original sources
        if (img.dataset.src) {
            img.src = img.dataset.src;
            delete img.dataset.src;
        }

        if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            delete img.dataset.srcset;
        }

        // Handle picture elements
        const picture = img.closest('picture');
        if (picture) {
            const sources = picture.querySelectorAll('source');
            sources.forEach(source => {
                if (source.dataset.srcset) {
                    source.srcset = source.dataset.srcset;
                    delete source.dataset.srcset;
                }
            });
        }

        // Add loading animation
        img.classList.add('lazy-loading');

        // Handle load completion
        const handleLoad = () => {
            img.classList.remove('lazy-loading', 'lazy-image');
            img.classList.add('lazy-loaded');
            this.loadedImages.add(img);

            // Clean up event listeners
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
        };

        const handleError = () => {
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-error');

            // Fallback to placeholder or error image
            img.src = this.generateErrorPlaceholder(img);

            // Clean up event listeners
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
        };

        img.addEventListener('load', handleLoad);
        img.addEventListener('error', handleError);
    }

    generatePlaceholder(img) {
        if (!this.options.placeholderGeneration) {
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
        }

        const width = img.getAttribute('width') || img.width || 300;
        const height = img.getAttribute('height') || img.height || 200;

        if (this.options.blurredPlaceholders && img.dataset.placeholder) {
            return img.dataset.placeholder;
        }

        // Generate SVG placeholder
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                <defs>
                    <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#f0f0f0;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#e0e0e0;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#f0f0f0;stop-opacity:1" />
                        <animateTransform attributeName="gradientTransform" type="translate"
                                          values="-${width} 0;${width} 0;-${width} 0" dur="2s" repeatCount="indefinite"/>
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#shimmer)" />
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-size="14" font-family="Arial, sans-serif">
                    Loading...
                </text>
            </svg>
        `;

        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }

    generateErrorPlaceholder(img) {
        const width = img.getAttribute('width') || img.width || 300;
        const height = img.getAttribute('height') || img.height || 200;

        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                <rect width="100%" height="100%" fill="#f5f5f5" stroke="#ddd" stroke-width="1"/>
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-size="14" font-family="Arial, sans-serif">
                    Image not available
                </text>
            </svg>
        `;

        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }

    // ================================
    // PROGRESSIVE LOADING
    // ================================

    implementProgressiveLoading() {
        const images = document.querySelectorAll('img[data-progressive]');

        images.forEach(img => {
            this.addProgressiveLoading(img);
        });
    }

    addProgressiveLoading(img) {
        const lowQualitySrc = img.dataset.lowQuality || img.dataset.placeholder;
        if (!lowQualitySrc) return;

        const originalSrc = img.src || img.dataset.src;
        if (!originalSrc) return;

        // Load low quality version first
        img.src = lowQualitySrc;
        img.classList.add('progressive-loading');

        // Create high quality image
        const highQualityImg = new Image();

        const loadHighQuality = () => {
            highQualityImg.onload = () => {
                // Create smooth transition
                img.style.transition = 'filter 0.3s ease';
                img.style.filter = 'blur(5px)';

                setTimeout(() => {
                    img.src = originalSrc;
                    img.style.filter = '';
                    img.classList.remove('progressive-loading');
                    img.classList.add('progressive-loaded');
                }, 50);
            };

            highQualityImg.onerror = () => {
                img.classList.remove('progressive-loading');
                img.classList.add('progressive-error');
            };

            highQualityImg.src = originalSrc;
        };

        // Load high quality version when image is near viewport
        if ('IntersectionObserver' in window) {
            const progressiveObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        loadHighQuality();
                        progressiveObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '100px 0px',
                threshold: 0.01
            });

            progressiveObserver.observe(img);
        } else {
            // Fallback for browsers without IntersectionObserver
            loadHighQuality();
        }
    }

    // ================================
    // CRITICAL IMAGE PRELOADING
    // ================================

    preloadCriticalImages() {
        const criticalImages = document.querySelectorAll('img[data-critical], .hero img, .banner img');

        console.log(`⚡ Preloading ${criticalImages.length} critical images...`);

        criticalImages.forEach(img => {
            this.preloadImage(img.src || img.dataset.src);

            // Preload responsive versions
            if (img.srcset || img.dataset.srcset) {
                this.preloadResponsiveImages(img.srcset || img.dataset.srcset);
            }
        });
    }

    preloadImage(src) {
        if (!src || src.startsWith('data:')) return;

        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;

        // Add to head
        document.head.appendChild(link);

        console.log(`⚡ Preloaded: ${src}`);
    }

    preloadResponsiveImages(srcset) {
        if (!srcset) return;

        // Parse srcset and preload the most appropriate image
        const sources = srcset.split(',').map(s => s.trim().split(' '));
        const viewport = window.innerWidth;

        // Find best match for current viewport
        let bestSrc = sources[0]?.[0];
        let closestWidth = Infinity;

        sources.forEach(([src, descriptor]) => {
            if (descriptor && descriptor.endsWith('w')) {
                const width = parseInt(descriptor);
                if (width >= viewport && width < closestWidth) {
                    closestWidth = width;
                    bestSrc = src;
                }
            }
        });

        if (bestSrc) {
            this.preloadImage(bestSrc);
        }
    }

    // ================================
    // PERFORMANCE MONITORING
    // ================================

    generateOptimizationReport() {
        const savings = this.calculateSavings();

        const report = {
            timestamp: Date.now(),
            totalImages: this.imageStats.total,
            optimizedImages: this.imageStats.optimized,
            lazyLoadedImages: this.imageStats.lazyLoaded,
            webpConverted: this.imageStats.webpConverted,
            estimatedSavings: savings,
            optimizationTime: this.imageStats.loadingTime,
            formatSupport: this.supportedFormats,
            recommendations: this.generateRecommendations()
        };

        console.log('📊 Image Optimization Report:', report);

        // Report to analytics
        if (typeof gtag === 'function') {
            gtag('event', 'image_optimization', {
                event_category: 'Performance',
                custom_parameters: {
                    images_optimized: this.imageStats.optimized,
                    webp_converted: this.imageStats.webpConverted,
                    lazy_loaded: this.imageStats.lazyLoaded
                }
            });
        }

        return report;
    }

    calculateSavings() {
        // Estimate savings based on format conversion
        let estimatedSavings = 0;

        if (this.supportedFormats.webp) {
            // WebP typically saves 25-35% compared to JPEG
            estimatedSavings += this.imageStats.webpConverted * 0.30;
        }

        if (this.supportedFormats.avif) {
            // AVIF typically saves 40-50% compared to JPEG
            estimatedSavings += this.imageStats.webpConverted * 0.45;
        }

        // Lazy loading saves initial bandwidth
        estimatedSavings += this.imageStats.lazyLoaded * 0.15;

        return Math.round(estimatedSavings * 100);
    }

    generateRecommendations() {
        const recommendations = [];

        if (this.imageStats.optimized < this.imageStats.total) {
            recommendations.push({
                type: 'optimization',
                priority: 'high',
                message: `${this.imageStats.total - this.imageStats.optimized} images could be optimized`
            });
        }

        if (!this.supportedFormats.webp) {
            recommendations.push({
                type: 'format',
                priority: 'low',
                message: 'Browser does not support WebP format'
            });
        }

        if (this.imageStats.lazyLoaded === 0 && this.imageStats.total > 5) {
            recommendations.push({
                type: 'loading',
                priority: 'medium',
                message: 'Consider implementing lazy loading for better performance'
            });
        }

        return recommendations;
    }

    // ================================
    // PUBLIC API
    // ================================

    getStats() {
        return { ...this.imageStats };
    }

    getFormatSupport() {
        return { ...this.supportedFormats };
    }

    async optimizeNewImage(img) {
        return this.optimizeImage(img);
    }

    preloadImages(urls) {
        urls.forEach(url => this.preloadImage(url));
    }

    // ================================
    // CLEANUP
    // ================================

    destroy() {
        console.log('🧹 Cleaning up Advanced Image Optimizer...');

        // Disconnect observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();

        // Clear caches
        this.imageQueue.clear();
        this.loadedImages.clear();
    }
}

// Initialize the Advanced Image Optimizer
const imageOptimizer = new AdvancedImageOptimizer({
    webpConversion: true,
    lazyLoading: true,
    progressiveLoading: true,
    responsiveImages: true,
    preloadCritical: true,
    compressionOptimization: true
});

// Export for global use
window.AdvancedImageOptimizer = AdvancedImageOptimizer;
window.imageOptimizer = imageOptimizer;

// Auto-optimize images added dynamically
if (typeof MutationObserver !== 'undefined') {
    const imageWatcher = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const images = node.tagName === 'IMG' ?
                                  [node] :
                                  Array.from(node.querySelectorAll('img'));

                    images.forEach(img => {
                        if (!img.dataset.optimized) {
                            imageOptimizer.optimizeNewImage(img);
                        }
                    });
                }
            });
        });
    });

    imageWatcher.observe(document.body, {
        childList: true,
        subtree: true
    });
}

console.log('🖼️ Advanced Image Optimizer initialized');