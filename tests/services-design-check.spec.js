const { test, expect } = require('@playwright/test');

test.describe('Services Page Design Check', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('file:///mnt/c/Users/abhis/projects/tpp/services.html');
  });

  test('should check visual hierarchy and layout', async ({ page }) => {
    // Check viewport size
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Take a screenshot for visual inspection
    await page.screenshot({ path: 'tests/screenshots/services-desktop.png', fullPage: true });

    // Check mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'tests/screenshots/services-mobile.png', fullPage: true });

    // Check for common design issues

    // Check if header is visible
    const header = await page.locator('header').first();
    await expect(header).toBeVisible();

    // Check for hero section
    const heroSection = await page.locator('[class*="hero"], [id*="hero"], section').first();
    if (await heroSection.count() > 0) {
      await expect(heroSection).toBeVisible();
    }

    // Check for service cards/sections
    const serviceCards = await page.locator('[class*="service"], [class*="card"]').count();
    console.log(`Found ${serviceCards} service cards/sections`);

    // Check for proper text contrast
    const headings = await page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    console.log(`Found ${headingCount} headings`);

    // Check for broken images
    const images = await page.locator('img');
    const imageCount = await images.count();
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      const isVisible = await img.isVisible();
      const naturalWidth = await img.evaluate((el) => el.naturalWidth);
      if (isVisible && naturalWidth === 0) {
        console.log(`Broken image found: ${src}`);
      }
    }

    // Check for overlapping elements
    const sections = await page.locator('section, div[class*="container"], div[class*="section"]');
    const sectionCount = await sections.count();
    console.log(`Found ${sectionCount} sections`);

    // Check for CTA buttons
    const ctaButtons = await page.locator('a[class*="btn"], button[class*="btn"], a[class*="button"], button[class*="button"]');
    const ctaCount = await ctaButtons.count();
    console.log(`Found ${ctaCount} CTA buttons`);

    // Check for responsive design issues
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'tests/screenshots/services-tablet.png', fullPage: true });

    // Check for horizontal scroll (indicates overflow)
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    if (hasHorizontalScroll) {
      console.log('WARNING: Page has horizontal scroll - possible overflow issue');
    }

    // Check for font loading
    const fonts = await page.evaluate(() => {
      return Array.from(document.fonts).map(font => ({
        family: font.family,
        status: font.status
      }));
    });
    console.log('Fonts loaded:', fonts);

    // Check for z-index issues
    const elementsWithHighZIndex = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const highZIndexElements = [];
      elements.forEach(el => {
        const zIndex = window.getComputedStyle(el).zIndex;
        if (zIndex !== 'auto' && parseInt(zIndex) > 100) {
          highZIndexElements.push({
            selector: el.className || el.id || el.tagName,
            zIndex: zIndex
          });
        }
      });
      return highZIndexElements;
    });

    if (elementsWithHighZIndex.length > 0) {
      console.log('Elements with high z-index:', elementsWithHighZIndex);
    }

    // Check for missing alt text on images
    const imagesWithoutAlt = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      const missing = [];
      imgs.forEach(img => {
        if (!img.alt || img.alt.trim() === '') {
          missing.push(img.src);
        }
      });
      return missing;
    });

    if (imagesWithoutAlt.length > 0) {
      console.log('Images without alt text:', imagesWithoutAlt);
    }
  });

  test('should check CSS and styling issues', async ({ page }) => {
    // Check if CSS files are loaded
    const cssFiles = await page.evaluate(() => {
      const links = document.querySelectorAll('link[rel="stylesheet"]');
      return Array.from(links).map(link => link.href);
    });
    console.log('CSS files loaded:', cssFiles);

    // Check for inline styles (which might override CSS)
    const elementsWithInlineStyles = await page.evaluate(() => {
      const elements = document.querySelectorAll('[style]');
      return elements.length;
    });
    console.log(`Found ${elementsWithInlineStyles} elements with inline styles`);

    // Check color scheme
    const colors = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const colorSet = new Set();
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        if (styles.color) colorSet.add(styles.color);
        if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          colorSet.add(styles.backgroundColor);
        }
      });
      return Array.from(colorSet);
    });
    console.log('Colors used on page:', colors.slice(0, 10)); // Show first 10 colors

    // Check for common layout issues
    const layoutIssues = await page.evaluate(() => {
      const issues = [];

      // Check for elements that might be too wide
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width > window.innerWidth) {
          issues.push({
            type: 'overflow',
            element: el.className || el.id || el.tagName,
            width: rect.width
          });
        }
      });

      return issues;
    });

    if (layoutIssues.length > 0) {
      console.log('Layout issues found:', layoutIssues);
    }
  });

  test('should check page performance metrics', async ({ page }) => {
    // Measure page load time
    const metrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        domInteractive: perfData.domInteractive,
        domComplete: perfData.domComplete
      };
    });
    console.log('Performance metrics:', metrics);

    // Check page size
    const pageSize = await page.evaluate(() => {
      return document.documentElement.outerHTML.length;
    });
    console.log(`Page HTML size: ${(pageSize / 1024).toFixed(2)} KB`);
  });
});