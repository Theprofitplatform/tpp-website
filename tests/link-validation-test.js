const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('LINK VALIDATION & NAVIGATION TEST REPORT');
console.log('The Profit Platform Website');
console.log('='.repeat(80));

const pages = [
    'index.html',
    'about.html',
    'services.html',
    'seo.html',
    'web-design.html',
    'google-ads.html',
    'portfolio.html',
    'blog/blog.html',
    'privacy.html',
    'contact.html'
];

const linkValidation = {
    validLinks: [],
    brokenLinks: [],
    externalLinks: [],
    internalLinks: []
};

const navigationTests = {
    activeStates: { passed: 0, failed: 0, issues: [] },
    logoLinks: { passed: 0, failed: 0, issues: [] },
    mobileNav: { passed: 0, failed: 0, issues: [] }
};

// Function to extract all links from HTML content
function extractLinks(content, filename) {
    const linkRegex = /href\s*=\s*["'](.*?)["']/gi;
    const links = [];
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
        const url = match[1];
        if (url && !url.startsWith('#') && !url.startsWith('tel:') && !url.startsWith('mailto:')) {
            links.push({
                url: url,
                page: filename,
                isExternal: url.startsWith('http') || url.startsWith('//'),
                isInternal: !url.startsWith('http') && !url.startsWith('//')
            });
        }
    }

    return links;
}

// Function to check if internal link exists
function checkInternalLink(link, basePath) {
    if (link.startsWith('http') || link.startsWith('//')) return false;

    let targetPath;
    if (link.startsWith('/')) {
        targetPath = path.join(basePath, link.substring(1));
    } else {
        targetPath = path.join(basePath, link);
    }

    return fs.existsSync(targetPath);
}

console.log('1. ANALYZING ALL PAGES FOR LINKS...\n');

pages.forEach(page => {
    const filePath = path.join(__dirname, '..', page);

    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const links = extractLinks(content, page);

        console.log(`📄 ${page} - Found ${links.length} links`);

        links.forEach(link => {
            if (link.isExternal) {
                linkValidation.externalLinks.push(link);
                console.log(`   🌐 External: ${link.url}`);
            } else if (link.isInternal) {
                linkValidation.internalLinks.push(link);

                // Check if internal link exists
                const exists = checkInternalLink(link.url, path.join(__dirname, '..'));
                if (exists) {
                    linkValidation.validLinks.push(link);
                    console.log(`   ✅ Internal: ${link.url} - EXISTS`);
                } else {
                    linkValidation.brokenLinks.push(link);
                    console.log(`   ❌ Internal: ${link.url} - BROKEN`);
                }
            }
        });

        // Check for active navigation states
        const hasActiveNav = content.includes('class="nav-item premium-nav-item active"') ||
                            content.includes('class="dropdown-item mega-item active"') ||
                            content.includes('aria-current="page"');

        if (hasActiveNav) {
            console.log(`   ✅ Active navigation state found`);
            navigationTests.activeStates.passed++;
        } else {
            console.log(`   ⚠️  No active navigation state found`);
            navigationTests.activeStates.issues.push(`${page}: No active navigation state`);
        }

        // Check logo link
        const hasLogoLink = content.includes('href="index.html"') &&
                           (content.includes('class="logo') || content.includes('aria-label="The Profit Platform - Home"'));

        if (hasLogoLink) {
            console.log(`   ✅ Logo links to homepage`);
            navigationTests.logoLinks.passed++;
        } else {
            console.log(`   ❌ Logo doesn't link to homepage`);
            navigationTests.logoLinks.failed++;
            navigationTests.logoLinks.issues.push(`${page}: Logo doesn't link to homepage`);
        }

        // Check mobile navigation
        const hasMobileNav = content.includes('mobile-nav') && content.includes('mobile-nav-overlay');

        if (hasMobileNav) {
            console.log(`   ✅ Mobile navigation present`);
            navigationTests.mobileNav.passed++;
        } else {
            console.log(`   ❌ Mobile navigation missing`);
            navigationTests.mobileNav.failed++;
            navigationTests.mobileNav.issues.push(`${page}: Mobile navigation missing`);
        }

        console.log('');
    }
});

// Generate summary
console.log('\n' + '='.repeat(80));
console.log('LINK VALIDATION SUMMARY');
console.log('='.repeat(80));

console.log(`📊 Total Links Found: ${linkValidation.validLinks.length + linkValidation.brokenLinks.length + linkValidation.externalLinks.length}`);
console.log(`✅ Valid Internal Links: ${linkValidation.validLinks.length}`);
console.log(`❌ Broken Internal Links: ${linkValidation.brokenLinks.length}`);
console.log(`🌐 External Links: ${linkValidation.externalLinks.length}`);

if (linkValidation.brokenLinks.length > 0) {
    console.log('\n❌ BROKEN LINKS FOUND:');
    linkValidation.brokenLinks.forEach(link => {
        console.log(`   ${link.page} -> ${link.url}`);
    });
}

console.log('\n' + '='.repeat(80));
console.log('NAVIGATION FUNCTIONALITY SUMMARY');
console.log('='.repeat(80));

console.log(`✅ Pages with active navigation states: ${navigationTests.activeStates.passed}`);
console.log(`✅ Pages with working logo links: ${navigationTests.logoLinks.passed}`);
console.log(`❌ Pages with broken logo links: ${navigationTests.logoLinks.failed}`);
console.log(`✅ Pages with mobile navigation: ${navigationTests.mobileNav.passed}`);
console.log(`❌ Pages missing mobile navigation: ${navigationTests.mobileNav.failed}`);

// Show issues
if (navigationTests.logoLinks.issues.length > 0 || navigationTests.mobileNav.issues.length > 0) {
    console.log('\n⚠️ NAVIGATION ISSUES:');
    [...navigationTests.logoLinks.issues, ...navigationTests.mobileNav.issues].forEach(issue => {
        console.log(`   - ${issue}`);
    });
}

console.log('\n' + '='.repeat(80));
console.log('RECOMMENDATIONS');
console.log('='.repeat(80));

if (linkValidation.brokenLinks.length > 0) {
    console.log('🔧 Fix broken internal links');
}

if (navigationTests.logoLinks.failed > 0) {
    console.log('🔧 Add logo links to homepage where missing');
}

if (navigationTests.mobileNav.failed > 0) {
    console.log('🔧 Implement mobile navigation where missing');
}

console.log('🔧 Test external links manually to ensure they work');
console.log('🔧 Verify all dropdown menus function correctly');
console.log('🔧 Test mobile navigation on actual devices');

console.log('\n' + '='.repeat(80));
console.log('END OF LINK VALIDATION REPORT');
console.log('='.repeat(80));