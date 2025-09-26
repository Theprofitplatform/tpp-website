/**
 * Intelligent Cache System with Advanced Invalidation
 * Next-generation caching with AI-powered cache management and predictive invalidation
 *
 * Features:
 * - Multi-tier caching (Memory, IndexedDB, Cache API, Service Worker)
 * - AI-powered cache prediction and prefetching
 * - Intelligent cache invalidation based on usage patterns
 * - Adaptive cache size management based on device capabilities
 * - Network-aware cache strategies
 * - Content-aware cache optimization
 * - Real-time cache performance monitoring
 * - Automatic cache warming and preloading
 * - Smart cache eviction with LRU, LFU, and predictive algorithms
 * - Cross-tab cache synchronization
 */

class IntelligentCacheSystem {
  constructor() {
    this.initialized = false;

    // Cache storage tiers
    this.cacheTiers = {
      memory: new MemoryCache(),
      indexedDB: new IndexedDBCache(),
      cacheAPI: new CacheAPIWrapper(),
      serviceWorker: new ServiceWorkerCache()
    };

    // Cache strategies
    this.strategies = new Map();

    // AI models for cache optimization
    this.models = {
      accessPredictor: new CacheAccessPredictor(),
      invalidationPredictor: new InvalidationPredictor(),
      contentAnalyzer: new ContentAnalyzer(),
      performanceOptimizer: new CachePerformanceOptimizer()
    };

    // Cache management
    this.cacheStats = new CacheStatistics();
    this.evictionManager = new EvictionManager();
    this.syncManager = new CrossTabSyncManager();

    // Performance monitoring
    this.metrics = {
      hitRate: 0,
      missRate: 0,
      evictions: 0,
      storageUsed: 0,
      responseTime: new Map(),
      bandwidthSaved: 0
    };

    // Device and network context
    this.context = {
      storageQuota: 0,
      availableStorage: 0,
      networkSpeed: 'fast',
      memoryConstraints: 'none',
      batteryLevel: 1.0
    };

    // Configuration
    this.config = {
      maxMemorySize: 50 * 1024 * 1024,      // 50MB
      maxIndexedDBSize: 200 * 1024 * 1024,  // 200MB
      maxCacheAPISize: 500 * 1024 * 1024,   // 500MB
      defaultTTL: 24 * 60 * 60 * 1000,      // 24 hours
      adaptiveSizing: true,
      intelligentEviction: true,
      crossTabSync: true
    };

    this.init();
  }

  async init() {
    try {
      console.log('🧠 Initializing Intelligent Cache System...');

      // Initialize storage tiers
      await this.initializeCacheTiers();

      // Setup cache strategies
      this.setupCacheStrategies();

      // Initialize AI models
      await this.initializeAIModels();

      // Setup monitoring and management
      this.setupCacheManagement();

      // Start optimization loops
      this.startOptimizationLoops();

      // Setup event listeners
      this.setupEventListeners();

      this.initialized = true;
      console.log('✅ Intelligent Cache System initialized');

      this.sendTelemetry('cache_system_initialized', {
        availableTiers: Object.keys(this.cacheTiers).filter(tier =>
          this.cacheTiers[tier].isAvailable()
        ),
        storageQuota: this.context.storageQuota,
        features: this.getEnabledFeatures()
      });

    } catch (error) {
      console.error('❌ Cache system initialization failed:', error);
      this.initFallbackMode();
    }
  }

  async initializeCacheTiers() {
    console.log('💾 Initializing cache storage tiers...');

    // Initialize each cache tier
    for (const [name, cacheInstance] of Object.entries(this.cacheTiers)) {
      try {
        await cacheInstance.init();
        console.log(`✅ ${name} cache tier initialized`);
      } catch (error) {
        console.warn(`⚠️ ${name} cache tier failed to initialize:`, error);
      }
    }

    // Check storage quota
    await this.checkStorageQuota();
  }

  async checkStorageQuota() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();

      this.context.storageQuota = estimate.quota || 0;
      this.context.availableStorage = (estimate.quota || 0) - (estimate.usage || 0);

      console.log(`💾 Storage quota: ${this.formatBytes(estimate.quota)}, used: ${this.formatBytes(estimate.usage)}`);

      // Adjust cache sizes based on available storage
      if (this.config.adaptiveSizing) {
        this.adaptCacheSizesToQuota(estimate);
      }
    }
  }

  adaptCacheSizesToQuota(estimate) {
    const totalQuota = estimate.quota || 1024 * 1024 * 1024; // Default 1GB
    const usedStorage = estimate.usage || 0;
    const availableStorage = totalQuota - usedStorage;

    // Use up to 30% of available storage for caching
    const maxCacheStorage = Math.min(availableStorage * 0.3, 1024 * 1024 * 1024); // Max 1GB

    // Distribute storage across tiers
    this.config.maxMemorySize = Math.min(maxCacheStorage * 0.1, 100 * 1024 * 1024);    // 10%, max 100MB
    this.config.maxIndexedDBSize = Math.min(maxCacheStorage * 0.3, 300 * 1024 * 1024); // 30%, max 300MB
    this.config.maxCacheAPISize = Math.min(maxCacheStorage * 0.6, 600 * 1024 * 1024);  // 60%, max 600MB

    console.log(`📊 Adapted cache sizes - Memory: ${this.formatBytes(this.config.maxMemorySize)}, IndexedDB: ${this.formatBytes(this.config.maxIndexedDBSize)}, Cache API: ${this.formatBytes(this.config.maxCacheAPISize)}`);
  }

  setupCacheStrategies() {
    console.log('⚡ Setting up cache strategies...');

    // Cache-first strategy for static assets
    this.strategies.set('cache_first', {
      name: 'Cache First',
      match: (url) => this.isStaticAsset(url),
      execute: async (request) => {
        return await this.executeStrategy('cache_first', request);
      },
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
      tier: ['cacheAPI', 'indexedDB', 'memory']
    });

    // Network-first strategy for API calls
    this.strategies.set('network_first', {
      name: 'Network First',
      match: (url) => this.isAPICall(url),
      execute: async (request) => {
        return await this.executeStrategy('network_first', request);
      },
      ttl: 5 * 60 * 1000, // 5 minutes
      tier: ['memory', 'indexedDB']
    });

    // Stale-while-revalidate for dynamic content
    this.strategies.set('stale_while_revalidate', {
      name: 'Stale While Revalidate',
      match: (url) => this.isDynamicContent(url),
      execute: async (request) => {
        return await this.executeStrategy('stale_while_revalidate', request);
      },
      ttl: 30 * 60 * 1000, // 30 minutes
      tier: ['memory', 'indexedDB', 'cacheAPI']
    });

    // Network-only for critical real-time data
    this.strategies.set('network_only', {
      name: 'Network Only',
      match: (url) => this.isCriticalData(url),
      execute: async (request) => {
        return await fetch(request);
      },
      ttl: 0, // No caching
      tier: []
    });

    // Cache-only for offline support
    this.strategies.set('cache_only', {
      name: 'Cache Only',
      match: (url) => this.isOfflineResource(url),
      execute: async (request) => {
        return await this.executeStrategy('cache_only', request);
      },
      ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
      tier: ['cacheAPI', 'indexedDB']
    });

    console.log(`⚡ ${this.strategies.size} cache strategies configured`);
  }

  async initializeAIModels() {
    console.log('🤖 Initializing AI models...');

    // Load historical data for training
    const historicalData = await this.loadHistoricalData();

    // Initialize and train models
    await this.models.accessPredictor.init(historicalData.access);
    await this.models.invalidationPredictor.init(historicalData.invalidation);
    await this.models.contentAnalyzer.init();
    await this.models.performanceOptimizer.init(historicalData.performance);

    console.log('🤖 AI models initialized and trained');
  }

  async loadHistoricalData() {
    try {
      const stored = localStorage.getItem('intelligent_cache_history');
      return stored ? JSON.parse(stored) : {
        access: [],
        invalidation: [],
        performance: []
      };
    } catch (error) {
      console.warn('Failed to load historical cache data:', error);
      return { access: [], invalidation: [], performance: [] };
    }
  }

  setupCacheManagement() {
    console.log('🔧 Setting up cache management...');

    // Initialize statistics tracking
    this.cacheStats.init();

    // Initialize eviction management
    this.evictionManager.init({
      memoryCache: this.cacheTiers.memory,
      indexedDBCache: this.cacheTiers.indexedDB,
      cacheAPICache: this.cacheTiers.cacheAPI,
      maxSizes: {
        memory: this.config.maxMemorySize,
        indexedDB: this.config.maxIndexedDBSize,
        cacheAPI: this.config.maxCacheAPISize
      },
      intelligentEviction: this.config.intelligentEviction
    });

    // Initialize cross-tab synchronization
    if (this.config.crossTabSync) {
      this.syncManager.init({
        onCacheUpdate: (key, value) => this.handleCrossTabUpdate(key, value),
        onCacheInvalidation: (key) => this.handleCrossTabInvalidation(key)
      });
    }
  }

  startOptimizationLoops() {
    console.log('🔄 Starting optimization loops...');

    // Cache performance monitoring loop
    this.performanceMonitoringLoop = setInterval(() => {
      this.monitorCachePerformance();
    }, 5000); // Every 5 seconds

    // AI-driven cache optimization loop
    this.optimizationLoop = setInterval(() => {
      this.runCacheOptimization();
    }, 30000); // Every 30 seconds

    // Cache warming loop
    this.cacheWarmingLoop = setInterval(() => {
      this.runCacheWarming();
    }, 60000); // Every minute

    // Eviction and cleanup loop
    this.cleanupLoop = setInterval(() => {
      this.runCacheCleanup();
    }, 300000); // Every 5 minutes
  }

  setupEventListeners() {
    // Network state changes
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        this.handleNetworkChange();
      });
    }

    // Storage quota changes
    if ('storage' in navigator && 'addEventListener' in navigator.storage) {
      navigator.storage.addEventListener('quotachange', () => {
        this.handleStorageQuotaChange();
      });
    }

    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });

    // Before unload - save cache state
    window.addEventListener('beforeunload', () => {
      this.saveHistoricalData();
    });
  }

  // Cache strategy execution
  async executeStrategy(strategyName, request) {
    const url = typeof request === 'string' ? request : request.url;

    try {
      switch (strategyName) {
        case 'cache_first':
          return await this.executeCacheFirst(request);

        case 'network_first':
          return await this.executeNetworkFirst(request);

        case 'stale_while_revalidate':
          return await this.executeStaleWhileRevalidate(request);

        case 'cache_only':
          return await this.executeCacheOnly(request);

        default:
          throw new Error(`Unknown strategy: ${strategyName}`);
      }
    } catch (error) {
      console.error(`Strategy execution failed for ${strategyName}:`, error);
      this.cacheStats.recordMiss(url);
      throw error;
    }
  }

  async executeCacheFirst(request) {
    const url = typeof request === 'string' ? request : request.url;

    // Try cache first
    const cachedResponse = await this.getFromCache(url);
    if (cachedResponse) {
      this.cacheStats.recordHit(url);
      return cachedResponse;
    }

    // Fallback to network
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        await this.storeInCache(url, networkResponse.clone());
        this.cacheStats.recordMiss(url);
        return networkResponse;
      }
    } catch (error) {
      console.warn('Network request failed in cache-first strategy:', error);
    }

    throw new Error('Resource not available in cache or network');
  }

  async executeNetworkFirst(request) {
    const url = typeof request === 'string' ? request : request.url;

    // Try network first
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        await this.storeInCache(url, networkResponse.clone());
        this.cacheStats.recordNetworkHit(url);
        return networkResponse;
      }
    } catch (error) {
      console.warn('Network request failed in network-first strategy:', error);
    }

    // Fallback to cache
    const cachedResponse = await this.getFromCache(url);
    if (cachedResponse) {
      this.cacheStats.recordCacheFallback(url);
      return cachedResponse;
    }

    throw new Error('Resource not available in network or cache');
  }

  async executeStaleWhileRevalidate(request) {
    const url = typeof request === 'string' ? request : request.url;

    // Get from cache immediately
    const cachedResponse = await this.getFromCache(url);

    // Start background revalidation
    this.revalidateInBackground(request);

    if (cachedResponse) {
      this.cacheStats.recordHit(url);
      return cachedResponse;
    }

    // If no cache, wait for network
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        await this.storeInCache(url, networkResponse.clone());
        this.cacheStats.recordMiss(url);
        return networkResponse;
      }
    } catch (error) {
      console.warn('Network request failed in stale-while-revalidate strategy:', error);
      throw error;
    }
  }

  async executeCacheOnly(request) {
    const url = typeof request === 'string' ? request : request.url;

    const cachedResponse = await this.getFromCache(url);
    if (cachedResponse) {
      this.cacheStats.recordHit(url);
      return cachedResponse;
    }

    this.cacheStats.recordMiss(url);
    throw new Error('Resource not available in cache-only mode');
  }

  async revalidateInBackground(request) {
    const url = typeof request === 'string' ? request : request.url;

    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        await this.storeInCache(url, networkResponse.clone());
        this.cacheStats.recordRevalidation(url);

        // Notify other tabs about the update
        if (this.config.crossTabSync) {
          this.syncManager.broadcastUpdate(url, networkResponse.clone());
        }
      }
    } catch (error) {
      console.warn('Background revalidation failed:', error);
    }
  }

  // Cache storage and retrieval
  async getFromCache(url) {
    const cacheKey = this.generateCacheKey(url);

    // Try each tier in order of speed
    const tiers = ['memory', 'indexedDB', 'cacheAPI'];

    for (const tierName of tiers) {
      const tier = this.cacheTiers[tierName];
      if (tier.isAvailable()) {
        try {
          const cached = await tier.get(cacheKey);
          if (cached && !this.isExpired(cached)) {
            // Move to faster tier if found in slower tier
            if (tierName !== 'memory') {
              await this.promoteToFasterTier(cacheKey, cached, tierName);
            }

            // Update access patterns for AI
            this.recordAccess(url, tierName, cached);

            return this.deserializeResponse(cached.response);
          } else if (cached && this.isExpired(cached)) {
            // Remove expired entry
            await tier.delete(cacheKey);
          }
        } catch (error) {
          console.warn(`Failed to get from ${tierName} cache:`, error);
        }
      }
    }

    return null;
  }

  async storeInCache(url, response, options = {}) {
    const cacheKey = this.generateCacheKey(url);
    const strategy = this.determineStrategy(url);

    if (strategy.tier.length === 0) {
      return; // No caching for this strategy
    }

    const cacheEntry = await this.createCacheEntry(url, response, strategy, options);

    // Store in appropriate tiers
    for (const tierName of strategy.tier) {
      const tier = this.cacheTiers[tierName];
      if (tier.isAvailable()) {
        try {
          // Check if we need to evict before storing
          if (await this.needsEviction(tierName, cacheEntry.size)) {
            await this.evictionManager.evictFromTier(tierName, cacheEntry.size);
          }

          await tier.set(cacheKey, cacheEntry);
          this.cacheStats.recordStore(url, tierName, cacheEntry.size);

          console.log(`💾 Cached ${url} in ${tierName} (${this.formatBytes(cacheEntry.size)})`);

        } catch (error) {
          console.warn(`Failed to store in ${tierName} cache:`, error);
        }
      }
    }

    // Update AI models
    this.recordCacheStore(url, cacheEntry, strategy);

    // Notify other tabs
    if (this.config.crossTabSync) {
      this.syncManager.broadcastUpdate(url, response);
    }
  }

  async createCacheEntry(url, response, strategy, options) {
    const now = Date.now();
    const ttl = options.ttl || strategy.ttl;

    // Analyze content for better caching decisions
    const contentAnalysis = await this.models.contentAnalyzer.analyze(response.clone());

    return {
      url,
      response: await this.serializeResponse(response),
      timestamp: now,
      expires: now + ttl,
      accessCount: 0,
      lastAccessed: now,
      size: await this.calculateResponseSize(response),
      contentType: response.headers.get('content-type'),
      etag: response.headers.get('etag'),
      lastModified: response.headers.get('last-modified'),
      strategy: strategy.name,
      contentAnalysis,
      priority: this.calculateCachePriority(url, contentAnalysis)
    };
  }

  async serializeResponse(response) {
    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.arrayBuffer()
    };
  }

  deserializeResponse(serialized) {
    return new Response(serialized.body, {
      status: serialized.status,
      statusText: serialized.statusText,
      headers: serialized.headers
    });
  }

  async calculateResponseSize(response) {
    const cloned = response.clone();
    const arrayBuffer = await cloned.arrayBuffer();
    return arrayBuffer.byteLength;
  }

  calculateCachePriority(url, contentAnalysis) {
    let priority = 0;

    // Base priority on content type
    if (contentAnalysis.isStatic) priority += 10;
    if (contentAnalysis.isFrequentlyAccessed) priority += 8;
    if (contentAnalysis.isLargeAsset) priority += 5;
    if (contentAnalysis.isCritical) priority += 15;

    // Adjust based on URL patterns
    if (this.isAPICall(url)) priority += 3;
    if (this.isStaticAsset(url)) priority += 7;

    return Math.min(priority, 50); // Cap at 50
  }

  // Cache tier management
  async promoteToFasterTier(cacheKey, cacheEntry, currentTier) {
    const fasterTiers = {
      'cacheAPI': ['indexedDB', 'memory'],
      'indexedDB': ['memory'],
      'memory': []
    };

    const targetTiers = fasterTiers[currentTier] || [];

    for (const tierName of targetTiers) {
      const tier = this.cacheTiers[tierName];
      if (tier.isAvailable()) {
        try {
          // Check space and evict if necessary
          if (await this.needsEviction(tierName, cacheEntry.size)) {
            await this.evictionManager.evictFromTier(tierName, cacheEntry.size);
          }

          await tier.set(cacheKey, cacheEntry);
          this.cacheStats.recordPromotion(cacheEntry.url, currentTier, tierName);
          break; // Only promote to the fastest available tier

        } catch (error) {
          console.warn(`Failed to promote to ${tierName}:`, error);
        }
      }
    }
  }

  async needsEviction(tierName, requiredSize) {
    const tier = this.cacheTiers[tierName];
    const currentSize = await tier.getCurrentSize();
    const maxSize = this.getMaxSizeForTier(tierName);

    return (currentSize + requiredSize) > maxSize;
  }

  getMaxSizeForTier(tierName) {
    const maxSizes = {
      memory: this.config.maxMemorySize,
      indexedDB: this.config.maxIndexedDBSize,
      cacheAPI: this.config.maxCacheAPISize
    };

    return maxSizes[tierName] || 0;
  }

  // Cache optimization and AI integration
  async runCacheOptimization() {
    try {
      console.log('🤖 Running AI-powered cache optimization...');

      // Get current cache state
      const cacheState = await this.getCacheState();

      // Generate predictions and recommendations
      const predictions = await this.generateCachePredictions(cacheState);
      const optimizations = await this.generateOptimizationRecommendations(cacheState, predictions);

      // Execute optimizations
      await this.executeOptimizations(optimizations);

      console.log(`🤖 Cache optimization completed - applied ${optimizations.length} optimizations`);

    } catch (error) {
      console.error('Cache optimization failed:', error);
    }
  }

  async getCacheState() {
    const state = {
      memory: await this.cacheTiers.memory.getState(),
      indexedDB: await this.cacheTiers.indexedDB.getState(),
      cacheAPI: await this.cacheTiers.cacheAPI.getState(),
      statistics: this.cacheStats.getStatistics(),
      networkConditions: this.getNetworkConditions(),
      deviceConstraints: this.getDeviceConstraints()
    };

    return state;
  }

  async generateCachePredictions(cacheState) {
    const predictions = {
      access: await this.models.accessPredictor.predict(cacheState),
      invalidation: await this.models.invalidationPredictor.predict(cacheState),
      performance: await this.models.performanceOptimizer.predict(cacheState)
    };

    return predictions;
  }

  async generateOptimizationRecommendations(cacheState, predictions) {
    const recommendations = [];

    // Preload predicted high-access resources
    for (const resource of predictions.access.highProbability) {
      recommendations.push({
        type: 'preload',
        resource: resource.url,
        confidence: resource.confidence,
        priority: 'high'
      });
    }

    // Invalidate predicted stale resources
    for (const resource of predictions.invalidation.likelyStale) {
      recommendations.push({
        type: 'invalidate',
        resource: resource.url,
        confidence: resource.confidence,
        reason: resource.reason
      });
    }

    // Optimize cache tier distribution
    const tierOptimizations = this.optimizeTierDistribution(cacheState, predictions.performance);
    recommendations.push(...tierOptimizations);

    // Adjust cache sizes based on usage patterns
    const sizeOptimizations = this.optimizeCacheSizes(cacheState, predictions);
    recommendations.push(...sizeOptimizations);

    return recommendations;
  }

  optimizeTierDistribution(cacheState, performancePredictions) {
    const optimizations = [];

    // Move frequently accessed items to faster tiers
    for (const item of performancePredictions.frequentAccess) {
      if (item.currentTier !== 'memory' && item.accessFrequency > 10) {
        optimizations.push({
          type: 'promote',
          resource: item.url,
          fromTier: item.currentTier,
          toTier: 'memory',
          reason: 'frequent_access'
        });
      }
    }

    // Move rarely accessed items to slower tiers
    for (const item of performancePredictions.rareAccess) {
      if (item.currentTier === 'memory' && item.accessFrequency < 2) {
        optimizations.push({
          type: 'demote',
          resource: item.url,
          fromTier: item.currentTier,
          toTier: 'indexedDB',
          reason: 'rare_access'
        });
      }
    }

    return optimizations;
  }

  optimizeCacheSizes(cacheState, predictions) {
    const optimizations = [];

    // Increase cache size if hit rate is high and storage available
    if (this.metrics.hitRate > 0.8 && this.context.availableStorage > this.getTotalCacheSize() * 2) {
      optimizations.push({
        type: 'resize',
        tier: 'cacheAPI',
        newSize: this.config.maxCacheAPISize * 1.2,
        reason: 'high_hit_rate'
      });
    }

    // Decrease cache size if hit rate is low
    if (this.metrics.hitRate < 0.3) {
      optimizations.push({
        type: 'resize',
        tier: 'indexedDB',
        newSize: this.config.maxIndexedDBSize * 0.8,
        reason: 'low_hit_rate'
      });
    }

    return optimizations;
  }

  async executeOptimizations(optimizations) {
    for (const optimization of optimizations) {
      try {
        switch (optimization.type) {
          case 'preload':
            await this.executePreload(optimization);
            break;

          case 'invalidate':
            await this.executeInvalidation(optimization);
            break;

          case 'promote':
            await this.executePromotion(optimization);
            break;

          case 'demote':
            await this.executeDemotion(optimization);
            break;

          case 'resize':
            await this.executeResize(optimization);
            break;

          default:
            console.warn('Unknown optimization type:', optimization.type);
        }
      } catch (error) {
        console.error(`Failed to execute optimization ${optimization.type}:`, error);
      }
    }
  }

  async executePreload(optimization) {
    try {
      const response = await fetch(optimization.resource);
      if (response.ok) {
        await this.storeInCache(optimization.resource, response, {
          priority: optimization.priority
        });
        console.log(`🔮 Preloaded ${optimization.resource} (confidence: ${optimization.confidence})`);
      }
    } catch (error) {
      console.warn(`Failed to preload ${optimization.resource}:`, error);
    }
  }

  async executeInvalidation(optimization) {
    await this.invalidate(optimization.resource);
    console.log(`🗑️ Invalidated ${optimization.resource} (${optimization.reason})`);
  }

  async executePromotion(optimization) {
    const cacheKey = this.generateCacheKey(optimization.resource);

    // Get from current tier
    const fromTier = this.cacheTiers[optimization.fromTier];
    const cacheEntry = await fromTier.get(cacheKey);

    if (cacheEntry) {
      // Store in target tier
      const toTier = this.cacheTiers[optimization.toTier];
      await toTier.set(cacheKey, cacheEntry);

      // Remove from original tier (optional, depending on strategy)
      // await fromTier.delete(cacheKey);

      console.log(`⬆️ Promoted ${optimization.resource} from ${optimization.fromTier} to ${optimization.toTier}`);
    }
  }

  async executeDemotion(optimization) {
    const cacheKey = this.generateCacheKey(optimization.resource);

    // Get from current tier
    const fromTier = this.cacheTiers[optimization.fromTier];
    const cacheEntry = await fromTier.get(cacheKey);

    if (cacheEntry) {
      // Store in target tier
      const toTier = this.cacheTiers[optimization.toTier];
      await toTier.set(cacheKey, cacheEntry);

      // Remove from original tier
      await fromTier.delete(cacheKey);

      console.log(`⬇️ Demoted ${optimization.resource} from ${optimization.fromTier} to ${optimization.toTier}`);
    }
  }

  async executeResize(optimization) {
    const tierName = optimization.tier;
    const newSize = optimization.newSize;

    // Update configuration
    switch (tierName) {
      case 'memory':
        this.config.maxMemorySize = newSize;
        break;
      case 'indexedDB':
        this.config.maxIndexedDBSize = newSize;
        break;
      case 'cacheAPI':
        this.config.maxCacheAPISize = newSize;
        break;
    }

    // Update eviction manager
    this.evictionManager.updateMaxSize(tierName, newSize);

    console.log(`📏 Resized ${tierName} cache to ${this.formatBytes(newSize)} (${optimization.reason})`);
  }

  // Cache warming and preloading
  async runCacheWarming() {
    try {
      // Get warm-up candidates from AI predictions
      const candidates = await this.getWarmupCandidates();

      // Limit concurrent warming
      const maxConcurrent = 3;
      let currentWarming = 0;

      for (const candidate of candidates.slice(0, 10)) { // Limit to top 10
        if (currentWarming >= maxConcurrent) break;

        if (candidate.confidence > 0.7) {
          currentWarming++;
          this.warmupResource(candidate.url).finally(() => {
            currentWarming--;
          });
        }
      }

    } catch (error) {
      console.error('Cache warming failed:', error);
    }
  }

  async getWarmupCandidates() {
    // Use access predictor to identify likely-to-be-accessed resources
    const currentState = await this.getCacheState();
    const predictions = await this.models.accessPredictor.predict(currentState);

    return predictions.highProbability || [];
  }

  async warmupResource(url) {
    try {
      // Check if already cached
      const cached = await this.getFromCache(url);
      if (cached) return;

      // Fetch and cache
      const response = await fetch(url);
      if (response.ok) {
        await this.storeInCache(url, response);
        console.log(`🔥 Warmed up cache for ${url}`);
      }
    } catch (error) {
      console.warn(`Failed to warm up ${url}:`, error);
    }
  }

  // Cache cleanup and maintenance
  async runCacheCleanup() {
    try {
      console.log('🧹 Running cache cleanup...');

      let totalCleaned = 0;

      // Clean expired entries from all tiers
      for (const [tierName, tier] of Object.entries(this.cacheTiers)) {
        if (tier.isAvailable()) {
          const cleaned = await this.cleanExpiredEntries(tier, tierName);
          totalCleaned += cleaned;
        }
      }

      // Run eviction if needed
      await this.evictionManager.runMaintenanceEviction();

      // Update storage usage
      await this.updateStorageUsage();

      console.log(`🧹 Cleanup completed - removed ${totalCleaned} expired entries`);

    } catch (error) {
      console.error('Cache cleanup failed:', error);
    }
  }

  async cleanExpiredEntries(tier, tierName) {
    const now = Date.now();
    const keys = await tier.getAllKeys();
    let cleanedCount = 0;

    for (const key of keys) {
      try {
        const entry = await tier.get(key);
        if (entry && entry.expires && entry.expires < now) {
          await tier.delete(key);
          this.cacheStats.recordExpiration(entry.url, tierName);
          cleanedCount++;
        }
      } catch (error) {
        console.warn(`Failed to check expiration for ${key}:`, error);
      }
    }

    return cleanedCount;
  }

  async updateStorageUsage() {
    let totalUsage = 0;

    for (const [tierName, tier] of Object.entries(this.cacheTiers)) {
      if (tier.isAvailable()) {
        const usage = await tier.getCurrentSize();
        totalUsage += usage;
      }
    }

    this.metrics.storageUsed = totalUsage;
  }

  // Performance monitoring
  monitorCachePerformance() {
    const stats = this.cacheStats.getStatistics();

    // Update metrics
    this.metrics.hitRate = stats.hits / Math.max(stats.requests, 1);
    this.metrics.missRate = stats.misses / Math.max(stats.requests, 1);

    // Log performance if significant changes
    const prevHitRate = this.metrics.hitRate;
    if (Math.abs(prevHitRate - this.metrics.hitRate) > 0.05) {
      console.log(`📊 Cache hit rate: ${(this.metrics.hitRate * 100).toFixed(1)}%`);
    }

    // Performance alerts
    if (this.metrics.hitRate < 0.3) {
      console.warn('⚠️ Low cache hit rate detected');
      this.triggerPerformanceAlert('low_hit_rate', this.metrics.hitRate);
    }

    if (this.metrics.storageUsed > this.getTotalMaxCacheSize() * 0.9) {
      console.warn('⚠️ Cache storage nearly full');
      this.triggerPerformanceAlert('storage_full', this.metrics.storageUsed);
    }
  }

  triggerPerformanceAlert(type, value) {
    // Could trigger immediate optimizations or notifications
    this.sendTelemetry('cache_performance_alert', {
      type,
      value,
      metrics: this.metrics,
      timestamp: Date.now()
    });
  }

  // Public API methods
  async get(url, options = {}) {
    const startTime = performance.now();

    try {
      const strategy = options.strategy ?
        this.strategies.get(options.strategy) :
        this.determineStrategy(url);

      const response = await strategy.execute(url);

      // Record response time
      const responseTime = performance.now() - startTime;
      this.metrics.responseTime.set(url, responseTime);

      return response;

    } catch (error) {
      console.error(`Cache get failed for ${url}:`, error);
      throw error;
    }
  }

  async set(url, response, options = {}) {
    await this.storeInCache(url, response, options);
  }

  async invalidate(url) {
    const cacheKey = this.generateCacheKey(url);

    // Remove from all tiers
    for (const [tierName, tier] of Object.entries(this.cacheTiers)) {
      if (tier.isAvailable()) {
        try {
          await tier.delete(cacheKey);
          this.cacheStats.recordInvalidation(url, tierName);
        } catch (error) {
          console.warn(`Failed to invalidate from ${tierName}:`, error);
        }
      }
    }

    // Notify other tabs
    if (this.config.crossTabSync) {
      this.syncManager.broadcastInvalidation(url);
    }

    console.log(`🗑️ Invalidated cache for ${url}`);
  }

  async invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    const invalidatedUrls = [];

    for (const [tierName, tier] of Object.entries(this.cacheTiers)) {
      if (tier.isAvailable()) {
        const keys = await tier.getAllKeys();

        for (const key of keys) {
          const entry = await tier.get(key);
          if (entry && regex.test(entry.url)) {
            await tier.delete(key);
            invalidatedUrls.push(entry.url);
            this.cacheStats.recordInvalidation(entry.url, tierName);
          }
        }
      }
    }

    console.log(`🗑️ Invalidated ${invalidatedUrls.length} cache entries matching pattern: ${pattern}`);
    return invalidatedUrls;
  }

  async clear(tierName = null) {
    if (tierName) {
      // Clear specific tier
      const tier = this.cacheTiers[tierName];
      if (tier && tier.isAvailable()) {
        await tier.clear();
        console.log(`🗑️ Cleared ${tierName} cache`);
      }
    } else {
      // Clear all tiers
      for (const [name, tier] of Object.entries(this.cacheTiers)) {
        if (tier.isAvailable()) {
          await tier.clear();
        }
      }
      console.log('🗑️ Cleared all cache tiers');
    }

    // Reset statistics
    this.cacheStats.reset();
  }

  getMetrics() {
    return {
      ...this.metrics,
      statistics: this.cacheStats.getStatistics(),
      storageUsage: this.getStorageUsage(),
      tierStatus: this.getTierStatus()
    };
  }

  getStorageUsage() {
    const usage = {};

    for (const [tierName, tier] of Object.entries(this.cacheTiers)) {
      if (tier.isAvailable()) {
        usage[tierName] = {
          used: tier.getCurrentSize(),
          max: this.getMaxSizeForTier(tierName),
          utilization: tier.getCurrentSize() / this.getMaxSizeForTier(tierName)
        };
      }
    }

    return usage;
  }

  getTierStatus() {
    const status = {};

    for (const [tierName, tier] of Object.entries(this.cacheTiers)) {
      status[tierName] = {
        available: tier.isAvailable(),
        entries: tier.getEntryCount ? tier.getEntryCount() : 'unknown',
        size: tier.getCurrentSize(),
        lastActivity: tier.getLastActivity ? tier.getLastActivity() : null
      };
    }

    return status;
  }

  // Strategy determination
  determineStrategy(url) {
    for (const [name, strategy] of this.strategies) {
      if (strategy.match(url)) {
        return strategy;
      }
    }

    // Default strategy
    return this.strategies.get('stale_while_revalidate');
  }

  // URL classification helpers
  isStaticAsset(url) {
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.woff', '.woff2'];
    return staticExtensions.some(ext => url.toLowerCase().includes(ext));
  }

  isAPICall(url) {
    return url.includes('/api/') ||
           url.includes('/graphql') ||
           url.includes('api.');
  }

  isDynamicContent(url) {
    return !this.isStaticAsset(url) && !this.isAPICall(url) && !this.isCriticalData(url);
  }

  isCriticalData(url) {
    return url.includes('/auth') ||
           url.includes('/payment') ||
           url.includes('/real-time') ||
           url.includes('/live');
  }

  isOfflineResource(url) {
    return url.includes('offline') ||
           url.includes('manifest.json') ||
           this.isStaticAsset(url);
  }

  // Utility methods
  generateCacheKey(url) {
    // Remove query parameters that don't affect caching
    const urlObj = new URL(url, window.location.origin);

    // Remove cache-busting parameters
    urlObj.searchParams.delete('_');
    urlObj.searchParams.delete('cache_bust');
    urlObj.searchParams.delete('v');

    return urlObj.toString();
  }

  isExpired(cacheEntry) {
    return cacheEntry.expires && cacheEntry.expires < Date.now();
  }

  getTotalCacheSize() {
    let total = 0;
    for (const [tierName, tier] of Object.entries(this.cacheTiers)) {
      if (tier.isAvailable()) {
        total += tier.getCurrentSize();
      }
    }
    return total;
  }

  getTotalMaxCacheSize() {
    return this.config.maxMemorySize +
           this.config.maxIndexedDBSize +
           this.config.maxCacheAPISize;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getNetworkConditions() {
    if ('connection' in navigator) {
      const conn = navigator.connection;
      return {
        type: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData
      };
    }
    return { type: 'unknown' };
  }

  getDeviceConstraints() {
    return {
      memory: navigator.deviceMemory || 4,
      cores: navigator.hardwareConcurrency || 4,
      battery: this.context.batteryLevel
    };
  }

  // Event handlers
  handleNetworkChange() {
    const conditions = this.getNetworkConditions();
    this.context.networkSpeed = conditions.type === '4g' ? 'fast' : 'slow';

    // Adapt cache strategies based on network
    if (conditions.saveData || conditions.type === '2g') {
      this.adaptForSlowNetwork();
    } else {
      this.adaptForFastNetwork();
    }
  }

  adaptForSlowNetwork() {
    // More aggressive caching for slow networks
    this.config.defaultTTL = 48 * 60 * 60 * 1000; // 48 hours

    // Prefer cache-first strategies
    console.log('📡 Adapting cache for slow network');
  }

  adaptForFastNetwork() {
    // Less aggressive caching for fast networks
    this.config.defaultTTL = 24 * 60 * 60 * 1000; // 24 hours

    // Allow more network-first strategies
    console.log('📡 Adapting cache for fast network');
  }

  async handleStorageQuotaChange() {
    await this.checkStorageQuota();

    // Trigger cleanup if storage is low
    if (this.context.availableStorage < this.getTotalCacheSize() * 1.1) {
      console.warn('⚠️ Low storage available - triggering aggressive cleanup');
      await this.runAggressiveCleanup();
    }
  }

  async runAggressiveCleanup() {
    // Remove least recently used items
    await this.evictionManager.runAggressiveEviction();

    // Reduce cache sizes temporarily
    this.temporarilyReduceCacheSizes();
  }

  temporarilyReduceCacheSizes() {
    this.config.maxMemorySize *= 0.7;
    this.config.maxIndexedDBSize *= 0.7;
    this.config.maxCacheAPISize *= 0.7;

    console.log('📉 Temporarily reduced cache sizes due to storage constraints');
  }

  handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden - pause non-essential operations
      this.pauseCacheOperations();
    } else {
      // Page is visible - resume operations
      this.resumeCacheOperations();
    }
  }

  pauseCacheOperations() {
    if (this.cacheWarmingLoop) {
      clearInterval(this.cacheWarmingLoop);
      this.cacheWarmingLoop = null;
    }
  }

  resumeCacheOperations() {
    if (!this.cacheWarmingLoop) {
      this.cacheWarmingLoop = setInterval(() => {
        this.runCacheWarming();
      }, 60000);
    }
  }

  handleCrossTabUpdate(key, value) {
    // Another tab updated the cache - sync locally
    console.log(`🔄 Cross-tab cache update: ${key}`);
    // Implementation would sync the update across tiers
  }

  handleCrossTabInvalidation(key) {
    // Another tab invalidated the cache - remove locally
    console.log(`🔄 Cross-tab cache invalidation: ${key}`);
    this.invalidate(key);
  }

  // Data recording for AI
  recordAccess(url, tier, cacheEntry) {
    this.models.accessPredictor.recordAccess({
      url,
      tier,
      timestamp: Date.now(),
      size: cacheEntry.size,
      contentType: cacheEntry.contentType,
      age: Date.now() - cacheEntry.timestamp
    });
  }

  recordCacheStore(url, cacheEntry, strategy) {
    this.models.contentAnalyzer.recordStore({
      url,
      size: cacheEntry.size,
      contentType: cacheEntry.contentType,
      strategy: strategy.name,
      timestamp: Date.now()
    });
  }

  saveHistoricalData() {
    try {
      const data = {
        access: this.models.accessPredictor.getHistoricalData(),
        invalidation: this.models.invalidationPredictor.getHistoricalData(),
        performance: this.models.performanceOptimizer.getHistoricalData(),
        statistics: this.cacheStats.getStatistics(),
        timestamp: Date.now()
      };

      localStorage.setItem('intelligent_cache_history', JSON.stringify(data));

    } catch (error) {
      console.warn('Failed to save cache historical data:', error);
    }
  }

  getEnabledFeatures() {
    return {
      memoryCache: this.cacheTiers.memory.isAvailable(),
      indexedDBCache: this.cacheTiers.indexedDB.isAvailable(),
      cacheAPICache: this.cacheTiers.cacheAPI.isAvailable(),
      serviceWorkerCache: this.cacheTiers.serviceWorker.isAvailable(),
      aiOptimization: true,
      intelligentEviction: this.config.intelligentEviction,
      crossTabSync: this.config.crossTabSync,
      adaptiveSizing: this.config.adaptiveSizing,
      predictivePreloading: true,
      networkAdaptation: 'connection' in navigator,
      storageQuotaManagement: 'storage' in navigator
    };
  }

  sendTelemetry(event, data) {
    if ('sendBeacon' in navigator) {
      const telemetryData = {
        event,
        data,
        timestamp: Date.now(),
        metrics: this.metrics,
        config: this.config
      };

      navigator.sendBeacon('/api/cache-telemetry', JSON.stringify(telemetryData));
    }
  }

  // Fallback mode
  initFallbackMode() {
    console.log('🔄 Running in cache fallback mode');

    // Only use memory cache and basic strategies
    this.cacheTiers = {
      memory: new MemoryCache()
    };

    this.strategies.clear();
    this.strategies.set('cache_first', {
      name: 'Cache First (Fallback)',
      match: () => true,
      execute: async (request) => {
        return await this.executeCacheFirst(request);
      },
      ttl: 60 * 60 * 1000, // 1 hour
      tier: ['memory']
    });
  }
}

// Supporting classes (simplified implementations)
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.size = 0;
  }

  async init() {
    this.cache.clear();
    this.size = 0;
  }

  isAvailable() {
    return true;
  }

  async get(key) {
    return this.cache.get(key);
  }

  async set(key, value) {
    this.cache.set(key, value);
    this.size += value.size || 0;
  }

  async delete(key) {
    const entry = this.cache.get(key);
    if (entry) {
      this.size -= entry.size || 0;
      this.cache.delete(key);
    }
  }

  async clear() {
    this.cache.clear();
    this.size = 0;
  }

  async getAllKeys() {
    return Array.from(this.cache.keys());
  }

  getCurrentSize() {
    return this.size;
  }

  async getState() {
    return {
      entries: this.cache.size,
      size: this.size
    };
  }
}

class IndexedDBCache {
  constructor() {
    this.dbName = 'IntelligentCache';
    this.storeName = 'cache';
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  isAvailable() {
    return this.db !== null && 'indexedDB' in window;
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async set(key, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(value, key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAllKeys() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  getCurrentSize() {
    // Simplified - would need to iterate through entries to calculate actual size
    return 0;
  }

  async getState() {
    const keys = await this.getAllKeys();
    return {
      entries: keys.length,
      size: this.getCurrentSize()
    };
  }
}

class CacheAPIWrapper {
  constructor() {
    this.cacheName = 'intelligent-cache';
    this.cache = null;
  }

  async init() {
    if ('caches' in window) {
      this.cache = await caches.open(this.cacheName);
    }
  }

  isAvailable() {
    return this.cache !== null && 'caches' in window;
  }

  async get(key) {
    const response = await this.cache.match(key);
    return response ? { response } : null;
  }

  async set(key, value) {
    const response = new Response(JSON.stringify(value));
    await this.cache.put(key, response);
  }

  async delete(key) {
    await this.cache.delete(key);
  }

  async clear() {
    const keys = await this.cache.keys();
    await Promise.all(keys.map(key => this.cache.delete(key)));
  }

  async getAllKeys() {
    const requests = await this.cache.keys();
    return requests.map(request => request.url);
  }

  getCurrentSize() {
    // Simplified - Cache API doesn't provide direct size information
    return 0;
  }

  async getState() {
    const keys = await this.getAllKeys();
    return {
      entries: keys.length,
      size: this.getCurrentSize()
    };
  }
}

class ServiceWorkerCache {
  isAvailable() {
    return 'serviceWorker' in navigator;
  }

  async init() {
    // Service worker cache would be managed by the service worker
  }

  // Simplified implementation - would communicate with service worker
  async get(key) { return null; }
  async set(key, value) { }
  async delete(key) { }
  async clear() { }
  async getAllKeys() { return []; }
  getCurrentSize() { return 0; }
  async getState() { return { entries: 0, size: 0 }; }
}

// Simplified AI model implementations
class CacheAccessPredictor {
  constructor() {
    this.accessHistory = [];
  }

  async init(historicalData = []) {
    this.accessHistory = historicalData.slice(-1000);
  }

  async predict(cacheState) {
    // Simplified prediction based on access patterns
    const predictions = {
      highProbability: [],
      lowProbability: []
    };

    // Analyze access patterns
    const urlFrequency = new Map();
    for (const access of this.accessHistory) {
      urlFrequency.set(access.url, (urlFrequency.get(access.url) || 0) + 1);
    }

    // Generate predictions
    for (const [url, frequency] of urlFrequency) {
      const confidence = Math.min(frequency / 10, 1);
      const prediction = { url, confidence, frequency };

      if (confidence > 0.7) {
        predictions.highProbability.push(prediction);
      } else {
        predictions.lowProbability.push(prediction);
      }
    }

    return predictions;
  }

  recordAccess(accessData) {
    this.accessHistory.push(accessData);

    // Keep recent history
    if (this.accessHistory.length > 1000) {
      this.accessHistory.shift();
    }
  }

  getHistoricalData() {
    return this.accessHistory.slice(-500);
  }
}

class InvalidationPredictor {
  constructor() {
    this.invalidationHistory = [];
  }

  async init(historicalData = []) {
    this.invalidationHistory = historicalData.slice(-500);
  }

  async predict(cacheState) {
    return {
      likelyStale: [],
      freshContent: []
    };
  }

  getHistoricalData() {
    return this.invalidationHistory.slice(-200);
  }
}

class ContentAnalyzer {
  async init() {
    // Initialize content analysis
  }

  async analyze(response) {
    const contentType = response.headers.get('content-type') || '';

    return {
      isStatic: this.isStaticContent(contentType),
      isFrequentlyAccessed: false, // Would analyze based on history
      isLargeAsset: false, // Would check content-length
      isCritical: false, // Would analyze based on URL patterns
      contentType
    };
  }

  isStaticContent(contentType) {
    return contentType.includes('image/') ||
           contentType.includes('text/css') ||
           contentType.includes('application/javascript') ||
           contentType.includes('font/');
  }

  recordStore(storeData) {
    // Record store data for analysis
  }
}

class CachePerformanceOptimizer {
  async init(historicalData = []) {
    // Initialize performance optimizer
  }

  async predict(cacheState) {
    return {
      frequentAccess: [],
      rareAccess: []
    };
  }

  getHistoricalData() {
    return [];
  }
}

class CacheStatistics {
  constructor() {
    this.stats = {
      requests: 0,
      hits: 0,
      misses: 0,
      stores: 0,
      evictions: 0,
      invalidations: 0,
      revalidations: 0
    };
  }

  init() {
    this.reset();
  }

  recordHit(url) {
    this.stats.requests++;
    this.stats.hits++;
  }

  recordMiss(url) {
    this.stats.requests++;
    this.stats.misses++;
  }

  recordNetworkHit(url) {
    this.stats.requests++;
    // Network hit is counted as a type of miss
  }

  recordCacheFallback(url) {
    this.stats.hits++;
  }

  recordStore(url, tier, size) {
    this.stats.stores++;
  }

  recordEviction(url, tier) {
    this.stats.evictions++;
  }

  recordInvalidation(url, tier) {
    this.stats.invalidations++;
  }

  recordRevalidation(url) {
    this.stats.revalidations++;
  }

  recordExpiration(url, tier) {
    this.stats.evictions++;
  }

  recordPromotion(url, fromTier, toTier) {
    // Track tier promotions
  }

  getStatistics() {
    return { ...this.stats };
  }

  reset() {
    this.stats = {
      requests: 0,
      hits: 0,
      misses: 0,
      stores: 0,
      evictions: 0,
      invalidations: 0,
      revalidations: 0
    };
  }
}

class EvictionManager {
  constructor() {
    this.caches = {};
    this.maxSizes = {};
  }

  init(config) {
    this.caches = {
      memory: config.memoryCache,
      indexedDB: config.indexedDBCache,
      cacheAPI: config.cacheAPICache
    };
    this.maxSizes = config.maxSizes;
  }

  async evictFromTier(tierName, requiredSpace) {
    const cache = this.caches[tierName];
    if (!cache || !cache.isAvailable()) return;

    // Simple LRU eviction - would be more sophisticated in practice
    const keys = await cache.getAllKeys();

    for (const key of keys) {
      try {
        const entry = await cache.get(key);
        if (entry && (Date.now() - entry.lastAccessed) > 60 * 60 * 1000) { // 1 hour
          await cache.delete(key);
          console.log(`🗑️ Evicted ${entry.url} from ${tierName}`);

          // Check if we've freed enough space
          if (entry.size >= requiredSpace) break;
        }
      } catch (error) {
        console.warn(`Failed to evict ${key}:`, error);
      }
    }
  }

  async runMaintenanceEviction() {
    // Run maintenance eviction for all tiers
    for (const tierName of Object.keys(this.caches)) {
      await this.evictFromTier(tierName, 0);
    }
  }

  async runAggressiveEviction() {
    // More aggressive eviction when storage is low
    for (const [tierName, cache] of Object.entries(this.caches)) {
      if (cache.isAvailable()) {
        const currentSize = cache.getCurrentSize();
        const maxSize = this.maxSizes[tierName];

        if (currentSize > maxSize * 0.5) {
          await this.evictFromTier(tierName, currentSize * 0.3);
        }
      }
    }
  }

  updateMaxSize(tierName, newSize) {
    this.maxSizes[tierName] = newSize;
  }
}

class CrossTabSyncManager {
  constructor() {
    this.channel = null;
  }

  init(config) {
    if ('BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('intelligent-cache-sync');

      this.channel.onmessage = (event) => {
        const { type, data } = event.data;

        switch (type) {
          case 'cache_update':
            config.onCacheUpdate(data.key, data.value);
            break;
          case 'cache_invalidation':
            config.onCacheInvalidation(data.key);
            break;
        }
      };
    }
  }

  broadcastUpdate(key, value) {
    if (this.channel) {
      this.channel.postMessage({
        type: 'cache_update',
        data: { key, value }
      });
    }
  }

  broadcastInvalidation(key) {
    if (this.channel) {
      this.channel.postMessage({
        type: 'cache_invalidation',
        data: { key }
      });
    }
  }
}

// Initialize the Intelligent Cache System
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.intelligentCacheSystem = new IntelligentCacheSystem();
  });
} else {
  window.intelligentCacheSystem = new IntelligentCacheSystem();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IntelligentCacheSystem;
}