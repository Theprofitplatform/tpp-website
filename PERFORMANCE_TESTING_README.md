# Performance Testing Suite

A comprehensive performance testing framework designed for the hive mind collective intelligence system. This suite provides advanced performance testing, optimization validation, stress testing, and automated reporting capabilities.

## 🎯 Overview

The Performance Testing Suite consists of several specialized components that work together to provide comprehensive performance analysis:

- **Performance Test Suite**: Baseline performance measurement and load testing
- **Stress Test Analyzer**: Breaking point identification and resource bottleneck analysis
- **Optimization Validator**: Validation of performance optimizations implemented by the coder agent
- **Performance Test Orchestrator**: Coordinates all testing components and generates insights
- **Test Runner**: Simple interface for executing tests in different modes

## 🚀 Quick Start

### Prerequisites

1. Ensure your local development server is running:
```bash
# Start your local server (adjust port as needed)
python3 -m http.server 4321
# or
npx http-server -p 4321
```

2. Install dependencies:
```bash
npm install puppeteer
```

### Running Tests

#### Quick Test (Recommended for development)
```bash
node run-performance-tests.js --quick
```
- Runs baseline performance and optimization validation
- Takes ~2-3 minutes
- Perfect for validating recent changes

#### Standard Test (Recommended for CI/CD)
```bash
node run-performance-tests.js standard
```
- Runs baseline, load testing, and optimization validation
- Takes ~5-8 minutes
- Good balance of coverage and speed

#### Comprehensive Test (Recommended for release validation)
```bash
node run-performance-tests.js --comprehensive
```
- Runs all test suites including stress testing
- Takes ~15-20 minutes
- Maximum coverage for critical releases

#### Specific Test Types
```bash
# Only optimization validation
node run-performance-tests.js --optimization

# Only load testing
node run-performance-tests.js --load

# Parallel execution (faster)
node run-performance-tests.js --parallel
```

## 📊 Test Components

### 1. Performance Test Suite (`performance-test-suite.js`)

**Purpose**: Measures baseline performance and conducts load testing

**Key Features**:
- Core Web Vitals measurement (FCP, LCP, CLS, FID)
- Load testing with concurrent users (1, 5, 10, 20, 50)
- Network condition simulation (Fast 3G, Slow 3G)
- Statistical analysis with confidence intervals
- Regression testing against previous results

**Usage**:
```javascript
import PerformanceTestSuite from './performance-test-suite.js';

const suite = new PerformanceTestSuite({
    baseUrl: 'http://localhost:4321/website/',
    testPages: ['index.html', 'about.html'],
    concurrentUsers: [1, 5, 10, 20],
    iterations: 3
});

const results = await suite.runAllTests();
```

### 2. Stress Test Analyzer (`stress-test-analyzer.js`)

**Purpose**: Identifies breaking points and analyzes system behavior under extreme load

**Key Features**:
- Progressive stress testing (25, 50, 100+ concurrent users)
- Breaking point detection
- Resource usage monitoring (memory, CPU)
- Memory leak detection
- Error pattern analysis
- Worker thread parallelization

**Usage**:
```javascript
import StressTestAnalyzer from './stress-test-analyzer.js';

const analyzer = new StressTestAnalyzer({
    baseUrl: 'http://localhost:4321/website/',
    maxConcurrentUsers: 1000,
    stepSize: 25,
    testDuration: 30
});

const results = await analyzer.runStressTestAnalysis();
```

### 3. Optimization Validator (`optimization-validator.js`)

**Purpose**: Validates that performance optimizations are properly implemented

**Key Features**:
- CSS consolidation validation
- JavaScript bundling verification
- Image optimization checking (lazy loading, WebP)
- Resource hints validation (preconnect, dns-prefetch)
- Compression and caching verification
- Critical CSS inlining detection
- Async/defer script loading verification

**Usage**:
```javascript
import OptimizationValidator from './optimization-validator.js';

const validator = new OptimizationValidator({
    baseUrl: 'http://localhost:4321/website/',
    testPages: ['index.html', 'about.html']
});

const results = await validator.validateOptimizations();
```

### 4. Performance Test Orchestrator (`performance-test-orchestrator.js`)

**Purpose**: Coordinates all testing components and generates comprehensive insights

**Key Features**:
- Sequential or parallel test execution
- Result aggregation and analysis
- Trend analysis against historical data
- Insight generation with ML-like pattern recognition
- Hive mind memory integration
- Executive summary generation
- Auto-remediation framework (extensible)

**Usage**:
```javascript
import PerformanceTestOrchestrator from './performance-test-orchestrator.js';

const orchestrator = new PerformanceTestOrchestrator({
    testSuites: ['baseline', 'load', 'optimization'],
    parallelExecution: true,
    memoryIntegration: true
});

const results = await orchestrator.orchestratePerformanceTests();
```

## 📈 Understanding Results

### Health Score Calculation

The overall health score (0-100) is calculated using weighted metrics:

- **Performance (40%)**: Based on Core Web Vitals and load times
- **Optimization (30%)**: Implementation of performance best practices
- **Scalability (20%)**: Ability to handle concurrent users
- **Reliability (10%)**: Error rates and test success rates

### Performance Grades

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| First Contentful Paint | ≤1.8s | 1.8s-3.0s | >3.0s |
| Largest Contentful Paint | ≤2.5s | 2.5s-4.0s | >4.0s |
| Cumulative Layout Shift | ≤0.1 | 0.1-0.25 | >0.25 |
| First Input Delay | ≤100ms | 100ms-300ms | >300ms |

### Optimization Checks

The validator checks for these optimizations:

✅ **CSS Consolidation**: ≤3 CSS files
✅ **JS Bundling**: ≤5 JavaScript files
✅ **Image Lazy Loading**: ≥80% of images lazy loaded
✅ **Resource Hints**: ≥3 preconnect/dns-prefetch hints
✅ **Compression**: ≥80% of text resources compressed
✅ **Caching Headers**: ≥90% of static resources cacheable
✅ **Critical CSS**: Inline critical CSS present
✅ **Async JavaScript**: ≥70% of scripts async/defer

## 📁 Generated Reports

### Automatic Reports

Each test run generates several reports:

1. **PERFORMANCE_ORCHESTRATION_REPORT.md** - Detailed technical analysis
2. **PERFORMANCE_EXECUTIVE_SUMMARY.md** - High-level business summary
3. **performance-orchestration-results.json** - Raw data for integrations
4. **Individual component reports** - Specialized analysis per component

### Hive Mind Memory Integration

Results are automatically stored in the `memory/` directory for collective intelligence:

```
memory/
├── latest-performance-test.json          # Latest summary for agents
├── orchestration-{id}.json               # Full orchestration results
└── orchestration-history.json            # Historical trend data
```

## 🔧 Configuration

### Environment Variables

```bash
# Base URL for testing (default: http://localhost:4321/website/)
export BASE_URL="https://your-test-site.com"

# Enable detailed debugging
export DEBUG=true

# Memory limit for stress testing (default: 1GB)
export MEMORY_LIMIT=2147483648
```

### Custom Test Pages

```javascript
// Add custom pages to test
const runner = new PerformanceTestRunner();
runner.addTestPage('custom-page.html');
runner.removeTestPage('unwanted-page.html');
```

### Custom Thresholds

```javascript
const validator = new OptimizationValidator({
    expectedOptimizations: {
        cssConsolidation: { threshold: 2 },  // Max 2 CSS files
        imageOptimization: { threshold: 0.9 }  // 90% lazy loaded
    }
});
```

## 🤖 Hive Mind Integration

### For Coder Agents

```javascript
import PerformanceTestRunner from './run-performance-tests.js';

// Quick validation after code changes
const runner = new PerformanceTestRunner();
const isGood = await runner.isPerformanceGood();

if (!isGood) {
    const issues = await runner.getCriticalIssues();
    console.log('Critical issues to fix:', issues);
}
```

### For Orchestrator Agents

```javascript
// Access collective memory
const lastResults = await runner.getLastTestResults();
console.log('Health score trend:', lastResults.healthScore);
```

## 📚 Advanced Usage

### Custom Test Scenarios

```javascript
// Custom stress test for specific scenarios
const stressTest = new StressTestAnalyzer({
    baseUrl: 'http://localhost:4321/website/',
    testScenario: 'black-friday-simulation',
    maxConcurrentUsers: 2000,
    testDuration: 60
});
```

### Performance Budgets

```javascript
// Set performance budgets
const suite = new PerformanceTestSuite({
    performanceBudgets: {
        fcp: 1500,  // 1.5s FCP budget
        lcp: 2000,  // 2.0s LCP budget
        totalSize: 500000  // 500KB total size budget
    }
});
```

### Continuous Monitoring

```javascript
// Run tests continuously
const orchestrator = new PerformanceTestOrchestrator({
    continuousMode: true,
    interval: 3600000  // Every hour
});
```

## 🐛 Troubleshooting

### Common Issues

**Tests timing out**:
```bash
# Increase timeout in configuration
export TEST_TIMEOUT=60000
```

**Server not responding**:
```bash
# Check if server is running
curl http://localhost:4321/website/index.html
```

**Memory issues during stress testing**:
```bash
# Run with increased memory
node --max-old-space-size=4096 run-performance-tests.js --comprehensive
```

**Browser launch failures**:
```bash
# Install system dependencies
sudo apt-get install -y chromium-browser
```

### Debug Mode

Enable verbose logging:
```bash
DEBUG=* node run-performance-tests.js
```

### Performance Tips

- Use `--parallel` for faster execution
- Run `--quick` tests during development
- Use `--comprehensive` only for releases
- Ensure adequate system resources for stress testing

## 🤝 Contributing

### Adding New Test Types

1. Create a new test component in the same pattern
2. Register it in the orchestrator
3. Add CLI options in the test runner
4. Update documentation

### Extending Metrics

1. Add new metrics to the relevant test component
2. Update aggregation logic in orchestrator
3. Add grading criteria
4. Update report templates

## 📄 License

This performance testing suite is part of The Profit Platform project and follows the same licensing terms.