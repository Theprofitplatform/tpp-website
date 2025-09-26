/**
 * The Profit Platform - CSS Optimizer
 * Advanced CSS consolidation, critical path optimization, and performance enhancements
 */

class CSSOptimizer {
    constructor(options = {}) {
        this.options = {
            criticalCSS: true,
            consolidation: true,
            minification: true,
            unusedCSSRemoval: true,
            inlineCritical: true,
            deferNonCritical: true,
            mediaQueryOptimization: true,
            ...options
        };

        this.stylesheets = new Map();
        this.criticalRules = new Set();
        this.nonCriticalRules = new Set();
        this.unusedSelectors = new Set();
        this.mediaQueries = new Map();
        this.optimizationStats = {
            originalSize: 0,
            optimizedSize: 0,
            criticalSize: 0,
            removedRules: 0,
            consolidatedFiles: 0
        };

        this.criticalViewport = {
            width: 1200,
            height: 768
        };

        this.init();
    }

    init() {
        this.detectStylesheets();
        if (this.options.criticalCSS) {
            this.extractCriticalCSS();
        }
        if (this.options.consolidation) {
            this.consolidateStylesheets();
        }
        if (this.options.unusedCSSRemoval) {
            this.removeUnusedCSS();
        }
        this.applyOptimizations();
    }

    // ================================
    // STYLESHEET DETECTION & ANALYSIS
    // ================================

    detectStylesheets() {
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"], style');

        stylesheets.forEach((element, index) => {
            const stylesheet = {
                element,
                type: element.tagName.toLowerCase() === 'style' ? 'inline' : 'external',
                href: element.href || `inline-${index}`,
                media: element.media || 'all',
                rules: [],
                size: 0,
                critical: element.hasAttribute('data-critical'),
                priority: this.calculateStylesheetPriority(element),
                loadTime: 0
            };

            this.stylesheets.set(stylesheet.href, stylesheet);
            this.analyzeStylesheet(stylesheet);
        });
    }

    calculateStylesheetPriority(element) {
        let priority = 0;

        // Critical stylesheets
        if (element.hasAttribute('data-critical') ||
            element.href?.includes('critical') ||
            element.href?.includes('above-fold')) {
            priority += 100;
        }

        // Navigation and layout styles
        if (element.href?.includes('navigation') ||
            element.href?.includes('layout') ||
            element.href?.includes('header')) {
            priority += 80;
        }

        // Component styles
        if (element.href?.includes('component') ||
            element.href?.includes('module')) {
            priority += 60;
        }

        // Theme and styling
        if (element.href?.includes('theme') ||
            element.href?.includes('style')) {
            priority += 40;
        }

        // Utility and helper styles
        if (element.href?.includes('utility') ||
            element.href?.includes('helper')) {
            priority += 20;
        }

        return priority;
    }

    async analyzeStylesheet(stylesheet) {
        try {
            let rules = [];

            if (stylesheet.type === 'inline') {
                rules = this.parseInlineCSS(stylesheet.element.textContent);
            } else {
                rules = await this.parseExternalCSS(stylesheet.href);
            }

            stylesheet.rules = rules;
            stylesheet.size = this.calculateStylesheetSize(rules);
            this.optimizationStats.originalSize += stylesheet.size;

        } catch (error) {
            console.warn(`Failed to analyze stylesheet: ${stylesheet.href}`, error);
        }
    }

    parseInlineCSS(cssText) {
        return this.parseCSSRules(cssText);
    }

    async parseExternalCSS(href) {
        try {
            const response = await fetch(href);
            const cssText = await response.text();
            return this.parseCSSRules(cssText);
        } catch (error) {
            console.warn(`Failed to fetch CSS from ${href}:`, error);
            return [];
        }
    }

    parseCSSRules(cssText) {
        const rules = [];
        const rulePattern = /([^{]+)\{([^}]+)\}/g;
        let match;

        while ((match = rulePattern.exec(cssText)) !== null) {
            const selector = match[1].trim();
            const declarations = match[2].trim();

            rules.push({
                selector,
                declarations,
                mediaQuery: this.extractMediaQuery(selector),
                specificity: this.calculateSpecificity(selector),
                isUsed: false,
                isCritical: false,
                size: match[0].length
            });
        }

        return rules;
    }

    extractMediaQuery(selector) {
        const mediaPattern = /@media\s*([^{]+)/i;
        const match = selector.match(mediaPattern);
        return match ? match[1].trim() : null;
    }

    calculateSpecificity(selector) {
        // Simple specificity calculation
        const idCount = (selector.match(/#/g) || []).length;
        const classCount = (selector.match(/\./g) || []).length;
        const elementCount = (selector.match(/[a-zA-Z]/g) || []).length - classCount;

        return idCount * 100 + classCount * 10 + elementCount;
    }

    calculateStylesheetSize(rules) {
        return rules.reduce((total, rule) => total + rule.size, 0);
    }

    // ================================
    // CRITICAL CSS EXTRACTION
    // ================================

    extractCriticalCSS() {
        this.identifyAboveFoldElements();
        this.markCriticalRules();
        this.generateCriticalCSS();
    }

    identifyAboveFoldElements() {
        const aboveFoldElements = [];

        // Find elements in the critical viewport
        document.querySelectorAll('*').forEach(element => {
            const rect = element.getBoundingClientRect();

            if (rect.top < this.criticalViewport.height &&
                rect.left < this.criticalViewport.width &&
                rect.bottom > 0 &&
                rect.right > 0) {

                aboveFoldElements.push({
                    element,
                    rect,
                    selectors: this.getElementSelectors(element)
                });
            }
        });

        this.aboveFoldElements = aboveFoldElements;
        return aboveFoldElements;
    }

    getElementSelectors(element) {
        const selectors = [];

        // Tag selector
        selectors.push(element.tagName.toLowerCase());

        // ID selector
        if (element.id) {
            selectors.push(`#${element.id}`);
        }

        // Class selectors
        if (element.className) {
            element.className.split(/\s+/).forEach(className => {
                if (className.trim()) {
                    selectors.push(`.${className.trim()}`);
                }
            });
        }

        // Attribute selectors
        Array.from(element.attributes).forEach(attr => {
            if (attr.name !== 'id' && attr.name !== 'class') {
                selectors.push(`[${attr.name}]`);
                if (attr.value) {
                    selectors.push(`[${attr.name}="${attr.value}"]`);
                }
            }
        });

        return selectors;
    }

    markCriticalRules() {
        this.stylesheets.forEach(stylesheet => {
            stylesheet.rules.forEach(rule => {
                if (this.isRuleCritical(rule)) {
                    rule.isCritical = true;
                    this.criticalRules.add(rule);
                } else {
                    this.nonCriticalRules.add(rule);
                }
            });
        });
    }

    isRuleCritical(rule) {
        // Always critical selectors
        const alwaysCritical = [
            'html', 'body', '*',
            'head', 'meta', 'title',
            '.critical', '[data-critical]'
        ];

        if (alwaysCritical.some(selector => rule.selector.includes(selector))) {
            return true;
        }

        // Check if rule applies to above-fold elements
        return this.aboveFoldElements.some(({ selectors }) => {
            return selectors.some(selector => {
                return rule.selector.includes(selector) ||
                       this.selectorMatches(rule.selector, selector);
            });
        });
    }

    selectorMatches(ruleSelector, elementSelector) {
        // Simple selector matching
        try {
            const elements = document.querySelectorAll(ruleSelector);
            return Array.from(elements).some(el => {
                return el.matches(elementSelector);
            });
        } catch (error) {
            return false;
        }
    }

    generateCriticalCSS() {
        const criticalCSS = Array.from(this.criticalRules)
            .sort((a, b) => b.specificity - a.specificity)
            .map(rule => `${rule.selector}{${rule.declarations}}`)
            .join('\n');

        this.criticalCSS = this.minifyCSS(criticalCSS);
        this.optimizationStats.criticalSize = this.criticalCSS.length;

        if (this.options.inlineCritical) {
            this.inlineCriticalCSS();
        }

        return this.criticalCSS;
    }

    inlineCriticalCSS() {
        // Remove existing critical CSS links
        document.querySelectorAll('link[rel="stylesheet"][data-critical]').forEach(link => {
            link.remove();
        });

        // Create inline critical CSS
        const style = document.createElement('style');
        style.textContent = this.criticalCSS;
        style.dataset.generated = 'critical-css';
        style.dataset.size = this.criticalCSS.length.toString();

        // Insert in head before other stylesheets
        const firstStylesheet = document.querySelector('link[rel="stylesheet"]');
        if (firstStylesheet) {
            firstStylesheet.parentNode.insertBefore(style, firstStylesheet);
        } else {
            document.head.appendChild(style);
        }
    }

    // ================================
    // STYLESHEET CONSOLIDATION
    // ================================

    consolidateStylesheets() {
        const consolidationGroups = this.groupStylesheetsForConsolidation();

        consolidationGroups.forEach((group, groupName) => {
            if (group.length > 1) {
                this.createConsolidatedStylesheet(groupName, group);
                this.optimizationStats.consolidatedFiles += group.length - 1;
            }
        });
    }

    groupStylesheetsForConsolidation() {
        const groups = new Map();

        this.stylesheets.forEach(stylesheet => {
            let groupName = 'main';

            if (stylesheet.critical) {
                groupName = 'critical';
            } else if (stylesheet.href.includes('theme')) {
                groupName = 'theme';
            } else if (stylesheet.href.includes('component')) {
                groupName = 'components';
            } else if (stylesheet.href.includes('layout')) {
                groupName = 'layout';
            }

            if (!groups.has(groupName)) {
                groups.set(groupName, []);
            }

            groups.get(groupName).push(stylesheet);
        });

        return groups;
    }

    createConsolidatedStylesheet(groupName, stylesheets) {
        const consolidatedRules = [];
        let totalSize = 0;

        // Combine rules from all stylesheets in the group
        stylesheets.forEach(stylesheet => {
            consolidatedRules.push(...stylesheet.rules);
            totalSize += stylesheet.size;
        });

        // Remove duplicates and optimize
        const optimizedRules = this.deduplicateRules(consolidatedRules);
        const consolidatedCSS = this.generateConsolidatedCSS(optimizedRules);
        const minifiedCSS = this.minifyCSS(consolidatedCSS);

        // Create new stylesheet element
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `data:text/css;base64,${btoa(minifiedCSS)}`;
        link.dataset.consolidated = groupName;
        link.dataset.originalCount = stylesheets.length.toString();
        link.dataset.originalSize = totalSize.toString();
        link.dataset.optimizedSize = minifiedCSS.length.toString();

        // Remove original stylesheets
        stylesheets.forEach(stylesheet => {
            if (stylesheet.element.parentNode) {
                stylesheet.element.remove();
            }
        });

        // Add consolidated stylesheet
        document.head.appendChild(link);

        console.log(`Consolidated ${stylesheets.length} stylesheets into ${groupName} group`, {
            originalSize: totalSize,
            optimizedSize: minifiedCSS.length,
            compression: ((totalSize - minifiedCSS.length) / totalSize * 100).toFixed(1) + '%'
        });
    }

    deduplicateRules(rules) {
        const uniqueRules = new Map();

        rules.forEach(rule => {
            const key = `${rule.selector}|${rule.declarations}`;

            if (!uniqueRules.has(key) ||
                uniqueRules.get(key).specificity < rule.specificity) {
                uniqueRules.set(key, rule);
            }
        });

        return Array.from(uniqueRules.values());
    }

    generateConsolidatedCSS(rules) {
        // Group rules by media query
        const mediaGroups = new Map();

        rules.forEach(rule => {
            const media = rule.mediaQuery || 'all';

            if (!mediaGroups.has(media)) {
                mediaGroups.set(media, []);
            }

            mediaGroups.get(media).push(rule);
        });

        // Generate CSS with proper media query organization
        let css = '';

        // Base styles first
        if (mediaGroups.has('all')) {
            css += mediaGroups.get('all')
                .map(rule => `${rule.selector}{${rule.declarations}}`)
                .join('\n');
            mediaGroups.delete('all');
        }

        // Media queries
        mediaGroups.forEach((rules, media) => {
            css += `\n@media ${media} {\n`;
            css += rules
                .map(rule => `  ${rule.selector}{${rule.declarations}}`)
                .join('\n');
            css += '\n}\n';
        });

        return css;
    }

    // ================================
    // UNUSED CSS REMOVAL
    // ================================

    removeUnusedCSS() {
        this.identifyUsedSelectors();
        this.markUnusedRules();
        this.removeUnusedRules();
    }

    identifyUsedSelectors() {
        const usedSelectors = new Set();

        // Check all stylesheets for used selectors
        this.stylesheets.forEach(stylesheet => {
            stylesheet.rules.forEach(rule => {
                if (this.isSelectorUsed(rule.selector)) {
                    rule.isUsed = true;
                    usedSelectors.add(rule.selector);
                }
            });
        });

        this.usedSelectors = usedSelectors;
    }

    isSelectorUsed(selector) {
        try {
            // Clean up selector for testing
            const cleanSelector = selector
                .replace(/@media[^{]+{/, '') // Remove media queries
                .replace(/::?[a-z-]+/g, '') // Remove pseudo-elements/classes
                .trim();

            if (!cleanSelector) return false;

            // Special selectors that should always be kept
            const alwaysKeep = [
                ':root', 'html', 'body', '*',
                ':hover', ':focus', ':active', ':visited',
                '.js', '.no-js'
            ];

            if (alwaysKeep.some(keep => selector.includes(keep))) {
                return true;
            }

            // Test if selector matches any elements
            return document.querySelectorAll(cleanSelector).length > 0;

        } catch (error) {
            // If selector is invalid, keep it to be safe
            return true;
        }
    }

    markUnusedRules() {
        this.stylesheets.forEach(stylesheet => {
            stylesheet.rules.forEach(rule => {
                if (!rule.isUsed && !rule.isCritical) {
                    this.unusedSelectors.add(rule.selector);
                }
            });
        });
    }

    removeUnusedRules() {
        let removedCount = 0;
        let removedSize = 0;

        this.stylesheets.forEach(stylesheet => {
            stylesheet.rules = stylesheet.rules.filter(rule => {
                if (!rule.isUsed && !rule.isCritical) {
                    removedCount++;
                    removedSize += rule.size;
                    return false;
                }
                return true;
            });
        });

        this.optimizationStats.removedRules = removedCount;
        console.log(`Removed ${removedCount} unused CSS rules (${removedSize} bytes)`);
    }

    // ================================
    // CSS OPTIMIZATION & MINIFICATION
    // ================================

    applyOptimizations() {
        this.stylesheets.forEach(stylesheet => {
            const originalCSS = this.generateStylesheetCSS(stylesheet);
            let optimizedCSS = originalCSS;

            if (this.options.mediaQueryOptimization) {
                optimizedCSS = this.optimizeMediaQueries(optimizedCSS);
            }

            if (this.options.minification) {
                optimizedCSS = this.minifyCSS(optimizedCSS);
            }

            this.updateStylesheet(stylesheet, optimizedCSS);

            this.optimizationStats.optimizedSize += optimizedCSS.length;
        });

        if (this.options.deferNonCritical) {
            this.deferNonCriticalCSS();
        }
    }

    generateStylesheetCSS(stylesheet) {
        return stylesheet.rules
            .map(rule => `${rule.selector}{${rule.declarations}}`)
            .join('\n');
    }

    optimizeMediaQueries(css) {
        // Combine duplicate media queries
        const mediaQueries = new Map();
        const mediaPattern = /@media\s*([^{]+)\s*\{([^}]+)\}/g;
        let match;

        while ((match = mediaPattern.exec(css)) !== null) {
            const query = match[1].trim();
            const rules = match[2].trim();

            if (!mediaQueries.has(query)) {
                mediaQueries.set(query, []);
            }

            mediaQueries.get(query).push(rules);
        }

        // Replace with combined media queries
        let optimizedCSS = css.replace(mediaPattern, '');

        mediaQueries.forEach((ruleGroups, query) => {
            const combinedRules = ruleGroups.join('\n');
            optimizedCSS += `\n@media ${query}{\n${combinedRules}\n}`;
        });

        return optimizedCSS;
    }

    minifyCSS(css) {
        return css
            // Remove comments
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            // Remove whitespace around punctuation
            .replace(/\s*([{}:;,>+~])\s*/g, '$1')
            // Remove trailing semicolons
            .replace(/;}/g, '}')
            // Remove empty rules
            .replace(/[^{}]+\{\}/g, '')
            .trim();
    }

    updateStylesheet(stylesheet, optimizedCSS) {
        if (stylesheet.type === 'inline') {
            stylesheet.element.textContent = optimizedCSS;
        } else {
            // Create new optimized stylesheet
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = `data:text/css;base64,${btoa(optimizedCSS)}`;
            newLink.dataset.optimized = 'true';
            newLink.dataset.originalSize = stylesheet.size.toString();
            newLink.dataset.optimizedSize = optimizedCSS.length.toString();

            // Replace original
            stylesheet.element.replaceWith(newLink);
            stylesheet.element = newLink;
        }
    }

    deferNonCriticalCSS() {
        document.querySelectorAll('link[rel="stylesheet"]:not([data-critical]):not([data-optimized])').forEach(link => {
            // Load non-critical CSS asynchronously
            link.media = 'print';
            link.onload = function() {
                this.media = 'all';
            };

            // Add noscript fallback
            const noscript = document.createElement('noscript');
            const fallbackLink = link.cloneNode();
            fallbackLink.media = 'all';
            noscript.appendChild(fallbackLink);
            link.parentNode.insertBefore(noscript, link.nextSibling);
        });
    }

    // ================================
    // PERFORMANCE MONITORING
    // ================================

    measureCSSPerformance() {
        const measurements = {
            stylesheetCount: this.stylesheets.size,
            totalSize: this.optimizationStats.originalSize,
            optimizedSize: this.optimizationStats.optimizedSize,
            compressionRatio: ((this.optimizationStats.originalSize - this.optimizationStats.optimizedSize) / this.optimizationStats.originalSize) * 100,
            criticalSize: this.optimizationStats.criticalSize,
            removedRules: this.optimizationStats.removedRules,
            consolidatedFiles: this.optimizationStats.consolidatedFiles,
            renderingTime: this.measureRenderingTime()
        };

        // Report to analytics
        if (typeof gtag === 'function') {
            gtag('event', 'css_optimization', {
                event_category: 'Performance',
                event_label: 'CSS_Optimized',
                value: Math.round(measurements.compressionRatio)
            });
        }

        return measurements;
    }

    measureRenderingTime() {
        if (performance.timing) {
            return performance.timing.domContentLoadedEventEnd - performance.timing.domLoading;
        }
        return null;
    }

    // ================================
    // PUBLIC API
    // ================================

    getCriticalCSS() {
        return this.criticalCSS;
    }

    getOptimizationStats() {
        return {
            ...this.optimizationStats,
            compressionRatio: ((this.optimizationStats.originalSize - this.optimizationStats.optimizedSize) / this.optimizationStats.originalSize) * 100
        };
    }

    getUnusedSelectors() {
        return Array.from(this.unusedSelectors);
    }

    generateReport() {
        return {
            performance: this.measureCSSPerformance(),
            stylesheets: Array.from(this.stylesheets.values()).map(s => ({
                href: s.href,
                size: s.size,
                rules: s.rules.length,
                critical: s.critical,
                priority: s.priority
            })),
            critical: {
                size: this.optimizationStats.criticalSize,
                rules: this.criticalRules.size
            },
            optimization: this.getOptimizationStats(),
            unused: this.getUnusedSelectors().length
        };
    }

    // ================================
    // CLEANUP
    // ================================

    destroy() {
        this.stylesheets.clear();
        this.criticalRules.clear();
        this.nonCriticalRules.clear();
        this.unusedSelectors.clear();
        this.mediaQueries.clear();
    }
}

// Initialize CSS optimizer
const cssOptimizer = new CSSOptimizer({
    criticalCSS: true,
    consolidation: true,
    minification: true,
    unusedCSSRemoval: true,
    inlineCritical: true,
    deferNonCritical: true
});

// Export for use
window.CSSOptimizer = CSSOptimizer;
window.cssOptimizer = cssOptimizer;