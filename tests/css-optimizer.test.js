/**
 * The Profit Platform - CSS Optimizer Tests
 * Comprehensive test suite for CSS optimization features
 */

describe('CSS Optimizer', () => {
    let cssOptimizer;
    let mockFetch;
    let mockIntersectionObserver;

    beforeEach(() => {
        // Reset DOM
        document.head.innerHTML = '';
        document.body.innerHTML = '';

        // Mock fetch
        mockFetch = jest.fn();
        global.fetch = mockFetch;

        // Mock Intersection Observer
        mockIntersectionObserver = {
            observe: jest.fn(),
            unobserve: jest.fn(),
            disconnect: jest.fn()
        };

        global.IntersectionObserver = jest.fn(() => mockIntersectionObserver);

        // Mock getBoundingClientRect
        Element.prototype.getBoundingClientRect = jest.fn(() => ({
            top: 100,
            bottom: 200,
            left: 0,
            right: 100,
            width: 100,
            height: 100
        }));

        // Mock window dimensions
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: 768
        });

        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024
        });

        // Initialize CSS optimizer
        cssOptimizer = new CSSOptimizer({
            criticalCSS: true,
            consolidation: true,
            minification: true,
            unusedCSSRemoval: true,
            inlineCritical: true,
            deferNonCritical: true
        });
    });

    afterEach(() => {
        if (cssOptimizer) {
            cssOptimizer.destroy();
        }
        jest.restoreAllMocks();
    });

    describe('Stylesheet Detection', () => {
        test('should detect external stylesheets', () => {
            const link1 = document.createElement('link');
            link1.rel = 'stylesheet';
            link1.href = '/css/style.css';
            link1.media = 'all';
            document.head.appendChild(link1);

            const link2 = document.createElement('link');
            link2.rel = 'stylesheet';
            link2.href = '/css/theme.css';
            link2.dataset.critical = 'true';
            document.head.appendChild(link2);

            cssOptimizer.detectStylesheets();

            expect(cssOptimizer.stylesheets.size).toBe(2);
            expect(cssOptimizer.stylesheets.has('/css/style.css')).toBe(true);
            expect(cssOptimizer.stylesheets.has('/css/theme.css')).toBe(true);

            const themeStylesheet = cssOptimizer.stylesheets.get('/css/theme.css');
            expect(themeStylesheet.critical).toBe(true);
        });

        test('should detect inline stylesheets', () => {
            const style = document.createElement('style');
            style.textContent = '.test { color: red; }';
            document.head.appendChild(style);

            cssOptimizer.detectStylesheets();

            expect(cssOptimizer.stylesheets.size).toBe(1);

            const inlineStylesheet = Array.from(cssOptimizer.stylesheets.values())[0];
            expect(inlineStylesheet.type).toBe('inline');
            expect(inlineStylesheet.href).toContain('inline-');
        });

        test('should calculate stylesheet priority correctly', () => {
            const criticalLink = document.createElement('link');
            criticalLink.rel = 'stylesheet';
            criticalLink.href = '/css/critical.css';
            criticalLink.dataset.critical = 'true';

            const navigationLink = document.createElement('link');
            navigationLink.rel = 'stylesheet';
            navigationLink.href = '/css/navigation.css';

            const regularLink = document.createElement('link');
            regularLink.rel = 'stylesheet';
            regularLink.href = '/css/regular.css';

            const criticalPriority = cssOptimizer.calculateStylesheetPriority(criticalLink);
            const navigationPriority = cssOptimizer.calculateStylesheetPriority(navigationLink);
            const regularPriority = cssOptimizer.calculateStylesheetPriority(regularLink);

            expect(criticalPriority).toBeGreaterThan(navigationPriority);
            expect(navigationPriority).toBeGreaterThan(regularPriority);
        });
    });

    describe('CSS Parsing', () => {
        test('should parse CSS rules correctly', () => {
            const cssText = `
                .header { background: blue; color: white; }
                #content { margin: 20px; }
                @media (max-width: 768px) { .header { font-size: 14px; } }
            `;

            const rules = cssOptimizer.parseCSSRules(cssText);

            expect(rules.length).toBe(3);
            expect(rules[0].selector.trim()).toBe('.header');
            expect(rules[0].declarations.trim()).toBe('background: blue; color: white;');
            expect(rules[1].selector.trim()).toBe('#content');
            expect(rules[1].declarations.trim()).toBe('margin: 20px;');
        });

        test('should calculate selector specificity correctly', () => {
            const idSelector = cssOptimizer.calculateSpecificity('#header');
            const classSelector = cssOptimizer.calculateSpecificity('.navigation');
            const elementSelector = cssOptimizer.calculateSpecificity('div');
            const combinedSelector = cssOptimizer.calculateSpecificity('#header .nav a');

            expect(idSelector).toBeGreaterThan(classSelector);
            expect(classSelector).toBeGreaterThan(elementSelector);
            expect(combinedSelector).toBeGreaterThan(idSelector);
        });

        test('should extract media queries correctly', () => {
            const mediaQuery = cssOptimizer.extractMediaQuery('@media (max-width: 768px) { .test { } }');

            expect(mediaQuery).toBe('(max-width: 768px)');
        });

        test('should handle invalid CSS gracefully', () => {
            const invalidCSS = 'this is not valid css { } ';

            expect(() => {
                cssOptimizer.parseCSSRules(invalidCSS);
            }).not.toThrow();
        });
    });

    describe('Critical CSS Extraction', () => {
        beforeEach(() => {
            // Create test HTML structure
            const header = document.createElement('header');
            header.className = 'main-header';
            header.id = 'header';

            const nav = document.createElement('nav');
            nav.className = 'navigation';

            const content = document.createElement('main');
            content.className = 'content';

            // Mock header as above-fold
            header.getBoundingClientRect = jest.fn(() => ({
                top: 0,
                bottom: 100,
                left: 0,
                right: 1024,
                width: 1024,
                height: 100
            }));

            // Mock content as below-fold
            content.getBoundingClientRect = jest.fn(() => ({
                top: 900,
                bottom: 1000,
                left: 0,
                right: 1024,
                width: 1024,
                height: 100
            }));

            document.body.appendChild(header);
            document.body.appendChild(nav);
            document.body.appendChild(content);
        });

        test('should identify above-fold elements', () => {
            const aboveFoldElements = cssOptimizer.identifyAboveFoldElements();

            const headerElement = aboveFoldElements.find(el =>
                el.element.tagName === 'HEADER'
            );

            expect(headerElement).toBeTruthy();
            expect(headerElement.selectors).toContain('header');
            expect(headerElement.selectors).toContain('.main-header');
            expect(headerElement.selectors).toContain('#header');
        });

        test('should mark critical rules correctly', () => {
            const mockStylesheet = {
                rules: [
                    {
                        selector: '.main-header',
                        declarations: 'background: blue;',
                        specificity: 10,
                        isCritical: false
                    },
                    {
                        selector: '.content',
                        declarations: 'margin: 20px;',
                        specificity: 10,
                        isCritical: false
                    },
                    {
                        selector: 'html',
                        declarations: 'font-size: 16px;',
                        specificity: 1,
                        isCritical: false
                    }
                ]
            };

            cssOptimizer.stylesheets.set('test.css', mockStylesheet);
            cssOptimizer.identifyAboveFoldElements();
            cssOptimizer.markCriticalRules();

            // HTML and header should be critical
            expect(mockStylesheet.rules[0].isCritical).toBe(true); // .main-header
            expect(mockStylesheet.rules[2].isCritical).toBe(true); // html

            // Content below fold should not be critical
            expect(mockStylesheet.rules[1].isCritical).toBe(false); // .content
        });

        test('should generate critical CSS', () => {
            cssOptimizer.criticalRules.add({
                selector: 'html',
                declarations: 'font-size: 16px;',
                specificity: 1
            });

            cssOptimizer.criticalRules.add({
                selector: '.header',
                declarations: 'background: blue; color: white;',
                specificity: 10
            });

            const criticalCSS = cssOptimizer.generateCriticalCSS();

            expect(criticalCSS).toContain('.header{background: blue; color: white;}');
            expect(criticalCSS).toContain('html{font-size: 16px;}');

            // Should be minified
            expect(criticalCSS).not.toContain('\n');
        });

        test('should inline critical CSS', () => {
            cssOptimizer.criticalCSS = '.header{background:blue;}';

            cssOptimizer.inlineCriticalCSS();

            const inlineStyle = document.querySelector('style[data-generated="critical-css"]');
            expect(inlineStyle).toBeTruthy();
            expect(inlineStyle.textContent).toBe('.header{background:blue;}');
            expect(inlineStyle.dataset.size).toBe('24'); // Length of CSS
        });
    });

    describe('Stylesheet Consolidation', () => {
        beforeEach(() => {
            // Create test stylesheets
            const stylesheets = [
                { href: '/css/theme.css', critical: true, size: 5000, rules: [] },
                { href: '/css/layout.css', critical: false, size: 3000, rules: [] },
                { href: '/css/components.css', critical: false, size: 4000, rules: [] },
                { href: '/css/navigation.css', critical: false, size: 2000, rules: [] }
            ];

            stylesheets.forEach(data => {
                cssOptimizer.stylesheets.set(data.href, data);
            });
        });

        test('should group stylesheets for consolidation', () => {
            const groups = cssOptimizer.groupStylesheetsForConsolidation();

            expect(groups.has('critical')).toBe(true);
            expect(groups.has('layout')).toBe(true);
            expect(groups.has('components')).toBe(true);

            expect(groups.get('critical').length).toBe(1);
            expect(groups.get('layout').length).toBe(1);
            expect(groups.get('components').length).toBe(1);
        });

        test('should deduplicate rules correctly', () => {
            const rules = [
                { selector: '.test', declarations: 'color: red;', specificity: 10 },
                { selector: '.test', declarations: 'color: red;', specificity: 10 },
                { selector: '.test', declarations: 'color: blue;', specificity: 20 }
            ];

            const deduplicated = cssOptimizer.deduplicateRules(rules);

            expect(deduplicated.length).toBe(2);

            // Should keep higher specificity rule
            const testRule = deduplicated.find(r => r.declarations === 'color: blue;');
            expect(testRule).toBeTruthy();
        });

        test('should generate consolidated CSS with media queries', () => {
            const rules = [
                { selector: '.base', declarations: 'color: black;', mediaQuery: null },
                { selector: '.mobile', declarations: 'font-size: 14px;', mediaQuery: '(max-width: 768px)' },
                { selector: '.tablet', declarations: 'font-size: 16px;', mediaQuery: '(max-width: 1024px)' }
            ];

            const consolidatedCSS = cssOptimizer.generateConsolidatedCSS(rules);

            expect(consolidatedCSS).toContain('.base{color: black;}');
            expect(consolidatedCSS).toContain('@media (max-width: 768px)');
            expect(consolidatedCSS).toContain('.mobile{font-size: 14px;}');
        });
    });

    describe('Unused CSS Removal', () => {
        beforeEach(() => {
            // Create test HTML elements
            const header = document.createElement('header');
            header.className = 'main-header';

            const content = document.createElement('div');
            content.className = 'content';

            document.body.appendChild(header);
            document.body.appendChild(content);
        });

        test('should identify used selectors', () => {
            const mockStylesheet = {
                rules: [
                    { selector: '.main-header', isUsed: false },
                    { selector: '.content', isUsed: false },
                    { selector: '.unused-class', isUsed: false },
                    { selector: 'html', isUsed: false }
                ]
            };

            cssOptimizer.stylesheets.set('test.css', mockStylesheet);
            cssOptimizer.identifyUsedSelectors();

            expect(mockStylesheet.rules[0].isUsed).toBe(true); // .main-header
            expect(mockStylesheet.rules[1].isUsed).toBe(true); // .content
            expect(mockStylesheet.rules[2].isUsed).toBe(false); // .unused-class
            expect(mockStylesheet.rules[3].isUsed).toBe(true); // html (always keep)
        });

        test('should handle pseudo-selectors correctly', () => {
            const isUsed = cssOptimizer.isSelectorUsed('.main-header:hover');

            // Should remove pseudo-selector for testing but still recognize as used
            expect(isUsed).toBe(true);
        });

        test('should keep special selectors', () => {
            const specialSelectors = [':root', 'html', 'body', '*', ':hover', '.js'];

            specialSelectors.forEach(selector => {
                const isUsed = cssOptimizer.isSelectorUsed(selector);
                expect(isUsed).toBe(true);
            });
        });

        test('should remove unused rules', () => {
            const mockStylesheet = {
                rules: [
                    { selector: '.used', isUsed: true, isCritical: false, size: 100 },
                    { selector: '.unused', isUsed: false, isCritical: false, size: 50 },
                    { selector: '.critical-unused', isUsed: false, isCritical: true, size: 75 }
                ]
            };

            cssOptimizer.stylesheets.set('test.css', mockStylesheet);
            cssOptimizer.removeUnusedRules();

            expect(mockStylesheet.rules.length).toBe(2); // Removed 1 unused rule
            expect(mockStylesheet.rules.find(r => r.selector === '.used')).toBeTruthy();
            expect(mockStylesheet.rules.find(r => r.selector === '.unused')).toBeFalsy();
            expect(mockStylesheet.rules.find(r => r.selector === '.critical-unused')).toBeTruthy(); // Critical kept
        });
    });

    describe('CSS Minification', () => {
        test('should minify CSS correctly', () => {
            const css = `
                /* This is a comment */
                .header {
                    background-color: blue;
                    color: white;
                }

                .content {
                    margin: 20px;
                    padding: 10px;
                }

                .empty-rule {
                }
            `;

            const minified = cssOptimizer.minifyCSS(css);

            expect(minified).not.toContain('/* This is a comment */');
            expect(minified).not.toContain('\n');
            expect(minified).not.toContain('  ');
            expect(minified).not.toContain('.empty-rule{}');
            expect(minified).toContain('.header{background-color:blue;color:white}');
        });

        test('should optimize media queries', () => {
            const css = `
                @media (max-width: 768px) { .mobile { font-size: 14px; } }
                .desktop { font-size: 16px; }
                @media (max-width: 768px) { .mobile-nav { display: block; } }
            `;

            const optimized = cssOptimizer.optimizeMediaQueries(css);

            // Should combine duplicate media queries
            const mediaQueryCount = (optimized.match(/@media \(max-width: 768px\)/g) || []).length;
            expect(mediaQueryCount).toBe(1);

            expect(optimized).toContain('.mobile { font-size: 14px; }');
            expect(optimized).toContain('.mobile-nav { display: block; }');
        });
    });

    describe('Non-Critical CSS Deferring', () => {
        test('should defer non-critical stylesheets', () => {
            const criticalLink = document.createElement('link');
            criticalLink.rel = 'stylesheet';
            criticalLink.href = '/css/critical.css';
            criticalLink.dataset.critical = 'true';

            const normalLink = document.createElement('link');
            normalLink.rel = 'stylesheet';
            normalLink.href = '/css/normal.css';

            const optimizedLink = document.createElement('link');
            optimizedLink.rel = 'stylesheet';
            optimizedLink.href = '/css/optimized.css';
            optimizedLink.dataset.optimized = 'true';

            document.head.appendChild(criticalLink);
            document.head.appendChild(normalLink);
            document.head.appendChild(optimizedLink);

            cssOptimizer.deferNonCriticalCSS();

            expect(criticalLink.media).not.toBe('print');
            expect(normalLink.media).toBe('print');
            expect(typeof normalLink.onload).toBe('function');
            expect(optimizedLink.media).not.toBe('print');

            // Test noscript fallback
            const noscript = document.querySelector('noscript');
            expect(noscript).toBeTruthy();

            const fallbackLink = noscript.querySelector('link');
            expect(fallbackLink.media).toBe('all');
        });
    });

    describe('Performance Measurement', () => {
        beforeEach(() => {
            cssOptimizer.stylesheets.set('test1.css', { size: 5000 });
            cssOptimizer.stylesheets.set('test2.css', { size: 3000 });

            cssOptimizer.optimizationStats = {
                originalSize: 8000,
                optimizedSize: 6000,
                criticalSize: 2000,
                removedRules: 10,
                consolidatedFiles: 2
            };

            // Mock performance.timing
            Object.defineProperty(performance, 'timing', {
                value: {
                    domLoading: 1000,
                    domContentLoadedEventEnd: 2500
                },
                configurable: true
            });
        });

        test('should measure CSS performance correctly', () => {
            const measurements = cssOptimizer.measureCSSPerformance();

            expect(measurements.stylesheetCount).toBe(2);
            expect(measurements.totalSize).toBe(8000);
            expect(measurements.optimizedSize).toBe(6000);
            expect(measurements.compressionRatio).toBe(25); // (8000-6000)/8000 * 100
            expect(measurements.criticalSize).toBe(2000);
            expect(measurements.removedRules).toBe(10);
            expect(measurements.consolidatedFiles).toBe(2);
            expect(measurements.renderingTime).toBe(1500); // 2500 - 1000
        });

        test('should report to analytics', () => {
            global.gtag = jest.fn();

            cssOptimizer.measureCSSPerformance();

            expect(global.gtag).toHaveBeenCalledWith('event', 'css_optimization', {
                event_category: 'Performance',
                event_label: 'CSS_Optimized',
                value: 25
            });
        });
    });

    describe('Report Generation', () => {
        beforeEach(() => {
            cssOptimizer.stylesheets.set('test.css', {
                href: 'test.css',
                size: 5000,
                rules: [{ selector: '.test' }, { selector: '.test2' }],
                critical: false,
                priority: 50
            });

            cssOptimizer.criticalRules.add({ selector: '.critical' });
            cssOptimizer.unusedSelectors.add('.unused');

            cssOptimizer.optimizationStats = {
                originalSize: 10000,
                optimizedSize: 7500,
                criticalSize: 2000,
                removedRules: 5,
                consolidatedFiles: 1
            };
        });

        test('should generate comprehensive report', () => {
            const report = cssOptimizer.generateReport();

            expect(report).toHaveProperty('performance');
            expect(report).toHaveProperty('stylesheets');
            expect(report).toHaveProperty('critical');
            expect(report).toHaveProperty('optimization');
            expect(report).toHaveProperty('unused');

            expect(report.stylesheets).toHaveLength(1);
            expect(report.stylesheets[0]).toEqual({
                href: 'test.css',
                size: 5000,
                rules: 2,
                critical: false,
                priority: 50
            });

            expect(report.critical.size).toBe(2000);
            expect(report.critical.rules).toBe(1);

            expect(report.optimization.compressionRatio).toBe(25);
            expect(report.unused).toBe(1);
        });
    });

    describe('Element Selector Extraction', () => {
        test('should extract all relevant selectors from element', () => {
            const element = document.createElement('div');
            element.id = 'main-content';
            element.className = 'content primary';
            element.setAttribute('data-component', 'hero');
            element.setAttribute('aria-label', 'Main content');

            const selectors = cssOptimizer.getElementSelectors(element);

            expect(selectors).toContain('div');
            expect(selectors).toContain('#main-content');
            expect(selectors).toContain('.content');
            expect(selectors).toContain('.primary');
            expect(selectors).toContain('[data-component]');
            expect(selectors).toContain('[data-component="hero"]');
            expect(selectors).toContain('[aria-label]');
            expect(selectors).toContain('[aria-label="Main content"]');
        });

        test('should handle elements with no classes or ID', () => {
            const element = document.createElement('p');

            const selectors = cssOptimizer.getElementSelectors(element);

            expect(selectors).toContain('p');
            expect(selectors.length).toBe(1);
        });
    });

    describe('Error Handling', () => {
        test('should handle fetch failures gracefully', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

            const rules = await cssOptimizer.parseExternalCSS('/css/nonexistent.css');

            expect(rules).toEqual([]);
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        test('should handle invalid selectors gracefully', () => {
            const isUsed = cssOptimizer.isSelectorUsed(':::invalid-selector:::');

            // Should return true to be safe when selector is invalid
            expect(isUsed).toBe(true);
        });

        test('should handle missing performance.timing', () => {
            Object.defineProperty(performance, 'timing', {
                value: undefined,
                configurable: true
            });

            const measurements = cssOptimizer.measureCSSPerformance();

            expect(measurements.renderingTime).toBeNull();
        });
    });

    describe('Cleanup', () => {
        test('should clear all data structures on destroy', () => {
            cssOptimizer.stylesheets.set('test', {});
            cssOptimizer.criticalRules.add({});
            cssOptimizer.nonCriticalRules.add({});
            cssOptimizer.unusedSelectors.add('test');
            cssOptimizer.mediaQueries.set('test', []);

            cssOptimizer.destroy();

            expect(cssOptimizer.stylesheets.size).toBe(0);
            expect(cssOptimizer.criticalRules.size).toBe(0);
            expect(cssOptimizer.nonCriticalRules.size).toBe(0);
            expect(cssOptimizer.unusedSelectors.size).toBe(0);
            expect(cssOptimizer.mediaQueries.size).toBe(0);
        });
    });

    describe('Stylesheet Update', () => {
        test('should update inline stylesheets', () => {
            const style = document.createElement('style');
            style.textContent = '.original { color: red; }';
            document.head.appendChild(style);

            const stylesheet = {
                type: 'inline',
                element: style,
                size: 100
            };

            const optimizedCSS = '.optimized{color:blue}';

            cssOptimizer.updateStylesheet(stylesheet, optimizedCSS);

            expect(style.textContent).toBe(optimizedCSS);
        });

        test('should update external stylesheets with data URLs', () => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/css/original.css';
            document.head.appendChild(link);

            const stylesheet = {
                type: 'external',
                element: link,
                size: 1000
            };

            const optimizedCSS = '.optimized{color:blue}';

            cssOptimizer.updateStylesheet(stylesheet, optimizedCSS);

            const newLink = document.head.querySelector('link[data-optimized="true"]');
            expect(newLink).toBeTruthy();
            expect(newLink.href).toContain('data:text/css;base64,');
            expect(newLink.dataset.originalSize).toBe('1000');
            expect(newLink.dataset.optimizedSize).toBe(optimizedCSS.length.toString());
        });
    });
});