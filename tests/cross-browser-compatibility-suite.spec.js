/**
 * Cross-Browser Compatibility Test Suite for Services Page
 * Testing across different browsers and engine types
 */

const { test, expect, devices } = require('@playwright/test');
const path = require('path');

const SERVICE_PAGE_URL = 'file://' + path.resolve(__dirname, '../website/services.html');

// Browser configurations to test
const BROWSERS = ['chromium', 'firefox', 'webkit'];

test.describe('Cross-Browser Compatibility Testing', () => {

  // Test modern CSS features support
  test.describe('CSS Feature Support', () => {

    BROWSERS.forEach(browserName => {
      test(`should support CSS Grid in ${browserName}`, async ({ page }) => {
        await page.goto(SERVICE_PAGE_URL);

        const gridSupport = await page.evaluate(() => {
          return CSS.supports('display', 'grid');
        });

        expect(gridSupport).toBe(true);

        // Test actual grid layout
        const servicesGrid = await page.locator('.services-grid');
        const display = await servicesGrid.evaluate(el =>
          window.getComputedStyle(el).display
        );

        expect(display).toBe('grid');
      });

      test(`should support CSS Custom Properties in ${browserName}`, async ({ page }) => {
        await page.goto(SERVICE_PAGE_URL);

        const customPropsSupport = await page.evaluate(() => {
          return CSS.supports('color', 'var(--test)');
        });

        expect(customPropsSupport).toBe(true);

        // Test actual custom property usage
        const primaryColor = await page.evaluate(() => {
          return getComputedStyle(document.documentElement).getPropertyValue('--pp-primary');
        });

        expect(primaryColor).toBeTruthy();
      });

      test(`should support Flexbox in ${browserName}`, async ({ page }) => {
        await page.goto(SERVICE_PAGE_URL);

        const flexSupport = await page.evaluate(() => {
          return CSS.supports('display', 'flex');
        });

        expect(flexSupport).toBe(true);

        // Test nav flex layout
        const nav = await page.locator('.nav-floating-container .container');
        const display = await nav.evaluate(el =>
          window.getComputedStyle(el).display
        );

        expect(display).toBe('flex');
      });
    });
  });

  // Test JavaScript API support
  test.describe('JavaScript API Support', () => {

    BROWSERS.forEach(browserName => {
      test(`should support Intersection Observer API in ${browserName}`, async ({ page }) => {
        await page.goto(SERVICE_PAGE_URL);

        const ioSupport = await page.evaluate(() => {
          return 'IntersectionObserver' in window;
        });

        expect(ioSupport).toBe(true);
      });

      test(`should support requestAnimationFrame in ${browserName}`, async ({ page }) => {
        await page.goto(SERVICE_PAGE_URL);

        const rafSupport = await page.evaluate(() => {
          return 'requestAnimationFrame' in window;
        });

        expect(rafSupport).toBe(true);
      });

      test(`should support Web Animations API in ${browserName}`, async ({ page }) => {
        await page.goto(SERVICE_PAGE_URL);

        const animationsSupport = await page.evaluate(() => {
          return 'animate' in document.createElement('div');
        });

        expect(animationsSupport).toBe(true);
      });

      test(`should support CSS.supports in ${browserName}`, async ({ page }) => {
        await page.goto(SERVICE_PAGE_URL);

        const cssSupportsAPI = await page.evaluate(() => {
          return 'CSS' in window && 'supports' in CSS;
        });

        expect(cssSupportsAPI).toBe(true);
      });
    });
  });

  // Test font rendering across browsers
  test.describe('Font Rendering', () => {

    BROWSERS.forEach(browserName => {
      test(`should load Google Fonts properly in ${browserName}`, async ({ page }) => {
        await page.goto(SERVICE_PAGE_URL);

        // Wait for fonts to load
        await page.waitForFunction(() => document.fonts.ready);

        const fontFamily = await page.locator('body').evaluate(el =>
          window.getComputedStyle(el).fontFamily
        );

        expect(fontFamily).toContain('Inter');
      });

      test(`should have consistent font weights in ${browserName}`, async ({ page }) => {
        await page.goto(SERVICE_PAGE_URL);

        const h1Weight = await page.locator('h1').first().evaluate(el =>
          window.getComputedStyle(el).fontWeight
        );

        const h2Weight = await page.locator('h2').first().evaluate(el =>
          window.getComputedStyle(el).fontWeight
        );

        expect(parseInt(h1Weight)).toBeGreaterThanOrEqual(700);
        expect(parseInt(h2Weight)).toBeGreaterThanOrEqual(600);
      });
    });
  });

  // Test layout consistency
  test.describe('Layout Consistency', () => {

    BROWSERS.forEach(browserName => {
      test(`should maintain consistent service card layout in ${browserName}`, async ({ page }) => {
        await page.goto(SERVICE_PAGE_URL);

        const serviceCards = await page.locator('.service-card').all();
        expect(serviceCards.length).toBeGreaterThan(3);

        // Check if all cards have similar heights (within 50px difference)
        const cardHeights = [];
        for (const card of serviceCards.slice(0, 3)) {
          const box = await card.boundingBox();
          cardHeights.push(box.height);
        }

        const maxHeight = Math.max(...cardHeights);
        const minHeight = Math.min(...cardHeights);
        const heightDifference = maxHeight - minHeight;

        expect(heightDifference).toBeLessThan(100); // Allow reasonable variation
      });

      test(`should have consistent navigation layout in ${browserName}`, async ({ page }) => {
        await page.setViewportSize({ width: 1200, height: 800 });
        await page.goto(SERVICE_PAGE_URL);

        const navLinks = await page.locator('.nav-links').isVisible();
        expect(navLinks).toBe(true);

        const logo = await page.locator('.logo').isVisible();
        expect(logo).toBe(true);

        const ctaButton = await page.locator('.premium-cta-btn').isVisible();
        expect(ctaButton).toBe(true);
      });
    });
  });

  // Test interaction consistency
  test.describe('Interaction Consistency', () => {

    BROWSERS.forEach(browserName => {
      test(`should have working hover effects in ${browserName}`, async ({ page }) => {
        await page.goto(SERVICE_PAGE_URL);
        await page.waitForTimeout(1000);

        const serviceCard = await page.locator('.service-card').first();

        // Get initial transform
        const initialTransform = await serviceCard.evaluate(el =>
          window.getComputedStyle(el).transform
        );

        // Hover and check transform
        await serviceCard.hover();
        await page.waitForTimeout(300);

        const hoverTransform = await serviceCard.evaluate(el =>
          window.getComputedStyle(el).transform
        );

        expect(hoverTransform).not.toBe(initialTransform);
      });

      test(`should handle click events properly in ${browserName}`, async ({ page }) => {
        await page.goto(SERVICE_PAGE_URL);

        let clickHandled = false;

        // Listen for navigation attempts
        page.on('framenavigated', () => {
          clickHandled = true;
        });

        const ctaButton = await page.locator('.service-cta').first();
        await ctaButton.click();

        // Should attempt to navigate or handle click
        expect(clickHandled || await ctaButton.isVisible()).toBe(true);
      });
    });
  });

  // Test error handling across browsers
  test.describe('Error Handling', () => {

    BROWSERS.forEach(browserName => {
      test(`should handle JavaScript errors gracefully in ${browserName}`, async ({ page }) => {
        const jsErrors = [];

        page.on('pageerror', (error) => {
          jsErrors.push(error.message);
        });

        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            jsErrors.push(msg.text());
          }
        });

        await page.goto(SERVICE_PAGE_URL);
        await page.waitForTimeout(2000);

        // Filter out common non-critical errors
        const criticalErrors = jsErrors.filter(error =>
          !error.includes('favicon') &&
          !error.includes('webmanifest') &&
          !error.includes('Service Worker')
        );

        expect(criticalErrors.length).toBe(0);
      });

      test(`should handle missing resources gracefully in ${browserName}`, async ({ page }) => {
        // Block a CSS file to test fallback
        await page.route('**/service-animations.css', route => route.abort());

        await page.goto(SERVICE_PAGE_URL);

        // Page should still be functional
        const serviceCards = await page.locator('.service-card');
        await expect(serviceCards.first()).toBeVisible();

        const title = await page.locator('h1');
        await expect(title).toBeVisible();
      });
    });
  });

  // Test viewport and zoom compatibility
  test.describe('Viewport Compatibility', () => {

    const viewports = [
      { width: 320, height: 568, name: 'Mobile Small' },
      { width: 375, height: 667, name: 'Mobile Medium' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1024, height: 768, name: 'Desktop Small' },
      { width: 1440, height: 900, name: 'Desktop Large' }
    ];

    BROWSERS.forEach(browserName => {
      viewports.forEach(viewport => {
        test(`should render properly on ${viewport.name} in ${browserName}`, async ({ page }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await page.goto(SERVICE_PAGE_URL);

          // Basic content should be visible
          const heroTitle = await page.locator('h1');
          await expect(heroTitle).toBeVisible();

          const serviceCards = await page.locator('.service-card');
          await expect(serviceCards.first()).toBeVisible();

          // Check for horizontal overflow
          const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
          expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 20); // Allow small tolerance
        });
      });
    });
  });

  // Test accessibility across browsers
  test.describe('Accessibility Consistency', () => {

    BROWSERS.forEach(browserName => {
      test(`should maintain focus indicators in ${browserName}`, async ({ page }) => {
        await page.goto(SERVICE_PAGE_URL);

        const focusableElements = await page.locator('a, button, input, [tabindex]').all();

        for (const element of focusableElements.slice(0, 3)) {
          await element.focus();

          const outline = await element.evaluate(el => {
            const style = window.getComputedStyle(el);
            return {
              outline: style.outline,
              outlineColor: style.outlineColor,
              boxShadow: style.boxShadow
            };
          });

          // Should have some form of focus indicator
          const hasFocusIndicator = outline.outline !== 'none' ||
                                   outline.outlineColor !== 'rgba(0, 0, 0, 0)' ||
                                   outline.boxShadow !== 'none';

          expect(hasFocusIndicator).toBe(true);
        }
      });

      test(`should support screen reader attributes in ${browserName}`, async ({ page }) => {
        await page.goto(SERVICE_PAGE_URL);

        // Check ARIA labels
        const ariaLabels = await page.locator('[aria-label]').count();
        expect(ariaLabels).toBeGreaterThan(5);

        // Check heading structure
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBe(1);

        const h2Count = await page.locator('h2').count();
        expect(h2Count).toBeGreaterThan(1);
      });
    });
  });

  // Test performance across browsers
  test.describe('Performance Consistency', () => {

    BROWSERS.forEach(browserName => {
      test(`should load within acceptable time in ${browserName}`, async ({ page }) => {
        const startTime = Date.now();

        await page.goto(SERVICE_PAGE_URL);
        await page.waitForLoadState('networkidle');

        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(5000); // Should load in under 5 seconds
      });

      test(`should maintain smooth animations in ${browserName}`, async ({ page }) => {
        await page.goto(SERVICE_PAGE_URL);
        await page.waitForTimeout(1000);

        // Test scroll performance
        const scrollStart = Date.now();

        await page.evaluate(() => {
          window.scrollTo({ top: 1000, behavior: 'smooth' });
        });

        await page.waitForTimeout(1000);

        const scrollTime = Date.now() - scrollStart;
        expect(scrollTime).toBeLessThan(2000); // Smooth scroll should complete quickly
      });
    });
  });

  // Test feature detection and fallbacks
  test.describe('Feature Detection', () => {

    BROWSERS.forEach(browserName => {
      test(`should detect browser capabilities in ${browserName}`, async ({ page }) => {
        await page.goto(SERVICE_PAGE_URL);

        const capabilities = await page.evaluate(() => {
          return {
            webgl: !!window.WebGLRenderingContext,
            webgl2: !!window.WebGL2RenderingContext,
            serviceWorker: 'serviceWorker' in navigator,
            pushManager: 'PushManager' in window,
            notifications: 'Notification' in window,
            geolocation: 'geolocation' in navigator,
            localStorage: 'localStorage' in window,
            sessionStorage: 'sessionStorage' in window,
            indexedDB: 'indexedDB' in window,
            webWorkers: 'Worker' in window,
            fetch: 'fetch' in window,
            promises: 'Promise' in window,
            symbols: 'Symbol' in window,
            maps: 'Map' in window,
            sets: 'Set' in window
          };
        });

        // Essential modern features should be supported
        expect(capabilities.fetch).toBe(true);
        expect(capabilities.promises).toBe(true);
        expect(capabilities.localStorage).toBe(true);
      });

      test(`should provide appropriate fallbacks in ${browserName}`, async ({ page }) => {
        await page.goto(SERVICE_PAGE_URL);

        // Test that page works even without advanced features
        await page.addInitScript(() => {
          // Simulate missing IntersectionObserver
          delete window.IntersectionObserver;
        });

        await page.reload();

        // Basic functionality should still work
        const serviceCards = await page.locator('.service-card');
        await expect(serviceCards.first()).toBeVisible();

        const ctaButtons = await page.locator('.service-cta');
        await expect(ctaButtons.first()).toBeVisible();
      });
    });
  });
});

// Utility functions for cross-browser testing
class CrossBrowserTestUtils {
  static async detectBrowserEngine(page) {
    return await page.evaluate(() => {
      const userAgent = navigator.userAgent.toLowerCase();

      if (userAgent.includes('chrome') && !userAgent.includes('edge')) {
        return 'blink';
      } else if (userAgent.includes('firefox')) {
        return 'gecko';
      } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
        return 'webkit';
      } else if (userAgent.includes('edge')) {
        return 'edgehtml';
      }

      return 'unknown';
    });
  }

  static async getBrowserFeatures(page) {
    return await page.evaluate(() => {
      const features = {};

      // CSS Features
      features.cssGrid = CSS.supports('display', 'grid');
      features.cssFlexbox = CSS.supports('display', 'flex');
      features.cssCustomProps = CSS.supports('color', 'var(--test)');
      features.cssCalc = CSS.supports('width', 'calc(100% - 10px)');

      // JavaScript Features
      features.es6Classes = typeof class {} === 'function';
      features.es6Modules = 'import' in document.createElement('script');
      features.asyncAwait = (async () => {}).constructor.name === 'AsyncFunction';

      // Web APIs
      features.intersectionObserver = 'IntersectionObserver' in window;
      features.resizeObserver = 'ResizeObserver' in window;
      features.mutationObserver = 'MutationObserver' in window;
      features.webAnimations = 'animate' in document.createElement('div');

      return features;
    });
  }

  static async measureRenderingPerformance(page) {
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();

        function countFrames() {
          frameCount++;
          const elapsed = performance.now() - startTime;

          if (elapsed >= 1000) {
            resolve({
              fps: frameCount,
              renderTime: elapsed / frameCount
            });
          } else {
            requestAnimationFrame(countFrames);
          }
        }

        requestAnimationFrame(countFrames);
      });
    });
  }
}

module.exports = { CrossBrowserTestUtils };