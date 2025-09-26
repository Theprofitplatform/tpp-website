const { chromium } = require('playwright');
const path = require('path');

async function debugContainer() {
  console.log('🔍 Debugging Container Layout...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    const indexPath = 'file://' + path.resolve(__dirname, 'website/index.html');
    await page.goto(indexPath, { waitUntil: 'networkidle' });

    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Debug all container elements
    const debug = await page.evaluate(() => {
      const elements = {
        premiumNav: document.querySelector('.premium-nav'),
        navFloatingContainer: document.querySelector('.nav-floating-container'),
        container: document.querySelector('.nav-floating-container .container'),
        logo: document.querySelector('.premium-logo'),
        menuToggle: document.getElementById('menuToggle')
      };

      const result = {};

      Object.keys(elements).forEach(key => {
        const el = elements[key];
        if (el) {
          const rect = el.getBoundingClientRect();
          const styles = window.getComputedStyle(el);
          result[key] = {
            rect: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height
            },
            styles: {
              position: styles.position,
              left: styles.left,
              right: styles.right,
              top: styles.top,
              width: styles.width,
              maxWidth: styles.maxWidth,
              transform: styles.transform,
              display: styles.display,
              justifyContent: styles.justifyContent
            }
          };
        } else {
          result[key] = 'NOT FOUND';
        }
      });

      return result;
    });

    console.log('📊 Container Debug Info:');
    Object.keys(debug).forEach(key => {
      console.log(`\n${key.toUpperCase()}:`);
      if (debug[key] === 'NOT FOUND') {
        console.log('  NOT FOUND');
      } else {
        console.log('  Position:', debug[key].rect);
        console.log('  Key Styles:', debug[key].styles);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }

  await browser.close();
}

debugContainer();