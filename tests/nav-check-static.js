const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

async function checkNavigationStatic() {
    const results = {
        desktop: {
            links: [],
            brokenLinks: []
        },
        mobile: {
            links: [],
            brokenLinks: []
        },
        issues: [],
        allFiles: []
    };

    try {
        // Read the HTML file
        const htmlPath = path.resolve(__dirname, '../index.html');
        const html = fs.readFileSync(htmlPath, 'utf-8');
        const dom = new JSDOM(html);
        const document = dom.window.document;

        console.log('✅ index.html loaded successfully');
        console.log('=' .repeat(50));

        // Get all HTML files in project
        const rootDir = path.resolve(__dirname, '..');
        const htmlFiles = fs.readdirSync(rootDir)
            .filter(file => file.endsWith('.html'))
            .map(file => file);

        // Check blog directory
        const blogDir = path.join(rootDir, 'blog');
        if (fs.existsSync(blogDir)) {
            const blogFiles = fs.readdirSync(blogDir)
                .filter(file => file.endsWith('.html'))
                .map(file => `blog/${file}`);
            htmlFiles.push(...blogFiles);
        }

        results.allFiles = htmlFiles;
        console.log(`\n📁 Found ${htmlFiles.length} HTML files in project:`);
        htmlFiles.forEach(file => console.log(`  - ${file}`));

        // Check Desktop Navigation
        console.log('\n🖥️  DESKTOP NAVIGATION ANALYSIS');
        console.log('=' .repeat(50));

        // Get main nav links
        const navLinks = document.querySelectorAll('#primary-navigation .nav-item');
        navLinks.forEach(link => {
            const text = link.querySelector('span')?.textContent || '';
            const href = link.getAttribute('href');
            if (href) {
                results.desktop.links.push({ text, href, type: 'main' });
                console.log(`  📍 ${text}: ${href}`);
            }
        });

        // Get dropdown items
        console.log('\n  Dropdown Items:');
        const dropdownItems = document.querySelectorAll('#primary-navigation .dropdown-item');
        dropdownItems.forEach(item => {
            const text = item.querySelector('strong')?.textContent || '';
            const href = item.getAttribute('href');
            if (href) {
                results.desktop.links.push({ text, href, type: 'dropdown' });
                console.log(`    └─ ${text}: ${href}`);
            }
        });

        // Check Mobile Navigation
        console.log('\n📱 MOBILE NAVIGATION ANALYSIS');
        console.log('=' .repeat(50));

        const mobileNav = document.querySelector('.mobile-nav-links');
        if (mobileNav) {
            const mobileLinks = mobileNav.querySelectorAll('a');
            mobileLinks.forEach(link => {
                const text = link.textContent.trim().replace(/[🏠🎯💰👥📈📝📞📍🎨📢]/g, '').trim();
                const href = link.getAttribute('href');
                const isSubItem = link.classList.contains('mobile-sub-item');
                if (href) {
                    results.mobile.links.push({ text, href, isSubItem });
                    console.log(`  ${isSubItem ? '  └─' : '📍'} ${text}: ${href}`);
                }
            });
        }

        // Check for broken links
        console.log('\n🔍 CHECKING FOR BROKEN LINKS');
        console.log('=' .repeat(50));

        // Check desktop links
        for (const link of results.desktop.links) {
            if (link.href && !link.href.startsWith('#') && !link.href.startsWith('http')) {
                const linkPath = path.resolve(__dirname, '..', link.href);
                if (!fs.existsSync(linkPath)) {
                    results.desktop.brokenLinks.push(link);
                    console.log(`  ❌ Desktop: ${link.text} -> ${link.href} (FILE NOT FOUND)`);
                } else {
                    console.log(`  ✅ Desktop: ${link.text} -> ${link.href}`);
                }
            }
        }

        // Check mobile links
        for (const link of results.mobile.links) {
            if (link.href && !link.href.startsWith('#') && !link.href.startsWith('http')) {
                const linkPath = path.resolve(__dirname, '..', link.href);
                if (!fs.existsSync(linkPath)) {
                    results.mobile.brokenLinks.push(link);
                    console.log(`  ❌ Mobile: ${link.text} -> ${link.href} (FILE NOT FOUND)`);
                } else {
                    console.log(`  ✅ Mobile: ${link.text} -> ${link.href}`);
                }
            }
        }

        // Compare navigation consistency
        console.log('\n⚖️  DESKTOP vs MOBILE CONSISTENCY');
        console.log('=' .repeat(50));

        const desktopMainTexts = results.desktop.links
            .filter(l => l.type === 'main')
            .map(l => l.text);

        const mobileMainTexts = results.mobile.links
            .filter(l => !l.isSubItem)
            .map(l => l.text);

        // Find differences
        const onlyInDesktop = desktopMainTexts.filter(text =>
            !mobileMainTexts.includes(text) && text !== 'Services'
        );
        const onlyInMobile = mobileMainTexts.filter(text =>
            !desktopMainTexts.includes(text) && text !== 'Services'
        );

        if (onlyInDesktop.length > 0) {
            console.log(`  ⚠️  Only in Desktop: ${onlyInDesktop.join(', ')}`);
            results.issues.push(`Links only in desktop: ${onlyInDesktop.join(', ')}`);
        }
        if (onlyInMobile.length > 0) {
            console.log(`  ⚠️  Only in Mobile: ${onlyInMobile.join(', ')}`);
            results.issues.push(`Links only in mobile: ${onlyInMobile.join(', ')}`);
        }
        if (onlyInDesktop.length === 0 && onlyInMobile.length === 0) {
            console.log('  ✅ Navigation is consistent between desktop and mobile');
        }

        // Final Summary
        console.log('\n📊 FINAL SUMMARY');
        console.log('=' .repeat(50));
        console.log(`Total Desktop Links: ${results.desktop.links.length}`);
        console.log(`Total Mobile Links: ${results.mobile.links.length}`);
        console.log(`Broken Desktop Links: ${results.desktop.brokenLinks.length}`);
        console.log(`Broken Mobile Links: ${results.mobile.brokenLinks.length}`);

        if (results.desktop.brokenLinks.length > 0) {
            console.log('\n🚨 CRITICAL ISSUES - BROKEN LINKS:');
            const uniqueBroken = new Set();
            [...results.desktop.brokenLinks, ...results.mobile.brokenLinks].forEach(link => {
                uniqueBroken.add(`${link.text} -> ${link.href}`);
            });
            uniqueBroken.forEach(item => {
                console.log(`  ❌ ${item}`);
            });
        }

        // Missing files that need to be created
        const missingFiles = new Set();
        [...results.desktop.brokenLinks, ...results.mobile.brokenLinks].forEach(link => {
            if (link.href && !link.href.startsWith('http')) {
                missingFiles.add(link.href);
            }
        });

        if (missingFiles.size > 0) {
            console.log('\n📝 FILES THAT NEED TO BE CREATED:');
            missingFiles.forEach(file => {
                console.log(`  - ${file}`);
            });
        }

        // Save report
        fs.writeFileSync(
            path.resolve(__dirname, 'nav-report.json'),
            JSON.stringify(results, null, 2)
        );
        console.log('\n💾 Detailed report saved to tests/nav-report.json');

    } catch (error) {
        console.error('Error during navigation check:', error);
    }
}

// Run the check
checkNavigationStatic().catch(console.error);