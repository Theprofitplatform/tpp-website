/**
 * Simple test script to verify performance monitoring dashboard loads and functions
 */

// Test if performance monitoring dashboard is working
function testPerformanceMonitoring() {
    console.log('🔍 Testing Performance Monitoring Dashboard...');

    // Check if the class exists
    if (typeof PerformanceMonitoringDashboard === 'undefined') {
        console.error('❌ PerformanceMonitoringDashboard class not found');
        return false;
    }

    try {
        // Try to create an instance
        const testMonitor = new PerformanceMonitoringDashboard({
            enableRealTimeMetrics: true,
            reportInterval: 5000
        });

        console.log('✅ Performance monitoring dashboard initialized successfully');

        // Check if basic metrics are being collected
        setTimeout(() => {
            if (testMonitor.metrics) {
                console.log('✅ Metrics collection active');
                console.log('Current metrics:', {
                    lcp: testMonitor.metrics.lcp,
                    fcp: testMonitor.metrics.fcp,
                    cls: testMonitor.metrics.cls,
                    totalResources: testMonitor.metrics.totalResources
                });
            } else {
                console.error('❌ Metrics not found');
            }
        }, 2000);

        return true;

    } catch (error) {
        console.error('❌ Error creating performance monitor:', error);
        return false;
    }
}

// Run test when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(testPerformanceMonitoring, 1000);
});