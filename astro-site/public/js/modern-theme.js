/**
 * Modern Theme JavaScript
 * Animation helpers and interactive components
 * Include after AOS library
 */

// Modern Theme Configuration
const ModernTheme = {
    // Animation settings
    animation: {
        duration: 800,
        easing: 'ease-out',
        once: true,
        offset: 120,
        delay: 100
    },

    // Initialization
    init() {
        this.initAOS();
        this.initScrollEffects();
        this.initCardInteractions();
        this.initButtonEffects();
        this.initFormEnhancements();
        this.initResponsiveHelpers();

        // Log initialization
        console.log('🎨 Modern Theme initialized');
    },

    // Initialize AOS (Animate On Scroll)
    initAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: this.animation.duration,
                easing: this.animation.easing,
                once: this.animation.once,
                offset: this.animation.offset,
                delay: this.animation.delay
            });
            console.log('✨ AOS animations initialized');
        } else {
            console.warn('⚠️ AOS library not found. Please include AOS for animations to work.');
        }
    },

    // Enhanced scroll effects
    initScrollEffects() {
        // Parallax effect for hero background elements
        const heroElements = document.querySelectorAll('.hero-floating-elements .floating-orb');

        if (heroElements.length > 0) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;

                heroElements.forEach((element, index) => {
                    const speed = (index + 1) * 0.3;
                    element.style.transform = `translateY(${rate * speed}px)`;
                });
            });
        }

        // Header scroll effect (if using modern nav)
        const header = document.querySelector('.premium-nav');
        if (header) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 100) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });
        }
    },

    // Enhanced card interactions
    initCardInteractions() {
        const cards = document.querySelectorAll('.card-modern');

        cards.forEach(card => {
            // Add magnetic effect on mouse move
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
            });

            // Reset transform on mouse leave
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });

            // Add ripple effect on click
            card.addEventListener('click', (e) => {
                this.createRipple(e, card);
            });
        });
    },

    // Enhanced button effects
    initButtonEffects() {
        const buttons = document.querySelectorAll('.btn-primary-modern, .btn-secondary-modern, .btn-card');

        buttons.forEach(button => {
            // Add ripple effect
            button.addEventListener('click', (e) => {
                this.createRipple(e, button);
            });

            // Add magnetic effect
            button.addEventListener('mousemove', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) translateY(-2px)`;
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = '';
            });
        });
    },

    // Form enhancements
    initFormEnhancements() {
        const inputs = document.querySelectorAll('.form-input-modern');

        inputs.forEach(input => {
            // Add focus animations
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
                if (input.value) {
                    input.parentElement.classList.add('filled');
                } else {
                    input.parentElement.classList.remove('filled');
                }
            });

            // Auto-resize textareas
            if (input.tagName === 'TEXTAREA') {
                input.addEventListener('input', () => {
                    input.style.height = 'auto';
                    input.style.height = input.scrollHeight + 'px';
                });
            }
        });
    },

    // Responsive helpers
    initResponsiveHelpers() {
        // Add touch device detection
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
        }

        // Add viewport size classes
        const updateViewportClasses = () => {
            const width = window.innerWidth;
            const body = document.body;

            // Remove existing classes
            body.classList.remove('viewport-xs', 'viewport-sm', 'viewport-md', 'viewport-lg', 'viewport-xl');

            // Add appropriate class
            if (width < 480) {
                body.classList.add('viewport-xs');
            } else if (width < 768) {
                body.classList.add('viewport-sm');
            } else if (width < 968) {
                body.classList.add('viewport-md');
            } else if (width < 1200) {
                body.classList.add('viewport-lg');
            } else {
                body.classList.add('viewport-xl');
            }
        };

        updateViewportClasses();
        window.addEventListener('resize', updateViewportClasses);
    },

    // Create ripple effect
    createRipple(event, element) {
        const circle = document.createElement('span');
        const diameter = Math.max(element.clientWidth, element.clientHeight);
        const radius = diameter / 2;

        const rect = element.getBoundingClientRect();
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        circle.classList.add('ripple');

        // Add ripple styles if not already added
        if (!document.querySelector('.ripple-styles')) {
            const style = document.createElement('style');
            style.classList.add('ripple-styles');
            style.textContent = `
                .ripple {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.6);
                    transform: scale(0);
                    animation: ripple-animation 0.6s linear;
                    pointer-events: none;
                }

                @keyframes ripple-animation {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        const ripple = element.querySelector('.ripple');
        if (ripple) {
            ripple.remove();
        }

        element.appendChild(circle);

        // Clean up after animation
        setTimeout(() => {
            circle.remove();
        }, 600);
    },

    // Utility: Smooth scroll to element
    scrollTo(selector, offset = 0) {
        const element = document.querySelector(selector);
        if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    },

    // Utility: Add loading state to buttons
    setButtonLoading(button, loading = true) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;

            const originalText = button.innerHTML;
            button.dataset.originalText = originalText;
            button.innerHTML = `
                <div class="spinner-modern" style="width: 20px; height: 20px; border-width: 2px; margin-right: 8px;"></div>
                Loading...
            `;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            button.innerHTML = button.dataset.originalText || button.innerHTML;
        }
    },

    // Utility: Create toast notification
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.classList.add('toast-modern', `toast-${type}`);
        toast.innerHTML = `
            <div class="toast-content">
                <span>${message}</span>
                <button class="toast-close">&times;</button>
            </div>
        `;

        // Add toast styles if not already added
        if (!document.querySelector('.toast-styles')) {
            const style = document.createElement('style');
            style.classList.add('toast-styles');
            style.textContent = `
                .toast-modern {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 12px;
                    padding: 16px 20px;
                    box-shadow: 0 10px 40px rgba(59, 130, 246, 0.2);
                    z-index: 1000;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    border-left: 4px solid var(--primary-blue);
                    max-width: 350px;
                }

                .toast-modern.show {
                    transform: translateX(0);
                }

                .toast-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                }

                .toast-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    opacity: 0.6;
                    transition: opacity 0.2s ease;
                }

                .toast-close:hover {
                    opacity: 1;
                }

                .toast-success {
                    border-left-color: var(--success);
                }

                .toast-warning {
                    border-left-color: var(--warning);
                }

                .toast-error {
                    border-left-color: var(--error);
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto remove
        const removeToast = () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        };

        if (duration > 0) {
            setTimeout(removeToast, duration);
        }

        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', removeToast);
    },

    // Utility: Create modal
    createModal(content, options = {}) {
        const defaults = {
            closable: true,
            backdrop: true,
            size: 'medium'
        };

        const settings = { ...defaults, ...options };

        const modal = document.createElement('div');
        modal.classList.add('modal-modern');
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-container modal-${settings.size}">
                <div class="modal-content">
                    ${settings.closable ? '<button class="modal-close">&times;</button>' : ''}
                    ${content}
                </div>
            </div>
        `;

        // Add modal styles if not already added
        if (!document.querySelector('.modal-styles')) {
            const style = document.createElement('style');
            style.classList.add('modal-styles');
            style.textContent = `
                .modal-modern {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                }

                .modal-modern.show {
                    opacity: 1;
                    visibility: visible;
                }

                .modal-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(15, 23, 42, 0.8);
                    backdrop-filter: blur(4px);
                }

                .modal-container {
                    position: relative;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    padding: 2rem;
                    transform: scale(0.9);
                    transition: transform 0.3s ease;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal-modern.show .modal-container {
                    transform: scale(1);
                }

                .modal-small { max-width: 400px; }
                .modal-medium { max-width: 600px; }
                .modal-large { max-width: 800px; }

                .modal-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    opacity: 0.6;
                    transition: opacity 0.2s ease;
                }

                .modal-close:hover {
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);

        // Show modal
        setTimeout(() => modal.classList.add('show'), 100);

        // Close handlers
        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        };

        if (settings.closable) {
            modal.querySelector('.modal-close').addEventListener('click', closeModal);
        }

        if (settings.backdrop) {
            modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
        }

        // ESC key handler
        const handleEscape = (e) => {
            if (e.key === 'Escape' && settings.closable) {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        return modal;
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ModernTheme.init());
} else {
    ModernTheme.init();
}

// Refresh AOS on dynamic content changes
const refreshAnimations = () => {
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
};

// Export for global use
window.ModernTheme = ModernTheme;
window.refreshAnimations = refreshAnimations;

// Usage Examples:
/*

// Show a success toast
ModernTheme.showToast('Settings saved successfully!', 'success');

// Create a modal
ModernTheme.createModal(`
    <h3>Confirm Action</h3>
    <p>Are you sure you want to continue?</p>
    <div style="display: flex; gap: 1rem; margin-top: 2rem;">
        <button class="btn-primary-modern">Confirm</button>
        <button class="btn-secondary-modern">Cancel</button>
    </div>
`);

// Set button loading state
const submitBtn = document.querySelector('#submit-btn');
ModernTheme.setButtonLoading(submitBtn, true);

// Smooth scroll to section
ModernTheme.scrollTo('#pricing', 100);

// Refresh animations after adding new content
refreshAnimations();

*/