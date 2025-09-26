
// Counter Animation for Trust Signals
function animateCounter(element, target, decimals = 0, duration = 2000) {
    const startTime = Date.now();
    const startValue = 0;

    function updateCounter() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (target - startValue) * easeOutQuart;

        if (decimals > 0) {
            element.textContent = currentValue.toFixed(decimals);
        } else {
            element.textContent = Math.floor(currentValue);
        }

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }

    updateCounter();
}

// Intersection Observer for triggering animations
const trustObserverOptions = {
    threshold: 0.3,
    rootMargin: '0px 0px -100px 0px'
};

const trustObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Animate counters
            const counters = entry.target.querySelectorAll('.counter');
            counters.forEach(counter => {
                const target = parseFloat(counter.getAttribute('data-target'));
                const decimals = parseInt(counter.getAttribute('data-decimals')) || 0;
                animateCounter(counter, target, decimals);
            });

            // Stop observing once animated
            trustObserver.unobserve(entry.target);
        }
    });
}, trustObserverOptions);

// Start observing when page loads
document.addEventListener('DOMContentLoaded', () => {
    const trustSection = document.querySelector('.trust-signals-section');
    if (trustSection) {
        trustObserver.observe(trustSection);
    }

});

