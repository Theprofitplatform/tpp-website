#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Pages that need the fix CSS added
const pagesToFix = [
    'index.html',
    'about.html',
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
console.log('   APPLYING NAVIGATION FIX TO ALL PAGES');
console.log('===========================================\n');

let successCount = 0;
let failCount = 0;

pagesToFix.forEach(page => {
    const filePath = path.join(__dirname, '..', page);

    if (!fs.existsSync(filePath)) {
        console.log(`❌ ${page}: File not found`);
        failCount++;
        return;
    }

    let html = fs.readFileSync(filePath, 'utf-8');

    // Check if services-fix.css is already included
    if (html.includes('services-fix.css')) {
        console.log(`✓ ${page}: Already has services-fix.css`);
        successCount++;
        return;
    }

    // Find where to insert the services-fix.css
    // Try to insert after style.css
    const stylePattern = /<link[^>]*href="css\/style\.css"[^>]*>/;
    const styleMatch = html.match(stylePattern);

    if (styleMatch) {
        // Insert services-fix.css after style.css
        const insertPosition = html.indexOf(styleMatch[0]) + styleMatch[0].length;
        const beforeInsert = html.substring(0, insertPosition);
        const afterInsert = html.substring(insertPosition);

        // Add newline and the services-fix.css link
        const fixCSSLink = '\n\n    <!-- Navigation Fix CSS -->\n    <link rel="stylesheet" href="css/services-fix.css">';

        html = beforeInsert + fixCSSLink + afterInsert;

        // Write the updated HTML back to file
        fs.writeFileSync(filePath, html);
        console.log(`✅ ${page}: Added services-fix.css`);
        successCount++;
    } else {
        // Try alternative: insert before closing </head>
        const headClosePattern = /<\/head>/i;
        if (html.match(headClosePattern)) {
            const fixCSSLink = '    <!-- Navigation Fix CSS -->\n    <link rel="stylesheet" href="css/services-fix.css">\n\n';
            html = html.replace(headClosePattern, fixCSSLink + '</head>');

            fs.writeFileSync(filePath, html);
            console.log(`✅ ${page}: Added services-fix.css (before </head>)`);
            successCount++;
        } else {
            console.log(`⚠️  ${page}: Could not find insertion point for CSS`);
            failCount++;
        }
    }
});

// Special handling for pages with different navigation structure
const specialPages = ['about.html', 'web-design.html'];

console.log('\n===========================================');
console.log('   CHECKING SPECIAL NAVIGATION CASES');
console.log('===========================================\n');

specialPages.forEach(page => {
    const filePath = path.join(__dirname, '..', page);
    if (!fs.existsSync(filePath)) {
        console.log(`❌ ${page}: File not found`);
        return;
    }

    const html = fs.readFileSync(filePath, 'utf-8');

    // Check navigation structure
    const hasPremiumNav = html.includes('premium-nav');
    const hasStandardNav = html.includes('nav-menu') || html.includes('nav-links');

    if (!hasPremiumNav) {
        console.log(`⚠️  ${page}: Has different navigation structure (not premium-nav)`);
        console.log(`   - This page may need manual navigation structure update`);

        // Check if it at least has the fix CSS now
        if (html.includes('services-fix.css')) {
            console.log(`   ✓ services-fix.css is included`);
        }
    } else {
        console.log(`✓ ${page}: Has premium navigation structure`);
    }
});

// Summary
console.log('\n===========================================');
console.log('                SUMMARY');
console.log('===========================================');
console.log(`✅ Successfully updated: ${successCount} pages`);
console.log(`❌ Failed to update: ${failCount} pages`);

if (specialPages.length > 0) {
    console.log(`\n⚠️  Special cases requiring manual review:`);
    specialPages.forEach(page => {
        console.log(`   - ${page}`);
    });
}

console.log('\n📝 Next steps:');
console.log('1. Test all pages in browser to verify navigation');
console.log('2. Check mobile responsiveness');
console.log('3. Manually update about.html and web-design.html if needed');

process.exit(failCount > 0 ? 1 : 0);