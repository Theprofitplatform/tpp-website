const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    console.log('Loading page...');
    await page.goto('file://' + path.resolve('/home/abhi/projects/tpp/index.html'));

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Check for scrollbars
    const scrollInfo = await page.evaluate(() => {
        const html = document.documentElement;
        const body = document.body;
        return {
            htmlScrollWidth: html.scrollWidth,
            htmlClientWidth: html.clientWidth,
            htmlOffsetWidth: html.offsetWidth,
            bodyScrollWidth: body.scrollWidth,
            bodyClientWidth: body.clientWidth,
            bodyOffsetWidth: body.offsetWidth,
            windowInnerWidth: window.innerWidth,
            windowOuterWidth: window.outerWidth,
            hasHorizontalScrollbar: html.scrollWidth > html.clientWidth || body.scrollWidth > body.clientWidth,
            hasVerticalScrollbar: html.scrollHeight > html.clientHeight,
            htmlStyles: window.getComputedStyle(html).overflow + ' / ' + window.getComputedStyle(html).overflowX + ' / ' + window.getComputedStyle(html).overflowY,
            bodyStyles: window.getComputedStyle(body).overflow + ' / ' + window.getComputedStyle(body).overflowX + ' / ' + window.getComputedStyle(body).overflowY,
        };
    });

    console.log('Scroll Information:', scrollInfo);

    // Check container widths
    const containerInfo = await page.evaluate(() => {
        const containers = document.querySelectorAll('.container');
        const widths = [];
        containers.forEach((container, index) => {
            const rect = container.getBoundingClientRect();
            const styles = window.getComputedStyle(container);
            widths.push({
                index,
                width: rect.width,
                maxWidth: styles.maxWidth,
                padding: styles.padding,
                margin: styles.margin,
                left: rect.left,
                right: rect.right,
                overflow: styles.overflow + ' / ' + styles.overflowX
            });
        });
        return widths;
    });

    console.log('Container Information:', containerInfo);

    // Check for elements extending beyond viewport
    const overflowingElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const overflowing = [];
        const viewportWidth = window.innerWidth;

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.right > viewportWidth || rect.left < 0) {
                overflowing.push({
                    tag: el.tagName,
                    class: el.className,
                    id: el.id,
                    width: rect.width,
                    left: rect.left,
                    right: rect.right,
                    overflow: rect.right - viewportWidth
                });
            }
        });
        return overflowing.slice(0, 10); // First 10 overflowing elements
    });

    console.log('Overflowing Elements:', overflowingElements);

    // Take screenshot
    await page.screenshot({ path: 'desktop-layout-test.png', fullPage: false });
    console.log('Screenshot saved as desktop-layout-test.png');

    // Check specific sections
    const sectionInfo = await page.evaluate(() => {
        const sections = document.querySelectorAll('section');
        const info = [];
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const styles = window.getComputedStyle(section);
            info.push({
                index,
                class: section.className,
                width: rect.width,
                padding: styles.padding,
                margin: styles.margin,
                overflow: styles.overflow
            });
        });
        return info;
    });

    console.log('Section Information:', sectionInfo);

    await browser.close();
})();