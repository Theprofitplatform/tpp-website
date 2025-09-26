const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto('http://localhost:3000/website/google-ads.html');

    // Scroll to services section
    await page.evaluate(() => {
        const section = document.querySelector('.services-section');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    await page.waitForTimeout(2000);

    // Get grid layout info
    const gridInfo = await page.evaluate(() => {
        const grid = document.querySelector('.google-ads-services-grid');
        if (!grid) return null;

        const styles = window.getComputedStyle(grid);
        const cards = grid.querySelectorAll('.google-ads-service-card');

        return {
            gridColumns: styles.gridTemplateColumns,
            numberOfCards: cards.length,
            cardWidths: Array.from(cards).map(card => card.offsetWidth),
            containerWidth: grid.offsetWidth
        };
    });

    console.log('Services Grid Layout Info:');
    console.log('Grid Columns:', gridInfo.gridColumns);
    console.log('Number of Cards:', gridInfo.numberOfCards);
    console.log('Card Widths:', gridInfo.cardWidths);
    console.log('Container Width:', gridInfo.containerWidth);

    // Test tablet view
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(1000);

    const tabletInfo = await page.evaluate(() => {
        const grid = document.querySelector('.google-ads-services-grid');
        const styles = window.getComputedStyle(grid);
        return styles.gridTemplateColumns;
    });

    console.log('\nTablet View (1024px):');
    console.log('Grid Columns:', tabletInfo);

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    const mobileInfo = await page.evaluate(() => {
        const grid = document.querySelector('.google-ads-services-grid');
        const styles = window.getComputedStyle(grid);
        return styles.gridTemplateColumns;
    });

    console.log('\nMobile View (375px):');
    console.log('Grid Columns:', mobileInfo);

    await page.waitForTimeout(3000);
    await browser.close();
})();