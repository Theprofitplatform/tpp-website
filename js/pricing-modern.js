/**
 * Modern Pricing Page Enhanced Interactions
 * Advanced animations, performance optimized, accessibility focused
 */

class ModernPricingEnhancer {
    constructor() {
        this.isInitialized = false;
        this.observers = new Map();
        this.animations = new Map();
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        if (this.isInitialized) return;

        this.initAdvancedAnimations();
        this.initParticleSystem();
        this.initSmartPreloading();
        this.initAccessibilityEnhancements();
        this.initConversionOptimizations();
        this.initPerformanceMonitoring();

        this.isInitialized = true;
        console.log('🚀 Modern pricing enhancer initialized');
    }

    // Advanced Animation System
    initAdvancedAnimations() {
        if (this.isReducedMotion) {
            console.log('⚡ Reduced motion detected - using minimal animations');
            return;
        }

        // Enhanced AOS initialization
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1200,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                once: true,
                offset: 100,
                delay: 0,
                anchorPlacement: 'top-bottom',
                disable: function() {
                    return window.innerWidth < 768;
                }
            });
        }

        // Intersection Observer for advanced scroll animations
        this.initScrollAnimations();

        // Enhanced card interactions
        this.initCardAnimations();

        // Hero parallax and morphing effects
        this.initHeroEffects();
    }

    initScrollAnimations() {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerScrollAnimation(entry.target, entry.intersectionRatio);
                }
            });
        }, {
            threshold: [0.1, 0.3, 0.5, 0.7, 0.9],
            rootMargin: '0px 0px -100px 0px'
        });

        // Observe elements for advanced animations
        document.querySelectorAll('.pricing-card, .trust-indicator, .social-stat').forEach(el => {
            animationObserver.observe(el);
        });

        this.observers.set('scroll', animationObserver);
    }

    triggerScrollAnimation(element, ratio) {
        if (element.classList.contains('pricing-card')) {
            this.animatePricingCard(element, ratio);
        } else if (element.classList.contains('trust-indicator')) {
            this.animateTrustIndicator(element, ratio);
        } else if (element.classList.contains('social-stat')) {
            this.animateSocialStat(element, ratio);
        }
    }

    animatePricingCard(card, ratio) {
        if (ratio > 0.5 && !card.dataset.animated) {
            card.dataset.animated = 'true';

            // Staggered feature list animation
            const features = card.querySelectorAll('.pricing-features li');
            features.forEach((feature, index) => {
                setTimeout(() => {
                    feature.style.opacity = '1';
                    feature.style.transform = 'translateX(0)';
                    feature.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                }, index * 100);
            });

            // Price animation
            const price = card.querySelector('.pricing-amount');
            if (price) {
                this.animateCountUp(price);
            }
        }
    }

    animateTrustIndicator(indicator, ratio) {
        if (ratio > 0.3) {
            indicator.style.transform = 'scale(1) translateY(0)';
            indicator.style.opacity = '1';
            indicator.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        }
    }

    animateSocialStat(stat, ratio) {
        if (ratio > 0.5) {
            const number = stat.querySelector('.stat-number');
            if (number && !stat.dataset.animated) {
                stat.dataset.animated = 'true';
                this.animateCountUp(number);
            }
        }
    }

    animateCountUp(element) {
        const target = parseInt(element.textContent.replace(/[^0-9]/g, ''));
        const duration = 2000;
        const start = Date.now();
        const originalText = element.textContent;

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - start) / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(target * easeOutQuart);

            element.textContent = originalText.replace(/[0-9,]+/, current.toLocaleString());

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    initCardAnimations() {
        document.querySelectorAll('.pricing-card').forEach(card => {
            // Enhanced hover effects
            card.addEventListener('mouseenter', (e) => this.onCardHover(e, true));
            card.addEventListener('mouseleave', (e) => this.onCardHover(e, false));

            // Click ripple effect
            card.addEventListener('click', (e) => this.createRippleEffect(e));

            // Focus management for accessibility
            card.addEventListener('focus', (e) => this.onCardFocus(e, true));
            card.addEventListener('blur', (e) => this.onCardFocus(e, false));
        });
    }

    onCardHover(event, isEntering) {
        const card = event.currentTarget;
        const icon = card.querySelector('.pricing-icon');
        const features = card.querySelectorAll('.pricing-features li');

        if (isEntering) {
            // 3D tilt effect
            card.addEventListener('mousemove', this.handleCardTilt);

            // Icon animation
            if (icon) {
                icon.style.transform = 'scale(1.1) rotateY(15deg)';
                icon.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            }

            // Features slide animation
            features.forEach((feature, index) => {
                setTimeout(() => {
                    feature.style.transform = 'translateX(8px)';
                    feature.style.transition = 'transform 0.3s ease-out';
                }, index * 50);
            });

        } else {
            card.removeEventListener('mousemove', this.handleCardTilt);
            card.style.transform = '';

            if (icon) {
                icon.style.transform = '';
            }

            features.forEach(feature => {
                feature.style.transform = '';
            });
        }
    }

    handleCardTilt = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
        card.style.transition = 'transform 0.1s ease-out';
    }

    createRippleEffect(event) {
        const card = event.currentTarget;
        const ripple = document.createElement('div');
        const rect = card.getBoundingClientRect();

        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';

        ripple.className = 'ripple-effect';
        card.style.position = 'relative';
        card.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    onCardFocus(event, isFocused) {
        const card = event.currentTarget;
        if (isFocused) {
            card.style.outline = '3px solid var(--primary-500)';
            card.style.outlineOffset = '4px';
            card.style.zIndex = '10';
        } else {
            card.style.outline = '';
            card.style.outlineOffset = '';
            card.style.zIndex = '';
        }
    }

    initHeroEffects() {
        const hero = document.querySelector('.hero-modern');
        if (!hero) return;

        // Parallax scrolling
        const parallaxElements = hero.querySelectorAll('.hero-mesh, .floating-element');

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;

            parallaxElements.forEach((element, index) => {
                const speed = 0.3 + (index * 0.1);
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });

        // Mouse-following gradient effect
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            hero.style.background = `
                radial-gradient(circle at ${x}% ${y}%, rgba(102, 126, 234, 0.3) 0%, transparent 50%),
                var(--gradient-primary)
            `;
        });
    }

    // Particle System
    initParticleSystem() {
        if (this.isReducedMotion) return;

        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        `;

        document.body.appendChild(particleContainer);

        // Create floating particles
        this.createParticles(particleContainer, 50);

        // Performance-optimized animation loop
        this.startParticleAnimation(particleContainer);
    }

    createParticles(container, count) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 1}px;
                height: ${Math.random() * 4 + 1}px;
                background: rgba(102, 126, 234, ${Math.random() * 0.5 + 0.1});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                animation: particle-float ${Math.random() * 20 + 10}s linear infinite;
                animation-delay: ${Math.random() * 20}s;
            `;
            container.appendChild(particle);
        }
    }

    startParticleAnimation(container) {
        let lastTime = 0;
        const particles = container.querySelectorAll('.particle');

        const animate = (currentTime) => {
            if (currentTime - lastTime >= 16) { // 60fps throttle
                particles.forEach(particle => {
                    if (Math.random() < 0.01) {
                        particle.style.opacity = Math.random() * 0.5 + 0.1;
                    }
                });
                lastTime = currentTime;
            }
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    // Smart Preloading
    initSmartPreloading() {
        // Preload critical assets
        const criticalImages = [
            'images/logo.png',
            'images/hero-bg.jpg'
        ];

        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });

        // Intersection Observer for lazy loading
        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        lazyObserver.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            lazyObserver.observe(img);
        });

        this.observers.set('lazy', lazyObserver);

        // Prefetch contact page on CTA hover
        document.querySelectorAll('.pricing-cta').forEach(cta => {
            cta.addEventListener('mouseenter', () => {
                if (!cta.dataset.prefetched) {
                    const link = document.createElement('link');
                    link.rel = 'prefetch';
                    link.href = '/contact';
                    document.head.appendChild(link);
                    cta.dataset.prefetched = 'true';
                }
            });
        });
    }

    // Accessibility Enhancements
    initAccessibilityEnhancements() {
        // Enhanced keyboard navigation
        this.setupKeyboardNavigation();

        // ARIA enhancements
        this.enhanceARIA();

        // Screen reader optimizations
        this.optimizeScreenReader();

        // Focus management
        this.manageFocus();
    }

    setupKeyboardNavigation() {
        const cards = document.querySelectorAll('.pricing-card');
        let currentIndex = 0;

        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.pricing-card')) {
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        currentIndex = Math.max(0, currentIndex - 1);
                        cards[currentIndex].focus();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        currentIndex = Math.min(cards.length - 1, currentIndex + 1);
                        cards[currentIndex].focus();
                        break;
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        const cta = cards[currentIndex].querySelector('.pricing-cta');
                        if (cta) cta.click();
                        break;
                }
            }
        });

        // Make cards focusable
        cards.forEach((card, index) => {
            card.setAttribute('tabindex', index === 0 ? '0' : '-1');
            card.setAttribute('role', 'article');

            card.addEventListener('focus', () => {
                currentIndex = index;
                cards.forEach(c => c.setAttribute('tabindex', '-1'));
                card.setAttribute('tabindex', '0');
            });
        });
    }

    enhanceARIA() {
        // Add ARIA labels to pricing cards
        document.querySelectorAll('.pricing-card').forEach(card => {
            const title = card.querySelector('.pricing-title')?.textContent;
            const price = card.querySelector('.pricing-amount')?.textContent;
            const period = card.querySelector('.pricing-period')?.textContent;

            if (title && price) {
                card.setAttribute('aria-label', `${title} package for ${price} ${period || 'per month'}`);
            }
        });

        // Enhance button accessibility
        document.querySelectorAll('.pricing-cta').forEach(button => {
            if (!button.getAttribute('aria-label')) {
                const card = button.closest('.pricing-card');
                const title = card?.querySelector('.pricing-title')?.textContent;
                button.setAttribute('aria-label', `Get started with ${title || 'this'} package`);
            }
        });
    }

    optimizeScreenReader() {
        // Add screen reader only content for better context
        const srOnlyStyle = `
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        `;

        document.querySelectorAll('.pricing-card').forEach((card, index) => {
            const srOnly = document.createElement('span');
            srOnly.style.cssText = srOnlyStyle;
            srOnly.textContent = `Pricing option ${index + 1} of ${document.querySelectorAll('.pricing-card').length}`;
            card.insertBefore(srOnly, card.firstChild);
        });
    }

    manageFocus() {
        // Trap focus in modals/overlays when they appear
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal:not([style*="display: none"])');
                if (modal) {
                    const focusableElements = modal.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );

                    if (focusableElements.length > 0) {
                        const firstElement = focusableElements[0];
                        const lastElement = focusableElements[focusableElements.length - 1];

                        if (e.shiftKey && document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        } else if (!e.shiftKey && document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            }
        });
    }

    // Conversion Optimizations
    initConversionOptimizations() {
        // Advanced analytics tracking
        this.setupAdvancedTracking();

        // A/B testing framework
        this.initABTesting();

        // Social proof animations
        this.animateSocialProof();

        // Urgency indicators
        this.addUrgencyIndicators();
    }

    setupAdvancedTracking() {
        // Track micro-interactions
        document.querySelectorAll('.pricing-card').forEach((card, index) => {
            let hoverTime = 0;
            let hoverStart = 0;

            card.addEventListener('mouseenter', () => {
                hoverStart = Date.now();
            });

            card.addEventListener('mouseleave', () => {
                hoverTime += Date.now() - hoverStart;

                // Track engagement
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'pricing_card_engagement', {
                        card_index: index,
                        hover_time: hoverTime,
                        engagement_level: hoverTime > 3000 ? 'high' : hoverTime > 1000 ? 'medium' : 'low'
                    });
                }
            });
        });

        // Track scroll depth
        const scrollMilestones = [25, 50, 75, 100];
        let trackedMilestones = [];

        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            scrollMilestones.forEach(milestone => {
                if (scrollPercent >= milestone && !trackedMilestones.includes(milestone)) {
                    trackedMilestones.push(milestone);

                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'scroll_depth', {
                            percent: milestone
                        });
                    }
                }
            });
        });
    }

    initABTesting() {
        // Simple A/B testing framework
        const testVariant = Math.random() > 0.5 ? 'A' : 'B';

        if (testVariant === 'B') {
            // Variant B: Different CTA text
            document.querySelectorAll('.pricing-cta').forEach(cta => {
                if (cta.textContent.includes('Get Started')) {
                    cta.textContent = cta.textContent.replace('Get Started', 'Start Growing');
                }
            });
        }

        // Track which variant user sees
        if (typeof gtag !== 'undefined') {
            gtag('event', 'ab_test_variant', {
                variant: testVariant
            });
        }
    }

    animateSocialProof() {
        const socialStats = document.querySelectorAll('.social-stat');

        socialStats.forEach((stat, index) => {
            setTimeout(() => {
                stat.style.opacity = '1';
                stat.style.transform = 'translateY(0) scale(1)';
                stat.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            }, index * 200);
        });
    }

    addUrgencyIndicators() {
        // Add subtle urgency indicators
        const urgencyText = document.createElement('div');
        urgencyText.className = 'urgency-indicator';
        urgencyText.innerHTML = '⚡ Limited time offer - 30% off first month';
        urgencyText.style.cssText = `
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
            text-align: center;
            animation: pulse 2s infinite;
        `;

        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.appendChild(urgencyText);
        }
    }

    // Performance Monitoring
    initPerformanceMonitoring() {
        // Monitor Core Web Vitals
        this.monitorWebVitals();

        // Performance budget monitoring
        this.monitorResourceUsage();

        // Error tracking
        this.setupErrorTracking();
    }

    monitorWebVitals() {
        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
        }).observe({entryTypes: ['largest-contentful-paint']});

        // First Input Delay
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                console.log('FID:', entry.processingStart - entry.startTime);
            });
        }).observe({entryTypes: ['first-input']});

        // Cumulative Layout Shift
        new PerformanceObserver((entryList) => {
            let clsValue = 0;
            entryList.getEntries().forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });
            console.log('CLS:', clsValue);
        }).observe({entryTypes: ['layout-shift']});
    }

    monitorResourceUsage() {
        // Memory usage monitoring
        if ('memory' in performance) {
            const memoryInfo = performance.memory;
            console.log('Memory usage:', {
                used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) + ' MB',
                total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024) + ' MB'
            });
        }

        // Frame rate monitoring
        let frameCount = 0;
        let lastTime = performance.now();

        const countFrames = () => {
            frameCount++;
            const now = performance.now();

            if (now - lastTime >= 1000) {
                console.log('FPS:', frameCount);
                frameCount = 0;
                lastTime = now;
            }

            requestAnimationFrame(countFrames);
        };

        requestAnimationFrame(countFrames);
    }

    setupErrorTracking() {
        window.addEventListener('error', (event) => {
            console.error('JavaScript error:', event.error);

            if (typeof gtag !== 'undefined') {
                gtag('event', 'exception', {
                    description: event.error.message,
                    fatal: false
                });
            }
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);

            if (typeof gtag !== 'undefined') {
                gtag('event', 'exception', {
                    description: event.reason,
                    fatal: false
                });
            }
        });
    }

    // Cleanup method
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.animations.forEach(animation => animation.cancel());
        console.log('🧹 Modern pricing enhancer cleaned up');
    }
}

// Initialize the enhancer
const modernPricingEnhancer = new ModernPricingEnhancer();

// Add additional CSS for enhanced effects
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(102, 126, 234, 0.3);
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    }

    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }

    .pricing-features li {
        opacity: 0;
        transform: translateX(-20px);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .pricing-card[data-animated="true"] .pricing-features li {
        opacity: 1;
        transform: translateX(0);
    }

    .trust-indicator {
        opacity: 0;
        transform: scale(0.8) translateY(20px);
    }

    .social-stat {
        opacity: 0;
        transform: translateY(30px) scale(0.9);
    }

    /* High performance GPU acceleration */
    .pricing-card,
    .floating-element,
    .particle {
        will-change: transform;
        transform: translateZ(0);
    }

    /* Focus styles for accessibility */
    .pricing-card:focus {
        outline: 3px solid var(--primary-500);
        outline-offset: 4px;
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
        .pricing-card,
        .floating-element,
        .particle,
        .hero-mesh {
            animation: none !important;
            transition: none !important;
        }
    }
`;

document.head.appendChild(enhancedStyles);

console.log('✨ Modern pricing page enhancements loaded');