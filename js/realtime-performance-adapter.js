/**
 * Real-time Performance Adaptation System
 * Dynamic performance optimization with instant response to changing conditions
 *
 * Features:
 * - Real-time performance monitoring with WebVitals
 * - Adaptive resource management based on device capabilities
 * - Network condition adaptation with instant response
 * - Battery and thermal throttling awareness
 * - Memory pressure detection and optimization
 * - Frame rate optimization for smooth interactions
 * - Automatic quality scaling for images and media
 * - Progressive enhancement/degradation
 * - Real-time user experience optimization
 * - Performance budget enforcement
 */

class RealtimePerformanceAdapter {
  constructor() {
    this.initialized = false;

    // Performance monitoring
    this.vitals = new WebVitalsMonitor();
    this.frameMonitor = new FrameRateMonitor();
    this.memoryMonitor = new MemoryPressureMonitor();
    this.thermalMonitor = new ThermalStateMonitor();

    // Adaptation strategies
    this.adaptationStrategies = new Map();
    this.activeAdaptations = new Set();

    // Performance budgets and thresholds
    this.budgets = {
      fcp: 1800,          // First Contentful Paint (ms)
      lcp: 2500,          // Largest Contentful Paint (ms)
      fid: 100,           // First Input Delay (ms)
      cls: 0.1,           // Cumulative Layout Shift
      ttfb: 600,          // Time to First Byte (ms)
      frameRate: 30,      // Target frame rate (fps)
      memoryUsage: 0.8,   // Memory usage threshold (80%)
      batteryLevel: 0.2   // Low battery threshold (20%)
    };

    // Current performance state
    this.performanceState = {
      level: 'optimal',    // optimal, balanced, economy, emergency
      metrics: new Map(),
      trends: new Map(),
      alerts: []
    };

    // Device capabilities
    this.deviceProfile = {
      cpu: { cores: 4, speed: 'unknown' },
      gpu: { tier: 'unknown', memory: 'unknown' },
      memory: { total: 4, available: 2 },
      network: { type: '4g', bandwidth: 10, rtt: 50 },
      battery: { level: 1.0, charging: false },
      thermal: { state: 'nominal' }
    };

    // Optimization registry
    this.optimizations = new Map();

    this.init();
  }

  async init() {
    try {
      console.log('⚡ Initializing Real-time Performance Adapter...');

      // Detect device capabilities
      await this.detectDeviceCapabilities();

      // Setup performance monitoring
      this.setupPerformanceMonitoring();

      // Initialize adaptation strategies
      this.initializeAdaptationStrategies();

      // Start real-time monitoring loops
      this.startMonitoringLoops();

      // Setup event listeners
      this.setupEventListeners();

      this.initialized = true;
      console.log('✅ Real-time Performance Adapter initialized');

      this.sendTelemetry('adapter_initialized', {
        deviceProfile: this.deviceProfile,
        budgets: this.budgets,
        features: this.getEnabledFeatures()
      });

    } catch (error) {
      console.error('❌ Performance Adapter initialization failed:', error);
      this.initFallbackMode();
    }
  }

  async detectDeviceCapabilities() {
    console.log('🔍 Detecting device capabilities...');

    // CPU detection
    this.deviceProfile.cpu.cores = navigator.hardwareConcurrency || 4;

    // Memory detection
    if ('deviceMemory' in navigator) {
      this.deviceProfile.memory.total = navigator.deviceMemory;
      this.deviceProfile.memory.available = navigator.deviceMemory * 0.7; // Estimate 70% available
    }

    // GPU detection
    await this.detectGPUCapabilities();

    // Network detection
    if ('connection' in navigator) {
      const conn = navigator.connection;
      this.deviceProfile.network = {
        type: conn.effectiveType,
        bandwidth: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData
      };
    }

    // Battery detection
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        this.deviceProfile.battery = {
          level: battery.level,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime
        };

        // Monitor battery changes
        battery.addEventListener('levelchange', () => {
          this.deviceProfile.battery.level = battery.level;
          this.adaptToBatteryLevel(battery.level);
        });

        battery.addEventListener('chargingchange', () => {
          this.deviceProfile.battery.charging = battery.charging;
          this.adaptToChargingState(battery.charging);
        });

      } catch (error) {
        console.warn('Battery API not accessible:', error);
      }
    }

    // Thermal state detection (experimental)
    await this.detectThermalCapabilities();

    console.log('📊 Device capabilities detected:', this.deviceProfile);
  }

  async detectGPUCapabilities() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);

          this.deviceProfile.gpu = {
            renderer,
            vendor,
            tier: this.classifyGPUTier(renderer),
            memory: gl.getParameter(gl.MAX_TEXTURE_SIZE)
          };
        }
      }
    } catch (error) {
      console.warn('GPU detection failed:', error);
    }
  }

  classifyGPUTier(renderer) {
    const renderer_lower = renderer.toLowerCase();

    // High-end GPUs
    if (renderer_lower.includes('rtx') ||
        renderer_lower.includes('gtx 1080') ||
        renderer_lower.includes('gtx 1070') ||
        renderer_lower.includes('radeon rx')) {
      return 'high';
    }

    // Mid-range GPUs
    if (renderer_lower.includes('gtx') ||
        renderer_lower.includes('radeon') ||
        renderer_lower.includes('iris')) {
      return 'medium';
    }

    // Low-end/integrated GPUs
    return 'low';
  }

  async detectThermalCapabilities() {
    // Experimental thermal state detection
    if ('thermal' in navigator) {
      try {
        const thermal = navigator.thermal;
        this.deviceProfile.thermal.state = thermal.state;

        thermal.addEventListener('statechange', () => {
          this.deviceProfile.thermal.state = thermal.state;
          this.adaptToThermalState(thermal.state);
        });
      } catch (error) {
        console.warn('Thermal API not available:', error);
      }
    }
  }

  setupPerformanceMonitoring() {
    console.log('📊 Setting up performance monitoring...');

    // Initialize Web Vitals monitoring
    this.vitals.init((metric) => {
      this.handleWebVital(metric);
    });

    // Initialize frame rate monitoring
    this.frameMonitor.init((fps) => {
      this.handleFrameRate(fps);
    });

    // Initialize memory monitoring
    this.memoryMonitor.init((memoryInfo) => {
      this.handleMemoryPressure(memoryInfo);
    });

    // Setup performance observer
    this.setupPerformanceObserver();
  }

  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      // Measure resource timing
      const resourceObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          this.analyzeResourcePerformance(entry);
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });

      // Measure long tasks
      const longTaskObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          this.handleLongTask(entry);
        }
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long task observer not supported');
      }

      // Measure user interactions
      const eventObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          this.handleUserInteraction(entry);
        }
      });

      try {
        eventObserver.observe({ entryTypes: ['event'] });
      } catch (e) {
        console.warn('Event observer not supported');
      }
    }
  }

  initializeAdaptationStrategies() {
    console.log('🎯 Initializing adaptation strategies...');

    // Image quality adaptation
    this.adaptationStrategies.set('image_quality', {
      trigger: (state) => state.network.bandwidth < 5 || state.memory.pressure > 0.7,
      execute: () => this.adaptImageQuality(),
      revert: () => this.revertImageQuality(),
      priority: 'high',
      impact: 'medium'
    });

    // Animation complexity reduction
    this.adaptationStrategies.set('animation_complexity', {
      trigger: (state) => state.fps < 24 || state.cpu.usage > 0.8,
      execute: () => this.reduceAnimationComplexity(),
      revert: () => this.restoreAnimationComplexity(),
      priority: 'medium',
      impact: 'low'
    });

    // JavaScript execution optimization
    this.adaptationStrategies.set('js_optimization', {
      trigger: (state) => state.mainThreadBlocked > 0.3 || state.longTasks > 5,
      execute: () => this.optimizeJavaScriptExecution(),
      revert: () => this.revertJavaScriptOptimization(),
      priority: 'high',
      impact: 'high'
    });

    // Resource loading adaptation
    this.adaptationStrategies.set('resource_loading', {
      trigger: (state) => state.network.rtt > 200 || state.network.bandwidth < 2,
      execute: () => this.adaptResourceLoading(),
      revert: () => this.revertResourceLoading(),
      priority: 'high',
      impact: 'medium'
    });

    // Rendering optimization
    this.adaptationStrategies.set('rendering_optimization', {
      trigger: (state) => state.gpu.pressure > 0.8 || state.fps < 20,
      execute: () => this.optimizeRendering(),
      revert: () => this.revertRenderingOptimization(),
      priority: 'medium',
      impact: 'medium'
    });

    // Memory optimization
    this.adaptationStrategies.set('memory_optimization', {
      trigger: (state) => state.memory.pressure > 0.8,
      execute: () => this.optimizeMemoryUsage(),
      revert: () => this.revertMemoryOptimization(),
      priority: 'critical',
      impact: 'high'
    });

    // Battery optimization
    this.adaptationStrategies.set('battery_optimization', {
      trigger: (state) => state.battery.level < 0.2 && !state.battery.charging,
      execute: () => this.enableBatterySavingMode(),
      revert: () => this.disableBatterySavingMode(),
      priority: 'high',
      impact: 'medium'
    });

    // Thermal throttling
    this.adaptationStrategies.set('thermal_throttling', {
      trigger: (state) => state.thermal.state === 'serious' || state.thermal.state === 'critical',
      execute: () => this.enableThermalThrottling(),
      revert: () => this.disableThermalThrottling(),
      priority: 'critical',
      impact: 'high'
    });

    console.log(`🎯 ${this.adaptationStrategies.size} adaptation strategies initialized`);
  }

  startMonitoringLoops() {
    console.log('🔄 Starting monitoring loops...');

    // Main performance monitoring loop (every 100ms)
    this.mainMonitoringLoop = setInterval(() => {
      this.runPerformanceCheck();
    }, 100);

    // Adaptation decision loop (every 500ms)
    this.adaptationLoop = setInterval(() => {
      this.runAdaptationDecisions();
    }, 500);

    // Performance budget enforcement (every 1s)
    this.budgetEnforcementLoop = setInterval(() => {
      this.enforceBudgets();
    }, 1000);

    // Device state monitoring (every 2s)
    this.deviceMonitoringLoop = setInterval(() => {
      this.updateDeviceState();
    }, 2000);
  }

  setupEventListeners() {
    // Network change detection
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        this.handleNetworkChange();
      });
    }

    // Visibility change (page focus/blur)
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });

    // Window resize (affects rendering performance)
    window.addEventListener('resize', () => {
      this.handleViewportChange();
    });

    // User interaction detection
    ['click', 'touchstart', 'keydown', 'scroll'].forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        this.handleUserInteractionEvent(event);
      }, { passive: true, capture: true });
    });
  }

  // Performance monitoring handlers
  handleWebVital(metric) {
    const { name, value, delta } = metric;

    this.performanceState.metrics.set(name, {
      value,
      delta,
      timestamp: Date.now(),
      budget: this.budgets[name],
      exceeds: value > this.budgets[name]
    });

    // Store trend data
    const trend = this.performanceState.trends.get(name) || [];
    trend.push({ value, timestamp: Date.now() });

    // Keep only recent trend data (last 20 measurements)
    if (trend.length > 20) {
      trend.shift();
    }
    this.performanceState.trends.set(name, trend);

    // Immediate adaptation for critical metrics
    if (value > this.budgets[name] * 2) {
      this.triggerEmergencyAdaptation(name, value);
    }

    console.log(`📊 ${name}: ${value.toFixed(2)} (budget: ${this.budgets[name]})`);
  }

  handleFrameRate(fps) {
    this.performanceState.metrics.set('fps', {
      value: fps,
      timestamp: Date.now(),
      budget: this.budgets.frameRate,
      exceeds: fps < this.budgets.frameRate
    });

    // Update performance level based on frame rate
    if (fps < 15) {
      this.updatePerformanceLevel('emergency');
    } else if (fps < 24) {
      this.updatePerformanceLevel('economy');
    } else if (fps < 45) {
      this.updatePerformanceLevel('balanced');
    } else {
      this.updatePerformanceLevel('optimal');
    }
  }

  handleMemoryPressure(memoryInfo) {
    const pressure = memoryInfo.used / memoryInfo.total;

    this.performanceState.metrics.set('memory_pressure', {
      value: pressure,
      timestamp: Date.now(),
      budget: this.budgets.memoryUsage,
      exceeds: pressure > this.budgets.memoryUsage,
      details: memoryInfo
    });

    // Immediate memory optimization if critical
    if (pressure > 0.9) {
      this.triggerEmergencyMemoryCleanup();
    }
  }

  analyzeResourcePerformance(entry) {
    const timing = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ssl: entry.secureConnectionStart > 0 ?
           entry.connectEnd - entry.secureConnectionStart : 0,
      ttfb: entry.responseStart - entry.requestStart,
      download: entry.responseEnd - entry.responseStart,
      total: entry.responseEnd - entry.startTime
    };

    // Check against budgets
    if (timing.ttfb > this.budgets.ttfb) {
      this.addPerformanceAlert('slow_ttfb', {
        resource: entry.name,
        ttfb: timing.ttfb,
        threshold: this.budgets.ttfb
      });
    }

    // Track resource performance
    this.trackResourceTiming(entry.name, timing);
  }

  handleLongTask(entry) {
    const duration = entry.duration;

    this.addPerformanceAlert('long_task', {
      duration,
      startTime: entry.startTime,
      attribution: entry.attribution
    });

    // Increment long task counter
    const current = this.performanceState.metrics.get('long_tasks')?.value || 0;
    this.performanceState.metrics.set('long_tasks', {
      value: current + 1,
      lastDuration: duration,
      timestamp: Date.now()
    });

    // Trigger JavaScript optimization if too many long tasks
    if (current > 10) {
      this.triggerAdaptation('js_optimization');
    }
  }

  handleUserInteraction(entry) {
    const interactionDelay = entry.processingStart - entry.startTime;

    if (interactionDelay > this.budgets.fid) {
      this.addPerformanceAlert('slow_interaction', {
        type: entry.name,
        delay: interactionDelay,
        threshold: this.budgets.fid
      });
    }

    // Track interaction responsiveness
    this.trackInteractionTiming(entry.name, interactionDelay);
  }

  // Main monitoring and adaptation logic
  runPerformanceCheck() {
    try {
      // Update current performance metrics
      this.updatePerformanceMetrics();

      // Check for performance degradation
      this.checkPerformanceDegradation();

      // Update performance level
      this.updateOverallPerformanceLevel();

    } catch (error) {
      console.error('Performance check failed:', error);
    }
  }

  updatePerformanceMetrics() {
    // Update frame rate
    this.frameMonitor.updateFPS();

    // Update memory pressure
    this.memoryMonitor.updateMemoryPressure();

    // Update network metrics
    if ('connection' in navigator) {
      const conn = navigator.connection;
      this.deviceProfile.network = {
        type: conn.effectiveType,
        bandwidth: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData
      };
    }
  }

  checkPerformanceDegradation() {
    // Check for trending degradation in key metrics
    for (const [metric, trend] of this.performanceState.trends) {
      if (trend.length >= 5) {
        const degradation = this.calculateTrendDegradation(trend);
        if (degradation > 0.2) { // 20% degradation
          this.addPerformanceAlert('performance_degradation', {
            metric,
            degradation,
            trend: trend.slice(-5)
          });
        }
      }
    }
  }

  calculateTrendDegradation(trend) {
    const recent = trend.slice(-3);
    const older = trend.slice(-6, -3);

    if (recent.length < 3 || older.length < 3) return 0;

    const recentAvg = recent.reduce((sum, t) => sum + t.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, t) => sum + t.value, 0) / older.length;

    return olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;
  }

  updateOverallPerformanceLevel() {
    const fps = this.performanceState.metrics.get('fps')?.value || 60;
    const memoryPressure = this.performanceState.metrics.get('memory_pressure')?.value || 0;
    const lcp = this.performanceState.metrics.get('lcp')?.value || 0;
    const batteryLevel = this.deviceProfile.battery.level;

    // Calculate overall performance score
    let score = 100;

    // Frame rate impact
    if (fps < 15) score -= 40;
    else if (fps < 24) score -= 25;
    else if (fps < 30) score -= 15;

    // Memory pressure impact
    if (memoryPressure > 0.9) score -= 30;
    else if (memoryPressure > 0.8) score -= 20;
    else if (memoryPressure > 0.7) score -= 10;

    // LCP impact
    if (lcp > 4000) score -= 20;
    else if (lcp > 2500) score -= 10;

    // Battery impact
    if (batteryLevel < 0.1) score -= 20;
    else if (batteryLevel < 0.2) score -= 10;

    // Determine performance level
    let newLevel;
    if (score >= 80) newLevel = 'optimal';
    else if (score >= 60) newLevel = 'balanced';
    else if (score >= 40) newLevel = 'economy';
    else newLevel = 'emergency';

    if (newLevel !== this.performanceState.level) {
      this.updatePerformanceLevel(newLevel);
    }
  }

  updatePerformanceLevel(newLevel) {
    const oldLevel = this.performanceState.level;
    this.performanceState.level = newLevel;

    console.log(`🎛️ Performance level changed: ${oldLevel} → ${newLevel}`);

    // Trigger adaptations based on new level
    this.adaptToPerformanceLevel(newLevel);

    this.sendTelemetry('performance_level_change', {
      oldLevel,
      newLevel,
      metrics: Object.fromEntries(this.performanceState.metrics),
      deviceState: this.deviceProfile
    });
  }

  runAdaptationDecisions() {
    const currentState = this.getCurrentState();

    for (const [name, strategy] of this.adaptationStrategies) {
      const shouldTrigger = strategy.trigger(currentState);
      const isActive = this.activeAdaptations.has(name);

      if (shouldTrigger && !isActive) {
        this.triggerAdaptation(name);
      } else if (!shouldTrigger && isActive) {
        this.revertAdaptation(name);
      }
    }
  }

  getCurrentState() {
    return {
      level: this.performanceState.level,
      fps: this.performanceState.metrics.get('fps')?.value || 60,
      memory: {
        pressure: this.performanceState.metrics.get('memory_pressure')?.value || 0,
        available: this.deviceProfile.memory.available
      },
      cpu: {
        usage: this.estimateCPUUsage(),
        cores: this.deviceProfile.cpu.cores
      },
      gpu: {
        tier: this.deviceProfile.gpu.tier,
        pressure: this.estimateGPUPressure()
      },
      network: this.deviceProfile.network,
      battery: this.deviceProfile.battery,
      thermal: this.deviceProfile.thermal,
      mainThreadBlocked: this.calculateMainThreadBlocked(),
      longTasks: this.performanceState.metrics.get('long_tasks')?.value || 0
    };
  }

  estimateCPUUsage() {
    // Estimate CPU usage based on frame rate and long tasks
    const fps = this.performanceState.metrics.get('fps')?.value || 60;
    const longTasks = this.performanceState.metrics.get('long_tasks')?.value || 0;

    let usage = 0;

    // Frame rate indicates CPU load
    if (fps < 20) usage += 0.6;
    else if (fps < 30) usage += 0.4;
    else if (fps < 45) usage += 0.2;

    // Long tasks indicate high CPU usage
    usage += Math.min(longTasks * 0.05, 0.4);

    return Math.min(usage, 1.0);
  }

  estimateGPUPressure() {
    // Estimate GPU pressure based on frame rate and GPU tier
    const fps = this.performanceState.metrics.get('fps')?.value || 60;
    const tier = this.deviceProfile.gpu.tier;

    let pressure = 0;

    if (fps < 20) pressure += 0.7;
    else if (fps < 30) pressure += 0.5;
    else if (fps < 45) pressure += 0.3;

    // Adjust based on GPU tier
    if (tier === 'low') pressure *= 1.5;
    else if (tier === 'medium') pressure *= 1.2;

    return Math.min(pressure, 1.0);
  }

  calculateMainThreadBlocked() {
    // Calculate percentage of main thread blocked by long tasks
    const longTasks = this.performanceState.metrics.get('long_tasks')?.value || 0;
    const timeWindow = 5000; // 5 seconds

    return Math.min(longTasks * 50 / timeWindow, 1.0); // Assume 50ms per long task
  }

  // Adaptation strategies implementation
  triggerAdaptation(strategyName) {
    const strategy = this.adaptationStrategies.get(strategyName);
    if (!strategy || this.activeAdaptations.has(strategyName)) return;

    try {
      console.log(`🎯 Triggering adaptation: ${strategyName}`);

      strategy.execute();
      this.activeAdaptations.add(strategyName);

      this.sendTelemetry('adaptation_triggered', {
        strategy: strategyName,
        trigger: strategy.trigger.toString(),
        state: this.getCurrentState()
      });

    } catch (error) {
      console.error(`Failed to trigger adaptation ${strategyName}:`, error);
    }
  }

  revertAdaptation(strategyName) {
    const strategy = this.adaptationStrategies.get(strategyName);
    if (!strategy || !this.activeAdaptations.has(strategyName)) return;

    try {
      console.log(`🔄 Reverting adaptation: ${strategyName}`);

      strategy.revert();
      this.activeAdaptations.delete(strategyName);

      this.sendTelemetry('adaptation_reverted', {
        strategy: strategyName
      });

    } catch (error) {
      console.error(`Failed to revert adaptation ${strategyName}:`, error);
    }
  }

  triggerEmergencyAdaptation(metric, value) {
    console.warn(`🚨 Emergency adaptation triggered for ${metric}: ${value}`);

    // Immediate actions based on metric
    switch (metric) {
      case 'lcp':
        this.emergencyImageOptimization();
        this.emergencyResourcePrioritization();
        break;

      case 'fid':
        this.emergencyJavaScriptOptimization();
        break;

      case 'cls':
        this.emergencyLayoutStabilization();
        break;
    }

    this.addPerformanceAlert('emergency_adaptation', {
      metric,
      value,
      timestamp: Date.now()
    });
  }

  // Specific adaptation implementations
  adaptImageQuality() {
    console.log('🖼️ Adapting image quality...');

    document.querySelectorAll('img').forEach(img => {
      // Reduce image quality by changing sources
      if (img.srcset) {
        // Use lower resolution from srcset
        const srcsetEntries = img.srcset.split(',').map(entry => {
          const [src, descriptor] = entry.trim().split(' ');
          return { src, width: parseInt(descriptor) || 1000 };
        });

        // Select lower resolution
        const lowRes = srcsetEntries.find(entry => entry.width <= 800) ||
                      srcsetEntries[0];
        if (lowRes) {
          img.src = lowRes.src;
        }
      }

      // Add loading optimization
      if (!img.loading) {
        img.loading = 'lazy';
      }

      // Reduce image quality via CSS
      img.style.imageRendering = 'optimizeSpeed';
    });

    this.optimizations.set('image_quality', {
      type: 'image_quality_reduction',
      timestamp: Date.now()
    });
  }

  revertImageQuality() {
    console.log('🖼️ Reverting image quality...');

    document.querySelectorAll('img').forEach(img => {
      img.style.imageRendering = '';

      // Could restore original srcset here if stored
    });

    this.optimizations.delete('image_quality');
  }

  reduceAnimationComplexity() {
    console.log('✨ Reducing animation complexity...');

    // Reduce or disable animations
    const style = document.createElement('style');
    style.id = 'animation-reduction';
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.1s !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.1s !important;
      }

      .complex-animation {
        animation: none !important;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    this.optimizations.set('animation_complexity', {
      type: 'animation_reduction',
      element: style
    });
  }

  restoreAnimationComplexity() {
    console.log('✨ Restoring animation complexity...');

    const style = document.getElementById('animation-reduction');
    if (style) {
      style.remove();
    }

    this.optimizations.delete('animation_complexity');
  }

  optimizeJavaScriptExecution() {
    console.log('⚡ Optimizing JavaScript execution...');

    // Defer non-critical scripts
    document.querySelectorAll('script[src]:not([async]):not([defer])').forEach(script => {
      if (!this.isCriticalScript(script.src)) {
        script.defer = true;
      }
    });

    // Enable time slicing for heavy operations
    this.enableTimeSlicing();

    // Debounce scroll and resize events
    this.optimizeEventHandlers();

    this.optimizations.set('js_optimization', {
      type: 'javascript_optimization',
      timestamp: Date.now()
    });
  }

  isCriticalScript(src) {
    // Define critical scripts that shouldn't be deferred
    const criticalPatterns = [
      'critical.js',
      'inline.js',
      'gtag',
      'analytics'
    ];

    return criticalPatterns.some(pattern => src.includes(pattern));
  }

  enableTimeSlicing() {
    // Implement time slicing for heavy operations
    window.performWorkInChunks = (items, chunkSize = 5, callback) => {
      let index = 0;

      function processChunk() {
        const chunk = items.slice(index, index + chunkSize);
        chunk.forEach(callback);
        index += chunkSize;

        if (index < items.length) {
          setTimeout(processChunk, 0);
        }
      }

      processChunk();
    };
  }

  optimizeEventHandlers() {
    // Replace existing scroll handlers with throttled versions
    if (!window.throttledScrollHandler) {
      let scrollTimeout;
      window.throttledScrollHandler = (handler, delay = 16) => {
        return () => {
          if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
              handler();
              scrollTimeout = null;
            }, delay);
          }
        };
      };

      // Apply to window scroll if needed
      this.originalScrollHandlers = [];
      // Implementation would replace existing handlers
    }
  }

  revertJavaScriptOptimization() {
    console.log('⚡ Reverting JavaScript optimization...');

    // Restore original script loading behavior
    // This would require storing original states

    this.optimizations.delete('js_optimization');
  }

  adaptResourceLoading() {
    console.log('📦 Adapting resource loading...');

    // Delay non-critical resource loading
    document.querySelectorAll('link[rel="stylesheet"]:not(.critical)').forEach(link => {
      if (!this.isCriticalStylesheet(link.href)) {
        link.media = 'print'; // Load with low priority
        link.onload = () => { link.media = 'all'; };
      }
    });

    // Implement progressive JPEG loading
    this.enableProgressiveImageLoading();

    // Reduce prefetch/preload
    document.querySelectorAll('link[rel="prefetch"], link[rel="preload"]').forEach(link => {
      if (!this.isCriticalPreload(link)) {
        link.remove();
      }
    });

    this.optimizations.set('resource_loading', {
      type: 'resource_loading_adaptation',
      timestamp: Date.now()
    });
  }

  isCriticalStylesheet(href) {
    return href.includes('critical.css') || href.includes('inline.css');
  }

  isCriticalPreload(link) {
    return link.href.includes('critical') || link.as === 'font';
  }

  enableProgressiveImageLoading() {
    // Implement progressive loading for large images
    document.querySelectorAll('img').forEach(img => {
      if (img.naturalWidth * img.naturalHeight > 500000) { // Large images
        // Implementation would add progressive loading logic
        img.style.transition = 'opacity 0.3s';
        img.style.opacity = '0.7';
      }
    });
  }

  revertResourceLoading() {
    console.log('📦 Reverting resource loading adaptations...');

    this.optimizations.delete('resource_loading');
  }

  optimizeRendering() {
    console.log('🎨 Optimizing rendering...');

    // Reduce rendering quality
    const style = document.createElement('style');
    style.id = 'rendering-optimization';
    style.textContent = `
      * {
        image-rendering: optimizeSpeed;
        text-rendering: optimizeSpeed;
        shape-rendering: optimizeSpeed;
      }

      .complex-shadow {
        box-shadow: none !important;
        filter: none !important;
      }

      .gradient {
        background: solid color !important;
      }
    `;
    document.head.appendChild(style);

    // Disable hardware acceleration for problematic elements
    document.querySelectorAll('.gpu-intensive').forEach(el => {
      el.style.transform = 'none';
      el.style.willChange = 'auto';
    });

    this.optimizations.set('rendering_optimization', {
      type: 'rendering_optimization',
      element: style
    });
  }

  revertRenderingOptimization() {
    console.log('🎨 Reverting rendering optimization...');

    const style = document.getElementById('rendering-optimization');
    if (style) {
      style.remove();
    }

    this.optimizations.delete('rendering_optimization');
  }

  optimizeMemoryUsage() {
    console.log('💾 Optimizing memory usage...');

    // Clear caches
    this.clearImageCache();
    this.clearDataStructures();

    // Remove unused DOM elements
    this.removeUnusedElements();

    // Garbage collection hints
    if (window.gc) {
      window.gc();
    }

    this.optimizations.set('memory_optimization', {
      type: 'memory_optimization',
      timestamp: Date.now()
    });
  }

  clearImageCache() {
    // Remove images that are not visible
    document.querySelectorAll('img').forEach(img => {
      const rect = img.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight * 2 && rect.bottom > -window.innerHeight;

      if (!isVisible && img.src) {
        img.dataset.originalSrc = img.src;
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      }
    });
  }

  clearDataStructures() {
    // Clear large data structures if they exist
    if (window.largeDataCache) {
      window.largeDataCache.clear();
    }

    // Clear performance entries
    if (performance.clearResourceTimings) {
      performance.clearResourceTimings();
    }
  }

  removeUnusedElements() {
    // Remove elements that are far outside viewport
    document.querySelectorAll('[data-removable]').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -window.innerHeight * 3 || rect.top > window.innerHeight * 3) {
        el.remove();
      }
    });
  }

  revertMemoryOptimization() {
    console.log('💾 Reverting memory optimization...');

    // Restore images
    document.querySelectorAll('img[data-original-src]').forEach(img => {
      img.src = img.dataset.originalSrc;
      delete img.dataset.originalSrc;
    });

    this.optimizations.delete('memory_optimization');
  }

  enableBatterySavingMode() {
    console.log('🔋 Enabling battery saving mode...');

    // Reduce CPU-intensive operations
    this.reduceAnimationComplexity();
    this.optimizeJavaScriptExecution();

    // Reduce network usage
    this.adaptResourceLoading();

    // Reduce screen updates
    this.reduceRefreshRate();

    this.optimizations.set('battery_optimization', {
      type: 'battery_saving_mode',
      timestamp: Date.now()
    });
  }

  reduceRefreshRate() {
    // Reduce requestAnimationFrame frequency
    if (!this.originalRAF) {
      this.originalRAF = window.requestAnimationFrame;
      let frameCount = 0;

      window.requestAnimationFrame = (callback) => {
        return this.originalRAF(() => {
          frameCount++;
          if (frameCount % 2 === 0) { // Reduce to 30fps
            callback();
          }
        });
      };
    }
  }

  disableBatterySavingMode() {
    console.log('🔋 Disabling battery saving mode...');

    // Restore normal operations
    this.restoreAnimationComplexity();
    this.revertJavaScriptOptimization();
    this.revertResourceLoading();

    // Restore normal refresh rate
    if (this.originalRAF) {
      window.requestAnimationFrame = this.originalRAF;
      this.originalRAF = null;
    }

    this.optimizations.delete('battery_optimization');
  }

  enableThermalThrottling() {
    console.log('🌡️ Enabling thermal throttling...');

    // Aggressive performance reduction
    this.reduceAnimationComplexity();
    this.optimizeJavaScriptExecution();
    this.optimizeRendering();
    this.optimizeMemoryUsage();

    // Reduce background tasks
    this.pauseBackgroundTasks();

    this.optimizations.set('thermal_throttling', {
      type: 'thermal_throttling',
      timestamp: Date.now()
    });
  }

  pauseBackgroundTasks() {
    // Pause non-essential timers and intervals
    this.pausedIntervals = [];

    // This would require a registry of background tasks
    // For now, just implement common patterns
    if (window.backgroundTasks) {
      window.backgroundTasks.pause();
    }
  }

  disableThermalThrottling() {
    console.log('🌡️ Disabling thermal throttling...');

    // Restore normal operations
    this.restoreAnimationComplexity();
    this.revertJavaScriptOptimization();
    this.revertRenderingOptimization();
    this.revertMemoryOptimization();

    // Resume background tasks
    this.resumeBackgroundTasks();

    this.optimizations.delete('thermal_throttling');
  }

  resumeBackgroundTasks() {
    if (window.backgroundTasks) {
      window.backgroundTasks.resume();
    }
  }

  // Emergency adaptations
  emergencyImageOptimization() {
    console.warn('🚨 Emergency image optimization...');

    document.querySelectorAll('img').forEach(img => {
      if (img.naturalWidth > 800) {
        img.style.width = Math.min(img.naturalWidth, 800) + 'px';
        img.style.height = 'auto';
      }
    });
  }

  emergencyResourcePrioritization() {
    console.warn('🚨 Emergency resource prioritization...');

    // Cancel all non-critical requests
    document.querySelectorAll('link[rel="prefetch"]').forEach(link => {
      link.remove();
    });

    // Defer non-critical scripts
    document.querySelectorAll('script[src]:not([defer]):not([async])').forEach(script => {
      if (!this.isCriticalScript(script.src)) {
        script.remove();
      }
    });
  }

  emergencyJavaScriptOptimization() {
    console.warn('🚨 Emergency JavaScript optimization...');

    // Cancel all timeouts and intervals except critical ones
    const highestTimeoutId = setTimeout(() => {}, 0);
    clearTimeout(highestTimeoutId);

    for (let i = 1; i < highestTimeoutId; i++) {
      clearTimeout(i);
      clearInterval(i);
    }

    // Force garbage collection
    if (window.gc) {
      window.gc();
    }
  }

  emergencyLayoutStabilization() {
    console.warn('🚨 Emergency layout stabilization...');

    // Set explicit dimensions on elements that might cause layout shift
    document.querySelectorAll('img:not([width]):not([height])').forEach(img => {
      if (img.naturalWidth && img.naturalHeight) {
        img.width = img.naturalWidth;
        img.height = img.naturalHeight;
      }
    });

    // Add layout stabilization CSS
    const style = document.createElement('style');
    style.textContent = `
      * {
        box-sizing: border-box;
      }
      img {
        display: block;
        max-width: 100%;
        height: auto;
      }
    `;
    document.head.appendChild(style);
  }

  triggerEmergencyMemoryCleanup() {
    console.warn('🚨 Emergency memory cleanup...');

    this.optimizeMemoryUsage();

    // Additional aggressive cleanup
    if (window.caches) {
      window.caches.keys().then(keys => {
        keys.forEach(key => {
          if (!key.includes('critical')) {
            caches.delete(key);
          }
        });
      });
    }

    // Clear local storage of non-essential data
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && !key.includes('critical') && !key.includes('settings')) {
        localStorage.removeItem(key);
      }
    }
  }

  // Event handlers
  handleNetworkChange() {
    const conn = navigator.connection;
    const oldNetwork = this.deviceProfile.network;

    this.deviceProfile.network = {
      type: conn.effectiveType,
      bandwidth: conn.downlink,
      rtt: conn.rtt,
      saveData: conn.saveData
    };

    console.log('📡 Network changed:', oldNetwork.type, '→', conn.effectiveType);

    // Immediate adaptation for significant network changes
    if (conn.effectiveType !== oldNetwork.type) {
      this.adaptToNetworkConditions();
    }
  }

  adaptToNetworkConditions() {
    const { type, bandwidth, saveData } = this.deviceProfile.network;

    if (saveData || type === 'slow-2g' || type === '2g') {
      this.triggerAdaptation('resource_loading');
      this.triggerAdaptation('image_quality');
    } else if (type === '4g' || bandwidth > 10) {
      this.revertAdaptation('resource_loading');
      this.revertAdaptation('image_quality');
    }
  }

  handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden - reduce background activity
      this.pauseBackgroundOptimizations();
    } else {
      // Page is visible - resume optimizations
      this.resumeBackgroundOptimizations();
    }
  }

  pauseBackgroundOptimizations() {
    // Pause monitoring loops to save CPU
    if (this.adaptationLoop) {
      clearInterval(this.adaptationLoop);
      this.adaptationLoop = null;
    }
  }

  resumeBackgroundOptimizations() {
    // Resume monitoring loops
    if (!this.adaptationLoop) {
      this.adaptationLoop = setInterval(() => {
        this.runAdaptationDecisions();
      }, 500);
    }
  }

  handleViewportChange() {
    // Viewport changed - might need rendering adjustments
    const newViewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio
    };

    this.adaptToViewportChange(newViewport);
  }

  adaptToViewportChange(viewport) {
    // Adapt based on new viewport characteristics
    if (viewport.width < 768) {
      // Mobile viewport - more aggressive optimizations
      this.triggerAdaptation('image_quality');
      this.triggerAdaptation('animation_complexity');
    } else if (viewport.width > 1920) {
      // Large viewport - might need more resources
      this.revertAdaptation('image_quality');
    }
  }

  handleUserInteractionEvent(event) {
    // Track user interactions for responsiveness
    const interactionStart = performance.now();

    // Measure interaction delay
    requestAnimationFrame(() => {
      const interactionDelay = performance.now() - interactionStart;

      if (interactionDelay > 16) { // More than one frame
        this.addPerformanceAlert('slow_interaction_response', {
          type: event.type,
          delay: interactionDelay
        });
      }
    });
  }

  adaptToPerformanceLevel(level) {
    console.log(`🎛️ Adapting to performance level: ${level}`);

    switch (level) {
      case 'optimal':
        this.revertAllAdaptations();
        break;

      case 'balanced':
        this.triggerAdaptation('animation_complexity');
        break;

      case 'economy':
        this.triggerAdaptation('animation_complexity');
        this.triggerAdaptation('image_quality');
        this.triggerAdaptation('js_optimization');
        break;

      case 'emergency':
        // Trigger all adaptations
        for (const strategyName of this.adaptationStrategies.keys()) {
          this.triggerAdaptation(strategyName);
        }
        break;
    }
  }

  revertAllAdaptations() {
    for (const strategyName of this.activeAdaptations) {
      this.revertAdaptation(strategyName);
    }
  }

  adaptToBatteryLevel(level) {
    if (level < 0.1 && !this.deviceProfile.battery.charging) {
      this.triggerAdaptation('battery_optimization');
      this.updatePerformanceLevel('emergency');
    } else if (level < 0.2 && !this.deviceProfile.battery.charging) {
      this.triggerAdaptation('battery_optimization');
    } else if (level > 0.5 || this.deviceProfile.battery.charging) {
      this.revertAdaptation('battery_optimization');
    }
  }

  adaptToChargingState(charging) {
    if (charging) {
      // Device is charging - can be more aggressive with performance
      this.revertAdaptation('battery_optimization');
    } else {
      // Device is on battery - consider battery level
      this.adaptToBatteryLevel(this.deviceProfile.battery.level);
    }
  }

  adaptToThermalState(state) {
    switch (state) {
      case 'nominal':
        this.revertAdaptation('thermal_throttling');
        break;

      case 'fair':
        // No action needed
        break;

      case 'serious':
      case 'critical':
        this.triggerAdaptation('thermal_throttling');
        this.updatePerformanceLevel('emergency');
        break;
    }
  }

  // Budget enforcement
  enforceBudgets() {
    for (const [metric, config] of this.performanceState.metrics) {
      if (config.budget && config.value > config.budget) {
        this.handleBudgetViolation(metric, config);
      }
    }
  }

  handleBudgetViolation(metric, config) {
    const violation = {
      metric,
      value: config.value,
      budget: config.budget,
      excess: config.value - config.budget,
      timestamp: Date.now()
    };

    this.addPerformanceAlert('budget_violation', violation);

    // Trigger appropriate adaptations
    switch (metric) {
      case 'lcp':
        this.triggerAdaptation('resource_loading');
        this.triggerAdaptation('image_quality');
        break;

      case 'fid':
        this.triggerAdaptation('js_optimization');
        break;

      case 'fps':
        this.triggerAdaptation('animation_complexity');
        this.triggerAdaptation('rendering_optimization');
        break;

      case 'memory_pressure':
        this.triggerAdaptation('memory_optimization');
        break;
    }
  }

  updateDeviceState() {
    // Update battery level
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        this.deviceProfile.battery.level = battery.level;
        this.deviceProfile.battery.charging = battery.charging;
      }).catch(() => {
        // Battery API not available
      });
    }

    // Update memory information
    if ('memory' in performance) {
      const memory = performance.memory;
      this.deviceProfile.memory.used = memory.usedJSHeapSize;
      this.deviceProfile.memory.total = memory.jsHeapSizeLimit;
    }
  }

  // Utility methods
  addPerformanceAlert(type, data) {
    const alert = {
      type,
      data,
      timestamp: Date.now(),
      level: this.getAlertLevel(type)
    };

    this.performanceState.alerts.push(alert);

    // Keep only recent alerts (last 50)
    if (this.performanceState.alerts.length > 50) {
      this.performanceState.alerts.shift();
    }

    console.log(`⚠️ Performance alert [${alert.level}]: ${type}`, data);
  }

  getAlertLevel(type) {
    const levels = {
      'budget_violation': 'warning',
      'slow_ttfb': 'warning',
      'long_task': 'warning',
      'slow_interaction': 'warning',
      'performance_degradation': 'warning',
      'emergency_adaptation': 'critical',
      'slow_interaction_response': 'info'
    };

    return levels[type] || 'info';
  }

  trackResourceTiming(name, timing) {
    // Store resource timing for analysis
    if (!this.resourceTimings) {
      this.resourceTimings = new Map();
    }

    const timings = this.resourceTimings.get(name) || [];
    timings.push({ ...timing, timestamp: Date.now() });

    // Keep only recent timings
    if (timings.length > 20) {
      timings.shift();
    }

    this.resourceTimings.set(name, timings);
  }

  trackInteractionTiming(type, delay) {
    if (!this.interactionTimings) {
      this.interactionTimings = new Map();
    }

    const timings = this.interactionTimings.get(type) || [];
    timings.push({ delay, timestamp: Date.now() });

    if (timings.length > 20) {
      timings.shift();
    }

    this.interactionTimings.set(type, timings);
  }

  // Public API
  getPerformanceState() {
    return {
      level: this.performanceState.level,
      metrics: Object.fromEntries(this.performanceState.metrics),
      alerts: this.performanceState.alerts,
      activeAdaptations: Array.from(this.activeAdaptations),
      deviceProfile: this.deviceProfile
    };
  }

  getMetrics() {
    return {
      performanceLevel: this.performanceState.level,
      fps: this.performanceState.metrics.get('fps')?.value,
      memoryPressure: this.performanceState.metrics.get('memory_pressure')?.value,
      batteryLevel: this.deviceProfile.battery.level,
      networkType: this.deviceProfile.network.type,
      activeAdaptations: this.activeAdaptations.size,
      totalAlerts: this.performanceState.alerts.length,
      budgetViolations: this.performanceState.alerts.filter(a => a.type === 'budget_violation').length
    };
  }

  setBudget(metric, value) {
    this.budgets[metric] = value;
    console.log(`📊 Updated budget for ${metric}: ${value}`);
  }

  forceAdaptation(strategyName) {
    if (this.adaptationStrategies.has(strategyName)) {
      this.triggerAdaptation(strategyName);
      return true;
    }
    return false;
  }

  getEnabledFeatures() {
    return {
      webVitalsMonitoring: true,
      frameRateMonitoring: true,
      memoryMonitoring: 'memory' in performance,
      batteryMonitoring: 'getBattery' in navigator,
      networkMonitoring: 'connection' in navigator,
      thermalMonitoring: 'thermal' in navigator,
      performanceObserver: 'PerformanceObserver' in window,
      adaptiveStrategies: this.adaptationStrategies.size,
      realTimeAdaptation: true
    };
  }

  sendTelemetry(event, data) {
    if ('sendBeacon' in navigator) {
      const telemetryData = {
        event,
        data,
        timestamp: Date.now(),
        performanceState: this.performanceState.level,
        activeAdaptations: Array.from(this.activeAdaptations)
      };

      navigator.sendBeacon('/api/performance-telemetry', JSON.stringify(telemetryData));
    }
  }

  // Fallback mode
  initFallbackMode() {
    console.log('🔄 Running in performance adaptation fallback mode');

    // Basic performance monitoring
    this.initBasicMonitoring();

    // Simple adaptations
    this.initBasicAdaptations();
  }

  initBasicMonitoring() {
    // Basic FPS monitoring
    let frames = 0;
    let lastTime = performance.now();

    const countFrame = () => {
      frames++;
      const now = performance.now();

      if (now - lastTime >= 1000) {
        const fps = Math.round(frames * 1000 / (now - lastTime));
        this.handleFrameRate(fps);

        frames = 0;
        lastTime = now;
      }

      requestAnimationFrame(countFrame);
    };

    requestAnimationFrame(countFrame);
  }

  initBasicAdaptations() {
    // Simple network-based adaptations
    if ('connection' in navigator) {
      const conn = navigator.connection;

      if (conn.saveData || conn.effectiveType === '2g') {
        this.adaptImageQuality();
        this.reduceAnimationComplexity();
      }

      conn.addEventListener('change', () => {
        if (conn.saveData || conn.effectiveType === '2g') {
          this.adaptImageQuality();
          this.reduceAnimationComplexity();
        } else {
          this.revertImageQuality();
          this.restoreAnimationComplexity();
        }
      });
    }
  }
}

// Supporting classes for monitoring
class WebVitalsMonitor {
  init(callback) {
    this.callback = callback;

    // Monitor Web Vitals
    this.observeFCP();
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeTTFB();
  }

  observeFCP() {
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.callback({
            name: 'fcp',
            value: entry.startTime,
            delta: entry.startTime
          });
        }
      }
    }).observe({ entryTypes: ['paint'] });
  }

  observeLCP() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];

      this.callback({
        name: 'lcp',
        value: lastEntry.startTime,
        delta: lastEntry.startTime
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  }

  observeFID() {
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const fid = entry.processingStart - entry.startTime;

        this.callback({
          name: 'fid',
          value: fid,
          delta: fid
        });
      }
    }).observe({ entryTypes: ['first-input'] });
  }

  observeCLS() {
    let clsValue = 0;

    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;

          this.callback({
            name: 'cls',
            value: clsValue,
            delta: entry.value
          });
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }

  observeTTFB() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart;

      this.callback({
        name: 'ttfb',
        value: ttfb,
        delta: ttfb
      });
    }
  }
}

class FrameRateMonitor {
  constructor() {
    this.frames = 0;
    this.lastTime = performance.now();
    this.fps = 60;
  }

  init(callback) {
    this.callback = callback;
    this.startMonitoring();
  }

  startMonitoring() {
    const countFrame = () => {
      this.frames++;
      const now = performance.now();

      if (now - this.lastTime >= 1000) {
        this.fps = Math.round(this.frames * 1000 / (now - this.lastTime));
        this.callback(this.fps);

        this.frames = 0;
        this.lastTime = now;
      }

      requestAnimationFrame(countFrame);
    };

    requestAnimationFrame(countFrame);
  }

  updateFPS() {
    return this.fps;
  }
}

class MemoryPressureMonitor {
  init(callback) {
    this.callback = callback;
    this.startMonitoring();
  }

  startMonitoring() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        const memoryInfo = {
          used: memory.usedJSHeapSize,
          total: memory.jsHeapSizeLimit,
          pressure: memory.usedJSHeapSize / memory.jsHeapSizeLimit
        };

        this.callback(memoryInfo);
      }, 1000);
    }
  }

  updateMemoryPressure() {
    if ('memory' in performance) {
      const memory = performance.memory;
      return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }
    return 0;
  }
}

class ThermalStateMonitor {
  init(callback) {
    this.callback = callback;

    if ('thermal' in navigator) {
      navigator.thermal.addEventListener('statechange', () => {
        this.callback(navigator.thermal.state);
      });
    }
  }
}

// Initialize the Real-time Performance Adapter
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.realtimePerformanceAdapter = new RealtimePerformanceAdapter();
  });
} else {
  window.realtimePerformanceAdapter = new RealtimePerformanceAdapter();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RealtimePerformanceAdapter;
}