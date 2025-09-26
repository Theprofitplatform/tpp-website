/**
 * FAQ Accordion Functionality
 * Handles the expand/collapse behavior for FAQ sections
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get all FAQ items
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.faq-icon');

        if (question && answer) {
            // Set initial state
            answer.style.maxHeight = '0';
            answer.style.overflow = 'hidden';
            answer.style.transition = 'max-height 0.3s ease, padding 0.3s ease';

            question.addEventListener('click', function() {
                const isOpen = answer.style.maxHeight !== '0px' && answer.style.maxHeight !== '0';

                // Close all other FAQ items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        const otherIcon = otherItem.querySelector('.faq-icon');
                        if (otherAnswer) {
                            otherAnswer.style.maxHeight = '0';
                            otherAnswer.style.paddingTop = '0';
                            otherAnswer.style.paddingBottom = '0';
                        }
                        if (otherIcon) {
                            otherIcon.style.transform = 'rotate(0deg)';
                            otherIcon.textContent = '+';
                        }
                    }
                });

                // Toggle current item
                if (isOpen) {
                    // Close
                    answer.style.maxHeight = '0';
                    answer.style.paddingTop = '0';
                    answer.style.paddingBottom = '0';
                    if (icon) {
                        icon.style.transform = 'rotate(0deg)';
                        icon.textContent = '+';
                    }
                } else {
                    // Open
                    const answerContent = answer.querySelector('div') || answer;
                    answer.style.maxHeight = answerContent.scrollHeight + 40 + 'px';
                    answer.style.paddingTop = '0';
                    answer.style.paddingBottom = '0';
                    if (icon) {
                        icon.style.transform = 'rotate(45deg)';
                        icon.textContent = '×';
                    }
                }
            });

            // Handle window resize
            window.addEventListener('resize', function() {
                if (answer.style.maxHeight !== '0px' && answer.style.maxHeight !== '0') {
                    const answerContent = answer.querySelector('div') || answer;
                    answer.style.maxHeight = answerContent.scrollHeight + 40 + 'px';
                }
            });
        }
    });

    // Add smooth scroll behavior for FAQ navigation
    const faqLinks = document.querySelectorAll('a[href^="#faq"]');
    faqLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });

                // Open the FAQ item if it's closed
                const faqItem = targetElement.closest('.faq-item');
                if (faqItem) {
                    const question = faqItem.querySelector('.faq-question');
                    const answer = faqItem.querySelector('.faq-answer');
                    if (question && answer && (answer.style.maxHeight === '0px' || answer.style.maxHeight === '0')) {
                        question.click();
                    }
                }
            }
        });
    });
});

// Add animation on scroll for FAQ section
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const faqObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe FAQ items for animation
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        faqObserver.observe(item);
    });
});