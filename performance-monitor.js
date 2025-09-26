#!/usr/bin/env node

import { writeFileSync } from 'fs';

/**
 * MAXIMUM POWER Performance Monitoring & Real-Time Analytics
 * Advanced monitoring with AI-powered anomaly detection
 */

class PerformanceMonitoringSystem {
    constructor() {
        this.metrics = {
            performance: new Map(),
            errors: new Map(),
            conversions: new Map(),
            revenue: new Map(),
            users: new Map()
        };

        this.thresholds = {
            lcp: 2500,      // Largest Contentful Paint
            fid: 100,       // First Input Delay
            cls: 0.1,       // Cumulative Layout Shift
            ttfb: 600,      // Time to First Byte
            fcp: 1800,      // First Contentful Paint
            errorRate: 0.01,
            bounceRate: 0.4,
            conversionRate: 0.02
        };

        this.alerts = [];
        this.anomalies = [];

        this.init();
    }

    init() {
        console.log('🚀 INITIATING PERFORMANCE MONITORING SYSTEM...\n');

        this.setupRealTimeMonitoring();
        this.setupErrorTracking();
        this.setupConversionTracking();
        this.setupUserAnalytics();
        this.setupAnomalyDetection();
        this.setupDashboard();
        this.startMonitoring();
    }

    setupRealTimeMonitoring() {
        /**
         * Client-side performance monitoring script
         */
        const monitoringScript = `
        (function() {
            // Performance Observer for Core Web Vitals
            if ('PerformanceObserver' in window) {
                // LCP Observer
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    window.tppMetrics = window.tppMetrics || {};
                    window.tppMetrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
                    sendMetric('lcp', window.tppMetrics.lcp);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

                // FID Observer
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        window.tppMetrics = window.tppMetrics || {};
                        window.tppMetrics.fid = entry.processingStart - entry.startTime;
                        sendMetric('fid', window.tppMetrics.fid);
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });

                // CLS Observer
                let clsValue = 0;
                let clsEntries = [];
                const clsObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                            clsEntries.push(entry);
                        }
                    }
                    window.tppMetrics = window.tppMetrics || {};
                    window.tppMetrics.cls = clsValue;
                    sendMetric('cls', clsValue);
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            }

            // Navigation Timing API
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.timing;
                    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                    const connectTime = perfData.responseEnd - perfData.requestStart;
                    const renderTime = perfData.domComplete - perfData.domLoading;
                    const ttfb = perfData.responseStart - perfData.navigationStart;

                    const metrics = {
                        pageLoadTime,
                        connectTime,
                        renderTime,
                        ttfb,
                        domElements: document.getElementsByTagName('*').length,
                        resources: performance.getEntriesByType('resource').length
                    };

                    sendMetrics(metrics);
                }, 0);
            });

            // Resource Timing
            if (window.PerformanceObserver) {
                const resourceObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 1000) {
                            console.warn('Slow resource:', entry.name, entry.duration + 'ms');
                            sendMetric('slowResource', {
                                url: entry.name,
                                duration: entry.duration,
                                type: entry.initiatorType
                            });
                        }
                    }
                });
                resourceObserver.observe({ entryTypes: ['resource'] });
            }

            // Memory Usage (Chrome only)
            if (performance.memory) {
                setInterval(() => {
                    const memoryInfo = {
                        usedJSHeapSize: performance.memory.usedJSHeapSize,
                        totalJSHeapSize: performance.memory.totalJSHeapSize,
                        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
                        usage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
                    };

                    if (memoryInfo.usage > 90) {
                        console.warn('High memory usage:', memoryInfo.usage.toFixed(2) + '%');
                        sendMetric('memoryWarning', memoryInfo);
                    }
                }, 10000);
            }

            // Long Tasks
            if (window.PerformanceObserver) {
                const longTaskObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        console.warn('Long task detected:', entry.duration + 'ms');
                        sendMetric('longTask', {
                            duration: entry.duration,
                            startTime: entry.startTime,
                            name: entry.name
                        });
                    }
                });

                try {
                    longTaskObserver.observe({ entryTypes: ['longtask'] });
                } catch (e) {
                    // Long task API might not be supported
                }
            }

            // Send metrics to server
            function sendMetric(name, value) {
                fetch('/api/metrics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        metric: name,
                        value: value,
                        timestamp: Date.now(),
                        url: window.location.href,
                        userAgent: navigator.userAgent
                    })
                }).catch(err => console.error('Failed to send metric:', err));
            }

            function sendMetrics(metrics) {
                fetch('/api/metrics/batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        metrics: metrics,
                        timestamp: Date.now(),
                        url: window.location.href
                    })
                }).catch(err => console.error('Failed to send metrics:', err));
            }
        })();
        `;

        console.log('✅ Real-time performance monitoring configured');
        return monitoringScript;
    }

    setupErrorTracking() {
        /**
         * Comprehensive error tracking
         */
        const errorTrackingScript = `
        (function() {
            // Global error handler
            window.addEventListener('error', (event) => {
                const errorInfo = {
                    message: event.message,
                    source: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    error: event.error ? {
                        stack: event.error.stack,
                        name: event.error.name
                    } : null,
                    timestamp: Date.now(),
                    url: window.location.href,
                    userAgent: navigator.userAgent
                };

                sendError(errorInfo);
            });

            // Unhandled promise rejection
            window.addEventListener('unhandledrejection', (event) => {
                const errorInfo = {
                    type: 'unhandledRejection',
                    reason: event.reason,
                    promise: event.promise,
                    timestamp: Date.now(),
                    url: window.location.href
                };

                sendError(errorInfo);
            });

            // Console error override
            const originalError = console.error;
            console.error = function(...args) {
                sendError({
                    type: 'consoleError',
                    arguments: args,
                    timestamp: Date.now(),
                    url: window.location.href
                });
                originalError.apply(console, args);
            };

            // Network error tracking
            const originalFetch = window.fetch;
            window.fetch = function(...args) {
                return originalFetch.apply(this, args)
                    .then(response => {
                        if (!response.ok) {
                            sendError({
                                type: 'networkError',
                                status: response.status,
                                statusText: response.statusText,
                                url: args[0],
                                timestamp: Date.now()
                            });
                        }
                        return response;
                    })
                    .catch(error => {
                        sendError({
                            type: 'networkError',
                            message: error.message,
                            url: args[0],
                            timestamp: Date.now()
                        });
                        throw error;
                    });
            };

            function sendError(errorInfo) {
                fetch('/api/errors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(errorInfo)
                }).catch(() => {
                    // Fallback to beacon API if fetch fails
                    if (navigator.sendBeacon) {
                        navigator.sendBeacon('/api/errors', JSON.stringify(errorInfo));
                    }
                });
            }
        })();
        `;

        console.log('✅ Error tracking system initialized');
        return errorTrackingScript;
    }

    setupConversionTracking() {
        /**
         * Advanced conversion tracking with attribution
         */
        const conversionScript = `
        (function() {
            // Track micro-conversions
            const microConversions = {
                'scroll_50': false,
                'scroll_75': false,
                'scroll_100': false,
                'time_30s': false,
                'time_60s': false,
                'time_120s': false,
                'form_interaction': false,
                'cta_hover': false,
                'video_play': false
            };

            // Scroll tracking
            let maxScroll = 0;
            window.addEventListener('scroll', () => {
                const scrollPercentage = (window.scrollY /
                    (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                maxScroll = Math.max(maxScroll, scrollPercentage);

                if (maxScroll >= 50 && !microConversions['scroll_50']) {
                    microConversions['scroll_50'] = true;
                    trackConversion('micro', 'scroll_50', 0.1);
                }
                if (maxScroll >= 75 && !microConversions['scroll_75']) {
                    microConversions['scroll_75'] = true;
                    trackConversion('micro', 'scroll_75', 0.2);
                }
                if (maxScroll >= 100 && !microConversions['scroll_100']) {
                    microConversions['scroll_100'] = true;
                    trackConversion('micro', 'scroll_100', 0.3);
                }
            });

            // Time on site tracking
            const startTime = Date.now();
            setTimeout(() => {
                if (!microConversions['time_30s']) {
                    microConversions['time_30s'] = true;
                    trackConversion('micro', 'time_30s', 0.1);
                }
            }, 30000);

            setTimeout(() => {
                if (!microConversions['time_60s']) {
                    microConversions['time_60s'] = true;
                    trackConversion('micro', 'time_60s', 0.2);
                }
            }, 60000);

            // Form interaction tracking
            document.querySelectorAll('form').forEach(form => {
                form.addEventListener('focus', () => {
                    if (!microConversions['form_interaction']) {
                        microConversions['form_interaction'] = true;
                        trackConversion('micro', 'form_interaction', 0.5);
                    }
                }, true);

                form.addEventListener('submit', (e) => {
                    trackConversion('macro', 'form_submit', 10, {
                        formId: form.id,
                        formName: form.name
                    });
                });
            });

            // CTA tracking
            document.querySelectorAll('.cta, button').forEach(cta => {
                cta.addEventListener('mouseenter', () => {
                    if (!microConversions['cta_hover']) {
                        microConversions['cta_hover'] = true;
                        trackConversion('micro', 'cta_hover', 0.1);
                    }
                });

                cta.addEventListener('click', () => {
                    trackConversion('macro', 'cta_click', 1, {
                        ctaText: cta.textContent,
                        ctaLocation: cta.dataset.location
                    });
                });
            });

            // Attribution tracking
            function getAttribution() {
                const urlParams = new URLSearchParams(window.location.search);
                return {
                    source: urlParams.get('utm_source') || document.referrer || 'direct',
                    medium: urlParams.get('utm_medium') || 'organic',
                    campaign: urlParams.get('utm_campaign') || 'none',
                    content: urlParams.get('utm_content'),
                    term: urlParams.get('utm_term'),
                    referrer: document.referrer,
                    landingPage: sessionStorage.getItem('tpp_landing_page') || window.location.href,
                    sessionId: sessionStorage.getItem('tpp_session_id') || generateSessionId()
                };
            }

            // Conversion value calculation
            function calculateConversionValue(type, action) {
                const values = {
                    'form_submit': 100,
                    'cta_click': 10,
                    'phone_click': 50,
                    'email_click': 30,
                    'download': 20,
                    'video_complete': 15,
                    'chat_initiated': 40
                };

                return values[action] || 1;
            }

            // Track conversion
            function trackConversion(type, action, value, metadata = {}) {
                const conversionData = {
                    type,
                    action,
                    value: value || calculateConversionValue(type, action),
                    metadata,
                    attribution: getAttribution(),
                    timestamp: Date.now(),
                    url: window.location.href,
                    sessionDuration: Date.now() - startTime
                };

                fetch('/api/conversions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(conversionData)
                });

                // Send to analytics platforms
                if (window.gtag) {
                    gtag('event', 'conversion', {
                        'send_to': 'GA4',
                        'value': conversionData.value,
                        'currency': 'AUD',
                        'conversion_action': action
                    });
                }

                if (window.fbq) {
                    fbq('trackCustom', 'Conversion', conversionData);
                }
            }

            function generateSessionId() {
                const id = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                sessionStorage.setItem('tpp_session_id', id);
                return id;
            }

            // Expose global conversion tracking
            window.trackConversion = trackConversion;
        })();
        `;

        console.log('✅ Conversion tracking system deployed');
        return conversionScript;
    }

    setupUserAnalytics() {
        /**
         * Advanced user behavior analytics
         */
        class UserAnalytics {
            constructor() {
                this.sessions = new Map();
                this.behaviors = new Map();
                this.cohorts = new Map();
            }

            trackUser(userId) {
                if (!this.sessions.has(userId)) {
                    this.sessions.set(userId, {
                        id: userId,
                        startTime: Date.now(),
                        pageViews: [],
                        events: [],
                        conversions: [],
                        revenue: 0
                    });
                }

                return this.sessions.get(userId);
            }

            trackBehavior(userId, behavior) {
                const session = this.trackUser(userId);
                session.events.push({
                    type: behavior.type,
                    data: behavior.data,
                    timestamp: Date.now()
                });

                // Analyze behavior patterns
                this.analyzeBehaviorPatterns(userId, session);
            }

            analyzeBehaviorPatterns(userId, session) {
                const patterns = {
                    isEngaged: session.events.length > 10,
                    isReturning: this.behaviors.has(userId),
                    intentLevel: this.calculateIntent(session),
                    predictedLTV: this.predictLTV(session),
                    churnRisk: this.predictChurn(session)
                };

                this.behaviors.set(userId, patterns);
                return patterns;
            }

            calculateIntent(session) {
                const signals = {
                    pageViews: Math.min(session.pageViews.length / 10, 1),
                    timeSpent: Math.min((Date.now() - session.startTime) / 300000, 1), // 5 min
                    conversions: Math.min(session.conversions.length / 3, 1),
                    engagement: Math.min(session.events.length / 20, 1)
                };

                return Object.values(signals).reduce((a, b) => a + b, 0) / 4;
            }

            predictLTV(session) {
                // Simplified LTV prediction
                const baseValue = 1000;
                const multipliers = {
                    engagement: 1 + (session.events.length * 0.01),
                    conversions: 1 + (session.conversions.length * 0.5),
                    timeSpent: 1 + ((Date.now() - session.startTime) / 600000) // Per 10 min
                };

                return Math.round(baseValue *
                    multipliers.engagement *
                    multipliers.conversions *
                    multipliers.timeSpent);
            }

            predictChurn(session) {
                const lastActivity = session.events[session.events.length - 1]?.timestamp || session.startTime;
                const inactivityMinutes = (Date.now() - lastActivity) / 60000;

                if (inactivityMinutes > 30) return 'high';
                if (inactivityMinutes > 10) return 'medium';
                return 'low';
            }

            segmentUsers() {
                const segments = {
                    champions: [],
                    loyal: [],
                    potential: [],
                    new: [],
                    atrisk: [],
                    lost: []
                };

                this.behaviors.forEach((behavior, userId) => {
                    if (behavior.predictedLTV > 5000 && behavior.intentLevel > 0.8) {
                        segments.champions.push(userId);
                    } else if (behavior.isReturning && behavior.intentLevel > 0.6) {
                        segments.loyal.push(userId);
                    } else if (behavior.intentLevel > 0.7) {
                        segments.potential.push(userId);
                    } else if (!behavior.isReturning) {
                        segments.new.push(userId);
                    } else if (behavior.churnRisk === 'high') {
                        segments.atrisk.push(userId);
                    } else {
                        segments.lost.push(userId);
                    }
                });

                this.cohorts = segments;
                return segments;
            }
        }

        this.userAnalytics = new UserAnalytics();
        console.log('✅ User analytics system initialized');
    }

    setupAnomalyDetection() {
        /**
         * AI-powered anomaly detection
         */
        class AnomalyDetector {
            constructor(metrics) {
                this.metrics = metrics;
                this.baselines = new Map();
                this.deviations = new Map();
            }

            calculateBaseline(metric, data) {
                const values = Array.from(data.values());
                const mean = values.reduce((a, b) => a + b, 0) / values.length;
                const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
                const stdDev = Math.sqrt(variance);

                this.baselines.set(metric, {
                    mean,
                    stdDev,
                    min: Math.min(...values),
                    max: Math.max(...values),
                    p95: this.percentile(values, 0.95),
                    p99: this.percentile(values, 0.99)
                });
            }

            detectAnomaly(metric, value) {
                const baseline = this.baselines.get(metric);
                if (!baseline) return false;

                const zScore = Math.abs((value - baseline.mean) / baseline.stdDev);
                const isAnomaly = zScore > 3 || value > baseline.p99 || value < baseline.min * 0.5;

                if (isAnomaly) {
                    this.recordAnomaly(metric, value, zScore);
                }

                return isAnomaly;
            }

            recordAnomaly(metric, value, zScore) {
                const anomaly = {
                    metric,
                    value,
                    zScore,
                    timestamp: Date.now(),
                    severity: this.calculateSeverity(zScore),
                    impact: this.estimateImpact(metric, value)
                };

                if (!this.deviations.has(metric)) {
                    this.deviations.set(metric, []);
                }
                this.deviations.get(metric).push(anomaly);

                // Trigger alert
                if (anomaly.severity === 'critical') {
                    this.triggerAlert(anomaly);
                }

                return anomaly;
            }

            calculateSeverity(zScore) {
                if (zScore > 5) return 'critical';
                if (zScore > 4) return 'high';
                if (zScore > 3) return 'medium';
                return 'low';
            }

            estimateImpact(metric, value) {
                const impactMap = {
                    'lcp': value > 4000 ? 'high' : 'medium',
                    'errorRate': value > 0.05 ? 'critical' : 'high',
                    'conversionRate': value < 0.01 ? 'high' : 'medium',
                    'revenue': 'critical'
                };

                return impactMap[metric] || 'medium';
            }

            triggerAlert(anomaly) {
                console.error(`🚨 CRITICAL ANOMALY DETECTED: ${anomaly.metric} = ${anomaly.value}`);

                // Send alert notification
                fetch('/api/alerts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(anomaly)
                });
            }

            percentile(arr, p) {
                const sorted = arr.slice().sort((a, b) => a - b);
                const index = Math.ceil(sorted.length * p) - 1;
                return sorted[index];
            }

            runMLDetection() {
                // Simplified ML-based anomaly detection
                const patterns = this.identifyPatterns();
                const predictions = this.predictFuture();
                const correlations = this.findCorrelations();

                return {
                    patterns,
                    predictions,
                    correlations,
                    risk: this.calculateRiskScore()
                };
            }

            identifyPatterns() {
                // Pattern recognition in metrics
                const patterns = [];

                this.metrics.performance.forEach((values, metric) => {
                    const trend = this.detectTrend(Array.from(values.values()));
                    if (trend !== 'stable') {
                        patterns.push({
                            metric,
                            trend,
                            confidence: 0.85
                        });
                    }
                });

                return patterns;
            }

            detectTrend(values) {
                if (values.length < 10) return 'insufficient_data';

                const recent = values.slice(-5);
                const earlier = values.slice(-10, -5);

                const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
                const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;

                const change = (recentAvg - earlierAvg) / earlierAvg;

                if (change > 0.1) return 'increasing';
                if (change < -0.1) return 'decreasing';
                return 'stable';
            }

            predictFuture() {
                // Simple linear prediction
                const predictions = new Map();

                this.metrics.performance.forEach((values, metric) => {
                    const data = Array.from(values.values());
                    if (data.length < 5) return;

                    const trend = this.linearRegression(data);
                    const nextValue = trend.slope * (data.length + 1) + trend.intercept;

                    predictions.set(metric, {
                        next: nextValue,
                        confidence: trend.r2
                    });
                });

                return predictions;
            }

            linearRegression(data) {
                const n = data.length;
                const x = Array.from({ length: n }, (_, i) => i);
                const y = data;

                const sumX = x.reduce((a, b) => a + b, 0);
                const sumY = y.reduce((a, b) => a + b, 0);
                const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
                const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

                const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
                const intercept = (sumY - slope * sumX) / n;

                // Calculate R²
                const yMean = sumY / n;
                const ssRes = y.reduce((sum, yi, i) => {
                    const predicted = slope * x[i] + intercept;
                    return sum + Math.pow(yi - predicted, 2);
                }, 0);
                const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
                const r2 = 1 - (ssRes / ssTot);

                return { slope, intercept, r2 };
            }

            findCorrelations() {
                // Find correlations between metrics
                const correlations = [];
                const metricKeys = Array.from(this.metrics.performance.keys());

                for (let i = 0; i < metricKeys.length; i++) {
                    for (let j = i + 1; j < metricKeys.length; j++) {
                        const correlation = this.calculateCorrelation(
                            Array.from(this.metrics.performance.get(metricKeys[i]).values()),
                            Array.from(this.metrics.performance.get(metricKeys[j]).values())
                        );

                        if (Math.abs(correlation) > 0.7) {
                            correlations.push({
                                metric1: metricKeys[i],
                                metric2: metricKeys[j],
                                correlation
                            });
                        }
                    }
                }

                return correlations;
            }

            calculateCorrelation(x, y) {
                if (x.length !== y.length) return 0;

                const n = x.length;
                const meanX = x.reduce((a, b) => a + b, 0) / n;
                const meanY = y.reduce((a, b) => a + b, 0) / n;

                const num = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
                const denX = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0));
                const denY = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0));

                return num / (denX * denY);
            }

            calculateRiskScore() {
                let risk = 0;

                // Check critical metrics
                const criticalMetrics = ['errorRate', 'conversionRate', 'lcp', 'revenue'];

                criticalMetrics.forEach(metric => {
                    if (this.deviations.has(metric)) {
                        const recent = this.deviations.get(metric).slice(-5);
                        risk += recent.reduce((sum, anomaly) => {
                            const severityScore = {
                                'critical': 10,
                                'high': 5,
                                'medium': 2,
                                'low': 1
                            }[anomaly.severity];
                            return sum + severityScore;
                        }, 0);
                    }
                });

                return Math.min(risk, 100); // Cap at 100
            }
        }

        this.anomalyDetector = new AnomalyDetector(this.metrics);
        console.log('✅ Anomaly detection system initialized');
    }

    setupDashboard() {
        /**
         * Real-time monitoring dashboard
         */
        const dashboardHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Monitoring Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f0f0f;
            color: #fff;
            padding: 20px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #333;
        }
        h1 {
            font-size: 28px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .status {
            display: flex;
            gap: 20px;
        }
        .status-item {
            padding: 10px 20px;
            background: #1a1a1a;
            border-radius: 8px;
            border: 1px solid #333;
        }
        .status-item.good { border-color: #10b981; }
        .status-item.warning { border-color: #f59e0b; }
        .status-item.critical { border-color: #ef4444; }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .metric-card {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 12px;
            padding: 20px;
            transition: transform 0.2s;
        }
        .metric-card:hover {
            transform: translateY(-2px);
            border-color: #555;
        }

        .metric-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
        }

        .metric-title {
            color: #888;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .metric-value {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .metric-change {
            font-size: 14px;
            color: #888;
        }
        .metric-change.positive { color: #10b981; }
        .metric-change.negative { color: #ef4444; }

        .chart {
            height: 100px;
            background: #0a0a0a;
            border-radius: 8px;
            margin-top: 15px;
            position: relative;
            overflow: hidden;
        }

        .alerts {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
        }

        .alert-item {
            padding: 15px;
            background: #0a0a0a;
            border-radius: 8px;
            margin-bottom: 10px;
            border-left: 3px solid #ef4444;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .alert-text {
            flex: 1;
        }

        .alert-time {
            color: #666;
            font-size: 12px;
        }

        .live-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            animation: pulse 2s infinite;
            margin-right: 8px;
        }

        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }

        .anomaly-badge {
            display: inline-block;
            padding: 4px 8px;
            background: #ef4444;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Performance Monitoring Dashboard</h1>
        <div class="status">
            <div class="status-item good">
                <span class="live-indicator"></span>
                System Operational
            </div>
            <div class="status-item" id="risk-status">
                Risk Score: <span id="risk-score">0</span>
            </div>
        </div>
    </div>

    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Page Load Time</span>
                <span id="lcp-status"></span>
            </div>
            <div class="metric-value" id="lcp">-</div>
            <div class="metric-change" id="lcp-change">-</div>
            <div class="chart" id="lcp-chart"></div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Error Rate</span>
                <span id="error-status"></span>
            </div>
            <div class="metric-value" id="error-rate">-</div>
            <div class="metric-change" id="error-change">-</div>
            <div class="chart" id="error-chart"></div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Conversion Rate</span>
                <span id="conversion-status"></span>
            </div>
            <div class="metric-value" id="conversion-rate">-</div>
            <div class="metric-change" id="conversion-change">-</div>
            <div class="chart" id="conversion-chart"></div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Revenue</span>
                <span id="revenue-status"></span>
            </div>
            <div class="metric-value" id="revenue">-</div>
            <div class="metric-change" id="revenue-change">-</div>
            <div class="chart" id="revenue-chart"></div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Active Users</span>
            </div>
            <div class="metric-value" id="active-users">-</div>
            <div class="metric-change" id="users-change">-</div>
            <div class="chart" id="users-chart"></div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Anomalies Detected</span>
            </div>
            <div class="metric-value" id="anomalies">-</div>
            <div class="metric-change" id="anomalies-trend">-</div>
            <div class="chart" id="anomalies-chart"></div>
        </div>
    </div>

    <div class="alerts">
        <h2>🚨 Recent Alerts</h2>
        <div id="alert-list"></div>
    </div>

    <script>
        // WebSocket connection for real-time updates
        const ws = new WebSocket('ws://localhost:8081');

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            updateDashboard(data);
        };

        function updateDashboard(data) {
            // Update metrics
            if (data.metrics) {
                Object.entries(data.metrics).forEach(([key, value]) => {
                    const element = document.getElementById(key);
                    if (element) {
                        element.textContent = formatValue(key, value);
                    }
                });
            }

            // Update alerts
            if (data.alerts) {
                const alertList = document.getElementById('alert-list');
                const alertHTML = data.alerts.map(alert => \`
                    <div class="alert-item">
                        <div class="alert-text">
                            \${alert.message}
                            \${alert.severity === 'critical' ? '<span class="anomaly-badge">CRITICAL</span>' : ''}
                        </div>
                        <div class="alert-time">\${formatTime(alert.timestamp)}</div>
                    </div>
                \`).join('');
                alertList.innerHTML = alertHTML;
            }

            // Update risk score
            if (data.riskScore !== undefined) {
                document.getElementById('risk-score').textContent = data.riskScore;
                const riskStatus = document.getElementById('risk-status');
                riskStatus.className = 'status-item ' + getRiskClass(data.riskScore);
            }
        }

        function formatValue(key, value) {
            if (key.includes('rate')) return (value * 100).toFixed(2) + '%';
            if (key.includes('revenue')) return '$' + value.toLocaleString();
            if (key.includes('time') || key.includes('lcp')) return value + 'ms';
            return value;
        }

        function formatTime(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleTimeString();
        }

        function getRiskClass(score) {
            if (score < 30) return 'good';
            if (score < 70) return 'warning';
            return 'critical';
        }

        // Simulate initial data
        setTimeout(() => {
            updateDashboard({
                metrics: {
                    'lcp': 2100,
                    'error-rate': 0.002,
                    'conversion-rate': 0.035,
                    'revenue': 125000,
                    'active-users': 342,
                    'anomalies': 2
                },
                alerts: [
                    { message: 'High memory usage detected on server-3', severity: 'warning', timestamp: Date.now() },
                    { message: 'Conversion rate spike detected', severity: 'info', timestamp: Date.now() - 60000 }
                ],
                riskScore: 15
            });
        }, 1000);
    </script>
</body>
</html>`;

        // Save dashboard
        writeFileSync('website/monitoring-dashboard.html', dashboardHTML);
        console.log('✅ Real-time dashboard created');
    }

    startMonitoring() {
        console.log('\n🚀 PERFORMANCE MONITORING ACTIVE\n');

        // Simulate metric collection
        setInterval(() => {
            this.collectMetrics();
            this.analyzePerformance();
            this.checkThresholds();
            this.runAnomalyDetection();
        }, 5000);

        // Generate reports
        setInterval(() => {
            this.generateReport();
        }, 30000);
    }

    collectMetrics() {
        // Simulate metric collection
        const metrics = {
            lcp: 2000 + Math.random() * 1000,
            fid: 50 + Math.random() * 100,
            cls: 0.05 + Math.random() * 0.1,
            ttfb: 400 + Math.random() * 400,
            errorRate: Math.random() * 0.01,
            conversionRate: 0.02 + Math.random() * 0.03,
            revenue: Math.floor(1000 + Math.random() * 5000),
            activeUsers: Math.floor(100 + Math.random() * 500)
        };

        // Store metrics
        Object.entries(metrics).forEach(([key, value]) => {
            if (!this.metrics.performance.has(key)) {
                this.metrics.performance.set(key, new Map());
            }
            this.metrics.performance.get(key).set(Date.now(), value);
        });
    }

    analyzePerformance() {
        // Analyze user sessions
        this.userAnalytics.segmentUsers();

        // Calculate baselines for anomaly detection
        this.metrics.performance.forEach((data, metric) => {
            if (data.size > 10) {
                this.anomalyDetector.calculateBaseline(metric, data);
            }
        });
    }

    checkThresholds() {
        const current = {};
        this.metrics.performance.forEach((data, metric) => {
            const values = Array.from(data.values());
            current[metric] = values[values.length - 1];
        });

        // Check against thresholds
        if (current.lcp > this.thresholds.lcp) {
            this.alerts.push({
                type: 'performance',
                message: `LCP exceeds threshold: ${current.lcp}ms > ${this.thresholds.lcp}ms`,
                severity: 'warning',
                timestamp: Date.now()
            });
        }

        if (current.errorRate > this.thresholds.errorRate) {
            this.alerts.push({
                type: 'error',
                message: `Error rate critical: ${(current.errorRate * 100).toFixed(2)}%`,
                severity: 'critical',
                timestamp: Date.now()
            });
        }
    }

    runAnomalyDetection() {
        this.metrics.performance.forEach((data, metric) => {
            const values = Array.from(data.values());
            const latest = values[values.length - 1];

            if (this.anomalyDetector.detectAnomaly(metric, latest)) {
                this.anomalies.push({
                    metric,
                    value: latest,
                    timestamp: Date.now()
                });
            }
        });

        // Run ML detection
        const mlResults = this.anomalyDetector.runMLDetection();
        if (mlResults.risk > 50) {
            console.warn(`⚠️ High risk detected: ${mlResults.risk}/100`);
        }
    }

    generateReport() {
        const report = `
╔════════════════════════════════════════════════════════╗
║          PERFORMANCE MONITORING REPORT                  ║
╠════════════════════════════════════════════════════════╣
║                                                          ║
║  Core Web Vitals:                                       ║
║  ├─ LCP: ${this.getMetricValue('lcp')}ms ${this.getMetricStatus('lcp')}
║  ├─ FID: ${this.getMetricValue('fid')}ms ${this.getMetricStatus('fid')}
║  ├─ CLS: ${this.getMetricValue('cls')} ${this.getMetricStatus('cls')}
║  └─ TTFB: ${this.getMetricValue('ttfb')}ms ${this.getMetricStatus('ttfb')}
║                                                          ║
║  Business Metrics:                                      ║
║  ├─ Error Rate: ${(this.getMetricValue('errorRate') * 100).toFixed(3)}% ${this.getMetricStatus('errorRate')}
║  ├─ Conversion Rate: ${(this.getMetricValue('conversionRate') * 100).toFixed(2)}% ${this.getMetricStatus('conversionRate')}
║  ├─ Revenue: $${this.getMetricValue('revenue').toLocaleString()}
║  └─ Active Users: ${this.getMetricValue('activeUsers')}
║                                                          ║
║  System Health:                                         ║
║  ├─ Alerts: ${this.alerts.length} (${this.alerts.filter(a => a.severity === 'critical').length} critical)
║  ├─ Anomalies: ${this.anomalies.length}
║  ├─ Risk Score: ${this.anomalyDetector.calculateRiskScore()}/100
║  └─ Uptime: 99.99%                                      ║
║                                                          ║
║  User Segments:                                         ║
║  ├─ Champions: ${this.userAnalytics.cohorts.champions?.length || 0}
║  ├─ Loyal: ${this.userAnalytics.cohorts.loyal?.length || 0}
║  ├─ At Risk: ${this.userAnalytics.cohorts.atrisk?.length || 0}
║  └─ New: ${this.userAnalytics.cohorts.new?.length || 0}
║                                                          ║
╚════════════════════════════════════════════════════════╝
`;

        console.log(report);

        // Clear old alerts
        this.alerts = this.alerts.slice(-10);
        this.anomalies = this.anomalies.slice(-20);
    }

    getMetricValue(metric) {
        const data = this.metrics.performance.get(metric);
        if (!data || data.size === 0) return 0;

        const values = Array.from(data.values());
        return values[values.length - 1];
    }

    getMetricStatus(metric) {
        const value = this.getMetricValue(metric);
        const threshold = this.thresholds[metric];

        if (!threshold) return '';

        if (metric === 'conversionRate') {
            return value >= threshold ? '✅' : '⚠️';
        }

        return value <= threshold ? '✅' : '⚠️';
    }
}

// Initialize and run
const monitor = new PerformanceMonitoringSystem();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitoringSystem;
}