const { chromium } = require('playwright');

async function testPages() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const pages = [
        { url: 'http://127.0.0.1:8080/index.html', name: 'Homepage' },
        { url: 'http://127.0.0.1:8080/about.html', name: 'About' },
        { url: 'http://127.0.0.1:8080/services.html', name: 'Services' },
        { url: 'http://127.0.0.1:8080/contact.html', name: 'Contact' }
    ];

    const results = [];

    for (const testPage of pages) {
        console.log(`\nTesting ${testPage.name}...`);

        const errors = [];
        const warnings = [];

        // Listen for console errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            } else if (msg.type() === 'warning') {
                warnings.push(msg.text());
            }
        });

        // Listen for page errors
        page.on('pageerror', error => {
            errors.push(`Page error: ${error.message}`);
        });

        // Listen for request failures
        page.on('requestfailed', request => {
            errors.push(`Failed to load: ${request.url()}`);
        });

        try {
            // Navigate to page
            const response = await page.goto(testPage.url, {
                waitUntil: 'networkidle',
                timeout: 30000
            });

            // Check response status
            if (response.status() !== 200) {
                errors.push(`Page returned status ${response.status()}`);
            }

            // Check if critical CSS files loaded
            const cssFiles = await page.evaluate(() => {
                const sheets = Array.from(document.styleSheets);
                return sheets.map(sheet => ({
                    href: sheet.href,
                    loaded: !sheet.disabled && sheet.cssRules !== null
                }));
            });

            const failedCSS = cssFiles.filter(css => css.href && !css.loaded);
            if (failedCSS.length > 0) {
                errors.push(`Failed to load CSS: ${failedCSS.map(css => css.href).join(', ')}`);
            }

            // Check for hero section on services page
            if (testPage.name === 'Services') {
                const heroExists = await page.evaluate(() => {
                    return document.querySelector('.services-hero-enhanced') !== null;
                });
                if (!heroExists) {
                    errors.push('Enhanced hero section not found on services page');
                }
            }

            // Check for about page elements
            if (testPage.name === 'About') {
                const aboutHeroExists = await page.evaluate(() => {
                    return document.querySelector('.about-hero') !== null;
                });
                if (!aboutHeroExists) {
                    errors.push('About hero section not found');
                }
            }

            // Check viewport rendering
            const viewport = await page.evaluate(() => {
                return {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    scrollHeight: document.body.scrollHeight
                };
            });

            results.push({
                page: testPage.name,
                url: testPage.url,
                status: errors.length === 0 ? 'PASS' : 'FAIL',
                errors: errors,
                warnings: warnings,
                viewport: viewport
            });

        } catch (error) {
            results.push({
                page: testPage.name,
                url: testPage.url,
                status: 'ERROR',
                errors: [`Test failed: ${error.message}`],
                warnings: []
            });
        }
    }

    // Print results
    console.log('\n' + '='.repeat(60));
    console.log('TEST RESULTS SUMMARY');
    console.log('='.repeat(60));

    let passCount = 0;
    let failCount = 0;

    for (const result of results) {
        console.log(`\n${result.page}: ${result.status}`);

        if (result.status === 'PASS') {
            passCount++;
            console.log('  ✓ All checks passed');
        } else {
            failCount++;
            if (result.errors.length > 0) {
                console.log('  Errors:');
                result.errors.forEach(error => console.log(`    ✗ ${error}`));
            }
        }

        if (result.warnings.length > 0) {
            console.log('  Warnings:');
            result.warnings.forEach(warning => console.log(`    ⚠ ${warning}`));
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Total: ${passCount} passed, ${failCount} failed`);
    console.log('='.repeat(60));

    await browser.close();
    process.exit(failCount > 0 ? 1 : 0);
}

testPages().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
});