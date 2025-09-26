#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║           DETAILED NAVIGATION TEST REPORT                        ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

const pages = [
    'index.html', 'about.html', 'services.html', 'seo.html',
    'web-design.html', 'google-ads.html', 'pricing.html',
    'portfolio.html', 'contact.html', 'privacy.html',
    'terms.html', 'disclaimer.html'
];

// Test categories
const testCategories = {
    structure: [],
    styling: [],
    responsive: [],
    functionality: []
};

// Detailed test results
const detailedResults = {};

pages.forEach(page => {
    const filePath = path.join(__dirname, '..', page);

    if (!fs.existsSync(filePath)) {
        detailedResults[page] = { error: 'File not found' };
        return;
    }

    const html = fs.readFileSync(filePath, 'utf-8');
    const results = {
        structure: {},
        styling: {},
        responsive: {},
        functionality: {},
        score: 0,
        maxScore: 0
    };

    // STRUCTURE TESTS
    results.structure.hasHeader = html.includes('<header');
    results.structure.hasPremiumNav = html.includes('premium-nav');
    results.structure.hasNavContainer = html.includes('nav-floating-container');
    results.structure.hasLogo = html.includes('class="logo') || html.includes("class='logo");
    results.structure.hasNavLinks = html.includes('nav-links') || html.includes('nav-menu');
    results.structure.hasCTA = html.includes('nav-cta') || html.includes('premium-cta-btn');
    results.structure.hasMainContent = html.includes('<main') || html.includes('id="main-content"');

    // STYLING TESTS
    results.styling.hasStyleCSS = html.includes('style.css') || html.includes('style.min.css');
    results.styling.hasCriticalCSS = html.includes('critical.css') || html.includes('critical.min.css');
    results.styling.hasServicesFix = html.includes('services-fix.css');
    results.styling.hasFontAwesome = html.includes('font-awesome');
    results.styling.hasGoogleFonts = html.includes('fonts.googleapis.com');

    // RESPONSIVE TESTS
    results.responsive.hasViewport = html.includes('viewport');
    results.responsive.hasMobileToggle = html.includes('menu-toggle') || html.includes('nav-toggle');
    results.responsive.hasMobileNav = html.includes('mobile-nav');
    results.responsive.hasMobileOverlay = html.includes('mobile-nav-overlay');

    // FUNCTIONALITY TESTS
    results.functionality.hasDropdown = html.includes('dropdown-menu');
    results.functionality.hasARIA = html.includes('aria-');
    results.functionality.hasRoles = html.includes('role=');
    results.functionality.hasSkipLinks = html.includes('skip-link') || html.includes('Skip to');

    // Calculate score
    Object.values(results.structure).forEach(test => {
        results.maxScore++;
        if (test) results.score++;
    });
    Object.values(results.styling).forEach(test => {
        results.maxScore++;
        if (test) results.score++;
    });
    Object.values(results.responsive).forEach(test => {
        results.maxScore++;
        if (test) results.score++;
    });
    Object.values(results.functionality).forEach(test => {
        results.maxScore++;
        if (test) results.score++;
    });

    detailedResults[page] = results;
});

// Display individual page results
console.log('📊 INDIVIDUAL PAGE RESULTS\n');
console.log('═══════════════════════════════════════════════════════════════════\n');

pages.forEach(page => {
    const results = detailedResults[page];

    if (results.error) {
        console.log(`❌ ${page}: ${results.error}\n`);
        return;
    }

    const percentage = Math.round((results.score / results.maxScore) * 100);
    let status = '✅';
    if (percentage < 80) status = '⚠️';
    if (percentage < 60) status = '❌';

    console.log(`${status} ${page.padEnd(20)} Score: ${results.score}/${results.maxScore} (${percentage}%)`);

    // Show failures
    const failures = [];
    Object.entries(results.structure).forEach(([test, passed]) => {
        if (!passed && test !== 'score' && test !== 'maxScore') {
            failures.push(`Structure: ${test}`);
        }
    });
    Object.entries(results.styling).forEach(([test, passed]) => {
        if (!passed && test !== 'score' && test !== 'maxScore') {
            failures.push(`Styling: ${test}`);
        }
    });
    Object.entries(results.responsive).forEach(([test, passed]) => {
        if (!passed && test !== 'score' && test !== 'maxScore') {
            failures.push(`Responsive: ${test}`);
        }
    });
    Object.entries(results.functionality).forEach(([test, passed]) => {
        if (!passed && test !== 'score' && test !== 'maxScore') {
            failures.push(`Functionality: ${test}`);
        }
    });

    if (failures.length > 0) {
        console.log('   Issues:');
        failures.forEach(f => console.log(`     - ${f}`));
    }
    console.log('');
});

// Category Summary
console.log('═══════════════════════════════════════════════════════════════════\n');
console.log('📈 CATEGORY SUMMARY\n');

const categoryScores = {
    structure: { passed: 0, total: 0 },
    styling: { passed: 0, total: 0 },
    responsive: { passed: 0, total: 0 },
    functionality: { passed: 0, total: 0 }
};

pages.forEach(page => {
    const results = detailedResults[page];
    if (results.error) return;

    Object.values(results.structure).forEach(test => {
        if (typeof test === 'boolean') {
            categoryScores.structure.total++;
            if (test) categoryScores.structure.passed++;
        }
    });
    Object.values(results.styling).forEach(test => {
        if (typeof test === 'boolean') {
            categoryScores.styling.total++;
            if (test) categoryScores.styling.passed++;
        }
    });
    Object.values(results.responsive).forEach(test => {
        if (typeof test === 'boolean') {
            categoryScores.responsive.total++;
            if (test) categoryScores.responsive.passed++;
        }
    });
    Object.values(results.functionality).forEach(test => {
        if (typeof test === 'boolean') {
            categoryScores.functionality.total++;
            if (test) categoryScores.functionality.passed++;
        }
    });
});

Object.entries(categoryScores).forEach(([category, scores]) => {
    const percentage = Math.round((scores.passed / scores.total) * 100);
    const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
    console.log(`${category.padEnd(15)} [${bar}] ${percentage}% (${scores.passed}/${scores.total})`);
});

// Overall Summary
console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('🎯 OVERALL SUMMARY\n');

let totalScore = 0;
let totalMaxScore = 0;
let perfectPages = [];
let goodPages = [];
let needsWorkPages = [];

pages.forEach(page => {
    const results = detailedResults[page];
    if (results.error) return;

    totalScore += results.score;
    totalMaxScore += results.maxScore;

    const percentage = Math.round((results.score / results.maxScore) * 100);
    if (percentage === 100) perfectPages.push(page);
    else if (percentage >= 80) goodPages.push(page);
    else needsWorkPages.push(page);
});

const overallPercentage = Math.round((totalScore / totalMaxScore) * 100);

console.log(`Overall Score: ${totalScore}/${totalMaxScore} (${overallPercentage}%)\n`);

if (perfectPages.length > 0) {
    console.log(`🏆 Perfect Navigation (100%): ${perfectPages.length} pages`);
    perfectPages.forEach(p => console.log(`   ✓ ${p}`));
    console.log('');
}

if (goodPages.length > 0) {
    console.log(`✅ Good Navigation (80-99%): ${goodPages.length} pages`);
    goodPages.forEach(p => console.log(`   ✓ ${p}`));
    console.log('');
}

if (needsWorkPages.length > 0) {
    console.log(`⚠️  Needs Improvement (<80%): ${needsWorkPages.length} pages`);
    needsWorkPages.forEach(p => console.log(`   ○ ${p}`));
    console.log('');
}

// Recommendations
console.log('═══════════════════════════════════════════════════════════════════\n');
console.log('💡 RECOMMENDATIONS\n');

if (needsWorkPages.length > 0) {
    console.log('Priority fixes needed for:');
    needsWorkPages.forEach(page => {
        const results = detailedResults[page];
        console.log(`\n${page}:`);

        if (!results.structure.hasHeader) console.log('  • Add proper header element');
        if (!results.structure.hasPremiumNav) console.log('  • Update to premium navigation structure');
        if (!results.styling.hasServicesFix) console.log('  • Include services-fix.css');
        if (!results.responsive.hasMobileToggle) console.log('  • Add mobile menu toggle');
        if (!results.functionality.hasARIA) console.log('  • Add ARIA attributes for accessibility');
    });
}

console.log('\n╚══════════════════════════════════════════════════════════════════╝');

// Exit with status
process.exit(needsWorkPages.length > 0 ? 1 : 0);