/**
 * Navigation Fixes and Enhancements
 * Addresses all cross-page navbar and footer issues
 * Ensures consistent behavior across all service pages
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        mobileMenuAnimationDuration: 400,
        dropdownHoverDelay: 300,
        scrollThreshold: 50,
        debounceDelay: 150,
        retryAttempts: 3,
        retryDelay: 500
    };

    // State management
    const state = {
        mobileMenuOpen: false,
        activeDropdown: null,
        scrollPosition: 0,
        isInitialized: false,
        initAttempts: 0
    };

    /**
     * Initialize navigation fixes with error recovery
     */
    function initNavigationFixes() {
        if (state.isInitialized) return;

        try {
            console.log('[NavFixes] Initializing navigation fixes...');

            // Fix mobile menu functionality
            fixMobileMenuInteractions();

            // Fix active page highlighting
            fixActivePageHighlighting();

            // Fix dropdown interactions
            fixDropdownInteractions();

            // Standardize footer structure
            standardizeFooterStructure();

            // Add error recovery mechanisms
            addErrorRecovery();

            // Optimize performance
            optimizePerformance();

            // Add accessibility enhancements
            addAccessibilityEnhancements();

            state.isInitialized = true;
            console.log('[NavFixes] Navigation fixes initialized successfully');

        } catch (error) {
            console.error('[NavFixes] Initialization error:', error);
            retryInitialization();
        }
    }

    /**
     * Fix mobile menu open/close interactions
     */
    function fixMobileMenuInteractions() {
        const menuToggle = document.querySelector('#menuToggle, .menu-toggle');
        const mobileNav = document.querySelector('#mobileNav, .mobile-nav');
        const mobileClose = document.querySelector('#mobileNavClose, .mobile-nav-close');
        const mobileOverlay = document.querySelector('#mobileNavOverlay, .mobile-nav-overlay');

        if (!menuToggle || !mobileNav) {
            console.warn('[NavFixes] Mobile menu elements not found');
            return;
        }

        // Remove any existing event listeners to prevent duplicates
        const newMenuToggle = menuToggle.cloneNode(true);
        menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);

        // Add fixed open functionality
        newMenuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openMobileMenu();
        });

        // Fix close button functionality
        if (mobileClose) {
            const newCloseBtn = mobileClose.cloneNode(true);
            mobileClose.parentNode.replaceChild(newCloseBtn, mobileClose);

            newCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeMobileMenu();
            });
        }

        // Fix overlay click to close
        if (mobileOverlay) {
            const newOverlay = mobileOverlay.cloneNode(true);
            mobileOverlay.parentNode.replaceChild(newOverlay, mobileOverlay);

            newOverlay.addEventListener('click', (e) => {
                e.preventDefault();
                closeMobileMenu();
            });
        }

        // Fix mobile navigation links to close menu on click
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(closeMobileMenu, 100);
            });
        });

        // Add keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.mobileMenuOpen) {
                closeMobileMenu();
            }
        });
    }

    /**
     * Open mobile menu with proper animations
     */
    function openMobileMenu() {
        if (state.mobileMenuOpen) return;

        const menuToggle = document.querySelector('#menuToggle, .menu-toggle');
        const mobileNav = document.querySelector('#mobileNav, .mobile-nav');
        const overlay = document.querySelector('#mobileNavOverlay, .mobile-nav-overlay');

        state.mobileMenuOpen = true;

        // Update toggle button
        if (menuToggle) {
            menuToggle.classList.add('active');
            menuToggle.setAttribute('aria-expanded', 'true');
            menuToggle.setAttribute('aria-label', 'Close mobile menu');
        }

        // Show mobile nav with animation
        if (mobileNav) {
            mobileNav.style.display = 'block';
            mobileNav.classList.add('active');
            mobileNav.setAttribute('aria-hidden', 'false');

            // Force reflow for animation
            mobileNav.offsetHeight;

            // Ensure animation completes
            setTimeout(() => {
                mobileNav.style.right = '0';
            }, 10);
        }

        // Show overlay
        if (overlay) {
            overlay.style.display = 'block';
            overlay.classList.add('active');

            // Force reflow
            overlay.offsetHeight;

            setTimeout(() => {
                overlay.style.opacity = '1';
            }, 10);
        }

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        document.body.setAttribute('data-mobile-menu-open', 'true');
    }

    /**
     * Close mobile menu with proper animations
     */
    function closeMobileMenu() {
        if (!state.mobileMenuOpen) return;

        const menuToggle = document.querySelector('#menuToggle, .menu-toggle');
        const mobileNav = document.querySelector('#mobileNav, .mobile-nav');
        const overlay = document.querySelector('#mobileNavOverlay, .mobile-nav-overlay');

        state.mobileMenuOpen = false;

        // Update toggle button
        if (menuToggle) {
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Open mobile menu');
        }

        // Hide mobile nav with animation
        if (mobileNav) {
            mobileNav.classList.remove('active');
            mobileNav.setAttribute('aria-hidden', 'true');
            mobileNav.style.right = '-100%';

            // Wait for animation to complete before hiding
            setTimeout(() => {
                if (!state.mobileMenuOpen) {
                    mobileNav.style.display = 'none';
                }
            }, CONFIG.mobileMenuAnimationDuration);
        }

        // Hide overlay
        if (overlay) {
            overlay.classList.remove('active');
            overlay.style.opacity = '0';

            setTimeout(() => {
                if (!state.mobileMenuOpen) {
                    overlay.style.display = 'none';
                }
            }, CONFIG.mobileMenuAnimationDuration);
        }

        // Restore body scroll
        document.body.style.overflow = '';
        document.body.removeAttribute('data-mobile-menu-open');
    }

    /**
     * Fix active page highlighting
     */
    function fixActivePageHighlighting() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop().replace('.html', '') || 'home';

        // Map common page variations
        const pageMapping = {
            '': 'home',
            'index': 'home',
            'web-design': 'web-design',
            'about': 'about',
            'services': 'services',
            'pricing': 'pricing',
            'contact': 'contact',
            'seo': 'seo',
            'google-ads': 'google-ads'
        };

        const activePage = pageMapping[currentPage] || currentPage;

        // Update body data attribute
        document.body.setAttribute('data-current-page', activePage);

        // Update all navigation links
        const allNavLinks = document.querySelectorAll('a[data-page]');
        allNavLinks.forEach(link => {
            const linkPage = link.getAttribute('data-page');

            // Remove existing active states
            link.classList.remove('active', 'current');
            link.removeAttribute('aria-current');

            // Add active state to current page
            if (linkPage === activePage) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });

        // Special handling for services dropdown on service pages
        if (['services', 'seo', 'web-design', 'google-ads'].includes(activePage)) {
            const servicesDropdownTrigger = document.querySelector('.nav-dropdown a[data-page="services"]');
            if (servicesDropdownTrigger) {
                servicesDropdownTrigger.classList.add('active');
            }
        }
    }

    /**
     * Fix dropdown interactions
     */
    function fixDropdownInteractions() {
        const dropdowns = document.querySelectorAll('.nav-dropdown');

        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.nav-item');
            const menu = dropdown.querySelector('#services-dropdown, .dropdown-menu');

            if (!trigger || !menu) return;

            let hoverTimeout;

            // Desktop hover interactions
            if (window.innerWidth > 968) {
                dropdown.addEventListener('mouseenter', () => {
                    clearTimeout(hoverTimeout);
                    showDropdown(dropdown, menu);
                });

                dropdown.addEventListener('mouseleave', () => {
                    hoverTimeout = setTimeout(() => {
                        hideDropdown(dropdown, menu);
                    }, CONFIG.dropdownHoverDelay);
                });
            }

            // Click/tap interactions
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                toggleDropdown(dropdown, menu);
            });
        });

        // Close dropdowns on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-dropdown')) {
                closeAllDropdowns();
            }
        });
    }

    /**
     * Show dropdown menu
     */
    function showDropdown(dropdown, menu) {
        dropdown.classList.add('active');
        menu.style.display = 'block';
        menu.style.visibility = 'visible';
        menu.style.opacity = '1';

        const trigger = dropdown.querySelector('.nav-item');
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'true');
        }

        state.activeDropdown = dropdown;
    }

    /**
     * Hide dropdown menu
     */
    function hideDropdown(dropdown, menu) {
        dropdown.classList.remove('active');
        menu.style.opacity = '0';

        setTimeout(() => {
            if (!dropdown.classList.contains('active')) {
                menu.style.display = 'none';
                menu.style.visibility = 'hidden';
            }
        }, 300);

        const trigger = dropdown.querySelector('.nav-item');
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
        }

        if (state.activeDropdown === dropdown) {
            state.activeDropdown = null;
        }
    }

    /**
     * Toggle dropdown menu
     */
    function toggleDropdown(dropdown, menu) {
        if (dropdown.classList.contains('active')) {
            hideDropdown(dropdown, menu);
        } else {
            closeAllDropdowns();
            showDropdown(dropdown, menu);
        }
    }

    /**
     * Close all dropdowns
     */
    function closeAllDropdowns() {
        const dropdowns = document.querySelectorAll('.nav-dropdown');
        dropdowns.forEach(dropdown => {
            const menu = dropdown.querySelector('#services-dropdown, .dropdown-menu');
            if (menu) {
                hideDropdown(dropdown, menu);
            }
        });
    }

    /**
     * Standardize footer structure across pages
     */
    function standardizeFooterStructure() {
        const footer = document.querySelector('footer');
        if (!footer) return;

        // Ensure consistent social media links
        const socialContainer = footer.querySelector('.social-links, .footer-social');
        if (socialContainer) {
            ensureConsistentSocialLinks(socialContainer);
        }

        // Ensure consistent footer navigation
        const footerNav = footer.querySelector('.footer-links, .footer-navigation');
        if (footerNav) {
            ensureConsistentFooterNav(footerNav);
        }

        // Add missing copyright if not present
        const copyright = footer.querySelector('.copyright, .footer-copyright');
        if (!copyright) {
            addCopyright(footer);
        }
    }

    /**
     * Ensure consistent social media links
     */
    function ensureConsistentSocialLinks(container) {
        const expectedSocial = [
            { icon: 'fa-facebook', href: '#', label: 'Facebook' },
            { icon: 'fa-twitter', href: '#', label: 'Twitter' },
            { icon: 'fa-linkedin', href: '#', label: 'LinkedIn' },
            { icon: 'fa-instagram', href: '#', label: 'Instagram' }
        ];

        const existingLinks = container.querySelectorAll('a');

        // If links are missing or inconsistent, standardize them
        if (existingLinks.length < expectedSocial.length) {
            container.innerHTML = '';

            expectedSocial.forEach(social => {
                const link = document.createElement('a');
                link.href = social.href;
                link.className = 'social-icon';
                link.setAttribute('aria-label', social.label);
                link.innerHTML = `<i class="fab ${social.icon}"></i>`;
                container.appendChild(link);
            });
        }
    }

    /**
     * Ensure consistent footer navigation
     */
    function ensureConsistentFooterNav(container) {
        const expectedLinks = [
            { text: 'Home', href: 'index.html' },
            { text: 'Services', href: 'services.html' },
            { text: 'About', href: 'about.html' },
            { text: 'Contact', href: 'contact.html' },
            { text: 'Privacy Policy', href: 'privacy.html' },
            { text: 'Terms', href: 'terms.html' }
        ];

        const existingLinks = container.querySelectorAll('a');

        // If footer nav is inconsistent, standardize it
        if (existingLinks.length < expectedLinks.length) {
            expectedLinks.forEach(link => {
                const exists = Array.from(existingLinks).some(el =>
                    el.textContent.includes(link.text)
                );

                if (!exists) {
                    const newLink = document.createElement('a');
                    newLink.href = link.href;
                    newLink.textContent = link.text;
                    newLink.className = 'footer-link';
                    container.appendChild(newLink);
                }
            });
        }
    }

    /**
     * Add copyright notice
     */
    function addCopyright(footer) {
        const currentYear = new Date().getFullYear();
        const copyrightDiv = document.createElement('div');
        copyrightDiv.className = 'footer-copyright';
        copyrightDiv.innerHTML = `© ${currentYear} The Profit Platform. All rights reserved.`;
        footer.appendChild(copyrightDiv);
    }

    /**
     * Add error recovery mechanisms
     */
    function addErrorRecovery() {
        // Global error handler
        window.addEventListener('error', (e) => {
            if (e.filename && e.filename.includes('navigation')) {
                console.error('[NavFixes] Navigation error caught:', e.message);
                attemptRecovery();
            }
        });

        // Handle promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            console.error('[NavFixes] Unhandled promise rejection:', e.reason);
        });

        // Add fallback for missing scripts
        ensureRequiredScripts();
    }

    /**
     * Ensure required scripts are loaded
     */
    function ensureRequiredScripts() {
        const requiredScripts = [
            { src: 'js/components/navigation-inline.js', id: 'nav-script' }
        ];

        requiredScripts.forEach(script => {
            const existing = document.querySelector(`script[src="${script.src}"]`);
            if (!existing) {
                const newScript = document.createElement('script');
                newScript.src = script.src;
                newScript.id = script.id;
                newScript.defer = true;
                document.head.appendChild(newScript);
            }
        });
    }

    /**
     * Attempt recovery from errors
     */
    function attemptRecovery() {
        if (state.initAttempts < CONFIG.retryAttempts) {
            console.log('[NavFixes] Attempting recovery...');
            setTimeout(() => {
                state.isInitialized = false;
                initNavigationFixes();
            }, CONFIG.retryDelay);
        }
    }

    /**
     * Optimize performance
     */
    function optimizePerformance() {
        // Debounce scroll events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                window.cancelAnimationFrame(scrollTimeout);
            }

            scrollTimeout = window.requestAnimationFrame(() => {
                handleScroll();
            });
        }, { passive: true });

        // Lazy load images
        lazyLoadImages();

        // Optimize animations
        optimizeAnimations();
    }

    /**
     * Handle scroll events efficiently
     */
    function handleScroll() {
        const currentScroll = window.scrollY;
        const header = document.querySelector('header, #header');

        if (header) {
            if (currentScroll > CONFIG.scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        state.scrollPosition = currentScroll;
    }

    /**
     * Lazy load images
     */
    function lazyLoadImages() {
        const images = document.querySelectorAll('img[loading="lazy"]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    /**
     * Optimize animations
     */
    function optimizeAnimations() {
        // Reduce motion for users who prefer it
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        if (prefersReducedMotion.matches) {
            document.body.classList.add('reduced-motion');
        }

        prefersReducedMotion.addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('reduced-motion');
            } else {
                document.body.classList.remove('reduced-motion');
            }
        });
    }

    /**
     * Add accessibility enhancements
     */
    function addAccessibilityEnhancements() {
        // Ensure all interactive elements are keyboard accessible
        const interactiveElements = document.querySelectorAll('a, button, [role="button"]');

        interactiveElements.forEach(element => {
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
        });

        // Add focus visible styles
        document.body.classList.add('keyboard-nav');

        // Handle focus trap in mobile menu
        setupFocusTrap();
    }

    /**
     * Setup focus trap for mobile menu
     */
    function setupFocusTrap() {
        const mobileNav = document.querySelector('#mobileNav, .mobile-nav');
        if (!mobileNav) return;

        const focusableElements = mobileNav.querySelectorAll(
            'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        mobileNav.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        });
    }

    /**
     * Retry initialization if failed
     */
    function retryInitialization() {
        state.initAttempts++;

        if (state.initAttempts < CONFIG.retryAttempts) {
            console.log(`[NavFixes] Retrying initialization (attempt ${state.initAttempts})...`);

            setTimeout(() => {
                initNavigationFixes();
            }, CONFIG.retryDelay * state.initAttempts);
        } else {
            console.error('[NavFixes] Max initialization attempts reached');
        }
    }

    /**
     * Initialize when DOM is ready
     */
    function domReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    // Initialize the navigation fixes
    domReady(() => {
        initNavigationFixes();

        // Re-initialize on dynamic content changes
        const observer = new MutationObserver(() => {
            if (!state.isInitialized) {
                initNavigationFixes();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });

    // Expose API for debugging
    window.NavigationFixes = {
        init: initNavigationFixes,
        openMobileMenu,
        closeMobileMenu,
        state,
        config: CONFIG
    };

})();