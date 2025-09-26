// Simple test to check services page structure
const fs = require('fs');
const path = require('path');

console.log('=== Services Page Structure Test ===\n');

// Read the services.html file
const servicesPath = path.join(__dirname, '..', 'services.html');
const html = fs.readFileSync(servicesPath, 'utf-8');

// Tests
const tests = [
    {
        name: 'CSS files linked',
        check: () => {
            const hasStyleCSS = html.includes('href="css/style.css"');
            const hasCriticalCSS = html.includes('href="css/critical.css"');
            const hasFixCSS = html.includes('href="css/services-fix.css"');
            return {
                passed: hasStyleCSS && hasCriticalCSS && hasFixCSS,
                details: `style.css: ${hasStyleCSS}, critical.css: ${hasCriticalCSS}, fix.css: ${hasFixCSS}`
            };
        }
    },
    {
        name: 'Service cards present',
        check: () => {
            const serviceCardMatches = html.match(/class="service-card"/g);
            const count = serviceCardMatches ? serviceCardMatches.length : 0;
            return {
                passed: count >= 3,
                details: `Found ${count} service cards (expected at least 3)`
            };
        }
    },
    {
        name: 'Hero section exists',
        check: () => {
            const hasHero = html.includes('class="services-hero"');
            return {
                passed: hasHero,
                details: hasHero ? 'Hero section found' : 'Hero section missing'
            };
        }
    },
    {
        name: 'Container elements',
        check: () => {
            const containerMatches = html.match(/class="container"/g);
            const count = containerMatches ? containerMatches.length : 0;
            return {
                passed: count > 0,
                details: `Found ${count} container elements`
            };
        }
    },
    {
        name: 'Main content area',
        check: () => {
            const hasMain = html.includes('id="main-content"');
            return {
                passed: hasMain,
                details: hasMain ? 'Main content area found' : 'Main content area missing'
            };
        }
    },
    {
        name: 'Navigation header',
        check: () => {
            const hasHeader = html.includes('<header');
            return {
                passed: hasHeader,
                details: hasHeader ? 'Header navigation found' : 'Header navigation missing'
            };
        }
    },
    {
        name: 'Sections count',
        check: () => {
            const sectionMatches = html.match(/<section/g);
            const count = sectionMatches ? sectionMatches.length : 0;
            return {
                passed: count >= 5,
                details: `Found ${count} sections (expected at least 5)`
            };
        }
    },
    {
        name: 'Service pricing',
        check: () => {
            const hasPricing = html.includes('class="service-pricing"');
            return {
                passed: hasPricing,
                details: hasPricing ? 'Service pricing sections found' : 'Service pricing missing'
            };
        }
    },
    {
        name: 'CTA buttons',
        check: () => {
            const ctaMatches = html.match(/class="service-cta"/g);
            const count = ctaMatches ? ctaMatches.length : 0;
            return {
                passed: count >= 3,
                details: `Found ${count} CTA buttons (expected at least 3)`
            };
        }
    },
    {
        name: 'Font Awesome icons',
        check: () => {
            const hasFontAwesome = html.includes('font-awesome');
            const hasIcons = html.includes('fa-');
            return {
                passed: hasFontAwesome && hasIcons,
                details: `Font Awesome loaded: ${hasFontAwesome}, Icons used: ${hasIcons}`
            };
        }
    }
];

// Run tests
let passed = 0;
let failed = 0;

tests.forEach(test => {
    const result = test.check();
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${test.name}`);
    console.log(`   ${result.details}\n`);

    if (result.passed) passed++;
    else failed++;
});

// Summary
console.log('=== Test Summary ===');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Total: ${tests.length}`);

// Check for potential issues
console.log('\n=== Checking for Common Issues ===');

// Check for unclosed tags
const divOpen = (html.match(/<div/g) || []).length;
const divClose = (html.match(/<\/div>/g) || []).length;
if (divOpen !== divClose) {
    console.log(`⚠️  Potential unclosed div tags: ${divOpen} opening, ${divClose} closing`);
} else {
    console.log(`✅ Div tags balanced: ${divOpen} tags`);
}

// Check for inline styles that might override CSS
const inlineStyles = (html.match(/style="/g) || []).length;
console.log(`ℹ️  Inline styles found: ${inlineStyles} instances`);

// Check viewport meta tag
const hasViewport = html.includes('viewport');
console.log(hasViewport ? '✅ Viewport meta tag present' : '❌ Viewport meta tag missing');

// Check for CSS variables
const hasCSSVars = html.includes('--premium-gradient');
console.log(hasCSSVars ? '✅ CSS variables defined' : '⚠️  CSS variables might be missing');

process.exit(failed > 0 ? 1 : 0);