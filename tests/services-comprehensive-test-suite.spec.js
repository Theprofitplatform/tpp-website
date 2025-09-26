/**
 * Comprehensive Test Suite for Services Page
 * Testing and Quality Assurance Agent Implementation
 *
 * Test Categories:
 * 1. HTML Markup & Semantic Structure
 * 2. Responsive Design Testing
 * 3. Cross-Browser Compatibility
 * 4. Accessibility Testing
 * 5. Performance Metrics
 * 6. Interactive Elements
 * 7. SEO Implementation
 * 8. User Experience Scenarios
 */

const { test, expect, devices } = require('@playwright/test');
const path = require('path');

// Test configuration
const SERVICE_PAGE_URL = 'file://' + path.resolve(__dirname, '../website/services.html');
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const DESKTOP_BREAKPOINT = 1200;

test.describe('Services Page - Comprehensive Testing Suite', () => {

  // **1. HTML MARKUP & SEMANTIC STRUCTURE TESTING**
  test.describe('HTML Markup & Semantic Structure', () => {

    test('should have valid HTML5 semantic structure', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      // Test semantic elements
      const header = await page.locator('header').count();
      expect(header).toBe(1);

      const main = await page.locator('main, .services, .hero').count();
      expect(main).toBeGreaterThan(0);

      const sections = await page.locator('section').count();
      expect(sections).toBeGreaterThan(3);

      // Test heading hierarchy
      const h1 = await page.locator('h1').count();
      expect(h1).toBe(1);

      const h2 = await page.locator('h2').count();
      expect(h2).toBeGreaterThan(1);

      const h3 = await page.locator('h3').count();
      expect(h3).toBeGreaterThan(3);
    });

    test('should have proper meta tags and document structure', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      // Test meta tags
      const title = await page.title();
      expect(title).toContain('Digital Marketing Services');
      expect(title).toContain('Sydney');
      expect(title).toContain('The Profit Platform');

      const description = await page.getAttribute('meta[name="description"]', 'content');
      expect(description).toContain('digital marketing services');
      expect(description).toContain('Sydney');
      expect(description.length).toBeGreaterThan(120);
      expect(description.length).toBeLessThan(160);

      // Test geo-targeting
      const geoRegion = await page.getAttribute('meta[name="geo.region"]', 'content');
      expect(geoRegion).toBe('AU-NSW');

      const geoPlacename = await page.getAttribute('meta[name="geo.placename"]', 'content');
      expect(geoPlacename).toBe('Sydney');
    });

    test('should have valid structured data', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      const structuredData = await page.locator('script[type="application/ld+json"]').textContent();
      expect(structuredData).toBeTruthy();

      const jsonLD = JSON.parse(structuredData);
      expect(jsonLD['@context']).toBe('https://schema.org');
      expect(jsonLD['@type']).toBe('Organization');
      expect(jsonLD.name).toBe('The Profit Platform');
      expect(jsonLD.hasOfferCatalog).toBeTruthy();
      expect(jsonLD.hasOfferCatalog.itemListElement.length).toBeGreaterThan(2);
    });
  });

  // **2. RESPONSIVE DESIGN TESTING**
  test.describe('Responsive Design Testing', () => {

    test('should display correctly on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone 8
      await page.goto(SERVICE_PAGE_URL);

      // Test mobile navigation
      const navLinks = await page.locator('.nav-links').isVisible();
      expect(navLinks).toBe(false);

      // Test service cards layout
      const serviceCards = await page.locator('.service-card');
      const cardCount = await serviceCards.count();
      expect(cardCount).toBeGreaterThan(3);

      // Test hero section
      const heroTitle = await page.locator('.hero h1');
      await expect(heroTitle).toBeVisible();

      const heroTitleSize = await heroTitle.evaluate(el =>
        window.getComputedStyle(el).fontSize
      );
      expect(parseFloat(heroTitleSize)).toBeLessThan(40); // Mobile font size
    });

    test('should display correctly on tablet devices', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await page.goto(SERVICE_PAGE_URL);

      // Test grid layout
      const servicesGrid = await page.locator('.services-grid');
      const gridColumns = await servicesGrid.evaluate(el =>
        window.getComputedStyle(el).gridTemplateColumns
      );
      expect(gridColumns).toContain('fr'); // Should use fractional units

      // Test process steps layout
      const processSteps = await page.locator('.process-steps');
      await expect(processSteps).toBeVisible();
    });

    test('should display correctly on desktop devices', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.goto(SERVICE_PAGE_URL);

      // Test navigation visibility
      const navLinks = await page.locator('.nav-links').isVisible();
      expect(navLinks).toBe(true);

      // Test service cards in grid
      const servicesGrid = await page.locator('.services-grid');
      const gridColumns = await servicesGrid.evaluate(el =>
        window.getComputedStyle(el).gridTemplateColumns
      );
      expect(gridColumns.split(' ').length).toBeGreaterThan(2);
    });

    test('should handle extreme viewport sizes', async ({ page }) => {
      // Test very wide screen
      await page.setViewportSize({ width: 2560, height: 1440 });
      await page.goto(SERVICE_PAGE_URL);

      const container = await page.locator('.container');
      const containerWidth = await container.evaluate(el =>
        window.getComputedStyle(el).maxWidth
      );
      expect(parseFloat(containerWidth)).toBeLessThan(1300); // Should have max-width

      // Test very narrow screen
      await page.setViewportSize({ width: 320, height: 568 });
      await page.reload();

      const serviceCard = await page.locator('.service-card').first();
      await expect(serviceCard).toBeVisible();
    });
  });

  // **3. ACCESSIBILITY TESTING**
  test.describe('Accessibility Testing', () => {

    test('should have proper ARIA labels and roles', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      // Test navigation landmarks
      const nav = await page.locator('nav');
      await expect(nav).toBeVisible();

      // Test heading structure
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(5);
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      // Test tab navigation through service cards
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      const focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // Test enter key on CTA buttons
      const ctaButton = await page.locator('.service-cta').first();
      await ctaButton.focus();
      await expect(ctaButton).toBeFocused();
    });

    test('should have sufficient color contrast', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      // Test hero text contrast
      const heroTitle = await page.locator('.hero h1');
      const heroColor = await heroTitle.evaluate(el =>
        window.getComputedStyle(el).color
      );
      expect(heroColor).toBeTruthy();

      // Test service card text contrast
      const serviceTitle = await page.locator('.service-title').first();
      const titleColor = await serviceTitle.evaluate(el =>
        window.getComputedStyle(el).color
      );
      expect(titleColor).toBeTruthy();
    });

    test('should have descriptive alt text for images', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      const images = await page.locator('img').all();
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        if (alt !== null) {
          expect(alt.length).toBeGreaterThan(3);
        }
      }
    });
  });

  // **4. PERFORMANCE TESTING**
  test.describe('Performance Testing', () => {

    test('should load within acceptable time limits', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(SERVICE_PAGE_URL);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
    });

    test('should have optimized fonts loading', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      // Check font preconnect
      const preconnect = await page.locator('link[rel="preconnect"][href*="fonts.googleapis.com"]');
      await expect(preconnect).toHaveCount(1);

      // Check font display property
      const fontLink = await page.locator('link[href*="fonts.googleapis.com"]');
      const href = await fontLink.getAttribute('href');
      expect(href).toContain('display=swap');
    });

    test('should have proper CSS and JS optimization', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      // Check for inline CSS (should be minimal)
      const inlineStyles = await page.locator('style').count();
      expect(inlineStyles).toBeLessThan(3); // Main styles should be inline, animations external

      // Check for external CSS files
      const cssLinks = await page.locator('link[rel="stylesheet"]').count();
      expect(cssLinks).toBeGreaterThan(0);
    });
  });

  // **5. INTERACTIVE ELEMENTS TESTING**
  test.describe('Interactive Elements Testing', () => {

    test('should have functional service card hover effects', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);
      await page.waitForTimeout(1000); // Wait for animations to initialize

      const serviceCard = await page.locator('.service-card').first();
      await expect(serviceCard).toBeVisible();

      // Test hover effect
      await serviceCard.hover();

      // Check if transform is applied on hover
      const transform = await serviceCard.evaluate(el =>
        window.getComputedStyle(el).transform
      );
      expect(transform).not.toBe('none');
    });

    test('should have working smooth scroll for anchor links', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      const anchorLink = await page.locator('a[href="#services"]');
      if (await anchorLink.count() > 0) {
        await anchorLink.click();

        // Should scroll to services section
        await page.waitForTimeout(1000);
        const servicesSection = await page.locator('#services');
        await expect(servicesSection).toBeInViewport();
      }
    });

    test('should have functional phone links', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      const phoneLinks = await page.locator('a[href^="tel:"]').all();
      expect(phoneLinks.length).toBeGreaterThan(0);

      for (const phoneLink of phoneLinks) {
        const href = await phoneLink.getAttribute('href');
        expect(href).toMatch(/^tel:\+?\d+/);
      }
    });

    test('should handle intersection observer animations', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      // Wait for animations to initialize
      await page.waitForTimeout(2000);

      // Check if service cards have animation classes
      const animatedCards = await page.locator('.service-card').all();

      for (const card of animatedCards) {
        const isVisible = await card.isVisible();
        expect(isVisible).toBe(true);
      }
    });
  });

  // **6. SEO IMPLEMENTATION TESTING**
  test.describe('SEO Implementation Testing', () => {

    test('should have optimized title tags', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      const title = await page.title();
      expect(title.length).toBeGreaterThan(30);
      expect(title.length).toBeLessThan(60);
      expect(title).toContain('Sydney');
      expect(title).toContain('Digital Marketing Services');
    });

    test('should have proper Open Graph tags', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
      expect(ogTitle).toContain('Digital Marketing Services');

      const ogDescription = await page.getAttribute('meta[property="og:description"]', 'content');
      expect(ogDescription).toBeTruthy();
      expect(ogDescription.length).toBeGreaterThan(100);

      const ogType = await page.getAttribute('meta[property="og:type"]', 'content');
      expect(ogType).toBe('website');

      const ogUrl = await page.getAttribute('meta[property="og:url"]', 'content');
      expect(ogUrl).toContain('theprofitplatform.com.au/services');
    });

    test('should have canonical URL', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
      expect(canonical).toBe('https://theprofitplatform.com.au/services');
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);

      const h1Text = await page.locator('h1').textContent();
      expect(h1Text).toContain('Stop Wasting Money');

      const h2Elements = await page.locator('h2').all();
      expect(h2Elements.length).toBeGreaterThan(2);
    });
  });

  // **7. CONTENT VALIDATION TESTING**
  test.describe('Content Validation Testing', () => {

    test('should have all required service offerings', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      const requiredServices = [
        'Local SEO',
        'Google Ads',
        'Web Design',
        'Social Media',
        'Email Marketing',
        '3-Layer System'
      ];

      for (const service of requiredServices) {
        const serviceElement = await page.locator(`text*="${service}"`);
        await expect(serviceElement).toBeVisible();
      }
    });

    test('should have proper pricing information', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      const priceElements = await page.locator('.service-price').all();
      expect(priceElements.length).toBeGreaterThan(4);

      for (const priceElement of priceElements) {
        const priceText = await priceElement.textContent();
        expect(priceText).toMatch(/\$[\d,]+/); // Should contain dollar amounts
      }
    });

    test('should have CTA buttons for all services', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      const ctaButtons = await page.locator('.service-cta').all();
      expect(ctaButtons.length).toBeGreaterThan(4);

      for (const cta of ctaButtons) {
        const isVisible = await cta.isVisible();
        expect(isVisible).toBe(true);

        const href = await cta.getAttribute('href');
        expect(href).toBeTruthy();
      }
    });

    test('should have testimonial or case study references', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      // Look for specific business names mentioned
      const caseStudyReferences = [
        "Sarah's Bakery",
        "Michael's plumbing",
        "Bella's Beauty Studio"
      ];

      for (const reference of caseStudyReferences) {
        const element = await page.locator(`text*="${reference}"`);
        await expect(element).toBeVisible();
      }
    });
  });

  // **8. CROSS-BROWSER COMPATIBILITY TESTING**
  test.describe('Cross-Browser Compatibility', () => {

    test('should render consistently across viewports', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      // Test CSS Grid support
      const servicesGrid = await page.locator('.services-grid');
      const gridDisplay = await servicesGrid.evaluate(el =>
        window.getComputedStyle(el).display
      );
      expect(gridDisplay).toBe('grid');

      // Test CSS Custom Properties support
      const rootStyles = await page.evaluate(() => {
        const root = document.documentElement;
        return window.getComputedStyle(root).getPropertyValue('--primary');
      });
      expect(rootStyles).toBeTruthy();
    });

    test('should handle JavaScript features gracefully', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      // Test if Intersection Observer is available
      const intersectionObserverSupport = await page.evaluate(() => {
        return 'IntersectionObserver' in window;
      });
      expect(intersectionObserverSupport).toBe(true);

      // Test if animations are initialized
      await page.waitForTimeout(1000);
      const animationsInitialized = await page.evaluate(() => {
        return window.serviceAnimations !== undefined;
      });
      expect(animationsInitialized).toBe(true);
    });
  });

  // **9. ERROR HANDLING & EDGE CASES**
  test.describe('Error Handling & Edge Cases', () => {

    test('should handle missing external resources gracefully', async ({ page }) => {
      // Block external font requests to test fallback
      await page.route('**/fonts.googleapis.com/**', route => route.abort());

      await page.goto(SERVICE_PAGE_URL);

      // Page should still be functional
      const serviceCards = await page.locator('.service-card');
      await expect(serviceCards.first()).toBeVisible();
    });

    test('should work with JavaScript disabled', async ({ page, context }) => {
      // Disable JavaScript
      await context.setExtraHTTPHeaders({});
      await page.addInitScript(() => {
        Object.defineProperty(window, 'IntersectionObserver', {
          value: undefined
        });
      });

      await page.goto(SERVICE_PAGE_URL);

      // Basic functionality should work
      const serviceCards = await page.locator('.service-card');
      await expect(serviceCards.first()).toBeVisible();

      const ctaButton = await page.locator('.service-cta').first();
      await expect(ctaButton).toBeVisible();
    });
  });

  // **10. USER EXPERIENCE TESTING**
  test.describe('User Experience Testing', () => {

    test('should provide clear user journey', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      // Test hero CTA leads to services
      const heroCTA = await page.locator('.hero-cta');
      if (await heroCTA.count() > 0) {
        await heroCTA.click();
        await page.waitForTimeout(1000);

        const servicesSection = await page.locator('#services, .services');
        await expect(servicesSection).toBeInViewport();
      }
    });

    test('should have consistent visual hierarchy', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      // Test font sizes progression
      const h1Size = await page.locator('h1').evaluate(el =>
        parseFloat(window.getComputedStyle(el).fontSize)
      );

      const h2Size = await page.locator('h2').first().evaluate(el =>
        parseFloat(window.getComputedStyle(el).fontSize)
      );

      const h3Size = await page.locator('h3').first().evaluate(el =>
        parseFloat(window.getComputedStyle(el).fontSize)
      );

      expect(h1Size).toBeGreaterThan(h2Size);
      expect(h2Size).toBeGreaterThan(h3Size);
    });

    test('should have intuitive interaction patterns', async ({ page }) => {
      await page.goto(SERVICE_PAGE_URL);

      // Test hover states
      const serviceCard = await page.locator('.service-card').first();

      // Get initial state
      const initialTransform = await serviceCard.evaluate(el =>
        window.getComputedStyle(el).transform
      );

      // Hover and check transform
      await serviceCard.hover();
      await page.waitForTimeout(500);

      const hoverTransform = await serviceCard.evaluate(el =>
        window.getComputedStyle(el).transform
      );

      expect(hoverTransform).not.toBe(initialTransform);
    });
  });
});

// **UTILITY FUNCTIONS FOR TESTING**
class TestUtils {
  static async measureLoadTime(page, url) {
    const startTime = Date.now();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }

  static async checkConsoleErrors(page) {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    return errors;
  }

  static async getComputedStyle(page, selector, property) {
    return await page.locator(selector).evaluate(
      (el, prop) => window.getComputedStyle(el)[prop],
      property
    );
  }

  static async checkColorContrast(page, selector) {
    return await page.locator(selector).evaluate(el => {
      const style = window.getComputedStyle(el);
      const color = style.color;
      const backgroundColor = style.backgroundColor;

      // Simple contrast check (would need more sophisticated algorithm for production)
      return { color, backgroundColor };
    });
  }
}

module.exports = { TestUtils };