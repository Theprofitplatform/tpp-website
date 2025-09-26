#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function extractNavigationInfo(html, pageName) {
    console.log(`\n📄 ${pageName}`);
    console.log('─'.repeat(50));

    // Extract header classes
    const headerMatch = html.match(/<header[^>]*class="([^"]*)"[^>]*>/);
    if (headerMatch) {
        console.log(`Header Classes: ${headerMatch[1]}`);
    } else {
        console.log('Header: No header found or no classes');
    }

    // Check for CSS files
    const cssFiles = [];
    const cssMatches = html.matchAll(/<link[^>]*href="([^"]*\.css)"[^>]*>/g);
    for (const match of cssMatches) {
        cssFiles.push(match[1]);
    }
    console.log(`CSS Files: ${cssFiles.length > 0 ? cssFiles.join(', ') : 'None found'}`);

    // Check for universal-nav.css specifically
    if (cssFiles.includes('css/universal-nav.css')) {
        console.log('✅ Has universal-nav.css');
    } else {
        console.log('❌ Missing universal-nav.css');
    }

    // Check navigation structure
    const hasPremiumNav = html.includes('premium-nav');
    const hasFloatingContainer = html.includes('nav-floating-container');
    const hasNavLinks = html.includes('nav-links');
    const hasMobileMenu = html.includes('menu-toggle');

    console.log('\nNavigation Structure:');
    console.log(`  Premium Nav: ${hasPremiumNav ? '✅' : '❌'}`);
    console.log(`  Floating Container: ${hasFloatingContainer ? '✅' : '❌'}`);
    console.log(`  Nav Links: ${hasNavLinks ? '✅' : '❌'}`);
    console.log(`  Mobile Menu: ${hasMobileMenu ? '✅' : '❌'}`);

    // Extract navigation items
    const navItemMatches = html.matchAll(/<a[^>]*class="[^"]*nav-item[^"]*"[^>]*>([^<]*(?:<[^>]*>[^<]*)*)<\/a>/g);
    const navItems = [];
    for (const match of navItemMatches) {
        const text = match[1].replace(/<[^>]*>/g, '').trim();
        if (text && !text.includes('function')) {
            navItems.push(text);
        }
    }

    if (navItems.length > 0) {
        console.log(`\nNavigation Items (${navItems.length}):`);
        navItems.forEach(item => console.log(`  • ${item}`));
    }

    // Check for inline styles that might affect navigation
    const inlineNavStyles = html.match(/<style[^>]*>([^<]*nav[^<]*)<\/style>/i);
    if (inlineNavStyles) {
        console.log('\n⚠️  Has inline navigation styles');
    }

    return {
        hasPremiumNav,
        hasUniversalCSS: cssFiles.includes('css/universal-nav.css'),
        navItemCount: navItems.length
    };
}

// Analyze key pages
const pages = [
    'index.html',
    'about.html',
    'services.html',
    'web-design.html',
    'blog/blog.html'
];

console.log('════════════════════════════════════════════════');
console.log('       NAVIGATION VISUAL ANALYSIS');
console.log('════════════════════════════════════════════════');

const results = {};

pages.forEach(page => {
    const filePath = path.join(__dirname, '..', page);
    if (fs.existsSync(filePath)) {
        const html = fs.readFileSync(filePath, 'utf-8');
        results[page] = extractNavigationInfo(html, page);
    } else {
        console.log(`\n❌ ${page} - File not found`);
    }
});

// Summary
console.log('\n════════════════════════════════════════════════');
console.log('                 SUMMARY');
console.log('════════════════════════════════════════════════');

const withPremiumNav = Object.entries(results).filter(([_, r]) => r.hasPremiumNav);
const withUniversalCSS = Object.entries(results).filter(([_, r]) => r.hasUniversalCSS);

console.log(`\nPages with Premium Navigation: ${withPremiumNav.length}/${Object.keys(results).length}`);
withPremiumNav.forEach(([page]) => console.log(`  ✅ ${page}`));

const withoutPremiumNav = Object.entries(results).filter(([_, r]) => !r.hasPremiumNav);
if (withoutPremiumNav.length > 0) {
    console.log(`\nPages WITHOUT Premium Navigation:`);
    withoutPremiumNav.forEach(([page]) => console.log(`  ❌ ${page}`));
}

console.log(`\nPages with Universal CSS: ${withUniversalCSS.length}/${Object.keys(results).length}`);
withUniversalCSS.forEach(([page]) => console.log(`  ✅ ${page}`));

const withoutUniversalCSS = Object.entries(results).filter(([_, r]) => !r.hasUniversalCSS);
if (withoutUniversalCSS.length > 0) {
    console.log(`\nPages WITHOUT Universal CSS:`);
    withoutUniversalCSS.forEach(([page]) => console.log(`  ❌ ${page}`));
}

console.log('\n════════════════════════════════════════════════');
console.log('           VISUAL CONSISTENCY CHECK');
console.log('════════════════════════════════════════════════');

// Check if all pages have similar nav item counts
const navCounts = Object.entries(results).map(([page, r]) => ({
    page,
    count: r.navItemCount
}));

const avgCount = navCounts.reduce((sum, p) => sum + p.count, 0) / navCounts.length;
console.log(`\nAverage navigation items: ${avgCount.toFixed(1)}`);

navCounts.forEach(({page, count}) => {
    const diff = Math.abs(count - avgCount);
    const status = diff <= 1 ? '✅' : '⚠️';
    console.log(`${status} ${page}: ${count} items`);
});

console.log('\n💡 Recommendations:');
if (withoutPremiumNav.length > 0) {
    console.log('1. Update these pages to use premium-nav structure:');
    withoutPremiumNav.forEach(([page]) => console.log(`   - ${page}`));
}
if (withoutUniversalCSS.length > 0) {
    console.log('2. Add universal-nav.css to these pages:');
    withoutUniversalCSS.forEach(([page]) => console.log(`   - ${page}`));
}

console.log('\n════════════════════════════════════════════════');