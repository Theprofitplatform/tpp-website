const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8080';
const CRITICAL_PAGES = [
  'index.html',
  'about.html',
  'services.html',
  'contact.html',
  'portfolio.html'
];

test.describe('Performance Testing Suite', () => {

  test.describe('Core Web Vitals', () => {
    CRITICAL_PAGES.forEach(page => {
      test(`${page} - Core Web Vitals measurement`, async ({ page: pw }) => {
        await pw.goto(`${BASE_URL}/${page}`);

        // Inject web vitals measurement script
        await pw.addInitScript(() => {
          window.vitals = {};

          // Largest Contentful Paint
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            window.vitals.lcp = lastEntry.startTime;
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });

          // First Input Delay
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
              window.vitals.fid = entry.processingStart - entry.startTime;
            });
          });
          fidObserver.observe({ entryTypes: ['first-input'] });

          // Cumulative Layout Shift
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            window.vitals.cls = clsValue;
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        });

        await pw.waitForLoadState('networkidle');
        await pw.waitForTimeout(3000); // Allow time for measurements

        const vitals = await pw.evaluate(() => window.vitals);

        console.log(`${page} Core Web Vitals:`, vitals);

        // Core Web Vitals thresholds
        if (vitals.lcp) {
          expect(vitals.lcp).toBeLessThan(2500); // LCP < 2.5s
        }
        if (vitals.fid) {
          expect(vitals.fid).toBeLessThan(100); // FID < 100ms
        }
        if (vitals.cls !== undefined) {
          expect(vitals.cls).toBeLessThan(0.1); // CLS < 0.1
        }
      });
    });
  });

  test.describe('Resource Loading Performance', () => {
    CRITICAL_PAGES.forEach(page => {
      test(`${page} - Resource loading optimization`, async ({ page: pw }) => {
        const startTime = Date.now();

        // Track network requests
        const requests = [];
        pw.on('request', request => {
          requests.push({
            url: request.url(),
            resourceType: request.resourceType(),
            method: request.method()
          });
        });

        await pw.goto(`${BASE_URL}/${page}`);
        await pw.waitForLoadState('networkidle');

        const loadTime = Date.now() - startTime;

        // Analyze requests
        const cssRequests = requests.filter(r => r.resourceType === 'stylesheet');
        const jsRequests = requests.filter(r => r.resourceType === 'script');
        const imageRequests = requests.filter(r => r.resourceType === 'image');

        console.log(`${page} Resource Analysis:`, {
          totalRequests: requests.length,
          cssRequests: cssRequests.length,
          jsRequests: jsRequests.length,
          imageRequests: imageRequests.length,
          loadTime
        });

        // Performance assertions
        expect(loadTime).toBeLessThan(5000); // Total load < 5s
        expect(cssRequests.length).toBeLessThan(10); // Reasonable CSS requests
        expect(jsRequests.length).toBeLessThan(15); // Reasonable JS requests
      });
    });
  });

  test.describe('Mobile Performance', () => {
    CRITICAL_PAGES.slice(0, 3).forEach(page => {
      test(`${page} - Mobile performance`, async ({ page: pw }) => {
        // Simulate mobile device
        await pw.setViewportSize({ width: 375, height: 667 });

        // Throttle network to simulate 3G
        const client = await pw.context().newCDPSession(pw);
        await client.send('Network.emulateNetworkConditions', {
          offline: false,
          downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
          uploadThroughput: 750 * 1024 / 8, // 750 Kbps
          latency: 40
        });

        const startTime = Date.now();
        await pw.goto(`${BASE_URL}/${page}`);
        await pw.waitForLoadState('domcontentloaded');
        const loadTime = Date.now() - startTime;

        console.log(`${page} Mobile Load Time: ${loadTime}ms`);

        // Mobile performance should be reasonable even on slower connections
        expect(loadTime).toBeLessThan(8000); // 8s max on mobile 3G

        // Check critical elements are visible
        await expect(pw.locator('body')).toBeVisible();

        // Check navigation is functional on mobile
        const mobileNav = pw.locator('.mobile-nav, .menu-toggle');
        if (await mobileNav.count() > 0) {
          await expect(mobileNav.first()).toBeVisible();
        }
      });
    });
  });

  test.describe('JavaScript Performance', () => {
    test('JavaScript execution performance', async ({ page }) => {
      await page.goto(`${BASE_URL}/index.html`);

      // Measure JavaScript execution time
      const jsMetrics = await page.evaluate(() => {
        const startTime = performance.now();

        // Simulate common interactions
        const buttons = document.querySelectorAll('button, .btn');
        buttons.forEach(btn => {
          if (btn.click) btn.dispatchEvent(new Event('mouseover'));
        });

        const endTime = performance.now();

        return {
          executionTime: endTime - startTime,
          buttonCount: buttons.length,
          memoryUsage: performance.memory ? {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
          } : null
        };
      });

      console.log('JavaScript Performance:', jsMetrics);

      // JavaScript should execute quickly
      expect(jsMetrics.executionTime).toBeLessThan(100); // < 100ms for interactions

      if (jsMetrics.memoryUsage) {
        // Memory usage should be reasonable
        const memoryUsageMB = jsMetrics.memoryUsage.used / (1024 * 1024);
        expect(memoryUsageMB).toBeLessThan(50); // < 50MB memory usage
      }
    });
  });

  test.describe('CSS Performance', () => {
    test('CSS loading and rendering performance', async ({ page }) => {
      await page.goto(`${BASE_URL}/index.html`);

      // Check for render-blocking CSS
      const cssMetrics = await page.evaluate(() => {
        const stylesheets = Array.from(document.styleSheets);
        const cssRules = stylesheets.reduce((total, sheet) => {
          try {
            return total + (sheet.cssRules ? sheet.cssRules.length : 0);
          } catch (e) {
            return total;
          }
        }, 0);

        return {
          stylesheetCount: stylesheets.length,
          totalCSSRules: cssRules,
          criticalCSS: !!document.querySelector('style[data-critical]')
        };
      });

      console.log('CSS Performance:', cssMetrics);

      // CSS should be optimized
      expect(cssMetrics.stylesheetCount).toBeLessThan(10); // Reasonable stylesheet count
      expect(cssMetrics.totalCSSRules).toBeLessThan(5000); // Not excessive rules
    });
  });

  test.describe('Image Performance', () => {
    CRITICAL_PAGES.slice(0, 3).forEach(page => {
      test(`${page} - Image optimization`, async ({ page: pw }) => {
        await pw.goto(`${BASE_URL}/${page}`);
        await pw.waitForLoadState('networkidle');

        const imageMetrics = await pw.evaluate(() => {
          const images = Array.from(document.images);

          return images.map(img => ({
            src: img.src,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            displayWidth: img.width,
            displayHeight: img.height,
            loaded: img.complete && img.naturalHeight !== 0,
            hasAlt: !!img.alt,
            isLazy: img.loading === 'lazy'
          }));
        });

        console.log(`${page} Image Analysis:`, {
          totalImages: imageMetrics.length,
          loadedImages: imageMetrics.filter(img => img.loaded).length,
          lazyImages: imageMetrics.filter(img => img.isLazy).length,
          missingAlt: imageMetrics.filter(img => !img.hasAlt).length
        });

        // Image optimization checks
        imageMetrics.forEach((img, index) => {
          if (img.loaded) {
            // Images should have alt text
            expect(img.hasAlt).toBeTruthy();

            // Images shouldn't be excessively oversized
            if (img.displayWidth > 0 && img.naturalWidth > 0) {
              const oversizeRatio = img.naturalWidth / img.displayWidth;
              expect(oversizeRatio).toBeLessThan(3); // Not more than 3x oversized
            }
          }
        });
      });
    });
  });
});