/**
 * Enhanced Pricing Page JavaScript
 * Optimized by Claude Flow Swarm
 */

class PricingPageEnhancer {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM and ensure AOS is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        this.initAOSEnhanced();
        this.initPricingCardInteractions();
        this.initScrollEffects();
        this.initPerformanceOptimizations();
        this.initConversionTracking();
        this.initAccessibilityEnhancements();
    }

    // Enhanced AOS initialization with performance optimizations
    initAOSEnhanced() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-out-cubic',
                once: true,
                offset: 120,
                delay: 0,
                throttleDelay: 99,
                debounceDelay: 50,
                disable: function() {
                    // Disable on mobile devices for performance
                    return window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                }
            });
            console.log('✨ Enhanced AOS animations initialized');
        }
    }

    // Enhanced pricing card interactions
    initPricingCardInteractions() {
        const cards = document.querySelectorAll('.pricing-card-enhanced');

        cards.forEach((card, index) => {
            // Add staggered hover effects
            card.addEventListener('mouseenter', (e) => {
                this.animateCard(e.target, 'hover');
                // Subtle parallax effect for non-featured cards
                if (!card.classList.contains('featured')) {
                    this.addParallaxEffect(card);
                }
            });

            card.addEventListener('mouseleave', (e) => {
                this.animateCard(e.target, 'leave');
                this.removeParallaxEffect(card);
            });

            // Add click ripple effect
            card.addEventListener('click', (e) => {
                if (!e.target.closest('a')) {
                    this.createRippleEffect(e);
                }
            });

            // Enhanced CTA button interactions
            const ctaButton = card.querySelector('.btn-pricing-enhanced');
            if (ctaButton) {
                ctaButton.addEventListener('mouseenter', () => {
                    this.animateButton(ctaButton, 'hover');
                });

                ctaButton.addEventListener('mouseleave', () => {
                    this.animateButton(ctaButton, 'leave');
                });
            }
        });
    }

    animateCard(card, state) {
        const icon = card.querySelector('.pricing-icon');
        const features = card.querySelectorAll('.pricing-features-enhanced li');

        if (state === 'hover') {
            // Animate icon rotation
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
                icon.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            }

            // Stagger feature animations
            features.forEach((feature, index) => {
                setTimeout(() => {
                    feature.style.transform = 'translateX(8px)';
                    feature.style.transition = 'transform 0.2s ease-out';
                }, index * 50);
            });
        } else {
            // Reset animations
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }

            features.forEach(feature => {
                feature.style.transform = 'translateX(0)';
            });
        }
    }

    animateButton(button, state) {
        const arrow = button.querySelector('svg:last-child');
        if (arrow && state === 'hover') {
            arrow.style.transform = 'translateX(4px)';
            arrow.style.transition = 'transform 0.2s ease-out';
        } else if (arrow) {
            arrow.style.transform = 'translateX(0)';
        }
    }

    createRippleEffect(event) {
        const card = event.currentTarget;
        const ripple = document.createElement('div');
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(59, 130, 246, 0.1)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s ease-out';
        ripple.style.pointerEvents = 'none';

        card.style.position = 'relative';
        card.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    addParallaxEffect(card) {
        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
        };

        card.addEventListener('mousemove', handleMouseMove);
        card._handleMouseMove = handleMouseMove;
    }

    removeParallaxEffect(card) {
        if (card._handleMouseMove) {
            card.removeEventListener('mousemove', card._handleMouseMove);
            card.style.transform = '';
        }
    }

    // Advanced scroll effects
    initScrollEffects() {
        // Intersection Observer for performance-optimized scroll animations
        const observerOptions = {
            threshold: [0.1, 0.5, 0.9],
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.handleElementInView(entry.target, entry.intersectionRatio);
                }
            });
        }, observerOptions);

        // Observe pricing cards and key elements
        document.querySelectorAll('.pricing-card-enhanced, .hero-content-enhanced, .trust-indicators').forEach(el => {
            observer.observe(el);
        });

        // Smooth scroll to pricing section from hero CTA
        this.initSmoothScrolling();
    }

    handleElementInView(element, ratio) {
        if (element.classList.contains('pricing-card-enhanced') && ratio > 0.5) {
            // Add subtle animation when card comes into view
            element.style.animation = 'slideUpFade 0.8s ease-out forwards';
        }
    }

    initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Performance optimizations
    initPerformanceOptimizations() {
        // Lazy load non-critical elements
        this.lazyLoadElements();

        // Optimize animations for low-end devices
        this.optimizeForLowEndDevices();

        // Prefetch contact page on hover
        this.prefetchContactPage();
    }

    lazyLoadElements() {
        const lazyElements = document.querySelectorAll('[data-lazy]');
        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                    lazyObserver.unobserve(element);
                }
            });
        });

        lazyElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            lazyObserver.observe(el);
        });
    }

    optimizeForLowEndDevices() {
        // Check for low-end device indicators
        const isLowEnd = navigator.hardwareConcurrency < 4 ||
                         navigator.deviceMemory < 4 ||
                         window.innerWidth < 768;

        if (isLowEnd) {
            // Reduce animation complexity
            document.documentElement.style.setProperty('--animation-duration', '0.3s');

            // Disable complex hover effects
            document.querySelectorAll('.pricing-card-enhanced').forEach(card => {
                card.style.willChange = 'auto';
            });
        }
    }

    prefetchContactPage() {
        const contactLinks = document.querySelectorAll('a[href*="contact"]');
        contactLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                if (!link._prefetched) {
                    const prefetchLink = document.createElement('link');
                    prefetchLink.rel = 'prefetch';
                    prefetchLink.href = link.href;
                    document.head.appendChild(prefetchLink);
                    link._prefetched = true;
                }
            });
        });
    }

    // Conversion tracking and analytics
    initConversionTracking() {
        // Track pricing card interactions
        document.querySelectorAll('.btn-pricing-enhanced').forEach(button => {
            button.addEventListener('click', (e) => {
                const card = e.target.closest('.pricing-card-enhanced');
                const packageName = card.querySelector('.pricing-title-enhanced').textContent;

                // Analytics tracking (replace with your analytics service)
                this.trackEvent('pricing_cta_click', {
                    package: packageName,
                    position: Array.from(card.parentNode.children).indexOf(card) + 1
                });
            });
        });

        // Track scroll depth
        this.trackScrollDepth();
    }

    trackEvent(eventName, data) {
        // Google Analytics 4 example
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, data);
        }

        // Console log for development
        console.log('📊 Event tracked:', eventName, data);
    }

    trackScrollDepth() {
        const milestones = [25, 50, 75, 100];
        let trackedMilestones = [];

        const trackScroll = () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            milestones.forEach(milestone => {
                if (scrollPercent >= milestone && !trackedMilestones.includes(milestone)) {
                    trackedMilestones.push(milestone);
                    this.trackEvent('scroll_depth', { depth: milestone });
                }
            });
        };

        window.addEventListener('scroll', throttle(trackScroll, 500));
    }

    // Accessibility enhancements
    initAccessibilityEnhancements() {
        // Enhanced keyboard navigation
        this.enhanceKeyboardNavigation();

        // ARIA enhancements
        this.enhanceARIA();

        // Focus management
        this.manageFocus();
    }

    enhanceKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Escape key to close any modals or overlays
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal, .overlay').forEach(el => {
                    el.style.display = 'none';
                });
            }
        });
    }

    enhanceARIA() {
        // Add ARIA labels to pricing cards
        document.querySelectorAll('.pricing-card-enhanced').forEach((card, index) => {
            const title = card.querySelector('.pricing-title-enhanced').textContent;
            const price = card.querySelector('.pricing-price-enhanced').textContent;

            card.setAttribute('aria-label', `${title} package for ${price} per month`);
            card.setAttribute('role', 'article');
        });
    }

    manageFocus() {
        // Ensure proper focus management for interactive elements
        const focusableElements = document.querySelectorAll('button, a, input, [tabindex]');

        focusableElements.forEach(el => {
            el.addEventListener('focus', () => {
                el.style.outline = '2px solid #3b82f6';
                el.style.outlineOffset = '2px';
            });

            el.addEventListener('blur', () => {
                el.style.outline = '';
                el.style.outlineOffset = '';
            });
        });
    }
}

// Utility functions
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }

    @keyframes slideUpFade {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .pricing-card-enhanced {
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .pricing-card-enhanced:focus-within {
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
new PricingPageEnhancer();

console.log('🚀 Enhanced pricing page JavaScript loaded successfully');