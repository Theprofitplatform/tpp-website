#!/usr/bin/env node

/**
 * Performance Check Script
 * Validates file sizes and optimization requirements
 */

const fs = require('fs');
const path = require('path');
const { gzipSync } = require('zlib');

// Performance thresholds (in bytes)
const THRESHOLDS = {
  CRITICAL_CSS: 14 * 1024,      // 14KB
  TOTAL_CSS: 100 * 1024,        // 100KB
  JAVASCRIPT: 150 * 1024,       // 150KB
  INITIAL_PAGE: 500 * 1024,     // 500KB
  IMAGE_MAX: 200 * 1024         // 200KB per image
};

// File paths to check
const FILES_TO_CHECK = {
  criticalCSS: 'css/critical.min.css',
  mainCSS: 'css/style.min.css',
  javascript: 'js/combined.min.js',
  serviceWorker: 'sw.js',
  manifest: 'manifest.json'
};

class PerformanceChecker {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
  }

  // Get file size (original and gzipped)
  getFileSize(filePath) {
    try {
      const fullPath = path.resolve(filePath);
      if (!fs.existsSync(fullPath)) {
        return { exists: false };
      }

      const content = fs.readFileSync(fullPath);
      const originalSize = content.length;
      const gzippedSize = gzipSync(content).length;

      return {
        exists: true,
        original: originalSize,
        gzipped: gzippedSize,
        path: fullPath
      };
    } catch (error) {
      return { exists: false, error: error.message };
    }
  }

  // Format bytes to human readable
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Check critical CSS requirements
  checkCriticalCSS() {
    console.log('\n🎯 Checking Critical CSS...');
    const fileInfo = this.getFileSize(FILES_TO_CHECK.criticalCSS);

    if (!fileInfo.exists) {
      this.logFail('Critical CSS file not found');
      return;
    }

    const size = fileInfo.gzipped;
    const threshold = THRESHOLDS.CRITICAL_CSS;

    if (size <= threshold) {
      this.logPass(`Critical CSS size: ${this.formatBytes(size)} (gzipped)`);
    } else {
      this.logFail(`Critical CSS too large: ${this.formatBytes(size)} > ${this.formatBytes(threshold)}`);
    }

    // Check if it contains above-the-fold styles
    const content = fs.readFileSync(FILES_TO_CHECK.criticalCSS, 'utf8');
    const criticalSelectors = ['.hero', '.nav', 'header', ':root'];
    const hasCriticalStyles = criticalSelectors.some(selector => content.includes(selector));

    if (hasCriticalStyles) {
      this.logPass('Contains above-the-fold styles');
    } else {
      this.logWarn('May be missing critical above-the-fold styles');
    }
  }

  // Check main CSS
  checkMainCSS() {
    console.log('\n🎨 Checking Main CSS...');
    const fileInfo = this.getFileSize(FILES_TO_CHECK.mainCSS);

    if (!fileInfo.exists) {
      this.logFail('Main CSS file not found');
      return;
    }

    const size = fileInfo.gzipped;
    const threshold = THRESHOLDS.TOTAL_CSS;

    if (size <= threshold) {
      this.logPass(`Main CSS size: ${this.formatBytes(size)} (gzipped)`);
    } else {
      this.logWarn(`Main CSS large: ${this.formatBytes(size)} > ${this.formatBytes(threshold)}`);
    }

    // Check for premium features
    const content = fs.readFileSync(FILES_TO_CHECK.mainCSS, 'utf8');
    const premiumFeatures = [
      { name: 'Premium Navigation', check: '.nav-dropdown' },
      { name: 'Animation System', check: '.fade-in-up' },
      { name: 'Premium Cards', check: '.card-premium' },
      { name: 'Responsive Design', check: '@media' },
      { name: 'CSS Variables', check: 'var(--' }
    ];

    premiumFeatures.forEach(feature => {
      if (content.includes(feature.check)) {
        this.logPass(`✓ ${feature.name}`);
      } else {
        this.logWarn(`✗ Missing ${feature.name}`);
      }
    });
  }

  // Check JavaScript bundle
  checkJavaScript() {
    console.log('\n⚡ Checking JavaScript Bundle...');
    const fileInfo = this.getFileSize(FILES_TO_CHECK.javascript);

    if (!fileInfo.exists) {
      this.logFail('JavaScript bundle not found');
      return;
    }

    const size = fileInfo.gzipped;
    const threshold = THRESHOLDS.JAVASCRIPT;

    if (size <= threshold) {
      this.logPass(`JavaScript size: ${this.formatBytes(size)} (gzipped)`);
    } else {
      this.logWarn(`JavaScript large: ${this.formatBytes(size)} > ${this.formatBytes(threshold)}`);
    }

    // Check for performance features
    const content = fs.readFileSync(FILES_TO_CHECK.javascript, 'utf8');
    const performanceFeatures = [
      { name: 'Lazy Loading', check: 'IntersectionObserver' },
      { name: 'Animation System', check: 'initAnimations' },
      { name: 'Navigation', check: 'initNavigation' },
      { name: 'Form Handling', check: 'validateForm' },
      { name: 'Performance Monitoring', check: 'measureFCP' },
      { name: 'Throttling', check: 'throttle' }
    ];

    performanceFeatures.forEach(feature => {
      if (content.includes(feature.check)) {
        this.logPass(`✓ ${feature.name}`);
      } else {
        this.logWarn(`✗ Missing ${feature.name}`);
      }
    });
  }

  // Check Service Worker
  checkServiceWorker() {
    console.log('\n🔧 Checking Service Worker...');
    const fileInfo = this.getFileSize(FILES_TO_CHECK.serviceWorker);

    if (!fileInfo.exists) {
      this.logFail('Service Worker not found');
      return;
    }

    this.logPass(`Service Worker exists: ${this.formatBytes(fileInfo.original)}`);

    const content = fs.readFileSync(FILES_TO_CHECK.serviceWorker, 'utf8');
    const swFeatures = [
      { name: 'Cache Strategy', check: 'cacheFirst' },
      { name: 'Network Strategy', check: 'networkFirst' },
      { name: 'Critical Resources', check: 'CRITICAL_RESOURCES' },
      { name: 'Background Sync', check: 'sync' }
    ];

    swFeatures.forEach(feature => {
      if (content.includes(feature.check)) {
        this.logPass(`✓ ${feature.name}`);
      } else {
        this.logWarn(`✗ Missing ${feature.name}`);
      }
    });
  }

  // Check PWA Manifest
  checkManifest() {
    console.log('\n📱 Checking PWA Manifest...');
    const fileInfo = this.getFileSize(FILES_TO_CHECK.manifest);

    if (!fileInfo.exists) {
      this.logFail('Manifest file not found');
      return;
    }

    try {
      const manifest = JSON.parse(fs.readFileSync(FILES_TO_CHECK.manifest, 'utf8'));

      const requiredFields = ['name', 'short_name', 'start_url', 'display', 'background_color', 'theme_color', 'icons'];
      const missingFields = requiredFields.filter(field => !manifest[field]);

      if (missingFields.length === 0) {
        this.logPass('Manifest has all required fields');
      } else {
        this.logWarn(`Manifest missing: ${missingFields.join(', ')}`);
      }

      // Check icon sizes
      if (manifest.icons && manifest.icons.length > 0) {
        const iconSizes = manifest.icons.map(icon => icon.sizes);
        const requiredSizes = ['192x192', '512x512'];
        const hasRequiredSizes = requiredSizes.every(size =>
          iconSizes.some(iconSize => iconSize.includes(size))
        );

        if (hasRequiredSizes) {
          this.logPass('Manifest has required icon sizes');
        } else {
          this.logWarn('Manifest missing required icon sizes (192x192, 512x512)');
        }
      }

    } catch (error) {
      this.logFail(`Invalid manifest JSON: ${error.message}`);
    }
  }

  // Calculate total initial page size
  calculateInitialPageSize() {
    console.log('\n📊 Calculating Initial Page Size...');

    const criticalCSS = this.getFileSize(FILES_TO_CHECK.criticalCSS);
    const javascript = this.getFileSize(FILES_TO_CHECK.javascript);

    // Estimate HTML size (assuming 50KB for a typical page)
    const estimatedHTML = 50 * 1024;

    let totalSize = estimatedHTML;
    if (criticalCSS.exists) totalSize += criticalCSS.gzipped;
    if (javascript.exists) totalSize += javascript.gzipped;

    const threshold = THRESHOLDS.INITIAL_PAGE;

    console.log(`  HTML (estimated): ${this.formatBytes(estimatedHTML)}`);
    if (criticalCSS.exists) console.log(`  Critical CSS: ${this.formatBytes(criticalCSS.gzipped)}`);
    if (javascript.exists) console.log(`  JavaScript: ${this.formatBytes(javascript.gzipped)}`);
    console.log(`  Total: ${this.formatBytes(totalSize)}`);

    if (totalSize <= threshold) {
      this.logPass(`Initial page size within budget: ${this.formatBytes(totalSize)}`);
    } else {
      this.logWarn(`Initial page size over budget: ${this.formatBytes(totalSize)} > ${this.formatBytes(threshold)}`);
    }
  }

  // Performance recommendations
  generateRecommendations() {
    console.log('\n💡 Performance Recommendations:');

    const recommendations = [
      '• Ensure images are optimized with WebP format',
      '• Use lazy loading for below-the-fold images',
      '• Implement resource hints (preload, prefetch, preconnect)',
      '• Enable Brotli compression on server',
      '• Set proper cache headers for static assets',
      '• Monitor Core Web Vitals with Real User Monitoring',
      '• Use CDN for global asset delivery',
      '• Implement resource bundling and tree-shaking',
      '• Optimize font loading with font-display: swap',
      '• Minimize main thread work with Web Workers'
    ];

    recommendations.forEach(rec => console.log(`  ${rec}`));
  }

  // Logging methods
  logPass(message) {
    console.log(`  ✅ ${message}`);
    this.results.passed++;
    this.results.details.push({ type: 'pass', message });
  }

  logFail(message) {
    console.log(`  ❌ ${message}`);
    this.results.failed++;
    this.results.details.push({ type: 'fail', message });
  }

  logWarn(message) {
    console.log(`  ⚠️  ${message}`);
    this.results.warnings++;
    this.results.details.push({ type: 'warn', message });
  }

  // Generate final report
  generateReport() {
    console.log('\n📋 Performance Check Summary');
    console.log('═'.repeat(50));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`❌ Failed: ${this.results.failed}`);

    const total = this.results.passed + this.results.warnings + this.results.failed;
    const score = Math.round((this.results.passed / total) * 100);

    console.log(`\n🎯 Performance Score: ${score}%`);

    if (score >= 90) {
      console.log('🏆 Excellent! Ready for production.');
    } else if (score >= 80) {
      console.log('👍 Good performance, minor optimizations needed.');
    } else if (score >= 70) {
      console.log('⚠️  Fair performance, optimization required.');
    } else {
      console.log('🚨 Poor performance, major optimizations needed.');
    }

    // Save report to file
    const reportData = {
      timestamp: new Date().toISOString(),
      score,
      results: this.results,
      thresholds: THRESHOLDS,
      files: FILES_TO_CHECK
    };

    fs.writeFileSync('performance-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Detailed report saved to: performance-report.json');
  }

  // Run all checks
  async run() {
    console.log('🚀 The Profit Platform - Performance Check');
    console.log('═'.repeat(50));

    this.checkCriticalCSS();
    this.checkMainCSS();
    this.checkJavaScript();
    this.checkServiceWorker();
    this.checkManifest();
    this.calculateInitialPageSize();
    this.generateRecommendations();
    this.generateReport();
  }
}

// Run performance check
if (require.main === module) {
  const checker = new PerformanceChecker();
  checker.run().catch(console.error);
}

module.exports = PerformanceChecker;