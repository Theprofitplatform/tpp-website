const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({
        viewport: { width: 1920, height: 1080 }
    });

    console.log('Loading page...');
    await page.goto('file://' + path.resolve('/home/abhi/projects/tpp/index.html'));
    await page.waitForTimeout(2000); // Wait for CSS to fully load

    // Check layout issues
    const layoutInfo = await page.evaluate(() => {
        const html = document.documentElement;
        const body = document.body;

        // Check scrollbar
        const hasHorizontalScroll = window.innerWidth < document.documentElement.scrollWidth;

        // Check container margins
        const firstContainer = document.querySelector('.container');
        const containerRect = firstContainer ? firstContainer.getBoundingClientRect() : null;
        const containerStyles = firstContainer ? window.getComputedStyle(firstContainer) : null;

        // Check section opacity
        const sections = document.querySelectorAll('.animate-on-scroll');
        const sectionOpacities = Array.from(sections).slice(0, 5).map(s => ({
            class: s.className,
            opacity: window.getComputedStyle(s).opacity,
            visibility: window.getComputedStyle(s).visibility
        }));

        return {
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            document: {
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: document.documentElement.clientWidth,
                bodyWidth: document.body.scrollWidth
            },
            hasHorizontalScroll,
            containerInfo: containerRect ? {
                left: containerRect.left,
                right: containerRect.right,
                width: containerRect.width,
                margin: containerStyles.margin,
                maxWidth: containerStyles.maxWidth,
                padding: containerStyles.padding
            } : null,
            sectionOpacities
        };
    });

    console.log('Layout Analysis:');
    console.log('================');
    console.log(`Viewport: ${layoutInfo.viewport.width}x${layoutInfo.viewport.height}`);
    console.log(`Document width: ${layoutInfo.document.scrollWidth}`);
    console.log(`Has horizontal scroll: ${layoutInfo.hasHorizontalScroll}`);
    console.log('\nContainer Info:', layoutInfo.containerInfo);
    console.log('\nSection Visibility:');
    layoutInfo.sectionOpacities.forEach(s => {
        console.log(`  - ${s.class.substring(0, 50)}: opacity=${s.opacity}, visibility=${s.visibility}`);
    });

    // Take screenshot
    await page.screenshot({ path: 'final-layout-test.png', fullPage: false });
    console.log('\nScreenshot saved as final-layout-test.png');

    await browser.close();
})();