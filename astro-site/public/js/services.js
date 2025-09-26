/**
 * Services Page JavaScript
 * Handles interactive elements and functionality for the services page
 */

(function() {
    'use strict';

    class ServicesPage {
        constructor() {
            this.init();
        }

        init() {
            console.log('Services page JavaScript loaded');

            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.setupEventListeners();
                    this.setupAnimations();
                    this.setupFormHandling();
                });
            } else {
                this.setupEventListeners();
                this.setupAnimations();
                this.setupFormHandling();
            }
        }

        setupEventListeners() {
            // Service card interactions
            this.setupServiceCards();

            // FAQ accordion functionality
            this.setupFAQ();

            // Package selection
            this.setupPackageSelection();

            // CTA button tracking
            this.setupCTATracking();

            // Smooth scrolling for anchor links
            this.setupSmoothScrolling();
        }

        setupServiceCards() {
            const serviceCards = document.querySelectorAll('.service-card');

            serviceCards.forEach(card => {
                // Add hover effects
                card.addEventListener('mouseenter', () => {
                    card.classList.add('hover');
                });

                card.addEventListener('mouseleave', () => {
                    card.classList.remove('hover');
                });

                // Track service card clicks
                card.addEventListener('click', (e) => {
                    const serviceName = card.dataset.service || 'unknown';
                    console.log(`Service card clicked: ${serviceName}`);

                    // Add click animation
                    card.classList.add('clicked');
                    setTimeout(() => {
                        card.classList.remove('clicked');
                    }, 200);
                });
            });
        }

        setupFAQ() {
            const faqItems = document.querySelectorAll('.faq-item');

            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question');
                const answer = item.querySelector('.faq-answer');
                const icon = item.querySelector('.faq-icon');

                if (question && answer) {
                    question.addEventListener('click', () => {
                        const isOpen = item.classList.contains('active');

                        // Close all other FAQ items
                        faqItems.forEach(otherItem => {
                            if (otherItem !== item) {
                                otherItem.classList.remove('active');
                                const otherAnswer = otherItem.querySelector('.faq-answer');
                                const otherIcon = otherItem.querySelector('.faq-icon');
                                if (otherAnswer) otherAnswer.style.maxHeight = null;
                                if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                            }
                        });

                        // Toggle current item
                        if (isOpen) {
                            item.classList.remove('active');
                            answer.style.maxHeight = null;
                            if (icon) icon.style.transform = 'rotate(0deg)';
                        } else {
                            item.classList.add('active');
                            answer.style.maxHeight = answer.scrollHeight + 'px';
                            if (icon) icon.style.transform = 'rotate(45deg)';
                        }
                    });
                }
            });
        }

        setupPackageSelection() {
            const packageCards = document.querySelectorAll('.package-card');

            packageCards.forEach(card => {
                const ctaButton = card.querySelector('.package-cta');

                if (ctaButton) {
                    ctaButton.addEventListener('click', (e) => {
                        const packageName = card.querySelector('.package-name')?.textContent || 'Unknown';
                        console.log(`Package selected: ${packageName}`);

                        // Add selection animation
                        card.classList.add('selected');
                        setTimeout(() => {
                            card.classList.remove('selected');
                        }, 1000);
                    });
                }
            });
        }

        setupCTATracking() {
            const ctaButtons = document.querySelectorAll('.btn, .cta, .hero-primary-btn, .service-cta');

            ctaButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const buttonText = button.textContent.trim();
                    const buttonType = button.className;

                    console.log(`CTA clicked: ${buttonText}`, { type: buttonType });

                    // Add click effect
                    button.classList.add('clicked');
                    setTimeout(() => {
                        button.classList.remove('clicked');
                    }, 150);
                });
            });
        }

        setupSmoothScrolling() {
            const scrollLinks = document.querySelectorAll('a[href^="#"]');

            scrollLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href');
                    const target = document.querySelector(href);

                    if (target) {
                        e.preventDefault();

                        const headerHeight = document.querySelector('header')?.offsetHeight || 100;
                        const targetPosition = target.offsetTop - headerHeight - 20;

                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        }

        setupAnimations() {
            // Intersection Observer for scroll animations
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            }, observerOptions);

            // Observe elements for animation
            const animateElements = document.querySelectorAll([
                '.service-card',
                '.package-card',
                '.case-study-card',
                '.process-step',
                '.hero-stats .stat-item',
                '.section-header'
            ].join(', '));

            animateElements.forEach(el => {
                el.classList.add('animate-ready');
                observer.observe(el);
            });
        }

        setupFormHandling() {
            const contactForm = document.getElementById('contactForm');

            if (contactForm) {
                contactForm.addEventListener('submit', (e) => {
                    e.preventDefault();

                    const formData = new FormData(contactForm);
                    const formObject = {};

                    for (let [key, value] of formData.entries()) {
                        formObject[key] = value;
                    }

                    console.log('Form submitted:', formObject);

                    // Add form submission feedback
                    const submitButton = contactForm.querySelector('button[type="submit"]');
                    if (submitButton) {
                        const originalText = submitButton.innerHTML;
                        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                        submitButton.disabled = true;

                        // Simulate form submission
                        setTimeout(() => {
                            submitButton.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                            submitButton.classList.add('success');

                            setTimeout(() => {
                                submitButton.innerHTML = originalText;
                                submitButton.disabled = false;
                                submitButton.classList.remove('success');
                                contactForm.reset();
                            }, 3000);
                        }, 2000);
                    }
                });

                // Form validation
                const requiredFields = contactForm.querySelectorAll('[required]');
                requiredFields.forEach(field => {
                    field.addEventListener('blur', () => {
                        this.validateField(field);
                    });

                    field.addEventListener('input', () => {
                        if (field.classList.contains('error')) {
                            this.validateField(field);
                        }
                    });
                });
            }
        }

        validateField(field) {
            const value = field.value.trim();
            const isValid = field.checkValidity();

            field.classList.remove('error', 'success');

            // Remove existing error message
            const existingError = field.parentNode.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }

            if (!isValid && value) {
                field.classList.add('error');

                // Add error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = field.validationMessage;
                field.parentNode.appendChild(errorMessage);
            } else if (isValid && value) {
                field.classList.add('success');
            }
        }

        // Utility method to get element position
        getElementPosition(element) {
            const rect = element.getBoundingClientRect();
            return {
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
                right: rect.right + window.scrollX,
                bottom: rect.bottom + window.scrollY
            };
        }

        // Method to highlight element (useful for debugging)
        highlightElement(element, duration = 2000) {
            element.style.outline = '3px solid #ff0000';
            element.style.outlineOffset = '2px';

            setTimeout(() => {
                element.style.outline = '';
                element.style.outlineOffset = '';
            }, duration);
        }
    }

    // Initialize services page
    new ServicesPage();

})();