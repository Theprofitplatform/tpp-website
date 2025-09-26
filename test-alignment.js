const { chromium } = require('playwright');

async function testAlignment() {
    // Start server
    const { exec } = require('child_process');
    const server = exec('python3 -m http.server 8080 --bind 127.0.0.1', { cwd: __dirname });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    const browser = await chromium.launch({
        headless: false,
        viewport: { width: 1920, height: 1080 }
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    console.log('Testing index.html alignment...\n');

    try {
        await page.goto('http://127.0.0.1:8080/index.html', {
            waitUntil: 'networkidle'
        });

        // Take initial screenshot
        await page.screenshot({ path: 'before-fix.png', fullPage: false });

        // Check container alignment
        const containerInfo = await page.evaluate(() => {
            const container = document.querySelector('.container');
            if (!container) return null;

            const rect = container.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(container);

            return {
                left: rect.left,
                right: rect.right,
                width: rect.width,
                marginLeft: computedStyle.marginLeft,
                marginRight: computedStyle.marginRight,
                paddingLeft: computedStyle.paddingLeft,
                paddingRight: computedStyle.paddingRight,
                windowWidth: window.innerWidth,
                centered: Math.abs(rect.left - (window.innerWidth - rect.right)) < 10
            };
        });

        console.log('Container Analysis:');
        console.log('==================');
        console.log(`Window Width: ${containerInfo.windowWidth}px`);
        console.log(`Container Width: ${containerInfo.width}px`);
        console.log(`Left Distance: ${containerInfo.left}px`);
        console.log(`Right Distance: ${containerInfo.windowWidth - containerInfo.right}px`);
        console.log(`Margin Left: ${containerInfo.marginLeft}`);
        console.log(`Margin Right: ${containerInfo.marginRight}`);
        console.log(`Padding Left: ${containerInfo.paddingLeft}`);
        console.log(`Padding Right: ${containerInfo.paddingRight}`);
        console.log(`Is Centered: ${containerInfo.centered ? 'YES ✓' : 'NO ✗'}`);

        // Check if content is too far right
        const leftSpace = containerInfo.left;
        const rightSpace = containerInfo.windowWidth - containerInfo.right;
        const difference = leftSpace - rightSpace;

        if (Math.abs(difference) > 50) {
            console.log(`\n⚠ WARNING: Content is shifted ${difference > 0 ? 'RIGHT' : 'LEFT'} by ${Math.abs(difference)}px`);

            // Apply fix
            console.log('\nApplying alignment fix...');

            await page.evaluate(() => {
                const style = document.createElement('style');
                style.innerHTML = `
                    /* Emergency alignment fix */
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    .container {
                        max-width: 1280px !important;
                        margin: 0 auto !important;
                        padding: 0 20px !important;
                        position: relative !important;
                        left: auto !important;
                        right: auto !important;
                        transform: none !important;
                    }

                    main, section {
                        margin: 0 !important;
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                        position: static !important;
                    }
                `;
                document.head.appendChild(style);
            });

            // Re-check after fix
            const afterFix = await page.evaluate(() => {
                const container = document.querySelector('.container');
                const rect = container.getBoundingClientRect();
                return {
                    left: rect.left,
                    right: rect.right,
                    windowWidth: window.innerWidth,
                    centered: Math.abs(rect.left - (window.innerWidth - rect.right)) < 10
                };
            });

            console.log('\nAfter Fix:');
            console.log(`Left: ${afterFix.left}px, Right: ${afterFix.windowWidth - afterFix.right}px`);
            console.log(`Centered: ${afterFix.centered ? 'YES ✓' : 'NO ✗'}`);

            await page.screenshot({ path: 'after-fix.png', fullPage: false });
        } else {
            console.log('\n✓ Content is properly centered!');
        }

        // Check other elements
        const elementsToCheck = [
            '.navbar',
            '.hero',
            '.hero-section',
            'main',
            'footer'
        ];

        console.log('\n\nElement Alignment Check:');
        console.log('========================');

        for (const selector of elementsToCheck) {
            const elementInfo = await page.evaluate((sel) => {
                const element = document.querySelector(sel);
                if (!element) return null;

                const rect = element.getBoundingClientRect();
                const style = window.getComputedStyle(element);

                return {
                    selector: sel,
                    left: rect.left,
                    width: rect.width,
                    marginLeft: style.marginLeft,
                    position: style.position
                };
            }, selector);

            if (elementInfo) {
                const status = elementInfo.left === 0 || elementInfo.marginLeft === 'auto' ? '✓' : '✗';
                console.log(`${status} ${selector}: left=${elementInfo.left}px, margin-left=${elementInfo.marginLeft}`);
            }
        }

        console.log('\n\nKeeping browser open for manual inspection...');
        console.log('Press Ctrl+C to close\n');

        // Keep browser open
        await new Promise(resolve => {
            process.on('SIGINT', () => {
                console.log('\nClosing browser...');
                resolve();
            });
        });

    } catch (error) {
        console.error('Error during testing:', error);
    } finally {
        await browser.close();
        server.kill();
        process.exit(0);
    }
}

testAlignment().catch(console.error);