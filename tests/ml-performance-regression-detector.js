/**
 * MACHINE LEARNING PERFORMANCE REGRESSION DETECTOR
 * Advanced statistical analysis and ML-based performance regression detection
 * Predictive analytics for performance trends and anomaly detection
 */

import { test, expect } from '@playwright/test';
import { performance } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';

class MLPerformanceRegressionDetector {
  constructor() {
    this.performanceHistory = new Map();
    this.regressionModels = new Map();
    this.anomalyDetectionThreshold = 2.5; // Standard deviations
    this.trendAnalysisWindow = 20; // Number of recent measurements to analyze
    this.seasonalityWindow = 7; // Weekly patterns
    this.learningRate = 0.01;
    this.predictionAccuracy = new Map();
    this.regressionAlerts = [];

    // Feature weights for ML model
    this.featureWeights = {
      firstContentfulPaint: 0.25,
      largestContentfulPaint: 0.30,
      cumulativeLayoutShift: 0.15,
      totalBlockingTime: 0.25,
      speedIndex: 0.05
    };

    // Statistical models for each metric
    this.statisticalModels = {
      trend: new Map(),
      seasonality: new Map(),
      volatility: new Map(),
      baseline: new Map()
    };
  }

  async initializeMLDetector() {
    console.log('🧠 Initializing ML Performance Regression Detector...');

    // Load historical performance data
    await this.loadPerformanceHistory();

    // Initialize statistical models for each URL and metric
    await this.initializeStatisticalModels();

    // Train baseline models
    await this.trainBaselineModels();

    console.log('✅ ML detector initialized successfully');
  }

  async loadPerformanceHistory() {
    try {
      const historyPath = '/home/abhi/projects/tpp/tests/ml-performance-history.json';
      const historyData = await fs.readFile(historyPath, 'utf8');
      const history = JSON.parse(historyData);

      // Convert to Map structure
      Object.entries(history).forEach(([url, measurements]) => {
        if (Array.isArray(measurements) && measurements.length > 0) {
          this.performanceHistory.set(url, measurements);
        }
      });

      console.log(`📚 Loaded ${this.performanceHistory.size} URL histories with ${Array.from(this.performanceHistory.values()).reduce((sum, arr) => sum + arr.length, 0)} total measurements`);

    } catch (error) {
      console.log('📝 No existing ML history found, initializing new dataset');
      this.performanceHistory = new Map();
    }
  }

  async initializeStatisticalModels() {
    for (const [url, measurements] of this.performanceHistory.entries()) {
      if (measurements.length < 10) continue; // Need minimum data for statistical analysis

      // Initialize models for each metric
      const metrics = ['firstContentfulPaint', 'largestContentfulPaint', 'cumulativeLayoutShift', 'totalBlockingTime', 'speedIndex'];

      for (const metric of metrics) {
        const values = measurements.map(m => m.metrics?.[metric]).filter(v => v !== undefined && !isNaN(v));

        if (values.length >= 10) {
          const modelKey = `${url}:${metric}`;

          // Trend analysis
          this.statisticalModels.trend.set(modelKey, this.calculateTrend(values));

          // Seasonality detection
          this.statisticalModels.seasonality.set(modelKey, this.detectSeasonality(values));

          // Volatility analysis
          this.statisticalModels.volatility.set(modelKey, this.calculateVolatility(values));

          // Baseline establishment
          this.statisticalModels.baseline.set(modelKey, this.calculateBaseline(values));
        }
      }
    }

    console.log(`🔬 Initialized statistical models for ${this.statisticalModels.baseline.size} metric series`);
  }

  calculateTrend(values) {
    if (values.length < 5) return { slope: 0, confidence: 0 };

    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    // Linear regression
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared for confidence
    const yMean = sumY / n;
    const totalSumSquares = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const residualSumSquares = y.reduce((sum, yi, i) => {
      const predicted = slope * x[i] + intercept;
      return sum + Math.pow(yi - predicted, 2);
    }, 0);

    const rSquared = 1 - (residualSumSquares / totalSumSquares);

    return {
      slope,
      intercept,
      confidence: Math.max(0, rSquared),
      direction: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
      significance: Math.abs(slope) * Math.sqrt(rSquared)
    };
  }

  detectSeasonality(values) {
    if (values.length < 14) return { hasSeasonality: false, period: 0, strength: 0 };

    // Autocorrelation analysis for seasonality detection
    const autocorrelations = [];
    const maxLag = Math.min(Math.floor(values.length / 2), this.seasonalityWindow);

    for (let lag = 1; lag <= maxLag; lag++) {
      const correlation = this.calculateAutocorrelation(values, lag);
      autocorrelations.push({ lag, correlation });
    }

    // Find the strongest correlation (potential seasonal period)
    const strongestCorr = autocorrelations.reduce((max, curr) =>
      Math.abs(curr.correlation) > Math.abs(max.correlation) ? curr : max
    );

    const hasSeasonality = Math.abs(strongestCorr.correlation) > 0.3;

    return {
      hasSeasonality,
      period: strongestCorr.lag,
      strength: Math.abs(strongestCorr.correlation),
      autocorrelations
    };
  }

  calculateAutocorrelation(values, lag) {
    const n = values.length - lag;
    if (n <= 0) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean);
    }

    for (let i = 0; i < values.length; i++) {
      denominator += Math.pow(values[i] - mean, 2);
    }

    return denominator === 0 ? 0 : numerator / denominator;
  }

  calculateVolatility(values) {
    if (values.length < 3) return { volatility: 0, isVolatile: false };

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    // Calculate coefficient of variation
    const coefficientOfVariation = mean !== 0 ? standardDeviation / mean : 0;

    // Calculate rolling volatility
    const rollingVolatilities = [];
    const windowSize = Math.min(5, Math.floor(values.length / 2));

    for (let i = windowSize; i < values.length; i++) {
      const window = values.slice(i - windowSize, i);
      const windowMean = window.reduce((a, b) => a + b, 0) / window.length;
      const windowVar = window.reduce((sum, val) => sum + Math.pow(val - windowMean, 2), 0) / window.length;
      rollingVolatilities.push(Math.sqrt(windowVar));
    }

    const avgRollingVolatility = rollingVolatilities.length > 0 ?
      rollingVolatilities.reduce((a, b) => a + b, 0) / rollingVolatilities.length : standardDeviation;

    return {
      volatility: standardDeviation,
      coefficientOfVariation,
      avgRollingVolatility,
      isVolatile: coefficientOfVariation > 0.2, // 20% threshold
      volatilityTrend: this.calculateTrend(rollingVolatilities)
    };
  }

  calculateBaseline(values) {
    const sortedValues = [...values].sort((a, b) => a - b);
    const n = sortedValues.length;

    return {
      mean: values.reduce((a, b) => a + b, 0) / n,
      median: n % 2 === 0 ?
        (sortedValues[n/2 - 1] + sortedValues[n/2]) / 2 :
        sortedValues[Math.floor(n/2)],
      p95: sortedValues[Math.floor(n * 0.95)],
      p99: sortedValues[Math.floor(n * 0.99)],
      min: sortedValues[0],
      max: sortedValues[n - 1],
      standardDeviation: Math.sqrt(values.reduce((sum, val) =>
        sum + Math.pow(val - (values.reduce((a, b) => a + b, 0) / n), 2), 0) / n)
    };
  }

  async trainBaselineModels() {
    console.log('🎓 Training baseline ML models...');

    for (const [url, measurements] of this.performanceHistory.entries()) {
      if (measurements.length < 20) continue; // Need sufficient training data

      // Train ensemble model for overall performance prediction
      const trainingData = this.prepareTrainingData(measurements);
      const model = this.trainEnsembleModel(trainingData, url);

      this.regressionModels.set(url, model);

      // Validate model accuracy
      const accuracy = this.validateModelAccuracy(model, trainingData);
      this.predictionAccuracy.set(url, accuracy);
    }

    console.log(`🎯 Trained models for ${this.regressionModels.size} URLs`);
  }

  prepareTrainingData(measurements) {
    return measurements.map((measurement, index) => {
      const features = {
        // Performance metrics
        firstContentfulPaint: measurement.metrics?.firstContentfulPaint || 0,
        largestContentfulPaint: measurement.metrics?.largestContentfulPaint || 0,
        cumulativeLayoutShift: measurement.metrics?.cumulativeLayoutShift || 0,
        totalBlockingTime: measurement.metrics?.totalBlockingTime || 0,
        speedIndex: measurement.metrics?.speedIndex || 0,

        // Temporal features
        timeOfDay: new Date(measurement.timestamp).getHours(),
        dayOfWeek: new Date(measurement.timestamp).getDay(),
        sequenceIndex: index,

        // Environmental features
        buildId: measurement.buildInfo?.buildId || 'unknown',
        branch: measurement.buildInfo?.branch || 'main',

        // Derived features
        totalPageSize: measurement.metrics?.resourceMetrics?.totalTransferSize || 0,
        resourceCount: measurement.metrics?.resourceMetrics?.totalRequests || 0
      };

      // Calculate composite performance score
      const score = this.calculateCompositeScore(features);

      return { features, score, timestamp: measurement.timestamp };
    });
  }

  calculateCompositeScore(features) {
    // Normalize metrics to 0-100 scale (lower is better for most metrics)
    const normalized = {
      fcp: Math.max(0, 100 - (features.firstContentfulPaint / 3000) * 100),
      lcp: Math.max(0, 100 - (features.largestContentfulPaint / 4000) * 100),
      cls: Math.max(0, 100 - (features.cumulativeLayoutShift / 0.25) * 100),
      tbt: Math.max(0, 100 - (features.totalBlockingTime / 600) * 100),
      si: Math.max(0, 100 - (features.speedIndex / 6000) * 100)
    };

    // Weighted composite score
    return (
      normalized.fcp * this.featureWeights.firstContentfulPaint +
      normalized.lcp * this.featureWeights.largestContentfulPaint +
      normalized.cls * this.featureWeights.cumulativeLayoutShift +
      normalized.tbt * this.featureWeights.totalBlockingTime +
      normalized.si * this.featureWeights.speedIndex
    );
  }

  trainEnsembleModel(trainingData, url) {
    if (trainingData.length < 10) return null;

    // Simple ensemble of statistical models
    const models = {
      linear: this.trainLinearModel(trainingData),
      movingAverage: this.trainMovingAverageModel(trainingData),
      exponentialSmoothing: this.trainExponentialSmoothingModel(trainingData)
    };

    // Calculate weights based on model performance
    const weights = this.calculateModelWeights(models, trainingData);

    return {
      models,
      weights,
      metadata: {
        trainedOn: new Date().toISOString(),
        trainingSize: trainingData.length,
        url
      }
    };
  }

  trainLinearModel(data) {
    // Simple linear regression on sequence index
    const x = data.map((_, i) => i);
    const y = data.map(d => d.score);

    const n = data.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { type: 'linear', slope, intercept };
  }

  trainMovingAverageModel(data) {
    const windowSize = Math.min(5, Math.floor(data.length / 4));
    const scores = data.map(d => d.score);

    return {
      type: 'moving_average',
      windowSize,
      recentAverage: scores.slice(-windowSize).reduce((a, b) => a + b, 0) / windowSize
    };
  }

  trainExponentialSmoothingModel(data) {
    const alpha = 0.3; // Smoothing parameter
    const scores = data.map(d => d.score);

    let smoothed = scores[0];
    for (let i = 1; i < scores.length; i++) {
      smoothed = alpha * scores[i] + (1 - alpha) * smoothed;
    }

    return { type: 'exponential_smoothing', alpha, lastSmoothed: smoothed };
  }

  calculateModelWeights(models, trainingData) {
    const errors = {};
    const testSize = Math.min(5, Math.floor(trainingData.length * 0.2));
    const testData = trainingData.slice(-testSize);

    // Calculate prediction errors for each model
    Object.entries(models).forEach(([name, model]) => {
      let totalError = 0;

      testData.forEach((dataPoint, index) => {
        const prediction = this.predict(model, index + trainingData.length - testSize);
        const actual = dataPoint.score;
        totalError += Math.abs(prediction - actual);
      });

      errors[name] = testData.length > 0 ? totalError / testData.length : Infinity;
    });

    // Convert errors to weights (inverse relationship)
    const totalInverseError = Object.values(errors).reduce((sum, error) => sum + (1 / (error + 0.01)), 0);

    const weights = {};
    Object.entries(errors).forEach(([name, error]) => {
      weights[name] = (1 / (error + 0.01)) / totalInverseError;
    });

    return weights;
  }

  predict(model, sequenceIndex) {
    switch (model.type) {
      case 'linear':
        return model.slope * sequenceIndex + model.intercept;

      case 'moving_average':
        return model.recentAverage;

      case 'exponential_smoothing':
        return model.lastSmoothed;

      default:
        return 50; // Default neutral score
    }
  }

  validateModelAccuracy(ensembleModel, trainingData) {
    if (!ensembleModel || trainingData.length < 10) return 0;

    const testSize = Math.min(5, Math.floor(trainingData.length * 0.2));
    const testData = trainingData.slice(-testSize);

    let totalError = 0;
    let totalActual = 0;

    testData.forEach((dataPoint, index) => {
      const prediction = this.ensemblePredict(ensembleModel, index + trainingData.length - testSize);
      const actual = dataPoint.score;

      totalError += Math.abs(prediction - actual);
      totalActual += actual;
    });

    const mape = testData.length > 0 ? (totalError / totalActual) * 100 : 100;
    return Math.max(0, 100 - mape);
  }

  ensemblePredict(ensembleModel, sequenceIndex) {
    const { models, weights } = ensembleModel;

    let weightedPrediction = 0;
    Object.entries(models).forEach(([name, model]) => {
      const prediction = this.predict(model, sequenceIndex);
      weightedPrediction += prediction * weights[name];
    });

    return weightedPrediction;
  }

  async detectPerformanceRegressions(url, currentMetrics, previousMeasurements) {
    console.log(`🔍 Detecting regressions for: ${url}`);

    const regressions = [];

    // Statistical anomaly detection
    const statisticalAnomalies = this.detectStatisticalAnomalies(url, currentMetrics, previousMeasurements);
    regressions.push(...statisticalAnomalies);

    // ML-based regression detection
    const mlRegressions = await this.detectMLRegressions(url, currentMetrics);
    regressions.push(...mlRegressions);

    // Trend-based detection
    const trendRegressions = this.detectTrendRegressions(url, currentMetrics, previousMeasurements);
    regressions.push(...trendRegressions);

    // Store current measurement for future analysis
    await this.storePerformanceMeasurement(url, currentMetrics);

    // Update models with new data
    await this.updateModelsWithNewData(url, currentMetrics);

    return regressions;
  }

  detectStatisticalAnomalies(url, currentMetrics, previousMeasurements) {
    const anomalies = [];
    const metrics = ['firstContentfulPaint', 'largestContentfulPaint', 'cumulativeLayoutShift', 'totalBlockingTime', 'speedIndex'];

    metrics.forEach(metric => {
      const modelKey = `${url}:${metric}`;
      const baseline = this.statisticalModels.baseline.get(modelKey);

      if (baseline && currentMetrics[metric] !== undefined) {
        const currentValue = currentMetrics[metric];
        const zScore = Math.abs((currentValue - baseline.mean) / baseline.standardDeviation);

        if (zScore > this.anomalyDetectionThreshold) {
          const severity = zScore > 4 ? 'critical' : zScore > 3 ? 'high' : 'medium';

          anomalies.push({
            type: 'statistical_anomaly',
            metric,
            current: currentValue,
            baseline: baseline.mean,
            zScore: zScore.toFixed(2),
            severity,
            confidence: Math.min(0.95, zScore / 5),
            message: `${metric} value ${currentValue.toFixed(0)} is ${zScore.toFixed(1)} standard deviations from baseline (${baseline.mean.toFixed(0)})`
          });
        }
      }
    });

    return anomalies;
  }

  async detectMLRegressions(url, currentMetrics) {
    const regressions = [];
    const model = this.regressionModels.get(url);

    if (!model) return regressions;

    // Prepare current data point
    const currentFeatures = {
      firstContentfulPaint: currentMetrics.firstContentfulPaint || 0,
      largestContentfulPaint: currentMetrics.largestContentfulPaint || 0,
      cumulativeLayoutShift: currentMetrics.cumulativeLayoutShift || 0,
      totalBlockingTime: currentMetrics.totalBlockingTime || 0,
      speedIndex: currentMetrics.speedIndex || 0,
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      totalPageSize: currentMetrics.resourceMetrics?.totalTransferSize || 0,
      resourceCount: currentMetrics.resourceMetrics?.totalRequests || 0
    };

    const currentScore = this.calculateCompositeScore(currentFeatures);
    const sequenceIndex = this.performanceHistory.get(url)?.length || 0;
    const predictedScore = this.ensemblePredict(model, sequenceIndex);

    const scoreDifference = predictedScore - currentScore;
    const thresholdDifference = 15; // 15 point difference threshold

    if (scoreDifference > thresholdDifference) {
      const severity = scoreDifference > 30 ? 'critical' : scoreDifference > 20 ? 'high' : 'medium';

      regressions.push({
        type: 'ml_regression',
        metric: 'composite_score',
        current: currentScore.toFixed(1),
        predicted: predictedScore.toFixed(1),
        difference: scoreDifference.toFixed(1),
        severity,
        confidence: this.predictionAccuracy.get(url) || 0.5,
        message: `Performance score ${currentScore.toFixed(1)} significantly below ML prediction ${predictedScore.toFixed(1)} (difference: ${scoreDifference.toFixed(1)} points)`
      });
    }

    return regressions;
  }

  detectTrendRegressions(url, currentMetrics, previousMeasurements) {
    const regressions = [];
    const metrics = ['firstContentfulPaint', 'largestContentfulPaint', 'totalBlockingTime'];

    metrics.forEach(metric => {
      const modelKey = `${url}:${metric}`;
      const trend = this.statisticalModels.trend.get(modelKey);

      if (trend && trend.confidence > 0.7 && currentMetrics[metric] !== undefined) {
        const currentValue = currentMetrics[metric];
        const recentValues = previousMeasurements
          .slice(-5)
          .map(m => m.metrics?.[metric])
          .filter(v => v !== undefined);

        if (recentValues.length >= 3) {
          const recentAverage = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
          const expectedDirection = trend.direction;
          const actualChange = currentValue - recentAverage;

          // Check if current measurement breaks established trend
          const breaksTrend =
            (expectedDirection === 'decreasing' && actualChange > recentAverage * 0.15) ||
            (expectedDirection === 'increasing' && actualChange < -recentAverage * 0.15);

          if (breaksTrend) {
            regressions.push({
              type: 'trend_break',
              metric,
              current: currentValue,
              recentAverage: recentAverage.toFixed(0),
              expectedTrend: expectedDirection,
              actualChange: actualChange.toFixed(0),
              severity: Math.abs(actualChange / recentAverage) > 0.3 ? 'high' : 'medium',
              confidence: trend.confidence,
              message: `${metric} breaks established ${expectedDirection} trend (current: ${currentValue.toFixed(0)}, recent avg: ${recentAverage.toFixed(0)})`
            });
          }
        }
      }
    });

    return regressions;
  }

  async storePerformanceMeasurement(url, metrics) {
    if (!this.performanceHistory.has(url)) {
      this.performanceHistory.set(url, []);
    }

    const history = this.performanceHistory.get(url);
    const measurement = {
      timestamp: Date.now(),
      metrics,
      buildInfo: {
        buildId: process.env.BUILD_ID || Date.now().toString(),
        branch: process.env.BRANCH_NAME || 'main',
        commit: process.env.COMMIT_SHA || 'unknown'
      }
    };

    history.push(measurement);

    // Keep only recent measurements (max 100 per URL)
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    // Save to disk
    await this.savePerformanceHistory();
  }

  async updateModelsWithNewData(url, metrics) {
    const history = this.performanceHistory.get(url);
    if (!history || history.length < 10) return;

    // Retrain models with new data if we have sufficient measurements
    const recentData = history.slice(-50); // Use last 50 measurements for retraining

    if (recentData.length >= 20) {
      const trainingData = this.prepareTrainingData(recentData);
      const newModel = this.trainEnsembleModel(trainingData, url);

      if (newModel) {
        this.regressionModels.set(url, newModel);

        // Update accuracy metrics
        const accuracy = this.validateModelAccuracy(newModel, trainingData);
        this.predictionAccuracy.set(url, accuracy);

        console.log(`🔄 Updated ML model for ${url} (accuracy: ${accuracy.toFixed(1)}%)`);
      }
    }
  }

  async savePerformanceHistory() {
    const historyPath = '/home/abhi/projects/tpp/tests/ml-performance-history.json';
    const historyObject = Object.fromEntries(this.performanceHistory);

    await fs.writeFile(historyPath, JSON.stringify(historyObject, null, 2));
  }

  async generateMLRegressionReport(allRegressions) {
    const reportPath = `/home/abhi/projects/tpp/tests/ml-regression-report-${Date.now()}.json`;

    const summary = {
      totalRegressions: allRegressions.length,
      criticalRegressions: allRegressions.filter(r => r.severity === 'critical').length,
      highRegressions: allRegressions.filter(r => r.severity === 'high').length,
      mediumRegressions: allRegressions.filter(r => r.severity === 'medium').length,
      detectionMethods: {
        statistical: allRegressions.filter(r => r.type === 'statistical_anomaly').length,
        ml_based: allRegressions.filter(r => r.type === 'ml_regression').length,
        trend_based: allRegressions.filter(r => r.type === 'trend_break').length
      },
      modelAccuracies: Object.fromEntries(this.predictionAccuracy),
      averageAccuracy: Array.from(this.predictionAccuracy.values()).reduce((a, b) => a + b, 0) / Math.max(1, this.predictionAccuracy.size)
    };

    const report = {
      timestamp: new Date().toISOString(),
      summary,
      regressions: allRegressions,
      modelStatistics: {
        trainedModels: this.regressionModels.size,
        dataPoints: Array.from(this.performanceHistory.values()).reduce((sum, arr) => sum + arr.length, 0),
        accuracies: Object.fromEntries(this.predictionAccuracy)
      },
      recommendations: this.generateMLRecommendations(allRegressions, summary)
    };

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`🧠 ML regression report saved: ${reportPath}`);

    return report;
  }

  generateMLRecommendations(regressions, summary) {
    const recommendations = [];

    if (summary.criticalRegressions > 0) {
      recommendations.push({
        type: 'critical_regression',
        priority: 'critical',
        description: `${summary.criticalRegressions} critical performance regressions detected by ML analysis`,
        actions: [
          'Investigate recent code changes immediately',
          'Roll back suspicious deployments if possible',
          'Analyze infrastructure changes',
          'Review third-party service dependencies',
          'Implement emergency performance monitoring'
        ]
      });
    }

    if (summary.averageAccuracy < 70) {
      recommendations.push({
        type: 'model_accuracy',
        priority: 'medium',
        description: `ML model accuracy (${summary.averageAccuracy.toFixed(1)}%) below optimal threshold (70%)`,
        actions: [
          'Collect more training data',
          'Review feature selection',
          'Implement additional model types',
          'Improve data quality and preprocessing',
          'Consider external factors affecting performance'
        ]
      });
    }

    const trendBreaks = regressions.filter(r => r.type === 'trend_break').length;
    if (trendBreaks > 2) {
      recommendations.push({
        type: 'trend_instability',
        priority: 'high',
        description: `${trendBreaks} performance metrics showing trend instability`,
        actions: [
          'Investigate environmental changes',
          'Review deployment processes',
          'Analyze traffic pattern changes',
          'Check for intermittent issues',
          'Implement more frequent performance monitoring'
        ]
      });
    }

    return recommendations;
  }
}

// Test Suite Implementation
test.describe('ML Performance Regression Detection Suite', () => {
  let mlDetector;

  test.beforeAll(async () => {
    mlDetector = new MLPerformanceRegressionDetector();
    await mlDetector.initializeMLDetector();
  });

  test('Statistical Anomaly Detection', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Collect current performance metrics
    const currentMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paintEntries = performance.getEntriesByType('paint');
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      const layoutShifts = performance.getEntriesByType('layout-shift');
      const longTasks = performance.getEntriesByType('longtask');

      return {
        firstContentfulPaint: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0,
        cumulativeLayoutShift: layoutShifts.reduce((sum, entry) => sum + entry.value, 0),
        totalBlockingTime: longTasks.reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0),
        speedIndex: navigation ? navigation.loadEventEnd - navigation.navigationStart : 0,
        resourceMetrics: {
          totalRequests: performance.getEntriesByType('resource').length,
          totalTransferSize: performance.getEntriesByType('resource').reduce((sum, r) => sum + (r.transferSize || 0), 0)
        }
      };
    });

    const previousMeasurements = mlDetector.performanceHistory.get('/') || [];
    const regressions = await mlDetector.detectPerformanceRegressions('/', currentMetrics, previousMeasurements);

    // Test should pass if no critical regressions detected
    const criticalRegressions = regressions.filter(r => r.severity === 'critical');
    expect(criticalRegressions.length).toBe(0);

    console.log(`📊 Detected ${regressions.length} performance anomalies (${criticalRegressions.length} critical)`);
  });

  test('ML-Based Regression Detection', async ({ page }) => {
    await page.goto('/services');
    await page.waitForLoadState('networkidle');

    const currentMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paintEntries = performance.getEntriesByType('paint');
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      const layoutShifts = performance.getEntriesByType('layout-shift');

      return {
        firstContentfulPaint: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0,
        cumulativeLayoutShift: layoutShifts.reduce((sum, entry) => sum + entry.value, 0),
        totalBlockingTime: 0,
        speedIndex: navigation ? navigation.loadEventEnd - navigation.navigationStart : 0,
        resourceMetrics: {
          totalRequests: performance.getEntriesByType('resource').length,
          totalTransferSize: 0
        }
      };
    });

    const previousMeasurements = mlDetector.performanceHistory.get('/services') || [];
    const regressions = await mlDetector.detectPerformanceRegressions('/services', currentMetrics, previousMeasurements);

    // Log ML predictions and actual performance
    const model = mlDetector.regressionModels.get('/services');
    if (model) {
      const currentScore = mlDetector.calculateCompositeScore({
        firstContentfulPaint: currentMetrics.firstContentfulPaint,
        largestContentfulPaint: currentMetrics.largestContentfulPaint,
        cumulativeLayoutShift: currentMetrics.cumulativeLayoutShift,
        totalBlockingTime: currentMetrics.totalBlockingTime,
        speedIndex: currentMetrics.speedIndex
      });

      console.log(`🎯 ML Performance Score: ${currentScore.toFixed(1)}`);
      console.log(`🤖 Model Accuracy: ${(mlDetector.predictionAccuracy.get('/services') || 0).toFixed(1)}%`);
    }

    const highConfidenceRegressions = regressions.filter(r => r.confidence > 0.7);
    expect(highConfidenceRegressions.filter(r => r.severity === 'critical').length).toBe(0);
  });

  test('Trend Analysis and Prediction', async ({ page }) => {
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');

    const currentMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        firstContentfulPaint: performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: performance.getEntriesByType('largest-contentful-paint').pop()?.startTime || 0,
        cumulativeLayoutShift: performance.getEntriesByType('layout-shift').reduce((sum, entry) => sum + entry.value, 0),
        totalBlockingTime: performance.getEntriesByType('longtask').reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0),
        speedIndex: navigation ? navigation.loadEventEnd - navigation.navigationStart : 0
      };
    });

    // Analyze trends for portfolio page
    const trendAnalysis = mlDetector.statisticalModels.trend.get('/portfolio:firstContentfulPaint');
    if (trendAnalysis) {
      console.log(`📈 FCP Trend: ${trendAnalysis.direction} (confidence: ${(trendAnalysis.confidence * 100).toFixed(1)}%)`);
      expect(trendAnalysis.confidence).toBeDefined();
    }

    const regressions = await mlDetector.detectPerformanceRegressions('/portfolio', currentMetrics, []);
    const trendBreaks = regressions.filter(r => r.type === 'trend_break');

    // Should not have multiple trend breaks
    expect(trendBreaks.length).toBeLessThan(3);
  });

  test('Model Accuracy Validation', async ({ page }) => {
    // Test model accuracy across different pages
    const pages = ['/', '/services', '/portfolio', '/contact'];
    const accuracyTests = [];

    for (const pagePath of pages) {
      try {
        await page.goto(pagePath);
        await page.waitForLoadState('domcontentloaded');

        const accuracy = mlDetector.predictionAccuracy.get(pagePath);
        if (accuracy !== undefined) {
          accuracyTests.push({ page: pagePath, accuracy });
        }
      } catch (error) {
        console.warn(`Could not test accuracy for ${pagePath}: ${error.message}`);
      }
    }

    if (accuracyTests.length > 0) {
      const averageAccuracy = accuracyTests.reduce((sum, test) => sum + test.accuracy, 0) / accuracyTests.length;
      console.log(`🎯 Average ML Model Accuracy: ${averageAccuracy.toFixed(1)}%`);

      // Models should have reasonable accuracy
      expect(averageAccuracy).toBeGreaterThan(50); // Minimum 50% accuracy
    }
  });

  test.afterAll(async () => {
    // Generate comprehensive ML regression report
    const allRegressions = mlDetector.regressionAlerts;

    const report = await mlDetector.generateMLRegressionReport(allRegressions);

    console.log('\n🧠 ML PERFORMANCE REGRESSION DETECTION COMPLETE');
    console.log(`📊 Total Regressions: ${report.summary.totalRegressions}`);
    console.log(`🚨 Critical: ${report.summary.criticalRegressions}`);
    console.log(`⚠️ High: ${report.summary.highRegressions}`);
    console.log(`ℹ️ Medium: ${report.summary.mediumRegressions}`);
    console.log(`🎯 Average Model Accuracy: ${report.summary.averageAccuracy.toFixed(1)}%`);
    console.log(`🤖 Trained Models: ${report.modelStatistics.trainedModels}`);
    console.log(`📈 Total Data Points: ${report.modelStatistics.dataPoints}`);
  });
});