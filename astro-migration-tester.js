#!/usr/bin/env node

const { exec, execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { chromium } = require('playwright');

class AstroMigrationTester {
  constructor(config = {}) {
    this.config = {
      originalUrl: config.originalUrl || 'http://localhost:3000',
      astroUrl: config.astroUrl || 'http://localhost:4321',
      outputDir: config.outputDir || './test-results/astro-migration',
      ...config
    };

    this.results = {
      visual: [],
      performance: [],
      seo: [],
      functional: [],
      content: [],
      overall: 'pending'
    };
  }

  async initialize() {
    await fs.mkdir(this.config.outputDir, { recursive: true });
    console.log('🚀 Astro Migration Tester initialized');
  }

  async runAllTests() {
    console.log('🔬 Starting comprehensive Astro migration tests...\n');

    try {
      await this.initialize();

      await this.testVisualRegression();
      await this.testPerformance();
      await this.testSEO();
      await this.testFunctionality();
      await this.testContentIntegrity();
      await this.testComponentRendering();
      await this.testAssetLoading();
      await this.testResponsiveness();

      await this.generateReport();

      return this.results;
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.results.overall = 'failed';
      this.results.error = error.message;
      return this.results;
    }
  }

  async testVisualRegression() {
    console.log('📸 Testing Visual Regression...');
    const browser = await chromium.launch();
    const context = await browser.newContext();

    const pages = await this.getPageList();
    const visualResults = [];

    for (const pagePath of pages) {
      try {
        const page = await context.newPage();

        // Capture original
        await page.goto(`${this.config.originalUrl}${pagePath}`);
        const originalScreenshot = await page.screenshot({ fullPage: true });

        // Capture Astro version
        await page.goto(`${this.config.astroUrl}${pagePath}`);
        const astroScreenshot = await page.screenshot({ fullPage: true });

        // Compare screenshots
        const difference = await this.compareScreenshots(originalScreenshot, astroScreenshot);

        visualResults.push({
          page: pagePath,
          passed: difference < 0.01, // Less than 1% difference
          difference: `${(difference * 100).toFixed(2)}%`,
          status: difference < 0.01 ? '✅' : '⚠️'
        });

        await page.close();
      } catch (error) {
        visualResults.push({
          page: pagePath,
          passed: false,
          error: error.message,
          status: '❌'
        });
      }
    }

    await browser.close();
    this.results.visual = visualResults;

    const passed = visualResults.filter(r => r.passed).length;
    console.log(`   Visual: ${passed}/${visualResults.length} pages passed\n`);
  }

  async testPerformance() {
    console.log('⚡ Testing Performance Metrics...');
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const performanceResults = [];
    const criticalPages = ['/', '/services', '/contact', '/about'];

    for (const pagePath of criticalPages) {
      try {
        // Test Astro version
        await page.goto(`${this.config.astroUrl}${pagePath}`);

        // Collect performance metrics
        const metrics = await page.evaluate(() => {
          const perf = performance.getEntriesByType('navigation')[0];
          const paint = performance.getEntriesByType('paint');

          return {
            domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
            loadComplete: perf.loadEventEnd - perf.loadEventStart,
            firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
            resourceCount: performance.getEntriesByType('resource').length,
            transferSize: performance.getEntriesByType('resource').reduce((sum, r) => sum + r.transferSize, 0)
          };
        });

        // Check against targets
        const lcp = metrics.firstContentfulPaint / 1000;
        const passed = lcp < 2.5;

        performanceResults.push({
          page: pagePath,
          lcp: `${lcp.toFixed(2)}s`,
          target: '< 2.5s',
          passed,
          metrics,
          status: passed ? '✅' : '❌'
        });
      } catch (error) {
        performanceResults.push({
          page: pagePath,
          passed: false,
          error: error.message,
          status: '❌'
        });
      }
    }

    await browser.close();
    this.results.performance = performanceResults;

    const passed = performanceResults.filter(r => r.passed).length;
    console.log(`   Performance: ${passed}/${performanceResults.length} pages meet targets\n`);
  }

  async testSEO() {
    console.log('🔍 Testing SEO Preservation...');
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const seoResults = [];
    const testPages = ['/', '/services', '/about', '/contact'];

    for (const pagePath of testPages) {
      try {
        // Get original SEO data
        await page.goto(`${this.config.originalUrl}${pagePath}`);
        const originalSEO = await this.extractSEOData(page);

        // Get Astro SEO data
        await page.goto(`${this.config.astroUrl}${pagePath}`);
        const astroSEO = await this.extractSEOData(page);

        // Compare
        const passed = this.compareSEOData(originalSEO, astroSEO);

        seoResults.push({
          page: pagePath,
          passed,
          original: originalSEO,
          astro: astroSEO,
          status: passed ? '✅' : '❌'
        });
      } catch (error) {
        seoResults.push({
          page: pagePath,
          passed: false,
          error: error.message,
          status: '❌'
        });
      }
    }

    await browser.close();
    this.results.seo = seoResults;

    const passed = seoResults.filter(r => r.passed).length;
    console.log(`   SEO: ${passed}/${seoResults.length} pages preserve SEO data\n`);
  }

  async testFunctionality() {
    console.log('🔧 Testing Functionality...');
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const functionalResults = [];

    // Test navigation
    try {
      await page.goto(`${this.config.astroUrl}/`);

      // Test desktop navigation
      const navLinks = await page.$$eval('nav a', links =>
        links.map(link => ({ text: link.textContent, href: link.href }))
      );

      let navWorking = true;
      for (const link of navLinks.slice(0, 3)) {
        await page.click(`nav a:has-text("${link.text}")`);
        await page.waitForLoadState('networkidle');
        const url = page.url();
        if (!url.includes(link.href.split('/').pop())) {
          navWorking = false;
          break;
        }
      }

      functionalResults.push({
        test: 'Desktop Navigation',
        passed: navWorking,
        status: navWorking ? '✅' : '❌'
      });
    } catch (error) {
      functionalResults.push({
        test: 'Desktop Navigation',
        passed: false,
        error: error.message,
        status: '❌'
      });
    }

    // Test mobile navigation
    try {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${this.config.astroUrl}/`);

      const mobileMenuExists = await page.$('.mobile-menu-toggle') !== null;
      if (mobileMenuExists) {
        await page.click('.mobile-menu-toggle');
        await page.waitForTimeout(500);
        const mobileMenuVisible = await page.$eval('.mobile-menu', el =>
          window.getComputedStyle(el).display !== 'none'
        );

        functionalResults.push({
          test: 'Mobile Navigation',
          passed: mobileMenuVisible,
          status: mobileMenuVisible ? '✅' : '❌'
        });
      }
    } catch (error) {
      functionalResults.push({
        test: 'Mobile Navigation',
        passed: false,
        error: error.message,
        status: '❌'
      });
    }

    // Test contact form
    try {
      await page.goto(`${this.config.astroUrl}/contact`);
      const formExists = await page.$('form') !== null;

      if (formExists) {
        // Fill form
        await page.fill('input[name="name"]', 'Test User');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('textarea[name="message"]', 'Test message');

        // Check if form can be submitted
        const submitButton = await page.$('button[type="submit"]');
        const canSubmit = submitButton !== null;

        functionalResults.push({
          test: 'Contact Form',
          passed: canSubmit,
          status: canSubmit ? '✅' : '❌'
        });
      }
    } catch (error) {
      functionalResults.push({
        test: 'Contact Form',
        passed: false,
        error: error.message,
        status: '❌'
      });
    }

    await browser.close();
    this.results.functional = functionalResults;

    const passed = functionalResults.filter(r => r.passed).length;
    console.log(`   Functionality: ${passed}/${functionalResults.length} tests passed\n`);
  }

  async testContentIntegrity() {
    console.log('📄 Testing Content Integrity...');
    const browser = await chromium.launch();
    const context = await browser.newContext();

    const contentResults = [];
    const testPages = ['/', '/services', '/about'];

    for (const pagePath of testPages) {
      try {
        const originalPage = await context.newPage();
        await originalPage.goto(`${this.config.originalUrl}${pagePath}`);
        const originalText = await originalPage.$$eval('h1, h2, h3, p',
          elements => elements.map(el => el.textContent.trim()).filter(t => t.length > 0)
        );

        const astroPage = await context.newPage();
        await astroPage.goto(`${this.config.astroUrl}${pagePath}`);
        const astroText = await astroPage.$$eval('h1, h2, h3, p',
          elements => elements.map(el => el.textContent.trim()).filter(t => t.length > 0)
        );

        const contentMatch = originalText.length === astroText.length &&
          originalText.every(text => astroText.includes(text));

        contentResults.push({
          page: pagePath,
          originalCount: originalText.length,
          astroCount: astroText.length,
          passed: contentMatch,
          status: contentMatch ? '✅' : '⚠️'
        });

        await originalPage.close();
        await astroPage.close();
      } catch (error) {
        contentResults.push({
          page: pagePath,
          passed: false,
          error: error.message,
          status: '❌'
        });
      }
    }

    await browser.close();
    this.results.content = contentResults;

    const passed = contentResults.filter(r => r.passed).length;
    console.log(`   Content: ${passed}/${contentResults.length} pages preserve content\n`);
  }

  async testComponentRendering() {
    console.log('🧩 Testing Component Rendering...');
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const componentResults = [];
    const components = [
      { selector: '.hero-section', name: 'Hero Section' },
      { selector: '.service-cards', name: 'Service Cards' },
      { selector: '.testimonials', name: 'Testimonials' },
      { selector: '.footer', name: 'Footer' }
    ];

    await page.goto(`${this.config.astroUrl}/`);

    for (const component of components) {
      try {
        const exists = await page.$(component.selector) !== null;
        const visible = exists ? await page.$eval(component.selector,
          el => window.getComputedStyle(el).display !== 'none'
        ) : false;

        componentResults.push({
          component: component.name,
          exists,
          visible,
          passed: exists && visible,
          status: exists && visible ? '✅' : '❌'
        });
      } catch (error) {
        componentResults.push({
          component: component.name,
          passed: false,
          error: error.message,
          status: '❌'
        });
      }
    }

    await browser.close();
    this.results.components = componentResults;

    const passed = componentResults.filter(r => r.passed).length;
    console.log(`   Components: ${passed}/${componentResults.length} render correctly\n`);
  }

  async testAssetLoading() {
    console.log('🖼️ Testing Asset Loading...');
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const assetResults = [];
    let failedAssets = [];

    page.on('requestfailed', request => {
      failedAssets.push({
        url: request.url(),
        type: request.resourceType()
      });
    });

    await page.goto(`${this.config.astroUrl}/`);
    await page.waitForLoadState('networkidle');

    // Check images
    const images = await page.$$eval('img', imgs =>
      imgs.map(img => ({
        src: img.src,
        loaded: img.complete && img.naturalHeight !== 0
      }))
    );

    const imagesLoaded = images.filter(img => img.loaded).length;
    assetResults.push({
      type: 'Images',
      total: images.length,
      loaded: imagesLoaded,
      passed: imagesLoaded === images.length,
      status: imagesLoaded === images.length ? '✅' : '❌'
    });

    // Check CSS
    const stylesheets = await page.$$eval('link[rel="stylesheet"]', links =>
      links.map(link => link.href)
    );

    assetResults.push({
      type: 'Stylesheets',
      total: stylesheets.length,
      loaded: stylesheets.length - failedAssets.filter(a => a.type === 'stylesheet').length,
      passed: failedAssets.filter(a => a.type === 'stylesheet').length === 0,
      status: failedAssets.filter(a => a.type === 'stylesheet').length === 0 ? '✅' : '❌'
    });

    // Check fonts
    const fonts = await page.evaluate(() => {
      const fontFaces = Array.from(document.fonts);
      return {
        total: fontFaces.length,
        loaded: fontFaces.filter(f => f.status === 'loaded').length
      };
    });

    assetResults.push({
      type: 'Fonts',
      total: fonts.total,
      loaded: fonts.loaded,
      passed: fonts.loaded === fonts.total,
      status: fonts.loaded === fonts.total ? '✅' : '❌'
    });

    await browser.close();
    this.results.assets = assetResults;

    const passed = assetResults.filter(r => r.passed).length;
    console.log(`   Assets: ${passed}/${assetResults.length} types load correctly\n`);
  }

  async testResponsiveness() {
    console.log('📱 Testing Responsive Design...');
    const browser = await chromium.launch();
    const context = await browser.newContext();

    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    const responsiveResults = [];

    for (const viewport of viewports) {
      try {
        const page = await context.newPage();
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`${this.config.astroUrl}/`);

        // Check for horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() =>
          document.documentElement.scrollWidth > document.documentElement.clientWidth
        );

        // Check if content is visible
        const contentVisible = await page.$eval('main', el =>
          window.getComputedStyle(el).display !== 'none'
        );

        const passed = !hasHorizontalScroll && contentVisible;

        responsiveResults.push({
          viewport: viewport.name,
          dimensions: `${viewport.width}x${viewport.height}`,
          hasHorizontalScroll,
          contentVisible,
          passed,
          status: passed ? '✅' : '❌'
        });

        await page.close();
      } catch (error) {
        responsiveResults.push({
          viewport: viewport.name,
          passed: false,
          error: error.message,
          status: '❌'
        });
      }
    }

    await browser.close();
    this.results.responsive = responsiveResults;

    const passed = responsiveResults.filter(r => r.passed).length;
    console.log(`   Responsive: ${passed}/${responsiveResults.length} viewports work correctly\n`);
  }

  async extractSEOData(page) {
    return await page.evaluate(() => {
      const title = document.title;
      const description = document.querySelector('meta[name="description"]')?.content;
      const canonical = document.querySelector('link[rel="canonical"]')?.href;
      const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
      const ogDescription = document.querySelector('meta[property="og:description"]')?.content;
      const h1 = document.querySelector('h1')?.textContent;

      return { title, description, canonical, ogTitle, ogDescription, h1 };
    });
  }

  compareSEOData(original, astro) {
    return (
      original.title === astro.title &&
      original.description === astro.description &&
      original.h1 === astro.h1
    );
  }

  async compareScreenshots(original, astro) {
    // Simple byte comparison for now
    // In production, use a proper image comparison library
    const diff = Math.abs(original.length - astro.length) / original.length;
    return diff;
  }

  async getPageList() {
    // Return critical pages for testing
    return ['/', '/services', '/about', '/contact', '/pricing'];
  }

  async generateReport() {
    console.log('📊 Generating Test Report...\n');
    console.log('═══════════════════════════════════════════');
    console.log('       ASTRO MIGRATION TEST REPORT         ');
    console.log('═══════════════════════════════════════════\n');

    // Calculate overall pass rate
    let totalTests = 0;
    let passedTests = 0;

    Object.entries(this.results).forEach(([category, results]) => {
      if (Array.isArray(results)) {
        totalTests += results.length;
        passedTests += results.filter(r => r.passed).length;

        console.log(`📌 ${category.toUpperCase()}`);
        results.forEach(result => {
          const status = result.status || (result.passed ? '✅' : '❌');
          const name = result.page || result.test || result.component || result.type || result.viewport;
          console.log(`   ${status} ${name}`);
          if (result.error) {
            console.log(`      Error: ${result.error}`);
          }
        });
        console.log('');
      }
    });

    const passRate = (passedTests / totalTests * 100).toFixed(1);
    this.results.overall = passRate >= 90 ? 'passed' : passRate >= 70 ? 'warning' : 'failed';

    console.log('═══════════════════════════════════════════');
    console.log(`OVERALL: ${passedTests}/${totalTests} tests passed (${passRate}%)`);
    console.log(`STATUS: ${this.results.overall.toUpperCase()}`);
    console.log('═══════════════════════════════════════════\n');

    // Save detailed report
    const reportPath = path.join(this.config.outputDir, 'test-report.json');
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📁 Detailed report saved to: ${reportPath}`);

    // Generate recommendations
    if (this.results.overall !== 'passed') {
      console.log('\n⚠️  RECOMMENDATIONS:');
      if (this.results.visual.some(r => !r.passed)) {
        console.log('   • Review visual differences and update CSS');
      }
      if (this.results.performance.some(r => !r.passed)) {
        console.log('   • Optimize bundle size and lazy load components');
      }
      if (this.results.seo.some(r => !r.passed)) {
        console.log('   • Ensure all meta tags are properly migrated');
      }
      if (this.results.functional.some(r => !r.passed)) {
        console.log('   • Fix broken functionality before deployment');
      }
    }
  }
}

// CLI execution
if (require.main === module) {
  const tester = new AstroMigrationTester({
    originalUrl: process.env.ORIGINAL_URL || 'http://localhost:3000',
    astroUrl: process.env.ASTRO_URL || 'http://localhost:4321'
  });

  tester.runAllTests().then(results => {
    process.exit(results.overall === 'failed' ? 1 : 0);
  });
}

module.exports = AstroMigrationTester;