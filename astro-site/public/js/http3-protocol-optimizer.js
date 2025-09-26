/**
 * HTTP/3 and Advanced Protocol Optimizer
 * Next-generation networking optimizations for maximum performance
 *
 * Features:
 * - HTTP/3 detection and optimization
 * - QUIC protocol enhancements
 * - Advanced connection management
 * - Protocol-aware resource bundling
 * - Network condition adaptation
 * - 0-RTT connection resumption
 * - Stream prioritization
 * - Connection migration support
 */

class HTTP3ProtocolOptimizer {
  constructor() {
    this.initialized = false;
    this.protocolSupport = {
      http3: false,
      http2: false,
      http1: true
    };

    this.connectionPool = new AdvancedConnectionPool();
    this.streamManager = new StreamPrioritizationManager();
    this.migrationManager = new ConnectionMigrationManager();
    this.compressionEngine = new AdvancedCompressionEngine();

    // Performance metrics
    this.metrics = {
      connectionTimes: [],
      transferRates: [],
      protocolEfficiency: new Map(),
      streamMetrics: new Map()
    };

    // Network conditions
    this.networkState = {
      bandwidth: 0,
      latency: 0,
      packetLoss: 0,
      stability: 'unknown'
    };

    this.init();
  }

  async init() {
    try {
      console.log('🚀 Initializing HTTP/3 Protocol Optimizer...');

      // Detect protocol support
      await this.detectProtocolSupport();

      // Initialize connection management
      await this.initConnectionManagement();

      // Setup network monitoring
      this.initNetworkMonitoring();

      // Configure resource bundling strategies
      this.configureResourceBundling();

      // Initialize compression engines
      await this.initCompressionEngines();

      // Setup connection migration
      this.initConnectionMigration();

      // Start optimization loop
      this.startOptimizationLoop();

      this.initialized = true;
      console.log('✅ HTTP/3 Protocol Optimizer initialized');

      this.sendTelemetry('http3_optimizer_initialized', {
        protocolSupport: this.protocolSupport,
        features: this.getEnabledFeatures()
      });

    } catch (error) {
      console.error('❌ HTTP/3 Protocol Optimizer initialization failed:', error);
      this.initFallbackMode();
    }
  }

  async detectProtocolSupport() {
    console.log('🔍 Detecting protocol support...');

    // Test HTTP/3 support
    try {
      const testUrl = `${location.origin}/api/protocol-test`;

      // Use fetch with HTTP/3 hints if available
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(testUrl, {
        method: 'HEAD',
        signal: controller.signal,
        // Try to force HTTP/3 if supported
        headers: {
          'Alt-Used': location.host,
          'Connection': 'upgrade',
          'Upgrade': 'h3'
        }
      });

      clearTimeout(timeoutId);

      // Check response headers for protocol information
      const protocol = this.extractProtocolFromResponse(response);

      if (protocol) {
        this.protocolSupport.http3 = protocol.includes('h3') || protocol.includes('quic');
        this.protocolSupport.http2 = protocol.includes('h2');

        console.log(`📡 Detected protocol: ${protocol}`);
      }

    } catch (error) {
      console.warn('Protocol detection failed:', error);
    }

    // Fallback: Check for HTTP/2 through performance API
    if (!this.protocolSupport.http2) {
      const navigationEntry = performance.getEntriesByType('navigation')[0];
      if (navigationEntry && navigationEntry.nextHopProtocol) {
        this.protocolSupport.http2 = navigationEntry.nextHopProtocol.includes('h2');
        this.protocolSupport.http3 = navigationEntry.nextHopProtocol.includes('h3');
      }
    }

    console.log('📊 Protocol Support:', this.protocolSupport);
  }

  extractProtocolFromResponse(response) {
    // Try various ways to detect protocol
    const altSvc = response.headers.get('alt-svc');
    const protocol = response.headers.get('x-protocol') ||
                    response.headers.get('x-connection-protocol');

    if (altSvc && altSvc.includes('h3')) {
      return 'h3';
    }

    return protocol;
  }

  async initConnectionManagement() {
    console.log('🔗 Initializing advanced connection management...');

    // Configure connection pool based on protocol support
    if (this.protocolSupport.http3) {
      await this.connectionPool.configureHTTP3();
    } else if (this.protocolSupport.http2) {
      await this.connectionPool.configureHTTP2();
    } else {
      await this.connectionPool.configureHTTP1();
    }

    // Setup connection prewarming
    this.prewarmConnections();

    // Initialize 0-RTT if supported
    if (this.protocolSupport.http3) {
      this.init0RTTResumption();
    }
  }

  prewarmConnections() {
    // Prewarm connections to likely destinations
    const domains = this.identifyLikelyDomains();

    for (const domain of domains) {
      this.connectionPool.prewarmConnection(domain);
    }
  }

  identifyLikelyDomains() {
    const domains = new Set();

    // Extract domains from page resources
    document.querySelectorAll('link[href], script[src], img[src]').forEach(el => {
      const url = el.href || el.src;
      if (url) {
        try {
          const domain = new URL(url).origin;
          if (domain !== location.origin) {
            domains.add(domain);
          }
        } catch (e) {
          // Ignore invalid URLs
        }
      }
    });

    // Add common CDN domains
    const commonCDNs = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdnjs.cloudflare.com',
      'https://unpkg.com',
      'https://cdn.jsdelivr.net'
    ];

    commonCDNs.forEach(cdn => domains.add(cdn));

    return Array.from(domains);
  }

  init0RTTResumption() {
    console.log('⚡ Initializing 0-RTT connection resumption...');

    // Store connection state for 0-RTT
    this.connectionState = {
      sessionTickets: new Map(),
      earlyData: new Map(),
      resumptionSecrets: new Map()
    };

    // Attempt 0-RTT on page load
    this.attempt0RTTResumption();
  }

  attempt0RTTResumption() {
    const currentOrigin = location.origin;
    const storedTicket = this.getStoredSessionTicket(currentOrigin);

    if (storedTicket && this.isTicketValid(storedTicket)) {
      console.log('🎫 Using stored session ticket for 0-RTT');

      // Use stored session for immediate data transmission
      this.use0RTTConnection(storedTicket);
    }
  }

  getStoredSessionTicket(origin) {
    try {
      const stored = localStorage.getItem(`http3_ticket_${origin}`);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  isTicketValid(ticket) {
    const now = Date.now();
    const age = now - ticket.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    return age < maxAge && ticket.version === '1.0';
  }

  use0RTTConnection(ticket) {
    // Simulate 0-RTT usage (actual implementation would be browser-level)
    this.metrics.connectionTimes.push({
      type: '0-RTT',
      time: 0, // 0-RTT means no additional round trip
      timestamp: Date.now()
    });

    this.sendTelemetry('0rtt_connection_used', {
      origin: location.origin,
      ticketAge: Date.now() - ticket.timestamp
    });
  }

  initNetworkMonitoring() {
    console.log('📡 Initializing network monitoring...');

    // Monitor network information API
    if ('connection' in navigator) {
      this.updateNetworkState(navigator.connection);

      navigator.connection.addEventListener('change', () => {
        this.updateNetworkState(navigator.connection);
        this.adaptToNetworkChange();
      });
    }

    // Setup RTT monitoring
    this.startRTTMonitoring();

    // Monitor bandwidth changes
    this.startBandwidthMonitoring();
  }

  updateNetworkState(connection) {
    this.networkState = {
      bandwidth: connection.downlink || 0,
      latency: connection.rtt || 0,
      effectiveType: connection.effectiveType,
      saveData: connection.saveData,
      type: connection.type
    };

    console.log('📊 Network state updated:', this.networkState);
  }

  adaptToNetworkChange() {
    const { effectiveType, saveData, bandwidth, latency } = this.networkState;

    // Adjust optimization strategy based on network
    if (saveData) {
      this.enableDataSavingMode();
    } else {
      this.disableDataSavingMode();
    }

    // Adapt connection strategy
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      this.optimizeForSlowNetwork();
    } else if (effectiveType === '4g' || bandwidth > 10) {
      this.optimizeForFastNetwork();
    }

    // Adjust stream priorities
    this.streamManager.adaptToPeriodNetwork(this.networkState);
  }

  enableDataSavingMode() {
    console.log('💾 Enabling data saving mode...');

    // Reduce image quality
    this.compressionEngine.setImageQuality(0.7);

    // Disable prefetching
    this.disablePrefetching = true;

    // Use more aggressive compression
    this.compressionEngine.setCompressionLevel('maximum');
  }

  disableDataSavingMode() {
    console.log('📈 Disabling data saving mode...');

    // Restore normal image quality
    this.compressionEngine.setImageQuality(0.9);

    // Enable prefetching
    this.disablePrefetching = false;

    // Use balanced compression
    this.compressionEngine.setCompressionLevel('balanced');
  }

  optimizeForSlowNetwork() {
    console.log('🐌 Optimizing for slow network...');

    // Reduce concurrent connections
    this.connectionPool.setMaxConnections(2);

    // Prioritize critical resources
    this.streamManager.enableCriticalOnlyMode();

    // Use maximum compression
    this.compressionEngine.setCompressionLevel('maximum');

    // Disable non-essential features
    this.disableNonEssentialFeatures();
  }

  optimizeForFastNetwork() {
    console.log('🚀 Optimizing for fast network...');

    // Increase concurrent connections
    this.connectionPool.setMaxConnections(8);

    // Enable aggressive prefetching
    this.enableAggressivePrefetching();

    // Use balanced compression for speed
    this.compressionEngine.setCompressionLevel('balanced');

    // Enable all features
    this.enableAllFeatures();
  }

  startRTTMonitoring() {
    // Measure RTT using performance timing
    setInterval(() => {
      this.measureRTT();
    }, 5000);
  }

  async measureRTT() {
    const start = performance.now();

    try {
      // Use a small request to measure RTT
      await fetch(`${location.origin}/favicon.ico?t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-cache'
      });

      const rtt = performance.now() - start;
      this.networkState.latency = rtt;

      // Store RTT measurement
      this.metrics.rttMeasurements = this.metrics.rttMeasurements || [];
      this.metrics.rttMeasurements.push({
        rtt,
        timestamp: Date.now()
      });

      // Keep only last 20 measurements
      if (this.metrics.rttMeasurements.length > 20) {
        this.metrics.rttMeasurements.shift();
      }

    } catch (error) {
      console.warn('RTT measurement failed:', error);
    }
  }

  startBandwidthMonitoring() {
    // Monitor transfer rates to estimate bandwidth
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.transferSize > 0 && entry.duration > 0) {
          const transferRate = (entry.transferSize * 8) / (entry.duration / 1000); // bits per second

          this.metrics.transferRates.push({
            rate: transferRate,
            size: entry.transferSize,
            duration: entry.duration,
            timestamp: Date.now()
          });

          // Keep only recent measurements
          if (this.metrics.transferRates.length > 50) {
            this.metrics.transferRates.shift();
          }

          // Update estimated bandwidth
          this.updateEstimatedBandwidth();
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  updateEstimatedBandwidth() {
    if (this.metrics.transferRates.length < 5) return;

    // Calculate moving average of recent transfer rates
    const recentRates = this.metrics.transferRates.slice(-10);
    const avgRate = recentRates.reduce((sum, r) => sum + r.rate, 0) / recentRates.length;

    // Convert to Mbps
    this.networkState.estimatedBandwidth = avgRate / 1000000;
  }

  configureResourceBundling() {
    console.log('📦 Configuring resource bundling strategies...');

    // Different strategies based on protocol
    if (this.protocolSupport.http3) {
      this.configureHTTP3Bundling();
    } else if (this.protocolSupport.http2) {
      this.configureHTTP2Bundling();
    } else {
      this.configureHTTP1Bundling();
    }
  }

  configureHTTP3Bundling() {
    // HTTP/3 allows for more granular resource loading due to better multiplexing
    this.bundlingStrategy = {
      css: 'split', // Multiple small CSS files work well with HTTP/3
      js: 'split',  // Same for JavaScript
      images: 'individual', // Load images individually
      fonts: 'bundled' // Still bundle fonts for efficiency
    };

    console.log('📦 Configured HTTP/3 bundling strategy');
  }

  configureHTTP2Bundling() {
    // HTTP/2 server push benefits from moderate bundling
    this.bundlingStrategy = {
      css: 'moderate', // Some bundling still beneficial
      js: 'moderate',
      images: 'individual',
      fonts: 'bundled'
    };

    console.log('📦 Configured HTTP/2 bundling strategy');
  }

  configureHTTP1Bundling() {
    // HTTP/1.1 requires aggressive bundling due to connection limits
    this.bundlingStrategy = {
      css: 'aggressive',
      js: 'aggressive',
      images: 'sprited', // Use image sprites
      fonts: 'bundled'
    };

    console.log('📦 Configured HTTP/1.1 bundling strategy');
  }

  async initCompressionEngines() {
    console.log('🗜️ Initializing compression engines...');

    // Initialize compression based on protocol support
    await this.compressionEngine.init({
      protocol: this.getOptimalProtocol(),
      networkSpeed: this.networkState.effectiveType,
      supportsBrotli: this.supportsBrotliCompression(),
      supportsZstd: this.supportsZstdCompression()
    });
  }

  getOptimalProtocol() {
    if (this.protocolSupport.http3) return 'http3';
    if (this.protocolSupport.http2) return 'http2';
    return 'http1';
  }

  supportsBrotliCompression() {
    // Check if browser supports Brotli
    return 'CompressionStream' in window ||
           navigator.userAgent.includes('Chrome') ||
           navigator.userAgent.includes('Firefox');
  }

  supportsZstdCompression() {
    // Check for Zstandard support (experimental)
    return 'CompressionStream' in window &&
           window.CompressionStream.prototype.constructor.name === 'CompressionStream';
  }

  initConnectionMigration() {
    if (!this.protocolSupport.http3) return;

    console.log('🔄 Initializing connection migration...');

    // Monitor network changes for connection migration
    window.addEventListener('online', () => {
      this.handleConnectionMigration('network_restored');
    });

    window.addEventListener('offline', () => {
      this.handleConnectionMigration('network_lost');
    });

    // Monitor visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.handleConnectionMigration('visibility_restored');
      }
    });
  }

  handleConnectionMigration(trigger) {
    console.log(`🔄 Handling connection migration: ${trigger}`);

    switch (trigger) {
      case 'network_restored':
        this.migrateToNewNetwork();
        break;

      case 'network_lost':
        this.pauseConnections();
        break;

      case 'visibility_restored':
        this.resumeConnections();
        break;
    }
  }

  migrateToNewNetwork() {
    // Migrate existing connections to new network path
    this.connectionPool.migrateConnections();

    // Re-measure network characteristics
    this.measureRTT();

    // Update optimization strategy
    this.adaptToNetworkChange();
  }

  pauseConnections() {
    // Pause non-critical requests
    this.connectionPool.pauseNonCritical();
  }

  resumeConnections() {
    // Resume paused connections
    this.connectionPool.resumeAll();

    // Check for any failed requests to retry
    this.retryFailedRequests();
  }

  startOptimizationLoop() {
    // Main optimization loop
    this.optimizationInterval = setInterval(() => {
      this.runProtocolOptimizationCycle();
    }, 3000);
  }

  async runProtocolOptimizationCycle() {
    // Analyze current protocol performance
    const performance = await this.analyzeProtocolPerformance();

    // Make optimization decisions
    const optimizations = this.makeProtocolOptimizations(performance);

    // Execute optimizations
    await this.executeProtocolOptimizations(optimizations);

    // Update metrics
    this.updateProtocolMetrics(performance, optimizations);
  }

  async analyzeProtocolPerformance() {
    const analysis = {
      connectionEfficiency: this.calculateConnectionEfficiency(),
      streamUtilization: this.calculateStreamUtilization(),
      compressionRatio: await this.calculateCompressionRatio(),
      latencyImpact: this.calculateLatencyImpact(),
      bandwidthUtilization: this.calculateBandwidthUtilization()
    };

    return analysis;
  }

  calculateConnectionEfficiency() {
    const activeConnections = this.connectionPool.getActiveConnections();
    const utilizedConnections = activeConnections.filter(conn => conn.isUtilized());

    return utilizedConnections.length / Math.max(activeConnections.length, 1);
  }

  calculateStreamUtilization() {
    if (!this.protocolSupport.http2 && !this.protocolSupport.http3) {
      return 1; // HTTP/1.1 doesn't have streams
    }

    const activeStreams = this.streamManager.getActiveStreams();
    const maxStreams = this.protocolSupport.http3 ? 100 : 256; // Typical limits

    return activeStreams.length / maxStreams;
  }

  async calculateCompressionRatio() {
    return await this.compressionEngine.getCompressionRatio();
  }

  calculateLatencyImpact() {
    if (this.metrics.rttMeasurements.length < 2) return 0;

    const recent = this.metrics.rttMeasurements.slice(-5);
    const baseline = this.metrics.rttMeasurements[0].rtt;
    const current = recent.reduce((sum, m) => sum + m.rtt, 0) / recent.length;

    return (current - baseline) / baseline;
  }

  calculateBandwidthUtilization() {
    if (!this.networkState.estimatedBandwidth || !this.networkState.bandwidth) {
      return 0.5; // Unknown, assume 50%
    }

    return Math.min(this.networkState.estimatedBandwidth / this.networkState.bandwidth, 1);
  }

  makeProtocolOptimizations(performance) {
    const optimizations = [];

    // Connection pool optimizations
    if (performance.connectionEfficiency < 0.7) {
      optimizations.push({
        type: 'connection_pool_resize',
        action: 'reduce',
        reason: 'low_efficiency'
      });
    }

    // Stream management optimizations
    if (performance.streamUtilization > 0.8) {
      optimizations.push({
        type: 'stream_prioritization',
        action: 'rebalance',
        reason: 'high_utilization'
      });
    }

    // Compression optimizations
    if (performance.compressionRatio < 0.6) {
      optimizations.push({
        type: 'compression_adjustment',
        action: 'increase_level',
        reason: 'poor_compression'
      });
    }

    // Latency optimizations
    if (performance.latencyImpact > 0.2) {
      optimizations.push({
        type: 'latency_reduction',
        action: 'optimize_requests',
        reason: 'high_latency'
      });
    }

    return optimizations;
  }

  async executeProtocolOptimizations(optimizations) {
    for (const opt of optimizations) {
      try {
        switch (opt.type) {
          case 'connection_pool_resize':
            await this.executeConnectionPoolOptimization(opt);
            break;

          case 'stream_prioritization':
            await this.executeStreamOptimization(opt);
            break;

          case 'compression_adjustment':
            await this.executeCompressionOptimization(opt);
            break;

          case 'latency_reduction':
            await this.executeLatencyOptimization(opt);
            break;
        }
      } catch (error) {
        console.error(`Failed to execute optimization ${opt.type}:`, error);
      }
    }
  }

  async executeConnectionPoolOptimization(opt) {
    switch (opt.action) {
      case 'reduce':
        this.connectionPool.reducePoolSize();
        break;
      case 'increase':
        this.connectionPool.increasePoolSize();
        break;
      case 'rebalance':
        this.connectionPool.rebalanceConnections();
        break;
    }
  }

  async executeStreamOptimization(opt) {
    switch (opt.action) {
      case 'rebalance':
        this.streamManager.rebalancePriorities();
        break;
      case 'close_idle':
        this.streamManager.closeIdleStreams();
        break;
    }
  }

  async executeCompressionOptimization(opt) {
    switch (opt.action) {
      case 'increase_level':
        this.compressionEngine.increaseCompressionLevel();
        break;
      case 'decrease_level':
        this.compressionEngine.decreaseCompressionLevel();
        break;
      case 'change_algorithm':
        this.compressionEngine.switchAlgorithm();
        break;
    }
  }

  async executeLatencyOptimization(opt) {
    switch (opt.action) {
      case 'optimize_requests':
        this.optimizeRequestBatching();
        break;
      case 'enable_prefetch':
        this.enableIntelligentPrefetch();
        break;
    }
  }

  optimizeRequestBatching() {
    // Batch small requests together to reduce RTT impact
    this.connectionPool.enableRequestBatching({
      maxBatchSize: 5,
      maxWaitTime: 50, // 50ms max wait
      minRequestSize: 1024 // Only batch requests smaller than 1KB
    });
  }

  enableIntelligentPrefetch() {
    if (this.disablePrefetching) return;

    // Enable prefetching for high-probability resources
    this.prefetchManager = this.prefetchManager || new IntelligentPrefetchManager();
    this.prefetchManager.enable();
  }

  updateProtocolMetrics(performance, optimizations) {
    // Store performance metrics
    this.metrics.protocolEfficiency.set(Date.now(), {
      ...performance,
      optimizations: optimizations.length,
      protocol: this.getOptimalProtocol()
    });

    // Cleanup old metrics (keep last 100 entries)
    if (this.metrics.protocolEfficiency.size > 100) {
      const oldest = Math.min(...this.metrics.protocolEfficiency.keys());
      this.metrics.protocolEfficiency.delete(oldest);
    }
  }

  // Utility methods
  getEnabledFeatures() {
    return {
      http3: this.protocolSupport.http3,
      http2: this.protocolSupport.http2,
      connectionMigration: this.protocolSupport.http3,
      streamPrioritization: this.protocolSupport.http2 || this.protocolSupport.http3,
      serverPush: this.protocolSupport.http2,
      zeroRTT: this.protocolSupport.http3,
      multiplexing: this.protocolSupport.http2 || this.protocolSupport.http3
    };
  }

  sendTelemetry(event, data) {
    if ('sendBeacon' in navigator) {
      const telemetryData = {
        event,
        data,
        timestamp: Date.now(),
        protocol: this.getOptimalProtocol(),
        networkState: this.networkState
      };

      navigator.sendBeacon('/api/protocol-telemetry', JSON.stringify(telemetryData));
    }
  }

  // Fallback mode for unsupported environments
  initFallbackMode() {
    console.log('🔄 Running in HTTP/1.1 fallback mode');

    // Basic HTTP/1.1 optimizations
    this.enableBasicOptimizations();

    // Simple connection management
    this.initBasicConnectionManagement();
  }

  enableBasicOptimizations() {
    // Domain sharding for HTTP/1.1
    this.enableDomainSharding();

    // Resource combination
    this.enableResourceCombination();

    // Basic compression
    this.enableBasicCompression();
  }

  enableDomainSharding() {
    // Implement domain sharding for parallel downloads
    const shards = ['assets1', 'assets2', 'assets3'];
    let currentShard = 0;

    // Rewrite resource URLs to use different subdomains
    document.querySelectorAll('img[src], link[href], script[src]').forEach(el => {
      const url = el.src || el.href;
      if (url && url.startsWith(location.origin)) {
        const shard = shards[currentShard % shards.length];
        const newUrl = url.replace(location.hostname, `${shard}.${location.hostname}`);

        if (el.src) el.src = newUrl;
        if (el.href) el.href = newUrl;

        currentShard++;
      }
    });
  }

  enableResourceCombination() {
    // Combine small CSS and JS files
    this.combineStylesheets();
    this.combineScripts();
  }

  combineStylesheets() {
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    const smallStylesheets = stylesheets.filter(link => {
      // Combine stylesheets that are likely small
      return !link.href.includes('bootstrap') &&
             !link.href.includes('font') &&
             !link.href.includes('cdn');
    });

    if (smallStylesheets.length > 2) {
      // Create combined stylesheet URL
      const urls = smallStylesheets.map(link => link.href).join(',');
      const combinedUrl = `/api/combine-css?files=${encodeURIComponent(urls)}`;

      // Replace individual stylesheets with combined one
      const combinedLink = document.createElement('link');
      combinedLink.rel = 'stylesheet';
      combinedLink.href = combinedUrl;

      smallStylesheets[0].parentNode.insertBefore(combinedLink, smallStylesheets[0]);
      smallStylesheets.forEach(link => link.remove());
    }
  }

  combineScripts() {
    // Similar logic for JavaScript files
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const smallScripts = scripts.filter(script => {
      return !script.src.includes('jquery') &&
             !script.src.includes('bootstrap') &&
             !script.src.includes('cdn') &&
             script.async !== true && // Don't combine async scripts
             script.defer !== true;   // Don't combine deferred scripts
    });

    if (smallScripts.length > 2) {
      const urls = smallScripts.map(script => script.src).join(',');
      const combinedUrl = `/api/combine-js?files=${encodeURIComponent(urls)}`;

      const combinedScript = document.createElement('script');
      combinedScript.src = combinedUrl;

      smallScripts[0].parentNode.insertBefore(combinedScript, smallScripts[0]);
      smallScripts.forEach(script => script.remove());
    }
  }

  enableBasicCompression() {
    // Enable gzip compression hints
    document.head.insertAdjacentHTML('afterbegin',
      '<meta http-equiv="Accept-Encoding" content="gzip, deflate, br">'
    );
  }

  initBasicConnectionManagement() {
    // Limit concurrent requests for HTTP/1.1
    this.requestQueue = [];
    this.activeRequests = 0;
    this.maxConcurrentRequests = 6; // Typical browser limit

    // Override fetch to add queuing
    this.originalFetch = window.fetch;
    window.fetch = this.queuedFetch.bind(this);
  }

  async queuedFetch(input, init) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        input,
        init,
        resolve,
        reject
      });

      this.processRequestQueue();
    });
  }

  async processRequestQueue() {
    if (this.activeRequests >= this.maxConcurrentRequests || this.requestQueue.length === 0) {
      return;
    }

    const request = this.requestQueue.shift();
    this.activeRequests++;

    try {
      const response = await this.originalFetch(request.input, request.init);
      request.resolve(response);
    } catch (error) {
      request.reject(error);
    } finally {
      this.activeRequests--;
      this.processRequestQueue(); // Process next request
    }
  }
}

// Supporting classes

class AdvancedConnectionPool {
  constructor() {
    this.connections = new Map();
    this.maxConnections = 6;
    this.connectionTimeout = 30000;
  }

  async configureHTTP3() {
    this.maxConnections = 100; // HTTP/3 can handle many more streams
    this.enableMultiplexing = true;
  }

  async configureHTTP2() {
    this.maxConnections = 10; // HTTP/2 multiplexing reduces need for many connections
    this.enableMultiplexing = true;
  }

  async configureHTTP1() {
    this.maxConnections = 6; // Traditional HTTP/1.1 limit
    this.enableMultiplexing = false;
  }

  prewarmConnection(domain) {
    // Prewarm connection by doing a DNS lookup and TCP handshake
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    document.head.appendChild(link);
  }

  setMaxConnections(max) {
    this.maxConnections = max;
  }

  getActiveConnections() {
    return Array.from(this.connections.values()).filter(conn => conn.active);
  }

  reducePoolSize() {
    this.maxConnections = Math.max(2, Math.floor(this.maxConnections * 0.8));
  }

  increasePoolSize() {
    this.maxConnections = Math.min(20, Math.floor(this.maxConnections * 1.2));
  }

  rebalanceConnections() {
    // Close idle connections and redistribute load
    for (const [domain, connection] of this.connections) {
      if (!connection.active && Date.now() - connection.lastUsed > 30000) {
        this.connections.delete(domain);
      }
    }
  }

  migrateConnections() {
    // Mark all connections for migration
    for (const connection of this.connections.values()) {
      connection.needsMigration = true;
    }
  }

  pauseNonCritical() {
    for (const connection of this.connections.values()) {
      if (!connection.critical) {
        connection.paused = true;
      }
    }
  }

  resumeAll() {
    for (const connection of this.connections.values()) {
      connection.paused = false;
    }
  }

  enableRequestBatching(options) {
    this.batchingEnabled = true;
    this.batchOptions = options;
  }
}

class StreamPrioritizationManager {
  constructor() {
    this.streams = new Map();
    this.priorities = {
      critical: 1,
      high: 2,
      normal: 3,
      low: 4
    };
  }

  getActiveStreams() {
    return Array.from(this.streams.values()).filter(stream => stream.active);
  }

  adaptToPeriodNetwork(networkState) {
    if (networkState.effectiveType === 'slow-2g' || networkState.effectiveType === '2g') {
      this.enableCriticalOnlyMode();
    } else {
      this.disableCriticalOnlyMode();
    }
  }

  enableCriticalOnlyMode() {
    // Pause non-critical streams
    for (const stream of this.streams.values()) {
      if (stream.priority > this.priorities.high) {
        stream.paused = true;
      }
    }
  }

  disableCriticalOnlyMode() {
    // Resume all streams
    for (const stream of this.streams.values()) {
      stream.paused = false;
    }
  }

  rebalancePriorities() {
    // Rebalance stream priorities based on current needs
    const activeStreams = this.getActiveStreams();
    activeStreams.sort((a, b) => a.priority - b.priority);

    // Redistribute bandwidth
    activeStreams.forEach((stream, index) => {
      stream.weight = Math.max(1, activeStreams.length - index);
    });
  }

  closeIdleStreams() {
    const now = Date.now();
    for (const [id, stream] of this.streams) {
      if (!stream.active && now - stream.lastActivity > 10000) {
        this.streams.delete(id);
      }
    }
  }
}

class ConnectionMigrationManager {
  constructor() {
    this.migrations = new Map();
  }

  handleMigration(connectionId, newPath) {
    this.migrations.set(connectionId, {
      startTime: Date.now(),
      newPath,
      status: 'migrating'
    });
  }
}

class AdvancedCompressionEngine {
  constructor() {
    this.compressionLevel = 'balanced';
    this.imageQuality = 0.8;
    this.supportedAlgorithms = [];
  }

  async init(options) {
    this.options = options;

    // Detect supported compression algorithms
    if (options.supportsBrotli) {
      this.supportedAlgorithms.push('brotli');
    }

    if (options.supportsZstd) {
      this.supportedAlgorithms.push('zstd');
    }

    this.supportedAlgorithms.push('gzip');
  }

  setCompressionLevel(level) {
    this.compressionLevel = level;
  }

  setImageQuality(quality) {
    this.imageQuality = quality;
  }

  async getCompressionRatio() {
    // Calculate current compression ratio from performance data
    const resources = performance.getEntriesByType('resource');
    let totalOriginal = 0;
    let totalCompressed = 0;

    for (const resource of resources) {
      if (resource.decodedBodySize && resource.transferSize) {
        totalOriginal += resource.decodedBodySize;
        totalCompressed += resource.transferSize;
      }
    }

    return totalOriginal > 0 ? totalCompressed / totalOriginal : 1;
  }

  increaseCompressionLevel() {
    const levels = ['low', 'balanced', 'high', 'maximum'];
    const currentIndex = levels.indexOf(this.compressionLevel);
    if (currentIndex < levels.length - 1) {
      this.compressionLevel = levels[currentIndex + 1];
    }
  }

  decreaseCompressionLevel() {
    const levels = ['low', 'balanced', 'high', 'maximum'];
    const currentIndex = levels.indexOf(this.compressionLevel);
    if (currentIndex > 0) {
      this.compressionLevel = levels[currentIndex - 1];
    }
  }

  switchAlgorithm() {
    // Switch to next available algorithm
    const currentAlg = this.currentAlgorithm || this.supportedAlgorithms[0];
    const currentIndex = this.supportedAlgorithms.indexOf(currentAlg);
    const nextIndex = (currentIndex + 1) % this.supportedAlgorithms.length;
    this.currentAlgorithm = this.supportedAlgorithms[nextIndex];
  }
}

// Initialize the HTTP/3 Protocol Optimizer
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.http3Optimizer = new HTTP3ProtocolOptimizer();
  });
} else {
  window.http3Optimizer = new HTTP3ProtocolOptimizer();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HTTP3ProtocolOptimizer;
}