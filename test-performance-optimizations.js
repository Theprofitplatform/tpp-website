#!/usr/bin/env node

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITE_URL = 'http://localhost:4321/website/';

async function testPerformanceOptimizations() {
    console.log('🚀 Testing Performance Optimizations...\n');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();

        // Enable performance monitoring
        await page.evaluateOnNewDocument(() => {
            window.performanceMetrics = {
                resources: [],
                vitals: {},
                errors: []
            };

            // Monitor resource loading
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'resource') {
                        window.performanceMetrics.resources.push({
                            name: entry.name,
                            type: entry.initiatorType,
                            duration: entry.duration,
                            size: entry.transferSize || 0
                        });
                    } else if (entry.entryType === 'paint') {
                        window.performanceMetrics.vitals[entry.name] = entry.startTime;
                    } else if (entry.entryType === 'largest-contentful-paint') {
                        window.performanceMetrics.vitals.lcp = entry.startTime;
                    }
                }
            });
            observer.observe({ entryTypes: ['resource', 'paint', 'largest-contentful-paint'] });

            // Track errors
            window.addEventListener('error', (e) => {
                window.performanceMetrics.errors.push(e.message);
            });
        });

        console.log(`📊 Testing: ${SITE_URL}\n`);

        // Navigate to page
        const response = await page.goto(SITE_URL, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for page to fully load
        await page.waitForTimeout(3000);

        // Collect metrics
        const metrics = await page.evaluate(() => {
            const timing = performance.timing;
            const navigation = performance.getEntriesByType('navigation')[0];

            return {
                // Core Web Vitals
                fcp: window.performanceMetrics.vitals['first-contentful-paint'] || 0,
                lcp: window.performanceMetrics.vitals.lcp || 0,

                // Loading metrics
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                loadComplete: timing.loadEventEnd - timing.navigationStart,

                // Resource metrics
                resources: window.performanceMetrics.resources,
                errors: window.performanceMetrics.errors,

                // Check optimizations
                optimizations: {
                    lazyLoading: document.querySelectorAll('img[loading="lazy"]').length,
                    webpSupport: document.documentElement.classList.contains('webp'),
                    resourceHints: document.querySelectorAll('link[rel="preconnect"], link[rel="dns-prefetch"]').length,
                    deferredScripts: document.querySelectorAll('script[defer], script[async]').length,
                    intersectionObserver: typeof IntersectionObserver !== 'undefined',
                    gtagPresent: typeof gtag !== 'undefined',
                    hotjarDeferred: !document.querySelector('script[src*="hotjar"]') ||
                                   document.querySelector('script[src*="hotjar"]').async
                }
            };
        });

        // Analyze results
        console.log('📈 Performance Metrics:');
        console.log('═══════════════════════════════════════\n');

        console.log('⏱️  Core Web Vitals:');
        console.log(`   First Contentful Paint (FCP): ${metrics.fcp.toFixed(2)}ms ${getScoreEmoji(metrics.fcp, 1800, 3000)}`);
        console.log(`   Largest Contentful Paint (LCP): ${metrics.lcp.toFixed(2)}ms ${getScoreEmoji(metrics.lcp, 2500, 4000)}`);

        console.log('\n📊 Loading Performance:');
        console.log(`   DOM Content Loaded: ${metrics.domContentLoaded}ms`);
        console.log(`   Page Load Complete: ${metrics.loadComplete}ms`);

        console.log('\n✅ Optimizations Applied:');
        console.log(`   Lazy Loading Images: ${metrics.optimizations.lazyLoading} images`);
        console.log(`   WebP Support Detection: ${metrics.optimizations.webpSupport ? '✅' : '❌'}`);
        console.log(`   Resource Hints: ${metrics.optimizations.resourceHints} hints`);
        console.log(`   Deferred/Async Scripts: ${metrics.optimizations.deferredScripts} scripts`);
        console.log(`   Intersection Observer: ${metrics.optimizations.intersectionObserver ? '✅' : '❌'}`);
        console.log(`   Google Analytics (gtag): ${metrics.optimizations.gtagPresent ? '✅' : '❌'}`);
        console.log(`   Hotjar Deferred: ${metrics.optimizations.hotjarDeferred ? '✅' : '❌'}`);

        // Analyze resources
        console.log('\n📦 Resource Analysis:');
        const resourceTypes = {};
        let totalSize = 0;
        let totalDuration = 0;

        metrics.resources.forEach(resource => {
            if (!resourceTypes[resource.type]) {
                resourceTypes[resource.type] = { count: 0, size: 0, duration: 0 };
            }
            resourceTypes[resource.type].count++;
            resourceTypes[resource.type].size += resource.size;
            resourceTypes[resource.type].duration += resource.duration;
            totalSize += resource.size;
            totalDuration += resource.duration;
        });

        Object.entries(resourceTypes).forEach(([type, data]) => {
            const sizeKB = (data.size / 1024).toFixed(2);
            const avgDuration = (data.duration / data.count).toFixed(2);
            console.log(`   ${type}: ${data.count} files, ${sizeKB}KB, avg ${avgDuration}ms`);
        });

        console.log(`   Total: ${(totalSize / 1024).toFixed(2)}KB`);

        // Check for errors
        if (metrics.errors.length > 0) {
            console.log('\n⚠️  Errors Detected:');
            metrics.errors.forEach(error => {
                console.log(`   - ${error}`);
            });
        }

        // Calculate PageSpeed score estimate
        const estimatedScore = calculatePageSpeedScore(metrics);
        console.log('\n🎯 Estimated PageSpeed Score:');
        console.log(`   Score: ${estimatedScore}/100 ${getPageSpeedGrade(estimatedScore)}`);

        if (estimatedScore >= 90) {
            console.log('\n✨ Excellent! Your page is optimized for 90+ PageSpeed score!');
        } else {
            console.log('\n💡 Recommendations to reach 90+ score:');
            if (metrics.fcp > 1800) console.log('   - Reduce First Contentful Paint time');
            if (metrics.lcp > 2500) console.log('   - Optimize Largest Contentful Paint');
            if (totalSize > 1024 * 500) console.log('   - Reduce total page weight');
            if (!metrics.optimizations.webpSupport) console.log('   - Implement WebP image support');
            if (metrics.optimizations.lazyLoading < 5) console.log('   - Add lazy loading to more images');
        }

        // Test mobile performance
        console.log('\n📱 Testing Mobile Performance...');
        await page.setViewport({ width: 375, height: 667 });
        await page.reload({ waitUntil: 'networkidle2' });

        const mobileCheck = await page.evaluate(() => {
            const viewport = window.visualViewport;
            return {
                viewportWidth: viewport.width,
                viewportHeight: viewport.height,
                hasHorizontalScroll: document.documentElement.scrollWidth > viewport.width,
                touchOptimized: window.matchMedia('(pointer: coarse)').matches ||
                                'ontouchstart' in window
            };
        });

        console.log(`   Viewport: ${mobileCheck.viewportWidth}x${mobileCheck.viewportHeight}`);
        console.log(`   No Horizontal Scroll: ${!mobileCheck.hasHorizontalScroll ? '✅' : '❌'}`);
        console.log(`   Touch Optimized: ${mobileCheck.touchOptimized ? '✅' : '❌'}`);

        console.log('\n✅ Performance testing complete!');

    } catch (error) {
        console.error('\n❌ Error during testing:', error.message);
    } finally {
        await browser.close();
    }
}

function getScoreEmoji(value, goodThreshold, poorThreshold) {
    if (value <= goodThreshold) return '🟢';
    if (value <= poorThreshold) return '🟡';
    return '🔴';
}

function calculatePageSpeedScore(metrics) {
    let score = 100;

    // FCP scoring (15% weight)
    if (metrics.fcp > 3000) score -= 15;
    else if (metrics.fcp > 1800) score -= 7;

    // LCP scoring (25% weight)
    if (metrics.lcp > 4000) score -= 25;
    else if (metrics.lcp > 2500) score -= 12;

    // Load time scoring (20% weight)
    if (metrics.loadComplete > 5000) score -= 20;
    else if (metrics.loadComplete > 3000) score -= 10;

    // Optimization scoring (40% weight)
    if (!metrics.optimizations.lazyLoading) score -= 10;
    if (!metrics.optimizations.webpSupport) score -= 5;
    if (!metrics.optimizations.resourceHints) score -= 5;
    if (!metrics.optimizations.deferredScripts) score -= 10;
    if (!metrics.optimizations.hotjarDeferred) score -= 10;

    return Math.max(0, Math.min(100, score));
}

function getPageSpeedGrade(score) {
    if (score >= 90) return '🏆 (Excellent)';
    if (score >= 50) return '⚡ (Good)';
    return '🐌 (Needs Improvement)';
}

// Run the test
testPerformanceOptimizations().catch(console.error);