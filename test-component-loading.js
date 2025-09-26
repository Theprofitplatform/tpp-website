const { chromium } = require('playwright');

(async () => {
    console.log('🔍 Testing component loading with Playwright...\n');

    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();

    // Listen for console messages
    page.on('console', msg => {
        console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });

    // Listen for page errors
    page.on('pageerror', error => {
        console.log(`[Page Error] ${error.message}`);
    });

    // Track network requests
    const failedRequests = [];
    const successfulRequests = [];

    page.on('requestfailed', request => {
        failedRequests.push({
            url: request.url(),
            error: request.failure().errorText
        });
    });

    page.on('response', response => {
        if (response.url().includes('component') || response.url().includes('header') || response.url().includes('footer')) {
            successfulRequests.push({
                url: response.url(),
                status: response.status()
            });
        }
    });

    try {
        console.log('📄 Loading test page: http://localhost:8080/test-components.html');
        await page.goto('http://localhost:8080/test-components.html', {
            waitUntil: 'networkidle'
        });

        // Wait a bit for components to load
        await page.waitForTimeout(2000);

        // Check if placeholders exist
        const headerPlaceholder = await page.$('#header-placeholder');
        const footerPlaceholder = await page.$('#footer-placeholder');

        console.log('\n📋 Placeholder Status:');
        console.log(`  Header placeholder exists: ${headerPlaceholder !== null}`);
        console.log(`  Footer placeholder exists: ${footerPlaceholder !== null}`);

        // Check if placeholders have content
        if (headerPlaceholder) {
            const headerContent = await page.evaluate(() => {
                const el = document.getElementById('header-placeholder');
                return el ? el.innerHTML.length : 0;
            });
            console.log(`  Header content length: ${headerContent} characters`);
        }

        if (footerPlaceholder) {
            const footerContent = await page.evaluate(() => {
                const el = document.getElementById('footer-placeholder');
                return el ? el.innerHTML.length : 0;
            });
            console.log(`  Footer content length: ${footerContent} characters`);
        }

        // Check for actual header/footer elements
        const header = await page.$('header');
        const footer = await page.$('footer');

        console.log('\n🎯 Component Elements:');
        console.log(`  <header> element exists: ${header !== null}`);
        console.log(`  <footer> element exists: ${footer !== null}`);

        // Check loading status from page
        const loadingStatus = await page.evaluate(() => {
            const statusEl = document.getElementById('loading-status');
            return statusEl ? statusEl.innerText : 'Status element not found';
        });

        console.log('\n📊 Loading Status from Page:');
        console.log(loadingStatus);

        // Report network requests
        console.log('\n🌐 Network Requests:');
        if (successfulRequests.length > 0) {
            console.log('  Successful component requests:');
            successfulRequests.forEach(req => {
                console.log(`    ✅ ${req.status} - ${req.url}`);
            });
        }

        if (failedRequests.length > 0) {
            console.log('  Failed requests:');
            failedRequests.forEach(req => {
                console.log(`    ❌ ${req.error} - ${req.url}`);
            });
        }

        // Execute JavaScript in page to check fetch
        const fetchTest = await page.evaluate(async () => {
            const results = {};

            // Test header fetch
            try {
                const headerResponse = await fetch('/components/layout/modern-header.html');
                results.header = {
                    status: headerResponse.status,
                    ok: headerResponse.ok,
                    contentLength: (await headerResponse.text()).length
                };
            } catch (e) {
                results.header = { error: e.message };
            }

            // Test footer fetch
            try {
                const footerResponse = await fetch('/components/layout/modern-footer.html');
                results.footer = {
                    status: footerResponse.status,
                    ok: footerResponse.ok,
                    contentLength: (await footerResponse.text()).length
                };
            } catch (e) {
                results.footer = { error: e.message };
            }

            return results;
        });

        console.log('\n🔬 Direct Fetch Test from Browser:');
        console.log('  Header fetch:', JSON.stringify(fetchTest.header, null, 2));
        console.log('  Footer fetch:', JSON.stringify(fetchTest.footer, null, 2));

        // Take a screenshot for visual inspection
        await page.screenshot({ path: 'component-test-screenshot.png', fullPage: true });
        console.log('\n📸 Screenshot saved as component-test-screenshot.png');

        // Check a power page too
        console.log('\n📄 Testing power page: http://localhost:8080/power/seo-melbourne-best.html');
        await page.goto('http://localhost:8080/power/seo-melbourne-best.html', {
            waitUntil: 'networkidle'
        });

        await page.waitForTimeout(2000);

        const powerHeader = await page.$('header');
        const powerFooter = await page.$('footer');

        console.log('  Power page <header> exists:', powerHeader !== null);
        console.log('  Power page <footer> exists:', powerFooter !== null);

    } catch (error) {
        console.error('❌ Test failed:', error);
    }

    await browser.close();
    console.log('\n✅ Test complete');
})();