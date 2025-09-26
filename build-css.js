#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { minify } from 'csso';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEBSITE_DIR = path.join(__dirname, 'website');
const CSS_DIR = path.join(WEBSITE_DIR, 'css');
const OUTPUT_DIR = path.join(WEBSITE_DIR, 'css');

// Define CSS files in order of priority
const CSS_FILES_ORDER = [
  // Critical CSS first
  'css/critical.css',
  'css/critical.min.css',

  // Theme variables and base styles
  'css/modern-theme-variables.css',
  'css/style.min.css',

  // Layout and navigation
  'css/layout.css',
  'css/navigation.css',
  'css/navigation-dropdown-fix.css',
  'css/navigation-glass-enhanced.css',
  'css/navigation-contact-page-fix.css',
  'css/index-nav-fix.css',
  'css/skip-links-fix.css',

  // Component styles
  'css/modern-theme-components.css',
  'css/hero-fix.css',
  'css/hero-content-spacing.css',
  'css/main-content-spacing.css',
  'css/trust-signals-enhanced.css',
  'css/google-ads-enhanced.css',

  // Responsive and utilities
  'css/responsive.css',
  'css/page-specific-responsive.css',
  'css/loading-states.css',

  // Consolidated files (if they exist and aren't duplicates)
  'css/consolidated/critical.css',
  'css/consolidated/components.css',
  'css/consolidated/pages.css',
  'css/consolidated/responsive.css'
];

// Critical CSS selectors for above-the-fold content
const CRITICAL_SELECTORS = [
  // Reset and base
  '*', 'html', 'body',

  // Typography
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a',

  // Navigation
  'nav', 'header', '.nav', '.navbar', '.navigation',
  '.nav-container', '.nav-wrapper', '.nav-menu',

  // Hero section
  '.hero', '.hero-section', '.hero-content', '.hero-container',
  '.hero-title', '.hero-subtitle', '.hero-description',

  // Above the fold containers
  '.container', '.wrapper', '.main-content',

  // Critical utilities
  '.sr-only', '.visually-hidden', '.skip-link',

  // Loading states
  '.loading', '.spinner', '.skeleton'
];

function readCSSFile(filePath) {
  const fullPath = path.join(WEBSITE_DIR, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`  Reading: ${filePath}`);
    return fs.readFileSync(fullPath, 'utf8');
  }
  console.log(`  Skipping (not found): ${filePath}`);
  return '';
}

function removeDuplicateRules(css) {
  const rules = new Map();
  const ruleRegex = /([^{]+)\{([^}]+)\}/g;
  let match;

  while ((match = ruleRegex.exec(css)) !== null) {
    const selector = match[1].trim();
    const properties = match[2].trim();

    // Store only the last occurrence of each selector
    rules.set(selector, properties);
  }

  // Rebuild CSS from unique rules
  let uniqueCSS = '';
  for (const [selector, properties] of rules) {
    uniqueCSS += `${selector}{${properties}}`;
  }

  return uniqueCSS;
}

function extractCriticalCSS(css) {
  let criticalCSS = '';

  // Extract @import statements
  const importRegex = /@import[^;]+;/g;
  const imports = css.match(importRegex) || [];
  criticalCSS += imports.join('\n') + '\n';

  // Extract CSS variables
  const varRegex = /:root\s*\{[^}]+\}/g;
  const vars = css.match(varRegex) || [];
  criticalCSS += vars.join('\n') + '\n';

  // Extract critical selectors
  for (const selector of CRITICAL_SELECTORS) {
    // Create regex to match the selector and its rules
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const selectorRegex = new RegExp(`${escapedSelector}[^{]*\\{[^}]+\\}`, 'g');
    const matches = css.match(selectorRegex) || [];
    criticalCSS += matches.join('\n') + '\n';
  }

  // Extract media queries for critical selectors
  const mediaRegex = /@media[^{]+\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g;
  const mediaQueries = css.match(mediaRegex) || [];

  for (const media of mediaQueries) {
    let hasCritical = false;
    for (const selector of CRITICAL_SELECTORS) {
      if (media.includes(selector)) {
        hasCritical = true;
        break;
      }
    }
    if (hasCritical) {
      criticalCSS += media + '\n';
    }
  }

  return criticalCSS;
}

function fixCSSPaths(css) {
  // Fix incorrect paths
  css = css.replace(/\/website\/css\//g, '/css/');
  css = css.replace(/url\(['"]?\/website\//g, 'url(\'/');
  css = css.replace(/url\(['"]?\.\.\/\.\.\//g, 'url(\'../');

  return css;
}

async function buildCSS() {
  console.log('Starting CSS build process...\n');

  // Step 1: Read all CSS files
  console.log('Step 1: Reading CSS files...');
  let combinedCSS = '';
  const processedFiles = new Set();

  for (const cssFile of CSS_FILES_ORDER) {
    if (!processedFiles.has(cssFile)) {
      const content = readCSSFile(cssFile);
      if (content) {
        combinedCSS += `\n/* === ${cssFile} === */\n${content}\n`;
        processedFiles.add(cssFile);
      }
    }
  }

  // Also read any CSS files not in our list
  console.log('\nChecking for additional CSS files...');
  const allCSSFiles = fs.readdirSync(CSS_DIR)
    .filter(f => f.endsWith('.css'))
    .map(f => `css/${f}`);

  for (const cssFile of allCSSFiles) {
    if (!processedFiles.has(cssFile) && !cssFile.includes('.min.css')) {
      const content = readCSSFile(cssFile);
      if (content) {
        combinedCSS += `\n/* === ${cssFile} === */\n${content}\n`;
        processedFiles.add(cssFile);
      }
    }
  }

  // Step 2: Fix paths
  console.log('\nStep 2: Fixing CSS paths...');
  combinedCSS = fixCSSPaths(combinedCSS);

  // Step 3: Remove duplicates
  console.log('Step 3: Removing duplicate rules...');
  const uniqueCSS = removeDuplicateRules(combinedCSS);

  // Step 4: Minify
  console.log('Step 4: Minifying CSS...');
  const minifiedCSS = minify(uniqueCSS).css;

  // Step 5: Extract critical CSS
  console.log('Step 5: Extracting critical CSS...');
  const criticalCSS = extractCriticalCSS(combinedCSS);
  const minifiedCriticalCSS = minify(criticalCSS).css;

  // Step 6: Write output files
  console.log('\nStep 6: Writing output files...');

  // Write combined CSS (unminified for debugging)
  const combinedPath = path.join(OUTPUT_DIR, 'combined.css');
  fs.writeFileSync(combinedPath, uniqueCSS);
  console.log(`  Written: ${combinedPath}`);

  // Write minified combined CSS
  const minifiedPath = path.join(OUTPUT_DIR, 'combined.min.css');
  fs.writeFileSync(minifiedPath, minifiedCSS);
  console.log(`  Written: ${minifiedPath}`);

  // Write critical inline CSS
  const criticalPath = path.join(OUTPUT_DIR, 'critical-inline.css');
  fs.writeFileSync(criticalPath, criticalCSS);
  console.log(`  Written: ${criticalPath}`);

  // Write minified critical CSS
  const criticalMinPath = path.join(OUTPUT_DIR, 'critical-inline.min.css');
  fs.writeFileSync(criticalMinPath, minifiedCriticalCSS);
  console.log(`  Written: ${criticalMinPath}`);

  // Stats
  console.log('\n=== Build Statistics ===');
  console.log(`Files processed: ${processedFiles.size}`);
  console.log(`Original size: ${(combinedCSS.length / 1024).toFixed(2)} KB`);
  console.log(`Minified size: ${(minifiedCSS.length / 1024).toFixed(2)} KB`);
  console.log(`Critical CSS size: ${(minifiedCriticalCSS.length / 1024).toFixed(2)} KB`);
  console.log(`Size reduction: ${((1 - minifiedCSS.length / combinedCSS.length) * 100).toFixed(1)}%`);

  console.log('\nCSS build completed successfully!');

  // Step 7: Generate HTML update snippet
  console.log('\n=== HTML Update Instructions ===');
  console.log('Replace all CSS links in <head> with:');
  console.log(`
<!-- Critical CSS (inline for performance) -->
<style>${minifiedCriticalCSS.substring(0, 200)}...</style>

<!-- Main CSS (preload then load) -->
<link rel="preload" href="/css/combined.min.css" as="style">
<link rel="stylesheet" href="/css/combined.min.css" media="all">
  `);
}

// Run the build
buildCSS().catch(console.error);