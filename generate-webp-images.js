#!/usr/bin/env node

import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, extname, basename } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateWebPImages() {
    const imageDirs = [
        join(__dirname, 'website', 'images'),
        join(__dirname, 'images'),
        join(__dirname, 'assets')
    ];

    console.log('🖼️  Generating WebP versions of images...\n');

    for (const dir of imageDirs) {
        try {
            const stats = await fs.stat(dir);
            if (stats.isDirectory()) {
                await processDirectory(dir);
            }
        } catch (err) {
            console.log(`⏭️  Skipping ${dir} (not found)`);
        }
    }

    console.log('\n✅ WebP generation complete!');
    console.log('📝 Next steps:');
    console.log('   1. Update HTML to use <picture> elements');
    console.log('   2. Test WebP support detection');
    console.log('   3. Verify fallbacks work correctly');
}

async function processDirectory(dir) {
    console.log(`📁 Processing directory: ${dir}`);

    try {
        const files = await fs.readdir(dir);
        const imageFiles = files.filter(file => {
            const ext = extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png'].includes(ext);
        });

        if (imageFiles.length === 0) {
            console.log('   No images found');
            return;
        }

        // Check if cwebp is installed
        try {
            await execAsync('cwebp -version');
        } catch (err) {
            console.log('\n⚠️  cwebp not installed. Installing via npm package...');
            try {
                await execAsync('npm install -g cwebp');
                console.log('✅ cwebp installed successfully');
            } catch (installErr) {
                console.log('\n❌ Could not install cwebp automatically.');
                console.log('Please install WebP tools manually:');
                console.log('  Ubuntu/Debian: sudo apt-get install webp');
                console.log('  macOS: brew install webp');
                console.log('  Windows: Download from https://developers.google.com/speed/webp/download');
                return;
            }
        }

        for (const file of imageFiles) {
            const inputPath = join(dir, file);
            const outputPath = join(dir, basename(file, extname(file)) + '.webp');

            // Skip if WebP already exists
            try {
                await fs.access(outputPath);
                console.log(`   ⏭️  ${file} -> WebP already exists`);
                continue;
            } catch (err) {
                // File doesn't exist, proceed with conversion
            }

            try {
                // Get file size for quality determination
                const stats = await fs.stat(inputPath);
                const fileSizeKB = stats.size / 1024;

                // Adjust quality based on file size
                let quality = 85;
                if (fileSizeKB > 500) {
                    quality = 80;
                } else if (fileSizeKB > 1000) {
                    quality = 75;
                }

                // Convert to WebP
                const command = `cwebp -q ${quality} "${inputPath}" -o "${outputPath}"`;
                await execAsync(command);

                // Get new file size
                const newStats = await fs.stat(outputPath);
                const newSizeKB = newStats.size / 1024;
                const savings = ((fileSizeKB - newSizeKB) / fileSizeKB * 100).toFixed(1);

                console.log(`   ✅ ${file} -> WebP (${savings}% smaller)`);
            } catch (err) {
                console.log(`   ❌ Failed to convert ${file}: ${err.message}`);
            }
        }
    } catch (err) {
        console.log(`   ❌ Error processing directory: ${err.message}`);
    }
}

// Create picture element helper HTML
async function createPictureElementGuide() {
    const guide = `<!-- WebP Picture Element Implementation Guide -->

<!-- Basic Picture Element with WebP and fallback -->
<picture>
    <source type="image/webp" srcset="images/hero.webp">
    <source type="image/jpeg" srcset="images/hero.jpg">
    <img src="images/hero.jpg" alt="Hero Image" loading="lazy">
</picture>

<!-- Responsive Picture Element with multiple sources -->
<picture>
    <source type="image/webp"
            srcset="images/hero-mobile.webp 480w,
                    images/hero-tablet.webp 768w,
                    images/hero-desktop.webp 1200w"
            sizes="(max-width: 480px) 480px,
                   (max-width: 768px) 768px,
                   1200px">
    <source type="image/jpeg"
            srcset="images/hero-mobile.jpg 480w,
                    images/hero-tablet.jpg 768w,
                    images/hero-desktop.jpg 1200w"
            sizes="(max-width: 480px) 480px,
                   (max-width: 768px) 768px,
                   1200px">
    <img src="images/hero-desktop.jpg"
         alt="Hero Image"
         loading="lazy"
         width="1200"
         height="600">
</picture>

<!-- Art Direction with different images for different viewports -->
<picture>
    <source media="(max-width: 480px)"
            type="image/webp"
            srcset="images/hero-mobile.webp">
    <source media="(max-width: 480px)"
            type="image/jpeg"
            srcset="images/hero-mobile.jpg">
    <source media="(max-width: 768px)"
            type="image/webp"
            srcset="images/hero-tablet.webp">
    <source media="(max-width: 768px)"
            type="image/jpeg"
            srcset="images/hero-tablet.jpg">
    <source type="image/webp"
            srcset="images/hero-desktop.webp">
    <img src="images/hero-desktop.jpg"
         alt="Hero Image"
         loading="lazy">
</picture>

<!-- CSS for WebP background images -->
<style>
.hero-section {
    background-image: url('images/hero-bg.jpg');
}

.webp .hero-section {
    background-image: url('images/hero-bg.webp');
}

/* For browsers that support image-set */
.hero-section {
    background-image: image-set(
        url('images/hero-bg.webp') type('image/webp'),
        url('images/hero-bg.jpg') type('image/jpeg')
    );
}
</style>`;

    const guidePath = join(__dirname, 'webp-implementation-guide.html');
    await fs.writeFile(guidePath, guide, 'utf8');
    console.log(`\n📖 Created WebP implementation guide at: ${guidePath}`);
}

// Run the converter
generateWebPImages().then(() => {
    return createPictureElementGuide();
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});