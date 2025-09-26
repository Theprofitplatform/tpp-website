const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function checkNavigation() {
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    const results = {
        desktop: {
            links: [],
            brokenLinks: [],
            dropdownWorks: false
        },
        mobile: {
            links: [],
            brokenLinks: []
        },
        issues: []
    };

    try {
        // Load the page
        const filePath = path.resolve(__dirname, '../index.html');
        await page.goto(`file://${filePath}`);
        console.log('✅ Page loaded successfully');

        // Check Desktop Navigation
        console.log('\n🖥️  Checking Desktop Navigation...');
        await page.setViewportSize({ width: 1920, height: 1080 });

        // Get all desktop nav links
        const desktopLinks = await page.evaluate(() => {
            const links = [];
            const navItems = document.querySelectorAll('#primary-navigation .nav-item');
            navItems.forEach(item => {
                const text = item.querySelector('span')?.textContent || '';
                const href = item.getAttribute('href');
                if (href) {
                    links.push({ text, href, type: 'main' });
                }
            });

            // Get dropdown items
            const dropdownItems = document.querySelectorAll('#primary-navigation .dropdown-item');
            dropdownItems.forEach(item => {
                const text = item.querySelector('strong')?.textContent || '';
                const href = item.getAttribute('href');
                if (href) {
                    links.push({ text, href, type: 'dropdown' });
                }
            });

            return links;
        });

        results.desktop.links = desktopLinks;
        console.log(`Found ${desktopLinks.length} desktop navigation links`);

        // Check if files exist
        for (const link of desktopLinks) {
            if (link.href && !link.href.startsWith('#') && !link.href.startsWith('http')) {
                const linkPath = path.resolve(__dirname, '..', link.href);
                if (!fs.existsSync(linkPath)) {
                    results.desktop.brokenLinks.push(link);
                    console.log(`❌ Broken link: ${link.text} -> ${link.href}`);
                }
            }
        }

        // Test dropdown functionality
        console.log('\n🔽 Testing dropdown functionality...');
        const servicesDropdown = await page.$('a[aria-controls="services-dropdown"]');
        if (servicesDropdown) {
            // Hover to trigger dropdown
            await servicesDropdown.hover();
            await page.waitForTimeout(500);

            // Check if dropdown is visible
            const dropdownVisible = await page.evaluate(() => {
                const dropdown = document.querySelector('#services-dropdown');
                if (!dropdown) return false;
                const styles = window.getComputedStyle(dropdown);
                return styles.display !== 'none' && styles.visibility !== 'hidden' && styles.opacity !== '0';
            });

            results.desktop.dropdownWorks = dropdownVisible;
            console.log(dropdownVisible ? '✅ Dropdown works' : '❌ Dropdown not working');
        }

        // Check Mobile Navigation
        console.log('\n📱 Checking Mobile Navigation...');
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();

        // Open mobile menu
        const mobileToggle = await page.$('.mobile-menu-toggle, #mobile-menu-toggle');
        if (mobileToggle) {
            await mobileToggle.click();
            await page.waitForTimeout(500);
        }

        // Get mobile nav links
        const mobileLinks = await page.evaluate(() => {
            const links = [];
            const mobileNav = document.querySelector('.mobile-nav-links, #mobile-nav');
            if (mobileNav) {
                const navItems = mobileNav.querySelectorAll('a');
                navItems.forEach(item => {
                    const text = item.textContent.trim();
                    const href = item.getAttribute('href');
                    if (href) {
                        links.push({ text, href });
                    }
                });
            }
            return links;
        });

        results.mobile.links = mobileLinks;
        console.log(`Found ${mobileLinks.length} mobile navigation links`);

        // Check mobile links
        for (const link of mobileLinks) {
            if (link.href && !link.href.startsWith('#') && !link.href.startsWith('http')) {
                const linkPath = path.resolve(__dirname, '..', link.href);
                if (!fs.existsSync(linkPath)) {
                    results.mobile.brokenLinks.push(link);
                    console.log(`❌ Broken mobile link: ${link.text} -> ${link.href}`);
                }
            }
        }

        // Compare desktop vs mobile navigation
        console.log('\n🔍 Comparing Desktop vs Mobile Navigation...');

        const desktopMainLinks = desktopLinks.filter(l => l.type === 'main').map(l => l.text);
        const mobileMainLinks = mobileLinks
            .filter(l => !l.text.includes('SEO') && !l.text.includes('Web Design') && !l.text.includes('Google'))
            .map(l => l.text.replace(/[🏠🎯💰👥📈📝📞]/g, '').trim());

        // Find differences
        const onlyInDesktop = desktopMainLinks.filter(l => !mobileMainLinks.includes(l));
        const onlyInMobile = mobileMainLinks.filter(l => !desktopMainLinks.includes(l));

        if (onlyInDesktop.length > 0) {
            results.issues.push(`Links only in desktop nav: ${onlyInDesktop.join(', ')}`);
        }
        if (onlyInMobile.length > 0) {
            results.issues.push(`Links only in mobile nav: ${onlyInMobile.join(', ')}`);
        }

        // Summary
        console.log('\n📊 NAVIGATION TEST SUMMARY');
        console.log('=' .repeat(50));
        console.log(`Desktop Links: ${results.desktop.links.length}`);
        console.log(`Desktop Broken Links: ${results.desktop.brokenLinks.length}`);
        console.log(`Mobile Links: ${results.mobile.links.length}`);
        console.log(`Mobile Broken Links: ${results.mobile.brokenLinks.length}`);
        console.log(`Dropdown Works: ${results.desktop.dropdownWorks ? 'Yes' : 'No'}`);

        if (results.desktop.brokenLinks.length > 0) {
            console.log('\n❌ BROKEN DESKTOP LINKS:');
            results.desktop.brokenLinks.forEach(link => {
                console.log(`  - ${link.text}: ${link.href}`);
            });
        }

        if (results.mobile.brokenLinks.length > 0) {
            console.log('\n❌ BROKEN MOBILE LINKS:');
            results.mobile.brokenLinks.forEach(link => {
                console.log(`  - ${link.text}: ${link.href}`);
            });
        }

        if (results.issues.length > 0) {
            console.log('\n⚠️  CONSISTENCY ISSUES:');
            results.issues.forEach(issue => {
                console.log(`  - ${issue}`);
            });
        }

        // Save detailed report
        fs.writeFileSync(
            path.resolve(__dirname, 'nav-report.json'),
            JSON.stringify(results, null, 2)
        );
        console.log('\n📄 Detailed report saved to tests/nav-report.json');

    } catch (error) {
        console.error('Error during navigation check:', error);
    } finally {
        await browser.close();
    }
}

// Run the check
checkNavigation().catch(console.error);