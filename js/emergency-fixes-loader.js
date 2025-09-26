/**
 * Emergency Fixes Loader
 * Loads all Phase 0 critical fixes to stop revenue leakage
 * This should be included in all HTML pages
 */

(function() {
    'use strict';

    // Configuration
    const config = {
        tracking: {
            ga4Id: 'G-XXXXXXXXXX', // TODO: Replace with actual GA4 ID
            fbPixelId: 'XXXXXXXXXX', // TODO: Replace with actual Facebook Pixel ID
            hotjarId: 'XXXXXXX' // TODO: Replace with actual Hotjar ID
        },
        features: {
            emailNotifications: true,
            exitIntentPopup: true,
            tracking: true,
            performanceOptimization: true
        }
    };

    // Load scripts dynamically
    function loadScript(src, async = true) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = async;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Initialize all emergency fixes
    async function initializeEmergencyFixes() {
        console.log('🚀 Initializing emergency fixes...');

        // Load tracking first (highest priority)
        if (config.features.tracking) {
            try {
                await loadScript('/js/tracking-implementation.js');
                console.log('✅ Tracking loaded');
            } catch (error) {
                console.error('❌ Tracking failed to load:', error);
            }
        }

        // Load email notification handler
        if (config.features.emailNotifications) {
            try {
                await loadScript('/js/email-notification-handler.js');
                console.log('✅ Email notifications loaded');
            } catch (error) {
                console.error('❌ Email notifications failed to load:', error);
            }
        }

        // Load exit intent popup (with delay to not interfere with page load)
        if (config.features.exitIntentPopup) {
            setTimeout(() => {
                loadScript('/js/exit-intent-popup.js')
                    .then(() => console.log('✅ Exit intent popup loaded'))
                    .catch(error => console.error('❌ Exit intent popup failed:', error));
            }, 2000);
        }

        // Apply quick performance optimizations
        if (config.features.performanceOptimization) {
            applyQuickPerformanceFixes();
        }

        console.log('✨ Emergency fixes initialization complete');
    }

    // Quick performance optimizations
    function applyQuickPerformanceFixes() {
        // Lazy load images
        if ('IntersectionObserver' in window) {
            const images = document.querySelectorAll('img[data-src]');
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }

        // Preconnect to external domains
        const preconnectDomains = [
            'https://www.googletagmanager.com',
            'https://connect.facebook.net',
            'https://static.hotjar.com',
            'https://formspree.io'
        ];

        preconnectDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            document.head.appendChild(link);
        });

        // Defer non-critical CSS
        const deferredStyles = document.querySelectorAll('link[data-defer]');
        deferredStyles.forEach(link => {
            link.media = 'print';
            link.addEventListener('load', () => {
                link.media = 'all';
            });
        });

        console.log('✅ Performance optimizations applied');
    }

    // Add global error handler for tracking
    window.addEventListener('error', (event) => {
        if (window.TPPTracking && window.TPPTracking.trackEvent) {
            window.TPPTracking.trackEvent('error', 'javascript_error', event.message);
        }
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEmergencyFixes);
    } else {
        initializeEmergencyFixes();
    }
})();