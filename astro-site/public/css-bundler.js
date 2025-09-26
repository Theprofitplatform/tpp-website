/**
 * CSS Resource Bundler
 * Combines multiple CSS files into one optimized bundle
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CSSBundler {
    constructor() {
        this.cssFiles = [
            'critical.min.css',
            'loading-states.css',
            'style.min.css',
            'modern-theme-variables.css',
            'navigation.css',
            'skip-links-fix.css',
            'main-content-spacing.css',
            'modern-theme-components.css',
            'dropdown-fix.css',
            'layout.css',
            'navigation-glass-enhanced.css',
            'hero-content-spacing.css',
            'trust-signals-enhanced.css',
            'trust-signals-homepage-theme.css'
        ];
        this.publicDir = path.join(__dirname, '.');
        this.outputFile = path.join(this.publicDir, 'css', 'bundled.min.css');
    }

    async bundle() {
        console.log('🎯 Starting CSS bundling...');

        let combinedCSS = '';
        let successCount = 0;
        let failCount = 0;

        for (const cssFile of this.cssFiles) {
            const filePath = path.join(this.publicDir, 'css', cssFile);

            try {
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf8');
                    combinedCSS += `/* === ${cssFile} === */\n${content}\n\n`;
                    successCount++;
                    console.log(`✅ Added ${cssFile} (${content.length} bytes)`);
                } else {
                    console.log(`⚠️  File not found: ${cssFile}`);
                    failCount++;
                }
            } catch (error) {
                console.error(`❌ Error reading ${cssFile}:`, error.message);
                failCount++;
            }
        }

        // Write bundled CSS
        try {
            fs.writeFileSync(this.outputFile, combinedCSS);
            console.log(`🎉 Bundle created: bundled.min.css (${combinedCSS.length} bytes)`);
            console.log(`📊 Results: ${successCount} files bundled, ${failCount} failed`);

            return {
                success: true,
                outputFile: 'bundled.min.css',
                totalSize: combinedCSS.length,
                filesIncluded: successCount,
                filesFailed: failCount
            };
        } catch (error) {
            console.error('❌ Error writing bundle:', error.message);
            return { success: false, error: error.message };
        }
    }

    generateUpdatedLayout() {
        return `    <!-- Bundled CSS for Performance -->
    <link rel="stylesheet" href="/css/bundled.min.css" media="all">

    <!-- External Resources - Load asynchronously -->
    <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'" media="all">
    <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'" media="all">
    <noscript>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
    </noscript>`;
    }
}

// Run bundler
const bundler = new CSSBundler();
bundler.bundle().then(result => {
    if (result.success) {
        console.log('\n🎯 Next step: Update BaseLayout.astro to use bundled CSS');
        console.log('Replace multiple CSS links with:');
        console.log(bundler.generateUpdatedLayout());
    }
});

export default CSSBundler;