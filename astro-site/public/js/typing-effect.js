(function() {
    const titleGradient = document.querySelector('.title-gradient');
    if (!titleGradient) return;

    const originalText = titleGradient.textContent.trim();

    // Clear original text
    titleGradient.textContent = '';

    let charIndex = 0;
    let currentText = '';

    function typeWriter() {
        if (charIndex < originalText.length) {
            currentText += originalText[charIndex];
            titleGradient.textContent = currentText;
            charIndex++;
            setTimeout(typeWriter, 60); // Slightly slower for better effect
        } else {
            // Remove cursor after typing completes
            setTimeout(() => {
                const cursor = document.querySelector('.typewriter-cursor');
                if (cursor) {
                    cursor.style.animation = 'fadeOut 0.5s forwards';
                    setTimeout(() => cursor.remove(), 500);
                }
            }, 1000);
        }
    }

    // Add cursor
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.textContent = '|';
    cursor.style.cssText = 'animation: blink 1s infinite; color: #667eea; font-weight: 300; margin-left: 2px;';
    titleGradient.parentElement.insertBefore(cursor, titleGradient.nextSibling);

    // Add animation styles if not already present
    if (!document.querySelector('#typewriter-styles')) {
        const style = document.createElement('style');
        style.id = 'typewriter-styles';
        style.textContent = `
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
            @keyframes fadeOut {
                to { opacity: 0; }
            }
            .title-gradient {
                display: inline-block;
                min-height: 1.2em; /* Prevent layout shift */
            }
        `;
        document.head.appendChild(style);
    }

    // Start typing after page loads and initial animations settle
    setTimeout(typeWriter, 800);
})();
</script>
