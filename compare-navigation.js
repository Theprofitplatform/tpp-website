const { chromium } = require('playwright');
const path = require('path');

async function compareNavigation() {
  console.log('🔍 Comparing Navigation Between Pages...');

  const browser = await chromium.launch();

  try {
    // Test index.html
    const page1 = await browser.newPage();
    const indexPath = 'file://' + path.resolve(__dirname, 'website/index.html');
    await page1.goto(indexPath, { waitUntil: 'networkidle' });
    await page1.setViewportSize({ width: 1280, height: 720 });

    // Test another page like services.html
    const page2 = await browser.newPage();
    const servicesPath = 'file://' + path.resolve(__dirname, 'website/services.html');
    await page2.goto(servicesPath, { waitUntil: 'networkidle' });
    await page2.setViewportSize({ width: 1280, height: 720 });

    // Take side-by-side screenshots
    await page1.screenshot({
      path: 'index-nav.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 200 }
    });

    await page2.screenshot({
      path: 'services-nav.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 200 }
    });

    console.log('📷 Screenshots taken: index-nav.png & services-nav.png');

    // Compare navigation HTML structure
    const indexNav = await page1.evaluate(() => {
      const header = document.querySelector('header');
      return {
        hasHeader: !!header,
        headerClass: header?.className || 'none',
        navStructure: header?.querySelector('nav')?.outerHTML?.substring(0, 300) || 'none',
        stylesApplied: {
          position: header ? window.getComputedStyle(header).position : 'none',
          display: header ? window.getComputedStyle(header).display : 'none',
          top: header ? window.getComputedStyle(header).top : 'none',
          transform: header ? window.getComputedStyle(header).transform : 'none'
        }
      };
    });

    const servicesNav = await page2.evaluate(() => {
      const header = document.querySelector('header');
      return {
        hasHeader: !!header,
        headerClass: header?.className || 'none',
        navStructure: header?.querySelector('nav')?.outerHTML?.substring(0, 300) || 'none',
        stylesApplied: {
          position: header ? window.getComputedStyle(header).position : 'none',
          display: header ? window.getComputedStyle(header).display : 'none',
          top: header ? window.getComputedStyle(header).top : 'none',
          transform: header ? window.getComputedStyle(header).transform : 'none'
        }
      };
    });

    console.log('\n📊 INDEX.HTML NAVIGATION:');
    console.log('Header class:', indexNav.headerClass);
    console.log('Position:', indexNav.stylesApplied.position);
    console.log('Display:', indexNav.stylesApplied.display);
    console.log('Top:', indexNav.stylesApplied.top);
    console.log('Transform:', indexNav.stylesApplied.transform);

    console.log('\n📊 SERVICES.HTML NAVIGATION:');
    console.log('Header class:', servicesNav.headerClass);
    console.log('Position:', servicesNav.stylesApplied.position);
    console.log('Display:', servicesNav.stylesApplied.display);
    console.log('Top:', servicesNav.stylesApplied.top);
    console.log('Transform:', servicesNav.stylesApplied.transform);

    // Test mobile behavior
    console.log('\n📱 MOBILE COMPARISON:');

    await page1.setViewportSize({ width: 375, height: 667 });
    await page2.setViewportSize({ width: 375, height: 667 });

    const indexMobile = await page1.evaluate(() => {
      const toggle = document.getElementById('menuToggle');
      const navLinks = document.querySelector('.nav-links');
      return {
        toggleVisible: toggle ? window.getComputedStyle(toggle).display : 'none',
        togglePosition: toggle ? toggle.getBoundingClientRect() : null,
        navLinksDisplay: navLinks ? window.getComputedStyle(navLinks).display : 'none'
      };
    });

    const servicesMobile = await page2.evaluate(() => {
      const toggle = document.getElementById('menuToggle');
      const navLinks = document.querySelector('.nav-links');
      return {
        toggleVisible: toggle ? window.getComputedStyle(toggle).display : 'none',
        togglePosition: toggle ? toggle.getBoundingClientRect() : null,
        navLinksDisplay: navLinks ? window.getComputedStyle(navLinks).display : 'none'
      };
    });

    console.log('INDEX mobile toggle:', indexMobile.toggleVisible, indexMobile.togglePosition?.x);
    console.log('SERVICES mobile toggle:', servicesMobile.toggleVisible, servicesMobile.togglePosition?.x);

    await page1.close();
    await page2.close();

  } catch (error) {
    console.error('❌ Error:', error);
  }

  await browser.close();
  console.log('\n✅ Navigation comparison complete!');
}

compareNavigation();