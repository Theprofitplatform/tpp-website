/**
 * Mobile Navigation Handler
 * Handles mobile menu toggle, scroll effects, and accessibility
 */

class MobileNavigation {
    constructor() {
        this.isOpen = false;
        this.menuToggle = document.querySelector('.menu-toggle');
        this.mobileNav = document.querySelector('.mobile-nav');
        this.mobileOverlay = document.querySelector('.mobile-nav-overlay');
        this.mobileClose = document.querySelector('.mobile-nav-close');
        this.premiumNav = document.querySelector('.premium-nav');

        this.init();
    }

    init() {
        this.bindEvents();
        this.handleScroll();
        this.setActiveLink();
        this.createMobileNavIfNeeded();
    }

    createMobileNavIfNeeded() {
        // Only create mobile nav elements if they don't exist
        if (!this.mobileNav) {
            this.createMobileNavElements();
        }
    }

    createMobileNavElements() {
        // Create mobile navigation overlay
        const overlay = document.createElement('div');
        overlay.className = 'mobile-nav-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(overlay);

        // Create mobile navigation panel
        const mobileNav = document.createElement('div');
        mobileNav.className = 'mobile-nav';
        mobileNav.setAttribute('aria-label', 'Mobile navigation');
        mobileNav.setAttribute('role', 'navigation');

        // Create mobile nav content
        mobileNav.innerHTML = `
            <div class="mobile-nav-header">
                <div class="mobile-nav-logo">
                    <img src="images/optimized/logo.png" alt="The Profit Platform" loading="lazy">
                </div>
                <div class="mobile-nav-tagline">Digital Marketing Excellence</div>
                <button class="mobile-nav-close" aria-label="Close mobile menu" type="button">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <nav class="mobile-nav-links" role="list">
                <a href="index.html" class="mobile-nav-link" role="listitem">
                    <i class="fas fa-home mobile-nav-icon"></i>
                    Home
                </a>
                <a href="services.html" class="mobile-nav-link" role="listitem">
                    <i class="fas fa-rocket mobile-nav-icon"></i>
                    Services
                </a>
                <div class="mobile-nav-submenu">
                    <a href="seo.html" class="mobile-nav-link" role="listitem">
                        <i class="fas fa-search mobile-nav-icon"></i>
                        SEO & Local Search
                    </a>
                    <a href="web-design.html" class="mobile-nav-link" role="listitem">
                        <i class="fas fa-paint-brush mobile-nav-icon"></i>
                        Web Design
                    </a>
                    <a href="google-ads.html" class="mobile-nav-link" role="listitem">
                        <i class="fas fa-bullhorn mobile-nav-icon"></i>
                        Google & Meta Ads
                    </a>
                </div>
                <a href="pricing.html" class="mobile-nav-link" role="listitem">
                    <i class="fas fa-dollar-sign mobile-nav-icon"></i>
                    Pricing
                </a>
                <a href="about.html" class="mobile-nav-link" role="listitem">
                    <i class="fas fa-users mobile-nav-icon"></i>
                    About
                </a>
                <a href="contact.html" class="mobile-nav-link" role="listitem">
                    <i class="fas fa-envelope mobile-nav-icon"></i>
                    Contact
                </a>
            </nav>
            <div class="mobile-nav-cta">
                <a href="contact.html" class="mobile-cta-btn">
                    <i class="fas fa-comments mobile-cta-icon"></i>
                    Get Free Consultation
                </a>
            </div>
        `;

        document.body.appendChild(mobileNav);

        // Update references
        this.mobileNav = mobileNav;
        this.mobileOverlay = overlay;
        this.mobileClose = mobileNav.querySelector('.mobile-nav-close');
    }

    bindEvents() {
        // Menu toggle click
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMenu();
            });
        }

        // Close button click
        if (this.mobileClose) {
            this.mobileClose.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeMenu();
            });
        }

        // Overlay click
        if (this.mobileOverlay) {
            this.mobileOverlay.addEventListener('click', () => {
                this.closeMenu();
            });
        }

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });

        // Scroll events
        window.addEventListener('scroll', this.throttle(() => {
            this.handleScroll();
        }, 16));

        // Resize events
        window.addEventListener('resize', this.throttle(() => {
            if (window.innerWidth > 968 && this.isOpen) {
                this.closeMenu();
            }
        }, 250));

        // Mobile nav link clicks
        if (this.mobileNav) {
            this.mobileNav.addEventListener('click', (e) => {
                if (e.target.matches('.mobile-nav-link')) {
                    this.closeMenu();
                    this.setActiveLink(e.target.href);
                }
            });
        }
    }

    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.isOpen = true;

        // Add active classes
        if (this.menuToggle) this.menuToggle.classList.add('active');
        if (this.mobileNav) this.mobileNav.classList.add('active');
        if (this.mobileOverlay) this.mobileOverlay.classList.add('active');

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Focus management
        this.trapFocus();

        // Announce to screen readers
        if (this.mobileNav) {
            this.mobileNav.setAttribute('aria-hidden', 'false');
        }
    }

    closeMenu() {
        this.isOpen = false;

        // Remove active classes
        if (this.menuToggle) this.menuToggle.classList.remove('active');
        if (this.mobileNav) this.mobileNav.classList.remove('active');
        if (this.mobileOverlay) this.mobileOverlay.classList.remove('active');

        // Restore body scroll
        document.body.style.overflow = '';

        // Return focus to toggle button
        if (this.menuToggle) this.menuToggle.focus();

        // Hide from screen readers
        if (this.mobileNav) {
            this.mobileNav.setAttribute('aria-hidden', 'true');
        }
    }

    handleScroll() {
        if (!this.premiumNav) return;

        const scrollY = window.scrollY;

        if (scrollY > 50) {
            this.premiumNav.classList.add('scrolled');
        } else {
            this.premiumNav.classList.remove('scrolled');
        }
    }

    setActiveLink(currentUrl = window.location.href) {
        const links = document.querySelectorAll('.mobile-nav-link');
        links.forEach(link => {
            link.classList.remove('active');
            if (link.href === currentUrl ||
                (currentUrl.includes(link.pathname) && link.pathname !== '/')) {
                link.classList.add('active');
            }
        });
    }

    trapFocus() {
        if (!this.mobileNav) return;

        const focusableElements = this.mobileNav.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Focus first element
        firstElement.focus();

        // Handle tab navigation
        this.mobileNav.addEventListener('keydown', (e) => {
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

    // Utility function for throttling
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
}

// Initialize mobile navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MobileNavigation();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Close mobile menu when page becomes hidden
        const mobileNav = document.querySelector('.mobile-nav');
        if (mobileNav && mobileNav.classList.contains('active')) {
            const navInstance = new MobileNavigation();
            navInstance.closeMenu();
        }
    }
});

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileNavigation;
}