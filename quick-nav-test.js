const { chromium } = require('playwright');
const path = require('path');

async function quickNavTest() {
  console.log('🔧 Quick Navigation Test...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    const indexPath = 'file://' + path.resolve(__dirname, 'website/index.html');
    await page.goto(indexPath, { waitUntil: 'networkidle' });

    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if elements exist
    const elements = await page.evaluate(() => {
      return {
        menuToggle: !!document.getElementById('menuToggle'),
        mobileNav: !!document.getElementById('mobileNav'),
        mobileNavOverlay: !!document.getElementById('mobileNavOverlay'),
        menuToggleRect: document.getElementById('menuToggle')?.getBoundingClientRect(),
        menuToggleStyles: window.getComputedStyle(document.getElementById('menuToggle') || document.body)
      };
    });

    console.log('📱 Mobile Elements Check:');
    console.log('Menu toggle exists:', elements.menuToggle);
    console.log('Mobile nav exists:', elements.mobileNav);
    console.log('Mobile overlay exists:', elements.mobileNavOverlay);
    console.log('Menu toggle position:', elements.menuToggleRect);
    console.log('Menu toggle display:', elements.menuToggleStyles.display);

    // Try clicking with force
    if (elements.menuToggle) {
      try {
        await page.locator('#menuToggle').click({ force: true, timeout: 5000 });
        console.log('✅ Menu toggle clicked successfully!');

        // Check mobile menu state
        const menuState = await page.evaluate(() => {
          const mobileNav = document.getElementById('mobileNav');
          const overlay = document.getElementById('mobileNavOverlay');
          return {
            mobileNavActive: mobileNav?.classList.contains('active'),
            overlayActive: overlay?.classList.contains('active')
          };
        });

        console.log('📱 Menu state after click:', menuState);

        // Take screenshot
        await page.screenshot({ path: 'quick-test-mobile-menu.png', fullPage: true });
        console.log('📷 Screenshot saved: quick-test-mobile-menu.png');

      } catch (error) {
        console.log('❌ Click failed:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }

  await browser.close();
}

quickNavTest();