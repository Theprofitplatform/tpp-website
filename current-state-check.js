const { chromium } = require('playwright');
const path = require('path');

async function checkCurrentState() {
  console.log('🔍 Checking Current Navigation State...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    const indexPath = 'file://' + path.resolve(__dirname, 'website/index.html');
    await page.goto(indexPath, { waitUntil: 'networkidle' });

    // Take full page screenshot desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.screenshot({
      path: 'current-desktop-fullpage.png',
      fullPage: true
    });
    console.log('📷 Desktop full page: current-desktop-fullpage.png');

    // Take navigation area screenshot
    await page.screenshot({
      path: 'current-desktop-nav.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 150 }
    });
    console.log('📷 Desktop nav area: current-desktop-nav.png');

    // Mobile screenshots
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({
      path: 'current-mobile-closed.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 375, height: 200 }
    });
    console.log('📷 Mobile nav closed: current-mobile-closed.png');

    // Check what elements are actually present
    const navCheck = await page.evaluate(() => {
      const checks = {
        hasBasicHeader: !!document.querySelector('header'),
        hasBasicNav: !!document.querySelector('nav'),
        hasPremiumNav: !!document.querySelector('.premium-nav'),
        hasNavFloating: !!document.querySelector('.nav-floating-container'),
        hasNavLinks: !!document.querySelector('.nav-links'),
        hasPremiumNavLinks: !!document.querySelector('.premium-nav-links'),
        hasMenuToggle: !!document.getElementById('menuToggle'),
        hasMobileNav: !!document.getElementById('mobileNav'),
        navHTML: document.querySelector('header')?.outerHTML?.substring(0, 500) + '...'
      };

      return checks;
    });

    console.log('\n📋 Navigation Elements Check:');
    Object.keys(navCheck).forEach(key => {
      if (key === 'navHTML') {
        console.log(`${key}: ${navCheck[key]}`);
      } else {
        console.log(`${key}: ${navCheck[key] ? '✅' : '❌'}`);
      }
    });

    // Check CSS loading
    const cssCheck = await page.evaluate(() => {
      const universalNavLink = document.querySelector('link[href*="universal-nav"]');
      return {
        universalNavLinkExists: !!universalNavLink,
        universalNavHref: universalNavLink?.href || 'Not found'
      };
    });

    console.log('\n🎨 CSS Loading Check:');
    console.log(`Universal nav CSS: ${cssCheck.universalNavLinkExists ? '✅' : '❌'}`);
    console.log(`CSS path: ${cssCheck.universalNavHref}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }

  await browser.close();
  console.log('\n✅ Current state check complete!');
}

checkCurrentState();