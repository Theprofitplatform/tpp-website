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

// Only truly critical selectors for above-the-fold
const CRITICAL_SELECTORS = [
  // Essential resets
  '\\*', 'html', 'body',

  // CSS Variables (root only)
  ':root',

  // Typography for hero
  'h1', 'h2', '.hero h1', '.hero h2', '.hero p',

  // Navigation essentials
  'header', 'nav', '.navbar', '.nav-container',
  '.nav-menu', '.nav-link', '.nav-brand',

  // Hero section only
  '.hero', '.hero-section', '.hero-container',
  '.hero-content', '.hero-title', '.hero-subtitle',
  '.hero-cta', '.hero-buttons',

  // Container basics
  '.container',

  // Critical utilities
  '.sr-only', '.skip-link',

  // Loading state for initial render
  '.loading'
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
  const mediaQueries = [];
  const keyframes = [];
  const imports = [];

  // Extract special rules first
  css = css.replace(/@import[^;]+;/g, (match) => {
    imports.push(match);
    return '';
  });

  css = css.replace(/@keyframes\s+[\w-]+\s*\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g, (match) => {
    keyframes.push(match);
    return '';
  });

  css = css.replace(/@media[^{]+\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g, (match) => {
    mediaQueries.push(match);
    return '';
  });

  // Process regular rules
  const ruleRegex = /([^{]+)\{([^}]+)\}/g;
  let match;

  while ((match = ruleRegex.exec(css)) !== null) {
    const selector = match[1].trim();
    const properties = match[2].trim();

    // Only keep the last occurrence
    rules.set(selector, properties);
  }

  // Rebuild CSS
  let uniqueCSS = imports.join('\n') + '\n';

  for (const [selector, properties] of rules) {
    uniqueCSS += `${selector}{${properties}}`;
  }

  uniqueCSS += '\n' + keyframes.join('\n');
  uniqueCSS += '\n' + mediaQueries.join('\n');

  return uniqueCSS;
}

function extractCriticalCSS(css) {
  let criticalCSS = '';

  // Extract @import statements
  const importRegex = /@import[^;]+;/g;
  const imports = css.match(importRegex) || [];
  if (imports.length > 0) {
    criticalCSS += imports.join('\n') + '\n';
  }

  // Extract only :root CSS variables
  const rootRegex = /:root\s*\{[^}]+\}/g;
  const rootVars = css.match(rootRegex) || [];
  if (rootVars.length > 0) {
    criticalCSS += rootVars.join('\n') + '\n';
  }

  // Extract critical selectors with their rules
  for (const selector of CRITICAL_SELECTORS) {
    const selectorRegex = new RegExp(`${selector}\\s*\\{[^}]+\\}`, 'g');
    const matches = css.match(selectorRegex) || [];
    if (matches.length > 0) {
      criticalCSS += matches.join('\n') + '\n';
    }
  }

  // Extract only critical keyframes (for hero animations)
  const criticalKeyframes = ['fadeIn', 'slideIn', 'fadeInUp', 'float'];
  for (const keyframe of criticalKeyframes) {
    const keyframeRegex = new RegExp(`@keyframes\\s+${keyframe}\\s*\\{(?:[^{}]*\\{[^}]*\\})*[^}]*\\}`, 'g');
    const matches = css.match(keyframeRegex) || [];
    if (matches.length > 0) {
      criticalCSS += matches.join('\n') + '\n';
    }
  }

  // Extract only mobile media queries for critical elements
  const mobileMediaRegex = /@media[^{]*max-width:\s*(768px|991px)[^{]*\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g;
  const mobileQueries = css.match(mobileMediaRegex) || [];

  for (const query of mobileQueries) {
    // Check if it contains critical selectors
    let hasCritical = false;
    for (const selector of ['.hero', '.nav', 'header', 'h1']) {
      if (query.includes(selector)) {
        hasCritical = true;
        break;
      }
    }
    if (hasCritical) {
      criticalCSS += query + '\n';
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
  console.log('Starting optimized CSS build process...\n');

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
  if (fs.existsSync(CSS_DIR)) {
    const allCSSFiles = fs.readdirSync(CSS_DIR)
      .filter(f => f.endsWith('.css') && !f.endsWith('.min.css'))
      .map(f => `css/${f}`);

    for (const cssFile of allCSSFiles) {
      if (!processedFiles.has(cssFile)) {
        const content = readCSSFile(cssFile);
        if (content) {
          combinedCSS += `\n/* === ${cssFile} === */\n${content}\n`;
          processedFiles.add(cssFile);
        }
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

  // Step 5: Extract critical CSS (optimized)
  console.log('Step 5: Extracting optimized critical CSS...');
  const criticalCSS = extractCriticalCSS(uniqueCSS);
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

  console.log('\nOptimized CSS build completed successfully!');

  return minifiedCriticalCSS;
}

// Run the build
buildCSS()
  .then(criticalCSS => {
    console.log('\n=== Next Steps ===');
    console.log('1. Update website/index.html to use the new CSS structure');
    console.log('2. Test the website to ensure all styles are working');
    console.log('3. Remove old individual CSS file references');

    // Save the critical CSS content for HTML update
    const updateInstructions = `
<!-- Critical CSS for above-the-fold content -->
<style>${criticalCSS}</style>

<!-- Preload main CSS -->
<link rel="preload" href="/css/combined.min.css" as="style">

<!-- Load main CSS -->
<link rel="stylesheet" href="/css/combined.min.css" media="all">
`;

    fs.writeFileSync(path.join(OUTPUT_DIR, 'html-update.txt'), updateInstructions);
    console.log('\n4. HTML update snippet saved to: website/css/html-update.txt');
  })
  .catch(console.error);