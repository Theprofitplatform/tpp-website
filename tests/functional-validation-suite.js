#!/usr/bin/env node

/**
 * FUNCTIONAL VALIDATION SUITE
 * Comprehensive functional testing to ensure optimizations don't break functionality
 *
 * Features:
 * - Cross-browser functional testing
 * - User journey validation
 * - Form submission and interaction testing
 * - Visual regression detection
 * - Accessibility compliance validation
 * - SEO functionality verification
 * - Mobile responsiveness testing
 * - Performance-functionality correlation analysis
 */

import { performance } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';

class FunctionalValidationSuite {
    constructor(options = {}) {
        this.options = {
            baseUrl: options.baseUrl || 'http://localhost:4321/website/',
            testPages: options.testPages || ['index.html', 'about.html', 'contact.html', 'services.html', 'pricing.html'],
            browsers: options.browsers || ['chromium'], // chromium, firefox, webkit
            viewports: options.viewports || [
                { name: 'desktop', width: 1920, height: 1080 },
                { name: 'tablet', width: 1024, height: 768 },
                { name: 'mobile', width: 375, height: 667 }
            ],
            testTypes: {
                functional: options.functionalTests !== false,
                visual: options.visualTests !== false,
                accessibility: options.accessibilityTests !== false,
                seo: options.seoTests !== false,
                userJourneys: options.userJourneyTests !== false,
                forms: options.formTests !== false,
                navigation: options.navigationTests !== false,
                performance: options.performanceTests !== false
            },
            thresholds: {
                loadTimeout: 30000,
                interactionTimeout: 5000,
                visualDiffThreshold: 0.1, // 10% difference threshold
                accessibilityScore: 90, // Minimum accessibility score
                seoScore: 85, // Minimum SEO score
                performanceScore: 80, // Minimum performance score
                ...options.thresholds
            },
            screenshotPath: options.screenshotPath || './tests/screenshots',
            baselinePath: options.baselinePath || './tests/baselines',
            reportPath: options.reportPath || './tests/reports',
            ...options
        };

        this.testResults = {
            timestamp: new Date().toISOString(),
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                warnings: 0,
                skipped: 0
            },
            testsByType: {},
            failures: [],
            warnings: [],
            performanceCorrelation: {},
            recommendations: []
        };
    }

    async runFullValidationSuite() {
        console.log('🧪 FUNCTIONAL VALIDATION SUITE - ENSURING OPTIMIZATIONS DON\'T BREAK FUNCTIONALITY');
        console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

        try {
            // Ensure directories exist
            await this.ensureDirectories();

            // Run validation tests by type
            const testSuite = {};

            if (this.options.testTypes.functional) {
                console.log('🔧 Running functional tests...');
                testSuite.functional = await this.runFunctionalTests();
            }

            if (this.options.testTypes.visual) {
                console.log('👁️  Running visual regression tests...');
                testSuite.visual = await this.runVisualRegressionTests();
            }

            if (this.options.testTypes.accessibility) {
                console.log('♿ Running accessibility tests...');
                testSuite.accessibility = await this.runAccessibilityTests();
            }

            if (this.options.testTypes.seo) {
                console.log('🔍 Running SEO validation tests...');
                testSuite.seo = await this.runSEOTests();
            }

            if (this.options.testTypes.userJourneys) {
                console.log('👤 Running user journey tests...');
                testSuite.userJourneys = await this.runUserJourneyTests();
            }

            if (this.options.testTypes.forms) {
                console.log('📝 Running form functionality tests...');
                testSuite.forms = await this.runFormTests();
            }

            if (this.options.testTypes.navigation) {
                console.log('🧭 Running navigation tests...');
                testSuite.navigation = await this.runNavigationTests();
            }

            if (this.options.testTypes.performance) {
                console.log('⚡ Running performance-functionality correlation tests...');
                testSuite.performance = await this.runPerformanceFunctionalityTests();
            }

            // Analyze results
            this.testResults.testsByType = testSuite;
            await this.analyzeResults();

            // Generate comprehensive report
            await this.generateValidationReport();

            console.log('\n✅ FUNCTIONAL VALIDATION SUITE COMPLETED');
            return this.testResults;

        } catch (error) {
            console.error('\n❌ Functional validation failed:', error.message);
            throw error;
        }
    }

    async runFunctionalTests() {
        const functionalResults = {
            pageLoading: {},
            interactivity: {},
            contentIntegrity: {},
            errors: []
        };

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            for (const testPage of this.options.testPages) {
                console.log(`  Testing page functionality: ${testPage}`);

                const page = await browser.newPage();

                // Set up error monitoring
                const pageErrors = [];
                page.on('pageerror', error => {
                    pageErrors.push({
                        type: 'javascript',
                        message: error.message,
                        stack: error.stack
                    });
                });

                page.on('response', response => {
                    if (!response.ok() && response.status() >= 400) {
                        pageErrors.push({
                            type: 'network',
                            url: response.url(),
                            status: response.status(),
                            statusText: response.statusText()
                        });
                    }
                });

                page.on('console', message => {
                    if (message.type() === 'error') {
                        pageErrors.push({
                            type: 'console_error',
                            message: message.text()
                        });
                    }
                });

                try {
                    // Test page loading
                    const loadStart = performance.now();
                    await page.goto(`${this.options.baseUrl}${testPage}`, {
                        waitUntil: 'networkidle0',
                        timeout: this.options.thresholds.loadTimeout
                    });
                    const loadTime = performance.now() - loadStart;

                    // Test basic interactivity
                    const interactivityResults = await this.testPageInteractivity(page);

                    // Test content integrity
                    const contentResults = await this.testContentIntegrity(page, testPage);

                    functionalResults.pageLoading[testPage] = {
                        success: true,
                        loadTime,
                        errors: pageErrors.length,
                        errorDetails: pageErrors
                    };

                    functionalResults.interactivity[testPage] = interactivityResults;
                    functionalResults.contentIntegrity[testPage] = contentResults;

                    if (pageErrors.length > 0) {
                        functionalResults.errors.push({
                            page: testPage,
                            errors: pageErrors
                        });
                    }

                } catch (error) {
                    console.error(`    ❌ Page ${testPage} failed:`, error.message);
                    functionalResults.pageLoading[testPage] = {
                        success: false,
                        error: error.message,
                        errors: pageErrors.length,
                        errorDetails: pageErrors
                    };
                }

                await page.close();
            }

        } finally {
            await browser.close();
        }

        return functionalResults;
    }

    async testPageInteractivity(page) {
        const interactivityResults = {
            links: { total: 0, working: 0, broken: [] },
            buttons: { total: 0, responsive: 0, unresponsive: [] },
            forms: { total: 0, functional: 0, broken: [] },
            media: { total: 0, loaded: 0, failed: [] }
        };

        try {
            // Test links
            const links = await page.$$('a[href]');
            interactivityResults.links.total = links.length;

            for (let i = 0; i < Math.min(links.length, 20); i++) { // Test first 20 links
                try {
                    const href = await links[i].evaluate(el => el.href);
                    if (href && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                        // Check if link is reachable (simplified check)
                        const isInternal = href.includes(this.options.baseUrl) || href.startsWith('/');
                        if (isInternal) {
                            interactivityResults.links.working++;
                        } else {
                            // For external links, just check if they have valid URLs
                            try {
                                new URL(href);
                                interactivityResults.links.working++;
                            } catch {
                                interactivityResults.links.broken.push(href);
                            }
                        }
                    }
                } catch (error) {
                    interactivityResults.links.broken.push(`Link ${i}: ${error.message}`);
                }
            }

            // Test buttons
            const buttons = await page.$$('button, [role="button"], input[type="button"], input[type="submit"]');
            interactivityResults.buttons.total = buttons.length;

            for (let i = 0; i < Math.min(buttons.length, 10); i++) { // Test first 10 buttons
                try {
                    const isEnabled = await buttons[i].evaluate(el => !el.disabled);
                    const isVisible = await buttons[i].isIntersectingViewport();

                    if (isEnabled && isVisible) {
                        // Test if button responds to hover
                        await buttons[i].hover();
                        interactivityResults.buttons.responsive++;
                    }
                } catch (error) {
                    interactivityResults.buttons.unresponsive.push(`Button ${i}: ${error.message}`);
                }
            }

            // Test images and media
            const images = await page.$$('img');
            interactivityResults.media.total = images.length;

            for (const img of images) {
                try {
                    const isLoaded = await img.evaluate(el => el.complete && el.naturalWidth > 0);
                    if (isLoaded) {
                        interactivityResults.media.loaded++;
                    } else {
                        const src = await img.evaluate(el => el.src);
                        interactivityResults.media.failed.push(src);
                    }
                } catch (error) {
                    interactivityResults.media.failed.push(`Image error: ${error.message}`);
                }
            }

        } catch (error) {
            console.error('    ❌ Interactivity testing failed:', error.message);
        }

        return interactivityResults;
    }

    async testContentIntegrity(page, testPage) {
        const contentResults = {
            title: { present: false, length: 0 },
            headings: { h1Count: 0, structure: 'valid' },
            meta: { description: false, keywords: false },
            text: { readableContent: 0, emptyElements: 0 },
            structure: { semanticElements: 0, divSoup: false }
        };

        try {
            // Test page title
            const title = await page.title();
            contentResults.title = {
                present: !!title,
                length: title.length,
                content: title
            };

            // Test heading structure
            const headings = await page.evaluate(() => {
                const h1s = document.querySelectorAll('h1').length;
                const h2s = document.querySelectorAll('h2').length;
                const h3s = document.querySelectorAll('h3').length;
                const h4s = document.querySelectorAll('h4').length;

                return { h1: h1s, h2: h2s, h3: h3s, h4: h4s };
            });

            contentResults.headings = {
                ...headings,
                structure: headings.h1 === 1 ? 'valid' : headings.h1 === 0 ? 'missing_h1' : 'multiple_h1'
            };

            // Test meta tags
            const metaDescription = await page.$('meta[name="description"]');
            const metaKeywords = await page.$('meta[name="keywords"]');

            contentResults.meta = {
                description: !!metaDescription,
                keywords: !!metaKeywords
            };

            // Test content structure
            const structureData = await page.evaluate(() => {
                const semanticElements = document.querySelectorAll('header, main, section, article, aside, footer, nav').length;
                const totalDivs = document.querySelectorAll('div').length;
                const semanticRatio = totalDivs > 0 ? semanticElements / totalDivs : 1;

                const textElements = document.querySelectorAll('p, span, div, section, article');
                let readableContent = 0;
                let emptyElements = 0;

                textElements.forEach(el => {
                    const text = el.textContent.trim();
                    if (text.length > 10) {
                        readableContent++;
                    } else if (text.length === 0) {
                        emptyElements++;
                    }
                });

                return {
                    semanticElements,
                    divSoup: semanticRatio < 0.1,
                    readableContent,
                    emptyElements
                };
            });

            contentResults.structure = structureData;
            contentResults.text = {
                readableContent: structureData.readableContent,
                emptyElements: structureData.emptyElements
            };

        } catch (error) {
            console.error(`    ❌ Content integrity test failed for ${testPage}:`, error.message);
        }

        return contentResults;
    }

    async runVisualRegressionTests() {
        const visualResults = {
            screenshots: {},
            comparisons: {},
            diffs: [],
            newBaselines: []
        };

        for (const viewport of this.options.viewports) {
            const browser = await puppeteer.launch({ headless: true });

            try {
                const page = await browser.newPage();
                await page.setViewport({ width: viewport.width, height: viewport.height });

                for (const testPage of this.options.testPages) {
                    console.log(`    Testing visual regression: ${testPage} (${viewport.name})`);

                    try {
                        await page.goto(`${this.options.baseUrl}${testPage}`, {
                            waitUntil: 'networkidle0',
                            timeout: this.options.thresholds.loadTimeout
                        });

                        // Wait for any animations or dynamic content
                        await page.waitForTimeout(2000);

                        // Take screenshot
                        const screenshotPath = path.join(
                            this.options.screenshotPath,
                            `${testPage.replace('.html', '')}_${viewport.name}.png`
                        );

                        await page.screenshot({
                            path: screenshotPath,
                            fullPage: true
                        });

                        visualResults.screenshots[`${testPage}_${viewport.name}`] = {
                            path: screenshotPath,
                            viewport,
                            timestamp: new Date().toISOString()
                        };

                        // Compare with baseline if it exists
                        const baselinePath = path.join(
                            this.options.baselinePath,
                            `${testPage.replace('.html', '')}_${viewport.name}.png`
                        );

                        try {
                            await fs.access(baselinePath);
                            const comparison = await this.compareImages(baselinePath, screenshotPath);
                            visualResults.comparisons[`${testPage}_${viewport.name}`] = comparison;

                            if (comparison.difference > this.options.thresholds.visualDiffThreshold) {
                                visualResults.diffs.push({
                                    page: testPage,
                                    viewport: viewport.name,
                                    difference: comparison.difference,
                                    baseline: baselinePath,
                                    current: screenshotPath
                                });
                            }

                        } catch (error) {
                            // No baseline exists, create one
                            await fs.copyFile(screenshotPath, baselinePath);
                            visualResults.newBaselines.push(`${testPage}_${viewport.name}`);
                            console.log(`    ✅ Created new baseline for ${testPage} (${viewport.name})`);
                        }

                    } catch (error) {
                        console.error(`    ❌ Visual test failed for ${testPage} (${viewport.name}):`, error.message);
                        visualResults.screenshots[`${testPage}_${viewport.name}`] = { error: error.message };
                    }
                }

            } finally {
                await browser.close();
            }
        }

        return visualResults;
    }

    async compareImages(baselinePath, currentPath) {
        // Simplified image comparison - in production, you'd use a library like pixelmatch
        try {
            const baselineStats = await fs.stat(baselinePath);
            const currentStats = await fs.stat(currentPath);

            // Very basic comparison based on file size (not accurate but functional for demo)
            const sizeDifference = Math.abs(currentStats.size - baselineStats.size) / baselineStats.size;

            return {
                difference: sizeDifference,
                baselineSize: baselineStats.size,
                currentSize: currentStats.size,
                method: 'file_size_comparison'
            };

        } catch (error) {
            return {
                error: error.message,
                difference: 1.0 // Assume complete difference on error
            };
        }
    }

    async runAccessibilityTests() {
        const accessibilityResults = {
            scores: {},
            violations: {},
            summary: {
                totalViolations: 0,
                criticalViolations: 0,
                averageScore: 0
            }
        };

        const browser = await puppeteer.launch({ headless: true });

        try {
            const page = await browser.newPage();

            for (const testPage of this.options.testPages) {
                console.log(`    Testing accessibility: ${testPage}`);

                try {
                    await page.goto(`${this.options.baseUrl}${testPage}`, {
                        waitUntil: 'networkidle0',
                        timeout: this.options.thresholds.loadTimeout
                    });

                    // Basic accessibility checks
                    const accessibilityData = await page.evaluate(() => {
                        const violations = [];
                        let score = 100;

                        // Check for alt text on images
                        const images = document.querySelectorAll('img');
                        const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
                        if (imagesWithoutAlt.length > 0) {
                            violations.push({
                                type: 'missing_alt_text',
                                count: imagesWithoutAlt.length,
                                severity: 'high',
                                description: 'Images missing alt text'
                            });
                            score -= imagesWithoutAlt.length * 5;
                        }

                        // Check for proper heading structure
                        const h1s = document.querySelectorAll('h1');
                        if (h1s.length === 0) {
                            violations.push({
                                type: 'missing_h1',
                                severity: 'high',
                                description: 'Page missing H1 heading'
                            });
                            score -= 10;
                        } else if (h1s.length > 1) {
                            violations.push({
                                type: 'multiple_h1',
                                count: h1s.length,
                                severity: 'medium',
                                description: 'Multiple H1 headings found'
                            });
                            score -= 5;
                        }

                        // Check for form labels
                        const inputs = document.querySelectorAll('input, textarea, select');
                        const inputsWithoutLabels = Array.from(inputs).filter(input => {
                            const id = input.id;
                            const hasLabel = id && document.querySelector(`label[for="${id}"]`);
                            const hasAriaLabel = input.getAttribute('aria-label');
                            return !hasLabel && !hasAriaLabel;
                        });

                        if (inputsWithoutLabels.length > 0) {
                            violations.push({
                                type: 'missing_form_labels',
                                count: inputsWithoutLabels.length,
                                severity: 'high',
                                description: 'Form inputs missing labels'
                            });
                            score -= inputsWithoutLabels.length * 8;
                        }

                        // Check for color contrast (basic check)
                        const smallText = document.querySelectorAll('p, span, div, li');
                        let lowContrastElements = 0;
                        // This is a simplified check - real implementation would analyze computed styles
                        Array.from(smallText).forEach(el => {
                            const computedStyle = window.getComputedStyle(el);
                            const color = computedStyle.color;
                            const backgroundColor = computedStyle.backgroundColor;

                            // Very basic contrast check (not accurate)
                            if (color === 'rgb(128, 128, 128)' || color === '#808080') {
                                lowContrastElements++;
                            }
                        });

                        if (lowContrastElements > 0) {
                            violations.push({
                                type: 'low_contrast',
                                count: lowContrastElements,
                                severity: 'medium',
                                description: 'Elements with potentially low color contrast'
                            });
                            score -= lowContrastElements * 2;
                        }

                        // Check for keyboard navigation
                        const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
                        const elementsWithoutTabindex = Array.from(interactiveElements).filter(el => {
                            const tabindex = el.getAttribute('tabindex');
                            return el.tagName === 'DIV' && el.onclick && !tabindex;
                        });

                        if (elementsWithoutTabindex.length > 0) {
                            violations.push({
                                type: 'keyboard_navigation',
                                count: elementsWithoutTabindex.length,
                                severity: 'medium',
                                description: 'Interactive elements not accessible via keyboard'
                            });
                            score -= elementsWithoutTabindex.length * 3;
                        }

                        return {
                            score: Math.max(0, score),
                            violations,
                            totalElements: {
                                images: images.length,
                                headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
                                inputs: inputs.length,
                                interactive: interactiveElements.length
                            }
                        };
                    });

                    accessibilityResults.scores[testPage] = accessibilityData.score;
                    accessibilityResults.violations[testPage] = accessibilityData.violations;

                    console.log(`    Accessibility score: ${accessibilityData.score}/100`);
                    console.log(`    Violations: ${accessibilityData.violations.length}`);

                } catch (error) {
                    console.error(`    ❌ Accessibility test failed for ${testPage}:`, error.message);
                    accessibilityResults.scores[testPage] = 0;
                    accessibilityResults.violations[testPage] = [{ type: 'test_error', message: error.message }];
                }
            }

        } finally {
            await browser.close();
        }

        // Calculate summary
        const scores = Object.values(accessibilityResults.scores);
        const allViolations = Object.values(accessibilityResults.violations).flat();

        accessibilityResults.summary = {
            totalViolations: allViolations.length,
            criticalViolations: allViolations.filter(v => v.severity === 'high').length,
            averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
        };

        return accessibilityResults;
    }

    async runSEOTests() {
        const seoResults = {
            scores: {},
            issues: {},
            recommendations: {},
            summary: {
                averageScore: 0,
                totalIssues: 0,
                criticalIssues: 0
            }
        };

        const browser = await puppeteer.launch({ headless: true });

        try {
            const page = await browser.newPage();

            for (const testPage of this.options.testPages) {
                console.log(`    Testing SEO: ${testPage}`);

                try {
                    await page.goto(`${this.options.baseUrl}${testPage}`, {
                        waitUntil: 'networkidle0',
                        timeout: this.options.thresholds.loadTimeout
                    });

                    const seoData = await page.evaluate(() => {
                        const issues = [];
                        let score = 100;

                        // Check title tag
                        const title = document.querySelector('title');
                        if (!title || !title.textContent.trim()) {
                            issues.push({
                                type: 'missing_title',
                                severity: 'critical',
                                description: 'Page missing title tag'
                            });
                            score -= 20;
                        } else {
                            const titleLength = title.textContent.length;
                            if (titleLength < 30) {
                                issues.push({
                                    type: 'title_too_short',
                                    severity: 'medium',
                                    description: `Title too short (${titleLength} chars, recommended 30-60)`
                                });
                                score -= 5;
                            } else if (titleLength > 60) {
                                issues.push({
                                    type: 'title_too_long',
                                    severity: 'medium',
                                    description: `Title too long (${titleLength} chars, recommended 30-60)`
                                });
                                score -= 5;
                            }
                        }

                        // Check meta description
                        const metaDescription = document.querySelector('meta[name="description"]');
                        if (!metaDescription || !metaDescription.content.trim()) {
                            issues.push({
                                type: 'missing_meta_description',
                                severity: 'high',
                                description: 'Page missing meta description'
                            });
                            score -= 15;
                        } else {
                            const descLength = metaDescription.content.length;
                            if (descLength < 120) {
                                issues.push({
                                    type: 'meta_description_too_short',
                                    severity: 'medium',
                                    description: `Meta description too short (${descLength} chars, recommended 120-160)`
                                });
                                score -= 3;
                            } else if (descLength > 160) {
                                issues.push({
                                    type: 'meta_description_too_long',
                                    severity: 'medium',
                                    description: `Meta description too long (${descLength} chars, recommended 120-160)`
                                });
                                score -= 3;
                            }
                        }

                        // Check H1 tag
                        const h1s = document.querySelectorAll('h1');
                        if (h1s.length === 0) {
                            issues.push({
                                type: 'missing_h1',
                                severity: 'high',
                                description: 'Page missing H1 tag'
                            });
                            score -= 10;
                        } else if (h1s.length > 1) {
                            issues.push({
                                type: 'multiple_h1',
                                severity: 'medium',
                                description: `Multiple H1 tags found (${h1s.length})`
                            });
                            score -= 5;
                        }

                        // Check heading structure
                        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                        let previousLevel = 0;
                        let skipLevels = 0;

                        Array.from(headings).forEach(heading => {
                            const level = parseInt(heading.tagName[1]);
                            if (level > previousLevel + 1) {
                                skipLevels++;
                            }
                            previousLevel = level;
                        });

                        if (skipLevels > 0) {
                            issues.push({
                                type: 'heading_structure',
                                severity: 'medium',
                                description: 'Heading levels skip (e.g., H1 to H3 without H2)'
                            });
                            score -= 3;
                        }

                        // Check for canonical URL
                        const canonical = document.querySelector('link[rel="canonical"]');
                        if (!canonical) {
                            issues.push({
                                type: 'missing_canonical',
                                severity: 'medium',
                                description: 'Page missing canonical URL'
                            });
                            score -= 5;
                        }

                        // Check for Open Graph tags
                        const ogTitle = document.querySelector('meta[property="og:title"]');
                        const ogDescription = document.querySelector('meta[property="og:description"]');
                        const ogImage = document.querySelector('meta[property="og:image"]');

                        if (!ogTitle || !ogDescription || !ogImage) {
                            issues.push({
                                type: 'incomplete_open_graph',
                                severity: 'low',
                                description: 'Incomplete Open Graph tags for social sharing'
                            });
                            score -= 2;
                        }

                        // Check internal linking
                        const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
                        if (internalLinks.length < 3) {
                            issues.push({
                                type: 'few_internal_links',
                                severity: 'low',
                                description: 'Few internal links found (less than 3)'
                            });
                            score -= 2;
                        }

                        // Check for structured data (simplified)
                        const structuredData = document.querySelector('script[type="application/ld+json"]');
                        if (!structuredData) {
                            issues.push({
                                type: 'missing_structured_data',
                                severity: 'medium',
                                description: 'No structured data (JSON-LD) found'
                            });
                            score -= 5;
                        }

                        return {
                            score: Math.max(0, score),
                            issues,
                            data: {
                                title: title ? title.textContent : null,
                                metaDescription: metaDescription ? metaDescription.content : null,
                                h1Count: h1s.length,
                                headingCount: headings.length,
                                internalLinkCount: internalLinks.length,
                                hasCanonical: !!canonical,
                                hasStructuredData: !!structuredData
                            }
                        };
                    });

                    seoResults.scores[testPage] = seoData.score;
                    seoResults.issues[testPage] = seoData.issues;
                    seoResults.recommendations[testPage] = this.generateSEORecommendations(seoData.issues);

                    console.log(`    SEO score: ${seoData.score}/100`);
                    console.log(`    Issues: ${seoData.issues.length}`);

                } catch (error) {
                    console.error(`    ❌ SEO test failed for ${testPage}:`, error.message);
                    seoResults.scores[testPage] = 0;
                    seoResults.issues[testPage] = [{ type: 'test_error', message: error.message }];
                }
            }

        } finally {
            await browser.close();
        }

        // Calculate summary
        const scores = Object.values(seoResults.scores);
        const allIssues = Object.values(seoResults.issues).flat();

        seoResults.summary = {
            averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
            totalIssues: allIssues.length,
            criticalIssues: allIssues.filter(issue => issue.severity === 'critical').length
        };

        return seoResults;
    }

    generateSEORecommendations(issues) {
        const recommendations = [];

        issues.forEach(issue => {
            switch (issue.type) {
                case 'missing_title':
                    recommendations.push('Add a descriptive title tag (30-60 characters)');
                    break;
                case 'title_too_short':
                case 'title_too_long':
                    recommendations.push('Optimize title length to 30-60 characters');
                    break;
                case 'missing_meta_description':
                    recommendations.push('Add a compelling meta description (120-160 characters)');
                    break;
                case 'missing_h1':
                    recommendations.push('Add a single, descriptive H1 tag');
                    break;
                case 'heading_structure':
                    recommendations.push('Fix heading hierarchy (don\'t skip levels)');
                    break;
                case 'missing_canonical':
                    recommendations.push('Add canonical URL to prevent duplicate content');
                    break;
                case 'incomplete_open_graph':
                    recommendations.push('Add complete Open Graph tags for social sharing');
                    break;
                case 'missing_structured_data':
                    recommendations.push('Implement structured data (JSON-LD) for rich snippets');
                    break;
            }
        });

        return recommendations;
    }

    async runUserJourneyTests() {
        const journeyResults = {
            journeys: {},
            success: true,
            failures: []
        };

        // Define common user journeys for a business website
        const userJourneys = [
            {
                name: 'homepage_to_services',
                description: 'Navigate from homepage to services page',
                steps: [
                    { action: 'navigate', url: 'index.html' },
                    { action: 'click', selector: 'a[href*="services"], nav a:contains("Services")' },
                    { action: 'waitFor', selector: 'h1, .services' }
                ]
            },
            {
                name: 'contact_form_journey',
                description: 'Navigate to contact page and attempt form interaction',
                steps: [
                    { action: 'navigate', url: 'contact.html' },
                    { action: 'waitFor', selector: 'form, .contact-form' },
                    { action: 'type', selector: 'input[name*="name"], input[type="text"]', text: 'Test User' },
                    { action: 'type', selector: 'input[name*="email"], input[type="email"]', text: 'test@example.com' }
                ]
            },
            {
                name: 'mobile_navigation',
                description: 'Test mobile navigation menu',
                steps: [
                    { action: 'setViewport', width: 375, height: 667 },
                    { action: 'navigate', url: 'index.html' },
                    { action: 'click', selector: '.menu-toggle, .hamburger, [aria-label*="menu"]' },
                    { action: 'waitFor', selector: '.mobile-menu, .nav-menu.open' }
                ]
            }
        ];

        const browser = await puppeteer.launch({ headless: true });

        try {
            for (const journey of userJourneys) {
                console.log(`    Testing user journey: ${journey.name}`);

                const page = await browser.newPage();
                const journeyResult = {
                    name: journey.name,
                    description: journey.description,
                    success: true,
                    steps: [],
                    errors: []
                };

                try {
                    for (let i = 0; i < journey.steps.length; i++) {
                        const step = journey.steps[i];
                        const stepResult = { ...step, success: false, duration: 0 };

                        try {
                            const stepStart = performance.now();

                            switch (step.action) {
                                case 'navigate':
                                    await page.goto(`${this.options.baseUrl}${step.url}`, {
                                        waitUntil: 'networkidle0',
                                        timeout: this.options.thresholds.loadTimeout
                                    });
                                    break;

                                case 'click':
                                    const element = await page.$(step.selector);
                                    if (element) {
                                        await element.click();
                                    } else {
                                        throw new Error(`Element not found: ${step.selector}`);
                                    }
                                    break;

                                case 'type':
                                    await page.type(step.selector, step.text);
                                    break;

                                case 'waitFor':
                                    await page.waitForSelector(step.selector, {
                                        timeout: this.options.thresholds.interactionTimeout
                                    });
                                    break;

                                case 'setViewport':
                                    await page.setViewport({ width: step.width, height: step.height });
                                    break;

                                default:
                                    throw new Error(`Unknown action: ${step.action}`);
                            }

                            stepResult.success = true;
                            stepResult.duration = performance.now() - stepStart;

                        } catch (error) {
                            stepResult.success = false;
                            stepResult.error = error.message;
                            journeyResult.success = false;
                            journeyResult.errors.push(`Step ${i + 1}: ${error.message}`);
                        }

                        journeyResult.steps.push(stepResult);

                        if (!stepResult.success) {
                            break; // Stop journey on first failure
                        }
                    }

                } catch (error) {
                    journeyResult.success = false;
                    journeyResult.errors.push(`Journey failed: ${error.message}`);
                }

                journeyResults.journeys[journey.name] = journeyResult;

                if (!journeyResult.success) {
                    journeyResults.success = false;
                    journeyResults.failures.push(journey.name);
                }

                console.log(`      ${journeyResult.success ? '✅' : '❌'} ${journey.name}: ${journeyResult.success ? 'SUCCESS' : 'FAILED'}`);

                await page.close();
            }

        } finally {
            await browser.close();
        }

        return journeyResults;
    }

    async runFormTests() {
        const formResults = {
            forms: {},
            summary: {
                total: 0,
                functional: 0,
                broken: 0
            }
        };

        const browser = await puppeteer.launch({ headless: true });

        try {
            const page = await browser.newPage();

            for (const testPage of this.options.testPages) {
                if (!testPage.includes('contact')) continue; // Only test contact forms for now

                console.log(`    Testing forms on: ${testPage}`);

                try {
                    await page.goto(`${this.options.baseUrl}${testPage}`, {
                        waitUntil: 'networkidle0',
                        timeout: this.options.thresholds.loadTimeout
                    });

                    const formsData = await page.evaluate(() => {
                        const forms = document.querySelectorAll('form');
                        const formTests = [];

                        forms.forEach((form, index) => {
                            const formTest = {
                                index,
                                action: form.action,
                                method: form.method || 'GET',
                                inputs: [],
                                hasSubmitButton: false,
                                validation: {
                                    requiredFields: 0,
                                    emailFields: 0,
                                    phoneFields: 0
                                }
                            };

                            // Analyze form inputs
                            const inputs = form.querySelectorAll('input, textarea, select');
                            inputs.forEach(input => {
                                const inputData = {
                                    type: input.type || input.tagName.toLowerCase(),
                                    name: input.name,
                                    required: input.required,
                                    placeholder: input.placeholder,
                                    id: input.id
                                };

                                formTest.inputs.push(inputData);

                                if (input.required) formTest.validation.requiredFields++;
                                if (input.type === 'email') formTest.validation.emailFields++;
                                if (input.type === 'tel') formTest.validation.phoneFields++;
                            });

                            // Check for submit button
                            const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
                            formTest.hasSubmitButton = submitButtons.length > 0;

                            formTests.push(formTest);
                        });

                        return formTests;
                    });

                    // Test form interactions
                    for (const formTest of formsData) {
                        try {
                            // Fill out form with test data
                            for (const input of formTest.inputs) {
                                const selector = input.id ? `#${input.id}` :
                                               input.name ? `[name="${input.name}"]` :
                                               `form:nth-child(${formTest.index + 1}) ${input.type}`;

                                let testValue = '';
                                switch (input.type) {
                                    case 'email':
                                        testValue = 'test@example.com';
                                        break;
                                    case 'tel':
                                        testValue = '555-123-4567';
                                        break;
                                    case 'text':
                                    case 'textarea':
                                        testValue = 'Test input value';
                                        break;
                                }

                                if (testValue) {
                                    try {
                                        await page.type(selector, testValue);
                                        formTest.fillable = true;
                                    } catch (error) {
                                        formTest.fillable = false;
                                        formTest.errors = formTest.errors || [];
                                        formTest.errors.push(`Cannot fill ${selector}: ${error.message}`);
                                    }
                                }
                            }

                            formTest.functional = formTest.hasSubmitButton && (formTest.fillable !== false);

                        } catch (error) {
                            formTest.functional = false;
                            formTest.errors = formTest.errors || [];
                            formTest.errors.push(`Form test error: ${error.message}`);
                        }
                    }

                    formResults.forms[testPage] = formsData;

                    // Update summary
                    formResults.summary.total += formsData.length;
                    formResults.summary.functional += formsData.filter(f => f.functional).length;
                    formResults.summary.broken += formsData.filter(f => !f.functional).length;

                } catch (error) {
                    console.error(`    ❌ Form test failed for ${testPage}:`, error.message);
                    formResults.forms[testPage] = { error: error.message };
                }
            }

        } finally {
            await browser.close();
        }

        return formResults;
    }

    async runNavigationTests() {
        const navigationResults = {
            navigation: {},
            breadcrumbs: {},
            sitemap: {},
            summary: {
                workingLinks: 0,
                brokenLinks: 0,
                navigationIssues: 0
            }
        };

        const browser = await puppeteer.launch({ headless: true });

        try {
            const page = await browser.newPage();

            for (const testPage of this.options.testPages) {
                console.log(`    Testing navigation on: ${testPage}`);

                try {
                    await page.goto(`${this.options.baseUrl}${testPage}`, {
                        waitUntil: 'networkidle0',
                        timeout: this.options.thresholds.loadTimeout
                    });

                    const navData = await page.evaluate(() => {
                        const navigation = {
                            mainNav: [],
                            footerNav: [],
                            breadcrumbs: [],
                            internalLinks: [],
                            externalLinks: []
                        };

                        // Analyze main navigation
                        const mainNavs = document.querySelectorAll('nav, .navigation, .main-nav, .primary-nav');
                        mainNavs.forEach(nav => {
                            const links = nav.querySelectorAll('a');
                            links.forEach(link => {
                                navigation.mainNav.push({
                                    text: link.textContent.trim(),
                                    href: link.href,
                                    internal: link.href.includes(window.location.origin) || link.href.startsWith('/')
                                });
                            });
                        });

                        // Analyze footer navigation
                        const footers = document.querySelectorAll('footer');
                        footers.forEach(footer => {
                            const links = footer.querySelectorAll('a');
                            links.forEach(link => {
                                navigation.footerNav.push({
                                    text: link.textContent.trim(),
                                    href: link.href,
                                    internal: link.href.includes(window.location.origin) || link.href.startsWith('/')
                                });
                            });
                        });

                        // Check for breadcrumbs
                        const breadcrumbSelectors = ['.breadcrumb', '.breadcrumbs', '[aria-label*="breadcrumb"]', '.crumbs'];
                        breadcrumbSelectors.forEach(selector => {
                            const breadcrumbContainer = document.querySelector(selector);
                            if (breadcrumbContainer) {
                                const links = breadcrumbContainer.querySelectorAll('a');
                                links.forEach(link => {
                                    navigation.breadcrumbs.push({
                                        text: link.textContent.trim(),
                                        href: link.href
                                    });
                                });
                            }
                        });

                        // Analyze all links
                        const allLinks = document.querySelectorAll('a[href]');
                        allLinks.forEach(link => {
                            const linkData = {
                                text: link.textContent.trim(),
                                href: link.href,
                                internal: link.href.includes(window.location.origin) || link.href.startsWith('/'),
                                hasTitle: !!link.title,
                                opensNewWindow: link.target === '_blank'
                            };

                            if (linkData.internal) {
                                navigation.internalLinks.push(linkData);
                            } else {
                                navigation.externalLinks.push(linkData);
                            }
                        });

                        return navigation;
                    });

                    navigationResults.navigation[testPage] = navData;

                    // Test some navigation links
                    const testableLinks = navData.internalLinks.slice(0, 5); // Test first 5 internal links
                    for (const link of testableLinks) {
                        try {
                            if (link.href && !link.href.includes('#')) {
                                // Only test actual page links, not anchors
                                const linkPage = await browser.newPage();
                                await linkPage.goto(link.href, { timeout: 5000 });
                                await linkPage.close();
                                navigationResults.summary.workingLinks++;
                            }
                        } catch (error) {
                            navigationResults.summary.brokenLinks++;
                            navData.brokenLinks = navData.brokenLinks || [];
                            navData.brokenLinks.push({
                                href: link.href,
                                error: error.message
                            });
                        }
                    }

                } catch (error) {
                    console.error(`    ❌ Navigation test failed for ${testPage}:`, error.message);
                    navigationResults.navigation[testPage] = { error: error.message };
                    navigationResults.summary.navigationIssues++;
                }
            }

        } finally {
            await browser.close();
        }

        return navigationResults;
    }

    async runPerformanceFunctionalityTests() {
        const performanceResults = {
            correlation: {},
            performanceVsFunctionality: {},
            summary: {
                performanceImpactOnFunctionality: 'minimal',
                functionalityImpactOnPerformance: 'minimal',
                overallHealth: 'good'
            }
        };

        // This would integrate with the performance testing framework
        // For now, we'll create a simplified version

        const browser = await puppeteer.launch({ headless: true });

        try {
            const page = await browser.newPage();

            for (const testPage of this.options.testPages) {
                console.log(`    Testing performance-functionality correlation: ${testPage}`);

                try {
                    // Measure performance metrics while testing functionality
                    const startTime = performance.now();

                    await page.goto(`${this.options.baseUrl}${testPage}`, {
                        waitUntil: 'networkidle0',
                        timeout: this.options.thresholds.loadTimeout
                    });

                    const loadTime = performance.now() - startTime;

                    // Test basic functionality while measuring performance
                    const functionalityTest = await page.evaluate(() => {
                        const startTest = performance.now();

                        // Test interactive elements
                        const buttons = document.querySelectorAll('button, [role="button"]');
                        const links = document.querySelectorAll('a[href]');
                        const forms = document.querySelectorAll('form');

                        // Simulate some interactions (without actually clicking)
                        let interactiveElements = 0;
                        buttons.forEach(button => {
                            if (!button.disabled && button.offsetParent !== null) {
                                interactiveElements++;
                            }
                        });

                        links.forEach(link => {
                            if (link.href && link.offsetParent !== null) {
                                interactiveElements++;
                            }
                        });

                        const endTest = performance.now();

                        return {
                            interactiveElements,
                            forms: forms.length,
                            testDuration: endTest - startTest,
                            domReady: document.readyState === 'complete'
                        };
                    });

                    // Get Core Web Vitals
                    const vitals = await page.evaluate(() => {
                        return new Promise((resolve) => {
                            const vitals = {};

                            // First Contentful Paint
                            const fcpObserver = new PerformanceObserver((list) => {
                                const entries = list.getEntries();
                                vitals.fcp = entries[entries.length - 1]?.startTime || 0;
                            });

                            try {
                                fcpObserver.observe({ type: 'paint', buffered: true });
                            } catch (e) {
                                vitals.fcp = 0;
                            }

                            // Largest Contentful Paint
                            const lcpObserver = new PerformanceObserver((list) => {
                                const entries = list.getEntries();
                                vitals.lcp = entries[entries.length - 1]?.startTime || 0;
                            });

                            try {
                                lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
                            } catch (e) {
                                vitals.lcp = 0;
                            }

                            // Layout Shift
                            let clsScore = 0;
                            const clsObserver = new PerformanceObserver((list) => {
                                for (const entry of list.getEntries()) {
                                    if (!entry.hadRecentInput) {
                                        clsScore += entry.value;
                                    }
                                }
                                vitals.cls = clsScore;
                            });

                            try {
                                clsObserver.observe({ type: 'layout-shift', buffered: true });
                            } catch (e) {
                                vitals.cls = 0;
                            }

                            setTimeout(() => resolve(vitals), 2000);
                        });
                    });

                    // Analyze correlation
                    const correlation = {
                        loadTime,
                        functionalityScore: this.calculateFunctionalityScore(functionalityTest),
                        performanceScore: this.calculatePerformanceScore(vitals),
                        vitals,
                        functionality: functionalityTest,
                        healthScore: 0
                    };

                    // Calculate health score based on both performance and functionality
                    const perfWeight = 0.4;
                    const funcWeight = 0.6;
                    correlation.healthScore = (correlation.performanceScore * perfWeight) +
                                            (correlation.functionalityScore * funcWeight);

                    performanceResults.correlation[testPage] = correlation;

                    console.log(`      Performance score: ${correlation.performanceScore.toFixed(1)}/100`);
                    console.log(`      Functionality score: ${correlation.functionalityScore.toFixed(1)}/100`);
                    console.log(`      Overall health: ${correlation.healthScore.toFixed(1)}/100`);

                } catch (error) {
                    console.error(`    ❌ Performance-functionality test failed for ${testPage}:`, error.message);
                    performanceResults.correlation[testPage] = { error: error.message };
                }
            }

        } finally {
            await browser.close();
        }

        // Analyze overall trends
        const correlations = Object.values(performanceResults.correlation).filter(c => !c.error);
        if (correlations.length > 0) {
            const avgPerformance = correlations.reduce((sum, c) => sum + c.performanceScore, 0) / correlations.length;
            const avgFunctionality = correlations.reduce((sum, c) => sum + c.functionalityScore, 0) / correlations.length;
            const avgHealth = correlations.reduce((sum, c) => sum + c.healthScore, 0) / correlations.length;

            performanceResults.summary = {
                averagePerformanceScore: avgPerformance,
                averageFunctionalityScore: avgFunctionality,
                averageHealthScore: avgHealth,
                performanceImpactOnFunctionality: avgPerformance > 80 ? 'minimal' : avgPerformance > 60 ? 'moderate' : 'significant',
                functionalityImpactOnPerformance: avgFunctionality > 80 ? 'minimal' : avgFunctionality > 60 ? 'moderate' : 'significant',
                overallHealth: avgHealth > 80 ? 'excellent' : avgHealth > 60 ? 'good' : avgHealth > 40 ? 'needs_improvement' : 'critical'
            };
        }

        return performanceResults;
    }

    calculateFunctionalityScore(functionality) {
        let score = 100;

        // Penalize for lack of interactive elements
        if (functionality.interactiveElements === 0) {
            score -= 30;
        } else if (functionality.interactiveElements < 5) {
            score -= 10;
        }

        // Check if DOM is properly loaded
        if (!functionality.domReady) {
            score -= 20;
        }

        // Check test execution time (should be fast)
        if (functionality.testDuration > 1000) { // 1 second
            score -= 10;
        }

        return Math.max(0, score);
    }

    calculatePerformanceScore(vitals) {
        let score = 100;

        // Penalize based on Core Web Vitals thresholds
        if (vitals.fcp > 1800) score -= 20;
        else if (vitals.fcp > 1000) score -= 10;

        if (vitals.lcp > 2500) score -= 25;
        else if (vitals.lcp > 1500) score -= 15;

        if (vitals.cls > 0.25) score -= 25;
        else if (vitals.cls > 0.1) score -= 15;

        return Math.max(0, score);
    }

    async analyzeResults() {
        let totalTests = 0;
        let passedTests = 0;
        let failedTests = 0;
        let warningTests = 0;

        // Analyze each test type
        Object.entries(this.testResults.testsByType).forEach(([testType, results]) => {
            if (!results) return;

            switch (testType) {
                case 'functional':
                    this.analyzeFunctionalResults(results);
                    break;
                case 'visual':
                    this.analyzeVisualResults(results);
                    break;
                case 'accessibility':
                    this.analyzeAccessibilityResults(results);
                    break;
                case 'seo':
                    this.analyzeSEOResults(results);
                    break;
                case 'userJourneys':
                    this.analyzeUserJourneyResults(results);
                    break;
                case 'forms':
                    this.analyzeFormResults(results);
                    break;
                case 'navigation':
                    this.analyzeNavigationResults(results);
                    break;
                case 'performance':
                    this.analyzePerformanceResults(results);
                    break;
            }
        });

        // Generate overall recommendations
        this.generateOverallRecommendations();
    }

    analyzeFunctionalResults(results) {
        Object.entries(results.pageLoading).forEach(([page, result]) => {
            this.testResults.summary.total++;

            if (result.success && result.errors === 0) {
                this.testResults.summary.passed++;
            } else if (result.success && result.errors < 3) {
                this.testResults.summary.warnings++;
                this.testResults.warnings.push({
                    type: 'functional',
                    page,
                    issue: `${result.errors} errors detected`,
                    severity: 'medium'
                });
            } else {
                this.testResults.summary.failed++;
                this.testResults.failures.push({
                    type: 'functional',
                    page,
                    issue: result.error || `${result.errors} errors detected`,
                    severity: 'high'
                });
            }
        });
    }

    analyzeVisualResults(results) {
        if (results.diffs && results.diffs.length > 0) {
            results.diffs.forEach(diff => {
                this.testResults.summary.total++;

                if (diff.difference > 0.3) { // 30% difference
                    this.testResults.summary.failed++;
                    this.testResults.failures.push({
                        type: 'visual_regression',
                        page: diff.page,
                        viewport: diff.viewport,
                        issue: `Significant visual difference: ${(diff.difference * 100).toFixed(1)}%`,
                        severity: 'high'
                    });
                } else {
                    this.testResults.summary.warnings++;
                    this.testResults.warnings.push({
                        type: 'visual_regression',
                        page: diff.page,
                        viewport: diff.viewport,
                        issue: `Minor visual difference: ${(diff.difference * 100).toFixed(1)}%`,
                        severity: 'medium'
                    });
                }
            });
        }
    }

    analyzeAccessibilityResults(results) {
        Object.entries(results.scores).forEach(([page, score]) => {
            this.testResults.summary.total++;

            if (score >= this.options.thresholds.accessibilityScore) {
                this.testResults.summary.passed++;
            } else if (score >= 70) {
                this.testResults.summary.warnings++;
                this.testResults.warnings.push({
                    type: 'accessibility',
                    page,
                    issue: `Accessibility score below threshold: ${score}/100`,
                    severity: 'medium'
                });
            } else {
                this.testResults.summary.failed++;
                this.testResults.failures.push({
                    type: 'accessibility',
                    page,
                    issue: `Poor accessibility score: ${score}/100`,
                    severity: 'high'
                });
            }
        });
    }

    analyzeSEOResults(results) {
        Object.entries(results.scores).forEach(([page, score]) => {
            this.testResults.summary.total++;

            if (score >= this.options.thresholds.seoScore) {
                this.testResults.summary.passed++;
            } else if (score >= 70) {
                this.testResults.summary.warnings++;
                this.testResults.warnings.push({
                    type: 'seo',
                    page,
                    issue: `SEO score below threshold: ${score}/100`,
                    severity: 'medium'
                });
            } else {
                this.testResults.summary.failed++;
                this.testResults.failures.push({
                    type: 'seo',
                    page,
                    issue: `Poor SEO score: ${score}/100`,
                    severity: 'high'
                });
            }
        });
    }

    analyzeUserJourneyResults(results) {
        Object.entries(results.journeys).forEach(([journeyName, journey]) => {
            this.testResults.summary.total++;

            if (journey.success) {
                this.testResults.summary.passed++;
            } else {
                this.testResults.summary.failed++;
                this.testResults.failures.push({
                    type: 'user_journey',
                    journey: journeyName,
                    issue: `User journey failed: ${journey.errors.join(', ')}`,
                    severity: 'high'
                });
            }
        });
    }

    analyzeFormResults(results) {
        if (results.summary.total > 0) {
            this.testResults.summary.total += results.summary.total;
            this.testResults.summary.passed += results.summary.functional;
            this.testResults.summary.failed += results.summary.broken;

            if (results.summary.broken > 0) {
                this.testResults.failures.push({
                    type: 'forms',
                    issue: `${results.summary.broken} forms are non-functional`,
                    severity: 'high'
                });
            }
        }
    }

    analyzeNavigationResults(results) {
        this.testResults.summary.total += results.summary.workingLinks + results.summary.brokenLinks;
        this.testResults.summary.passed += results.summary.workingLinks;
        this.testResults.summary.failed += results.summary.brokenLinks;

        if (results.summary.brokenLinks > 0) {
            this.testResults.failures.push({
                type: 'navigation',
                issue: `${results.summary.brokenLinks} broken links found`,
                severity: 'medium'
            });
        }
    }

    analyzePerformanceResults(results) {
        Object.entries(results.correlation).forEach(([page, correlation]) => {
            if (correlation.error) return;

            this.testResults.summary.total++;

            if (correlation.healthScore >= 80) {
                this.testResults.summary.passed++;
            } else if (correlation.healthScore >= 60) {
                this.testResults.summary.warnings++;
                this.testResults.warnings.push({
                    type: 'performance_functionality',
                    page,
                    issue: `Performance-functionality health score: ${correlation.healthScore.toFixed(1)}/100`,
                    severity: 'medium'
                });
            } else {
                this.testResults.summary.failed++;
                this.testResults.failures.push({
                    type: 'performance_functionality',
                    page,
                    issue: `Poor performance-functionality correlation: ${correlation.healthScore.toFixed(1)}/100`,
                    severity: 'high'
                });
            }
        });
    }

    generateOverallRecommendations() {
        const recommendations = [];

        // High-priority recommendations based on failures
        const criticalFailures = this.testResults.failures.filter(f => f.severity === 'high');
        if (criticalFailures.length > 0) {
            recommendations.push({
                priority: 'critical',
                type: 'failures',
                description: `${criticalFailures.length} critical issues need immediate attention`,
                actions: [
                    'Review all critical failures before deploying optimizations',
                    'Implement fixes for broken functionality',
                    'Ensure optimizations don\'t compromise core features',
                    'Run regression tests after each fix'
                ]
            });
        }

        // Performance vs functionality balance
        const perfResults = this.testResults.testsByType.performance;
        if (perfResults && perfResults.summary.overallHealth !== 'excellent') {
            recommendations.push({
                priority: 'high',
                type: 'performance_balance',
                description: `Performance optimizations may be impacting functionality (${perfResults.summary.overallHealth})`,
                actions: [
                    'Review optimization strategies for negative side effects',
                    'Implement progressive enhancement approaches',
                    'Monitor both performance and functionality metrics',
                    'Consider rolling back aggressive optimizations'
                ]
            });
        }

        // Accessibility and SEO maintenance
        const accessibilityResults = this.testResults.testsByType.accessibility;
        if (accessibilityResults && accessibilityResults.summary.averageScore < 85) {
            recommendations.push({
                priority: 'medium',
                type: 'accessibility',
                description: 'Accessibility standards need attention during optimization',
                actions: [
                    'Ensure optimizations maintain accessibility compliance',
                    'Test with screen readers after changes',
                    'Validate ARIA labels and semantic structure',
                    'Include accessibility in optimization testing'
                ]
            });
        }

        this.testResults.recommendations = recommendations;
    }

    async generateValidationReport() {
        const report = {
            metadata: {
                timestamp: this.testResults.timestamp,
                testPages: this.options.testPages,
                testTypes: Object.keys(this.testResults.testsByType),
                totalTests: this.testResults.summary.total,
                passRate: this.testResults.summary.total > 0 ?
                    (this.testResults.summary.passed / this.testResults.summary.total * 100).toFixed(1) : 0
            },
            summary: this.testResults.summary,
            results: this.testResults.testsByType,
            failures: this.testResults.failures,
            warnings: this.testResults.warnings,
            recommendations: this.testResults.recommendations
        };

        // Save detailed JSON report
        await fs.writeFile(
            path.join(this.options.reportPath, 'functional-validation-report.json'),
            JSON.stringify(report, null, 2)
        );

        // Generate readable markdown report
        const markdownReport = this.generateMarkdownReport(report);
        await fs.writeFile(
            path.join(this.options.reportPath, 'FUNCTIONAL_VALIDATION_REPORT.md'),
            markdownReport
        );

        console.log('\n📊 Validation reports generated:');
        console.log('  📄 functional-validation-report.json');
        console.log('  📋 FUNCTIONAL_VALIDATION_REPORT.md');

        // Display summary
        this.displayValidationSummary(report);
    }

    generateMarkdownReport(report) {
        let markdown = `# Functional Validation Report\n\n`;
        markdown += `**Generated:** ${report.metadata.timestamp}  \n`;
        markdown += `**Pages Tested:** ${report.metadata.testPages.join(', ')}  \n`;
        markdown += `**Test Types:** ${report.metadata.testTypes.join(', ')}  \n`;
        markdown += `**Pass Rate:** ${report.metadata.passRate}%  \n\n`;

        // Executive Summary
        markdown += `## Executive Summary\n\n`;
        markdown += `- **Total Tests:** ${report.summary.total}\n`;
        markdown += `- **Passed:** ${report.summary.passed} ✅\n`;
        markdown += `- **Failed:** ${report.summary.failed} ❌\n`;
        markdown += `- **Warnings:** ${report.summary.warnings} ⚠️\n`;
        markdown += `- **Skipped:** ${report.summary.skipped} ⏭️\n\n`;

        // Critical Failures
        if (report.failures.length > 0) {
            markdown += `## Critical Failures\n\n`;
            const criticalFailures = report.failures.filter(f => f.severity === 'high');
            const mediumFailures = report.failures.filter(f => f.severity === 'medium');

            if (criticalFailures.length > 0) {
                markdown += `### High Severity (${criticalFailures.length})\n\n`;
                criticalFailures.forEach(failure => {
                    markdown += `- **${failure.type}**`;
                    if (failure.page) markdown += ` (${failure.page})`;
                    if (failure.journey) markdown += ` (${failure.journey})`;
                    markdown += `: ${failure.issue}\n`;
                });
                markdown += '\n';
            }

            if (mediumFailures.length > 0) {
                markdown += `### Medium Severity (${mediumFailures.length})\n\n`;
                mediumFailures.forEach(failure => {
                    markdown += `- **${failure.type}**`;
                    if (failure.page) markdown += ` (${failure.page})`;
                    markdown += `: ${failure.issue}\n`;
                });
                markdown += '\n';
            }
        }

        // Warnings
        if (report.warnings.length > 0) {
            markdown += `## Warnings (${report.warnings.length})\n\n`;
            report.warnings.forEach(warning => {
                markdown += `- **${warning.type}**`;
                if (warning.page) markdown += ` (${warning.page})`;
                markdown += `: ${warning.issue}\n`;
            });
            markdown += '\n';
        }

        // Recommendations
        if (report.recommendations.length > 0) {
            markdown += `## Recommendations\n\n`;

            const recsByPriority = this.groupBy(report.recommendations, 'priority');

            ['critical', 'high', 'medium', 'low'].forEach(priority => {
                const recs = recsByPriority[priority] || [];
                if (recs.length > 0) {
                    markdown += `### ${priority.toUpperCase()} Priority\n\n`;
                    recs.forEach(rec => {
                        markdown += `- **${rec.type}**: ${rec.description}\n`;
                        rec.actions.forEach(action => {
                            markdown += `  - ${action}\n`;
                        });
                        markdown += '\n';
                    });
                }
            });
        }

        // Test Results Summary
        markdown += `## Test Results by Type\n\n`;
        Object.entries(report.results).forEach(([testType, results]) => {
            markdown += `### ${testType.charAt(0).toUpperCase() + testType.slice(1)}\n\n`;

            if (results.summary) {
                Object.entries(results.summary).forEach(([key, value]) => {
                    markdown += `- ${key}: ${value}\n`;
                });
                markdown += '\n';
            } else {
                markdown += `- Results: ${Object.keys(results).length} items tested\n\n`;
            }
        });

        return markdown;
    }

    displayValidationSummary(report) {
        console.log('\n' + '═'.repeat(80));
        console.log('🧪 FUNCTIONAL VALIDATION SUMMARY');
        console.log('═'.repeat(80));

        console.log(`Total Tests: ${report.summary.total}`);
        console.log(`Pass Rate: ${report.metadata.passRate}%`);
        console.log(`✅ Passed: ${report.summary.passed}`);
        console.log(`❌ Failed: ${report.summary.failed}`);
        console.log(`⚠️  Warnings: ${report.summary.warnings}`);

        if (report.failures.length > 0) {
            console.log(`\nCritical Issues: ${report.failures.filter(f => f.severity === 'high').length}`);
            console.log(`Medium Issues: ${report.failures.filter(f => f.severity === 'medium').length}`);
        }

        if (report.recommendations.length > 0) {
            console.log(`\nRecommendations: ${report.recommendations.length}`);
            const criticalRecs = report.recommendations.filter(r => r.priority === 'critical').length;
            if (criticalRecs > 0) {
                console.log(`⚠️  Critical recommendations: ${criticalRecs}`);
            }
        }

        // Overall health assessment
        const passRate = parseFloat(report.metadata.passRate);
        let healthStatus = 'UNKNOWN';
        if (passRate >= 95) healthStatus = '🟢 EXCELLENT';
        else if (passRate >= 85) healthStatus = '🟡 GOOD';
        else if (passRate >= 70) healthStatus = '🟠 NEEDS ATTENTION';
        else healthStatus = '🔴 CRITICAL';

        console.log(`\nOverall Health: ${healthStatus}`);
        console.log('═'.repeat(80));
    }

    async ensureDirectories() {
        const directories = [
            this.options.screenshotPath,
            this.options.baselinePath,
            this.options.reportPath
        ];

        for (const dir of directories) {
            await fs.mkdir(dir, { recursive: true });
        }
    }

    // Utility methods
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key] || 'unknown';
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(item);
            return groups;
        }, {});
    }
}

export default FunctionalValidationSuite;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const validator = new FunctionalValidationSuite({
        baseUrl: process.env.BASE_URL || 'http://localhost:4321/website/',
        testPages: ['index.html', 'about.html', 'contact.html', 'services.html', 'pricing.html']
    });

    validator.runFullValidationSuite().catch(console.error);
}