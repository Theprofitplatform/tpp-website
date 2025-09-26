const { chromium } = require('playwright');
const path = require('path');

async function finalNavigationTest() {
  console.log('🏁 Final Navigation Test...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    const indexPath = 'file://' + path.resolve(__dirname, 'website/index.html');
    await page.goto(indexPath, { waitUntil: 'networkidle' });

    console.log('✅ DESKTOP NAVIGATION TEST');
    console.log('============================');

    // Desktop test
    await page.setViewportSize({ width: 1280, height: 720 });

    const desktopElements = await page.evaluate(() => {
      return {
        premiumNav: !!document.querySelector('.premium-nav'),
        navLinks: document.querySelectorAll('.premium-nav-links a').length,
        ctaButton: !!document.querySelector('.premium-cta-btn'),
        menuToggleHidden: window.getComputedStyle(document.getElementById('menuToggle')).display === 'none'
      };
    });

    console.log(`🖥️  Premium navigation: ${desktopElements.premiumNav ? '✅' : '❌'}`);
    console.log(`🔗 Navigation links: ${desktopElements.navLinks} ${desktopElements.navLinks >= 5 ? '✅' : '❌'}`);
    console.log(`🎯 CTA button: ${desktopElements.ctaButton ? '✅' : '❌'}`);
    console.log(`🍔 Menu toggle hidden: ${desktopElements.menuToggleHidden ? '✅' : '❌'}`);

    // Take desktop screenshot
    await page.screenshot({
      path: 'final-test-desktop.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 150 }
    });

    console.log('\n✅ MOBILE NAVIGATION TEST');
    console.log('===========================');

    // Mobile test
    await page.setViewportSize({ width: 375, height: 667 });

    const mobileElements = await page.evaluate(() => {
      const menuToggle = document.getElementById('menuToggle');
      const navLinks = document.querySelector('.premium-nav-links');

      return {
        menuToggleVisible: menuToggle && window.getComputedStyle(menuToggle).display === 'flex',
        menuTogglePosition: menuToggle ? menuToggle.getBoundingClientRect() : null,
        navLinksHidden: navLinks && window.getComputedStyle(navLinks).display === 'none',
        mobileNav: !!document.getElementById('mobileNav'),
        mobileOverlay: !!document.getElementById('mobileNavOverlay')
      };
    });

    console.log(`📱 Menu toggle visible: ${mobileElements.menuToggleVisible ? '✅' : '❌'}`);
    console.log(`📍 Menu toggle position: x=${mobileElements.menuTogglePosition?.x.toFixed(0)}, within viewport: ${mobileElements.menuTogglePosition?.x < 375 ? '✅' : '❌'}`);
    console.log(`🔗 Nav links hidden: ${mobileElements.navLinksHidden ? '✅' : '❌'}`);
    console.log(`📱 Mobile nav exists: ${mobileElements.mobileNav ? '✅' : '❌'}`);
    console.log(`🎭 Mobile overlay exists: ${mobileElements.mobileOverlay ? '✅' : '❌'}`);

    // Test mobile menu interaction
    console.log('\n🔄 MOBILE MENU INTERACTION TEST');
    console.log('================================');

    try {
      // Click to open menu
      await page.locator('#menuToggle').click();
      await page.waitForTimeout(500);

      const menuOpenState = await page.evaluate(() => {
        return {
          mobileNavActive: document.getElementById('mobileNav')?.classList.contains('active'),
          overlayActive: document.getElementById('mobileNavOverlay')?.classList.contains('active'),
          toggleActive: document.getElementById('menuToggle')?.classList.contains('active')
        };
      });

      console.log(`📱 Mobile menu opened: ${menuOpenState.mobileNavActive ? '✅' : '❌'}`);
      console.log(`🎭 Overlay active: ${menuOpenState.overlayActive ? '✅' : '❌'}`);
      console.log(`🍔 Toggle active: ${menuOpenState.toggleActive ? '✅' : '❌'}`);

      // Take screenshot with menu open
      await page.screenshot({
        path: 'final-test-mobile-open.png',
        fullPage: true
      });

      // Test close button
      await page.locator('#mobileNavClose').click();
      await page.waitForTimeout(500);

      const menuClosedState = await page.evaluate(() => {
        return {
          mobileNavActive: document.getElementById('mobileNav')?.classList.contains('active'),
          overlayActive: document.getElementById('mobileNavOverlay')?.classList.contains('active')
        };
      });

      console.log(`❌ Mobile menu closed: ${!menuClosedState.mobileNavActive ? '✅' : '❌'}`);
      console.log(`❌ Overlay closed: ${!menuClosedState.overlayActive ? '✅' : '❌'}`);

    } catch (error) {
      console.log(`❌ Mobile interaction failed: ${error.message}`);
    }

    // Final validation
    console.log('\n🏆 FINAL VALIDATION');
    console.log('===================');

    const allTestsPassed =
      desktopElements.premiumNav &&
      desktopElements.navLinks >= 5 &&
      desktopElements.ctaButton &&
      desktopElements.menuToggleHidden &&
      mobileElements.menuToggleVisible &&
      mobileElements.menuTogglePosition?.x < 375 &&
      mobileElements.navLinksHidden &&
      mobileElements.mobileNav &&
      mobileElements.mobileOverlay;

    console.log(`🎉 All tests passed: ${allTestsPassed ? '✅ SUCCESS!' : '❌ SOME ISSUES REMAIN'}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }

  await browser.close();
  console.log('\n✅ Final navigation test complete!');
}

finalNavigationTest();