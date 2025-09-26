/**
 * Inline Navigation Component
 * Directly injects navigation HTML without external file dependencies
 * Designed to work with local files and all hosting environments
 */

(function() {
    'use strict';

    // Navigation HTML template (embedded for reliability)
    const getNavigationHTML = (imagePath) => `
        <!-- Skip Links for Accessibility -->
        <a class="skip-link sr-only-focusable" href="#main-content">Skip to main content</a>
        <a class="skip-link sr-only-focusable" href="#primary-navigation">Skip to navigation</a>

        <!-- Scroll Progress Indicator -->
        <div class="scroll-progress" role="progressbar" aria-label="Page scroll progress" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-bar" id="progressBar"></div>
        </div>

        <!-- Header Navigation -->
        <header id="header" role="banner" class="premium-nav">
            <div class="progress-indicator"></div>
            <div class="nav-floating-container">
                <div class="container">
                    <!-- Logo -->
                    <a href="index.html" class="logo premium-logo" aria-label="The Profit Platform - Home">
                        <div class="logo-content">
                            <img src="https://storage.googleapis.com/msgsndr/El8AYzrtJG3nVg76QPpa/media/68b56f6e09148075ab5016df.png"
                                 alt="The Profit Platform Logo"
                                 class="logo-img"
                                 width="150"
                                 height="77"
                                 loading="eager"
                                 fetchpriority="high"
                                 decoding="async"
                                 onerror="this.onerror=null; this.style.display='none'; this.parentElement.insertAdjacentHTML('afterend', '<span style=\\'color: #2c86f9; font-weight: bold; font-size: 1.5rem;\\'>The Profit Platform</span>');">
                            <div class="logo-tagline">
                                <span></span>
                            </div>
                        </div>
                        <div class="logo-accent"></div>
                    </a>

                    <!-- Primary Navigation -->
                    <nav id="primary-navigation" role="navigation" aria-label="Main navigation">
                        <ul class="nav-links premium-nav-links" role="menubar">
                            <li role="none">
                                <a href="index.html" class="nav-item premium-nav-item" role="menuitem" data-page="home">
                                    <i class="fas fa-home nav-icon" aria-hidden="true"></i>
                                    <span>Home</span>
                                    <div class="nav-pill-bg"></div>
                                </a>
                            </li>
                            <li class="nav-dropdown premium-dropdown" role="none">
                                <a href="services.html"
                                   class="nav-item premium-nav-item"
                                   role="menuitem"
                                   aria-expanded="false"
                                   aria-haspopup="true"
                                   aria-controls="services-dropdown"
                                   data-page="services">
                                    <i class="fas fa-rocket nav-icon" aria-hidden="true"></i>
                                    <span>Services</span>
                                    <i class="fas fa-chevron-down dropdown-arrow" aria-hidden="true"></i>
                                    <div class="nav-pill-bg"></div>
                                </a>
                                <div class="dropdown-menu mega-dropdown" role="menu" id="services-dropdown" aria-label="Services submenu">
                                    <div class="mega-dropdown-content">
                                        <a href="seo.html" class="dropdown-item mega-item" role="menuitem" data-page="seo">
                                            <div class="mega-item-icon">
                                                <i class="fas fa-search" aria-hidden="true"></i>
                                            </div>
                                            <div class="mega-item-content">
                                                <strong>SEO Services</strong>
                                                <span>Dominate Google search results</span>
                                            </div>
                                            <div class="mega-item-arrow">
                                                <i class="fas fa-arrow-right" aria-hidden="true"></i>
                                            </div>
                                        </a>
                                        <a href="web-design.html" class="dropdown-item mega-item" role="menuitem" data-page="web-design">
                                            <div class="mega-item-icon">
                                                <i class="fas fa-laptop-code" aria-hidden="true"></i>
                                            </div>
                                            <div class="mega-item-content">
                                                <strong>Website Design</strong>
                                                <span>Convert visitors to customers</span>
                                            </div>
                                            <div class="mega-item-arrow">
                                                <i class="fas fa-arrow-right" aria-hidden="true"></i>
                                            </div>
                                        </a>
                                        <a href="google-ads.html" class="dropdown-item mega-item" role="menuitem" data-page="google-ads">
                                            <div class="mega-item-icon">
                                                <i class="fas fa-bullhorn" aria-hidden="true"></i>
                                            </div>
                                            <div class="mega-item-content">
                                                <strong>Google Ads</strong>
                                                <span>Instant traffic and leads</span>
                                            </div>
                                            <div class="mega-item-arrow">
                                                <i class="fas fa-arrow-right" aria-hidden="true"></i>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </li>
                            <li role="none">
                                <a href="pricing.html" class="nav-item premium-nav-item" role="menuitem" data-page="pricing">
                                    <i class="fas fa-dollar-sign nav-icon" aria-hidden="true"></i>
                                    <span>Pricing</span>
                                    <div class="nav-pill-bg"></div>
                                </a>
                            </li>
                            <li role="none">
                                <a href="contact.html" class="nav-item premium-nav-item" role="menuitem" data-page="contact">
                                    <i class="fas fa-envelope nav-icon" aria-hidden="true"></i>
                                    <span>Contact</span>
                                    <div class="nav-pill-bg"></div>
                                </a>
                            </li>
                        </ul>
                    </nav>

                    <!-- CTA Button -->
                    <div class="nav-cta">
                        <a href="contact.html" class="btn btn-primary premium-cta-btn" aria-label="Get Free Chat - Contact us">
                            <i class="fas fa-comments premium-cta-icon" aria-hidden="true"></i>
                            <span>Let's Chat</span>
                            <div class="premium-cta-glow"></div>
                        </a>
                    </div>

                    <!-- Mobile Menu Toggle -->
                    <button class="menu-toggle"
                            id="menuToggle"
                            aria-label="Open mobile menu"
                            aria-expanded="false"
                            aria-controls="mobileNav"
                            type="button">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>
        </header>

        <!-- Mobile Navigation Overlay -->
        <div class="mobile-nav-overlay" id="mobileNavOverlay" aria-hidden="true"></div>

        <!-- Mobile Navigation Menu -->
        <div class="mobile-nav"
             id="mobileNav"
             role="dialog"
             aria-modal="true"
             aria-labelledby="mobile-nav-title"
             aria-hidden="true">
            <div class="mobile-nav-header">
                <div class="mobile-nav-logo">
                    <img src="https://storage.googleapis.com/msgsndr/El8AYzrtJG3nVg76QPpa/media/68b56f6e09148075ab5016df.png"
                         alt="The Profit Platform Logo"
                         class="logo-img"
                         width="120"
                         height="62"
                         loading="lazy"
                         decoding="async">
                    <div class="mobile-nav-tagline">
                        <span>Sydney Digital Marketing</span>
                    </div>
                </div>
                <button class="mobile-nav-close"
                        id="mobileNavClose"
                        aria-label="Close mobile menu"
                        type="button">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>

            <nav class="mobile-nav-links" aria-label="Mobile navigation">
                <h2 id="mobile-nav-title" class="sr-only">Navigation Menu</h2>
                <div role="list">
                    <a href="index.html" class="mobile-nav-link" role="listitem" data-page="home">
                        <div class="mobile-nav-icon">
                            <i class="fas fa-home" aria-hidden="true"></i>
                        </div>
                        <span>Home</span>
                    </a>
                    <a href="services.html" class="mobile-nav-link" role="listitem" data-page="services">
                        <div class="mobile-nav-icon">
                            <i class="fas fa-rocket" aria-hidden="true"></i>
                        </div>
                        <span>Services</span>
                    </a>
                    <div class="mobile-nav-submenu">
                        <a href="seo.html" class="mobile-nav-link mobile-sub-item" role="listitem" data-page="seo">
                            <div class="mobile-nav-icon">
                                <i class="fas fa-search" aria-hidden="true"></i>
                            </div>
                            <span>SEO & Local Search</span>
                        </a>
                        <a href="web-design.html" class="mobile-nav-link mobile-sub-item" role="listitem" data-page="web-design">
                            <div class="mobile-nav-icon">
                                <i class="fas fa-laptop-code" aria-hidden="true"></i>
                            </div>
                            <span>Website Design</span>
                        </a>
                        <a href="google-ads.html" class="mobile-nav-link mobile-sub-item" role="listitem" data-page="google-ads">
                            <div class="mobile-nav-icon">
                                <i class="fas fa-bullhorn" aria-hidden="true"></i>
                            </div>
                            <span>Google & Meta Ads</span>
                        </a>
                    </div>
                    <a href="pricing.html" class="mobile-nav-link" role="listitem" data-page="pricing">
                        <div class="mobile-nav-icon">
                            <i class="fas fa-dollar-sign" aria-hidden="true"></i>
                        </div>
                        <span>Pricing</span>
                    </a>
                    <a href="contact.html" class="mobile-nav-link" role="listitem" data-page="contact">
                        <div class="mobile-nav-icon">
                            <i class="fas fa-envelope" aria-hidden="true"></i>
                        </div>
                        <span>Contact</span>
                    </a>
                </div>
                <div class="mobile-nav-cta">
                    <a href="contact.html" class="mobile-cta-btn">
                        <i class="fas fa-comments mobile-cta-icon" aria-hidden="true"></i>
                        Get Free Consultation
                    </a>
                </div>
            </nav>
        </div>
    `;

    // Navigation functionality class
    class InlineNavigation {
        constructor() {
            this.isInit = false;
            this.mobileMenuOpen = false;
            this.activeDropdown = null;
            this.basePath = this.getBasePath();
            this.init();
        }

        getBasePath() {
            // Always use root-relative paths for consistency
            return '/';
        }

        init() {
            if (this.isInit) return;

            console.log('Initializing inline navigation...');

            // Inject navigation HTML
            this.injectNavigation();

            // Set active page
            this.setActivePage();

            // Setup event listeners
            this.setupEventListeners();

            // Setup scroll effects
            this.setupScrollEffects();

            this.isInit = true;
            console.log('Inline navigation initialized successfully');
        }

        injectNavigation() {
            // Get the correct image path based on current location
            const imagePath = this.basePath || '';

            // Insert navigation at the beginning of body
            document.body.insertAdjacentHTML('afterbegin', getNavigationHTML(imagePath));

            // Ensure no unwanted spacing
            document.body.style.margin = '0';
            document.body.style.padding = '0';
            document.documentElement.style.margin = '0';
            document.documentElement.style.padding = '0';

            // Check if there's any spacing on the scroll progress bar
            const scrollProgress = document.querySelector('.scroll-progress');
            if (scrollProgress) {
                scrollProgress.style.margin = '0';
                scrollProgress.style.padding = '0';
                scrollProgress.style.top = '0';
            }

            // Force remove gaps from common problematic elements
            const potentialGapElements = [
                'main', '#main-content', '.hero', '.about-hero',
                '.pricing-hero', '.web-design-hero', '.google-ads-hero'
            ];

            potentialGapElements.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) {
                    element.style.marginTop = '0';
                    element.style.paddingTop = '0';
                }
            });
        }

        setActivePage() {
            const currentPage = this.getCurrentPage();

            // Add data-page attribute to body for page-specific CSS targeting
            document.body.setAttribute('data-page', currentPage);

            // Set active states
            const navLinks = document.querySelectorAll('.nav-item, .mobile-nav-link');
            navLinks.forEach(link => {
                link.classList.remove('active');
                link.removeAttribute('aria-current');

                const linkPage = link.getAttribute('data-page');
                if (linkPage === currentPage) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                }
            });
        }

        getCurrentPage() {
            const path = window.location.pathname;
            const filename = path.split('/').pop();

            if (!filename || filename === 'index.html' || filename === '') {
                return 'home';
            }

            return filename.replace('.html', '');
        }

        setupEventListeners() {
            // Mobile menu toggle
            const menuToggle = document.getElementById('menuToggle');
            if (menuToggle) {
                menuToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleMobileMenu();
                });
            }

            // Mobile menu close
            const mobileClose = document.getElementById('mobileNavClose');
            if (mobileClose) {
                mobileClose.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.closeMobileMenu();
                });
            }

            // Mobile overlay close
            const mobileOverlay = document.getElementById('mobileNavOverlay');
            if (mobileOverlay) {
                mobileOverlay.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
            }

            // Dropdown handling
            const dropdowns = document.querySelectorAll('.nav-dropdown');
            dropdowns.forEach(dropdown => {
                const trigger = dropdown.querySelector('.nav-item');
                const menu = dropdown.querySelector('.dropdown-menu, .mega-dropdown');
                let closeTimeout;

                // Don't initialize with display:none - let CSS handle it

                if (trigger) {
                    trigger.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.toggleDropdown(dropdown);
                    });

                    // Support hover on desktop with delay
                    if (window.innerWidth > 968) {
                        dropdown.addEventListener('mouseenter', () => {
                            clearTimeout(closeTimeout);
                            this.openDropdown(dropdown);
                        });

                        dropdown.addEventListener('mouseleave', () => {
                            closeTimeout = setTimeout(() => {
                                this.closeDropdown(dropdown);
                            }, 300); // 300ms delay before closing
                        });

                        // Keep dropdown open when hovering over the menu itself
                        if (menu) {
                            menu.addEventListener('mouseenter', () => {
                                clearTimeout(closeTimeout);
                            });

                            menu.addEventListener('mouseleave', () => {
                                closeTimeout = setTimeout(() => {
                                    this.closeDropdown(dropdown);
                                }, 300);
                            });
                        }
                    }
                }
            });

            // Close dropdowns when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.nav-dropdown') && this.activeDropdown) {
                    this.closeDropdown(this.activeDropdown);
                }
            });

            // Escape key handling
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (this.mobileMenuOpen) {
                        this.closeMobileMenu();
                    }
                    if (this.activeDropdown) {
                        this.closeDropdown(this.activeDropdown);
                    }
                }
            });

            // Mobile navigation links
            const mobileLinks = document.querySelectorAll('.mobile-nav-link');
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
            });
        }

        toggleMobileMenu() {
            if (this.mobileMenuOpen) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }

        openMobileMenu() {
            this.mobileMenuOpen = true;

            const menuToggle = document.getElementById('menuToggle');
            const mobileNav = document.getElementById('mobileNav');
            const overlay = document.getElementById('mobileNavOverlay');

            if (menuToggle) {
                menuToggle.classList.add('active');
                menuToggle.setAttribute('aria-expanded', 'true');
            }

            if (mobileNav) {
                mobileNav.classList.add('active');
                mobileNav.setAttribute('aria-hidden', 'false');
            }

            if (overlay) {
                overlay.classList.add('active');
            }

            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }

        closeMobileMenu() {
            this.mobileMenuOpen = false;

            const menuToggle = document.getElementById('menuToggle');
            const mobileNav = document.getElementById('mobileNav');
            const overlay = document.getElementById('mobileNavOverlay');

            if (menuToggle) {
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }

            if (mobileNav) {
                mobileNav.classList.remove('active');
                mobileNav.setAttribute('aria-hidden', 'true');
            }

            if (overlay) {
                overlay.classList.remove('active');
            }

            // Restore body scroll
            document.body.style.overflow = '';
        }

        toggleDropdown(dropdown) {
            if (this.activeDropdown === dropdown) {
                this.closeDropdown(dropdown);
            } else {
                if (this.activeDropdown) {
                    this.closeDropdown(this.activeDropdown);
                }
                this.openDropdown(dropdown);
            }
        }

        openDropdown(dropdown) {
            const trigger = dropdown.querySelector('.nav-item');
            const menu = dropdown.querySelector('.dropdown-menu, .mega-dropdown');

            dropdown.classList.add('active');
            if (trigger) trigger.setAttribute('aria-expanded', 'true');

            // Let CSS handle the positioning - just ensure visibility
            if (menu) {
                menu.classList.add('show');
                // Only set z-index to ensure it appears above other elements
                menu.style.zIndex = '10000';

                // Check if dropdown goes off screen and adjust if needed
                setTimeout(() => {
                    const menuRect = menu.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;

                    // Only intervene if dropdown is cut off
                    if (menuRect.right > viewportWidth - 20) {
                        // Shift left to fit in viewport
                        const overflow = menuRect.right - (viewportWidth - 20);
                        menu.style.marginLeft = `-${overflow}px`;
                    } else if (menuRect.left < 20) {
                        // Shift right to fit in viewport
                        const overflow = 20 - menuRect.left;
                        menu.style.marginLeft = `${overflow}px`;
                    }
                }, 10);
            }

            this.activeDropdown = dropdown;
        }

        closeDropdown(dropdown) {
            const trigger = dropdown.querySelector('.nav-item');
            const menu = dropdown.querySelector('.dropdown-menu, .mega-dropdown');

            // Remove active classes and clean up any inline styles
            dropdown.classList.remove('active');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
            if (menu) {
                menu.classList.remove('show');
                menu.style.marginLeft = ''; // Clear any margin adjustments
            }

            this.activeDropdown = null;
        }

        setupScrollEffects() {
            let ticking = false;

            const updateScrollProgress = () => {
                const progressBar = document.getElementById('progressBar');
                const header = document.getElementById('header');

                if (progressBar) {
                    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
                    const progress = (window.scrollY / windowHeight) * 100;
                    progressBar.style.width = Math.min(progress, 100) + '%';
                }

                if (header) {
                    if (window.scrollY > 50) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                }

                ticking = false;
            };

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(updateScrollProgress);
                    ticking = true;
                }
            }, { passive: true });
        }
    }

    // Auto-initialize when DOM is ready
    function initNavigation() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                new InlineNavigation();
            });
        } else {
            new InlineNavigation();
        }
    }

    // Initialize immediately
    initNavigation();

})();