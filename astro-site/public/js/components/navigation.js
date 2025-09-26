/**
 * Enhanced Navigation Component
 * Modern, modular navigation system with dynamic loading and enhanced UX
 * Integrates with existing mobile navigation and adds new features
 */

class NavigationComponent {
    constructor(options = {}) {
        // Configuration
        this.config = {
            templatePath: 'templates/navigation.html',
            targetSelector: 'body',
            insertPosition: 'afterbegin',
            autoInit: true,
            activePageDetection: true,
            smoothTransitions: true,
            scrollEffects: true,
            accessibilityFeatures: true,
            mobileBreakpoint: 968,
            cacheTemplate: true,
            ...options
        };

        // State management
        this.state = {
            isLoaded: false,
            isScrolled: false,
            activeDropdown: null,
            currentPage: this.getCurrentPage(),
            mobileMenuOpen: false,
            template: null
        };

        // DOM references
        this.elements = {
            container: null,
            header: null,
            navLinks: null,
            dropdowns: null,
            mobileToggle: null,
            mobileNav: null,
            mobileOverlay: null,
            progressBar: null
        };

        // Event handlers
        this.handlers = {
            scroll: this.throttle(this.handleScroll.bind(this), 16),
            resize: this.throttle(this.handleResize.bind(this), 250),
            click: this.handleClick.bind(this),
            keydown: this.handleKeydown.bind(this),
            focusin: this.handleFocusIn.bind(this),
            focusout: this.handleFocusOut.bind(this)
        };

        if (this.config.autoInit) {
            this.init();
        }
    }

    /**
     * Initialize the navigation component
     */
    async init() {
        try {
            console.log('Initializing Navigation Component...');

            await this.loadTemplate();
            await this.injectNavigation();
            this.cacheElements();
            this.setupEventListeners();
            this.setActivePage();
            this.initializeFeatures();

            this.state.isLoaded = true;
            this.dispatchEvent('navigation:loaded');

            console.log('Navigation Component initialized successfully');
        } catch (error) {
            console.error('Failed to initialize navigation:', error);
            this.dispatchEvent('navigation:error', { error });
        }
    }

    /**
     * Load navigation template from file
     */
    async loadTemplate() {
        if (this.state.template && this.config.cacheTemplate) {
            return this.state.template;
        }

        try {
            const response = await fetch(this.config.templatePath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            this.state.template = await response.text();
            return this.state.template;
        } catch (error) {
            console.error('Failed to load navigation template:', error);
            throw error;
        }
    }

    /**
     * Inject navigation HTML into the page
     */
    async injectNavigation() {
        const targetElement = document.querySelector(this.config.targetSelector);
        if (!targetElement) {
            throw new Error(`Target element "${this.config.targetSelector}" not found`);
        }

        // Create container div
        const navContainer = document.createElement('div');
        navContainer.className = 'navigation-component';
        navContainer.innerHTML = this.state.template;

        // Insert navigation
        switch (this.config.insertPosition) {
            case 'afterbegin':
                targetElement.insertAdjacentElement('afterbegin', navContainer);
                break;
            case 'beforeend':
                targetElement.insertAdjacentElement('beforeend', navContainer);
                break;
            default:
                targetElement.insertAdjacentElement('afterbegin', navContainer);
        }

        this.elements.container = navContainer;
    }

    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        this.elements.header = document.getElementById('header');
        this.elements.navLinks = document.querySelectorAll('.nav-item, .dropdown-item, .mobile-nav-link');
        this.elements.dropdowns = document.querySelectorAll('.nav-dropdown');
        this.elements.mobileToggle = document.getElementById('menuToggle');
        this.elements.mobileNav = document.getElementById('mobileNav');
        this.elements.mobileOverlay = document.getElementById('mobileNavOverlay');
        this.elements.progressBar = document.getElementById('progressBar');
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Scroll events
        if (this.config.scrollEffects) {
            window.addEventListener('scroll', this.handlers.scroll, { passive: true });
        }

        // Resize events
        window.addEventListener('resize', this.handlers.resize);

        // Click events
        document.addEventListener('click', this.handlers.click);

        // Keyboard events
        if (this.config.accessibilityFeatures) {
            document.addEventListener('keydown', this.handlers.keydown);
            document.addEventListener('focusin', this.handlers.focusin);
            document.addEventListener('focusout', this.handlers.focusout);
        }

        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.state.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        const scrollY = window.scrollY;
        const isScrolled = scrollY > 50;

        if (isScrolled !== this.state.isScrolled) {
            this.state.isScrolled = isScrolled;

            if (this.elements.header) {
                this.elements.header.classList.toggle('scrolled', isScrolled);
            }
        }

        // Update progress bar
        if (this.elements.progressBar) {
            const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollY / windowHeight) * 100;
            this.elements.progressBar.style.width = Math.min(progress, 100) + '%';
            this.elements.progressBar.parentElement.setAttribute('aria-valuenow', Math.round(progress));
        }

        this.dispatchEvent('navigation:scroll', { scrollY, isScrolled });
    }

    /**
     * Handle resize events
     */
    handleResize() {
        if (window.innerWidth > this.config.mobileBreakpoint && this.state.mobileMenuOpen) {
            this.closeMobileMenu();
        }

        this.dispatchEvent('navigation:resize', { width: window.innerWidth });
    }

    /**
     * Handle click events
     */
    handleClick(event) {
        const target = event.target.closest('[data-action]') || event.target;

        // Handle dropdown toggles
        if (target.closest('.nav-dropdown')) {
            this.handleDropdownClick(event);
        }

        // Handle mobile menu toggle
        if (target.matches('#menuToggle')) {
            event.preventDefault();
            this.toggleMobileMenu();
        }

        // Handle mobile menu close
        if (target.matches('#mobileNavClose') || target.matches('#mobileNavOverlay')) {
            event.preventDefault();
            this.closeMobileMenu();
        }

        // Handle navigation links
        if (target.matches('.nav-item, .dropdown-item, .mobile-nav-link')) {
            this.handleNavLinkClick(event, target);
        }

        // Close dropdowns when clicking outside
        if (!target.closest('.nav-dropdown') && this.state.activeDropdown) {
            this.closeDropdown(this.state.activeDropdown);
        }
    }

    /**
     * Handle dropdown interactions
     */
    handleDropdownClick(event) {
        const dropdown = event.target.closest('.nav-dropdown');
        const trigger = dropdown.querySelector('.nav-item');
        const menu = dropdown.querySelector('.dropdown-menu');

        if (event.target.closest('.nav-item')) {
            event.preventDefault();

            if (this.state.activeDropdown === dropdown) {
                this.closeDropdown(dropdown);
            } else {
                if (this.state.activeDropdown) {
                    this.closeDropdown(this.state.activeDropdown);
                }
                this.openDropdown(dropdown);
            }
        }
    }

    /**
     * Open dropdown menu
     */
    openDropdown(dropdown) {
        const trigger = dropdown.querySelector('.nav-item');
        const menu = dropdown.querySelector('.dropdown-menu');

        dropdown.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
        menu.style.display = 'block';

        // Smooth transition
        if (this.config.smoothTransitions) {
            menu.style.opacity = '0';
            menu.style.transform = 'translateY(-10px)';

            requestAnimationFrame(() => {
                menu.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                menu.style.opacity = '1';
                menu.style.transform = 'translateY(0)';
            });
        }

        this.state.activeDropdown = dropdown;
        this.dispatchEvent('navigation:dropdown:open', { dropdown });
    }

    /**
     * Close dropdown menu
     */
    closeDropdown(dropdown) {
        const trigger = dropdown.querySelector('.nav-item');
        const menu = dropdown.querySelector('.dropdown-menu');

        if (this.config.smoothTransitions) {
            menu.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
            menu.style.opacity = '0';
            menu.style.transform = 'translateY(-10px)';

            setTimeout(() => {
                dropdown.classList.remove('active');
                trigger.setAttribute('aria-expanded', 'false');
                menu.style.display = 'none';
                menu.style.transition = '';
                menu.style.transform = '';
            }, 200);
        } else {
            dropdown.classList.remove('active');
            trigger.setAttribute('aria-expanded', 'false');
            menu.style.display = 'none';
        }

        this.state.activeDropdown = null;
        this.dispatchEvent('navigation:dropdown:close', { dropdown });
    }

    /**
     * Handle navigation link clicks
     */
    handleNavLinkClick(event, link) {
        const href = link.getAttribute('href');
        const page = link.getAttribute('data-page');

        // Close mobile menu if open
        if (this.state.mobileMenuOpen) {
            this.closeMobileMenu();
        }

        // Close any open dropdowns
        if (this.state.activeDropdown) {
            this.closeDropdown(this.state.activeDropdown);
        }

        // Smooth scrolling for anchor links
        if (href && href.startsWith('#')) {
            event.preventDefault();
            this.smoothScrollTo(href);
        }

        this.dispatchEvent('navigation:link:click', { link, href, page });
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        if (this.state.mobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    /**
     * Open mobile menu
     */
    openMobileMenu() {
        this.state.mobileMenuOpen = true;

        if (this.elements.mobileToggle) {
            this.elements.mobileToggle.classList.add('active');
            this.elements.mobileToggle.setAttribute('aria-expanded', 'true');
        }

        if (this.elements.mobileNav) {
            this.elements.mobileNav.classList.add('active');
            this.elements.mobileNav.setAttribute('aria-hidden', 'false');
        }

        if (this.elements.mobileOverlay) {
            this.elements.mobileOverlay.classList.add('active');
        }

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Focus management
        this.trapFocus(this.elements.mobileNav);

        this.dispatchEvent('navigation:mobile:open');
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        this.state.mobileMenuOpen = false;

        if (this.elements.mobileToggle) {
            this.elements.mobileToggle.classList.remove('active');
            this.elements.mobileToggle.setAttribute('aria-expanded', 'false');
            this.elements.mobileToggle.focus();
        }

        if (this.elements.mobileNav) {
            this.elements.mobileNav.classList.remove('active');
            this.elements.mobileNav.setAttribute('aria-hidden', 'true');
        }

        if (this.elements.mobileOverlay) {
            this.elements.mobileOverlay.classList.remove('active');
        }

        // Restore body scroll
        document.body.style.overflow = '';

        this.dispatchEvent('navigation:mobile:close');
    }

    /**
     * Handle keyboard navigation
     */
    handleKeydown(event) {
        switch (event.key) {
            case 'Escape':
                if (this.state.activeDropdown) {
                    this.closeDropdown(this.state.activeDropdown);
                    this.state.activeDropdown.querySelector('.nav-item').focus();
                }
                if (this.state.mobileMenuOpen) {
                    this.closeMobileMenu();
                }
                break;

            case 'ArrowDown':
                if (event.target.closest('.nav-dropdown')) {
                    event.preventDefault();
                    this.focusNextDropdownItem(event.target);
                }
                break;

            case 'ArrowUp':
                if (event.target.closest('.nav-dropdown')) {
                    event.preventDefault();
                    this.focusPrevDropdownItem(event.target);
                }
                break;

            case 'Tab':
                this.handleTabNavigation(event);
                break;
        }
    }

    /**
     * Handle focus events
     */
    handleFocusIn(event) {
        const dropdown = event.target.closest('.nav-dropdown');
        if (dropdown && !this.state.activeDropdown) {
            this.openDropdown(dropdown);
        }
    }

    /**
     * Handle focus out events
     */
    handleFocusOut(event) {
        setTimeout(() => {
            if (this.state.activeDropdown && !this.state.activeDropdown.contains(document.activeElement)) {
                this.closeDropdown(this.state.activeDropdown);
            }
        }, 10);
    }

    /**
     * Set active page based on current URL
     */
    setActivePage() {
        if (!this.config.activePageDetection) return;

        const currentPage = this.getCurrentPage();
        this.state.currentPage = currentPage;

        // Remove all active classes
        this.elements.navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });

        // Set active class for current page
        const activeLinks = document.querySelectorAll(`[data-page="${currentPage}"], [href="${window.location.pathname}"], [href="${window.location.pathname.split('/').pop()}"]`);
        activeLinks.forEach(link => {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        });

        this.dispatchEvent('navigation:page:set', { currentPage });
    }

    /**
     * Get current page identifier
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();

        if (!filename || filename === 'index.html') return 'home';

        return filename.replace('.html', '').replace('/', '');
    }

    /**
     * Initialize enhanced features
     */
    initializeFeatures() {
        // Intersection Observer for enhanced scroll effects
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        }

        // Prefetch navigation pages on hover
        this.setupPrefetching();

        // Enhanced keyboard navigation
        this.setupKeyboardNavigation();
    }

    /**
     * Setup intersection observer for advanced scroll effects
     */
    setupIntersectionObserver() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.elements.header?.classList.add('in-view');
                    } else {
                        this.elements.header?.classList.remove('in-view');
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (this.elements.header) {
            observer.observe(this.elements.header);
        }
    }

    /**
     * Setup page prefetching on hover
     */
    setupPrefetching() {
        this.elements.navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                const href = link.getAttribute('href');
                if (href && href.endsWith('.html') && !href.startsWith('#')) {
                    this.prefetchPage(href);
                }
            });
        });
    }

    /**
     * Prefetch page for faster navigation
     */
    prefetchPage(href) {
        if (document.querySelector(`link[rel="prefetch"][href="${href}"]`)) return;

        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        document.head.appendChild(link);
    }

    /**
     * Enhanced keyboard navigation setup
     */
    setupKeyboardNavigation() {
        // Skip to navigation link
        const skipLink = document.querySelector('a[href="#primary-navigation"]');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const nav = document.getElementById('primary-navigation');
                if (nav) {
                    nav.focus();
                    nav.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    /**
     * Focus management for dropdowns
     */
    focusNextDropdownItem(currentElement) {
        const dropdown = currentElement.closest('.nav-dropdown');
        const items = dropdown.querySelectorAll('.dropdown-item');
        const currentIndex = Array.from(items).indexOf(currentElement);
        const nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex].focus();
    }

    focusPrevDropdownItem(currentElement) {
        const dropdown = currentElement.closest('.nav-dropdown');
        const items = dropdown.querySelectorAll('.dropdown-item');
        const currentIndex = Array.from(items).indexOf(currentElement);
        const prevIndex = currentIndex - 1 < 0 ? items.length - 1 : currentIndex - 1;
        items[prevIndex].focus();
    }

    /**
     * Trap focus within mobile menu
     */
    trapFocus(container) {
        if (!container) return;

        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        firstElement.focus();

        container.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }

    /**
     * Smooth scroll to anchor
     */
    smoothScrollTo(target) {
        const element = document.querySelector(target);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    /**
     * Dispatch custom events
     */
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: { ...detail, navigation: this },
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    }

    /**
     * Utility: Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Destroy the navigation component
     */
    destroy() {
        // Remove event listeners
        window.removeEventListener('scroll', this.handlers.scroll);
        window.removeEventListener('resize', this.handlers.resize);
        document.removeEventListener('click', this.handlers.click);
        document.removeEventListener('keydown', this.handlers.keydown);
        document.removeEventListener('focusin', this.handlers.focusin);
        document.removeEventListener('focusout', this.handlers.focusout);

        // Close mobile menu
        if (this.state.mobileMenuOpen) {
            this.closeMobileMenu();
        }

        // Remove navigation from DOM
        if (this.elements.container) {
            this.elements.container.remove();
        }

        // Reset state
        this.state = {
            isLoaded: false,
            isScrolled: false,
            activeDropdown: null,
            currentPage: null,
            mobileMenuOpen: false,
            template: null
        };

        this.dispatchEvent('navigation:destroyed');
    }

    /**
     * Update navigation configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.dispatchEvent('navigation:config:updated', { config: this.config });
    }

    /**
     * Refresh navigation (useful after page changes)
     */
    refresh() {
        this.setActivePage();
        this.cacheElements();
        this.dispatchEvent('navigation:refreshed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationComponent;
}

// Make available globally
window.NavigationComponent = NavigationComponent;