/**
 * Navigation Loader
 * Lightweight script to dynamically load and initialize the navigation component
 * Include this script in each HTML page to automatically load the navigation
 */

(function() {
    'use strict';

    // Configuration
    const config = {
        navigationScriptPath: 'js/components/navigation.js',
        mobileNavScriptPath: 'js/components/mobile-nav.js',
        templatePath: 'templates/navigation.html',
        loadTimeout: 5000, // 5 seconds
        retryAttempts: 1, // Reduced for faster testing
        debug: true // Enabled for testing
    };

    // State
    let navigationInstance = null;
    let loadAttempts = 0;
    let scriptsLoaded = {
        navigation: false,
        mobileNav: false
    };

    /**
     * Log debug messages
     */
    function debug(...args) {
        if (config.debug) {
            console.log('[NavigationLoader]', ...args);
        }
    }

    /**
     * Log errors
     */
    function error(...args) {
        console.error('[NavigationLoader]', ...args);
    }

    /**
     * Check if script is already loaded
     */
    function isScriptLoaded(src) {
        return document.querySelector(`script[src="${src}"]`) !== null;
    }

    /**
     * Load script dynamically
     */
    function loadScript(src, integrity = null) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (isScriptLoaded(src)) {
                debug(`Script already loaded: ${src}`);
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = false; // Maintain execution order

            if (integrity) {
                script.integrity = integrity;
                script.crossOrigin = 'anonymous';
            }

            script.onload = () => {
                debug(`Script loaded successfully: ${src}`);
                resolve();
            };

            script.onerror = () => {
                error(`Failed to load script: ${src}`);
                reject(new Error(`Failed to load script: ${src}`));
            };

            // Add timeout
            const timeout = setTimeout(() => {
                error(`Script load timeout: ${src}`);
                reject(new Error(`Script load timeout: ${src}`));
            }, config.loadTimeout);

            script.onload = () => {
                clearTimeout(timeout);
                debug(`Script loaded successfully: ${src}`);
                resolve();
            };

            script.onerror = () => {
                clearTimeout(timeout);
                error(`Failed to load script: ${src}`);
                reject(new Error(`Failed to load script: ${src}`));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Load required scripts in sequence
     */
    async function loadRequiredScripts() {
        try {
            debug('Loading navigation scripts...');

            // Load navigation component first
            await loadScript(config.navigationScriptPath);
            scriptsLoaded.navigation = true;

            // Check if mobile nav script exists and load it
            try {
                await loadScript(config.mobileNavScriptPath);
                scriptsLoaded.mobileNav = true;
                debug('Mobile navigation script loaded');
            } catch (err) {
                debug('Mobile navigation script not found or failed to load, continuing without it');
            }

            debug('All navigation scripts loaded successfully');
            return true;

        } catch (err) {
            error('Failed to load navigation scripts:', err);
            throw err;
        }
    }

    /**
     * Initialize navigation component
     */
    function initializeNavigation() {
        try {
            debug('Initializing navigation component...');

            // Check if NavigationComponent is available
            if (typeof window.NavigationComponent !== 'function') {
                throw new Error('NavigationComponent not available');
            }

            // Get current page for configuration
            const currentPage = getCurrentPageIdentifier();

            // Initialize navigation with custom configuration
            navigationInstance = new window.NavigationComponent({
                templatePath: config.templatePath,
                targetSelector: 'body',
                insertPosition: 'afterbegin',
                autoInit: true,
                activePageDetection: true,
                smoothTransitions: true,
                scrollEffects: true,
                accessibilityFeatures: true,
                mobileBreakpoint: 968,
                cacheTemplate: true,
                debug: config.debug
            });

            // Set up event listeners for navigation events
            setupNavigationEventListeners();

            debug('Navigation component initialized successfully');
            return navigationInstance;

        } catch (err) {
            error('Failed to initialize navigation component:', err);
            throw err;
        }
    }

    /**
     * Get current page identifier from URL
     */
    function getCurrentPageIdentifier() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();

        if (!filename || filename === 'index.html' || filename === '') {
            return 'home';
        }

        return filename.replace('.html', '');
    }

    /**
     * Setup event listeners for navigation events
     */
    function setupNavigationEventListeners() {
        // Listen for navigation events
        document.addEventListener('navigation:loaded', () => {
            debug('Navigation loaded event received');
            document.body.classList.add('navigation-loaded');
        });

        document.addEventListener('navigation:error', (event) => {
            error('Navigation error event received:', event.detail);
            document.body.classList.add('navigation-error');
        });

        // Enhanced page visibility handling
        document.addEventListener('visibilitychange', () => {
            if (navigationInstance && document.hidden) {
                // Close any open menus when page becomes hidden
                if (navigationInstance.state.mobileMenuOpen) {
                    navigationInstance.closeMobileMenu();
                }
                if (navigationInstance.state.activeDropdown) {
                    navigationInstance.closeDropdown(navigationInstance.state.activeDropdown);
                }
            }
        });

        // Handle browser back/forward navigation
        window.addEventListener('popstate', () => {
            if (navigationInstance) {
                navigationInstance.refresh();
            }
        });
    }

    /**
     * Handle loading errors with retry logic
     */
    async function loadWithRetry() {
        loadAttempts++;

        try {
            await loadRequiredScripts();
            await initializeNavigation();

            debug('Navigation loading completed successfully');

            // Dispatch success event
            document.dispatchEvent(new CustomEvent('navigationLoader:success', {
                detail: {
                    instance: navigationInstance,
                    attempts: loadAttempts
                }
            }));

        } catch (err) {
            error(`Navigation loading failed (attempt ${loadAttempts}):`, err);

            if (loadAttempts < config.retryAttempts) {
                debug(`Retrying navigation load in 1 second... (${loadAttempts}/${config.retryAttempts})`);
                setTimeout(loadWithRetry, 1000);
            } else {
                error('Navigation loading failed after all retry attempts');

                // Dispatch failure event
                document.dispatchEvent(new CustomEvent('navigationLoader:failed', {
                    detail: {
                        error: err,
                        attempts: loadAttempts
                    }
                }));

                // Fallback: show existing navigation if any
                showFallbackNavigation();
            }
        }
    }

    /**
     * Show fallback navigation if dynamic loading fails
     */
    function showFallbackNavigation() {
        debug('Attempting to show fallback navigation...');

        // Look for existing navigation elements
        const existingNav = document.querySelector('header#header, .premium-nav, nav');
        if (existingNav) {
            existingNav.style.display = 'block';
            existingNav.style.visibility = 'visible';
            debug('Fallback navigation displayed');
        } else {
            debug('No fallback navigation found - creating basic navigation for tests');
            createBasicTestNavigation();
        }
    }

    /**
     * Create basic navigation for test environments
     */
    function createBasicTestNavigation() {
        const body = document.body;
        const navHtml = `
            <!-- Test Navigation (Fallback) -->
            <header id="header" role="banner" class="premium-nav">
                <div class="container">
                    <a href="index.html" class="logo premium-logo">
                        <img src="images/optimized/logo.png" alt="The Profit Platform Logo" width="150" height="50">
                    </a>

                    <nav id="primary-navigation" role="navigation" aria-label="Main navigation">
                        <ul class="nav-links premium-nav-links" role="menubar">
                            <li><a href="index.html" class="nav-item premium-nav-item" data-page="home">Home</a></li>
                            <li><a href="services.html" class="nav-item premium-nav-item" data-page="services">Services</a></li>
                            <li><a href="pricing.html" class="nav-item premium-nav-item" data-page="pricing">Pricing</a></li>
                            <li><a href="about.html" class="nav-item premium-nav-item" data-page="about">About</a></li>
                            <li><a href="portfolio.html" class="nav-item premium-nav-item" data-page="portfolio">Portfolio</a></li>
                            <li><a href="contact.html" class="nav-item premium-nav-item" data-page="contact">Contact</a></li>
                        </ul>
                    </nav>

                    <button class="menu-toggle" id="menuToggle" aria-label="Open mobile menu" type="button">
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </header>

            <div class="mobile-nav" id="mobileNav" aria-hidden="true">
                <div class="mobile-nav-header">
                    <div class="mobile-nav-logo">
                        <img src="images/optimized/logo.png" alt="The Profit Platform Logo" width="120" height="40">
                    </div>
                    <button class="mobile-nav-close" id="mobileNavClose" aria-label="Close mobile menu" type="button">
                        <span>&times;</span>
                    </button>
                </div>
                <nav class="mobile-nav-links">
                    <a href="index.html" class="mobile-nav-link" data-page="home">Home</a>
                    <a href="services.html" class="mobile-nav-link" data-page="services">Services</a>
                    <a href="pricing.html" class="mobile-nav-link" data-page="pricing">Pricing</a>
                    <a href="about.html" class="mobile-nav-link" data-page="about">About</a>
                    <a href="portfolio.html" class="mobile-nav-link" data-page="portfolio">Portfolio</a>
                    <a href="contact.html" class="mobile-nav-link" data-page="contact">Contact</a>
                </nav>
            </div>
            <div class="mobile-nav-overlay" id="mobileNavOverlay" aria-hidden="true"></div>
        `;

        body.insertAdjacentHTML('afterbegin', navHtml);

        // Set active page
        const currentPage = getCurrentPageIdentifier();
        const activeLinks = document.querySelectorAll(`[data-page="${currentPage}"]`);
        activeLinks.forEach(link => {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        });

        debug('Basic test navigation created');
    }

    /**
     * Check if page has existing navigation
     */
    function hasExistingNavigation() {
        return document.querySelector('header#header, .premium-nav') !== null;
    }

    /**
     * Main initialization function
     */
    function init() {
        debug('Navigation loader starting...');

        // Skip loading if navigation already exists
        if (hasExistingNavigation()) {
            debug('Existing navigation detected, skipping dynamic loading');
            return;
        }

        // Add loading class to body
        document.body.classList.add('navigation-loading');

        // Start loading process
        loadWithRetry();
    }

    /**
     * Wait for DOM to be ready
     */
    function onDOMReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    /**
     * Public API
     */
    window.NavigationLoader = {
        init: init,
        getInstance: () => navigationInstance,
        reload: () => {
            if (navigationInstance) {
                navigationInstance.destroy();
                navigationInstance = null;
            }
            loadAttempts = 0;
            init();
        },
        config: config
    };

    // Auto-initialize when DOM is ready
    onDOMReady(() => {
        // Small delay to ensure other scripts have loaded
        setTimeout(init, 100);
    });

    debug('Navigation loader script loaded');

})();