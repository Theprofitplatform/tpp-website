const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = 'http://localhost:8080';
const PAGES = [
  { path: 'index.html', name: 'Homepage' },
  { path: 'about.html', name: 'About' },
  { path: 'services.html', name: 'Services' },
  { path: 'contact.html', name: 'Contact' },
  { path: 'portfolio.html', name: 'Portfolio' },
  { path: 'google-ads.html', name: 'Google Ads' },
  { path: 'seo.html', name: 'SEO' },
  { path: 'web-design.html', name: 'Web Design' },
  { path: 'pricing.html', name: 'Pricing' },
  { path: 'faq.html', name: 'FAQ' }
];

test.describe('Comprehensive UI/UX Test Suite', () => {

  // Test 1: Navigation Consistency
  test.describe('Navigation Consistency', () => {
    PAGES.forEach(({ path, name }) => {
      test(`${name} - Navigation elements present and functional`, async ({ page }) => {
        await page.goto(`${BASE_URL}/${path}`);

        // Check navigation exists
        const navigation = page.locator('nav, .nav, #primary-navigation');
        await expect(navigation).toBeVisible();

        // Check logo/brand link
        const logo = page.locator('.logo, .brand, [aria-label*="home"]');
        await expect(logo).toBeVisible();

        // Check main navigation links
        const navLinks = page.locator('.nav-links, .nav-item, nav a');
        await expect(navLinks.first()).toBeVisible();

        // Check mobile menu toggle
        const mobileToggle = page.locator('.menu-toggle, .mobile-toggle, .hamburger');
        if (await mobileToggle.count() > 0) {
          await expect(mobileToggle).toBeVisible();
        }

        // Test logo click functionality
        await logo.first().click();
        await page.waitForTimeout(1000);
      });
    });
  });

  // Test 2: Interactive Elements
  test.describe('Interactive Elements', () => {
    PAGES.forEach(({ path, name }) => {
      test(`${name} - Interactive elements respond correctly`, async ({ page }) => {
        await page.goto(`${BASE_URL}/${path}`);

        // Test buttons
        const buttons = page.locator('button, .btn, .cta, .interactive-element');
        const buttonCount = await buttons.count();

        if (buttonCount > 0) {
          for (let i = 0; i < Math.min(buttonCount, 5); i++) {
            const button = buttons.nth(i);
            if (await button.isVisible()) {
              // Test hover state
              await button.hover();
              await page.waitForTimeout(300);

              // Check for transform or style changes
              const transform = await button.evaluate(el =>
                window.getComputedStyle(el).transform
              );
              // Transform should change on hover (not 'none')
            }
          }
        }

        // Test phone links
        const phoneLinks = page.locator('a[href^="tel:"], .phone-link');
        const phoneCount = await phoneLinks.count();

        for (let i = 0; i < phoneCount; i++) {
          const phoneLink = phoneLinks.nth(i);
          if (await phoneLink.isVisible()) {
            const href = await phoneLink.getAttribute('href');
            expect(href).toMatch(/^tel:\+?[\d\s\-\(\)]+$/);
          }
        }
      });
    });
  });

  // Test 3: Responsive Design
  test.describe('Responsive Design', () => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    PAGES.slice(0, 5).forEach(({ path, name }) => {
      viewports.forEach(({ name: viewportName, width, height }) => {
        test(`${name} - ${viewportName} responsiveness`, async ({ page }) => {
          await page.setViewportSize({ width, height });
          await page.goto(`${BASE_URL}/${path}`);

          // Check page loads properly
          await expect(page.locator('body')).toBeVisible();

          // Check navigation adapts
          if (width <= 768) {
            // Mobile: check for mobile menu
            const mobileMenu = page.locator('.mobile-nav, .mobile-menu, .menu-toggle');
            if (await mobileMenu.count() > 0) {
              await expect(mobileMenu.first()).toBeVisible();
            }
          } else {
            // Desktop: check for desktop navigation
            const desktopNav = page.locator('.nav-links, .desktop-nav');
            if (await desktopNav.count() > 0) {
              await expect(desktopNav.first()).toBeVisible();
            }
          }

          // Check no horizontal overflow
          const bodyOverflow = await page.evaluate(() => {
            return document.body.scrollWidth <= window.innerWidth;
          });
          expect(bodyOverflow).toBeTruthy();
        });
      });
    });
  });

  // Test 4: Performance and Loading
  test.describe('Performance Testing', () => {
    PAGES.slice(0, 5).forEach(({ path, name }) => {
      test(`${name} - Performance metrics`, async ({ page }) => {
        const startTime = Date.now();

        await page.goto(`${BASE_URL}/${path}`);

        // Wait for page to be fully loaded
        await page.waitForLoadState('networkidle');

        const loadTime = Date.now() - startTime;

        // Page should load within 5 seconds
        expect(loadTime).toBeLessThan(5000);

        // Check for critical elements
        await expect(page.locator('body')).toBeVisible();

        // Check images load properly
        const images = page.locator('img');
        const imageCount = await images.count();

        if (imageCount > 0) {
          // Check first few images are loaded
          for (let i = 0; i < Math.min(imageCount, 3); i++) {
            const img = images.nth(i);
            if (await img.isVisible()) {
              const naturalWidth = await img.evaluate(el => el.naturalWidth);
              expect(naturalWidth).toBeGreaterThan(0);
            }
          }
        }
      });
    });
  });

  // Test 5: Form Functionality
  test.describe('Form Testing', () => {
    test('Contact form validation and interaction', async ({ page }) => {
      await page.goto(`${BASE_URL}/contact.html`);

      // Find form elements
      const forms = page.locator('form');
      const formCount = await forms.count();

      if (formCount > 0) {
        const form = forms.first();

        // Test form inputs
        const inputs = form.locator('input, textarea, select');
        const inputCount = await inputs.count();

        for (let i = 0; i < Math.min(inputCount, 5); i++) {
          const input = inputs.nth(i);
          const inputType = await input.getAttribute('type');

          if (inputType !== 'submit' && inputType !== 'button') {
            // Test focus state
            await input.focus();
            await page.waitForTimeout(300);

            // Test typing
            if (inputType === 'email') {
              await input.fill('test@example.com');
            } else if (inputType === 'tel') {
              await input.fill('+61487286451');
            } else {
              await input.fill('Test content');
            }

            await page.waitForTimeout(200);
          }
        }
      }
    });
  });

  // Test 6: Accessibility
  test.describe('Accessibility Testing', () => {
    PAGES.slice(0, 3).forEach(({ path, name }) => {
      test(`${name} - Basic accessibility checks`, async ({ page }) => {
        await page.goto(`${BASE_URL}/${path}`);

        // Check for heading structure
        const h1 = page.locator('h1');
        await expect(h1).toHaveCount(1); // Should have exactly one H1

        // Check for alt text on images
        const images = page.locator('img');
        const imageCount = await images.count();

        for (let i = 0; i < Math.min(imageCount, 5); i++) {
          const img = images.nth(i);
          if (await img.isVisible()) {
            const alt = await img.getAttribute('alt');
            expect(alt).toBeTruthy(); // Should have alt text
          }
        }

        // Check for proper link text
        const links = page.locator('a');
        const linkCount = await links.count();

        for (let i = 0; i < Math.min(linkCount, 10); i++) {
          const link = links.nth(i);
          if (await link.isVisible()) {
            const text = await link.textContent();
            const ariaLabel = await link.getAttribute('aria-label');

            // Should have meaningful text or aria-label
            expect(text?.trim() || ariaLabel).toBeTruthy();
          }
        }

        // Check for focus indicators
        const focusableElements = page.locator('a, button, input, textarea, select, [tabindex]');
        const focusCount = await focusableElements.count();

        if (focusCount > 0) {
          const firstFocusable = focusableElements.first();
          await firstFocusable.focus();

          // Check focus is visible (should have outline or box-shadow)
          const focusStyle = await firstFocusable.evaluate(el => {
            const styles = window.getComputedStyle(el);
            return {
              outline: styles.outline,
              boxShadow: styles.boxShadow
            };
          });

          // Should have some form of focus indicator
          const hasFocusIndicator = focusStyle.outline !== 'none' ||
                                   focusStyle.boxShadow !== 'none';
          expect(hasFocusIndicator).toBeTruthy();
        }
      });
    });
  });

  // Test 7: CSS and JavaScript Errors
  test.describe('Error Detection', () => {
    PAGES.slice(0, 5).forEach(({ path, name }) => {
      test(`${name} - No console errors`, async ({ page }) => {
        const errors = [];

        page.on('console', msg => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        });

        page.on('pageerror', error => {
          errors.push(error.message);
        });

        await page.goto(`${BASE_URL}/${path}`);
        await page.waitForLoadState('networkidle');

        // Check for critical errors (allow minor warnings)
        const criticalErrors = errors.filter(error =>
          !error.includes('favicon') &&
          !error.includes('404') &&
          !error.includes('warning')
        );

        expect(criticalErrors.length).toBe(0);
      });
    });
  });

  // Test 8: Mobile Menu Functionality
  test.describe('Mobile Menu', () => {
    test('Mobile navigation opens and closes correctly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/index.html`);

      const mobileToggle = page.locator('.menu-toggle, .mobile-toggle, .hamburger');
      const mobileMenu = page.locator('.mobile-nav, .mobile-menu');

      if (await mobileToggle.count() > 0 && await mobileMenu.count() > 0) {
        // Open mobile menu
        await mobileToggle.first().click();
        await page.waitForTimeout(500);

        // Check menu is visible
        await expect(mobileMenu.first()).toBeVisible();

        // Test menu links
        const mobileLinks = mobileMenu.locator('a');
        const linkCount = await mobileLinks.count();

        if (linkCount > 0) {
          // Click first link to test functionality
          await mobileLinks.first().click();
          await page.waitForTimeout(500);
        }
      }
    });
  });

  // Test 9: CTA and Conversion Elements
  test.describe('Conversion Elements', () => {
    PAGES.slice(0, 5).forEach(({ path, name }) => {
      test(`${name} - CTA elements are prominent and functional`, async ({ page }) => {
        await page.goto(`${BASE_URL}/${path}`);

        // Check for CTA buttons
        const ctaButtons = page.locator('.cta, .btn-primary, .hero-cta, [href*="contact"]');
        const ctaCount = await ctaButtons.count();

        expect(ctaCount).toBeGreaterThan(0); // Should have at least one CTA

        // Test CTA visibility and interaction
        for (let i = 0; i < Math.min(ctaCount, 3); i++) {
          const cta = ctaButtons.nth(i);
          if (await cta.isVisible()) {
            // Test hover effect
            await cta.hover();
            await page.waitForTimeout(300);

            // CTA should be clickable
            expect(await cta.isEnabled()).toBeTruthy();
          }
        }

        // Check for phone numbers
        const phoneElements = page.locator('[href^="tel:"], .phone');
        const phoneCount = await phoneElements.count();

        if (phoneCount > 0) {
          const phoneElement = phoneElements.first();
          const href = await phoneElement.getAttribute('href');

          if (href) {
            expect(href).toMatch(/^tel:\+?[\d\s\-\(\)]+$/);
          }
        }
      });
    });
  });

  // Test 10: Enhanced Interactive Elements
  test.describe('Enhanced Interactive Elements', () => {
    test('Interactive element classes applied correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/index.html`);

      // Check for interactive-element class
      const interactiveElements = page.locator('.interactive-element');
      const interactiveCount = await interactiveElements.count();

      expect(interactiveCount).toBeGreaterThan(0);

      // Test enhanced interactions
      for (let i = 0; i < Math.min(interactiveCount, 5); i++) {
        const element = interactiveElements.nth(i);

        if (await element.isVisible()) {
          // Test hover state
          await element.hover();
          await page.waitForTimeout(200);

          // Check for cursor pointer
          const cursor = await element.evaluate(el =>
            window.getComputedStyle(el).cursor
          );
          expect(cursor).toBe('pointer');
        }
      }
    });
  });
});

// Performance benchmark test
test.describe('Performance Benchmarks', () => {
  test('Homepage performance metrics', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(`${BASE_URL}/index.html`);

    // Measure key timings
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });

    const totalLoadTime = Date.now() - startTime;

    console.log('Performance Metrics:', {
      totalLoadTime,
      ...performanceMetrics
    });

    // Performance assertions
    expect(totalLoadTime).toBeLessThan(5000); // 5 second max load time
    expect(performanceMetrics.domContentLoaded).toBeLessThan(2000); // 2 second DOM ready

    if (performanceMetrics.firstContentfulPaint > 0) {
      expect(performanceMetrics.firstContentfulPaint).toBeLessThan(2500); // 2.5 second FCP
    }
  });
});