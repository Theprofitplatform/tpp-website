/**
 * Simple Performance Test Script
 * Tests if performance monitoring is working
 */

console.log('🧪 Performance test script loaded successfully!');

// Simple performance monitoring
class SimplePerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        console.log('📊 Simple Performance Monitor starting...');

        // Collect basic Core Web Vitals
        this.collectLCP();
        this.collectFID();
        this.collectCLS();

        // Show dashboard on Ctrl+Shift+P
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                this.showDashboard();
            }
        });

        setTimeout(() => {
            console.log('✅ Simple Performance Monitor ready!');
            console.log('📈 Current metrics:', this.metrics);
            console.log('🔍 Press Ctrl+Shift+P to view dashboard');
        }, 1000);
    }

    collectLCP() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.metrics.lcp = Math.round(entry.startTime);
                    console.log('📏 LCP:', this.metrics.lcp + 'ms');
                }
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }

    collectFID() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.metrics.fid = Math.round(entry.processingStart - entry.startTime);
                    console.log('⚡ FID:', this.metrics.fid + 'ms');
                }
            });
            observer.observe({ entryTypes: ['first-input'] });
        }
    }

    collectCLS() {
        if ('PerformanceObserver' in window) {
            let clsValue = 0;
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                this.metrics.cls = Math.round(clsValue * 1000) / 1000;
                console.log('🔄 CLS:', this.metrics.cls);
            });
            observer.observe({ entryTypes: ['layout-shift'] });
        }
    }

    showDashboard() {
        const dashboard = `
            📊 TPP PERFORMANCE DASHBOARD
            ============================
            🎯 LCP: ${this.metrics.lcp || 'measuring...'}ms (Target: <2500ms)
            ⚡ FID: ${this.metrics.fid || 'waiting for interaction...'}ms (Target: <100ms)
            🔄 CLS: ${this.metrics.cls || 'measuring...'} (Target: <0.1)

            🖼️ Images: ${document.images.length} total
            📊 Page Load: ${Date.now() - performance.timeOrigin}ms
            💾 Memory: ${navigator.deviceMemory || 'unknown'}GB
            🌐 Connection: ${navigator.connection?.effectiveType || 'unknown'}
        `;

        alert(dashboard);
        console.log(dashboard);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.tppPerformanceTest = new SimplePerformanceMonitor();
});