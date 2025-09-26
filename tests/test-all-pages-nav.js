#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of all pages to test
const pages = [
    'index.html',
    'about.html',
    'services.html',
    'seo.html',
    'web-design.html',
    'google-ads.html',
    'pricing.html',
    'portfolio.html',
    'contact.html',
    'privacy.html',
    'terms.html',
    'disclaimer.html'
];

console.log('===========================================');
console.log('    NAVIGATION TEST FOR ALL PAGES');
console.log('===========================================\n');

let totalIssues = 0;
let pagesWithIssues = [];
let pagesNeedingFix = [];

pages.forEach((page, index) => {
    const filePath = path.join(__dirname, '..', page);

    if (!fs.existsSync(filePath)) {
        console.log(`❌ ${page}: FILE NOT FOUND`);
        totalIssues++;
        return;
    }

    const html = fs.readFileSync(filePath, 'utf-8');
    let issues = [];
    let needsFix = false;

    // Test 1: Check for header element
    if (!html.includes('<header')) {
        issues.push('Missing <header> element');
    }

    // Test 2: Check for premium-nav class
    const hasPremiumNav = html.includes('class="premium-nav"') || html.includes("class='premium-nav'");
    if (!hasPremiumNav) {
        issues.push('Missing premium-nav class');
        needsFix = true;
    }

    // Test 3: Check for nav-floating-container
    const hasNavContainer = html.includes('nav-floating-container');
    if (!hasNavContainer) {
        issues.push('Missing nav-floating-container');
        needsFix = true;
    }

    // Test 4: Check for navigation CSS (universal-nav.css or services-fix.css)
    const hasFixCSS = html.includes('universal-nav.css') || html.includes('services-fix.css');
    if (!hasFixCSS) {
        issues.push('Missing navigation CSS (universal-nav.css)');
        needsFix = true;
    }

    // Test 5: Check for navigation links
    const hasNavLinks = html.includes('nav-links') || html.includes('nav-menu');
    if (!hasNavLinks) {
        issues.push('Missing navigation links');
    }

    // Test 6: Check for mobile menu toggle
    const hasMobileToggle = html.includes('menu-toggle') || html.includes('nav-toggle');
    if (!hasMobileToggle) {
        issues.push('Missing mobile menu toggle');
    }

    // Test 7: Check for proper CSS files
    const hasStyleCSS = html.includes('style.css') || html.includes('style.min.css');
    const hasCriticalCSS = html.includes('critical.css') || html.includes('critical.min.css');
    if (!hasStyleCSS) issues.push('Missing style.css');
    if (!hasCriticalCSS) issues.push('Missing critical.css');

    // Test 8: Check for viewport meta tag
    const hasViewport = html.includes('viewport');
    if (!hasViewport) {
        issues.push('Missing viewport meta tag');
    }

    // Test 9: Check navigation structure consistency
    const hasLogo = html.includes('class="logo') || html.includes("class='logo");
    if (!hasLogo) {
        issues.push('Missing logo element');
    }

    // Test 10: Check for CTA button
    const hasCTA = html.includes('nav-cta') || html.includes('btn-primary');
    if (!hasCTA) {
        issues.push('Missing CTA button');
    }

    // Display results for this page
    if (issues.length === 0) {
        console.log(`✅ ${page}: PASS - All navigation tests passed`);
    } else {
        console.log(`⚠️  ${page}: ${issues.length} issue(s) found:`);
        issues.forEach(issue => {
            console.log(`   - ${issue}`);
        });
        totalIssues += issues.length;
        pagesWithIssues.push(page);
        if (needsFix) {
            pagesNeedingFix.push(page);
        }
    }
    console.log('');
});

// Summary
console.log('===========================================');
console.log('                SUMMARY');
console.log('===========================================');
console.log(`Total pages tested: ${pages.length}`);
console.log(`Pages with issues: ${pagesWithIssues.length}`);
console.log(`Total issues found: ${totalIssues}`);

if (pagesNeedingFix.length > 0) {
    console.log('\n📋 Pages that need navigation fix CSS:');
    pagesNeedingFix.forEach(page => {
        console.log(`   - ${page}`);
    });
}

if (pagesWithIssues.length > 0) {
    console.log('\n📝 All pages with issues:');
    pagesWithIssues.forEach(page => {
        console.log(`   - ${page}`);
    });
}

// Detailed check for navigation consistency
console.log('\n===========================================');
console.log('        NAVIGATION CONSISTENCY CHECK');
console.log('===========================================\n');

const navStructures = {};

pages.forEach(page => {
    const filePath = path.join(__dirname, '..', page);
    if (!fs.existsSync(filePath)) return;

    const html = fs.readFileSync(filePath, 'utf-8');

    // Extract navigation structure indicators
    const structure = {
        hasPremiumNav: html.includes('premium-nav'),
        hasFloatingContainer: html.includes('nav-floating-container'),
        hasNavLinks: html.includes('nav-links'),
        hasPremiumNavLinks: html.includes('premium-nav-links'),
        hasDropdown: html.includes('nav-dropdown'),
        hasMobileNav: html.includes('mobile-nav'),
        hasMenuToggle: html.includes('menu-toggle')
    };

    navStructures[page] = structure;
});

// Check which navigation style each page uses
let premiumNavPages = [];
let standardNavPages = [];
let noNavPages = [];

Object.entries(navStructures).forEach(([page, structure]) => {
    if (structure.hasPremiumNav && structure.hasFloatingContainer) {
        premiumNavPages.push(page);
    } else if (structure.hasNavLinks || structure.hasMenuToggle) {
        standardNavPages.push(page);
    } else {
        noNavPages.push(page);
    }
});

console.log(`Premium Navigation (like services.html): ${premiumNavPages.length} pages`);
if (premiumNavPages.length > 0) {
    premiumNavPages.forEach(page => console.log(`   ✓ ${page}`));
}

console.log(`\nStandard Navigation: ${standardNavPages.length} pages`);
if (standardNavPages.length > 0) {
    standardNavPages.forEach(page => console.log(`   ○ ${page}`));
}

if (noNavPages.length > 0) {
    console.log(`\nNo Navigation Found: ${noNavPages.length} pages`);
    noNavPages.forEach(page => console.log(`   ✗ ${page}`));
}

console.log('\n===========================================');
console.log('            RECOMMENDATIONS');
console.log('===========================================');

if (standardNavPages.length > 0) {
    console.log('\n🔧 To fix navigation on all pages:');
    console.log('1. Add universal-nav.css to all pages');
    console.log('2. Update navigation structure to match navigation-template.html');
    console.log('3. Ensure consistent class names across all pages');

    console.log('\n📄 Pages needing navigation update:');
    standardNavPages.forEach(page => {
        console.log(`   ${page}`);
    });
}

// Exit with error code if issues found
process.exit(totalIssues > 0 ? 1 : 0);