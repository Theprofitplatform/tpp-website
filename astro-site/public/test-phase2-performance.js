/**
 * Phase 2 Performance Test
 * Comprehensive testing of bundled CSS and predictive loading improvements
 */

console.log('🧪 Phase 2 Performance Test Starting...');

class Phase2PerformanceTester {
    constructor() {
        this.metrics = {
            before: {},
            after: {},
            improvement: {}
        };
        this.tests = [];
    }

    async runCompleteTest() {
        console.log('🎯 Starting comprehensive Phase 2 performance analysis...');

        // Test 1: CSS Bundle Performance
        await this.testCSSBundlePerformance();

        // Test 2: Predictive Loading Effectiveness
        await this.testPredictiveLoading();

        // Test 3: Core Web Vitals Measurement
        await this.measureCoreWebVitals();

        // Test 4: Resource Loading Analysis
        await this.analyzeResourceLoading();

        // Generate comprehensive report
        this.generateReport();
    }

    async testCSSBundlePerformance() {
        console.log('📊 Testing CSS bundle performance...');

        const perfBefore = performance.now();

        // Count stylesheets
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        const bundledCSS = Array.from(stylesheets).find(link =>
            link.href.includes('bundled.min.css')
        );

        const cssMetrics = {
            totalStylesheets: stylesheets.length,
            hasBundledCSS: !!bundledCSS,
            bundleSize: bundledCSS ? await this.getResourceSize(bundledCSS.href) : 0,
            loadTime: performance.now() - perfBefore
        };

        this.tests.push({
            name: 'CSS Bundle Performance',
            status: bundledCSS ? 'PASS' : 'FAIL',
            metrics: cssMetrics
        });

        console.log('✅ CSS Bundle Test:', cssMetrics);
    }

    async testPredictiveLoading() {
        console.log('🔮 Testing predictive loading system...');

        const predictiveLoader = window.tppPredictiveLoader;
        const hasPrediciveLoader = !!predictiveLoader;

        let predictiveMetrics = {
            systemAvailable: hasPrediciveLoader,
            preloadedResources: 0,
            connectionAdaptive: false
        };

        if (predictiveLoader && typeof predictiveLoader.getPreloadingMetrics === 'function') {
            try {
                const loaderMetrics = predictiveLoader.getPreloadingMetrics();
                predictiveMetrics = {
                    ...predictiveMetrics,
                    preloadedResources: loaderMetrics.preloadedCount || 0,
                    connectionType: loaderMetrics.connectionType,
                    connectionAdaptive: !!loaderMetrics.connectionType
                };
            } catch (error) {
                console.warn('⚠️ Could not get predictive loader metrics:', error);
            }
        }

        this.tests.push({
            name: 'Predictive Loading',
            status: hasPrediciveLoader ? 'PASS' : 'FAIL',
            metrics: predictiveMetrics
        });

        console.log('✅ Predictive Loading Test:', predictiveMetrics);
    }

    async measureCoreWebVitals() {
        console.log('📏 Measuring Core Web Vitals...');

        return new Promise((resolve) => {
            const vitals = {
                lcp: null,
                fid: null,
                cls: null
            };

            // Get LCP
            if ('PerformanceObserver' in window) {
                const lcpObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        vitals.lcp = Math.round(entry.startTime);
                    }
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

                // Get CLS
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                    vitals.cls = Math.round(clsValue * 1000) / 1000;
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });

                // Get FID (requires user interaction)
                const fidObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        vitals.fid = Math.round(entry.processingStart - entry.startTime);
                    }
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            }

            // Wait for measurements
            setTimeout(() => {
                const vitalScores = {
                    lcp: {
                        value: vitals.lcp,
                        grade: vitals.lcp < 2500 ? 'GOOD' : vitals.lcp < 4000 ? 'NEEDS_IMPROVEMENT' : 'POOR'
                    },
                    cls: {
                        value: vitals.cls,
                        grade: vitals.cls < 0.1 ? 'GOOD' : vitals.cls < 0.25 ? 'NEEDS_IMPROVEMENT' : 'POOR'
                    },
                    fid: {
                        value: vitals.fid || 'No interaction yet',
                        grade: vitals.fid && vitals.fid < 100 ? 'GOOD' : 'MEASURING'
                    }
                };

                this.tests.push({
                    name: 'Core Web Vitals',
                    status: 'MEASURED',
                    metrics: vitalScores
                });

                console.log('✅ Core Web Vitals:', vitalScores);
                resolve(vitalScores);
            }, 3000);
        });
    }

    async analyzeResourceLoading() {
        console.log('📦 Analyzing resource loading performance...');

        const resources = performance.getEntriesByType('resource');

        const analysis = {
            totalResources: resources.length,
            cssResources: resources.filter(r => r.name.includes('.css')).length,
            jsResources: resources.filter(r => r.name.includes('.js')).length,
            imageResources: resources.filter(r => /\.(jpg|jpeg|png|gif|webp|svg)/.test(r.name)).length,
            avgLoadTime: Math.round(
                resources.reduce((sum, r) => sum + r.responseEnd - r.requestStart, 0) / resources.length
            ),
            totalTransferSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0)
        };

        const slowResources = resources
            .filter(r => (r.responseEnd - r.requestStart) > 1000)
            .map(r => ({
                name: r.name.split('/').pop(),
                loadTime: Math.round(r.responseEnd - r.requestStart),
                size: r.transferSize || 0
            }));

        this.tests.push({
            name: 'Resource Loading Analysis',
            status: slowResources.length === 0 ? 'GOOD' : 'NEEDS_OPTIMIZATION',
            metrics: { ...analysis, slowResources }
        });

        console.log('✅ Resource Analysis:', analysis);
        if (slowResources.length > 0) {
            console.warn('⚠️ Slow resources detected:', slowResources);
        }
    }

    async getResourceSize(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return blob.size;
        } catch (error) {
            console.warn('Could not get resource size for:', url);
            return 0;
        }
    }

    generateReport() {
        console.log('\n🎯 PHASE 2 PERFORMANCE REPORT');
        console.log('================================');

        this.tests.forEach((test, index) => {
            console.log(`\n${index + 1}. ${test.name}: ${test.status}`);
            console.log('   Metrics:', test.metrics);
        });

        // Calculate overall performance score
        const passCount = this.tests.filter(t => t.status === 'PASS' || t.status === 'GOOD').length;
        const totalTests = this.tests.length;
        const overallScore = Math.round((passCount / totalTests) * 100);

        console.log('\n🏆 OVERALL PERFORMANCE SCORE');
        console.log('=============================');
        console.log(`Score: ${overallScore}% (${passCount}/${totalTests} tests passed)`);

        if (overallScore >= 80) {
            console.log('✅ Excellent performance! Phase 2 optimizations are working well.');
        } else if (overallScore >= 60) {
            console.log('⚠️ Good performance with room for improvement.');
        } else {
            console.log('❌ Performance needs attention. Consider additional optimizations.');
        }

        // Show next steps
        console.log('\n🎯 NEXT STEPS');
        console.log('==============');
        console.log('• Test on localhost:4331 to see live performance');
        console.log('• Use browser DevTools Performance tab for detailed analysis');
        console.log('• Press Ctrl+Shift+P on your site to see live metrics dashboard');
        console.log('• Monitor Core Web Vitals with Google PageSpeed Insights');

        return {
            overallScore,
            tests: this.tests,
            passCount,
            totalTests
        };
    }
}

// Auto-run test when script loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Phase 2 Performance Test...');

    setTimeout(async () => {
        const tester = new Phase2PerformanceTester();
        const results = await tester.runCompleteTest();

        // Make results available globally
        window.phase2TestResults = results;

        console.log('\n🎉 Phase 2 performance test complete!');
        console.log('Results available in: window.phase2TestResults');

    }, 2000); // Wait 2 seconds for everything to load
});