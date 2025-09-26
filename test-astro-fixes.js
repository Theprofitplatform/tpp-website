#!/usr/bin/env node

/**
 * Test script to verify all critical fixes have been applied to the Astro homepage
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Test results
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function testPassed(message) {
  console.log(`${colors.green}✅ PASS${colors.reset}: ${message}`);
  totalTests++;
  passedTests++;
}

function testFailed(message) {
  console.log(`${colors.red}❌ FAIL${colors.reset}: ${message}`);
  totalTests++;
  failedTests++;
}

function info(message) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

function section(title) {
  console.log(`\n${colors.yellow}═══ ${title} ═══${colors.reset}`);
}

// Main test function
function runTests() {
  console.log(`${colors.blue}
╔════════════════════════════════════════════╗
║  ASTRO HOMEPAGE CRITICAL FIXES TEST SUITE  ║
╚════════════════════════════════════════════╝${colors.reset}`);

  const indexPath = path.join(__dirname, 'astro-site', 'src', 'pages', 'index.astro');

  if (!fs.existsSync(indexPath)) {
    console.error(`${colors.red}ERROR: index.astro not found at ${indexPath}${colors.reset}`);
    process.exit(1);
  }

  const content = fs.readFileSync(indexPath, 'utf-8');

  section('1. CONTACT FORM STRUCTURE');

  // Test for form tag
  if (content.includes('<form id="contactForm"')) {
    testPassed('Form wrapper exists with correct ID');
  } else {
    testFailed('Form wrapper missing or incorrect');
  }

  // Test for firstName field
  if (content.includes('id="firstName"') && content.includes('name="firstName"')) {
    testPassed('firstName field exists');
  } else {
    testFailed('firstName field missing');
  }

  // Test for lastName field
  if (content.includes('id="lastName"') && content.includes('name="lastName"')) {
    testPassed('lastName field exists');
  } else {
    testFailed('lastName field missing');
  }

  // Test for email field
  if (content.includes('id="email"') && content.includes('name="email"')) {
    testPassed('email field exists');
  } else {
    testFailed('email field missing');
  }

  // Test for phone field
  if (content.includes('id="phone"') && content.includes('name="phone"')) {
    testPassed('phone field exists');
  } else {
    testFailed('phone field missing');
  }

  // Test for submit button
  if (content.includes('type="submit"')) {
    testPassed('Submit button exists');
  } else {
    testFailed('Submit button missing');
  }

  // Test for form action
  if (content.includes('action="/api/contact"')) {
    testPassed('Form action set correctly');
  } else {
    testFailed('Form action missing or incorrect');
  }

  section('2. PHONE NUMBER CONSISTENCY');

  // Check for old phone number
  const oldPhoneRegex = /0402[\s-]?566[\s-]?265/g;
  const oldPhoneMatches = content.match(oldPhoneRegex);

  if (!oldPhoneMatches) {
    testPassed('Old phone number (0402 566 265) has been removed');
  } else {
    testFailed(`Old phone number still found ${oldPhoneMatches.length} time(s)`);
  }

  // Check for new phone number
  const newPhoneRegex = /0487[\s-]?286[\s-]?451/g;
  const newPhoneMatches = content.match(newPhoneRegex);

  if (newPhoneMatches && newPhoneMatches.length > 0) {
    testPassed(`New phone number (0487 286 451) found ${newPhoneMatches.length} time(s)`);
  } else {
    testFailed('New phone number not found');
  }

  section('3. HERO CTA LINK');

  // Check for broken contact.html link
  if (content.includes('href="contact.html"')) {
    testFailed('Broken contact.html link still exists');
  } else {
    testPassed('No broken contact.html links found');
  }

  // Check for correct #contact anchor
  if (content.includes('href="#contact"')) {
    testPassed('Correct #contact anchor link exists');
  } else {
    testFailed('#contact anchor link not found');
  }

  section('4. JAVASCRIPT FILES');

  // Check for form handler script
  if (content.includes('src="/src/scripts/form-handler.js"')) {
    testPassed('Form handler script included');
  } else {
    testFailed('Form handler script not included');
  }

  // Check for interactive features script
  if (content.includes('src="/src/scripts/interactive-features.js"')) {
    testPassed('Interactive features script included');
  } else {
    testFailed('Interactive features script not included');
  }

  // Check if script files exist
  const formHandlerPath = path.join(__dirname, 'astro-site', 'src', 'scripts', 'form-handler.js');
  if (fs.existsSync(formHandlerPath)) {
    testPassed('form-handler.js file exists');
  } else {
    testFailed('form-handler.js file missing');
  }

  const interactivePath = path.join(__dirname, 'astro-site', 'src', 'scripts', 'interactive-features.js');
  if (fs.existsSync(interactivePath)) {
    testPassed('interactive-features.js file exists');
  } else {
    testFailed('interactive-features.js file missing');
  }

  section('5. API ENDPOINT');

  // Check if API endpoint file exists
  const apiPath = path.join(__dirname, 'astro-site', 'src', 'pages', 'api', 'contact.js');
  if (fs.existsSync(apiPath)) {
    testPassed('API endpoint file exists at /api/contact.js');
  } else {
    testFailed('API endpoint file missing');
  }

  section('6. FORM FIELDS COMPLETENESS');

  // Check for all required form fields
  const requiredFields = [
    'firstName', 'lastName', 'email', 'phone', 'company',
    'industry', 'budget', 'services', 'message', 'consent'
  ];

  requiredFields.forEach(field => {
    if (content.includes(`id="${field}"`) || content.includes(`name="${field}"`)) {
      testPassed(`Field '${field}' exists`);
    } else {
      testFailed(`Field '${field}' missing`);
    }
  });

  section('7. PROCESS SECTION ENHANCEMENT');

  // Check if process section has been enhanced
  if (content.includes('From Struggling to Dominating in 90 Days')) {
    testPassed('Process section title updated');
  } else {
    testFailed('Process section title not updated');
  }

  if (content.includes('process-timeline')) {
    testPassed('Process timeline structure exists');
  } else {
    testFailed('Process timeline structure missing');
  }

  // Print summary
  console.log(`\n${colors.yellow}═══ TEST SUMMARY ═══${colors.reset}`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);

  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  if (failedTests === 0) {
    console.log(`\n${colors.green}🎉 ALL TESTS PASSED! (${successRate}%)${colors.reset}`);
    console.log('The Astro homepage is ready for deployment!');
  } else {
    console.log(`\n${colors.red}⚠️ SOME TESTS FAILED (${successRate}% pass rate)${colors.reset}`);
    console.log('Please fix the failing tests before deployment.');
  }

  // Return exit code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run the tests
runTests();