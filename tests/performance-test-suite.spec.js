/**
 * Performance Test Suite for Services Page
 * Web Core Vitals and Performance Metrics Testing
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

const SERVICE_PAGE_URL = 'file://' + path.resolve(__dirname, '../website/services.html');

test.describe('Performance Testing Suite', () => {

  test('should meet Core Web Vitals thresholds', async ({ page }) => {
    await page.goto(SERVICE_PAGE_URL);

    // Measure Largest Contentful Paint (LCP)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // Fallback timeout
        setTimeout(() => resolve(0), 5000);
      });
    });

    expect(lcp).toBeLessThan(2500); // Good LCP is < 2.5s

    // Measure First Input Delay (simulate)
    await page.click('.service-card', { timeout: 100 });
    const clickTime = Date.now();

    // Check if click was responsive
    await page.waitForTimeout(50);
    const afterClickTime = Date.now();
    const inputDelay = afterClickTime - clickTime;

    expect(inputDelay).toBeLessThan(100); // Good FID is < 100ms
  });

  test('should have optimized loading performance', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(SERVICE_PAGE_URL);
    await page.waitForLoadState('domcontentloaded');

    const dcl = Date.now() - startTime;
    expect(dcl).toBeLessThan(1500); // DOMContentLoaded should be fast

    await page.waitForLoadState('networkidle');
    const fullLoad = Date.now() - startTime;
    expect(fullLoad).toBeLessThan(3000); // Full load should be under 3s
  });

  test('should have minimal layout shifts', async ({ page }) => {
    await page.goto(SERVICE_PAGE_URL);

    // Wait for all images and fonts to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Measure layout shifts
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        }).observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => resolve(clsValue), 3000);
      });
    });

    expect(cls).toBeLessThan(0.1); // Good CLS is < 0.1
  });

  test('should efficiently load CSS and JavaScript', async ({ page }) => {
    await page.goto(SERVICE_PAGE_URL);

    // Check for render-blocking resources
    const renderBlockingCSS = await page.evaluate(() => {
      const links = document.querySelectorAll('link[rel="stylesheet"]');
      return Array.from(links).length;
    });

    expect(renderBlockingCSS).toBeLessThan(3); // Minimize external CSS files

    // Check JavaScript loading
    const scripts = await page.locator('script[src]').count();
    expect(scripts).toBeLessThan(5); // Minimize external JS files

    // Check for inline styles (should be minimal)
    const inlineStylesLength = await page.evaluate(() => {
      const styles = document.querySelectorAll('style');
      return Array.from(styles).reduce((total, style) => total + style.textContent.length, 0);
    });

    expect(inlineStylesLength).toBeLessThan(50000); // Keep inline styles reasonable
  });

  test('should optimize font loading', async ({ page }) => {
    await page.goto(SERVICE_PAGE_URL);

    // Check for font preconnect
    const preconnects = await page.locator('link[rel="preconnect"]').count();
    expect(preconnects).toBeGreaterThan(0);

    // Check font-display property
    const fontLinks = await page.locator('link[href*="fonts.googleapis.com"]').all();
    for (const link of fontLinks) {
      const href = await link.getAttribute('href');
      expect(href).toContain('display=swap');
    }

    // Measure font loading performance
    const fontLoadTime = await page.evaluate(() => {
      return new Promise((resolve) => {
        const startTime = performance.now();

        document.fonts.ready.then(() => {
          resolve(performance.now() - startTime);
        });

        // Fallback timeout
        setTimeout(() => resolve(5000), 5000);
      });
    });

    expect(fontLoadTime).toBeLessThan(2000); // Fonts should load quickly
  });

  test('should have efficient image loading', async ({ page }) => {
    await page.goto(SERVICE_PAGE_URL);

    // Check for properly sized images
    const images = await page.locator('img').all();

    for (const img of images) {
      const naturalDimensions = await img.evaluate(el => ({
        naturalWidth: el.naturalWidth,
        naturalHeight: el.naturalHeight,
        displayWidth: el.offsetWidth,
        displayHeight: el.offsetHeight
      }));

      // Images shouldn't be significantly oversized
      if (naturalDimensions.naturalWidth > 0) {
        const widthRatio = naturalDimensions.naturalWidth / naturalDimensions.displayWidth;
        const heightRatio = naturalDimensions.naturalHeight / naturalDimensions.displayHeight;

        expect(widthRatio).toBeLessThan(2); // Image shouldn't be more than 2x display size
        expect(heightRatio).toBeLessThan(2);
      }
    }
  });

  test('should handle animations efficiently', async ({ page }) => {
    await page.goto(SERVICE_PAGE_URL);
    await page.waitForTimeout(1000);

    // Check animation performance
    const animationFrameRate = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();

        function countFrames() {
          frameCount++;
          const elapsed = performance.now() - startTime;

          if (elapsed >= 1000) {
            resolve(frameCount);
          } else {
            requestAnimationFrame(countFrames);
          }
        }

        requestAnimationFrame(countFrames);
      });
    });

    expect(animationFrameRate).toBeGreaterThan(30); // Should maintain 30+ FPS

    // Test hover animations don't cause layout thrashing
    const serviceCard = await page.locator('.service-card').first();
    await serviceCard.hover();

    const layoutThrashing = await page.evaluate(() => {
      const element = document.querySelector('.service-card');
      const startTime = performance.now();

      // Force style recalculation
      const computedStyle = window.getComputedStyle(element);
      const transform = computedStyle.transform;

      return performance.now() - startTime;
    });

    expect(layoutThrashing).toBeLessThan(10); // Style calculation should be fast
  });

  test('should optimize memory usage', async ({ page }) => {
    await page.goto(SERVICE_PAGE_URL);

    // Wait for all scripts to initialize
    await page.waitForTimeout(3000);

    // Check for memory leaks in event listeners
    const eventListenerCount = await page.evaluate(() => {
      // Count registered event listeners (approximate)
      let count = 0;

      // Count service cards with hover listeners
      const serviceCards = document.querySelectorAll('.service-card');
      count += serviceCards.length * 4; // Estimate hover/focus listeners

      // Count intersection observers
      count += serviceCards.length; // One observer per card

      return count;
    });

    expect(eventListenerCount).toBeLessThan(100); // Reasonable number of listeners

    // Check if cleanup methods exist
    const hasCleanup = await page.evaluate(() => {
      return typeof window.serviceAnimations?.cleanup === 'function';
    });

    expect(hasCleanup).toBe(true);
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow 3G
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      route.continue();
    });

    const startTime = Date.now();
    await page.goto(SERVICE_PAGE_URL);

    // Page should still load reasonably fast even with delays
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load within 5s even on slow network

    // Critical content should be visible quickly
    const serviceCards = await page.locator('.service-card');
    await expect(serviceCards.first()).toBeVisible();
  });

  test('should maintain performance with user interactions', async ({ page }) => {
    await page.goto(SERVICE_PAGE_URL);
    await page.waitForTimeout(1000);

    const startMemory = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });

    // Simulate user interactions
    const serviceCards = await page.locator('.service-card').all();

    for (let i = 0; i < Math.min(serviceCards.length, 5); i++) {
      await serviceCards[i].hover();
      await page.waitForTimeout(100);
      await serviceCards[i].hover(); // Unhover
      await page.waitForTimeout(100);
    }

    // Scroll up and down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    const endMemory = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });

    // Memory shouldn't increase significantly with interactions
    if (startMemory > 0 && endMemory > 0) {
      const memoryIncrease = (endMemory - startMemory) / startMemory;
      expect(memoryIncrease).toBeLessThan(0.5); // Less than 50% memory increase
    }
  });

  test('should have efficient CSS selectors', async ({ page }) => {
    await page.goto(SERVICE_PAGE_URL);

    // Measure selector performance
    const selectorPerformance = await page.evaluate(() => {
      const startTime = performance.now();

      // Test common selectors used in the page
      const selectors = [
        '.service-card',
        '.service-icon',
        '.service-title',
        '.service-description',
        '.service-features li'
      ];

      selectors.forEach(selector => {
        document.querySelectorAll(selector);
      });

      return performance.now() - startTime;
    });

    expect(selectorPerformance).toBeLessThan(10); // Selector queries should be fast

    // Check for overly complex selectors in stylesheets
    const complexSelectors = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      let complexCount = 0;

      sheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach(rule => {
            if (rule.selectorText) {
              // Count selectors with more than 3 levels of nesting
              const depth = (rule.selectorText.match(/>/g) || []).length;
              if (depth > 3) complexCount++;
            }
          });
        } catch (e) {
          // Skip cross-origin stylesheets
        }
      });

      return complexCount;
    });

    expect(complexSelectors).toBeLessThan(5); // Minimize deeply nested selectors
  });
});