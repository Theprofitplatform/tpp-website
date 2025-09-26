/**
 * Ultra-Enhanced Pricing Page JavaScript
 * Advanced UI/UX features with modern patterns
 */

class UltraPricingEnhancer {
    constructor() {
        this.state = {
            billingCycle: 'monthly',
            selectedPlan: null,
            testimonialIndex: 0,
            savingsCalculator: {
                visitors: 1000,
                conversionRate: 2,
                averageValue: 100
            },
            countdown: {
                hours: 23,
                minutes: 59,
                seconds: 59
            }
        };

        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeAll());
        } else {
            this.initializeAll();
        }
    }

    initializeAll() {
        this.initBillingToggle();
        this.initAdvancedCardEffects();
        this.initTestimonialCarousel();
        this.initSavingsCalculator();
        this.initCountdownTimer();
        this.initComparisonTable();
        this.initChatWidget();
        this.initScrollAnimations();
        this.initValuePropositions();
        this.initTrustBadges();
        this.initMicroInteractions();
        this.trackUserEngagement();
    }

    // Billing Toggle with Animation
    initBillingToggle() {
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'pricing-toggle';
        toggleContainer.innerHTML = `
            <span class="toggle-option active" data-billing="monthly">Monthly</span>
            <span class="toggle-option" data-billing="annual">
                Annual
                <span class="toggle-badge">Save 20%</span>
            </span>
        `;

        const togglePlaceholder = document.getElementById('billing-toggle-container');
        if (togglePlaceholder) {
            togglePlaceholder.appendChild(toggleContainer);
        } else {
            const pricingSection = document.querySelector('.pricing-grid-enhanced');
            if (pricingSection) {
                pricingSection.parentNode.insertBefore(toggleContainer, pricingSection);
            }
        }

        toggleContainer.querySelectorAll('.toggle-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.handleBillingChange(e.target.dataset.billing);
                this.updateToggleUI(e.target);
            });
        });
    }

    handleBillingChange(billing) {
        this.state.billingCycle = billing;
        const priceElements = document.querySelectorAll('.pricing-price-enhanced');

        priceElements.forEach((elem, index) => {
            const monthlyPrice = [997, 1497, 2997][index];
            const annualPrice = Math.floor(monthlyPrice * 0.8);
            const newPrice = billing === 'annual' ? annualPrice : monthlyPrice;

            this.animatePrice(elem, newPrice);
        });

        // Update period text
        document.querySelectorAll('.pricing-period-enhanced').forEach((elem, index) => {
            if (index < 2) { // Only for monthly services
                elem.textContent = billing === 'annual' ? 'per month (billed annually)' : 'per month';
            }
        });
    }

    animatePrice(element, newPrice) {
        const currentPrice = parseInt(element.textContent.replace(/\D/g, ''));
        const duration = 500;
        const steps = 30;
        const increment = (newPrice - currentPrice) / steps;
        let current = currentPrice;
        let step = 0;

        const timer = setInterval(() => {
            current += increment;
            step++;

            element.innerHTML = `<span class="pricing-currency">$</span>${Math.round(current).toLocaleString()}`;

            if (step >= steps) {
                clearInterval(timer);
                element.innerHTML = `<span class="pricing-currency">$</span>${newPrice.toLocaleString()}`;
            }
        }, duration / steps);
    }

    updateToggleUI(selected) {
        document.querySelectorAll('.toggle-option').forEach(opt => {
            opt.classList.remove('active');
        });
        selected.classList.add('active');
    }

    // Advanced Card Effects
    initAdvancedCardEffects() {
        const cards = document.querySelectorAll('.pricing-card-enhanced');

        cards.forEach((card, index) => {
            // 3D tilt effect
            card.addEventListener('mousemove', (e) => this.handle3DTilt(e, card));
            card.addEventListener('mouseleave', () => this.reset3DTilt(card));

            // Magnetic button effect
            const button = card.querySelector('.btn-pricing-enhanced');
            if (button) {
                button.addEventListener('mousemove', (e) => this.magneticEffect(e, button));
                button.addEventListener('mouseleave', () => this.resetMagnetic(button));
            }

            // Add popularity indicator to featured card
            if (card.classList.contains('featured')) {
                const popularity = document.createElement('div');
                popularity.className = 'pricing-popularity';
                popularity.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    Most Popular
                `;
                card.appendChild(popularity);
            }

            // Feature tooltips
            this.addFeatureTooltips(card);
        });
    }

    handle3DTilt(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.transition = 'transform 0.1s ease-out';

        // Gradient follow effect
        const gradientX = (x / rect.width) * 100;
        const gradientY = (y / rect.height) * 100;
        card.style.background = `
            radial-gradient(circle at ${gradientX}% ${gradientY}%,
                rgba(59, 130, 246, 0.05) 0%,
                transparent 50%),
            linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))
        `;
    }

    reset3DTilt(card) {
        card.style.transform = '';
        card.style.transition = 'transform 0.3s ease-out';
        card.style.background = '';
    }

    magneticEffect(e, button) {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        button.style.transition = 'transform 0.1s ease-out';
    }

    resetMagnetic(button) {
        button.style.transform = '';
        button.style.transition = 'transform 0.3s ease-out';
    }

    addFeatureTooltips(card) {
        const features = card.querySelectorAll('.pricing-features-enhanced li');
        const tooltipData = {
            'keyword research': 'In-depth analysis to find high-converting keywords',
            'on-page SEO': 'Complete optimization of your website content and structure',
            'technical SEO': 'Backend improvements for better search engine crawling',
            'Local SEO': 'Dominate local search results and Google Maps',
            'Content strategy': 'Data-driven content planning for maximum impact',
            'A/B testing': 'Continuous testing to improve conversion rates',
            'conversion tracking': 'Detailed analytics to measure your ROI',
            'Landing page': 'Custom pages designed to convert visitors'
        };

        features.forEach(feature => {
            const text = feature.textContent.toLowerCase();
            for (const [key, tooltip] of Object.entries(tooltipData)) {
                if (text.includes(key.toLowerCase())) {
                    const tooltipElem = document.createElement('span');
                    tooltipElem.className = 'feature-tooltip';
                    tooltipElem.innerHTML = `
                        <span class="feature-tooltip-icon">?</span>
                        <span class="feature-tooltip-content">${tooltip}</span>
                    `;
                    feature.appendChild(tooltipElem);
                    break;
                }
            }
        });
    }

    // Testimonial Carousel
    initTestimonialCarousel() {
        const testimonials = [
            {
                text: "The Profit Platform transformed our online presence. Our organic traffic increased by 300% in just 4 months!",
                name: "Sarah Mitchell",
                role: "CEO, TechStart Sydney",
                rating: 5,
                avatar: "SM"
            },
            {
                text: "Best investment we've made. The Google Ads campaigns are incredibly targeted and our ROI has never been better.",
                name: "James Chen",
                role: "Marketing Director, Retail Plus",
                rating: 5,
                avatar: "JC"
            },
            {
                text: "Professional, results-driven, and always available. They truly understand the Sydney market.",
                name: "Emma Thompson",
                role: "Founder, Wellness Hub",
                rating: 5,
                avatar: "ET"
            }
        ];

        const carousel = document.createElement('div');
        carousel.className = 'testimonial-carousel';
        carousel.innerHTML = `
            <h3 style="text-align: center; margin-bottom: 2rem; color: #1e293b;">What Our Clients Say</h3>
            <div class="testimonial-slide">
                <div class="testimonial-content">
                    <p class="testimonial-text">${testimonials[0].text}</p>
                    <div class="testimonial-author">
                        <div class="testimonial-avatar">${testimonials[0].avatar}</div>
                        <div class="testimonial-info">
                            <div class="testimonial-name">${testimonials[0].name}</div>
                            <div class="testimonial-role">${testimonials[0].role}</div>
                            <div class="testimonial-rating">
                                ${'★'.repeat(testimonials[0].rating)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div style="display: flex; justify-content: center; gap: 0.5rem; margin-top: 2rem;">
                ${testimonials.map((_, i) => `
                    <button class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"
                            style="width: 10px; height: 10px; border-radius: 50%;
                                   border: none; background: ${i === 0 ? '#3b82f6' : '#e2e8f0'};
                                   cursor: pointer; transition: all 0.3s ease;"></button>
                `).join('')}
            </div>
        `;

        const carouselContainer = document.getElementById('testimonial-carousel-container');
        if (carouselContainer) {
            carouselContainer.appendChild(carousel);
        } else {
            const pricingSection = document.querySelector('.pricing-section');
            if (pricingSection) {
                pricingSection.appendChild(carousel);
            }
        }

        // Auto-rotate testimonials
        setInterval(() => {
            this.state.testimonialIndex = (this.state.testimonialIndex + 1) % testimonials.length;
            this.updateTestimonial(testimonials[this.state.testimonialIndex]);
        }, 5000);

        // Manual navigation
        carousel.querySelectorAll('.carousel-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                this.state.testimonialIndex = parseInt(e.target.dataset.index);
                this.updateTestimonial(testimonials[this.state.testimonialIndex]);
            });
        });
    }

    updateTestimonial(testimonial) {
        const slide = document.querySelector('.testimonial-slide');
        slide.style.opacity = '0';
        slide.style.transform = 'translateX(-20px)';

        setTimeout(() => {
            slide.querySelector('.testimonial-text').textContent = testimonial.text;
            slide.querySelector('.testimonial-name').textContent = testimonial.name;
            slide.querySelector('.testimonial-role').textContent = testimonial.role;
            slide.querySelector('.testimonial-avatar').textContent = testimonial.avatar;
            slide.querySelector('.testimonial-rating').innerHTML = '★'.repeat(testimonial.rating);

            slide.style.opacity = '1';
            slide.style.transform = 'translateX(0)';
            slide.style.transition = 'all 0.5s ease';
        }, 300);

        // Update dots
        document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.style.background = i === this.state.testimonialIndex ? '#3b82f6' : '#e2e8f0';
        });
    }

    // Savings Calculator
    initSavingsCalculator() {
        const calculator = document.createElement('div');
        calculator.className = 'savings-calculator';
        calculator.innerHTML = `
            <h3 style="text-align: center; margin-bottom: 2rem; color: #1e293b;">Calculate Your ROI</h3>
            <div class="calculator-controls">
                <div style="margin-bottom: 2rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: #64748b;">
                        Monthly Website Visitors: <span id="visitors-value" style="color: #3b82f6; font-weight: 700;">1,000</span>
                    </label>
                    <input type="range" id="visitors-slider" min="100" max="10000" value="1000" step="100"
                           style="width: 100%; cursor: pointer;">
                </div>
                <div style="margin-bottom: 2rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: #64748b;">
                        Conversion Rate Improvement: <span id="conversion-value" style="color: #3b82f6; font-weight: 700;">2%</span>
                    </label>
                    <input type="range" id="conversion-slider" min="0.5" max="10" value="2" step="0.5"
                           style="width: 100%; cursor: pointer;">
                </div>
                <div style="margin-bottom: 2rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: #64748b;">
                        Average Order Value: $<span id="value-value" style="color: #3b82f6; font-weight: 700;">100</span>
                    </label>
                    <input type="range" id="value-slider" min="50" max="1000" value="100" step="50"
                           style="width: 100%; cursor: pointer;">
                </div>
            </div>
            <div class="calculator-result">
                <div style="color: #64748b; margin-bottom: 0.5rem;">Estimated Monthly Revenue Increase</div>
                <div class="savings-amount">$2,000</div>
                <div style="color: #10b981; font-weight: 600; margin-top: 1rem;">
                    That's a <span id="roi-percentage">200%</span> ROI on our SEO service!
                </div>
            </div>
        `;

        const calculatorContainer = document.getElementById('savings-calculator-container');
        if (calculatorContainer) {
            calculatorContainer.appendChild(calculator);
        } else {
            const faqSection = document.querySelector('.pricing-faq');
            if (faqSection) {
                faqSection.parentNode.insertBefore(calculator, faqSection);
            }
        }

        // Calculator interactions
        ['visitors', 'conversion', 'value'].forEach(param => {
            const slider = document.getElementById(`${param}-slider`);
            if (slider) {
                slider.addEventListener('input', (e) => {
                    this.updateCalculator(param, e.target.value);
                });
            }
        });
    }

    updateCalculator(param, value) {
        const params = {
            visitors: param === 'visitors' ? parseInt(value) : this.state.savingsCalculator.visitors,
            conversion: param === 'conversion' ? parseFloat(value) : this.state.savingsCalculator.conversionRate,
            value: param === 'value' ? parseInt(value) : this.state.savingsCalculator.averageValue
        };

        // Update display values
        if (param === 'visitors') document.getElementById('visitors-value').textContent = value.toLocaleString();
        if (param === 'conversion') document.getElementById('conversion-value').textContent = value + '%';
        if (param === 'value') document.getElementById('value-value').textContent = value;

        // Calculate savings
        const monthlyRevenue = (params.visitors * (params.conversion / 100) * params.value);
        const roi = Math.round((monthlyRevenue / 997) * 100);

        // Animate the result
        const savingsElement = document.querySelector('.savings-amount');
        this.animateValue(savingsElement, monthlyRevenue);

        document.getElementById('roi-percentage').textContent = roi + '%';

        // Update state
        this.state.savingsCalculator = {
            visitors: params.visitors,
            conversionRate: params.conversion,
            averageValue: params.value
        };
    }

    animateValue(element, value) {
        const current = parseInt(element.textContent.replace(/\D/g, ''));
        const duration = 500;
        const steps = 30;
        const increment = (value - current) / steps;
        let val = current;
        let step = 0;

        const timer = setInterval(() => {
            val += increment;
            step++;
            element.textContent = '$' + Math.round(val).toLocaleString();

            if (step >= steps) {
                clearInterval(timer);
                element.textContent = '$' + Math.round(value).toLocaleString();
            }
        }, duration / steps);
    }

    // Countdown Timer
    initCountdownTimer() {
        const banner = document.createElement('div');
        banner.className = 'offer-banner';
        banner.innerHTML = `
            <div class="offer-text">
                <span>🔥 Limited Time Offer: Get 20% OFF all packages!</span>
                <div class="offer-timer">
                    <div class="timer-unit">
                        <span class="timer-value" id="timer-hours">23</span>
                        <span class="timer-label">HOURS</span>
                    </div>
                    <div class="timer-unit">
                        <span class="timer-value" id="timer-minutes">59</span>
                        <span class="timer-label">MINS</span>
                    </div>
                    <div class="timer-unit">
                        <span class="timer-value" id="timer-seconds">59</span>
                        <span class="timer-label">SECS</span>
                    </div>
                </div>
            </div>
        `;

        const bannerContainer = document.getElementById('offer-banner-container');
        if (bannerContainer) {
            bannerContainer.appendChild(banner);
        } else {
            const nav = document.querySelector('nav');
            if (nav) {
                nav.parentNode.insertBefore(banner, nav.nextSibling);
            }
        }

        // Update countdown every second
        setInterval(() => this.updateCountdown(), 1000);
    }

    updateCountdown() {
        let { hours, minutes, seconds } = this.state.countdown;

        seconds--;
        if (seconds < 0) {
            seconds = 59;
            minutes--;
            if (minutes < 0) {
                minutes = 59;
                hours--;
                if (hours < 0) {
                    hours = 23;
                    minutes = 59;
                    seconds = 59;
                }
            }
        }

        this.state.countdown = { hours, minutes, seconds };

        document.getElementById('timer-hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('timer-minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('timer-seconds').textContent = String(seconds).padStart(2, '0');
    }

    // Comparison Table
    initComparisonTable() {
        const comparison = document.createElement('div');
        comparison.className = 'comparison-section';
        comparison.innerHTML = `
            <div class="container">
                <h2 style="text-align: center; margin-bottom: 3rem; color: #1e293b;">Compare Our Packages</h2>
                <div class="comparison-table-enhanced">
                    <div class="comparison-header-row">
                        <div>Features</div>
                        <div>SEO</div>
                        <div>Google Ads</div>
                        <div>Web Design</div>
                    </div>
                    ${this.getComparisonRows()}
                </div>
            </div>
        `;

        const pricingSection = document.querySelector('.pricing-section');
        if (pricingSection) {
            pricingSection.appendChild(comparison);
        }
    }

    getComparisonRows() {
        const features = [
            { name: 'Dedicated Account Manager', seo: 'yes', ads: 'yes', web: 'yes' },
            { name: 'Monthly Reporting', seo: 'yes', ads: 'yes', web: 'partial' },
            { name: 'Keyword Research', seo: 'yes', ads: 'yes', web: 'no' },
            { name: 'Content Creation', seo: 'yes', ads: 'partial', web: 'yes' },
            { name: 'Campaign Management', seo: 'no', ads: 'yes', web: 'no' },
            { name: 'A/B Testing', seo: 'partial', ads: 'yes', web: 'yes' },
            { name: 'Mobile Optimization', seo: 'yes', ads: 'yes', web: 'yes' },
            { name: 'Technical Support', seo: 'yes', ads: 'yes', web: 'yes' },
            { name: 'ROI Tracking', seo: 'yes', ads: 'yes', web: 'no' },
            { name: 'Custom Design', seo: 'no', ads: 'partial', web: 'yes' }
        ];

        return features.map(feature => `
            <div class="comparison-row-enhanced">
                <div class="comparison-feature">${feature.name}</div>
                <div class="comparison-check">${this.getCheckMark(feature.seo)}</div>
                <div class="comparison-check">${this.getCheckMark(feature.ads)}</div>
                <div class="comparison-check">${this.getCheckMark(feature.web)}</div>
            </div>
        `).join('');
    }

    getCheckMark(status) {
        if (status === 'yes') {
            return `<svg class="check-yes" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>`;
        } else if (status === 'no') {
            return `<svg class="check-no" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>`;
        } else {
            return `<svg class="check-partial" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
            </svg>`;
        }
    }

    // Chat Widget
    initChatWidget() {
        const widget = document.createElement('div');
        widget.className = 'chat-widget';
        widget.innerHTML = `
            <div class="chat-bubble">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                </svg>
                <span class="chat-status"></span>
            </div>
        `;
        document.body.appendChild(widget);

        widget.addEventListener('click', () => {
            window.location.href = 'contact.html';
        });
    }

    // Scroll Animations
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');

                    // Counter animation for numbers
                    if (entry.target.classList.contains('counter')) {
                        this.animateCounter(entry.target);
                    }
                }
            });
        }, observerOptions);

        // Observe all animatable elements
        document.querySelectorAll('.pricing-card-enhanced, .hero-content-enhanced, .value-prop, .testimonial-carousel').forEach(el => {
            observer.observe(el);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.target);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    // Value Propositions
    initValuePropositions() {
        const props = document.createElement('div');
        props.className = 'value-props';
        props.innerHTML = `
            <div class="value-prop">
                <div class="value-prop-icon">⚡</div>
                <div class="value-prop-text">
                    <div class="value-prop-title">Fast Results</div>
                    <div class="value-prop-desc">See improvements in 30 days</div>
                </div>
            </div>
            <div class="value-prop">
                <div class="value-prop-icon">📊</div>
                <div class="value-prop-text">
                    <div class="value-prop-title">Data-Driven</div>
                    <div class="value-prop-desc">Analytics-based strategies</div>
                </div>
            </div>
            <div class="value-prop">
                <div class="value-prop-icon">🎯</div>
                <div class="value-prop-text">
                    <div class="value-prop-title">ROI Focused</div>
                    <div class="value-prop-desc">Maximum return guaranteed</div>
                </div>
            </div>
        `;

        const heroContent = document.querySelector('.hero-content-enhanced');
        if (heroContent) {
            const description = heroContent.querySelector('.hero-description-enhanced');
            if (description) {
                description.parentNode.insertBefore(props, description.nextSibling);
            }
        }
    }

    // Trust Badges
    initTrustBadges() {
        const badges = document.createElement('div');
        badges.className = 'trust-badges-section';
        badges.innerHTML = `
            <div class="container">
                <div class="trust-badges-grid">
                    <div class="trust-badge">
                        <div class="trust-badge-icon">🛡️</div>
                        <div class="trust-badge-text">SSL Secured</div>
                    </div>
                    <div class="trust-badge">
                        <div class="trust-badge-icon">✓</div>
                        <div class="trust-badge-text">Google Partner</div>
                    </div>
                    <div class="trust-badge">
                        <div class="trust-badge-icon">⭐</div>
                        <div class="trust-badge-text">5-Star Rated</div>
                    </div>
                    <div class="trust-badge">
                        <div class="trust-badge-icon">🏆</div>
                        <div class="trust-badge-text">Award Winning</div>
                    </div>
                    <div class="trust-badge">
                        <div class="trust-badge-icon">🔒</div>
                        <div class="trust-badge-text">Data Protected</div>
                    </div>
                    <div class="trust-badge">
                        <div class="trust-badge-icon">💯</div>
                        <div class="trust-badge-text">Satisfaction Guaranteed</div>
                    </div>
                </div>
            </div>
        `;

        const badgesContainer = document.getElementById('trust-badges-container');
        if (badgesContainer) {
            badgesContainer.appendChild(badges);
        } else {
            const guaranteeSection = document.querySelector('.pricing-guarantee');
            if (guaranteeSection) {
                guaranteeSection.parentNode.insertBefore(badges, guaranteeSection);
            }
        }
    }

    // Micro-interactions
    initMicroInteractions() {
        // Button ripple effect
        document.querySelectorAll('.btn-pricing-enhanced').forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
                ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
                ripple.className = 'ripple';

                this.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        });

        // Confetti on form submission
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                this.triggerConfetti();
            });
        });
    }

    triggerConfetti() {
        // Simple confetti animation
        const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
        const confettiCount = 50;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '10000';
            document.body.appendChild(confetti);

            const animation = confetti.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 2000 + 1000,
                easing: 'cubic-bezier(0, .9, .57, 1)'
            });

            animation.onfinish = () => confetti.remove();
        }
    }

    // User Engagement Tracking
    trackUserEngagement() {
        let engagementTime = 0;
        let scrollDepth = 0;
        let interactions = 0;

        // Track time on page
        setInterval(() => {
            engagementTime++;

            // Show special offer after 30 seconds
            if (engagementTime === 30 && !this.state.offerShown) {
                this.showSpecialOffer();
                this.state.offerShown = true;
            }
        }, 1000);

        // Track scroll depth
        window.addEventListener('scroll', () => {
            const currentScroll = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
            scrollDepth = Math.max(scrollDepth, Math.round(currentScroll * 100));
        });

        // Track interactions
        document.addEventListener('click', () => interactions++);

        // Exit intent detection
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY <= 0 && !this.state.exitIntentShown) {
                this.showExitIntent();
                this.state.exitIntentShown = true;
            }
        });
    }

    showSpecialOffer() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            max-width: 400px;
            text-align: center;
        `;
        modal.innerHTML = `
            <h3 style="color: #1e293b; margin-bottom: 1rem;">Special Offer Just for You!</h3>
            <p style="color: #64748b; margin-bottom: 1.5rem;">Get an extra 10% OFF when you sign up today</p>
            <button onclick="this.parentElement.remove()"
                    style="background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                           color: white; border: none; padding: 0.75rem 2rem;
                           border-radius: 8px; cursor: pointer; font-weight: 600;">
                Claim Offer
            </button>
        `;
        document.body.appendChild(modal);

        setTimeout(() => modal.remove(), 10000);
    }

    showExitIntent() {
        // Exit intent popup logic
        console.log('Exit intent detected');
    }
}

// Initialize the enhanced pricing page
new UltraPricingEnhancer();

// Add dynamic styles
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: fadeInUp 0.6s ease-out forwards;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.7);
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    }

    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }

    .carousel-dot {
        transition: all 0.3s ease;
    }

    .carousel-dot:hover {
        transform: scale(1.2);
    }
`;
document.head.appendChild(style);

console.log('🚀 Ultra-enhanced pricing page loaded with advanced UI/UX features');