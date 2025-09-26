const { test, expect, chromium } = require('@playwright/test');

const BASE_URL = 'http://new.theprofitplatform.com.au';

// List of main pages to test
const MAIN_PAGES = [
  { name: 'Homepage', path: '/' },
  { name: 'About', path: '/about/' },
  { name: 'Portfolio', path: '/portfolio/' },
  { name: 'Pricing', path: '/pricing/' },
  { name: 'Contact', path: '/contact/' },
  { name: 'Google Ads', path: '/google-ads/' },
  { name: 'SEO Services', path: '/seo-services/' },
  { name: 'Web Design', path: '/web-design/' }
];

// Critical elements that should be on every page
const CRITICAL_ELEMENTS = {
  navbar: 'nav, .navbar, #navbar, [data-nav-loaded]',
  heroSection: '.hero-section, .hero-gradient-mesh, section.hero, .jumbotron',
  footer: 'footer, .footer',
  cta: '.btn-primary-modern, .btn-cta, a[href*="contact"]'
};

test.describe('Comprehensive Site Testing', () => {

  test.describe('Page Load Performance', () => {
    MAIN_PAGES.forEach(page => {
      test(`${page.name} - Load Time < 3s`, async ({ page: browserPage }) => {
        const startTime = Date.now();
        const response = await browserPage.goto(BASE_URL + page.path, { waitUntil: 'networkidle' });
        const loadTime = Date.now() - startTime;

        expect(response.status()).toBe(200);
        expect(loadTime).toBeLessThan(3000);

        // Check for console errors
        const errors = [];
        browserPage.on('console', msg => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        });

        await browserPage.waitForTimeout(1000);
        expect(errors.length).toBe(0);
      });
    });
  });

  test.describe('Visual Consistency', () => {
    MAIN_PAGES.forEach(page => {
      test(`${page.name} - Design Elements Present`, async ({ page: browserPage }) => {
        await browserPage.goto(BASE_URL + page.path);

        // Check for modern design classes
        const hasGlassmorphism = await browserPage.locator('.bg-glass, .card-modern').count();
        const hasGradients = await browserPage.locator('.bg-gradient-hero, .hero-gradient-mesh').count();
        const hasFloatingElements = await browserPage.locator('.floating-orb, .hero-floating-elements').count();

        expect(hasGlassmorphism + hasGradients + hasFloatingElements).toBeGreaterThan(0);

        // Check typography consistency
        const headings = await browserPage.locator('h1, h2').all();
        for (const heading of headings) {
          const classes = await heading.getAttribute('class');
          expect(classes).toMatch(/gradient|modern|hero/i);
        }
      });
    });
  });

  test.describe('Navigation Functionality', () => {
    test('Navigation menu loads and works', async ({ page }) => {
      await page.goto(BASE_URL);

      // Wait for navigation to load
      await page.waitForSelector('[data-nav-loaded="true"]', { timeout: 5000 });

      // Check if navbar is visible
      const navbar = await page.locator('nav, .navbar, #navbar').first();
      await expect(navbar).toBeVisible();

      // Test menu links
      const menuLinks = await page.locator('nav a, .navbar a').all();
      expect(menuLinks.length).toBeGreaterThan(3);

      // Click About link and verify navigation
      const aboutLink = await page.locator('a[href*="about"]').first();
      if (await aboutLink.isVisible()) {
        await aboutLink.click();
        await page.waitForURL(/about/);
        expect(page.url()).toContain('about');
      }
    });

    test('No navbar loading delay', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(BASE_URL);

      // Navbar should be visible within 500ms
      await page.waitForSelector('[data-nav-loaded="true"]', { timeout: 500 });
      const navLoadTime = Date.now() - startTime;

      expect(navLoadTime).toBeLessThan(500);
    });
  });

  test.describe('Mobile Responsiveness', () => {
    const devices = [
      { name: 'iPhone 12', viewport: { width: 390, height: 844 } },
      { name: 'iPad', viewport: { width: 768, height: 1024 } },
      { name: 'Desktop', viewport: { width: 1920, height: 1080 } }
    ];

    devices.forEach(device => {
      test(`${device.name} - Responsive Layout`, async ({ browser }) => {
        const context = await browser.newContext({
          viewport: device.viewport,
          userAgent: 'Mozilla/5.0 (compatible; Testing)'
        });
        const page = await context.newPage();

        await page.goto(BASE_URL);

        // Check if content is properly contained
        const container = await page.locator('.container, .container-modern').first();
        const containerWidth = await container.boundingBox();

        if (device.viewport.width < 768) {
          // Mobile: Check for stacked layout
          const cards = await page.locator('.card-modern, .card').all();
          if (cards.length > 0) {
            const firstCard = await cards[0].boundingBox();
            expect(firstCard.width).toBeLessThan(device.viewport.width - 40);
          }
        } else {
          // Desktop: Check for grid layout
          const grid = await page.locator('.grid, .grid-modern').first();
          if (await grid.isVisible()) {
            const gridClasses = await grid.getAttribute('class');
            expect(gridClasses).toMatch(/grid|flex/i);
          }
        }

        await context.close();
      });
    });
  });

  test.describe('JavaScript Functionality', () => {
    test('AOS animations initialize', async ({ page }) => {
      await page.goto(BASE_URL);

      // Check if AOS is loaded
      const aosElements = await page.locator('[data-aos]').count();
      expect(aosElements).toBeGreaterThan(0);

      // Trigger scroll to activate animations
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(500);

      // Check if animations have been triggered
      const animatedElements = await page.locator('[data-aos].aos-animate').count();
      expect(animatedElements).toBeGreaterThan(0);
    });

    test('No JavaScript errors', async ({ page }) => {
      const errors = [];

      page.on('pageerror', error => {
        errors.push(error.message);
      });

      await page.goto(BASE_URL);
      await page.waitForTimeout(2000);

      expect(errors).toHaveLength(0);
    });
  });

  test.describe('Forms and CTAs', () => {
    test('Contact form exists and is functional', async ({ page }) => {
      await page.goto(BASE_URL + '/contact/');

      // Check for form presence
      const form = await page.locator('form').first();
      await expect(form).toBeVisible();

      // Check for required fields
      const nameField = await page.locator('input[name*="name"], input[type="text"]').first();
      const emailField = await page.locator('input[type="email"]').first();
      const submitButton = await page.locator('button[type="submit"], input[type="submit"]').first();

      await expect(nameField).toBeVisible();
      await expect(emailField).toBeVisible();
      await expect(submitButton).toBeVisible();

      // Test field interaction
      await nameField.fill('Test User');
      await emailField.fill('test@example.com');

      const nameValue = await nameField.inputValue();
      const emailValue = await emailField.inputValue();

      expect(nameValue).toBe('Test User');
      expect(emailValue).toBe('test@example.com');
    });

    test('CTA buttons are clickable', async ({ page }) => {
      await page.goto(BASE_URL);

      const ctaButtons = await page.locator('.btn-primary-modern, .btn-cta, a[href*="contact"]').all();
      expect(ctaButtons.length).toBeGreaterThan(0);

      // Test first CTA button
      const firstCta = ctaButtons[0];
      await expect(firstCta).toBeVisible();

      // Check hover state changes
      const initialStyles = await firstCta.evaluate(el => getComputedStyle(el).transform);
      await firstCta.hover();
      await page.waitForTimeout(300);
      const hoverStyles = await firstCta.evaluate(el => getComputedStyle(el).transform);

      // Transform should change on hover (translateY effect)
      expect(initialStyles).not.toBe(hoverStyles);
    });
  });

  test.describe('SEO and Meta Tags', () => {
    MAIN_PAGES.forEach(page => {
      test(`${page.name} - SEO Elements Present`, async ({ page: browserPage }) => {
        await browserPage.goto(BASE_URL + page.path);

        // Check title tag
        const title = await browserPage.title();
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(10);
        expect(title.length).toBeLessThan(70);

        // Check meta description
        const metaDescription = await browserPage.locator('meta[name="description"]').getAttribute('content');
        expect(metaDescription).toBeTruthy();
        expect(metaDescription.length).toBeGreaterThan(50);
        expect(metaDescription.length).toBeLessThan(160);

        // Check viewport meta
        const viewport = await browserPage.locator('meta[name="viewport"]').getAttribute('content');
        expect(viewport).toContain('width=device-width');

        // Check canonical URL
        const canonical = await browserPage.locator('link[rel="canonical"]').getAttribute('href');
        if (canonical) {
          expect(canonical).toContain('theprofitplatform.com.au');
        }

        // Check Open Graph tags
        const ogTitle = await browserPage.locator('meta[property="og:title"]').getAttribute('content');
        if (ogTitle) {
          expect(ogTitle).toBeTruthy();
        }
      });
    });
  });

  test.describe('404 and Error Handling', () => {
    test('404 pages return proper status', async ({ page }) => {
      const response = await page.goto(BASE_URL + '/non-existent-page-12345/', { waitUntil: 'networkidle' });
      expect(response.status()).toBe(404);
    });

    test('Broken links detection', async ({ page }) => {
      await page.goto(BASE_URL);

      const links = await page.locator('a[href]').all();
      const brokenLinks = [];

      for (const link of links.slice(0, 20)) { // Test first 20 links
        const href = await link.getAttribute('href');
        if (href && href.startsWith('http')) {
          const response = await page.request.get(href).catch(() => null);
          if (!response || response.status() >= 400) {
            brokenLinks.push(href);
          }
        }
      }

      expect(brokenLinks).toHaveLength(0);
    });
  });

  test.describe('Performance Metrics', () => {
    test('Core Web Vitals', async ({ page }) => {
      await page.goto(BASE_URL);

      // Measure LCP (Largest Contentful Paint)
      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.renderTime || lastEntry.loadTime);
          }).observe({ type: 'largest-contentful-paint', buffered: true });

          setTimeout(() => resolve(0), 5000);
        });
      });

      expect(lcp).toBeLessThan(2500); // Good LCP is < 2.5s

      // Check resource loading
      const resources = await page.evaluate(() => {
        return performance.getEntriesByType('resource').map(r => ({
          name: r.name,
          duration: r.duration,
          size: r.transferSize
        }));
      });

      // Check for oversized resources
      const largeResources = resources.filter(r => r.size > 500000); // 500KB
      expect(largeResources.length).toBe(0);
    });
  });
});

// Run tests and generate report
console.log('Starting comprehensive site testing...');
console.log('Target: ' + BASE_URL);
console.log('Test Categories:');
console.log('  ✓ Page Load Performance');
console.log('  ✓ Visual Consistency');
console.log('  ✓ Navigation Functionality');
console.log('  ✓ Mobile Responsiveness');
console.log('  ✓ JavaScript Functionality');
console.log('  ✓ Forms and CTAs');
console.log('  ✓ SEO and Meta Tags');
console.log('  ✓ 404 and Error Handling');
console.log('  ✓ Performance Metrics');