#!/usr/bin/env node

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function captureNavigationScreenshots() {
    console.log('📸 CAPTURING NAVIGATION SCREENSHOTS');
    console.log('=====================================\n');

    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, '..', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir);
    }

    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // Pages to capture
    const pages = [
        'index.html',
        'about.html',
        'services.html',
        'blog/blog.html'
    ];

    for (const pagePath of pages) {
        try {
            const fullPath = `file://${path.join(__dirname, '..', pagePath)}`;
            console.log(`📷 Capturing ${pagePath}...`);

            await page.goto(fullPath, { waitUntil: 'networkidle' });

            // Wait for navigation to render
            await page.waitForTimeout(1000);

            // Capture full page screenshot
            const screenshotName = pagePath.replace(/\//g, '-').replace('.html', '');
            await page.screenshot({
                path: path.join(screenshotsDir, `${screenshotName}-full.png`),
                fullPage: true
            });

            // Capture just the navigation area
            const navElement = await page.$('header');
            if (navElement) {
                await navElement.screenshot({
                    path: path.join(screenshotsDir, `${screenshotName}-nav.png`)
                });
                console.log(`   ✅ Navigation screenshot saved`);
            } else {
                console.log(`   ⚠️  No navigation header found`);
            }

            // Capture mobile view
            await page.setViewportSize({ width: 375, height: 667 });
            await page.waitForTimeout(500);
            await page.screenshot({
                path: path.join(screenshotsDir, `${screenshotName}-mobile.png`),
                fullPage: false
            });
            console.log(`   ✅ Mobile view captured`);

            // Reset to desktop view
            await page.setViewportSize({ width: 1920, height: 1080 });

        } catch (error) {
            console.error(`   ❌ Error capturing ${pagePath}: ${error.message}`);
        }
    }

    await browser.close();

    console.log('\n=====================================');
    console.log('📁 Screenshots saved in: screenshots/');
    console.log('=====================================');
}

// Run the capture
captureNavigationScreenshots().catch(console.error);