import { chromium } from '@playwright/test';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Navigate to about page
    await page.goto('http://localhost:8000/about.html');

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Check if navigation has styles applied
    const header = await page.locator('#header');
    const headerStyles = await header.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
            position: styles.position,
            backgroundColor: styles.backgroundColor,
            display: styles.display
        };
    });

    console.log('Header Styles:', headerStyles);

    // Check footer styles
    const footer = await page.locator('footer');
    const footerStyles = await footer.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
            backgroundColor: styles.backgroundColor,
            padding: styles.padding
        };
    });

    console.log('Footer Styles:', footerStyles);

    await browser.close();
})();
