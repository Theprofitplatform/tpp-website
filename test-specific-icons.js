const { test, expect } = require('@playwright/test');

test.describe('Why SEO Matters Icons Detailed Check', () => {
  test('detailed icon inspection with screenshots', async ({ page }) => {
    // Navigate to the SEO page
    await page.goto('file://' + process.cwd() + '/website/seo.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Find the exact section
    const sectionHeading = page.locator('h2:has-text("Why SEO Matters for Sydney Businesses")');
    await expect(sectionHeading).toBeVisible();
    await sectionHeading.scrollIntoViewIfNeeded();

    // Get the benefits grid specifically for this section
    const benefitsGrid = sectionHeading.locator('..').locator('.benefits-grid');
    await expect(benefitsGrid).toBeVisible();

    // Take full page screenshot first
    await page.screenshot({
      path: 'seo-page-full.png',
      fullPage: true
    });

    // Take screenshot of just the section
    await benefitsGrid.screenshot({
      path: 'why-seo-matters-section.png'
    });

    // Check each benefit item
    const benefitItems = benefitsGrid.locator('.benefit-item');
    const itemCount = await benefitItems.count();
    console.log(`Found ${itemCount} benefit items`);

    const expectedBenefits = [
      { title: 'Increase Website Traffic', icon: 'fas fa-chart-line' },
      { title: 'Generate More Leads', icon: 'fas fa-phone' },
      { title: 'Beat Your Competition', icon: 'fas fa-trophy' },
      { title: 'Long-Term ROI', icon: 'fas fa-dollar-sign' }
    ];

    for (let i = 0; i < itemCount; i++) {
      const benefitItem = benefitItems.nth(i);

      // Get the title
      const titleElement = benefitItem.locator('h3');
      const title = await titleElement.textContent();
      console.log(`\nBenefit ${i + 1}: ${title}`);

      // Get the icon container
      const iconContainer = benefitItem.locator('.benefit-icon');
      await expect(iconContainer).toBeVisible();

      // Get the icon element
      const iconElement = iconContainer.locator('i');

      if (await iconElement.count() > 0) {
        const iconClass = await iconElement.getAttribute('class');
        console.log(`  Icon class: ${iconClass}`);

        // Check if icon is visible
        const isVisible = await iconElement.isVisible();
        console.log(`  Icon visible: ${isVisible}`);

        // Get computed styles
        const iconStyles = await iconElement.evaluate((el) => {
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return {
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            color: style.color,
            display: style.display,
            visibility: style.visibility,
            content: style.content,
            width: rect.width,
            height: rect.height,
            beforeContent: window.getComputedStyle(el, '::before').content
          };
        });

        console.log(`  Styles:`, iconStyles);

        // Check if the icon is actually rendering content
        if (iconStyles.beforeContent && iconStyles.beforeContent !== 'none' && iconStyles.beforeContent !== 'normal') {
          console.log(`  ✓ Icon has before content: ${iconStyles.beforeContent}`);
        } else {
          console.log(`  ⚠️ Icon missing before content`);
        }

        // Take individual screenshot of this icon
        await iconContainer.screenshot({
          path: `icon-${i + 1}-${title?.replace(/\s+/g, '-').toLowerCase()}.png`
        });

      } else {
        console.log(`  ❌ No icon element found`);
      }

      // Check container styles
      const containerStyles = await iconContainer.evaluate((el) => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          display: style.display,
          alignItems: style.alignItems,
          justifyContent: style.justifyContent,
          background: style.background,
          width: rect.width,
          height: rect.height,
          borderRadius: style.borderRadius
        };
      });

      console.log(`  Container styles:`, containerStyles);
    }

    // Check if FontAwesome CSS is loaded properly
    const fontAwesomeStatus = await page.evaluate(() => {
      // Check for FontAwesome CSS
      const faLinks = Array.from(document.querySelectorAll('link')).filter(link =>
        link.href && link.href.includes('font-awesome')
      );

      // Test FontAwesome by creating test elements
      const testResults = [];

      ['fas fa-chart-line', 'fas fa-phone', 'fas fa-trophy', 'fas fa-dollar-sign'].forEach((iconClass, index) => {
        const testEl = document.createElement('i');
        testEl.className = iconClass;
        testEl.style.position = 'absolute';
        testEl.style.left = '-9999px';
        document.body.appendChild(testEl);

        const style = window.getComputedStyle(testEl);
        const beforeStyle = window.getComputedStyle(testEl, '::before');

        testResults.push({
          iconClass,
          fontFamily: style.fontFamily,
          beforeContent: beforeStyle.content,
          fontSize: beforeStyle.fontSize
        });

        document.body.removeChild(testEl);
      });

      return {
        faLinksFound: faLinks.length,
        faLinks: faLinks.map(link => link.href),
        testResults
      };
    });

    console.log('\nFontAwesome Status:', fontAwesomeStatus);

    // Final section screenshot
    await page.locator('h2:has-text("Why SEO Matters for Sydney Businesses")').locator('../..').screenshot({
      path: 'complete-seo-section.png'
    });
  });
});