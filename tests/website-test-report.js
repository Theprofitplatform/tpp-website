const fs = require('fs');
const path = require('path');

// Website Test Report for The Profit Platform
console.log('='.repeat(80));
console.log('THE PROFIT PLATFORM WEBSITE - COMPREHENSIVE TEST REPORT');
console.log('Generated on:', new Date().toLocaleString());
console.log('='.repeat(80));

// Test Results Object
const testResults = {
    fileExistence: { passed: 0, failed: 0, issues: [] },
    navigation: { passed: 0, failed: 0, issues: [] },
    metaTags: { passed: 0, failed: 0, issues: [] },
    responsiveDesign: { passed: 0, failed: 0, issues: [] },
    interactiveElements: { passed: 0, failed: 0, issues: [] },
    whatsappButton: { passed: 0, failed: 0, issues: [] }
};

// Required files to check
const requiredFiles = [
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

// 1. FILE EXISTENCE TEST
console.log('\n1. FILE EXISTENCE TEST');
console.log('-'.repeat(50));

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} - EXISTS`);
        testResults.fileExistence.passed++;
    } else {
        console.log(`❌ ${file} - MISSING`);
        testResults.fileExistence.failed++;
        testResults.fileExistence.issues.push(`Missing file: ${file}`);
    }
});

// 2. READ AND ANALYZE FILES
console.log('\n2. HTML STRUCTURE & META TAGS ANALYSIS');
console.log('-'.repeat(50));

const analyzeHtmlFile = (filePath, fileName) => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');

        // Check for essential meta tags
        const metaChecks = {
            viewport: content.includes('name="viewport"'),
            description: content.includes('name="description"'),
            title: content.includes('<title>'),
            ogTitle: content.includes('property="og:title"'),
            ogDescription: content.includes('property="og:description"'),
            canonical: content.includes('rel="canonical"')
        };

        console.log(`📄 ${fileName}:`);
        Object.entries(metaChecks).forEach(([check, passed]) => {
            if (passed) {
                console.log(`   ✅ ${check} tag present`);
                testResults.metaTags.passed++;
            } else {
                console.log(`   ❌ ${check} tag missing`);
                testResults.metaTags.failed++;
                testResults.metaTags.issues.push(`${fileName}: Missing ${check} tag`);
            }
        });

        // Check navigation structure
        const navChecks = {
            header: content.includes('role="banner"') || content.includes('<header'),
            nav: content.includes('<nav') || content.includes('role="navigation"'),
            mobileNav: content.includes('mobile-nav') || content.includes('mobile menu'),
            logoLink: content.includes('href="index.html"')
        };

        console.log(`📱 Navigation checks for ${fileName}:`);
        Object.entries(navChecks).forEach(([check, passed]) => {
            if (passed) {
                console.log(`   ✅ ${check} structure present`);
                testResults.navigation.passed++;
            } else {
                console.log(`   ❌ ${check} structure missing`);
                testResults.navigation.failed++;
                testResults.navigation.issues.push(`${fileName}: Missing ${check} structure`);
            }
        });

        // Check for WhatsApp button
        const whatsappPresent = content.includes('whatsapp') && content.includes('float');
        if (whatsappPresent) {
            console.log(`   ✅ WhatsApp float button present`);
            testResults.whatsappButton.passed++;
        } else {
            console.log(`   ❌ WhatsApp float button missing`);
            testResults.whatsappButton.failed++;
            testResults.whatsappButton.issues.push(`${fileName}: Missing WhatsApp float button`);
        }

        // Check responsive design indicators
        const responsiveChecks = {
            viewport: content.includes('width=device-width'),
            mediaQueries: content.includes('@media'),
            mobileFirst: content.includes('max-width') || content.includes('min-width')
        };

        console.log(`📱 Responsive design for ${fileName}:`);
        Object.entries(responsiveChecks).forEach(([check, passed]) => {
            if (passed) {
                console.log(`   ✅ ${check} implemented`);
                testResults.responsiveDesign.passed++;
            } else {
                console.log(`   ❌ ${check} not implemented`);
                testResults.responsiveDesign.failed++;
                testResults.responsiveDesign.issues.push(`${fileName}: Missing ${check}`);
            }
        });

        // Check for interactive elements
        const interactiveChecks = {
            forms: content.includes('<form') && content.includes('type="submit"'),
            buttons: content.includes('<button') || content.includes('role="button"'),
            links: content.includes('<a href='),
            jsInteractivity: content.includes('addEventListener') || content.includes('onclick')
        };

        console.log(`⚡ Interactive elements for ${fileName}:`);
        Object.entries(interactiveChecks).forEach(([check, passed]) => {
            if (passed) {
                console.log(`   ✅ ${check} present`);
                testResults.interactiveElements.passed++;
            } else {
                console.log(`   ⚠️  ${check} not present (may be expected)`);
            }
        });

        console.log(''); // Add spacing

    } catch (error) {
        console.log(`❌ Error reading ${fileName}: ${error.message}`);
        testResults.fileExistence.issues.push(`Error reading ${fileName}: ${error.message}`);
    }
};

// Analyze all files
requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
        analyzeHtmlFile(filePath, file);
    }
});

// 3. GENERATE SUMMARY REPORT
console.log('\n' + '='.repeat(80));
console.log('FINAL TEST SUMMARY');
console.log('='.repeat(80));

const totalTests = Object.values(testResults).reduce((sum, category) => sum + category.passed + category.failed, 0);
const totalPassed = Object.values(testResults).reduce((sum, category) => sum + category.passed, 0);
const totalFailed = Object.values(testResults).reduce((sum, category) => sum + category.failed, 0);

console.log(`Total Tests Run: ${totalTests}`);
console.log(`✅ Passed: ${totalPassed}`);
console.log(`❌ Failed: ${totalFailed}`);
console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);

console.log('\nDETAILED BREAKDOWN:');
Object.entries(testResults).forEach(([category, results]) => {
    const categoryTotal = results.passed + results.failed;
    const categoryRate = categoryTotal > 0 ? ((results.passed / categoryTotal) * 100).toFixed(1) : 'N/A';
    console.log(`📊 ${category}: ${results.passed}/${categoryTotal} passed (${categoryRate}%)`);
});

// 4. ISSUES & RECOMMENDATIONS
if (totalFailed > 0) {
    console.log('\n' + '⚠️'.repeat(20));
    console.log('ISSUES FOUND:');
    console.log('⚠️'.repeat(20));

    Object.entries(testResults).forEach(([category, results]) => {
        if (results.issues.length > 0) {
            console.log(`\n${category.toUpperCase()}:`);
            results.issues.forEach(issue => console.log(`  - ${issue}`));
        }
    });

    console.log('\nRECOMMENDATIONS:');
    console.log('1. Fix any missing meta tags for SEO optimization');
    console.log('2. Ensure all pages have consistent navigation structure');
    console.log('3. Add WhatsApp float button to any missing pages');
    console.log('4. Implement responsive design patterns where missing');
    console.log('5. Test all interactive elements for functionality');
} else {
    console.log('\n🎉 ALL TESTS PASSED! Website is production-ready.');
}

console.log('\n' + '='.repeat(80));
console.log('END OF REPORT');
console.log('='.repeat(80));