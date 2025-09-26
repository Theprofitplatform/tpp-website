#!/usr/bin/env node

/**
 * Performance Optimization Validator
 * Validates current optimization implementations and identifies gaps
 * Part of the Hive Mind Collective Intelligence System
 */

const fs = require('fs').promises;
const path = require('path');

class PerformanceOptimizationValidator {
    constructor() {
        this.validationResults = {
            timestamp: new Date().toISOString(),
            overallScore: 0,
            optimizations: {},
            gaps: [],
            recommendations: []
        };

        this.optimizationChecks = [
            // CSS Optimizations
            {
                name: 'CSS Consolidation',
                check: this.checkCSSConsolidation.bind(this),
                weight: 15,
                category: 'resources'
            },
            {
                name: 'CSS Minification',
                check: this.checkCSSMinification.bind(this),
                weight: 10,
                category: 'resources'
            },
            {
                name: 'Critical CSS Inlining',
                check: this.checkCriticalCSS.bind(this),
                weight: 20,
                category: 'rendering'
            },

            // JavaScript Optimizations
            {
                name: 'JavaScript Bundling',
                check: this.checkJSBundling.bind(this),
                weight: 15,
                category: 'resources'
            },
            {
                name: 'JavaScript Minification',
                check: this.checkJSMinification.bind(this),
                weight: 10,
                category: 'resources'
            },
            {
                name: 'Async/Defer Loading',
                check: this.checkAsyncDefer.bind(this),
                weight: 10,
                category: 'loading'
            },

            // Image Optimizations
            {
                name: 'Image Optimization',
                check: this.checkImageOptimization.bind(this),
                weight: 15,
                category: 'resources'
            },
            {
                name: 'Lazy Loading',
                check: this.checkLazyLoading.bind(this),
                weight: 10,
                category: 'loading'
            },

            // Caching Optimizations
            {
                name: 'Service Worker',
                check: this.checkServiceWorker.bind(this),
                weight: 15,
                category: 'caching'
            },
            {
                name: 'Browser Caching Headers',
                check: this.checkCacheHeaders.bind(this),
                weight: 10,
                category: 'caching'
            },

            // Network Optimizations
            {
                name: 'Resource Hints',
                check: this.checkResourceHints.bind(this),
                weight: 10,
                category: 'network'
            },
            {
                name: 'Compression',
                check: this.checkCompression.bind(this),
                weight: 15,
                category: 'network'
            },

            // Performance Monitoring
            {
                name: 'Performance Monitoring',
                check: this.checkPerformanceMonitoring.bind(this),
                weight: 10,
                category: 'monitoring'
            }
        ];

        this.init();
    }

    async init() {
        console.log('🔍 Performance Optimization Validation Starting...\n');

        try {
            await this.runAllValidations();
            await this.generateReport();
            await this.storeResults();

            console.log('\n✅ Performance optimization validation completed');
            return this.validationResults;
        } catch (error) {
            console.error('❌ Validation failed:', error.message);
            throw error;
        }
    }

    async runAllValidations() {
        let totalScore = 0;
        let totalWeight = 0;

        console.log('Running optimization validations...\n');

        for (const check of this.optimizationChecks) {
            try {
                console.log(`  Checking ${check.name}...`);
                const result = await check.check();

                this.validationResults.optimizations[check.name] = {
                    ...result,
                    weight: check.weight,
                    category: check.category
                };

                const score = result.implemented ? check.weight : 0;
                totalScore += score;
                totalWeight += check.weight;

                const status = result.implemented ? '✅' : '❌';
                console.log(`    ${status} ${result.implemented ? 'Implemented' : 'Not Implemented'}`);

                if (!result.implemented) {
                    this.validationResults.gaps.push({
                        name: check.name,
                        category: check.category,
                        weight: check.weight,
                        recommendation: result.recommendation
                    });
                }

            } catch (error) {
                console.log(`    ⚠️  Error checking ${check.name}: ${error.message}`);
                this.validationResults.optimizations[check.name] = {
                    implemented: false,
                    error: error.message,
                    weight: check.weight,
                    category: check.category
                };
            }
        }

        this.validationResults.overallScore = Math.round((totalScore / totalWeight) * 100);
        console.log(`\n📊 Overall Optimization Score: ${this.validationResults.overallScore}/100`);
    }

    // Validation Methods
    async checkCSSConsolidation() {
        try {
            const files = await fs.readdir('css');
            const cssFiles = files.filter(f => f.endsWith('.css'));
            const consolidatedExists = cssFiles.some(f => f.includes('consolidated') || f.includes('combined'));

            return {
                implemented: consolidatedExists && cssFiles.length <= 3,
                details: `Found ${cssFiles.length} CSS files, consolidated: ${consolidatedExists}`,
                recommendation: 'Consolidate CSS files to reduce HTTP requests'
            };
        } catch (error) {
            return {
                implemented: false,
                details: 'CSS directory not found or inaccessible',
                recommendation: 'Ensure CSS files are properly organized and consolidated'
            };
        }
    }

    async checkCSSMinification() {
        try {
            const files = await fs.readdir('css');
            const minifiedFiles = files.filter(f => f.includes('.min.css'));

            return {
                implemented: minifiedFiles.length > 0,
                details: `Found ${minifiedFiles.length} minified CSS files`,
                recommendation: 'Minify CSS files to reduce file size'
            };
        } catch (error) {
            return {
                implemented: false,
                details: 'CSS directory not accessible',
                recommendation: 'Implement CSS minification in build process'
            };
        }
    }

    async checkCriticalCSS() {
        try {
            const files = await fs.readdir('css');
            const criticalExists = files.some(f => f.includes('critical'));

            return {
                implemented: criticalExists,
                details: `Critical CSS file exists: ${criticalExists}`,
                recommendation: 'Extract and inline critical CSS for faster rendering'
            };
        } catch (error) {
            return {
                implemented: false,
                details: 'Cannot verify critical CSS implementation',
                recommendation: 'Implement critical CSS extraction and inlining'
            };
        }
    }

    async checkJSBundling() {
        try {
            const files = await fs.readdir('js');
            const jsFiles = files.filter(f => f.endsWith('.js'));
            const bundledExists = jsFiles.some(f => f.includes('bundle') || f.includes('combined') || f.includes('consolidated'));

            return {
                implemented: bundledExists && jsFiles.length <= 5,
                details: `Found ${jsFiles.length} JS files, bundled: ${bundledExists}`,
                recommendation: 'Bundle JavaScript files to reduce HTTP requests'
            };
        } catch (error) {
            return {
                implemented: false,
                details: 'JS directory not found',
                recommendation: 'Implement JavaScript bundling'
            };
        }
    }

    async checkJSMinification() {
        try {
            const files = await fs.readdir('js');
            const minifiedFiles = files.filter(f => f.includes('.min.js'));

            return {
                implemented: minifiedFiles.length > 0,
                details: `Found ${minifiedFiles.length} minified JS files`,
                recommendation: 'Minify JavaScript files to reduce file size'
            };
        } catch (error) {
            return {
                implemented: false,
                details: 'JS directory not accessible',
                recommendation: 'Implement JavaScript minification'
            };
        }
    }

    async checkAsyncDefer() {
        try {
            const htmlFiles = ['index.html', 'about.html', 'contact.html'];
            let asyncDeferFound = false;

            for (const file of htmlFiles) {
                try {
                    const content = await fs.readFile(file, 'utf8');
                    if (content.includes('async') || content.includes('defer')) {
                        asyncDeferFound = true;
                        break;
                    }
                } catch (error) {
                    // File doesn't exist, continue
                }
            }

            return {
                implemented: asyncDeferFound,
                details: `Async/defer attributes found: ${asyncDeferFound}`,
                recommendation: 'Add async/defer attributes to non-critical scripts'
            };
        } catch (error) {
            return {
                implemented: false,
                details: 'Cannot check HTML files for async/defer',
                recommendation: 'Implement async/defer loading for non-critical JavaScript'
            };
        }
    }

    async checkImageOptimization() {
        try {
            const imagesDir = 'images';
            const files = await fs.readdir(imagesDir);
            const webpFiles = files.filter(f => f.endsWith('.webp'));
            const totalImages = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));

            return {
                implemented: webpFiles.length > 0,
                details: `Found ${webpFiles.length} WebP images out of ${totalImages.length} total`,
                recommendation: 'Convert images to WebP format for better compression'
            };
        } catch (error) {
            return {
                implemented: false,
                details: 'Images directory not accessible',
                recommendation: 'Implement image optimization with WebP format'
            };
        }
    }

    async checkLazyLoading() {
        try {
            const htmlFiles = ['index.html', 'about.html', 'contact.html'];
            let lazyLoadingFound = false;

            for (const file of htmlFiles) {
                try {
                    const content = await fs.readFile(file, 'utf8');
                    if (content.includes('loading="lazy"') || content.includes('data-lazy')) {
                        lazyLoadingFound = true;
                        break;
                    }
                } catch (error) {
                    // File doesn't exist, continue
                }
            }

            return {
                implemented: lazyLoadingFound,
                details: `Lazy loading attributes found: ${lazyLoadingFound}`,
                recommendation: 'Implement lazy loading for images and other resources'
            };
        } catch (error) {
            return {
                implemented: false,
                details: 'Cannot verify lazy loading implementation',
                recommendation: 'Add lazy loading attributes to below-fold images'
            };
        }
    }

    async checkServiceWorker() {
        try {
            const swFiles = ['sw.js', 'service-worker.js', 'sw-optimized.js'];
            let swExists = false;

            for (const file of swFiles) {
                try {
                    await fs.access(file);
                    swExists = true;
                    break;
                } catch (error) {
                    // File doesn't exist, continue
                }
            }

            return {
                implemented: swExists,
                details: `Service worker file exists: ${swExists}`,
                recommendation: 'Implement service worker for advanced caching'
            };
        } catch (error) {
            return {
                implemented: false,
                details: 'Cannot verify service worker implementation',
                recommendation: 'Create and register service worker for caching'
            };
        }
    }

    async checkCacheHeaders() {
        // This would require running a server check
        // For now, we'll check if cache configuration exists
        try {
            const configFiles = ['.htaccess', 'nginx.conf', 'web.config'];
            let cacheConfigFound = false;

            for (const file of configFiles) {
                try {
                    const content = await fs.readFile(file, 'utf8');
                    if (content.includes('Cache-Control') || content.includes('Expires') || content.includes('max-age')) {
                        cacheConfigFound = true;
                        break;
                    }
                } catch (error) {
                    // File doesn't exist, continue
                }
            }

            return {
                implemented: cacheConfigFound,
                details: `Cache headers configuration found: ${cacheConfigFound}`,
                recommendation: 'Configure proper cache headers for static resources'
            };
        } catch (error) {
            return {
                implemented: false,
                details: 'Cannot verify cache headers configuration',
                recommendation: 'Add cache headers configuration to server'
            };
        }
    }

    async checkResourceHints() {
        try {
            const htmlFiles = ['index.html', 'about.html', 'contact.html'];
            let hintsFound = false;

            for (const file of htmlFiles) {
                try {
                    const content = await fs.readFile(file, 'utf8');
                    if (content.includes('preload') || content.includes('prefetch') || content.includes('preconnect')) {
                        hintsFound = true;
                        break;
                    }
                } catch (error) {
                    // File doesn't exist, continue
                }
            }

            return {
                implemented: hintsFound,
                details: `Resource hints found: ${hintsFound}`,
                recommendation: 'Add resource hints (preload, prefetch, preconnect) for critical resources'
            };
        } catch (error) {
            return {
                implemented: false,
                details: 'Cannot verify resource hints implementation',
                recommendation: 'Implement resource hints for better loading performance'
            };
        }
    }

    async checkCompression() {
        // Check if compression configuration exists
        try {
            const configFiles = ['.htaccess', 'nginx.conf', 'web.config'];
            let compressionFound = false;

            for (const file of configFiles) {
                try {
                    const content = await fs.readFile(file, 'utf8');
                    if (content.includes('gzip') || content.includes('br') || content.includes('deflate')) {
                        compressionFound = true;
                        break;
                    }
                } catch (error) {
                    // File doesn't exist, continue
                }
            }

            return {
                implemented: compressionFound,
                details: `Compression configuration found: ${compressionFound}`,
                recommendation: 'Enable Gzip/Brotli compression on server'
            };
        } catch (error) {
            return {
                implemented: false,
                details: 'Cannot verify compression configuration',
                recommendation: 'Configure server-side compression (Gzip/Brotli)'
            };
        }
    }

    async checkPerformanceMonitoring() {
        try {
            const monitoringFiles = [
                'performance-monitor.js',
                'performance-optimizer.js',
                'performance-test-suite.js'
            ];

            let monitoringExists = false;
            for (const file of monitoringFiles) {
                try {
                    await fs.access(file);
                    monitoringExists = true;
                    break;
                } catch (error) {
                    // File doesn't exist, continue
                }
            }

            return {
                implemented: monitoringExists,
                details: `Performance monitoring implementation found: ${monitoringExists}`,
                recommendation: 'Implement comprehensive performance monitoring'
            };
        } catch (error) {
            return {
                implemented: false,
                details: 'Cannot verify performance monitoring implementation',
                recommendation: 'Add performance monitoring and analytics'
            };
        }
    }

    async generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 PERFORMANCE OPTIMIZATION VALIDATION REPORT');
        console.log('='.repeat(60));

        // Overall score and grade
        const grade = this.calculateGrade(this.validationResults.overallScore);
        console.log(`Overall Score: ${this.validationResults.overallScore}/100 (${grade})`);

        // Category breakdown
        const categories = this.groupByCategory();
        console.log('\nCategory Breakdown:');
        for (const [category, checks] of Object.entries(categories)) {
            const categoryScore = this.calculateCategoryScore(checks);
            console.log(`  ${category}: ${categoryScore}/100`);
        }

        // Implementation gaps
        if (this.validationResults.gaps.length > 0) {
            console.log('\n🔴 Missing Optimizations:');
            this.validationResults.gaps
                .sort((a, b) => b.weight - a.weight)
                .forEach(gap => {
                    console.log(`  • ${gap.name} (Impact: ${gap.weight})`);
                    console.log(`    ${gap.recommendation}`);
                });
        }

        // Generate prioritized recommendations
        this.generateRecommendations();

        if (this.validationResults.recommendations.length > 0) {
            console.log('\n💡 Priority Recommendations:');
            this.validationResults.recommendations.slice(0, 5).forEach((rec, index) => {
                console.log(`  ${index + 1}. ${rec.title}`);
                console.log(`     Impact: ${rec.impact} | Effort: ${rec.effort} | Timeline: ${rec.timeline}`);
            });
        }
    }

    calculateGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B+';
        if (score >= 60) return 'B';
        if (score >= 50) return 'C';
        return 'D';
    }

    groupByCategory() {
        const categories = {};

        for (const [name, check] of Object.entries(this.validationResults.optimizations)) {
            if (!categories[check.category]) {
                categories[check.category] = [];
            }
            categories[check.category].push({ name, ...check });
        }

        return categories;
    }

    calculateCategoryScore(checks) {
        const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
        const implementedWeight = checks
            .filter(check => check.implemented)
            .reduce((sum, check) => sum + check.weight, 0);

        return Math.round((implementedWeight / totalWeight) * 100);
    }

    generateRecommendations() {
        this.validationResults.recommendations = this.validationResults.gaps
            .map(gap => ({
                title: gap.name,
                category: gap.category,
                impact: this.getImpactLevel(gap.weight),
                effort: this.getEffortLevel(gap.name),
                timeline: this.getTimeline(gap.name),
                weight: gap.weight,
                recommendation: gap.recommendation
            }))
            .sort((a, b) => {
                // Sort by impact (weight) and effort
                const impactScore = b.weight - a.weight;
                const effortScore = this.getEffortScore(a.effort) - this.getEffortScore(b.effort);
                return impactScore * 2 + effortScore; // Weight impact more than effort
            });
    }

    getImpactLevel(weight) {
        if (weight >= 15) return 'High';
        if (weight >= 10) return 'Medium';
        return 'Low';
    }

    getEffortLevel(name) {
        const lowEffort = ['Async/Defer Loading', 'Resource Hints', 'Lazy Loading'];
        const highEffort = ['Service Worker', 'Critical CSS Inlining', 'Image Optimization'];

        if (lowEffort.includes(name)) return 'Low';
        if (highEffort.includes(name)) return 'High';
        return 'Medium';
    }

    getTimeline(name) {
        const quickWins = ['Async/Defer Loading', 'Resource Hints', 'Lazy Loading'];
        const mediumTasks = ['CSS Consolidation', 'JavaScript Bundling', 'Compression'];
        const longTasks = ['Service Worker', 'Critical CSS Inlining', 'Image Optimization'];

        if (quickWins.includes(name)) return '1-2 days';
        if (mediumTasks.includes(name)) return '3-5 days';
        if (longTasks.includes(name)) return '1-2 weeks';
        return '1 week';
    }

    getEffortScore(effort) {
        const scores = { 'Low': 3, 'Medium': 2, 'High': 1 };
        return scores[effort] || 2;
    }

    async storeResults() {
        try {
            // Save detailed results
            await fs.writeFile(
                'performance-optimization-validation.json',
                JSON.stringify(this.validationResults, null, 2)
            );

            // Store in collective memory
            await fs.mkdir('memory', { recursive: true });
            await fs.writeFile(
                'memory/performance-optimization-status.json',
                JSON.stringify({
                    type: 'performance_optimization_validation',
                    timestamp: Date.now(),
                    results: this.validationResults,
                    agent: 'performance_analyzer'
                }, null, 2)
            );

            console.log('\n📄 Results saved to performance-optimization-validation.json');
            console.log('📊 Status stored in collective memory');

        } catch (error) {
            console.error('Failed to save results:', error.message);
        }
    }
}

// Run validation if called directly
if (require.main === module) {
    new PerformanceOptimizationValidator();
}

module.exports = PerformanceOptimizationValidator;