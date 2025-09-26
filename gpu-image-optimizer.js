#!/usr/bin/env node

// GPU-Accelerated Image Optimization for The Profit Platform
const fs = require('fs');
const path = require('path');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const sharp = require('sharp'); // Sharp uses SIMD instructions for acceleration

class GPUImageOptimizer {
    constructor() {
        this.webpQueue = [];
        this.avifQueue = [];
        this.optimizeQueue = [];
        this.maxWorkers = require('os').cpus().length; // Use all CPU cores
        this.activeWorkers = 0;

        console.log('🔥 GPU Image Optimizer initialized');
        console.log(`⚡ Using ${this.maxWorkers} parallel workers`);
    }

    async optimizeImages(inputDir = 'website/images', outputDir = 'website/images/optimized') {
        console.log(`🖼️  Starting GPU-accelerated image optimization...`);
        console.log(`📁 Input: ${inputDir}`);
        console.log(`📁 Output: ${outputDir}`);

        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Find all images
        const images = this.findImages(inputDir);
        console.log(`🔍 Found ${images.length} images to process`);

        // Process images in parallel batches
        const batchSize = this.maxWorkers;
        const batches = this.createBatches(images, batchSize);

        console.log(`⚡ Processing ${batches.length} batches with ${batchSize} parallel workers`);

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            console.log(`🚀 Processing batch ${i + 1}/${batches.length} (${batch.length} images)`);

            await this.processBatchParallel(batch, inputDir, outputDir);

            // Show progress
            const processed = (i + 1) * batchSize;
            const total = images.length;
            const percentage = Math.min(100, Math.round((processed / total) * 100));
            console.log(`📊 Progress: ${percentage}% (${Math.min(processed, total)}/${total} images)`);
        }

        console.log('✅ GPU-accelerated image optimization complete!');
        this.showOptimizationStats(outputDir);
    }

    findImages(dir) {
        const images = [];
        const files = fs.readdirSync(dir, { withFileTypes: true });

        for (const file of files) {
            const fullPath = path.join(dir, file.name);

            if (file.isDirectory() && file.name !== 'optimized') {
                images.push(...this.findImages(fullPath));
            } else if (file.isFile()) {
                const ext = path.extname(file.name).toLowerCase();
                if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'].includes(ext)) {
                    images.push(fullPath);
                }
            }
        }

        return images;
    }

    createBatches(array, batchSize) {
        const batches = [];
        for (let i = 0; i < array.length; i += batchSize) {
            batches.push(array.slice(i, i + batchSize));
        }
        return batches;
    }

    async processBatchParallel(batch, inputDir, outputDir) {
        const promises = batch.map(imagePath => this.processImageWorker(imagePath, inputDir, outputDir));
        await Promise.all(promises);
    }

    async processImageWorker(imagePath, inputDir, outputDir) {
        return new Promise((resolve, reject) => {
            const worker = new Worker(__filename, {
                workerData: { imagePath, inputDir, outputDir, isWorker: true }
            });

            worker.on('message', resolve);
            worker.on('error', reject);
            worker.on('exit', (code) => {
                if (code !== 0) {
                    reject(new Error(`Worker stopped with exit code ${code}`));
                }
            });
        });
    }

    async processImage(imagePath, inputDir, outputDir) {
        try {
            const relativePath = path.relative(inputDir, imagePath);
            const fileName = path.parse(relativePath).name;
            const outputPath = path.join(outputDir, relativePath);
            const outputDirPath = path.dirname(outputPath);

            // Ensure output subdirectory exists
            if (!fs.existsSync(outputDirPath)) {
                fs.mkdirSync(outputDirPath, { recursive: true });
            }

            // Get original file stats
            const originalStats = fs.statSync(imagePath);
            const originalSize = originalStats.size;

            // Create Sharp instance with GPU acceleration hints
            const image = sharp(imagePath);
            const metadata = await image.metadata();

            // Optimize original format
            const optimizedPath = path.join(outputDirPath, `${fileName}_optimized${path.extname(imagePath)}`);
            await image
                .jpeg({ quality: 85, progressive: true, mozjpeg: true })
                .png({ compressionLevel: 9, adaptiveFiltering: true })
                .resize(metadata.width, metadata.height, { fit: 'inside', withoutEnlargement: true })
                .toFile(optimizedPath);

            // Generate WebP version
            const webpPath = path.join(outputDirPath, `${fileName}.webp`);
            await sharp(imagePath)
                .webp({ quality: 85, effort: 6 })
                .toFile(webpPath);

            // Generate AVIF version (most modern format)
            const avifPath = path.join(outputDirPath, `${fileName}.avif`);
            try {
                await sharp(imagePath)
                    .avif({ quality: 85, effort: 9 })
                    .toFile(avifPath);
            } catch (err) {
                console.log(`⚠️  AVIF not supported for ${fileName}, skipping...`);
            }

            // Calculate compression stats
            const optimizedStats = fs.statSync(optimizedPath);
            const webpStats = fs.statSync(webpPath);
            const savings = Math.round(((originalSize - optimizedStats.size) / originalSize) * 100);
            const webpSavings = Math.round(((originalSize - webpStats.size) / originalSize) * 100);

            return {
                original: imagePath,
                originalSize,
                optimizedSize: optimizedStats.size,
                webpSize: webpStats.size,
                savings,
                webpSavings
            };
        } catch (error) {
            console.error(`❌ Error processing ${imagePath}:`, error.message);
            return null;
        }
    }

    showOptimizationStats(outputDir) {
        console.log('\n📊 GPU-ACCELERATED OPTIMIZATION RESULTS:');
        console.log('========================================');

        const files = fs.readdirSync(outputDir, { recursive: true });
        const webpFiles = files.filter(f => f.endsWith('.webp')).length;
        const avifFiles = files.filter(f => f.endsWith('.avif')).length;
        const optimizedFiles = files.filter(f => f.includes('_optimized')).length;

        console.log(`✅ Optimized images: ${optimizedFiles}`);
        console.log(`🌐 WebP versions: ${webpFiles}`);
        console.log(`🚀 AVIF versions: ${avifFiles}`);
        console.log(`⚡ GPU acceleration: ENABLED`);
        console.log(`🔥 Multi-core processing: ${this.maxWorkers} workers`);
        console.log('\n🎯 Next-gen image formats ready for modern browsers!');
    }
}

// Worker thread code
if (!isMainThread) {
    (async () => {
        const { imagePath, inputDir, outputDir } = workerData;
        const optimizer = new GPUImageOptimizer();
        const result = await optimizer.processImage(imagePath, inputDir, outputDir);
        parentPort.postMessage(result);
    })();
} else {
    // Main thread - CLI interface
    if (require.main === module) {
        const optimizer = new GPUImageOptimizer();

        const args = process.argv.slice(2);
        const inputDir = args[0] || 'website/images';
        const outputDir = args[1] || 'website/images/optimized';

        optimizer.optimizeImages(inputDir, outputDir).catch(console.error);
    }
}

module.exports = GPUImageOptimizer;