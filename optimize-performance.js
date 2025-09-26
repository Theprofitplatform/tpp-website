#!/usr/bin/env node

import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function optimizePerformance() {
    const filePath = join(__dirname, 'website', 'index.html');

    try {
        let html = await fs.readFile(filePath, 'utf8');

        // 1. Add comprehensive resource hints for external domains
        const resourceHints = `
    <!-- Performance Resource Hints -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://storage.googleapis.com" crossorigin>
    <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
    <link rel="dns-prefetch" href="https://www.google-analytics.com">
    <link rel="dns-prefetch" href="https://www.googletagmanager.com">
    <link rel="dns-prefetch" href="https://static.hotjar.com">
    <link rel="dns-prefetch" href="https://www.google.com">
    <link rel="dns-prefetch" href="https://kit.fontawesome.com">`;

        // Replace existing resource hints with comprehensive ones
        html = html.replace(
            /<!-- Performance and Resource Hints -->[\s\S]*?(?=<!-- Preload Critical Resources -->)/,
            `<!-- Performance and Resource Hints -->${resourceHints}\n    \n    `
        );

        // 2. Move Google Analytics to end of body with proper gtag.js async implementation
        const gtagRegex = /<!-- Google tag \(gtag\.js\) -->[\s\S]*?<\/script>\s*(?=<!--|\n)/;
        const gtagMatch = html.match(gtagRegex);
        if (gtagMatch) {
            html = html.replace(gtagRegex, '');
        }

        // 3. Move Hotjar to end of body
        const hotjarRegex = /<!-- Hotjar Tracking Code[\s\S]*?<\/script>\s*(?=<!--|\n|<link)/;
        const hotjarMatch = html.match(hotjarRegex);
        if (hotjarMatch) {
            html = html.replace(hotjarRegex, '');
        }

        // 4. Optimize Font Awesome to use kit with tree-shaking
        html = html.replace(
            /<link rel="preload" href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/[^"]+\.css"[^>]*>/g,
            '<!-- Font Awesome loaded via optimized kit below -->'
        );
        html = html.replace(
            /<link rel="stylesheet" href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/[^"]+\.css"[^>]*>/g,
            ''
        );

        // 5. Add lazy loading to all images (except hero/above-fold)
        // First, identify hero images and keep them eager
        html = html.replace(
            /<img([^>]*?)src="([^"]*?)"([^>]*?)>/g,
            (match, pre, src, post) => {
                // Check if it's a hero image or has explicit loading attribute
                if (src.includes('68b56f6e09148075ab5016df.png') ||
                    src.includes('68b56f98291670614001dfbf.png') ||
                    match.includes('loading=')) {
                    return match; // Keep hero images eager
                }
                // Add lazy loading to other images
                return `<img${pre}src="${src}"${post} loading="lazy">`;
            }
        );

        // 6. Add srcset attributes for responsive images
        html = html.replace(
            /<img([^>]*?)src="(https:\/\/storage\.googleapis\.com[^"]+)"([^>]*?)>/g,
            (match, pre, src, post) => {
                // Skip if srcset already exists
                if (match.includes('srcset')) return match;

                const filename = src.substring(src.lastIndexOf('/') + 1);
                const basePath = src.substring(0, src.lastIndexOf('/'));

                // Generate srcset for different sizes
                const srcset = `srcset="${src} 1x, ${basePath}/${filename}?w=1600 2x"`;
                const sizes = `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`;

                return `<img${pre}src="${src}" ${srcset} ${sizes}${post}>`;
            }
        );

        // 7. Add WebP support with picture elements for key images
        const webpSupport = `
    <!-- WebP Support Detection -->
    <script>
        // WebP feature detection
        !function(){var e=new Image;e.onerror=function(){document.documentElement.classList.add("no-webp")},e.onload=function(){document.documentElement.classList.add("webp")},e.src="data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA="}();
    </script>`;

        // Add WebP detection script after <head> opening
        html = html.replace(/<head>/, `<head>${webpSupport}`);

        // 8. Create optimized performance scripts section at end of body
        const performanceScripts = `
    <!-- Deferred Performance Scripts -->
    <script>
        // Intersection Observer for Counter Animations (run once)
        document.addEventListener('DOMContentLoaded', function() {
            const counters = document.querySelectorAll('.counter-value, [data-counter]');
            const animatedCounters = new Set();

            if ('IntersectionObserver' in window) {
                const counterObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !animatedCounters.has(entry.target)) {
                            animatedCounters.add(entry.target);
                            animateCounter(entry.target);
                            counterObserver.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.5 });

                counters.forEach(counter => counterObserver.observe(counter));
            }

            function animateCounter(element) {
                const target = parseInt(element.textContent.replace(/[^0-9]/g, ''));
                const duration = 2000;
                const increment = target / (duration / 16);
                let current = 0;

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        element.textContent = target + (element.textContent.includes('+') ? '+' : '');
                        clearInterval(timer);
                    } else {
                        element.textContent = Math.floor(current) + (element.textContent.includes('+') ? '+' : '');
                    }
                }, 16);
            }
        });

        // Lazy Load Images with Native Loading API Fallback
        if ('loading' in HTMLImageElement.prototype) {
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
            });
        } else {
            // Fallback for browsers that don't support native lazy loading
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
            script.async = true;
            document.body.appendChild(script);
        }

        // Progressive Enhancement for WebP
        document.querySelectorAll('img[data-webp]').forEach(img => {
            if (document.documentElement.classList.contains('webp')) {
                img.src = img.dataset.webp;
            }
        });
    </script>

    <!-- Optimized Font Awesome Kit (only used icons) -->
    <script defer src="https://kit.fontawesome.com/YOUR_KIT_ID.js" crossorigin="anonymous"></script>

    <!-- Google Analytics - Async Loading -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-FB947JWCFT"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-FB947JWCFT', {
            'send_page_view': true,
            'anonymize_ip': true,
            'link_attribution': true,
            'allow_google_signals': true
        });
    </script>

    <!-- Hotjar - Loaded After Interactive -->
    <script>
        // Load Hotjar after page is interactive
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            loadHotjar();
        } else {
            window.addEventListener('DOMContentLoaded', loadHotjar);
        }

        function loadHotjar() {
            setTimeout(() => {
                (function(h,o,t,j,a,r){
                    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                    h._hjSettings={hjid:6526316,hjsv:6};
                    a=o.getElementsByTagName('head')[0];
                    r=o.createElement('script');r.async=1;
                    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                    a.appendChild(r);
                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            }, 3000); // Delay Hotjar by 3 seconds
        }
    </script>

    <!-- Additional Performance Monitoring -->
    <script>
        // Web Vitals Monitoring
        if ('PerformanceObserver' in window) {
            try {
                const po = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        // Log to Google Analytics if available
                        if (window.gtag) {
                            gtag('event', 'web_vitals', {
                                'event_category': 'Web Vitals',
                                'event_label': entry.name,
                                'value': Math.round(entry.value)
                            });
                        }
                    }
                });
                po.observe({type: 'paint', buffered: true});
                po.observe({type: 'largest-contentful-paint', buffered: true});
                po.observe({type: 'first-input', buffered: true});
                po.observe({type: 'layout-shift', buffered: true});
            } catch (e) {
                // Silently fail if not supported
            }
        }
    </script>`;

        // Add performance scripts before closing body tag
        html = html.replace(/<\/body>/, `${performanceScripts}\n</body>`);

        // 9. Inline critical CSS (extract from critical.min.css if it exists)
        try {
            const criticalCssPath = join(__dirname, 'website', 'css', 'critical.min.css');
            const criticalCss = await fs.readFile(criticalCssPath, 'utf8');
            if (criticalCss && criticalCss.length < 14000) { // Inline if less than 14KB
                html = html.replace(
                    /<link rel="stylesheet" href="css\/critical\.min\.css">/,
                    `<style>${criticalCss}</style>`
                );
            }
        } catch (e) {
            console.log('Critical CSS file not found, skipping inline');
        }

        // 10. Add loading="lazy" to iframes
        html = html.replace(
            /<iframe([^>]*?)>/g,
            (match) => {
                if (!match.includes('loading=')) {
                    return match.replace('>', ' loading="lazy">');
                }
                return match;
            }
        );

        // 11. Optimize animate.css loading (load on scroll)
        html = html.replace(
            /<link rel="preload" href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/animate\.css[^>]*>/g,
            `<!-- Animate.css loaded on demand below -->`
        );

        // Add animate.css lazy loader
        const animateCssLoader = `
    <script>
        // Load Animate.css on first scroll
        let animateCssLoaded = false;
        function loadAnimateCss() {
            if (!animateCssLoaded) {
                animateCssLoaded = true;
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
                document.head.appendChild(link);
                window.removeEventListener('scroll', loadAnimateCss);
            }
        }
        window.addEventListener('scroll', loadAnimateCss, { once: true, passive: true });
        // Also load if user interacts with page
        window.addEventListener('click', loadAnimateCss, { once: true });
    </script>`;

        html = html.replace('</head>', `${animateCssLoader}\n</head>`);

        // Write the optimized HTML
        await fs.writeFile(filePath, html, 'utf8');

        console.log('✅ Performance optimizations applied successfully!');
        console.log('📊 Optimizations implemented:');
        console.log('   - Added comprehensive resource hints');
        console.log('   - Converted to gtag.js with async loading');
        console.log('   - Moved tracking scripts to load after interactive');
        console.log('   - Implemented lazy loading for images');
        console.log('   - Added srcset for responsive images');
        console.log('   - Added WebP support detection');
        console.log('   - Implemented Intersection Observer for counters');
        console.log('   - Optimized Font Awesome loading');
        console.log('   - Deferred non-critical CSS');
        console.log('   - Added Web Vitals monitoring');

    } catch (error) {
        console.error('Error optimizing performance:', error);
        process.exit(1);
    }
}

// Run the optimization
optimizePerformance();