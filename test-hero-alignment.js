const { test, expect } = require('@playwright/test');

test.describe('Hero Section Alignment Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('Web Design page hero alignment', async ({ page }) => {
    await page.goto('http://localhost:8080/website/web-design.html');

    // Wait for hero section to load
    await page.waitForSelector('.web-design-hero');

    // Get hero section properties
    const heroSection = await page.locator('.web-design-hero');
    const heroContent = await page.locator('.hero-content');

    // Check hero section height
    const heroBounds = await heroSection.boundingBox();
    console.log('Web Design Hero Height:', heroBounds.height);
    console.log('Web Design Hero fits in viewport:', heroBounds.height <= 1080);

    // Check text alignment
    const contentStyles = await heroContent.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        textAlign: computed.textAlign,
        maxWidth: computed.maxWidth,
        margin: computed.margin,
        display: computed.display
      };
    });
    console.log('Web Design Hero Content Styles:', contentStyles);

    // Check individual elements
    const title = await page.locator('.hero-title');
    const titleText = await title.textContent();
    const titleStyles = await title.evaluate(el => {
      const computed = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        textAlign: computed.textAlign,
        left: rect.left,
        width: rect.width,
        centered: Math.abs((rect.left + rect.width/2) - window.innerWidth/2) < 10
      };
    });
    console.log('Web Design Title:', titleText.trim());
    console.log('Web Design Title Alignment:', titleStyles);

    const description = await page.locator('.hero-description');
    const descStyles = await description.evaluate(el => {
      const computed = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        textAlign: computed.textAlign,
        maxWidth: computed.maxWidth,
        margin: computed.margin,
        left: rect.left,
        width: rect.width,
        centered: Math.abs((rect.left + rect.width/2) - window.innerWidth/2) < 10
      };
    });
    console.log('Web Design Description Alignment:', descStyles);

    // Take screenshot
    await page.screenshot({
      path: 'web-design-hero-alignment.png',
      fullPage: false
    });
  });

  test('Google Ads page hero alignment', async ({ page }) => {
    await page.goto('http://localhost:8080/website/google-ads.html');

    // Wait for hero section to load
    await page.waitForSelector('.google-ads-hero');

    // Get hero section properties
    const heroSection = await page.locator('.google-ads-hero');
    const heroContent = await page.locator('.hero-content');

    // Check hero section height
    const heroBounds = await heroSection.boundingBox();
    console.log('Google Ads Hero Height:', heroBounds.height);
    console.log('Google Ads Hero fits in viewport:', heroBounds.height <= 1080);

    // Check text alignment
    const contentStyles = await heroContent.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        textAlign: computed.textAlign,
        maxWidth: computed.maxWidth,
        margin: computed.margin,
        display: computed.display
      };
    });
    console.log('Google Ads Hero Content Styles:', contentStyles);

    // Check individual elements
    const title = await page.locator('.hero-title');
    const titleText = await title.textContent();
    const titleStyles = await title.evaluate(el => {
      const computed = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        textAlign: computed.textAlign,
        left: rect.left,
        width: rect.width,
        centered: Math.abs((rect.left + rect.width/2) - window.innerWidth/2) < 10
      };
    });
    console.log('Google Ads Title:', titleText.trim());
    console.log('Google Ads Title Alignment:', titleStyles);

    const description = await page.locator('.hero-description');
    const descStyles = await description.evaluate(el => {
      const computed = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        textAlign: computed.textAlign,
        maxWidth: computed.maxWidth,
        margin: computed.margin,
        left: rect.left,
        width: rect.width,
        centered: Math.abs((rect.left + rect.width/2) - window.innerWidth/2) < 10
      };
    });
    console.log('Google Ads Description Alignment:', descStyles);

    // Take screenshot
    await page.screenshot({
      path: 'google-ads-hero-alignment.png',
      fullPage: false
    });
  });

  test('SEO page hero alignment (reference)', async ({ page }) => {
    await page.goto('http://localhost:8080/website/seo.html');

    // Wait for hero section to load
    await page.waitForSelector('.seo-hero');

    // Get hero section properties
    const heroSection = await page.locator('.seo-hero');
    const heroContent = await page.locator('.seo-hero-content');

    // Check hero section height
    const heroBounds = await heroSection.boundingBox();
    console.log('SEO Hero Height:', heroBounds.height);
    console.log('SEO Hero fits in viewport:', heroBounds.height <= 1080);

    // Check text alignment
    const contentStyles = await heroContent.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        textAlign: computed.textAlign,
        maxWidth: computed.maxWidth,
        margin: computed.margin,
        display: computed.display
      };
    });
    console.log('SEO Hero Content Styles (Reference):', contentStyles);

    // Take screenshot
    await page.screenshot({
      path: 'seo-hero-alignment-reference.png',
      fullPage: false
    });
  });
});