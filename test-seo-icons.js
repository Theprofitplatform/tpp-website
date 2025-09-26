const { test, expect } = require('@playwright/test');

test.describe('SEO Page - Why SEO Matters Icons Test', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the SEO page in the website directory
    await page.goto('file://' + process.cwd() + '/website/seo.html');

    // Wait for the page to load and FontAwesome to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Give time for FontAwesome to load
  });

  test('should display all icons in Why SEO Matters section', async ({ page }) => {
    // Find the "Why SEO Matters" section
    const sectionHeading = page.locator('h2:has-text("Why SEO Matters for Sydney Businesses")');
    await expect(sectionHeading).toBeVisible();

    // Check all benefit items in the section
    const benefitItems = page.locator('.benefit-item');
    await expect(benefitItems).toHaveCount(4);

    // Check each icon specifically
    const expectedIcons = [
      { class: 'fas fa-chart-line', description: 'Chart line icon for traffic' },
      { class: 'fas fa-phone', description: 'Phone icon for leads' },
      { class: 'fas fa-trophy', description: 'Trophy icon for competition' },
      { class: 'fas fa-dollar-sign', description: 'Dollar sign icon for ROI' }
    ];

    for (let i = 0; i < expectedIcons.length; i++) {
      const benefitItem = benefitItems.nth(i);
      const icon = benefitItem.locator('.benefit-icon i');

      // Check if icon element exists
      await expect(icon).toBeVisible();

      // Check if icon has the correct class
      await expect(icon).toHaveClass(new RegExp(expectedIcons[i].class.replace(' ', '.*')));

      // Check if icon is actually rendered (has computed style)
      const iconElement = await icon.elementHandle();
      const computedStyle = await page.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          display: style.display,
          content: style.content,
          visibility: style.visibility
        };
      }, iconElement);

      console.log(`Icon ${i + 1} (${expectedIcons[i].class}) styles:`, computedStyle);

      // Check if FontAwesome is loaded
      expect(computedStyle.fontFamily).toContain('Font Awesome');
      expect(computedStyle.visibility).toBe('visible');
    }
  });

  test('should have FontAwesome CSS loaded', async ({ page }) => {
    // Check if FontAwesome CSS is loaded
    const fontAwesomeLink = page.locator('link[href*="font-awesome"]');
    await expect(fontAwesomeLink).toBeAttached();

    // Check if the CSS actually loaded by testing a known FontAwesome selector
    const hasFA = await page.evaluate(() => {
      const testEl = document.createElement('i');
      testEl.className = 'fas fa-test';
      document.body.appendChild(testEl);
      const style = window.getComputedStyle(testEl);
      const hasFontAwesome = style.fontFamily.includes('Font Awesome');
      document.body.removeChild(testEl);
      return hasFontAwesome;
    });

    expect(hasFA).toBe(true);
  });

  test('should check icon container styles', async ({ page }) => {
    const benefitIcons = page.locator('.benefit-icon');

    for (let i = 0; i < 4; i++) {
      const iconContainer = benefitIcons.nth(i);
      await expect(iconContainer).toBeVisible();

      // Check container styles
      const containerElement = await iconContainer.elementHandle();
      const containerStyle = await page.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          display: style.display,
          alignItems: style.alignItems,
          justifyContent: style.justifyContent,
          width: style.width,
          height: style.height,
          backgroundColor: style.backgroundColor
        };
      }, containerElement);

      console.log(`Icon container ${i + 1} styles:`, containerStyle);

      // Verify container has proper flex styling
      expect(containerStyle.display).toBe('flex');
      expect(containerStyle.alignItems).toBe('center');
      expect(containerStyle.justifyContent).toBe('center');
    }
  });

  test('should check "What you\'ll get on our call" section icons', async ({ page }) => {
    // Find the "What you'll get on our call" section
    const callSection = page.locator('text="What you\'ll get on our call:"');
    if (await callSection.count() > 0) {
      await expect(callSection).toBeVisible();

      // Look for icons in this section
      const callBenefitItems = page.locator('text="What you\'ll get on our call:"').locator('..').locator('.benefit-item, .contact-benefit, .call-benefit');
      const callIcons = page.locator('text="What you\'ll get on our call:"').locator('..').locator('i[class*="fa"]');

      if (await callIcons.count() > 0) {
        console.log(`Found ${await callIcons.count()} icons in "What you'll get on our call" section`);

        for (let i = 0; i < await callIcons.count(); i++) {
          const icon = callIcons.nth(i);
          await expect(icon).toBeVisible();

          const iconClass = await icon.getAttribute('class');
          console.log(`Call section icon ${i + 1}: ${iconClass}`);

          // Check if icon is properly styled
          const iconElement = await icon.elementHandle();
          const iconStyle = await page.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return {
              fontFamily: style.fontFamily,
              fontSize: style.fontSize,
              display: style.display,
              visibility: style.visibility
            };
          }, iconElement);

          console.log(`Call icon ${i + 1} styles:`, iconStyle);
        }
      } else {
        console.log('No FontAwesome icons found in "What you\'ll get on our call" section');
      }
    } else {
      console.log('"What you\'ll get on our call" section not found');
    }
  });

  test('should check navbar dropdown functionality', async ({ page }) => {
    // Check if services dropdown exists and works
    const servicesNav = page.locator('.nav-dropdown, .premium-dropdown');
    if (await servicesNav.count() > 0) {
      await expect(servicesNav.first()).toBeVisible();

      // Try to hover over services to open dropdown
      await servicesNav.first().hover();
      await page.waitForTimeout(500);

      // Check if dropdown menu becomes visible
      const dropdownMenu = page.locator('#services-dropdown, .dropdown-menu, .mega-dropdown');
      if (await dropdownMenu.count() > 0) {
        await expect(dropdownMenu.first()).toBeVisible();
        console.log('Services dropdown is working');

        // Check dropdown items
        const dropdownItems = dropdownMenu.first().locator('.dropdown-item, .mega-item');
        const itemCount = await dropdownItems.count();
        console.log(`Found ${itemCount} dropdown items`);

        for (let i = 0; i < itemCount; i++) {
          const item = dropdownItems.nth(i);
          await expect(item).toBeVisible();
          const itemText = await item.textContent();
          console.log(`Dropdown item ${i + 1}: ${itemText}`);
        }
      } else {
        console.log('Dropdown menu not found or not visible');
      }
    } else {
      console.log('Services navigation dropdown not found');
    }
  });

  test('should take screenshot of both sections for visual verification', async ({ page }) => {
    // Screenshot 1: Why SEO Matters section
    const seoSection = page.locator('h2:has-text("Why SEO Matters for Sydney Businesses")').locator('..');
    await seoSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    const benefitsGrid = page.locator('.benefits-grid').first();
    await benefitsGrid.screenshot({ path: 'seo-benefits-icons.png' });

    // Screenshot 2: What you'll get on our call section (if it exists)
    const callSection = page.locator('text="What you\'ll get on our call:"');
    if (await callSection.count() > 0) {
      await callSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);

      const callContainer = callSection.locator('..').locator('..').first();
      await callContainer.screenshot({ path: 'call-section-icons.png' });

      console.log('Screenshots saved: seo-benefits-icons.png and call-section-icons.png');
    } else {
      console.log('Screenshot saved: seo-benefits-icons.png only');
    }
  });
});