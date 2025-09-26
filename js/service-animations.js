/**
 * Enhanced Service Card Animations
 * Handles scroll-triggered animations, intersection observer, and performance optimizations
 */

class ServiceAnimations {
    constructor() {
        this.cards = [];
        this.observers = new Map();
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupAnimations());
        } else {
            this.setupAnimations();
        }
    }

    setupAnimations() {
        this.cards = document.querySelectorAll('.service-card');

        if (this.cards.length === 0) {
            console.warn('No service cards found');
            return;
        }

        // Setup intersection observer for entrance animations
        this.setupIntersectionObserver();

        // Setup hover optimizations
        this.setupHoverOptimizations();

        // Setup performance monitoring
        this.setupPerformanceMonitoring();

        // Setup touch/mobile optimizations
        this.setupTouchOptimizations();

        console.log(`Initialized animations for ${this.cards.length} service cards`);
    }

    setupIntersectionObserver() {
        if (this.isReducedMotion) {
            // Just show cards immediately if user prefers reduced motion
            this.cards.forEach(card => card.classList.add('animate-in'));
            return;
        }

        const options = {
            root: null,
            rootMargin: '-10% 0px -10% 0px', // Trigger when 10% of card is visible
            threshold: [0.1, 0.5, 0.9]
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const card = entry.target;

                if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
                    // Card is entering viewport
                    this.animateCardEntrance(card);

                    // Stop observing this card once animated
                    observer.unobserve(card);
                }
            });
        }, options);

        // Observe all cards
        this.cards.forEach(card => {
            observer.observe(card);
        });

        this.observers.set('entrance', observer);
    }

    animateCardEntrance(card) {
        // Add entrance animation class
        card.classList.add('animate-in');

        // Animate the icon with a delay
        const icon = card.querySelector('.service-icon');
        if (icon) {
            setTimeout(() => {
                icon.classList.add('animate-in');
            }, 200);
        }

        // Animate features list with staggered effect
        const features = card.querySelectorAll('.service-features li');
        features.forEach((feature, index) => {
            setTimeout(() => {
                feature.style.opacity = '1';
                feature.style.transform = 'translateX(0)';
            }, 300 + (index * 100));
        });

        // Trigger custom event for other components
        card.dispatchEvent(new CustomEvent('serviceCardAnimated', {
            detail: { card, timestamp: Date.now() }
        }));
    }

    setupHoverOptimizations() {
        this.cards.forEach(card => {
            let hoverTimeout;

            // Optimize hover performance with requestAnimationFrame
            card.addEventListener('mouseenter', () => {
                if (this.isReducedMotion) return;

                clearTimeout(hoverTimeout);

                // Use requestAnimationFrame for smooth animations
                requestAnimationFrame(() => {
                    card.style.willChange = 'transform, box-shadow';
                    this.triggerHoverEffects(card, true);
                });
            });

            card.addEventListener('mouseleave', () => {
                if (this.isReducedMotion) return;

                // Debounce to prevent rapid hover on/off
                hoverTimeout = setTimeout(() => {
                    requestAnimationFrame(() => {
                        card.style.willChange = 'auto';
                        this.triggerHoverEffects(card, false);
                    });
                }, 50);
            });

            // Focus handling for accessibility
            card.addEventListener('focusin', () => {
                if (!this.isReducedMotion) {
                    this.triggerHoverEffects(card, true);
                }
            });

            card.addEventListener('focusout', () => {
                if (!this.isReducedMotion) {
                    this.triggerHoverEffects(card, false);
                }
            });
        });
    }

    triggerHoverEffects(card, isHovering) {
        const icon = card.querySelector('.service-icon');
        const title = card.querySelector('h3');
        const description = card.querySelector('p');
        const features = card.querySelectorAll('.service-features li');
        const button = card.querySelector('.service-cta .btn');

        if (isHovering) {
            // Add hover classes for enhanced effects
            card.classList.add('card-hovering');

            // Animate features with staggered effect
            features.forEach((feature, index) => {
                setTimeout(() => {
                    feature.style.transform = 'translateX(5px)';
                }, index * 30);
            });

            // Add subtle shake to icon
            if (icon && !this.isReducedMotion) {
                icon.style.animation = 'none';
                setTimeout(() => {
                    icon.style.animation = 'iconHover 0.6s ease-out';
                }, 10);
            }

        } else {
            // Remove hover classes
            card.classList.remove('card-hovering');

            // Reset features
            features.forEach(feature => {
                feature.style.transform = 'translateX(0)';
            });

            // Reset icon animation
            if (icon) {
                icon.style.animation = '';
            }
        }
    }

    setupPerformanceMonitoring() {
        // Monitor animation performance
        let frameCount = 0;
        let lastTime = performance.now();

        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();

            if (currentTime - lastTime >= 1000) { // Every second
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

                // If FPS drops below 30, reduce animation complexity
                if (fps < 30) {
                    this.enablePerformanceMode();
                }

                frameCount = 0;
                lastTime = currentTime;
            }

            requestAnimationFrame(measureFPS);
        };

        // Only monitor if not in reduced motion mode
        if (!this.isReducedMotion) {
            requestAnimationFrame(measureFPS);
        }
    }

    enablePerformanceMode() {
        console.log('Enabling performance mode - reducing animation complexity');

        document.body.classList.add('performance-mode');

        // Disable some intensive animations
        this.cards.forEach(card => {
            card.style.willChange = 'auto';

            // Simplify hover effects
            const shimmer = card.querySelector('::before');
            if (shimmer) {
                card.style.setProperty('--shimmer-enabled', '0');
            }
        });
    }

    setupTouchOptimizations() {
        // Detect touch capability
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        if (isTouchDevice) {
            document.body.classList.add('touch-device');

            this.cards.forEach(card => {
                // Add touch-specific event handlers
                card.addEventListener('touchstart', () => {
                    if (!this.isReducedMotion) {
                        card.classList.add('touch-active');
                    }
                }, { passive: true });

                card.addEventListener('touchend', () => {
                    setTimeout(() => {
                        card.classList.remove('touch-active');
                    }, 150);
                }, { passive: true });

                // Prevent hover effects on touch devices
                card.style.setProperty('--hover-enabled', '0');
            });
        }
    }

    // Public methods for external control
    pauseAnimations() {
        document.body.classList.add('animations-paused');
        this.cards.forEach(card => {
            card.style.animationPlayState = 'paused';
        });
    }

    resumeAnimations() {
        document.body.classList.remove('animations-paused');
        this.cards.forEach(card => {
            card.style.animationPlayState = 'running';
        });
    }

    refreshAnimations() {
        // Re-initialize animations (useful for dynamic content)
        this.cleanup();
        this.setupAnimations();
    }

    cleanup() {
        // Clean up observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();

        // Remove event listeners and classes
        this.cards.forEach(card => {
            card.classList.remove('animate-in', 'card-hovering', 'touch-active');
            card.style.willChange = 'auto';
        });
    }

    // Static method to check if animations are supported
    static isAnimationSupported() {
        return 'animate' in document.createElement('div') &&
               'IntersectionObserver' in window &&
               'requestAnimationFrame' in window;
    }
}

// Additional CSS keyframes that need to be injected
const additionalKeyframes = `
@keyframes iconHover {
    0% { transform: scale(1.15) rotate(8deg); }
    25% { transform: scale(1.18) rotate(10deg); }
    50% { transform: scale(1.15) rotate(6deg); }
    75% { transform: scale(1.17) rotate(9deg); }
    100% { transform: scale(1.15) rotate(8deg); }
}

.performance-mode .service-card {
    transition-duration: 0.2s !important;
}

.performance-mode .service-card::before {
    display: none !important;
}

.touch-device .service-card:hover {
    transform: none !important;
}

.touch-active {
    transform: scale(0.98) !important;
    transition-duration: 0.1s !important;
}

.animations-paused * {
    animation-play-state: paused !important;
}
`;

// Inject additional styles
function injectStyles() {
    const style = document.createElement('style');
    style.textContent = additionalKeyframes;
    document.head.appendChild(style);
}

// Initialize when DOM is ready
let serviceAnimations;

function initServiceAnimations() {
    if (ServiceAnimations.isAnimationSupported()) {
        injectStyles();
        serviceAnimations = new ServiceAnimations();

        // Expose to global scope for debugging
        window.serviceAnimations = serviceAnimations;
    } else {
        console.warn('Service animations not supported in this browser');
        // Fallback: just show all cards
        document.querySelectorAll('.service-card').forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'none';
        });
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServiceAnimations);
} else {
    initServiceAnimations();
}

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
    if (serviceAnimations) {
        if (document.hidden) {
            serviceAnimations.pauseAnimations();
        } else {
            serviceAnimations.resumeAnimations();
        }
    }
});

// Handle reduced motion preference changes
const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
mediaQuery.addEventListener('change', (e) => {
    if (serviceAnimations) {
        serviceAnimations.isReducedMotion = e.matches;
        if (e.matches) {
            serviceAnimations.pauseAnimations();
        } else {
            serviceAnimations.resumeAnimations();
        }
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServiceAnimations;
}