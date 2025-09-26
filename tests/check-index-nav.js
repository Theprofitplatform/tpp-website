// Quick test to verify index.html navigation fixes
const fs = require('fs');
const path = require('path');

console.log('\n══════════════════════════════════════════════');
console.log('  INDEX.HTML NAVIGATION FIX VERIFICATION');
console.log('══════════════════════════════════════════════\n');

const indexPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(indexPath, 'utf-8');

// Tests
const tests = [
    {
        name: 'Services Fix CSS',
        check: () => html.includes('services-fix.css'),
        critical: true
    },
    {
        name: 'Index Nav Fix CSS',
        check: () => html.includes('index-nav-fix.css'),
        critical: true
    },
    {
        name: 'Premium Navigation',
        check: () => html.includes('premium-nav'),
        critical: true
    },
    {
        name: 'Nav Floating Container',
        check: () => html.includes('nav-floating-container'),
        critical: true
    },
    {
        name: 'Container Element',
        check: () => html.includes('class="container"'),
        critical: false
    },
    {
        name: 'Logo',
        check: () => html.includes('premium-logo'),
        critical: false
    },
    {
        name: 'Navigation Links',
        check: () => html.includes('premium-nav-links'),
        critical: true
    },
    {
        name: 'CTA Button',
        check: () => html.includes('nav-cta'),
        critical: false
    },
    {
        name: 'Mobile Toggle',
        check: () => html.includes('menu-toggle'),
        critical: false
    },
    {
        name: 'Mobile Nav',
        check: () => html.includes('mobile-nav'),
        critical: false
    }
];

let passed = 0;
let failed = 0;
let criticalFails = [];

console.log('📋 CHECKING NAVIGATION COMPONENTS:\n');

tests.forEach(test => {
    const result = test.check();
    const status = result ? '✅' : '❌';
    const importance = test.critical ? '⚡' : '  ';

    console.log(`${importance} ${status} ${test.name}`);

    if (result) {
        passed++;
    } else {
        failed++;
        if (test.critical) {
            criticalFails.push(test.name);
        }
    }
});

console.log('\n══════════════════════════════════════════════');
console.log('  RESULTS');
console.log('══════════════════════════════════════════════\n');

const percentage = Math.round((passed / tests.length) * 100);

console.log(`✅ Passed: ${passed}/${tests.length} (${percentage}%)`);
console.log(`❌ Failed: ${failed}/${tests.length}`);

if (criticalFails.length > 0) {
    console.log('\n⚠️  CRITICAL FAILURES:');
    criticalFails.forEach(fail => {
        console.log(`   - ${fail}`);
    });
} else {
    console.log('\n🎉 All critical components present!');
}

// Check CSS file existence
console.log('\n══════════════════════════════════════════════');
console.log('  CSS FILES CHECK');
console.log('══════════════════════════════════════════════\n');

const cssFiles = [
    'css/services-fix.css',
    'css/index-nav-fix.css',
    'css/style.min.css',
    'css/critical.css'
];

cssFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    const exists = fs.existsSync(filePath);
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${file} ${exists ? 'exists' : 'NOT FOUND'}`);
});

console.log('\n══════════════════════════════════════════════\n');

// Overall status
if (percentage === 100) {
    console.log('🏆 PERFECT! Navigation is fully fixed.');
} else if (percentage >= 80) {
    console.log('✅ GOOD: Navigation is mostly fixed.');
} else {
    console.log('⚠️  NEEDS WORK: Navigation requires attention.');
}

process.exit(failed > 0 ? 1 : 0);