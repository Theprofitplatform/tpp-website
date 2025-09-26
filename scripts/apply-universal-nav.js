#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of all pages to update
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

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║           APPLYING UNIVERSAL NAVIGATION TO ALL PAGES             ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

let successCount = 0;
let failCount = 0;

// First, ensure universal-nav.css is added to all pages
pages.forEach(page => {
    const filePath = path.join(__dirname, '..', page);

    if (!fs.existsSync(filePath)) {
        console.log(`❌ ${page}: File not found`);
        failCount++;
        return;
    }

    let html = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // Remove old fix CSS files if present
    const oldFixes = [
        'css/services-fix.css',
        'css/index-nav-fix.css',
        'css/alignment-fix.css'
    ];

    oldFixes.forEach(oldFix => {
        if (html.includes(oldFix)) {
            const regex = new RegExp(`\\s*<link[^>]*href="${oldFix}"[^>]*>`, 'g');
            html = html.replace(regex, '');
            modified = true;
            console.log(`   Removed old fix: ${oldFix} from ${page}`);
        }
    });

    // Check if universal-nav.css is already included
    if (!html.includes('universal-nav.css')) {
        // Find where to insert the universal-nav.css
        const stylePattern = /<link[^>]*href="css\/style(?:\.min)?\.css"[^>]*>/;
        const styleMatch = html.match(stylePattern);

        if (styleMatch) {
            // Insert universal-nav.css after style.css
            const insertPosition = html.indexOf(styleMatch[0]) + styleMatch[0].length;
            const beforeInsert = html.substring(0, insertPosition);
            const afterInsert = html.substring(insertPosition);

            // Add the universal navigation CSS
            const navCSSLink = '\n\n    <!-- Universal Navigation Styles -->\n    <link rel="stylesheet" href="css/universal-nav.css">';

            html = beforeInsert + navCSSLink + afterInsert;
            modified = true;
            console.log(`✅ ${page}: Added universal-nav.css`);
        } else {
            // Try alternative: insert before closing </head>
            const headClosePattern = /<\/head>/i;
            if (html.match(headClosePattern)) {
                const navCSSLink = '    <!-- Universal Navigation Styles -->\n    <link rel="stylesheet" href="css/universal-nav.css">\n\n';
                html = html.replace(headClosePattern, navCSSLink + '</head>');
                modified = true;
                console.log(`✅ ${page}: Added universal-nav.css (before </head>)`);
            } else {
                console.log(`⚠️  ${page}: Could not find insertion point for CSS`);
                failCount++;
                return;
            }
        }
    } else {
        console.log(`✓ ${page}: Already has universal-nav.css`);
    }

    // Remove any inline navigation styles that might conflict
    const styleBlockPattern = /<style>[\s\S]*?\/\*\s*Navigation[^*]*\*\/[\s\S]*?<\/style>/gi;
    if (styleBlockPattern.test(html)) {
        html = html.replace(styleBlockPattern, '');
        modified = true;
        console.log(`   Removed inline navigation styles from ${page}`);
    }

    // Save the file if modified
    if (modified) {
        fs.writeFileSync(filePath, html);
        successCount++;
    }
});

// Create a report
console.log('\n╔══════════════════════════════════════════════════════════════════╗');
console.log('║                            SUMMARY                               ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');

console.log(`\n✅ Successfully updated: ${successCount} pages`);
console.log(`❌ Failed to update: ${failCount} pages`);

console.log('\n📋 NEXT STEPS:');
console.log('1. Check that all pages load correctly');
console.log('2. Verify navigation alignment is consistent');
console.log('3. Test mobile responsiveness');
console.log('4. Update active states for each page\'s navigation');

console.log('\n💡 IMPORTANT NOTES:');
console.log('• The navigation structure itself needs to match the template');
console.log('• Each page should mark its own nav item as "active"');
console.log('• Blog page links need "../" prefix for paths');
console.log('• About page needs complete navigation HTML replacement');

process.exit(failCount > 0 ? 1 : 0);