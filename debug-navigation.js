const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function debugNavigation() {
  console.log('🔍 Debugging Navigation Bar...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Load the index page
    const indexPath = 'file://' + path.resolve(__dirname, 'website/index.html');
    console.log(`📄 Loading: ${indexPath}`);

    await page.goto(indexPath, { waitUntil: 'networkidle' });

    // Take a screenshot of the current state
    await page.screenshot({
      path: 'navigation-current.png',
      fullPage: true
    });
    console.log('📷 Screenshot saved: navigation-current.png');

    // Check navigation structure
    const navExists = await page.locator('nav').count();
    console.log(`🧭 Navigation elements found: ${navExists}`);

    // Get nav HTML structure
    const navHTML = await page.locator('nav').innerHTML().catch(() => 'Not found');
    console.log('📋 Navigation HTML structure:');
    console.log(navHTML);

    // Check if nav links are visible
    const navLinks = await page.locator('.nav-links').count();
    console.log(`🔗 Nav links container found: ${navLinks}`);

    // Check individual links
    const links = await page.locator('.nav-links a').count();
    console.log(`📌 Individual nav links found: ${links}`);

    // Check nav-cta button
    const ctaButton = await page.locator('.nav-cta').count();
    console.log(`🎯 CTA button found: ${ctaButton}`);

    // Check CSS loading
    const cssLoaded = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      if (!nav) return 'No nav element';

      const styles = window.getComputedStyle(nav);
      return {
        display: styles.display,
        justifyContent: styles.justifyContent,
        alignItems: styles.alignItems,
        backgroundColor: styles.backgroundColor,
        padding: styles.padding
      };
    });

    console.log('🎨 Navigation CSS properties:');
    console.log(JSON.stringify(cssLoaded, null, 2));

    // Check viewport size
    const viewport = page.viewportSize();
    console.log(`📱 Viewport: ${viewport.width}x${viewport.height}`);

    // Check for mobile menu elements
    const mobileMenu = await page.locator('.mobile-menu, .hamburger, .menu-toggle').count();
    console.log(`📱 Mobile menu elements found: ${mobileMenu}`);

    // Check if navigation is responsive
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({
      path: 'navigation-mobile.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 768, height: 200 }
    });
    console.log('📷 Mobile screenshot saved: navigation-mobile.png');

    const mobileNavDisplay = await page.evaluate(() => {
      const navLinks = document.querySelector('.nav-links');
      if (!navLinks) return 'No nav-links element';

      const styles = window.getComputedStyle(navLinks);
      return {
        display: styles.display,
        visibility: styles.visibility
      };
    });

    console.log('📱 Mobile nav-links CSS:');
    console.log(JSON.stringify(mobileNavDisplay, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  }

  await browser.close();
  console.log('✅ Navigation debugging complete!');
}

debugNavigation();