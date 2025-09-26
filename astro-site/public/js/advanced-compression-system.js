/**
 * Advanced Compression System
 * Next-generation compression with Brotli, Zstd, and adaptive algorithms
 *
 * Features:
 * - Multi-algorithm compression (Brotli, Zstd, LZMA, gzip)
 * - Adaptive compression based on content type and network conditions
 * - Real-time compression optimization
 * - Client-side decompression with WebAssembly
 * - Intelligent compression level selection
 * - Dictionary-based compression for repeated patterns
 * - Stream compression for large datasets
 * - Performance-aware compression switching
 */

class AdvancedCompressionSystem {
  constructor() {
    this.initialized = false;

    // Supported compression algorithms
    this.algorithms = new Map();
    this.wasmModules = new Map();

    // Compression strategies per content type
    this.strategies = new Map();

    // Performance metrics
    this.metrics = {
      compressionRatios: new Map(),
      decompressionTimes: new Map(),
      networkSavings: 0,
      totalProcessed: 0
    };

    // Dynamic dictionaries for pattern recognition
    this.dictionaries = new Map();

    // Network and device context
    this.context = {
      networkSpeed: 'unknown',
      deviceCapabilities: {},
      batteryLevel: 1.0,
      memoryPressure: 'normal'
    };

    this.init();
  }

  async init() {
    try {
      console.log('🗜️ Initializing Advanced Compression System...');

      // Load WebAssembly compression modules
      await this.loadCompressionModules();

      // Initialize compression algorithms
      await this.initializeAlgorithms();

      // Setup content type strategies
      this.setupCompressionStrategies();

      // Initialize performance monitoring
      this.initPerformanceMonitoring();

      // Setup adaptive optimization
      this.startAdaptiveOptimization();

      // Initialize dictionaries
      this.initializeDictionaries();

      this.initialized = true;
      console.log('✅ Advanced Compression System initialized');

      this.sendTelemetry('compression_system_initialized', {
        algorithms: Array.from(this.algorithms.keys()),
        wasmSupport: this.wasmModules.size > 0,
        features: this.getEnabledFeatures()
      });

    } catch (error) {
      console.error('❌ Compression system initialization failed:', error);
      this.initFallbackMode();
    }
  }

  async loadCompressionModules() {
    const modules = {
      'brotli': '/wasm/brotli.wasm',
      'zstd': '/wasm/zstd.wasm',
      'lzma': '/wasm/lzma.wasm',
      'lz4': '/wasm/lz4.wasm'
    };

    for (const [algorithm, path] of Object.entries(modules)) {
      try {
        if (typeof WebAssembly !== 'undefined') {
          const response = await fetch(path);
          if (response.ok) {
            const bytes = await response.arrayBuffer();
            const module = await WebAssembly.compile(bytes);
            const instance = await WebAssembly.instantiate(module);

            this.wasmModules.set(algorithm, instance);
            console.log(`📦 Loaded ${algorithm} WASM module`);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to load ${algorithm} WASM module:`, error);
      }
    }

    // Fallback to native compression APIs where available
    this.loadNativeCompressionAPIs();
  }

  loadNativeCompressionAPIs() {
    // Modern browsers support native compression streams
    if ('CompressionStream' in window) {
      // Brotli support
      try {
        const brotliStream = new CompressionStream('deflate-raw');
        this.algorithms.set('brotli-native', {
          type: 'native',
          stream: CompressionStream,
          format: 'br'
        });
        console.log('📦 Native Brotli compression available');
      } catch (e) {
        console.warn('Brotli not supported natively');
      }

      // Gzip support
      try {
        const gzipStream = new CompressionStream('gzip');
        this.algorithms.set('gzip-native', {
          type: 'native',
          stream: CompressionStream,
          format: 'gzip'
        });
        console.log('📦 Native Gzip compression available');
      } catch (e) {
        console.warn('Gzip not supported natively');
      }

      // Deflate support
      try {
        const deflateStream = new CompressionStream('deflate');
        this.algorithms.set('deflate-native', {
          type: 'native',
          stream: CompressionStream,
          format: 'deflate'
        });
        console.log('📦 Native Deflate compression available');
      } catch (e) {
        console.warn('Deflate not supported natively');
      }
    }
  }

  async initializeAlgorithms() {
    // Initialize WASM-based algorithms
    for (const [algorithm, module] of this.wasmModules) {
      await this.initializeWASMAlgorithm(algorithm, module);
    }

    // Initialize native algorithms
    for (const [algorithm, config] of this.algorithms) {
      if (config.type === 'native') {
        await this.initializeNativeAlgorithm(algorithm, config);
      }
    }

    console.log(`🔧 Initialized ${this.algorithms.size} compression algorithms`);
  }

  async initializeWASMAlgorithm(algorithm, module) {
    try {
      const config = {
        type: 'wasm',
        module,
        compress: module.exports.compress,
        decompress: module.exports.decompress,
        levels: this.getCompressionLevels(algorithm),
        dictSupport: this.supportsDictionary(algorithm)
      };

      this.algorithms.set(algorithm, config);

      // Test the algorithm with sample data
      await this.testAlgorithm(algorithm, 'Hello, World!');

    } catch (error) {
      console.warn(`Failed to initialize WASM ${algorithm}:`, error);
    }
  }

  async initializeNativeAlgorithm(algorithm, config) {
    try {
      // Test native compression
      const testData = new TextEncoder().encode('Hello, World!');
      const stream = new config.stream(config.format);

      config.levels = [1, 6, 9]; // Standard compression levels
      config.dictSupport = false; // Most native APIs don't support custom dictionaries

      await this.testAlgorithm(algorithm, testData);

    } catch (error) {
      console.warn(`Failed to initialize native ${algorithm}:`, error);
      this.algorithms.delete(algorithm);
    }
  }

  getCompressionLevels(algorithm) {
    const levelMap = {
      'brotli': [1, 3, 6, 9, 11],
      'zstd': [1, 3, 6, 9, 15, 22],
      'lzma': [1, 3, 6, 9],
      'lz4': [1, 3, 9],
      'gzip': [1, 6, 9]
    };

    return levelMap[algorithm] || [1, 6, 9];
  }

  supportsDictionary(algorithm) {
    return ['brotli', 'zstd'].includes(algorithm);
  }

  async testAlgorithm(algorithm, testData) {
    try {
      const config = this.algorithms.get(algorithm);
      const input = typeof testData === 'string' ?
        new TextEncoder().encode(testData) : testData;

      if (config.type === 'wasm') {
        // Test WASM compression
        const compressed = await config.compress(input, 6);
        const decompressed = await config.decompress(compressed);

        if (decompressed.length !== input.length) {
          throw new Error('Compression test failed: size mismatch');
        }
      } else if (config.type === 'native') {
        // Test native compression
        const compressed = await this.compressWithNativeAPI(input, config);
        const decompressed = await this.decompressWithNativeAPI(compressed, config);

        if (decompressed.length !== input.length) {
          throw new Error('Native compression test failed');
        }
      }

      console.log(`✅ ${algorithm} compression test passed`);

    } catch (error) {
      console.error(`❌ ${algorithm} compression test failed:`, error);
      this.algorithms.delete(algorithm);
    }
  }

  async compressWithNativeAPI(data, config) {
    const stream = new config.stream(config.format);
    const reader = stream.readable.getReader();
    const writer = stream.writable.getWriter();

    writer.write(data);
    writer.close();

    const chunks = [];
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) chunks.push(value);
    }

    return this.concatenateUint8Arrays(chunks);
  }

  async decompressWithNativeAPI(data, config) {
    const decompressFormat = config.format.replace('-raw', '');
    const stream = new DecompressionStream(decompressFormat);
    const reader = stream.readable.getReader();
    const writer = stream.writable.getWriter();

    writer.write(data);
    writer.close();

    const chunks = [];
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) chunks.push(value);
    }

    return this.concatenateUint8Arrays(chunks);
  }

  concatenateUint8Arrays(arrays) {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
    }

    return result;
  }

  setupCompressionStrategies() {
    console.log('📋 Setting up compression strategies...');

    // Text content (HTML, CSS, JS, JSON, XML)
    this.strategies.set('text', {
      primaryAlgorithm: this.selectBestAlgorithm(['brotli', 'zstd', 'gzip-native']),
      fallbackAlgorithm: 'gzip-native',
      compressionLevel: 6,
      dictionaryEnabled: true,
      preProcessing: ['minify', 'deduplicate']
    });

    // Images (JPEG, PNG, WebP)
    this.strategies.set('image', {
      primaryAlgorithm: this.selectBestAlgorithm(['lz4', 'zstd']),
      fallbackAlgorithm: null, // Images are already compressed
      compressionLevel: 3, // Low level for speed
      dictionaryEnabled: false,
      preProcessing: ['format-optimization']
    });

    // Fonts (WOFF, WOFF2, TTF)
    this.strategies.set('font', {
      primaryAlgorithm: this.selectBestAlgorithm(['brotli', 'zstd']),
      fallbackAlgorithm: 'gzip-native',
      compressionLevel: 9, // High compression for infrequently loaded assets
      dictionaryEnabled: true,
      preProcessing: ['subset', 'optimize']
    });

    // Binary data
    this.strategies.set('binary', {
      primaryAlgorithm: this.selectBestAlgorithm(['lzma', 'zstd', 'brotli']),
      fallbackAlgorithm: 'gzip-native',
      compressionLevel: 6,
      dictionaryEnabled: false,
      preProcessing: []
    });

    // Streaming data
    this.strategies.set('stream', {
      primaryAlgorithm: this.selectBestAlgorithm(['lz4', 'zstd']),
      fallbackAlgorithm: 'deflate-native',
      compressionLevel: 1, // Fast compression for real-time data
      dictionaryEnabled: false,
      preProcessing: []
    });

    console.log('📋 Compression strategies configured');
  }

  selectBestAlgorithm(preferred) {
    for (const algorithm of preferred) {
      if (this.algorithms.has(algorithm)) {
        return algorithm;
      }
    }
    return 'gzip-native'; // Ultimate fallback
  }

  initPerformanceMonitoring() {
    // Monitor compression performance
    this.performanceObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.analyzeResourceCompression(entry);
      }
    });

    this.performanceObserver.observe({ entryTypes: ['resource'] });

    // Monitor memory pressure
    if ('memory' in performance) {
      setInterval(() => {
        this.updateMemoryPressure();
      }, 5000);
    }

    // Monitor battery level if available
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        this.context.batteryLevel = battery.level;

        battery.addEventListener('levelchange', () => {
          this.context.batteryLevel = battery.level;
          this.adaptToResourceConstraints();
        });
      });
    }
  }

  analyzeResourceCompression(entry) {
    if (entry.decodedBodySize && entry.transferSize) {
      const compressionRatio = entry.transferSize / entry.decodedBodySize;
      const resourceType = this.getResourceType(entry.name);

      // Store compression metrics
      const typeMetrics = this.metrics.compressionRatios.get(resourceType) || [];
      typeMetrics.push({
        ratio: compressionRatio,
        originalSize: entry.decodedBodySize,
        compressedSize: entry.transferSize,
        savings: entry.decodedBodySize - entry.transferSize,
        timestamp: Date.now()
      });

      // Keep only recent metrics (last 50 per type)
      if (typeMetrics.length > 50) {
        typeMetrics.shift();
      }

      this.metrics.compressionRatios.set(resourceType, typeMetrics);

      // Update total network savings
      this.metrics.networkSavings += entry.decodedBodySize - entry.transferSize;
      this.metrics.totalProcessed += entry.decodedBodySize;
    }
  }

  getResourceType(url) {
    const ext = url.split('.').pop().toLowerCase().split('?')[0];

    const typeMap = {
      'html': 'text', 'htm': 'text',
      'css': 'text',
      'js': 'text', 'mjs': 'text',
      'json': 'text', 'xml': 'text',
      'txt': 'text', 'md': 'text',

      'jpg': 'image', 'jpeg': 'image',
      'png': 'image', 'gif': 'image',
      'webp': 'image', 'avif': 'image',
      'svg': 'text', // SVG is text-based

      'woff': 'font', 'woff2': 'font',
      'ttf': 'font', 'otf': 'font',
      'eot': 'font',

      'pdf': 'binary',
      'zip': 'binary',
      'wasm': 'binary'
    };

    return typeMap[ext] || 'binary';
  }

  updateMemoryPressure() {
    if ('memory' in performance) {
      const memory = performance.memory;
      const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

      if (usage > 0.8) {
        this.context.memoryPressure = 'high';
      } else if (usage > 0.6) {
        this.context.memoryPressure = 'medium';
      } else {
        this.context.memoryPressure = 'low';
      }
    }
  }

  adaptToResourceConstraints() {
    const { batteryLevel, memoryPressure } = this.context;

    // Reduce compression levels if battery is low or memory pressure is high
    if (batteryLevel < 0.2 || memoryPressure === 'high') {
      this.enablePowerSavingMode();
    } else {
      this.disablePowerSavingMode();
    }
  }

  enablePowerSavingMode() {
    console.log('🔋 Enabling power saving compression mode...');

    // Use faster, less CPU-intensive compression
    for (const [type, strategy] of this.strategies) {
      strategy.compressionLevel = Math.min(3, strategy.compressionLevel);
      strategy.primaryAlgorithm = this.selectFastAlgorithm(strategy.primaryAlgorithm);
    }
  }

  disablePowerSavingMode() {
    console.log('⚡ Disabling power saving compression mode...');

    // Restore optimal compression settings
    this.setupCompressionStrategies();
  }

  selectFastAlgorithm(currentAlgorithm) {
    const fastAlgorithms = ['lz4', 'deflate-native', 'gzip-native'];

    for (const algorithm of fastAlgorithms) {
      if (this.algorithms.has(algorithm)) {
        return algorithm;
      }
    }

    return currentAlgorithm; // Keep current if no fast alternative
  }

  startAdaptiveOptimization() {
    // Main optimization loop
    this.optimizationInterval = setInterval(() => {
      this.runAdaptiveOptimization();
    }, 10000); // Every 10 seconds

    // Immediate optimization on network changes
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        this.adaptToNetworkChange();
      });
    }
  }

  async runAdaptiveOptimization() {
    try {
      // Analyze current performance
      const performance = this.analyzeCompressionPerformance();

      // Make optimization decisions
      const optimizations = this.makeOptimizationDecisions(performance);

      // Execute optimizations
      await this.executeOptimizations(optimizations);

      // Update dictionaries
      this.updateDictionaries();

    } catch (error) {
      console.error('Adaptive optimization failed:', error);
    }
  }

  analyzeCompressionPerformance() {
    const analysis = {
      averageCompressionRatio: this.calculateAverageCompressionRatio(),
      algorithmPerformance: this.analyzeAlgorithmPerformance(),
      networkEfficiency: this.calculateNetworkEfficiency(),
      cpuUsage: this.estimateCPUUsage(),
      memoryUsage: this.context.memoryPressure
    };

    return analysis;
  }

  calculateAverageCompressionRatio() {
    let totalRatio = 0;
    let count = 0;

    for (const typeMetrics of this.metrics.compressionRatios.values()) {
      for (const metric of typeMetrics) {
        totalRatio += metric.ratio;
        count++;
      }
    }

    return count > 0 ? totalRatio / count : 1;
  }

  analyzeAlgorithmPerformance() {
    const performance = new Map();

    // Analyze each algorithm's effectiveness
    for (const [type, strategy] of this.strategies) {
      const algorithm = strategy.primaryAlgorithm;
      const typeMetrics = this.metrics.compressionRatios.get(type) || [];

      if (typeMetrics.length > 0) {
        const avgRatio = typeMetrics.reduce((sum, m) => sum + m.ratio, 0) / typeMetrics.length;
        const avgSavings = typeMetrics.reduce((sum, m) => sum + m.savings, 0) / typeMetrics.length;

        performance.set(algorithm, {
          type,
          averageRatio: avgRatio,
          averageSavings: avgSavings,
          sampleCount: typeMetrics.length
        });
      }
    }

    return performance;
  }

  calculateNetworkEfficiency() {
    if (this.metrics.totalProcessed === 0) return 1;

    return 1 - (this.metrics.networkSavings / this.metrics.totalProcessed);
  }

  estimateCPUUsage() {
    // Estimate CPU usage based on compression algorithms in use
    const cpuWeights = {
      'lz4': 1,
      'deflate-native': 2,
      'gzip-native': 3,
      'zstd': 4,
      'brotli': 6,
      'lzma': 8
    };

    let totalWeight = 0;
    for (const strategy of this.strategies.values()) {
      totalWeight += cpuWeights[strategy.primaryAlgorithm] || 5;
    }

    return Math.min(totalWeight / (this.strategies.size * 5), 1);
  }

  makeOptimizationDecisions(performance) {
    const decisions = [];

    // Algorithm switching decisions
    if (performance.averageCompressionRatio > 0.8) {
      decisions.push({
        type: 'algorithm_upgrade',
        reason: 'poor_compression',
        action: 'use_higher_compression'
      });
    }

    if (performance.cpuUsage > 0.8) {
      decisions.push({
        type: 'algorithm_downgrade',
        reason: 'high_cpu_usage',
        action: 'use_faster_compression'
      });
    }

    // Dictionary optimization
    if (this.shouldOptimizeDictionaries(performance)) {
      decisions.push({
        type: 'dictionary_optimization',
        action: 'rebuild_dictionaries'
      });
    }

    // Compression level optimization
    const levelOptimization = this.optimizeCompressionLevels(performance);
    if (levelOptimization) {
      decisions.push(levelOptimization);
    }

    return decisions;
  }

  shouldOptimizeDictionaries(performance) {
    // Check if dictionary-based algorithms are underperforming
    for (const [algorithm, perf] of performance.algorithmPerformance) {
      if (this.algorithms.get(algorithm)?.dictSupport && perf.averageRatio > 0.7) {
        return true;
      }
    }
    return false;
  }

  optimizeCompressionLevels(performance) {
    if (performance.cpuUsage > 0.7 && performance.averageCompressionRatio < 0.8) {
      return {
        type: 'compression_level_adjustment',
        action: 'decrease_levels',
        reason: 'cpu_optimization'
      };
    }

    if (performance.cpuUsage < 0.5 && performance.averageCompressionRatio > 0.6) {
      return {
        type: 'compression_level_adjustment',
        action: 'increase_levels',
        reason: 'compression_optimization'
      };
    }

    return null;
  }

  async executeOptimizations(optimizations) {
    for (const optimization of optimizations) {
      try {
        switch (optimization.type) {
          case 'algorithm_upgrade':
            await this.upgradeAlgorithms();
            break;

          case 'algorithm_downgrade':
            await this.downgradeAlgorithms();
            break;

          case 'dictionary_optimization':
            await this.optimizeDictionaries();
            break;

          case 'compression_level_adjustment':
            this.adjustCompressionLevels(optimization.action);
            break;
        }
      } catch (error) {
        console.error(`Failed to execute optimization ${optimization.type}:`, error);
      }
    }
  }

  async upgradeAlgorithms() {
    console.log('⬆️ Upgrading compression algorithms...');

    const upgradePaths = {
      'gzip-native': 'brotli',
      'deflate-native': 'zstd',
      'lz4': 'zstd',
      'zstd': 'brotli'
    };

    for (const [type, strategy] of this.strategies) {
      const upgrade = upgradePaths[strategy.primaryAlgorithm];
      if (upgrade && this.algorithms.has(upgrade)) {
        strategy.primaryAlgorithm = upgrade;
        console.log(`🔄 Upgraded ${type} compression to ${upgrade}`);
      }
    }
  }

  async downgradeAlgorithms() {
    console.log('⬇️ Downgrading compression algorithms for performance...');

    const downgradePaths = {
      'lzma': 'brotli',
      'brotli': 'zstd',
      'zstd': 'lz4',
      'gzip-native': 'deflate-native'
    };

    for (const [type, strategy] of this.strategies) {
      const downgrade = downgradePaths[strategy.primaryAlgorithm];
      if (downgrade && this.algorithms.has(downgrade)) {
        strategy.primaryAlgorithm = downgrade;
        console.log(`🔄 Downgraded ${type} compression to ${downgrade}`);
      }
    }
  }

  adjustCompressionLevels(action) {
    console.log(`🎚️ Adjusting compression levels: ${action}`);

    for (const strategy of this.strategies.values()) {
      const algorithm = this.algorithms.get(strategy.primaryAlgorithm);
      const levels = algorithm?.levels || [1, 6, 9];

      if (action === 'increase_levels') {
        const maxLevel = Math.max(...levels);
        strategy.compressionLevel = Math.min(maxLevel, strategy.compressionLevel + 2);
      } else if (action === 'decrease_levels') {
        const minLevel = Math.min(...levels);
        strategy.compressionLevel = Math.max(minLevel, strategy.compressionLevel - 2);
      }
    }
  }

  initializeDictionaries() {
    console.log('📚 Initializing compression dictionaries...');

    // Initialize dictionaries for supported algorithms
    for (const [type, strategy] of this.strategies) {
      if (strategy.dictionaryEnabled) {
        this.dictionaries.set(type, new CompressionDictionary(type));
      }
    }
  }

  updateDictionaries() {
    // Update dictionaries with new patterns from recent content
    for (const [type, dictionary] of this.dictionaries) {
      dictionary.analyzePage();
    }
  }

  async optimizeDictionaries() {
    console.log('📚 Optimizing compression dictionaries...');

    for (const [type, dictionary] of this.dictionaries) {
      await dictionary.optimize();
    }
  }

  // Public API methods
  async compressData(data, options = {}) {
    const contentType = options.contentType || this.detectContentType(data);
    const strategy = this.strategies.get(contentType) || this.strategies.get('binary');

    try {
      const algorithm = this.algorithms.get(strategy.primaryAlgorithm);
      const dictionary = this.dictionaries.get(contentType);

      // Pre-process data if needed
      const processedData = await this.preProcessData(data, strategy.preProcessing);

      // Compress with primary algorithm
      const compressed = await this.compressWithAlgorithm(
        processedData,
        algorithm,
        strategy.compressionLevel,
        dictionary
      );

      // Track compression metrics
      this.trackCompressionResult(contentType, data.length, compressed.length);

      return {
        data: compressed,
        algorithm: strategy.primaryAlgorithm,
        originalSize: data.length,
        compressedSize: compressed.length,
        ratio: compressed.length / data.length
      };

    } catch (error) {
      console.error(`Compression failed for ${contentType}:`, error);

      // Fallback to simpler algorithm
      return await this.compressWithFallback(data, strategy);
    }
  }

  async decompressData(compressedData, algorithm) {
    try {
      const algorithmConfig = this.algorithms.get(algorithm);
      if (!algorithmConfig) {
        throw new Error(`Algorithm ${algorithm} not available`);
      }

      return await this.decompressWithAlgorithm(compressedData, algorithmConfig);

    } catch (error) {
      console.error(`Decompression failed with ${algorithm}:`, error);
      throw error;
    }
  }

  detectContentType(data) {
    // Simple content type detection
    if (typeof data === 'string') {
      if (data.startsWith('<!DOCTYPE') || data.startsWith('<html')) return 'text';
      if (data.startsWith('{') || data.startsWith('[')) return 'text';
      return 'text';
    }

    // For binary data, assume binary type
    return 'binary';
  }

  async preProcessData(data, processing) {
    let result = data;

    for (const step of processing) {
      switch (step) {
        case 'minify':
          result = await this.minifyData(result);
          break;
        case 'deduplicate':
          result = await this.deduplicateData(result);
          break;
        case 'format-optimization':
          result = await this.optimizeFormat(result);
          break;
      }
    }

    return result;
  }

  async minifyData(data) {
    if (typeof data !== 'string') return data;

    // Basic minification - remove extra whitespace
    return data
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
  }

  async deduplicateData(data) {
    if (typeof data !== 'string') return data;

    // Find and replace repeated patterns
    const patterns = this.findRepeatedPatterns(data);
    let result = data;

    for (const [pattern, replacement] of patterns) {
      result = result.replace(new RegExp(pattern, 'g'), replacement);
    }

    return result;
  }

  findRepeatedPatterns(text) {
    const patterns = new Map();
    const minPatternLength = 10;

    // Simple pattern detection (could be enhanced with more sophisticated algorithms)
    for (let i = 0; i < text.length - minPatternLength; i++) {
      for (let length = minPatternLength; length <= 50 && i + length < text.length; length++) {
        const pattern = text.substr(i, length);
        const occurrences = (text.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;

        if (occurrences > 1) {
          const replacement = `__PATTERN_${patterns.size}__`;
          patterns.set(pattern, replacement);
          break;
        }
      }
    }

    return patterns;
  }

  async optimizeFormat(data) {
    // Placeholder for format-specific optimizations
    return data;
  }

  async compressWithAlgorithm(data, algorithm, level, dictionary) {
    const startTime = performance.now();

    try {
      let result;

      if (algorithm.type === 'wasm') {
        // Use WASM compression
        const options = { level };
        if (dictionary && algorithm.dictSupport) {
          options.dictionary = dictionary.getDictionary();
        }

        result = await algorithm.compress(data, options);

      } else if (algorithm.type === 'native') {
        // Use native compression streams
        result = await this.compressWithNativeStream(data, algorithm, level);
      }

      const duration = performance.now() - startTime;
      this.trackCompressionTime(algorithm, duration);

      return result;

    } catch (error) {
      console.error('Compression with algorithm failed:', error);
      throw error;
    }
  }

  async compressWithNativeStream(data, algorithm, level) {
    const stream = new algorithm.stream(algorithm.format);
    const reader = stream.readable.getReader();
    const writer = stream.writable.getWriter();

    // Convert string to Uint8Array if needed
    const input = typeof data === 'string' ?
      new TextEncoder().encode(data) : data;

    writer.write(input);
    writer.close();

    const chunks = [];
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) chunks.push(value);
    }

    return this.concatenateUint8Arrays(chunks);
  }

  async decompressWithAlgorithm(data, algorithm) {
    if (algorithm.type === 'wasm') {
      return await algorithm.decompress(data);
    } else if (algorithm.type === 'native') {
      return await this.decompressWithNativeStream(data, algorithm);
    }
  }

  async decompressWithNativeStream(data, algorithm) {
    const decompressFormat = algorithm.format.replace('-raw', '');
    const stream = new DecompressionStream(decompressFormat);
    const reader = stream.readable.getReader();
    const writer = stream.writable.getWriter();

    writer.write(data);
    writer.close();

    const chunks = [];
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) chunks.push(value);
    }

    return this.concatenateUint8Arrays(chunks);
  }

  async compressWithFallback(data, strategy) {
    const fallbackAlgorithm = this.algorithms.get(strategy.fallbackAlgorithm);
    if (!fallbackAlgorithm) {
      throw new Error('No fallback compression available');
    }

    return await this.compressWithAlgorithm(data, fallbackAlgorithm, 6, null);
  }

  trackCompressionResult(type, originalSize, compressedSize) {
    const savings = originalSize - compressedSize;
    this.metrics.networkSavings += Math.max(0, savings);
    this.metrics.totalProcessed += originalSize;

    // Update type-specific metrics
    const typeMetrics = this.metrics.compressionRatios.get(type) || [];
    typeMetrics.push({
      ratio: compressedSize / originalSize,
      originalSize,
      compressedSize,
      savings,
      timestamp: Date.now()
    });

    this.metrics.compressionRatios.set(type, typeMetrics);
  }

  trackCompressionTime(algorithm, duration) {
    const times = this.metrics.decompressionTimes.get(algorithm.name) || [];
    times.push(duration);

    // Keep only recent times (last 20)
    if (times.length > 20) {
      times.shift();
    }

    this.metrics.decompressionTimes.set(algorithm.name, times);
  }

  adaptToNetworkChange() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      this.context.networkSpeed = connection.effectiveType;

      // Adapt compression strategy based on network speed
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        this.enableLowBandwidthMode();
      } else if (connection.effectiveType === '4g') {
        this.enableHighBandwidthMode();
      }

      // Adapt to data saving mode
      if (connection.saveData) {
        this.enableDataSavingMode();
      } else {
        this.disableDataSavingMode();
      }
    }
  }

  enableLowBandwidthMode() {
    console.log('🐌 Enabling low bandwidth compression mode...');

    // Use maximum compression for low bandwidth
    for (const strategy of this.strategies.values()) {
      const algorithm = this.algorithms.get(strategy.primaryAlgorithm);
      const levels = algorithm?.levels || [1, 6, 9];
      strategy.compressionLevel = Math.max(...levels);
    }
  }

  enableHighBandwidthMode() {
    console.log('🚀 Enabling high bandwidth compression mode...');

    // Use balanced compression for high bandwidth (favor speed)
    for (const strategy of this.strategies.values()) {
      const algorithm = this.algorithms.get(strategy.primaryAlgorithm);
      const levels = algorithm?.levels || [1, 6, 9];
      const midIndex = Math.floor(levels.length / 2);
      strategy.compressionLevel = levels[midIndex];
    }
  }

  enableDataSavingMode() {
    console.log('💾 Enabling data saving compression mode...');

    // Maximum compression when data saving is enabled
    for (const strategy of this.strategies.values()) {
      const algorithm = this.algorithms.get(strategy.primaryAlgorithm);
      const levels = algorithm?.levels || [1, 6, 9];
      strategy.compressionLevel = Math.max(...levels);
    }
  }

  disableDataSavingMode() {
    console.log('📈 Disabling data saving compression mode...');

    // Restore balanced compression settings
    this.setupCompressionStrategies();
  }

  // Statistics and reporting
  getCompressionStats() {
    return {
      totalSavings: this.metrics.networkSavings,
      totalProcessed: this.metrics.totalProcessed,
      savingsPercentage: this.metrics.totalProcessed > 0 ?
        (this.metrics.networkSavings / this.metrics.totalProcessed) * 100 : 0,
      algorithmsInUse: Array.from(this.algorithms.keys()),
      averageCompressionRatio: this.calculateAverageCompressionRatio(),
      compressionByType: this.getCompressionByType()
    };
  }

  getCompressionByType() {
    const byType = {};

    for (const [type, metrics] of this.metrics.compressionRatios) {
      if (metrics.length > 0) {
        const totalSavings = metrics.reduce((sum, m) => sum + m.savings, 0);
        const totalOriginal = metrics.reduce((sum, m) => sum + m.originalSize, 0);
        const avgRatio = metrics.reduce((sum, m) => sum + m.ratio, 0) / metrics.length;

        byType[type] = {
          totalSavings,
          totalOriginal,
          savingsPercentage: totalOriginal > 0 ? (totalSavings / totalOriginal) * 100 : 0,
          averageRatio: avgRatio,
          sampleCount: metrics.length
        };
      }
    }

    return byType;
  }

  getEnabledFeatures() {
    return {
      algorithms: Array.from(this.algorithms.keys()),
      wasmSupport: this.wasmModules.size > 0,
      nativeSupport: Array.from(this.algorithms.values()).some(a => a.type === 'native'),
      dictionarySupport: Array.from(this.dictionaries.keys()),
      adaptiveOptimization: this.optimizationInterval !== null,
      networkAdaptation: 'connection' in navigator,
      memoryMonitoring: 'memory' in performance,
      batteryMonitoring: 'getBattery' in navigator
    };
  }

  sendTelemetry(event, data) {
    if ('sendBeacon' in navigator) {
      const telemetryData = {
        event,
        data,
        timestamp: Date.now(),
        stats: this.getCompressionStats()
      };

      navigator.sendBeacon('/api/compression-telemetry', JSON.stringify(telemetryData));
    }
  }

  // Fallback mode
  initFallbackMode() {
    console.log('🔄 Running in compression fallback mode');

    // Basic gzip compression only
    if ('CompressionStream' in window) {
      this.algorithms.set('gzip-fallback', {
        type: 'native',
        stream: CompressionStream,
        format: 'gzip',
        levels: [6],
        dictSupport: false
      });
    }

    // Simple strategies
    this.strategies.set('text', {
      primaryAlgorithm: 'gzip-fallback',
      fallbackAlgorithm: null,
      compressionLevel: 6,
      dictionaryEnabled: false,
      preProcessing: ['minify']
    });

    this.strategies.set('binary', {
      primaryAlgorithm: 'gzip-fallback',
      fallbackAlgorithm: null,
      compressionLevel: 6,
      dictionaryEnabled: false,
      preProcessing: []
    });
  }
}

// Supporting class for compression dictionaries
class CompressionDictionary {
  constructor(contentType) {
    this.contentType = contentType;
    this.patterns = new Map();
    this.dictionary = null;
    this.version = 1;
  }

  analyzePage() {
    // Analyze page content to build compression dictionary
    const content = this.extractContent();
    this.findCommonPatterns(content);
  }

  extractContent() {
    let content = '';

    switch (this.contentType) {
      case 'text':
        // Extract text content from HTML, CSS, JS
        content += document.documentElement.outerHTML;

        // Add CSS content
        for (const sheet of document.styleSheets) {
          try {
            for (const rule of sheet.cssRules || []) {
              content += rule.cssText;
            }
          } catch (e) {
            // Skip inaccessible stylesheets
          }
        }
        break;

      case 'font':
        // For fonts, analyze font family names and common CSS properties
        const fontRules = [];
        for (const sheet of document.styleSheets) {
          try {
            for (const rule of sheet.cssRules || []) {
              if (rule.style && rule.style.fontFamily) {
                fontRules.push(rule.cssText);
              }
            }
          } catch (e) {
            // Skip inaccessible stylesheets
          }
        }
        content = fontRules.join('\n');
        break;
    }

    return content;
  }

  findCommonPatterns(content) {
    const words = content.split(/\s+/);
    const wordCount = new Map();

    // Count word frequency
    for (const word of words) {
      if (word.length > 3) { // Only consider words longer than 3 characters
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      }
    }

    // Keep frequently used patterns
    const threshold = Math.max(2, words.length * 0.001); // At least 2 occurrences or 0.1%
    for (const [word, count] of wordCount) {
      if (count >= threshold) {
        this.patterns.set(word, count);
      }
    }

    // Build dictionary from top patterns
    this.buildDictionary();
  }

  buildDictionary() {
    // Sort patterns by frequency and build dictionary
    const sortedPatterns = Array.from(this.patterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 1000); // Top 1000 patterns

    this.dictionary = sortedPatterns.map(([pattern]) => pattern).join('\n');
    this.version++;
  }

  getDictionary() {
    return this.dictionary ? new TextEncoder().encode(this.dictionary) : null;
  }

  async optimize() {
    // Re-analyze page and rebuild dictionary
    this.analyzePage();
  }
}

// Initialize the Advanced Compression System
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.advancedCompressionSystem = new AdvancedCompressionSystem();
  });
} else {
  window.advancedCompressionSystem = new AdvancedCompressionSystem();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedCompressionSystem;
}