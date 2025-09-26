/**
 * Predictive Resource Loading System
 * AI-powered resource prediction and intelligent preloading
 *
 * Features:
 * - User behavior pattern recognition
 * - Machine learning-based resource prediction
 * - Adaptive preloading strategies
 * - Network-aware resource prioritization
 * - Intersection Observer optimization
 * - Scroll velocity prediction
 * - Click pattern analysis
 * - Viewport prediction algorithms
 * - Resource dependency mapping
 * - Performance-aware loading decisions
 */

class PredictiveResourceLoader {
  constructor() {
    this.initialized = false;

    // Machine learning models for prediction
    this.models = {
      scrollPattern: new ScrollPatternPredictor(),
      clickPattern: new ClickPatternPredictor(),
      navigationPattern: new NavigationPatternPredictor(),
      resourceDependency: new ResourceDependencyPredictor()
    };

    // User behavior tracking
    this.behaviorData = {
      scrollEvents: [],
      clickEvents: [],
      navigationEvents: [],
      interactionSessions: [],
      resourceAccess: new Map()
    };

    // Performance metrics
    this.metrics = {
      predictionAccuracy: new Map(),
      preloadHitRate: 0,
      wastedPreloads: 0,
      performanceGains: [],
      networkSavings: 0
    };

    // Resource management
    this.resourceQueue = new PriorityQueue();
    this.preloadedResources = new Map();
    this.loadingResources = new Set();

    // Adaptive settings
    this.settings = {
      predictionConfidenceThreshold: 0.7,
      maxConcurrentPreloads: 3,
      maxPreloadSize: 5 * 1024 * 1024, // 5MB
      adaptiveBandwidth: true,
      respectSaveData: true
    };

    // Network context
    this.networkContext = {
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
      saveData: false
    };

    this.init();
  }

  async init() {
    try {
      console.log('🔮 Initializing Predictive Resource Loader...');

      // Initialize behavior tracking
      this.initBehaviorTracking();

      // Setup network monitoring
      this.initNetworkMonitoring();

      // Initialize resource observers
      this.initResourceObservers();

      // Load historical data
      await this.loadHistoricalData();

      // Start prediction engine
      this.startPredictionEngine();

      // Setup performance monitoring
      this.initPerformanceMonitoring();

      this.initialized = true;
      console.log('✅ Predictive Resource Loader initialized');

      this.sendTelemetry('predictor_initialized', {
        features: this.getEnabledFeatures(),
        modelsLoaded: Object.keys(this.models).length
      });

    } catch (error) {
      console.error('❌ Predictive Resource Loader initialization failed:', error);
      this.initFallbackMode();
    }
  }

  initBehaviorTracking() {
    console.log('👁️ Initializing behavior tracking...');

    // Scroll behavior tracking with advanced metrics
    this.initScrollTracking();

    // Click pattern analysis
    this.initClickTracking();

    // Navigation pattern learning
    this.initNavigationTracking();

    // Viewport change detection
    this.initViewportTracking();

    // Focus and attention tracking
    this.initAttentionTracking();
  }

  initScrollTracking() {
    let lastScrollTime = 0;
    let scrollHistory = [];

    const scrollHandler = (event) => {
      const now = Date.now();
      if (now - lastScrollTime < 16) return; // Throttle to ~60fps

      const scrollData = {
        timestamp: now,
        scrollY: window.pageYOffset,
        scrollX: window.pageXOffset,
        windowHeight: window.innerHeight,
        documentHeight: document.documentElement.scrollHeight,
        velocity: 0,
        acceleration: 0,
        direction: 'none'
      };

      // Calculate velocity and acceleration
      if (scrollHistory.length > 0) {
        const prev = scrollHistory[scrollHistory.length - 1];
        const deltaTime = now - prev.timestamp;
        const deltaY = scrollData.scrollY - prev.scrollY;

        scrollData.velocity = deltaY / deltaTime; // pixels per ms
        scrollData.direction = deltaY > 0 ? 'down' : deltaY < 0 ? 'up' : 'none';

        if (scrollHistory.length > 1) {
          const prevVelocity = prev.velocity || 0;
          scrollData.acceleration = (scrollData.velocity - prevVelocity) / deltaTime;
        }
      }

      scrollHistory.push(scrollData);

      // Keep only recent scroll data (last 100 events)
      if (scrollHistory.length > 100) {
        scrollHistory.shift();
      }

      this.behaviorData.scrollEvents = scrollHistory;

      // Predict next viewport position
      this.predictNextViewport(scrollData);

      lastScrollTime = now;
    };

    document.addEventListener('scroll', scrollHandler, { passive: true });

    // Track scroll stop events
    let scrollTimeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.onScrollStop(scrollHistory[scrollHistory.length - 1]);
      }, 150);
    }, { passive: true });
  }

  predictNextViewport(currentScroll) {
    const prediction = this.models.scrollPattern.predict(this.behaviorData.scrollEvents);

    if (prediction.confidence > this.settings.predictionConfidenceThreshold) {
      // Preload resources that will likely enter the predicted viewport
      this.preloadViewportResources(prediction.nextViewport);
    }
  }

  onScrollStop(scrollData) {
    // User stopped scrolling - analyze what they're looking at
    const visibleElements = this.getVisibleElements();
    const dwellTime = Date.now() - scrollData.timestamp;

    // Learn from dwell patterns
    this.models.scrollPattern.learn({
      scrollPosition: scrollData.scrollY,
      visibleElements,
      dwellTime,
      context: this.getCurrentPageContext()
    });
  }

  initClickTracking() {
    document.addEventListener('click', (event) => {
      const clickData = {
        timestamp: Date.now(),
        element: this.getElementInfo(event.target),
        position: { x: event.clientX, y: event.clientY },
        viewportPosition: { x: event.pageX, y: event.pageY },
        scrollPosition: window.pageYOffset,
        context: this.getCurrentPageContext()
      };

      this.behaviorData.clickEvents.push(clickData);

      // Predict next likely clicks
      const prediction = this.models.clickPattern.predict(this.behaviorData.clickEvents);

      if (prediction.confidence > this.settings.predictionConfidenceThreshold) {
        this.preloadClickTargetResources(prediction.likelyTargets);
      }

      // Keep only recent clicks (last 50)
      if (this.behaviorData.clickEvents.length > 50) {
        this.behaviorData.clickEvents.shift();
      }
    });

    // Track hover events for early prediction
    let hoverTimeout;
    document.addEventListener('mouseover', (event) => {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        this.onElementHover(event.target);
      }, 200); // 200ms hover threshold
    });

    document.addEventListener('mouseout', () => {
      clearTimeout(hoverTimeout);
    });
  }

  onElementHover(element) {
    const elementInfo = this.getElementInfo(element);

    // If hovering over a link, preload its target
    if (element.tagName === 'A' && element.href) {
      this.considerPreload(element.href, 'navigation', 0.6);
    }

    // If hovering over an image, consider preloading higher resolution
    if (element.tagName === 'IMG') {
      this.considerImageOptimization(element);
    }
  }

  initNavigationTracking() {
    // Track page navigation patterns
    const navigationData = {
      pageLoads: [],
      referrers: [],
      exitPages: [],
      sessionDuration: Date.now()
    };

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      const now = Date.now();

      if (document.hidden) {
        // Page becoming hidden
        navigationData.exitTime = now;
      } else {
        // Page becoming visible
        navigationData.enterTime = now;

        // Predict what user might do next
        const prediction = this.models.navigationPattern.predict(navigationData);
        if (prediction.confidence > this.settings.predictionConfidenceThreshold) {
          this.preloadNavigationResources(prediction.likelyPages);
        }
      }
    });

    // Track history changes (SPA navigation)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(state, title, url) {
      navigationData.pageLoads.push({
        timestamp: Date.now(),
        url: url || location.href,
        type: 'pushState'
      });
      return originalPushState.apply(this, arguments);
    };

    history.replaceState = function(state, title, url) {
      navigationData.pageLoads.push({
        timestamp: Date.now(),
        url: url || location.href,
        type: 'replaceState'
      });
      return originalReplaceState.apply(this, arguments);
    };

    // Track page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        navigationData.loadPerformance = {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: this.getFirstPaint(),
          firstContentfulPaint: this.getFirstContentfulPaint()
        };
      }
    });

    this.behaviorData.navigationEvents = navigationData;
  }

  initViewportTracking() {
    // Track viewport changes for responsive resource loading
    let viewportObserver;

    if ('ResizeObserver' in window) {
      viewportObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === document.documentElement) {
            this.onViewportChange(entry.contentRect);
          }
        }
      });

      viewportObserver.observe(document.documentElement);
    }

    // Fallback for older browsers
    window.addEventListener('resize', () => {
      this.onViewportChange({
        width: window.innerWidth,
        height: window.innerHeight
      });
    });
  }

  onViewportChange(viewport) {
    // Predict new resource needs based on viewport change
    const prediction = this.predictViewportResources(viewport);

    if (prediction.resources.length > 0) {
      this.queueResourcePreloads(prediction.resources);
    }
  }

  initAttentionTracking() {
    // Track user attention and engagement
    const attentionData = {
      focusTime: Date.now(),
      idleTime: 0,
      activeTime: 0,
      interactions: 0
    };

    // Track focus/blur
    window.addEventListener('focus', () => {
      attentionData.focusTime = Date.now();
    });

    window.addEventListener('blur', () => {
      const focusDuration = Date.now() - attentionData.focusTime;
      attentionData.activeTime += focusDuration;
    });

    // Track user interactions
    ['click', 'keydown', 'mousemove', 'scroll'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        attentionData.interactions++;
        attentionData.lastInteraction = Date.now();
      }, { passive: true });
    });

    // Check for idle users
    setInterval(() => {
      const timeSinceLastInteraction = Date.now() - (attentionData.lastInteraction || 0);

      if (timeSinceLastInteraction > 30000) { // 30 seconds idle
        this.onUserIdle(attentionData);
      } else {
        this.onUserActive(attentionData);
      }
    }, 10000); // Check every 10 seconds

    this.behaviorData.attention = attentionData;
  }

  onUserIdle(attentionData) {
    // User is idle - reduce resource predictions and preloading
    this.settings.predictionConfidenceThreshold = 0.8; // Higher threshold
    this.settings.maxConcurrentPreloads = 1; // Reduce preloads
  }

  onUserActive(attentionData) {
    // User is active - restore normal prediction settings
    this.settings.predictionConfidenceThreshold = 0.7;
    this.settings.maxConcurrentPreloads = 3;
  }

  initNetworkMonitoring() {
    if ('connection' in navigator) {
      this.updateNetworkContext(navigator.connection);

      navigator.connection.addEventListener('change', () => {
        this.updateNetworkContext(navigator.connection);
        this.adaptToNetworkChange();
      });
    }
  }

  updateNetworkContext(connection) {
    this.networkContext = {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
      type: connection.type
    };

    console.log('📡 Network context updated:', this.networkContext);
  }

  adaptToNetworkChange() {
    const { effectiveType, saveData, downlink } = this.networkContext;

    // Adapt settings based on network conditions
    if (saveData) {
      this.enableDataSavingMode();
    } else if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      this.enableSlowNetworkMode();
    } else if (effectiveType === '4g' || downlink > 10) {
      this.enableFastNetworkMode();
    } else {
      this.enableBalancedMode();
    }
  }

  enableDataSavingMode() {
    console.log('💾 Enabling data saving mode for predictions...');

    this.settings.predictionConfidenceThreshold = 0.9; // Very high confidence only
    this.settings.maxConcurrentPreloads = 1;
    this.settings.maxPreloadSize = 1 * 1024 * 1024; // 1MB limit
  }

  enableSlowNetworkMode() {
    console.log('🐌 Enabling slow network mode for predictions...');

    this.settings.predictionConfidenceThreshold = 0.8;
    this.settings.maxConcurrentPreloads = 1;
    this.settings.maxPreloadSize = 2 * 1024 * 1024; // 2MB limit
  }

  enableFastNetworkMode() {
    console.log('🚀 Enabling fast network mode for predictions...');

    this.settings.predictionConfidenceThreshold = 0.6; // Lower threshold
    this.settings.maxConcurrentPreloads = 5;
    this.settings.maxPreloadSize = 10 * 1024 * 1024; // 10MB limit
  }

  enableBalancedMode() {
    console.log('⚖️ Enabling balanced mode for predictions...');

    this.settings.predictionConfidenceThreshold = 0.7;
    this.settings.maxConcurrentPreloads = 3;
    this.settings.maxPreloadSize = 5 * 1024 * 1024; // 5MB limit
  }

  initResourceObservers() {
    console.log('👀 Initializing resource observers...');

    // Observe images entering viewport
    this.initImageObserver();

    // Observe links for navigation preloading
    this.initLinkObserver();

    // Observe dynamic content loading
    this.initDynamicContentObserver();
  }

  initImageObserver() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.onImageVisible(entry.target, entry.intersectionRatio);
          }
        }
      }, {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: [0, 0.25, 0.5, 0.75, 1.0]
      });

      // Observe all images
      document.querySelectorAll('img').forEach(img => {
        imageObserver.observe(img);
      });

      // Observe new images added dynamically
      const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === 'IMG') {
                imageObserver.observe(node);
              } else {
                node.querySelectorAll('img').forEach(img => {
                  imageObserver.observe(img);
                });
              }
            }
          });
        });
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  onImageVisible(img, intersectionRatio) {
    // Image is becoming visible - consider preloading higher quality version
    if (intersectionRatio > 0.5) {
      this.considerImageUpgrade(img);
    }

    // Track image visibility for learning
    this.trackResourceAccess('image', img.src, {
      intersectionRatio,
      timestamp: Date.now(),
      context: this.getCurrentPageContext()
    });
  }

  initLinkObserver() {
    if ('IntersectionObserver' in window) {
      const linkObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
            this.onLinkVisible(entry.target);
          }
        }
      }, {
        rootMargin: '200px', // Preload links 200px before they become visible
        threshold: 0.1
      });

      // Observe all links
      document.querySelectorAll('a[href]').forEach(link => {
        if (this.shouldObserveLink(link)) {
          linkObserver.observe(link);
        }
      });
    }
  }

  shouldObserveLink(link) {
    // Only observe internal links or important external links
    try {
      const url = new URL(link.href);
      return url.origin === location.origin ||
             this.isImportantExternalLink(url);
    } catch (e) {
      return false;
    }
  }

  isImportantExternalLink(url) {
    // Define important external domains to preload
    const importantDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'cdnjs.cloudflare.com'
    ];

    return importantDomains.includes(url.hostname);
  }

  onLinkVisible(link) {
    // Link is becoming visible - consider preloading its target
    const prediction = this.models.clickPattern.predictLinkClick(link, this.behaviorData.clickEvents);

    if (prediction.confidence > this.settings.predictionConfidenceThreshold) {
      this.considerPreload(link.href, 'navigation', prediction.confidence);
    }
  }

  initDynamicContentObserver() {
    // Observe dynamic content loading patterns
    if ('MutationObserver' in window) {
      const contentObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            this.onContentAdded(mutation.addedNodes);
          }
        }
      });

      contentObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  onContentAdded(addedNodes) {
    addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Check if new content contains resources to preload
        const resources = this.extractResourcesFromElement(node);

        for (const resource of resources) {
          this.considerPreload(resource.url, resource.type, 0.5);
        }
      }
    });
  }

  async loadHistoricalData() {
    try {
      // Load historical behavior data from localStorage
      const stored = localStorage.getItem('predictive_loader_history');
      if (stored) {
        const history = JSON.parse(stored);

        // Train models with historical data
        await this.trainModelsWithHistory(history);

        console.log('📊 Loaded historical behavior data');
      }
    } catch (error) {
      console.warn('Failed to load historical data:', error);
    }
  }

  async trainModelsWithHistory(history) {
    // Train each model with relevant historical data
    if (history.scrollPatterns) {
      await this.models.scrollPattern.train(history.scrollPatterns);
    }

    if (history.clickPatterns) {
      await this.models.clickPattern.train(history.clickPatterns);
    }

    if (history.navigationPatterns) {
      await this.models.navigationPattern.train(history.navigationPatterns);
    }

    if (history.resourceDependencies) {
      await this.models.resourceDependency.train(history.resourceDependencies);
    }
  }

  startPredictionEngine() {
    console.log('🧠 Starting prediction engine...');

    // Main prediction loop
    this.predictionInterval = setInterval(() => {
      this.runPredictionCycle();
    }, 1000); // Run every second

    // Continuous learning
    this.learningInterval = setInterval(() => {
      this.runLearningCycle();
    }, 30000); // Learn every 30 seconds
  }

  async runPredictionCycle() {
    try {
      // Generate predictions from all models
      const predictions = await this.generatePredictions();

      // Combine and prioritize predictions
      const prioritizedPredictions = this.prioritizePredictions(predictions);

      // Execute top predictions
      await this.executePredictions(prioritizedPredictions);

    } catch (error) {
      console.error('Prediction cycle failed:', error);
    }
  }

  async generatePredictions() {
    const predictions = {};

    // Scroll-based predictions
    if (this.behaviorData.scrollEvents.length > 2) {
      predictions.scroll = await this.models.scrollPattern.predict(this.behaviorData.scrollEvents);
    }

    // Click-based predictions
    if (this.behaviorData.clickEvents.length > 1) {
      predictions.click = await this.models.clickPattern.predict(this.behaviorData.clickEvents);
    }

    // Navigation-based predictions
    predictions.navigation = await this.models.navigationPattern.predict(this.behaviorData.navigationEvents);

    // Resource dependency predictions
    predictions.dependencies = await this.models.resourceDependency.predict(this.getCurrentResources());

    return predictions;
  }

  prioritizePredictions(predictions) {
    const prioritized = [];

    // Combine all predictions into a single array
    for (const [type, prediction] of Object.entries(predictions)) {
      if (prediction && prediction.resources) {
        for (const resource of prediction.resources) {
          prioritized.push({
            ...resource,
            type,
            confidence: prediction.confidence,
            priority: this.calculateResourcePriority(resource, prediction)
          });
        }
      }
    }

    // Sort by priority (higher is better)
    return prioritized.sort((a, b) => b.priority - a.priority);
  }

  calculateResourcePriority(resource, prediction) {
    let priority = prediction.confidence;

    // Boost priority based on resource type
    const typeBoosts = {
      'critical': 2.0,
      'navigation': 1.5,
      'image': 1.2,
      'font': 1.1,
      'script': 1.0,
      'style': 1.0
    };

    priority *= (typeBoosts[resource.type] || 1.0);

    // Boost priority based on network conditions
    if (this.networkContext.effectiveType === '4g') {
      priority *= 1.2;
    } else if (this.networkContext.effectiveType === 'slow-2g') {
      priority *= 0.7;
    }

    // Reduce priority if resource is already preloaded
    if (this.preloadedResources.has(resource.url)) {
      priority *= 0.1;
    }

    // Reduce priority if currently loading
    if (this.loadingResources.has(resource.url)) {
      priority *= 0.1;
    }

    return priority;
  }

  async executePredictions(predictions) {
    let executedCount = 0;
    const maxExecutions = this.settings.maxConcurrentPreloads;

    for (const prediction of predictions) {
      if (executedCount >= maxExecutions) break;

      if (prediction.confidence > this.settings.predictionConfidenceThreshold) {
        await this.executeResourcePreload(prediction);
        executedCount++;
      }
    }
  }

  async executeResourcePreload(prediction) {
    try {
      if (this.preloadedResources.has(prediction.url) ||
          this.loadingResources.has(prediction.url)) {
        return; // Already handled
      }

      // Check resource size limits
      const resourceSize = await this.estimateResourceSize(prediction.url);
      if (resourceSize > this.settings.maxPreloadSize) {
        console.warn(`Skipping preload of ${prediction.url}: too large (${resourceSize} bytes)`);
        return;
      }

      this.loadingResources.add(prediction.url);

      const startTime = performance.now();
      const preloadResult = await this.preloadResource(prediction);

      const loadTime = performance.now() - startTime;

      if (preloadResult.success) {
        this.preloadedResources.set(prediction.url, {
          timestamp: Date.now(),
          loadTime,
          size: preloadResult.size,
          prediction
        });

        console.log(`🔮 Preloaded ${prediction.url} (${prediction.confidence.toFixed(2)} confidence)`);

        this.trackSuccessfulPreload(prediction, loadTime);
      } else {
        this.trackFailedPreload(prediction, preloadResult.error);
      }

    } catch (error) {
      console.error(`Failed to preload ${prediction.url}:`, error);
      this.trackFailedPreload(prediction, error);
    } finally {
      this.loadingResources.delete(prediction.url);
    }
  }

  async preloadResource(prediction) {
    try {
      const { url, type } = prediction;

      // Choose preload strategy based on resource type
      switch (type) {
        case 'navigation':
          return await this.preloadPage(url);

        case 'image':
          return await this.preloadImage(url);

        case 'script':
        case 'style':
        case 'font':
          return await this.preloadStaticResource(url, type);

        default:
          return await this.preloadGenericResource(url);
      }

    } catch (error) {
      return { success: false, error };
    }
  }

  async preloadPage(url) {
    // Preload a page by fetching its HTML
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);

    // Also prefetch DNS and preconnect for faster loading
    const preconnectLink = document.createElement('link');
    preconnectLink.rel = 'preconnect';
    preconnectLink.href = new URL(url).origin;
    document.head.appendChild(preconnectLink);

    return { success: true, size: 0 }; // Size unknown for prefetch
  }

  async preloadImage(url) {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          success: true,
          size: this.estimateImageSize(img)
        });
      };

      img.onerror = (error) => {
        resolve({ success: false, error });
      };

      img.src = url;
    });
  }

  async preloadStaticResource(url, type) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;

    // Set appropriate 'as' attribute
    const asMap = {
      'script': 'script',
      'style': 'style',
      'font': 'font'
    };
    link.as = asMap[type] || 'fetch';

    if (type === 'font') {
      link.crossOrigin = 'anonymous';
    }

    document.head.appendChild(link);

    // Try to get actual size
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const size = parseInt(response.headers.get('content-length')) || 0;
      return { success: true, size };
    } catch (error) {
      return { success: true, size: 0 }; // Preload link created successfully
    }
  }

  async preloadGenericResource(url) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);

    return { success: true, size: 0 };
  }

  async estimateResourceSize(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return parseInt(response.headers.get('content-length')) || 0;
    } catch (error) {
      // Fallback size estimates
      const ext = url.split('.').pop().toLowerCase();
      const sizeEstimates = {
        'html': 50 * 1024,
        'css': 100 * 1024,
        'js': 200 * 1024,
        'jpg': 150 * 1024,
        'png': 200 * 1024,
        'webp': 100 * 1024,
        'woff2': 50 * 1024
      };

      return sizeEstimates[ext] || 100 * 1024; // Default 100KB
    }
  }

  estimateImageSize(img) {
    // Rough estimate based on image dimensions
    return (img.width * img.height * 3) / 8; // Assume ~3 bytes per pixel compressed
  }

  runLearningCycle() {
    // Learn from recent behavior and update models
    this.learnFromRecentBehavior();

    // Save behavioral data for future sessions
    this.saveBehavioralData();

    // Update prediction accuracy metrics
    this.updateAccuracyMetrics();
  }

  learnFromRecentBehavior() {
    const recentScrolls = this.behaviorData.scrollEvents.slice(-20);
    const recentClicks = this.behaviorData.clickEvents.slice(-10);

    if (recentScrolls.length > 5) {
      this.models.scrollPattern.learn(recentScrolls);
    }

    if (recentClicks.length > 3) {
      this.models.clickPattern.learn(recentClicks);
    }
  }

  saveBehavioralData() {
    try {
      const dataToSave = {
        scrollPatterns: this.behaviorData.scrollEvents.slice(-100), // Last 100 scroll events
        clickPatterns: this.behaviorData.clickEvents.slice(-50),    // Last 50 clicks
        navigationPatterns: this.behaviorData.navigationEvents,
        resourceAccess: Array.from(this.behaviorData.resourceAccess.entries()).slice(-200), // Last 200 resource accesses
        timestamp: Date.now()
      };

      localStorage.setItem('predictive_loader_history', JSON.stringify(dataToSave));

    } catch (error) {
      console.warn('Failed to save behavioral data:', error);
    }
  }

  updateAccuracyMetrics() {
    // Calculate prediction accuracy based on successful preload usage
    let totalPreloads = this.preloadedResources.size;
    let usedPreloads = 0;

    for (const [url, preloadData] of this.preloadedResources) {
      if (this.wasResourceActuallyUsed(url, preloadData)) {
        usedPreloads++;
      }
    }

    this.metrics.preloadHitRate = totalPreloads > 0 ? usedPreloads / totalPreloads : 0;
    this.metrics.wastedPreloads = totalPreloads - usedPreloads;

    console.log(`📊 Preload hit rate: ${(this.metrics.preloadHitRate * 100).toFixed(1)}%`);
  }

  wasResourceActuallyUsed(url, preloadData) {
    // Check if a preloaded resource was actually used by checking performance entries
    const resources = performance.getEntriesByName(url);

    if (resources.length === 0) return false;

    const lastAccess = resources[resources.length - 1];

    // If the resource was accessed after preloading and came from cache, it was likely used
    return lastAccess.startTime > preloadData.timestamp &&
           lastAccess.transferSize === 0 && // Came from cache
           lastAccess.decodedBodySize > 0;   // But has content
  }

  initPerformanceMonitoring() {
    // Monitor the performance impact of predictions
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.analyzeResourcePerformance(entry);
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  analyzeResourcePerformance(entry) {
    // Check if this resource was preloaded
    const preloadData = this.preloadedResources.get(entry.name);

    if (preloadData) {
      // Calculate performance gain from preloading
      const gain = this.calculatePerformanceGain(entry, preloadData);
      this.metrics.performanceGains.push(gain);

      // Update network savings
      if (gain.saved > 0) {
        this.metrics.networkSavings += gain.saved;
      }
    }
  }

  calculatePerformanceGain(entry, preloadData) {
    // Estimate how much time was saved by preloading
    const actualLoadTime = entry.responseEnd - entry.startTime;
    const estimatedOriginalTime = actualLoadTime + this.networkContext.rtt;

    const saved = Math.max(0, estimatedOriginalTime - actualLoadTime);

    return {
      url: entry.name,
      saved,
      actualTime: actualLoadTime,
      estimatedOriginalTime,
      preloadTime: preloadData.loadTime,
      prediction: preloadData.prediction
    };
  }

  // Utility methods
  getElementInfo(element) {
    return {
      tagName: element.tagName,
      className: element.className,
      id: element.id,
      href: element.href,
      src: element.src,
      text: element.textContent?.substring(0, 100),
      path: this.getElementPath(element)
    };
  }

  getElementPath(element) {
    const path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let selector = element.nodeName.toLowerCase();
      if (element.id) {
        selector += '#' + element.id;
      } else if (element.className) {
        selector += '.' + element.className.split(' ').join('.');
      }
      path.unshift(selector);
      element = element.parentNode;
    }
    return path.join(' > ');
  }

  getCurrentPageContext() {
    return {
      url: location.href,
      title: document.title,
      timestamp: Date.now(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      scroll: {
        x: window.pageXOffset,
        y: window.pageYOffset,
        maxY: document.documentElement.scrollHeight - window.innerHeight
      }
    };
  }

  getVisibleElements() {
    const rect = {
      top: window.pageYOffset,
      left: window.pageXOffset,
      bottom: window.pageYOffset + window.innerHeight,
      right: window.pageXOffset + window.innerWidth
    };

    return Array.from(document.querySelectorAll('*')).filter(el => {
      const elRect = el.getBoundingClientRect();
      return elRect.top < rect.bottom &&
             elRect.bottom > rect.top &&
             elRect.left < rect.right &&
             elRect.right > rect.left;
    }).map(el => this.getElementInfo(el));
  }

  getCurrentResources() {
    return performance.getEntriesByType('resource').map(entry => ({
      url: entry.name,
      type: this.getResourceTypeFromEntry(entry),
      loadTime: entry.responseEnd - entry.startTime,
      size: entry.transferSize,
      cached: entry.transferSize === 0 && entry.decodedBodySize > 0
    }));
  }

  getResourceTypeFromEntry(entry) {
    const url = entry.name;
    const ext = url.split('.').pop().toLowerCase().split('?')[0];

    const typeMap = {
      'html': 'navigation',
      'css': 'style',
      'js': 'script',
      'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image',
      'webp': 'image', 'avif': 'image', 'svg': 'image',
      'woff': 'font', 'woff2': 'font', 'ttf': 'font'
    };

    return typeMap[ext] || 'other';
  }

  extractResourcesFromElement(element) {
    const resources = [];

    // Extract images
    const images = element.tagName === 'IMG' ? [element] : element.querySelectorAll('img');
    images.forEach(img => {
      if (img.src) {
        resources.push({ url: img.src, type: 'image' });
      }
      if (img.dataset.src) { // Lazy loaded images
        resources.push({ url: img.dataset.src, type: 'image' });
      }
    });

    // Extract links
    const links = element.tagName === 'A' ? [element] : element.querySelectorAll('a[href]');
    links.forEach(link => {
      if (this.shouldObserveLink(link)) {
        resources.push({ url: link.href, type: 'navigation' });
      }
    });

    // Extract scripts
    const scripts = element.tagName === 'SCRIPT' ? [element] : element.querySelectorAll('script[src]');
    scripts.forEach(script => {
      resources.push({ url: script.src, type: 'script' });
    });

    // Extract stylesheets
    const styles = element.tagName === 'LINK' && element.rel === 'stylesheet' ? [element] :
                   element.querySelectorAll('link[rel="stylesheet"]');
    styles.forEach(style => {
      resources.push({ url: style.href, type: 'style' });
    });

    return resources;
  }

  considerPreload(url, type, confidence) {
    if (confidence > this.settings.predictionConfidenceThreshold) {
      this.resourceQueue.enqueue({
        url,
        type,
        confidence,
        priority: this.calculateResourcePriority({ url, type }, { confidence }),
        timestamp: Date.now()
      });
    }
  }

  considerImageOptimization(img) {
    // Consider loading higher quality or different format
    const currentSrc = img.src;
    const optimizedSrc = this.generateOptimizedImageSrc(currentSrc);

    if (optimizedSrc && optimizedSrc !== currentSrc) {
      this.considerPreload(optimizedSrc, 'image', 0.8);
    }
  }

  considerImageUpgrade(img) {
    // Consider upgrading to higher resolution when image is visible
    const upgradedSrc = this.generateUpgradedImageSrc(img.src, img);

    if (upgradedSrc && upgradedSrc !== img.src) {
      this.considerPreload(upgradedSrc, 'image', 0.7);
    }
  }

  generateOptimizedImageSrc(src) {
    // Generate WebP or AVIF version of image if supported
    if (this.supportsWebP() && !src.includes('.webp')) {
      return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    return null;
  }

  generateUpgradedImageSrc(src, img) {
    // Generate higher resolution version based on device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    if (dpr > 1 && !src.includes('@2x')) {
      return src.replace(/(\.[^.]+)$/, '@2x$1');
    }
    return null;
  }

  supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  predictViewportResources(viewport) {
    // Predict what resources might be needed for the new viewport size
    const predictions = { resources: [] };

    // Check for responsive images that might need different sizes
    document.querySelectorAll('img[srcset], picture source').forEach(element => {
      const appropriateSrc = this.getAppropriateImageSrc(element, viewport);
      if (appropriateSrc) {
        predictions.resources.push({
          url: appropriateSrc,
          type: 'image',
          confidence: 0.8
        });
      }
    });

    return predictions;
  }

  getAppropriateImageSrc(element, viewport) {
    // Simplified srcset parsing - in practice, this would be more sophisticated
    if (element.srcset) {
      const srcsetEntries = element.srcset.split(',').map(entry => {
        const [src, descriptor] = entry.trim().split(' ');
        return { src, width: parseInt(descriptor) || viewport.width };
      });

      // Find the best match for current viewport
      const bestMatch = srcsetEntries.reduce((best, entry) => {
        if (!best || Math.abs(entry.width - viewport.width) < Math.abs(best.width - viewport.width)) {
          return entry;
        }
        return best;
      }, null);

      return bestMatch?.src;
    }

    return null;
  }

  preloadViewportResources(nextViewport) {
    // Preload resources that will be visible in the predicted next viewport
    const elementsInViewport = this.getElementsInViewport(nextViewport);

    for (const element of elementsInViewport) {
      const resources = this.extractResourcesFromElement(element);
      for (const resource of resources) {
        this.considerPreload(resource.url, resource.type, 0.6);
      }
    }
  }

  getElementsInViewport(viewport) {
    return Array.from(document.querySelectorAll('*')).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.top < viewport.bottom &&
             rect.bottom > viewport.top &&
             rect.left < viewport.right &&
             rect.right > viewport.left;
    });
  }

  preloadClickTargetResources(likelyTargets) {
    for (const target of likelyTargets) {
      if (target.href) {
        this.considerPreload(target.href, 'navigation', target.confidence);
      }
    }
  }

  preloadNavigationResources(likelyPages) {
    for (const page of likelyPages) {
      this.considerPreload(page.url, 'navigation', page.confidence);
    }
  }

  queueResourcePreloads(resources) {
    for (const resource of resources) {
      this.resourceQueue.enqueue(resource);
    }
  }

  trackResourceAccess(type, url, metadata) {
    if (!this.behaviorData.resourceAccess.has(url)) {
      this.behaviorData.resourceAccess.set(url, []);
    }

    const accessList = this.behaviorData.resourceAccess.get(url);
    accessList.push({
      type,
      metadata,
      timestamp: Date.now()
    });

    // Keep only recent accesses
    if (accessList.length > 10) {
      accessList.shift();
    }
  }

  trackSuccessfulPreload(prediction, loadTime) {
    this.metrics.predictionAccuracy.set(prediction.url, {
      success: true,
      prediction,
      loadTime,
      timestamp: Date.now()
    });
  }

  trackFailedPreload(prediction, error) {
    this.metrics.predictionAccuracy.set(prediction.url, {
      success: false,
      prediction,
      error: error.message || error,
      timestamp: Date.now()
    });
  }

  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  }

  // Public API
  getMetrics() {
    return {
      preloadHitRate: this.metrics.preloadHitRate,
      wastedPreloads: this.metrics.wastedPreloads,
      networkSavings: this.metrics.networkSavings,
      totalPreloads: this.preloadedResources.size,
      averagePerformanceGain: this.calculateAveragePerformanceGain(),
      predictionAccuracy: this.calculatePredictionAccuracy()
    };
  }

  calculateAveragePerformanceGain() {
    if (this.metrics.performanceGains.length === 0) return 0;

    const totalSaved = this.metrics.performanceGains.reduce((sum, gain) => sum + gain.saved, 0);
    return totalSaved / this.metrics.performanceGains.length;
  }

  calculatePredictionAccuracy() {
    const accuracyEntries = Array.from(this.metrics.predictionAccuracy.values());
    if (accuracyEntries.length === 0) return 0;

    const successful = accuracyEntries.filter(entry => entry.success).length;
    return successful / accuracyEntries.length;
  }

  getEnabledFeatures() {
    return {
      scrollPrediction: true,
      clickPrediction: true,
      navigationPrediction: true,
      resourceDependencyPrediction: true,
      intersectionObserver: 'IntersectionObserver' in window,
      mutationObserver: 'MutationObserver' in window,
      performanceObserver: 'PerformanceObserver' in window,
      networkInformation: 'connection' in navigator,
      historicalLearning: true,
      adaptiveSettings: true
    };
  }

  sendTelemetry(event, data) {
    if ('sendBeacon' in navigator) {
      const telemetryData = {
        event,
        data,
        timestamp: Date.now(),
        metrics: this.getMetrics(),
        settings: this.settings
      };

      navigator.sendBeacon('/api/prediction-telemetry', JSON.stringify(telemetryData));
    }
  }

  // Fallback mode
  initFallbackMode() {
    console.log('🔄 Running in prediction fallback mode');

    // Simple intersection observer based loading
    if ('IntersectionObserver' in window) {
      this.initBasicLazyLoading();
    }

    // Basic link preloading on hover
    this.initBasicLinkPreloading();
  }

  initBasicLazyLoading() {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imageObserver.unobserve(img);
        }
      });
    }, { rootMargin: '50px' });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  initBasicLinkPreloading() {
    let hoverTimeout;

    document.addEventListener('mouseover', (event) => {
      if (event.target.tagName === 'A' && event.target.href) {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = event.target.href;
          document.head.appendChild(link);
        }, 300);
      }
    });

    document.addEventListener('mouseout', () => {
      clearTimeout(hoverTimeout);
    });
  }
}

// Supporting classes for machine learning models
class ScrollPatternPredictor {
  constructor() {
    this.patterns = [];
    this.model = null;
  }

  async predict(scrollEvents) {
    if (scrollEvents.length < 3) {
      return { confidence: 0, nextViewport: null, resources: [] };
    }

    const recent = scrollEvents.slice(-5);
    const velocityTrend = this.calculateVelocityTrend(recent);
    const directionPattern = this.calculateDirectionPattern(recent);

    // Predict next scroll position
    const lastEvent = recent[recent.length - 1];
    const predictedScrollY = lastEvent.scrollY + (velocityTrend * 1000); // 1 second ahead

    const confidence = Math.min(Math.abs(velocityTrend) / 10, 1);

    return {
      confidence,
      nextViewport: {
        top: predictedScrollY,
        bottom: predictedScrollY + lastEvent.windowHeight
      },
      resources: []
    };
  }

  calculateVelocityTrend(events) {
    if (events.length < 2) return 0;

    let totalVelocity = 0;
    for (let i = 1; i < events.length; i++) {
      totalVelocity += events[i].velocity || 0;
    }

    return totalVelocity / (events.length - 1);
  }

  calculateDirectionPattern(events) {
    const directions = events.map(e => e.direction).filter(d => d !== 'none');
    const downCount = directions.filter(d => d === 'down').length;
    const upCount = directions.filter(d => d === 'up').length;

    return {
      primary: downCount > upCount ? 'down' : 'up',
      consistency: Math.max(downCount, upCount) / directions.length
    };
  }

  async learn(data) {
    this.patterns.push(...data);

    // Keep only recent patterns
    if (this.patterns.length > 1000) {
      this.patterns.splice(0, this.patterns.length - 1000);
    }
  }

  async train(historicalData) {
    this.patterns = historicalData.slice(-1000);
  }
}

class ClickPatternPredictor {
  constructor() {
    this.clickPatterns = [];
    this.elementAffinities = new Map();
  }

  async predict(clickEvents) {
    if (clickEvents.length < 2) {
      return { confidence: 0, likelyTargets: [], resources: [] };
    }

    const recentClicks = clickEvents.slice(-5);
    const likelyTargets = this.predictNextClickTargets(recentClicks);

    return {
      confidence: likelyTargets.length > 0 ? 0.7 : 0,
      likelyTargets,
      resources: []
    };
  }

  predictNextClickTargets(recentClicks) {
    // Simple pattern: look for elements similar to recently clicked ones
    const targets = [];

    for (const click of recentClicks) {
      const similarElements = document.querySelectorAll(
        `${click.element.tagName}${click.element.className ? '.' + click.element.className.replace(' ', '.') : ''}`
      );

      similarElements.forEach(el => {
        if (el !== click.element && this.isElementVisible(el)) {
          targets.push({
            element: el,
            href: el.href,
            confidence: 0.6
          });
        }
      });
    }

    return targets.slice(0, 3); // Top 3 targets
  }

  predictLinkClick(link, clickEvents) {
    // Predict likelihood of clicking a specific link
    const elementInfo = {
      tagName: link.tagName,
      className: link.className,
      text: link.textContent?.substring(0, 50)
    };

    // Check if similar links were clicked recently
    let similarity = 0;
    for (const click of clickEvents.slice(-10)) {
      similarity += this.calculateElementSimilarity(elementInfo, click.element);
    }

    const confidence = Math.min(similarity / 10, 1);

    return { confidence };
  }

  calculateElementSimilarity(element1, element2) {
    let similarity = 0;

    if (element1.tagName === element2.tagName) similarity += 0.3;
    if (element1.className === element2.className) similarity += 0.4;
    if (element1.text && element2.text && element1.text === element2.text) similarity += 0.3;

    return similarity;
  }

  isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 &&
           rect.left >= 0 &&
           rect.bottom <= window.innerHeight &&
           rect.right <= window.innerWidth;
  }

  async learn(data) {
    this.clickPatterns.push(...data);

    if (this.clickPatterns.length > 500) {
      this.clickPatterns.splice(0, this.clickPatterns.length - 500);
    }
  }

  async train(historicalData) {
    this.clickPatterns = historicalData.slice(-500);
  }
}

class NavigationPatternPredictor {
  constructor() {
    this.navigationHistory = [];
    this.pageSequences = new Map();
  }

  async predict(navigationData) {
    const currentUrl = location.href;
    const likelyPages = this.predictNextPages(currentUrl);

    return {
      confidence: likelyPages.length > 0 ? 0.6 : 0,
      likelyPages,
      resources: likelyPages.map(page => ({ url: page.url, type: 'navigation' }))
    };
  }

  predictNextPages(currentUrl) {
    // Look for pages commonly visited after the current page
    const sequences = this.pageSequences.get(currentUrl) || [];

    return sequences
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(seq => ({ url: seq.nextUrl, confidence: Math.min(seq.count / 10, 1) }));
  }

  async learn(data) {
    // Learn navigation sequences
    if (data.pageLoads && data.pageLoads.length > 1) {
      for (let i = 0; i < data.pageLoads.length - 1; i++) {
        const current = data.pageLoads[i];
        const next = data.pageLoads[i + 1];

        if (!this.pageSequences.has(current.url)) {
          this.pageSequences.set(current.url, []);
        }

        const sequences = this.pageSequences.get(current.url);
        const existing = sequences.find(seq => seq.nextUrl === next.url);

        if (existing) {
          existing.count++;
        } else {
          sequences.push({ nextUrl: next.url, count: 1 });
        }
      }
    }
  }

  async train(historicalData) {
    await this.learn(historicalData);
  }
}

class ResourceDependencyPredictor {
  constructor() {
    this.dependencies = new Map();
  }

  async predict(currentResources) {
    const predictions = [];

    for (const resource of currentResources) {
      const deps = this.dependencies.get(resource.url) || [];

      for (const dep of deps) {
        if (!currentResources.some(r => r.url === dep.url)) {
          predictions.push({
            url: dep.url,
            type: dep.type,
            confidence: Math.min(dep.frequency / 10, 1)
          });
        }
      }
    }

    return {
      confidence: predictions.length > 0 ? 0.5 : 0,
      resources: predictions
    };
  }

  async learn(data) {
    // Learn resource dependency patterns
    for (let i = 0; i < data.length - 1; i++) {
      const current = data[i];
      const next = data[i + 1];

      if (!this.dependencies.has(current.url)) {
        this.dependencies.set(current.url, []);
      }

      const deps = this.dependencies.get(current.url);
      const existing = deps.find(dep => dep.url === next.url);

      if (existing) {
        existing.frequency++;
      } else {
        deps.push({
          url: next.url,
          type: next.type,
          frequency: 1
        });
      }
    }
  }

  async train(historicalData) {
    await this.learn(historicalData);
  }
}

// Priority queue for resource management
class PriorityQueue {
  constructor() {
    this.items = [];
  }

  enqueue(item) {
    let added = false;

    for (let i = 0; i < this.items.length; i++) {
      if (item.priority > this.items[i].priority) {
        this.items.splice(i, 0, item);
        added = true;
        break;
      }
    }

    if (!added) {
      this.items.push(item);
    }
  }

  dequeue() {
    return this.items.shift();
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }
}

// Initialize the Predictive Resource Loader
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.predictiveResourceLoader = new PredictiveResourceLoader();
  });
} else {
  window.predictiveResourceLoader = new PredictiveResourceLoader();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PredictiveResourceLoader;
}