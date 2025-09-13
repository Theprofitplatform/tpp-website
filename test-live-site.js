const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Testing https://theprofitplatform.com.au/...\n');
  
  // Go to the live site
  await page.goto('https://theprofitplatform.com.au/', { waitUntil: 'networkidle' });
  
  // Check the actual CSS files being loaded
  const cssLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    return links.map(link => ({
      href: link.href,
      media: link.media
    }));
  });
  
  console.log('CSS Files loaded:');
  cssLinks.forEach(link => console.log(`  - ${link.href}`));
  
  // Check if trust signals bar exists and get its computed styles
  const trustBarStyles = await page.evaluate(() => {
    const trustBar = document.querySelector('.trust-signals-bar');
    if (!trustBar) return 'Trust signals bar NOT FOUND';
    
    const styles = window.getComputedStyle(trustBar);
    return {
      background: styles.background,
      padding: styles.padding,
      display: trustBar.style.display || 'visible'
    };
  });
  
  console.log('\nTrust Signals Bar Styles:');
  console.log(trustBarStyles);
  
  // Check trust signal items
  const trustItems = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.trust-signal-item'));
    return items.map(item => {
      const text = item.querySelector('.trust-text');
      const icon = item.querySelector('.trust-icon');
      const styles = window.getComputedStyle(item);
      return {
        text: text ? text.textContent.trim() : 'No text',
        hasIcon: !!icon,
        display: styles.display,
        flexDirection: styles.flexDirection
      };
    });
  });
  
  console.log('\nTrust Signal Items Found:', trustItems.length);
  trustItems.forEach((item, i) => {
    console.log(`  Item ${i + 1}: ${item.text}`);
    console.log(`    Display: ${item.display}, Direction: ${item.flexDirection}`);
  });
  
  // Check blue separator bar
  const blueSeparator = await page.evaluate(() => {
    const separator = document.querySelector('.blue-separator-bar');
    if (!separator) return 'Blue separator bar NOT FOUND';
    
    const styles = window.getComputedStyle(separator);
    const text = separator.querySelector('.separator-text');
    return {
      exists: true,
      background: styles.background,
      padding: styles.padding,
      text: text ? text.textContent.trim() : 'No text'
    };
  });
  
  console.log('\nBlue Separator Bar:');
  console.log(blueSeparator);
  
  // Take a screenshot
  await page.screenshot({ path: 'live-site-screenshot.png', fullPage: false });
  console.log('\nScreenshot saved as live-site-screenshot.png');
  
  // Check actual HTML source
  const htmlSource = await page.content();
  const hasLocalCSS = htmlSource.includes('css/style.css');
  const hasCloudCSS = htmlSource.includes('storage.googleapis.com');
  
  console.log('\nHTML Analysis:');
  console.log(`  Uses local CSS (css/style.css): ${hasLocalCSS}`);
  console.log(`  Uses cloud/CDN CSS: ${hasCloudCSS}`);
  
  await browser.close();
})();