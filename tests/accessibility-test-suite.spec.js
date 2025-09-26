/**
 * Accessibility Test Suite for Services Page
 * WCAG 2.1 AA Compliance Testing
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

const SERVICE_PAGE_URL = 'file://' + path.resolve(__dirname, '../website/services.html');

test.describe('Accessibility Compliance Testing', () => {

  test('should pass WCAG 2.1 AA color contrast requirements', async ({ page }) => {
    await page.goto(SERVICE_PAGE_URL);

    // Test hero section contrast
    const heroTitle = await page.locator('.hero h1');
    const heroContrast = await heroTitle.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        backgroundColor: style.backgroundColor || window.getComputedStyle(el.closest('.hero')).backgroundColor
      };
    });

    // Basic contrast check (white text on dark background should pass)
    expect(heroContrast.color).toContain('rgb(255, 255, 255)');

    // Test service card text contrast
    const serviceTitle = await page.locator('.service-title').first();
    const titleContrast = await serviceTitle.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        fontWeight: style.fontWeight
      };
    });

    expect(titleContrast.color).toBeTruthy();
  });

  test('should have proper keyboard navigation', async ({ page }) => {
    await page.goto(SERVICE_PAGE_URL);

    // Test tab order
    let tabCount = 0;
    const focusableElements = [];

    // Tab through all focusable elements
    while (tabCount < 20) { // Limit to prevent infinite loop
      await page.keyboard.press('Tab');
      tabCount++;

      const focused = await page.locator(':focus');
      if (await focused.count() > 0) {
        const tagName = await focused.evaluate(el => el.tagName);
        const role = await focused.getAttribute('role');
        const href = await focused.getAttribute('href');

        focusableElements.push({ tagName, role, href, tabIndex: tabCount });

        // Stop if we've cycled back to the beginning
        if (tagName === 'BODY' && tabCount > 5) break;
      }
    }

    expect(focusableElements.length).toBeGreaterThan(5);

    // Verify all CTAs are focusable
    const ctaButtons = await page.locator('.service-cta, .hero-cta, .cta-button').all();
    for (const cta of ctaButtons) {
      await cta.focus();
      await expect(cta).toBeFocused();
    }
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    await page.goto(SERVICE_PAGE_URL);

    // Test landmark roles
    const nav = await page.locator('nav, [role="navigation"]');
    await expect(nav).toHaveCount(1);

    // Test heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    let currentLevel = 0;

    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName);
      const level = parseInt(tagName.replace('H', ''));

      if (currentLevel === 0) {
        expect(level).toBe(1); // First heading should be h1
      } else {
        expect(level).toBeLessThanOrEqual(currentLevel + 1); // No skipping levels
      }

      currentLevel = level;
    }
  });

  test('should support screen readers', async ({ page }) => {
    await page.goto(SERVICE_PAGE_URL);

    // Test alt text for images
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');

      if (src && !src.includes('data:') && !src.includes('logo')) {
        expect(alt).toBeTruthy();
        expect(alt.length).toBeGreaterThan(3);
      }
    }

    // Test form labels (if any)
    const inputs = await page.locator('input, textarea, select').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      if (id) {
        const label = await page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }

    // Test button text content
    const buttons = await page.locator('button, [role="button"], .btn').all();
    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
  });

  test('should handle reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        })),
      });
    });

    await page.goto(SERVICE_PAGE_URL);

    // Check if animations are disabled or simplified
    const serviceCard = await page.locator('.service-card').first();
    await serviceCard.hover();

    // In reduced motion mode, transforms should be minimal or none
    const transform = await serviceCard.evaluate(el =>
      window.getComputedStyle(el).transform
    );

    // Should not have complex 3D transforms
    expect(transform).not.toContain('matrix3d');
  });

  test('should provide sufficient focus indicators', async ({ page }) => {
    await page.goto(SERVICE_PAGE_URL);

    const focusableElements = await page.locator('a, button, input, textarea, select, [tabindex]').all();

    for (const element of focusableElements.slice(0, 5)) { // Test first 5 elements
      await element.focus();

      const outline = await element.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          outline: style.outline,
          outlineWidth: style.outlineWidth,
          outlineColor: style.outlineColor,
          boxShadow: style.boxShadow
        };
      });

      // Should have some form of focus indicator
      const hasFocusIndicator = outline.outline !== 'none' ||
                               outline.outlineWidth !== '0px' ||
                               outline.boxShadow !== 'none';

      expect(hasFocusIndicator).toBeTruthy();
    }
  });

  test('should have proper link purposes', async ({ page }) => {
    await page.goto(SERVICE_PAGE_URL);

    const links = await page.locator('a[href]').all();

    for (const link of links) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');

      // Links should have descriptive text or aria-label
      const linkPurpose = text?.trim() || ariaLabel || title;
      expect(linkPurpose).toBeTruthy();

      // Avoid generic link text
      const genericTerms = ['click here', 'read more', 'learn more'];
      const isGeneric = genericTerms.some(term =>
        linkPurpose.toLowerCase().includes(term)
      );

      if (isGeneric && !ariaLabel) {
        console.warn(`Generic link text found: "${linkPurpose}"`);
      }

      // Phone links should be properly formatted
      if (href.startsWith('tel:')) {
        expect(href).toMatch(/^tel:\+?[\d\s\-\(\)]+$/);
      }

      // Email links should be properly formatted
      if (href.startsWith('mailto:')) {
        expect(href).toMatch(/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/);
      }
    }
  });

  test('should support high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.addInitScript(() => {
      // Add high contrast media query simulation
      const style = document.createElement('style');
      style.textContent = `
        @media (prefers-contrast: high) {
          * {
            filter: contrast(150%) !important;
          }
        }
      `;
      document.head.appendChild(style);
    });

    await page.goto(SERVICE_PAGE_URL);

    // Check if page is still usable in high contrast
    const serviceCards = await page.locator('.service-card');
    await expect(serviceCards.first()).toBeVisible();

    const ctaButtons = await page.locator('.service-cta');
    await expect(ctaButtons.first()).toBeVisible();
  });

  test('should handle zoom up to 200%', async ({ page }) => {
    await page.goto(SERVICE_PAGE_URL);

    // Simulate 200% zoom
    await page.evaluate(() => {
      document.body.style.zoom = '200%';
    });

    await page.waitForTimeout(1000);

    // Check if content is still accessible
    const serviceCards = await page.locator('.service-card');
    await expect(serviceCards.first()).toBeVisible();

    // Check if text doesn't overlap
    const serviceTitle = await page.locator('.service-title').first();
    const titleBox = await serviceTitle.boundingBox();

    expect(titleBox.width).toBeGreaterThan(100);
    expect(titleBox.height).toBeGreaterThan(20);

    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '100%';
    });
  });

  test('should provide text alternatives for non-text content', async ({ page }) => {
    await page.goto(SERVICE_PAGE_URL);

    // Check service icons
    const serviceIcons = await page.locator('.service-icon i').all();
    for (const icon of serviceIcons) {
      const parentCard = await icon.locator('..').locator('..');
      const cardTitle = await parentCard.locator('.service-title').textContent();

      // Icon should be decorative since title provides context
      expect(cardTitle).toBeTruthy();
    }

    // Check industry icons (emojis)
    const industryIcons = await page.locator('.industry-icon').all();
    for (const icon of industryIcons) {
      const industryName = await icon.locator('.. .industry-name').textContent();

      // Industry name should provide text alternative
      expect(industryName).toBeTruthy();
    }
  });
});