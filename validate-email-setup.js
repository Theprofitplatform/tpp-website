#!/usr/bin/env node

/**
 * Contact Form Email Notification Validation Script
 * Validates the setup and configuration of the enhanced contact form
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Contact Form Email Notification - Validation Script');
console.log('=' .repeat(60));

// Configuration
const CONTACT_FORM_PATH = './website/contact.html';
const TEST_SUITE_PATH = './test-contact-form.html';
const DOCS_PATH = './docs/contact-form-email-notifications.md';

// Validation results
let validationResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    issues: []
};

// Helper functions
function logPass(message) {
    console.log(`✅ PASS: ${message}`);
    validationResults.passed++;
}

function logFail(message) {
    console.log(`❌ FAIL: ${message}`);
    validationResults.failed++;
    validationResults.issues.push(message);
}

function logWarn(message) {
    console.log(`⚠️  WARN: ${message}`);
    validationResults.warnings++;
}

function logInfo(message) {
    console.log(`ℹ️  INFO: ${message}`);
}

// Validation functions
function validateFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
        logPass(`${description} exists`);
        return true;
    } else {
        logFail(`${description} not found at ${filePath}`);
        return false;
    }
}

function validateFormConfiguration() {
    logInfo('Validating form configuration...');

    if (!validateFileExists(CONTACT_FORM_PATH, 'Contact form file')) {
        return;
    }

    const formContent = fs.readFileSync(CONTACT_FORM_PATH, 'utf8');

    // Check required Formspree fields
    const requiredFields = [
        { field: 'action="https://formspree.io/f/meoqjgzn"', desc: 'Formspree endpoint' },
        { field: 'name="_subject"', desc: 'Dynamic subject field' },
        { field: 'name="_replyto"', desc: 'Reply-to field' },
        { field: 'name="_cc"', desc: 'CC backup email field' },
        { field: 'name="department"', desc: 'Department selection field' },
        { field: 'name="priority_level"', desc: 'Priority level field' },
        { field: 'name="estimated_value"', desc: 'Estimated value field' },
        { field: 'name="formatted_inquiry"', desc: 'Formatted email content field' }
    ];

    requiredFields.forEach(({ field, desc }) => {
        if (formContent.includes(field)) {
            logPass(`${desc} configured`);
        } else {
            logFail(`${desc} missing or misconfigured`);
        }
    });

    // Check required JavaScript functions
    const requiredFunctions = [
        'updateEmailSubject',
        'prepareFormSubmission',
        'setPriorityLevel',
        'createFormattedEmail',
        'showSubmissionFeedback'
    ];

    requiredFunctions.forEach(func => {
        if (formContent.includes(`function ${func}`)) {
            logPass(`JavaScript function ${func} found`);
        } else {
            logFail(`JavaScript function ${func} missing`);
        }
    });

    // Check for enhanced features
    if (formContent.includes('department-option')) {
        logPass('Department selection UI found');
    } else {
        logWarn('Department selection UI might be missing');
    }

    if (formContent.includes('honeypot')) {
        logPass('Spam protection (honeypot) configured');
    } else {
        logWarn('Spam protection might not be configured');
    }
}

function validateEmailTemplates() {
    logInfo('Validating email template configuration...');

    if (!fs.existsSync(CONTACT_FORM_PATH)) return;

    const formContent = fs.readFileSync(CONTACT_FORM_PATH, 'utf8');

    // Check email subject templates
    const subjectPatterns = [
        '🚀 New $997 Marketing Audit Request',
        '🔍 SEO Consultation Request',
        '📢 Google Ads Setup Request',
        '💻 Website Optimization Request'
    ];

    let subjectTemplatesFound = 0;
    subjectPatterns.forEach(pattern => {
        if (formContent.includes(pattern)) {
            subjectTemplatesFound++;
        }
    });

    if (subjectTemplatesFound >= 3) {
        logPass(`Email subject templates configured (${subjectTemplatesFound}/4 found)`);
    } else {
        logFail(`Email subject templates incomplete (${subjectTemplatesFound}/4 found)`);
    }

    // Check email formatting
    if (formContent.includes('NEW HIGH-VALUE LEAD ALERT')) {
        logPass('Professional email template formatting found');
    } else {
        logFail('Professional email template formatting missing');
    }

    // Check priority classification
    if (formContent.includes('urgent') && formContent.includes('priority')) {
        logPass('Priority classification system found');
    } else {
        logWarn('Priority classification system might not be complete');
    }
}

function validateTestSuite() {
    logInfo('Validating test suite...');

    if (validateFileExists(TEST_SUITE_PATH, 'Test suite file')) {
        const testContent = fs.readFileSync(TEST_SUITE_PATH, 'utf8');

        const testCategories = [
            'Configuration Tests',
            'Email Field Tests',
            'Dynamic Content Tests',
            'Priority Classification Tests',
            'Form Data Preview'
        ];

        testCategories.forEach(category => {
            if (testContent.includes(category)) {
                logPass(`Test category "${category}" found`);
            } else {
                logWarn(`Test category "${category}" missing`);
            }
        });
    }
}

function validateDocumentation() {
    logInfo('Validating documentation...');

    if (validateFileExists(DOCS_PATH, 'Documentation file')) {
        const docContent = fs.readFileSync(DOCS_PATH, 'utf8');

        const requiredSections = [
            'Technical Architecture',
            'Email Notification Features',
            'JavaScript Functions',
            'Testing',
            'Troubleshooting',
            'Success Metrics'
        ];

        requiredSections.forEach(section => {
            if (docContent.includes(section)) {
                logPass(`Documentation section "${section}" found`);
            } else {
                logWarn(`Documentation section "${section}" missing`);
            }
        });
    }
}

function validateFormspreeIntegration() {
    logInfo('Validating Formspree integration...');

    // Check if the form endpoint is accessible
    logInfo('Note: Manual verification required for Formspree configuration:');
    console.log('  1. Log into https://formspree.io/forms/meoqjgzn');
    console.log('  2. Verify email notifications are enabled');
    console.log('  3. Confirm notification email address is correct');
    console.log('  4. Test form submission with real email');

    logWarn('Formspree configuration requires manual verification');
}

function generateReport() {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 VALIDATION SUMMARY');
    console.log('=' .repeat(60));

    console.log(`✅ Passed: ${validationResults.passed}`);
    console.log(`❌ Failed: ${validationResults.failed}`);
    console.log(`⚠️  Warnings: ${validationResults.warnings}`);

    const totalChecks = validationResults.passed + validationResults.failed;
    const successRate = totalChecks > 0 ? ((validationResults.passed / totalChecks) * 100).toFixed(1) : 0;

    console.log(`📈 Success Rate: ${successRate}%`);

    if (validationResults.failed === 0) {
        console.log('\n🎉 All critical validations passed!');
        console.log('Your contact form email notification system is ready for deployment.');
    } else {
        console.log('\n🚨 Critical issues found:');
        validationResults.issues.forEach(issue => {
            console.log(`   • ${issue}`);
        });
        console.log('\nPlease address these issues before deployment.');
    }

    if (validationResults.warnings > 0) {
        console.log('\n⚠️  Please review warnings and consider addressing them.');
    }

    console.log('\n📋 Next Steps:');
    console.log('1. Review deployment checklist: ./deployment-checklist.md');
    console.log('2. Run test suite: Open ./test-contact-form.html in browser');
    console.log('3. Test live form submission with real email');
    console.log('4. Verify Formspree dashboard configuration');
    console.log('5. Monitor email delivery for first few submissions');
}

// Main validation execution
function runValidation() {
    console.log('Starting validation...\n');

    validateFormConfiguration();
    console.log('');

    validateEmailTemplates();
    console.log('');

    validateTestSuite();
    console.log('');

    validateDocumentation();
    console.log('');

    validateFormspreeIntegration();

    generateReport();
}

// Run the validation
runValidation();