const { chromium } = require('playwright');
const path = require('path');

async function testNavigationFix() {
  console.log('🧪 Testing Navigation Fix...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Load the updated index page
    const indexPath = 'file://' + path.resolve(__dirname, 'website/index.html');
    console.log(`📄 Loading: ${indexPath}`);

    await page.goto(indexPath, { waitUntil: 'networkidle' });

    // Take a screenshot of the fixed navigation
    await page.screenshot({
      path: 'navigation-fixed-desktop.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 200 }
    });
    console.log('📷 Desktop screenshot saved: navigation-fixed-desktop.png');

    // Check premium navigation structure
    const premiumNav = await page.locator('.premium-nav').count();
    console.log(`🎨 Premium navigation found: ${premiumNav}`);

    // Check floating container
    const floatingContainer = await page.locator('.nav-floating-container').count();
    console.log(`🏗️  Floating container found: ${floatingContainer}`);

    // Check logo
    const logo = await page.locator('.premium-logo').count();
    console.log(`🏷️  Premium logo found: ${logo}`);

    // Check nav links
    const navLinks = await page.locator('.premium-nav-links a').count();
    console.log(`🔗 Premium nav links found: ${navLinks}`);

    // Check hamburger menu
    const menuToggle = await page.locator('#menuToggle').count();
    console.log(`🍔 Menu toggle button found: ${menuToggle}`);

    // Check mobile menu structure
    const mobileNav = await page.locator('#mobileNav').count();
    console.log(`📱 Mobile nav found: ${mobileNav}`);

    const mobileOverlay = await page.locator('#mobileNavOverlay').count();
    console.log(`📱 Mobile overlay found: ${mobileOverlay}`);

    // Test desktop navigation styling
    const navStyles = await page.evaluate(() => {
      const nav = document.querySelector('.premium-nav');
      if (!nav) return 'No premium nav';

      const styles = window.getComputedStyle(nav);
      return {
        position: styles.position,
        top: styles.top,
        transform: styles.transform,
        zIndex: styles.zIndex
      };
    });

    console.log('🎨 Desktop nav styles:');
    console.log(JSON.stringify(navStyles, null, 2));

    // Test mobile functionality
    console.log('\n📱 Testing Mobile Navigation...');

    // Switch to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Take mobile screenshot
    await page.screenshot({
      path: 'navigation-fixed-mobile-closed.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 375, height: 200 }
    });
    console.log('📷 Mobile screenshot (closed) saved: navigation-fixed-mobile-closed.png');

    // Check menu toggle visibility on mobile
    const menuToggleVisible = await page.evaluate(() => {
      const toggle = document.getElementById('menuToggle');
      if (!toggle) return false;

      const styles = window.getComputedStyle(toggle);
      return styles.display !== 'none' && styles.visibility !== 'hidden';
    });
    console.log(`🍔 Menu toggle visible on mobile: ${menuToggleVisible}`);

    // Test clicking the hamburger menu
    const menuToggleElement = page.locator('#menuToggle');
    if (await menuToggleElement.count() > 0) {
      console.log('🔄 Testing mobile menu interaction...');

      // Click to open menu
      await menuToggleElement.click();
      await page.waitForTimeout(500); // Wait for animation

      // Take screenshot with menu open
      await page.screenshot({
        path: 'navigation-fixed-mobile-open.png',
        fullPage: true
      });
      console.log('📷 Mobile screenshot (open) saved: navigation-fixed-mobile-open.png');

      // Check if mobile menu is visible
      const mobileMenuVisible = await page.evaluate(() => {
        const mobileNav = document.getElementById('mobileNav');
        const overlay = document.getElementById('mobileNavOverlay');

        return {
          mobileNavActive: mobileNav && mobileNav.classList.contains('active'),
          overlayActive: overlay && overlay.classList.contains('active'),
          toggleActive: document.getElementById('menuToggle').classList.contains('active')
        };
      });

      console.log('📱 Mobile menu state after click:');
      console.log(JSON.stringify(mobileMenuVisible, null, 2));

      // Test close button
      const closeButton = page.locator('#mobileNavClose');
      if (await closeButton.count() > 0) {
        await closeButton.click();
        await page.waitForTimeout(500);

        const menuClosedState = await page.evaluate(() => {
          const mobileNav = document.getElementById('mobileNav');
          return {
            mobileNavActive: mobileNav && mobileNav.classList.contains('active')
          };
        });
        console.log(`✅ Menu closed successfully: ${!menuClosedState.mobileNavActive}`);
      }
    }

    // Test navigation dropdown (desktop)
    console.log('\n🎯 Testing Services Dropdown...');

    await page.setViewportSize({ width: 1280, height: 720 });

    const servicesDropdown = page.locator('[aria-controls="services-dropdown"]');
    if (await servicesDropdown.count() > 0) {
      await servicesDropdown.hover();
      await page.waitForTimeout(300);

      const dropdownVisible = await page.evaluate(() => {
        const dropdown = document.getElementById('services-dropdown');
        if (!dropdown) return false;

        const styles = window.getComputedStyle(dropdown);
        return styles.opacity !== '0' && styles.visibility !== 'hidden';
      });

      console.log(`📋 Services dropdown visible on hover: ${dropdownVisible}`);
    }

    // Final validation
    console.log('\n✅ Navigation Fix Validation:');
    console.log(`- Premium navigation structure: ${premiumNav > 0 ? '✅' : '❌'}`);
    console.log(`- Mobile menu toggle: ${menuToggle > 0 ? '✅' : '❌'}`);
    console.log(`- Mobile menu functionality: ${menuToggleVisible ? '✅' : '❌'}`);
    console.log(`- Desktop navigation styling: ${navStyles.position === 'fixed' ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }

  await browser.close();
  console.log('✅ Navigation testing complete!');
}

testNavigationFix();