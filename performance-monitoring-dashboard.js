/**
 * The Profit Platform - Performance Monitoring Dashboard
 * Real-time performance metrics collection and visualization
 */

class PerformanceMonitoringDashboard {
    constructor(options = {}) {
        this.options = {
            // Monitoring configuration
            enableRealTimeMetrics: true,
            trackCoreWebVitals: true,
            trackCustomMetrics: true,
            trackResourceTiming: true,
            trackUserInteractions: true,

            // Reporting configuration
            reportInterval: 30000, // 30 seconds
            batchSize: 50,
            enableAnalytics: true,
            enableConsoleReports: true,

            // Dashboard configuration
            showLiveMetrics: true,
            showHistoricalData: true,
            showRecommendations: true,
            autoOptimize: false,

            // Thresholds for alerts
            thresholds: {
                lcp: 2500,      // Largest Contentful Paint
                fid: 100,       // First Input Delay
                cls: 0.1,       // Cumulative Layout Shift
                fcp: 1800,      // First Contentful Paint
                ttfb: 800,      // Time to First Byte
                memory: 80      // Memory usage percentage
            },

            ...options
        };

        this.metrics = {
            // Core Web Vitals
            lcp: null,
            fid: null,
            cls: 0,
            fcp: null,
            ttfb: null,

            // Custom performance metrics
            domInteractive: null,
            domContentLoaded: null,
            loadComplete: null,
            firstPaint: null,

            // Resource metrics
            totalResources: 0,
            totalResourceSize: 0,
            cachedResources: 0,
            failedResources: 0,

            // User interaction metrics
            scrollResponsiveness: 100,
            clickResponsiveness: 100,
            inputResponsiveness: 100,

            // Memory metrics
            memoryUsage: null,
            memoryLimit: null,

            // Network metrics
            connectionType: null,
            effectiveType: null,
            downlink: null,
            rtt: null,

            // Custom timing metrics
            timeToInteractive: null,
            aboveFoldRenderTime: null,
            heroImageLoadTime: null
        };

        this.observers = new Map();
        this.metricsHistory = [];
        this.alerts = [];
        this.recommendations = [];

        this.performanceBuffer = [];
        this.lastReport = Date.now();

        this.init();
    }

    async init() {
        console.log('📊 Initializing Performance Monitoring Dashboard...');

        // Set up core metrics collection
        this.setupCoreWebVitalsTracking();
        this.setupResourceTimingTracking();
        this.setupCustomMetricsTracking();
        this.setupUserInteractionTracking();
        this.setupNetworkTracking();
        this.setupMemoryTracking();

        // Start periodic reporting
        this.startPeriodicReporting();

        // Create dashboard if enabled
        if (this.options.showLiveMetrics) {
            this.createDashboard();
        }

        console.log('✅ Performance Monitoring Dashboard initialized');
    }

    // ================================
    // CORE WEB VITALS TRACKING
    // ================================

    setupCoreWebVitalsTracking() {
        if (!this.options.trackCoreWebVitals) return;

        console.log('🎯 Setting up Core Web Vitals tracking...');

        // Largest Contentful Paint (LCP)
        this.trackLCP();

        // First Input Delay (FID)
        this.trackFID();

        // Cumulative Layout Shift (CLS)
        this.trackCLS();

        // First Contentful Paint (FCP)
        this.trackFCP();

        // Time to First Byte (TTFB)
        this.trackTTFB();
    }

    trackLCP() {
        if (!('PerformanceObserver' in window)) return;

        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];

            this.metrics.lcp = Math.round(lastEntry.startTime);
            this.checkThreshold('lcp', this.metrics.lcp);
            this.recordMetricUpdate('lcp', this.metrics.lcp);
        });

        try {
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.set('lcp', observer);
        } catch (e) {
            console.warn('LCP tracking not supported');
        }
    }

    trackFID() {
        if (!('PerformanceObserver' in window)) return;

        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();

            entries.forEach(entry => {
                if (entry.name === 'first-input') {
                    const fid = Math.round(entry.processingStart - entry.startTime);
                    this.metrics.fid = fid;
                    this.checkThreshold('fid', fid);
                    this.recordMetricUpdate('fid', fid);
                }
            });
        });

        try {
            observer.observe({ entryTypes: ['first-input'] });
            this.observers.set('fid', observer);
        } catch (e) {
            console.warn('FID tracking not supported');
        }
    }

    trackCLS() {
        if (!('PerformanceObserver' in window)) return;

        let clsValue = 0;
        let clsEntries = [];
        let sessionValue = 0;

        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();

            entries.forEach(entry => {
                // Only count layout shifts without recent input
                if (!entry.hadRecentInput) {
                    const firstSessionEntry = clsEntries[0];
                    const lastSessionEntry = clsEntries[clsEntries.length - 1];

                    // Start new session if gap is larger than 1s or session is older than 5s
                    if (!firstSessionEntry ||
                        (entry.startTime - lastSessionEntry.startTime) > 1000 ||
                        (entry.startTime - firstSessionEntry.startTime) > 5000) {
                        clsEntries = [entry];
                    } else {
                        clsEntries.push(entry);
                    }

                    // Calculate session value
                    sessionValue = clsEntries.reduce((sum, e) => sum + e.value, 0);

                    if (sessionValue > clsValue) {
                        clsValue = sessionValue;
                        this.metrics.cls = Math.round(clsValue * 10000) / 10000;
                        this.checkThreshold('cls', this.metrics.cls);
                        this.recordMetricUpdate('cls', this.metrics.cls);
                    }
                }
            });
        });

        try {
            observer.observe({ entryTypes: ['layout-shift'] });
            this.observers.set('cls', observer);
        } catch (e) {
            console.warn('CLS tracking not supported');
        }
    }

    trackFCP() {
        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
        if (fcpEntry) {
            this.metrics.fcp = Math.round(fcpEntry.startTime);
            this.checkThreshold('fcp', this.metrics.fcp);
        }

        // Also set up observer for future measurements
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                if (entries.length > 0) {
                    this.metrics.fcp = Math.round(entries[0].startTime);
                    this.checkThreshold('fcp', this.metrics.fcp);
                    this.recordMetricUpdate('fcp', this.metrics.fcp);
                }
            });

            try {
                observer.observe({ entryTypes: ['paint'] });
                this.observers.set('fcp', observer);
            } catch (e) {
                console.warn('FCP tracking not supported');
            }
        }
    }

    trackTTFB() {
        if (performance.timing) {
            const ttfb = performance.timing.responseStart - performance.timing.requestStart;
            this.metrics.ttfb = ttfb;
            this.checkThreshold('ttfb', ttfb);
        }

        // Modern browsers
        if (performance.getEntriesByType('navigation').length > 0) {
            const navEntry = performance.getEntriesByType('navigation')[0];
            this.metrics.ttfb = Math.round(navEntry.responseStart);
            this.checkThreshold('ttfb', this.metrics.ttfb);
        }
    }

    // ================================
    // RESOURCE TIMING TRACKING
    // ================================

    setupResourceTimingTracking() {
        if (!this.options.trackResourceTiming) return;

        console.log('📦 Setting up resource timing tracking...');

        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();

                entries.forEach(entry => {
                    this.processResourceEntry(entry);
                });
            });

            try {
                observer.observe({ entryTypes: ['resource'] });
                this.observers.set('resource', observer);
            } catch (e) {
                console.warn('Resource timing tracking not supported');
            }
        }

        // Process existing entries
        performance.getEntriesByType('resource').forEach(entry => {
            this.processResourceEntry(entry);
        });
    }

    processResourceEntry(entry) {
        this.metrics.totalResources++;
        this.metrics.totalResourceSize += entry.transferSize || 0;

        // Check if resource was cached
        if (entry.transferSize === 0 && entry.decodedBodySize > 0) {
            this.metrics.cachedResources++;
        }

        // Track failed resources
        if (entry.responseEnd === 0) {
            this.metrics.failedResources++;
        }

        // Track specific resource types
        this.trackSpecificResource(entry);
    }

    trackSpecificResource(entry) {
        // Track hero image load time
        if (entry.initiatorType === 'img' &&
            (entry.name.includes('hero') || entry.name.includes('banner'))) {
            this.metrics.heroImageLoadTime = Math.round(entry.responseEnd - entry.requestStart);
        }

        // Track CSS load times
        if (entry.initiatorType === 'link' && entry.name.includes('.css')) {
            this.recordResourceMetric('css_load_time', entry.duration);
        }

        // Track JS load times
        if (entry.initiatorType === 'script' && entry.name.includes('.js')) {
            this.recordResourceMetric('js_load_time', entry.duration);
        }
    }

    recordResourceMetric(type, value) {
        this.performanceBuffer.push({
            type: 'resource',
            metric: type,
            value: Math.round(value),
            timestamp: Date.now()
        });
    }

    // ================================
    // CUSTOM METRICS TRACKING
    // ================================

    setupCustomMetricsTracking() {
        if (!this.options.trackCustomMetrics) return;

        console.log('🎯 Setting up custom metrics tracking...');

        // DOM timing metrics
        if (performance.timing) {
            const timing = performance.timing;

            this.metrics.domInteractive = timing.domInteractive - timing.navigationStart;
            this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
            this.metrics.loadComplete = timing.loadEventEnd - timing.navigationStart;
        }

        // Modern navigation timing
        if (performance.getEntriesByType('navigation').length > 0) {
            const navEntry = performance.getEntriesByType('navigation')[0];

            this.metrics.domInteractive = Math.round(navEntry.domInteractive);
            this.metrics.domContentLoaded = Math.round(navEntry.domContentLoadedEventEnd);
            this.metrics.loadComplete = Math.round(navEntry.loadEventEnd);
        }

        // Time to interactive
        this.trackTimeToInteractive();

        // Above-fold render time
        this.trackAboveFoldRenderTime();
    }

    trackTimeToInteractive() {
        let hasInteracted = false;
        const startTime = performance.now();

        const checkInteractive = () => {
            if (hasInteracted) return;

            // Simple heuristic: page is interactive when DOM is ready and no long tasks
            if (document.readyState === 'complete') {
                this.metrics.timeToInteractive = Math.round(performance.now() - startTime);
                this.recordMetricUpdate('timeToInteractive', this.metrics.timeToInteractive);
                hasInteracted = true;
            } else {
                setTimeout(checkInteractive, 100);
            }
        };

        if (document.readyState === 'complete') {
            checkInteractive();
        } else {
            window.addEventListener('load', checkInteractive);
        }
    }

    trackAboveFoldRenderTime() {
        const aboveFoldElements = document.querySelectorAll('[data-above-fold]');
        if (aboveFoldElements.length === 0) return;

        const startTime = performance.now();

        const checkAboveFoldComplete = () => {
            const allRendered = Array.from(aboveFoldElements).every(el => {
                if (el.tagName === 'IMG') {
                    return el.complete && el.naturalHeight > 0;
                }
                return el.offsetHeight > 0;
            });

            if (allRendered) {
                this.metrics.aboveFoldRenderTime = Math.round(performance.now() - startTime);
                this.recordMetricUpdate('aboveFoldRenderTime', this.metrics.aboveFoldRenderTime);
            } else {
                requestAnimationFrame(checkAboveFoldComplete);
            }
        };

        requestAnimationFrame(checkAboveFoldComplete);
    }

    // ================================
    // USER INTERACTION TRACKING
    // ================================

    setupUserInteractionTracking() {
        if (!this.options.trackUserInteractions) return;

        console.log('👆 Setting up user interaction tracking...');

        this.trackScrollResponsiveness();
        this.trackClickResponsiveness();
        this.trackInputResponsiveness();
    }

    trackScrollResponsiveness() {
        let lastScrollTime = 0;
        let scrollDeltas = [];

        const handleScroll = () => {
            const now = performance.now();

            if (lastScrollTime > 0) {
                const delta = now - lastScrollTime;
                scrollDeltas.push(delta);

                // Keep only recent measurements
                if (scrollDeltas.length > 10) {
                    scrollDeltas.shift();
                }

                // Calculate responsiveness score (lower deltas = higher score)
                const avgDelta = scrollDeltas.reduce((a, b) => a + b, 0) / scrollDeltas.length;
                this.metrics.scrollResponsiveness = Math.max(0, 100 - avgDelta);
            }

            lastScrollTime = now;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    trackClickResponsiveness() {
        let clickTimes = [];

        document.addEventListener('click', () => {
            const now = performance.now();
            clickTimes.push(now);

            // Measure time between clicks
            if (clickTimes.length > 1) {
                const recentClicks = clickTimes.slice(-5); // Last 5 clicks
                const deltas = [];

                for (let i = 1; i < recentClicks.length; i++) {
                    deltas.push(recentClicks[i] - recentClicks[i - 1]);
                }

                const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
                this.metrics.clickResponsiveness = Math.min(100, Math.max(0, 100 - (avgDelta / 100)));
            }
        });
    }

    trackInputResponsiveness() {
        let inputTimes = [];

        document.addEventListener('input', () => {
            const now = performance.now();
            inputTimes.push(now);

            if (inputTimes.length > 10) {
                inputTimes.shift();
            }

            // Calculate input responsiveness based on input frequency
            if (inputTimes.length > 1) {
                const recentInputs = inputTimes.slice(-5);
                const deltas = [];

                for (let i = 1; i < recentInputs.length; i++) {
                    deltas.push(recentInputs[i] - recentInputs[i - 1]);
                }

                const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
                this.metrics.inputResponsiveness = Math.min(100, Math.max(0, 100 - (avgDelta / 50)));
            }
        });
    }

    // ================================
    // NETWORK & MEMORY TRACKING
    // ================================

    setupNetworkTracking() {
        if (!navigator.connection) return;

        const connection = navigator.connection;

        this.metrics.connectionType = connection.type || 'unknown';
        this.metrics.effectiveType = connection.effectiveType || 'unknown';
        this.metrics.downlink = connection.downlink || null;
        this.metrics.rtt = connection.rtt || null;

        // Listen for network changes
        connection.addEventListener('change', () => {
            this.metrics.connectionType = connection.type || 'unknown';
            this.metrics.effectiveType = connection.effectiveType || 'unknown';
            this.metrics.downlink = connection.downlink || null;
            this.metrics.rtt = connection.rtt || null;

            this.recordMetricUpdate('networkChange', {
                type: this.metrics.connectionType,
                effectiveType: this.metrics.effectiveType
            });
        });
    }

    setupMemoryTracking() {
        if (!('memory' in performance)) return;

        const updateMemoryMetrics = () => {
            const memory = performance.memory;

            this.metrics.memoryUsage = memory.usedJSHeapSize;
            this.metrics.memoryLimit = memory.jsHeapSizeLimit;

            const memoryPercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

            if (memoryPercentage > this.options.thresholds.memory) {
                this.createAlert('memory', `High memory usage: ${memoryPercentage.toFixed(1)}%`);
            }
        };

        // Update memory metrics periodically
        setInterval(updateMemoryMetrics, 5000);
        updateMemoryMetrics(); // Initial measurement
    }

    // ================================
    // ALERTS & THRESHOLDS
    // ================================

    checkThreshold(metric, value) {
        const threshold = this.options.thresholds[metric];
        if (!threshold) return;

        if (value > threshold) {
            this.createAlert(metric, `${metric.toUpperCase()} threshold exceeded: ${value}ms (threshold: ${threshold}ms)`);
        }
    }

    createAlert(type, message) {
        const alert = {
            type,
            message,
            timestamp: Date.now(),
            severity: this.getAlertSeverity(type)
        };

        this.alerts.push(alert);

        // Keep only recent alerts
        if (this.alerts.length > 50) {
            this.alerts.shift();
        }

        console.warn(`🚨 Performance Alert: ${message}`);

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('performanceAlert', {
            detail: alert
        }));
    }

    getAlertSeverity(type) {
        const severityMap = {
            lcp: 'high',
            fid: 'high',
            cls: 'medium',
            fcp: 'medium',
            ttfb: 'medium',
            memory: 'high'
        };

        return severityMap[type] || 'low';
    }

    // ================================
    // PERIODIC REPORTING
    // ================================

    startPeriodicReporting() {
        setInterval(() => {
            this.generateReport();
        }, this.options.reportInterval);

        // Initial report after 5 seconds
        setTimeout(() => {
            this.generateReport();
        }, 5000);
    }

    recordMetricUpdate(metric, value) {
        this.performanceBuffer.push({
            type: 'metric',
            metric,
            value,
            timestamp: Date.now()
        });
    }

    generateReport() {
        const now = Date.now();
        const report = {
            timestamp: now,
            sessionDuration: now - this.lastReport,
            coreWebVitals: {
                lcp: this.metrics.lcp,
                fid: this.metrics.fid,
                cls: this.metrics.cls,
                fcp: this.metrics.fcp,
                ttfb: this.metrics.ttfb
            },
            customMetrics: {
                domInteractive: this.metrics.domInteractive,
                domContentLoaded: this.metrics.domContentLoaded,
                loadComplete: this.metrics.loadComplete,
                timeToInteractive: this.metrics.timeToInteractive,
                aboveFoldRenderTime: this.metrics.aboveFoldRenderTime,
                heroImageLoadTime: this.metrics.heroImageLoadTime
            },
            resourceMetrics: {
                totalResources: this.metrics.totalResources,
                totalResourceSize: this.metrics.totalResourceSize,
                cachedResources: this.metrics.cachedResources,
                failedResources: this.metrics.failedResources,
                cacheHitRatio: this.metrics.totalResources > 0 ?
                    (this.metrics.cachedResources / this.metrics.totalResources * 100).toFixed(1) : 0
            },
            userExperience: {
                scrollResponsiveness: this.metrics.scrollResponsiveness,
                clickResponsiveness: this.metrics.clickResponsiveness,
                inputResponsiveness: this.metrics.inputResponsiveness
            },
            network: {
                connectionType: this.metrics.connectionType,
                effectiveType: this.metrics.effectiveType,
                downlink: this.metrics.downlink,
                rtt: this.metrics.rtt
            },
            memory: this.metrics.memoryUsage ? {
                used: this.metrics.memoryUsage,
                limit: this.metrics.memoryLimit,
                percentage: ((this.metrics.memoryUsage / this.metrics.memoryLimit) * 100).toFixed(1)
            } : null,
            alerts: this.alerts.slice(-10), // Last 10 alerts
            score: this.calculatePerformanceScore()
        };

        // Add to history
        this.metricsHistory.push(report);

        // Keep only recent history
        if (this.metricsHistory.length > 100) {
            this.metricsHistory.shift();
        }

        // Generate recommendations
        this.recommendations = this.generateRecommendations(report);

        // Report to console if enabled
        if (this.options.enableConsoleReports) {
            console.log('📊 Performance Report:', report);
        }

        // Report to analytics
        if (this.options.enableAnalytics) {
            this.reportToAnalytics(report);
        }

        // Update dashboard
        this.updateDashboard(report);

        // Clear performance buffer
        this.performanceBuffer = [];
        this.lastReport = now;

        return report;
    }

    calculatePerformanceScore() {
        let score = 100;

        // Core Web Vitals scoring
        if (this.metrics.lcp !== null) {
            if (this.metrics.lcp > 4000) score -= 25;
            else if (this.metrics.lcp > 2500) score -= 15;
        }

        if (this.metrics.fid !== null) {
            if (this.metrics.fid > 300) score -= 25;
            else if (this.metrics.fid > 100) score -= 15;
        }

        if (this.metrics.cls !== null) {
            if (this.metrics.cls > 0.25) score -= 25;
            else if (this.metrics.cls > 0.1) score -= 15;
        }

        if (this.metrics.fcp !== null) {
            if (this.metrics.fcp > 3000) score -= 10;
            else if (this.metrics.fcp > 1800) score -= 5;
        }

        // Additional factors
        if (this.metrics.failedResources > 0) {
            score -= this.metrics.failedResources * 2;
        }

        return Math.max(0, score);
    }

    generateRecommendations(report) {
        const recommendations = [];

        // Core Web Vitals recommendations
        if (report.coreWebVitals.lcp > 2500) {
            recommendations.push({
                priority: 'high',
                category: 'LCP',
                issue: `LCP is ${report.coreWebVitals.lcp}ms`,
                recommendation: 'Optimize images, preload critical resources, and improve server response times'
            });
        }

        if (report.coreWebVitals.fid > 100) {
            recommendations.push({
                priority: 'high',
                category: 'FID',
                issue: `FID is ${report.coreWebVitals.fid}ms`,
                recommendation: 'Reduce JavaScript execution time and defer non-critical scripts'
            });
        }

        if (report.coreWebVitals.cls > 0.1) {
            recommendations.push({
                priority: 'medium',
                category: 'CLS',
                issue: `CLS is ${report.coreWebVitals.cls}`,
                recommendation: 'Set image dimensions and avoid dynamic content insertion'
            });
        }

        // Resource recommendations
        if (report.resourceMetrics.failedResources > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'Resources',
                issue: `${report.resourceMetrics.failedResources} failed resources`,
                recommendation: 'Fix broken resource links and implement proper error handling'
            });
        }

        if (parseFloat(report.resourceMetrics.cacheHitRatio) < 50) {
            recommendations.push({
                priority: 'low',
                category: 'Caching',
                issue: `Low cache hit ratio: ${report.resourceMetrics.cacheHitRatio}%`,
                recommendation: 'Implement better caching strategies and service worker'
            });
        }

        return recommendations;
    }

    reportToAnalytics(report) {
        if (typeof gtag === 'function') {
            // Report core web vitals
            gtag('event', 'core_web_vitals', {
                event_category: 'Performance',
                custom_parameters: {
                    lcp: report.coreWebVitals.lcp,
                    fid: report.coreWebVitals.fid,
                    cls: Math.round(report.coreWebVitals.cls * 1000),
                    fcp: report.coreWebVitals.fcp,
                    score: report.score
                }
            });
        }

        // Custom event for other analytics tools
        window.dispatchEvent(new CustomEvent('performanceReport', {
            detail: report
        }));
    }

    // ================================
    // DASHBOARD UI
    // ================================

    createDashboard() {
        if (document.getElementById('performance-dashboard')) return;

        const dashboard = document.createElement('div');
        dashboard.id = 'performance-dashboard';
        dashboard.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            max-height: 400px;
            overflow-y: auto;
            display: none;
        `;

        // Create toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = '📊';
        toggleBtn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #4F46E5;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px;
            cursor: pointer;
            z-index: 10001;
            font-size: 16px;
        `;

        toggleBtn.onclick = () => {
            dashboard.style.display = dashboard.style.display === 'none' ? 'block' : 'none';
            toggleBtn.style.right = dashboard.style.display === 'block' ? '320px' : '10px';
        };

        document.body.appendChild(dashboard);
        document.body.appendChild(toggleBtn);

        this.dashboardElement = dashboard;

        // Keyboard shortcut to toggle
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                toggleBtn.click();
            }
        });
    }

    updateDashboard(report) {
        if (!this.dashboardElement) return;

        const formatValue = (value, unit = 'ms') => {
            return value !== null ? `${value}${unit}` : 'N/A';
        };

        const getScoreColor = (score) => {
            if (score >= 90) return '#10B981';
            if (score >= 70) return '#F59E0B';
            return '#EF4444';
        };

        this.dashboardElement.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: #4F46E5;">Performance Monitor</h3>

            <div style="margin-bottom: 10px;">
                <strong style="color: ${getScoreColor(report.score)};">Score: ${report.score}</strong>
            </div>

            <div style="margin-bottom: 10px;">
                <strong>Core Web Vitals:</strong><br>
                LCP: ${formatValue(report.coreWebVitals.lcp)}<br>
                FID: ${formatValue(report.coreWebVitals.fid)}<br>
                CLS: ${report.coreWebVitals.cls || 'N/A'}<br>
                FCP: ${formatValue(report.coreWebVitals.fcp)}<br>
                TTFB: ${formatValue(report.coreWebVitals.ttfb)}
            </div>

            <div style="margin-bottom: 10px;">
                <strong>Resources:</strong><br>
                Total: ${report.resourceMetrics.totalResources}<br>
                Cached: ${report.resourceMetrics.cachedResources}<br>
                Failed: ${report.resourceMetrics.failedResources}<br>
                Hit Rate: ${report.resourceMetrics.cacheHitRatio}%
            </div>

            ${report.network.effectiveType ? `
            <div style="margin-bottom: 10px;">
                <strong>Network:</strong><br>
                Type: ${report.network.effectiveType}<br>
                RTT: ${report.network.rtt || 'N/A'}ms<br>
                Downlink: ${report.network.downlink || 'N/A'}Mbps
            </div>
            ` : ''}

            ${report.memory ? `
            <div style="margin-bottom: 10px;">
                <strong>Memory:</strong><br>
                Usage: ${report.memory.percentage}%<br>
                Used: ${Math.round(report.memory.used / 1024 / 1024)}MB
            </div>
            ` : ''}

            ${report.alerts.length > 0 ? `
            <div style="margin-bottom: 10px;">
                <strong style="color: #EF4444;">Recent Alerts:</strong><br>
                ${report.alerts.slice(-3).map(alert =>
                    `<span style="color: #EF4444;">• ${alert.message}</span>`
                ).join('<br>')}
            </div>
            ` : ''}

            <div style="font-size: 10px; color: #888;">
                Last updated: ${new Date(report.timestamp).toLocaleTimeString()}
            </div>
        `;
    }

    // ================================
    // PUBLIC API
    // ================================

    getCurrentMetrics() {
        return { ...this.metrics };
    }

    getMetricsHistory() {
        return [...this.metricsHistory];
    }

    getRecommendations() {
        return [...this.recommendations];
    }

    getAlerts() {
        return [...this.alerts];
    }

    clearHistory() {
        this.metricsHistory = [];
        this.alerts = [];
        console.log('📊 Performance history cleared');
    }

    exportData() {
        return {
            metrics: this.getCurrentMetrics(),
            history: this.getMetricsHistory(),
            recommendations: this.getRecommendations(),
            alerts: this.getAlerts()
        };
    }

    // ================================
    // CLEANUP
    // ================================

    destroy() {
        console.log('🧹 Cleaning up Performance Monitoring Dashboard...');

        // Disconnect all observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();

        // Remove dashboard elements
        if (this.dashboardElement) {
            this.dashboardElement.remove();
        }

        // Clear data
        this.metricsHistory = [];
        this.alerts = [];
        this.recommendations = [];
        this.performanceBuffer = [];
    }
}

// Initialize the Performance Monitoring Dashboard
const performanceDashboard = new PerformanceMonitoringDashboard({
    enableRealTimeMetrics: true,
    trackCoreWebVitals: true,
    trackCustomMetrics: true,
    trackResourceTiming: true,
    trackUserInteractions: true,
    showLiveMetrics: true,
    enableConsoleReports: false, // Set to false to reduce console noise
    enableAnalytics: true
});

// Export for global use
window.PerformanceMonitoringDashboard = PerformanceMonitoringDashboard;
window.performanceDashboard = performanceDashboard;

// Helper functions for external use
window.getPerformanceMetrics = () => performanceDashboard.getCurrentMetrics();
window.getPerformanceHistory = () => performanceDashboard.getMetricsHistory();
window.getPerformanceRecommendations = () => performanceDashboard.getRecommendations();

console.log('📊 Performance Monitoring Dashboard initialized - Press Ctrl+Shift+P to toggle');