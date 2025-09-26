const { test, expect } = require('@playwright/test');

// Test configuration - Test against actual files instead of server
const CRITICAL_PAGES = [
  'index.html',
  'about.html',
  'services.html',
  'contact.html',
  'portfolio.html'
];

test.describe('Focused UI/UX Validation', () => {

  test.describe('File Structure Validation', () => {
    CRITICAL_PAGES.forEach(page => {
      test(`${page} - File exists and has content`, async ({ page: pw }) => {
        // Test file access directly
        await pw.goto(`file:///home/abhi/projects/tpp/website/${page}`);

        // Check page loads
        await expect(pw.locator('html')).toBeVisible();
        await expect(pw.locator('body')).toBeVisible();

        // Check basic structure
        const title = await pw.locator('title').textContent();
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(10);

        console.log(`✅ ${page}: Title - "${title}"`);
      });
    });
  });

  test.describe('Navigation Structure Analysis', () => {
    CRITICAL_PAGES.forEach(page => {
      test(`${page} - Navigation elements analysis`, async ({ page: pw }) => {
        await pw.goto(`file:///home/abhi/projects/tpp/website/${page}`);

        // Check for any navigation element
        const navElements = await pw.locator('nav, header, .nav, .navigation, [role="navigation"]').count();
        const logoElements = await pw.locator('.logo, .brand, [class*="logo"]').count();
        const menuElements = await pw.locator('.menu, .nav-links, [class*="nav"]').count();

        console.log(`${page} Navigation Analysis:`, {
          navElements,
          logoElements,
          menuElements,
          hasNavigation: navElements > 0,
          hasLogo: logoElements > 0,
          hasMenu: menuElements > 0
        });

        // At least some navigation structure should exist
        expect(navElements + logoElements + menuElements).toBeGreaterThan(0);
      });
    });
  });

  test.describe('Interactive Elements Validation', () => {
    CRITICAL_PAGES.forEach(page => {
      test(`${page} - Interactive elements count and classes`, async ({ page: pw }) => {
        await pw.goto(`file:///home/abhi/projects/tpp/website/${page}`);

        // Count enhanced interactive elements
        const interactiveElements = await pw.locator('.interactive-element').count();
        const buttons = await pw.locator('button, .btn, [role="button"]').count();
        const links = await pw.locator('a[href]').count();
        const phoneLinks = await pw.locator('a[href^="tel:"], .phone-link').count();
        const ctaElements = await pw.locator('.cta, .cta-link, [class*="cta"]').count();

        const metrics = {
          interactiveElements,
          buttons,
          links,
          phoneLinks,
          ctaElements,
          totalInteractive: interactiveElements + buttons + links
        };

        console.log(`${page} Interactive Elements:`, metrics);

        // Validate enhancements
        expect(metrics.totalInteractive).toBeGreaterThan(0);
        expect(metrics.links).toBeGreaterThan(3); // Should have multiple links

        if (phoneLinks > 0) {
          // Test phone link format
          const phoneHrefs = await pw.locator('a[href^="tel:"]').evaluateAll(links =>
            links.map(link => link.href)
          );
          phoneHrefs.forEach(href => {
            expect(href).toMatch(/^tel:\+?[\d\s\-\(\)]+$/);
          });
        }
      });
    });
  });

  test.describe('CSS Enhancements Validation', () => {
    test('CSS files exist and are properly linked', async ({ page }) => {
      await page.goto(`file:///home/abhi/projects/tpp/website/index.html`);

      // Check for CSS links
      const cssLinks = await page.locator('link[rel="stylesheet"]').evaluateAll(links =>
        links.map(link => ({ href: link.href, exists: link.href !== '' }))
      );

      const inlineStyles = await page.locator('style').count();

      console.log('CSS Analysis:', {
        externalCSS: cssLinks.length,
        inlineStyles,
        cssFiles: cssLinks.map(link => link.href.split('/').pop())
      });

      // Should have CSS styling
      expect(cssLinks.length + inlineStyles).toBeGreaterThan(0);
    });

    test('UX enhancements CSS is applied', async ({ page }) => {
      await page.goto(`file:///home/abhi/projects/tpp/website/index.html`);

      // Check if our enhanced CSS classes are present in DOM
      const enhancedClasses = await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        const classes = new Set();

        allElements.forEach(el => {
          el.classList.forEach(cls => {
            if (cls.includes('interactive') || cls.includes('enhanced') ||
                cls.includes('phone-link') || cls.includes('cta-link')) {
              classes.add(cls);
            }
          });
        });

        return Array.from(classes);
      });

      console.log('Enhanced CSS Classes Found:', enhancedClasses);

      // Should have our enhanced classes
      expect(enhancedClasses.length).toBeGreaterThan(0);
    });
  });

  test.describe('Form Validation', () => {
    test('Contact form structure and validation', async ({ page }) => {
      await page.goto(`file:///home/abhi/projects/tpp/website/contact.html`);

      const forms = await page.locator('form').count();
      const inputs = await page.locator('input').count();
      const textareas = await page.locator('textarea').count();
      const selects = await page.locator('select').count();

      const formAnalysis = {
        forms,
        inputs,
        textareas,
        selects,
        totalFormElements: inputs + textareas + selects
      };

      console.log('Contact Form Analysis:', formAnalysis);

      if (forms > 0) {
        // Check form elements have proper attributes
        const requiredFields = await page.locator('input[required], textarea[required]').count();
        const emailFields = await page.locator('input[type="email"]').count();
        const telFields = await page.locator('input[type="tel"]').count();

        console.log('Form Validation:', {
          requiredFields,
          emailFields,
          telFields,
          hasValidation: requiredFields > 0
        });

        expect(formAnalysis.totalFormElements).toBeGreaterThan(2);
      }
    });
  });

  test.describe('Performance Asset Analysis', () => {
    test('Asset optimization analysis', async ({ page }) => {
      await page.goto(`file:///home/abhi/projects/tpp/website/index.html`);

      // Analyze loaded resources
      const resourceAnalysis = await page.evaluate(() => {
        const images = Array.from(document.images);
        const scripts = Array.from(document.scripts);
        const stylesheets = Array.from(document.styleSheets);

        return {
          images: {
            total: images.length,
            withAlt: images.filter(img => img.alt && img.alt.trim() !== '').length,
            withSrc: images.filter(img => img.src && img.src !== '').length
          },
          scripts: {
            total: scripts.length,
            external: scripts.filter(script => script.src && script.src !== '').length,
            inline: scripts.filter(script => !script.src && script.innerHTML.trim() !== '').length
          },
          stylesheets: {
            total: stylesheets.length
          }
        };
      });

      console.log('Asset Analysis:', resourceAnalysis);

      // Validate asset optimization
      expect(resourceAnalysis.images.withAlt).toBe(resourceAnalysis.images.total); // All images should have alt text
      expect(resourceAnalysis.scripts.total).toBeLessThan(20); // Reasonable script count
      expect(resourceAnalysis.stylesheets.total).toBeLessThan(15); // Reasonable CSS count
    });
  });

  test.describe('Accessibility Validation', () => {
    CRITICAL_PAGES.slice(0, 3).forEach(page => {
      test(`${page} - Accessibility structure`, async ({ page: pw }) => {
        await pw.goto(`file:///home/abhi/projects/tpp/website/${page}`);

        // Check heading structure
        const headings = await pw.evaluate(() => {
          const headingElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
          return headingElements.map(h => ({
            tag: h.tagName.toLowerCase(),
            text: h.textContent.trim().substring(0, 50),
            hasContent: h.textContent.trim() !== ''
          }));
        });

        const h1Count = headings.filter(h => h.tag === 'h1').length;
        const headingsWithContent = headings.filter(h => h.hasContent).length;

        console.log(`${page} Accessibility:`, {
          totalHeadings: headings.length,
          h1Count,
          headingsWithContent,
          headingStructure: headings.slice(0, 5)
        });

        // Accessibility requirements
        expect(h1Count).toBe(1); // Exactly one H1
        expect(headingsWithContent).toBe(headings.length); // All headings have content
        expect(headings.length).toBeGreaterThan(1); // Multiple heading levels
      });
    });
  });

  test.describe('Mobile Responsiveness Analysis', () => {
    test('Responsive design meta tags and CSS', async ({ page }) => {
      await page.goto(`file:///home/abhi/projects/tpp/website/index.html`);

      // Check viewport meta tag
      const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');

      // Check for responsive CSS
      const responsiveCSS = await page.evaluate(() => {
        const stylesheets = Array.from(document.styleSheets);
        let hasMediaQueries = false;

        try {
          stylesheets.forEach(sheet => {
            if (sheet.cssRules) {
              Array.from(sheet.cssRules).forEach(rule => {
                if (rule.type === CSSRule.MEDIA_RULE) {
                  hasMediaQueries = true;
                }
              });
            }
          });
        } catch (e) {
          // Handle cross-origin CSS
        }

        return { hasMediaQueries };
      });

      console.log('Responsive Design Check:', {
        hasViewportMeta: !!viewportMeta,
        viewportContent: viewportMeta,
        hasMediaQueries: responsiveCSS.hasMediaQueries
      });

      // Responsive requirements
      expect(viewportMeta).toBeTruthy();
      expect(viewportMeta).toContain('width=device-width');
    });
  });

  test.describe('Enhancement Verification', () => {
    test('Enhanced phone numbers validation', async ({ page }) => {
      await page.goto(`file:///home/abhi/projects/tpp/website/index.html`);

      // Find all phone links and verify format
      const phoneLinks = await page.locator('a[href^="tel:"]').evaluateAll(links =>
        links.map(link => ({
          href: link.href,
          text: link.textContent.trim(),
          hasInternationalFormat: link.href.includes('+61'),
          classes: Array.from(link.classList)
        }))
      );

      console.log('Phone Links Analysis:', phoneLinks);

      phoneLinks.forEach(phone => {
        // Should have international format
        expect(phone.href).toMatch(/^tel:\+?[\d\s\-\(\)]+$/);

        // Should have enhanced classes
        if (phone.classes.length > 0) {
          const hasEnhancedClass = phone.classes.some(cls =>
            cls.includes('phone') || cls.includes('interactive')
          );
          expect(hasEnhancedClass).toBeTruthy();
        }
      });
    });

    test('CTA enhancement validation', async ({ page }) => {
      await page.goto(`file:///home/abhi/projects/tpp/website/contact.html`);

      // Find enhanced CTA elements
      const ctaElements = await page.locator('.cta-link, .cta, [class*="cta"]').evaluateAll(elements =>
        elements.map(el => ({
          tag: el.tagName.toLowerCase(),
          classes: Array.from(el.classList),
          text: el.textContent.trim().substring(0, 30),
          href: el.href || null,
          hasInteractiveClass: el.classList.contains('interactive-element')
        }))
      );

      console.log('CTA Elements Analysis:', ctaElements);

      // Should have CTA elements
      expect(ctaElements.length).toBeGreaterThan(0);

      // Validate enhancement classes
      const enhancedCTAs = ctaElements.filter(cta =>
        cta.hasInteractiveClass || cta.classes.some(cls => cls.includes('cta'))
      );

      expect(enhancedCTAs.length).toBeGreaterThan(0);
    });
  });

  test.describe('Final Validation Summary', () => {
    test('Complete enhancement verification', async ({ page }) => {
      const results = {};

      for (const pageName of CRITICAL_PAGES.slice(0, 3)) {
        await page.goto(`file:///home/abhi/projects/tpp/website/${pageName}`);

        const pageAnalysis = await page.evaluate(() => {
          return {
            hasNavigation: !!document.querySelector('nav, header, .nav, [role="navigation"]'),
            interactiveElements: document.querySelectorAll('.interactive-element').length,
            phoneLinks: document.querySelectorAll('a[href^="tel:"]').length,
            ctaElements: document.querySelectorAll('.cta, .cta-link, [class*="cta"]').length,
            hasH1: document.querySelectorAll('h1').length === 1,
            hasViewportMeta: !!document.querySelector('meta[name="viewport"]'),
            hasTitle: !!document.title && document.title.length > 10,
            imageCount: document.images.length,
            imagesWithAlt: Array.from(document.images).filter(img => img.alt).length
          };
        });

        results[pageName] = pageAnalysis;
      }

      console.log('\n🔍 COMPREHENSIVE ENHANCEMENT SUMMARY:');
      console.log('=====================================');

      Object.entries(results).forEach(([page, data]) => {
        console.log(`\n📄 ${page.toUpperCase()}:`);
        console.log(`   ✅ Navigation: ${data.hasNavigation ? 'Present' : 'Missing'}`);
        console.log(`   🎯 Interactive Elements: ${data.interactiveElements}`);
        console.log(`   📞 Phone Links: ${data.phoneLinks}`);
        console.log(`   🎨 CTA Elements: ${data.ctaElements}`);
        console.log(`   📱 Mobile Ready: ${data.hasViewportMeta ? 'Yes' : 'No'}`);
        console.log(`   ♿ Accessibility: H1=${data.hasH1}, Images=${data.imagesWithAlt}/${data.imageCount}`);
        console.log(`   📊 SEO Ready: ${data.hasTitle ? 'Yes' : 'No'}`);
      });

      // Overall validation
      const allPages = Object.values(results);
      const successMetrics = {
        navigationCoverage: allPages.filter(p => p.hasNavigation).length / allPages.length,
        interactiveTotal: allPages.reduce((sum, p) => sum + p.interactiveElements, 0),
        phoneLinksTotal: allPages.reduce((sum, p) => sum + p.phoneLinks, 0),
        ctaTotal: allPages.reduce((sum, p) => sum + p.ctaElements, 0),
        mobileCoverage: allPages.filter(p => p.hasViewportMeta).length / allPages.length,
        accessibilityCoverage: allPages.filter(p => p.hasH1).length / allPages.length
      };

      console.log('\n🎯 ENHANCEMENT METRICS:');
      console.log('======================');
      console.log(`📊 Navigation Coverage: ${(successMetrics.navigationCoverage * 100).toFixed(1)}%`);
      console.log(`🎯 Total Interactive Elements: ${successMetrics.interactiveTotal}`);
      console.log(`📞 Total Enhanced Phone Links: ${successMetrics.phoneLinksTotal}`);
      console.log(`🎨 Total CTA Elements: ${successMetrics.ctaTotal}`);
      console.log(`📱 Mobile Coverage: ${(successMetrics.mobileCoverage * 100).toFixed(1)}%`);
      console.log(`♿ Accessibility Coverage: ${(successMetrics.accessibilityCoverage * 100).toFixed(1)}%`);

      // Final assertions
      expect(successMetrics.interactiveTotal).toBeGreaterThan(10);
      expect(successMetrics.mobileCoverage).toBeGreaterThan(0.8); // 80%+ mobile ready
      expect(successMetrics.accessibilityCoverage).toBe(1); // 100% accessibility
    });
  });
});