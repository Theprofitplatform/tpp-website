#!/bin/bash

# HIVE MIND PERFORMANCE TESTING SCRIPT
# Comprehensive performance testing with collective intelligence

set -e

echo "🧠 HIVE MIND PERFORMANCE TESTING FRAMEWORK"
echo "═════════════════════════════════════════════════════════════════"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js to run the tests."
    exit 1
fi

# Change to tests directory
cd "$(dirname "$0")/tests"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Parse command line arguments
MODE="comprehensive"
BASE_URL="http://localhost:4321/website/"
PAGES="index.html,about.html,contact.html,services.html,pricing.html"
PARALLEL="true"
CICD="false"
EXIT_ON_FAILURE="true"
AGENTS="3"
OUTPUT="./test-results"

while [[ $# -gt 0 ]]; do
    case $1 in
        --mode)
            MODE="$2"
            shift 2
            ;;
        --url)
            BASE_URL="$2"
            shift 2
            ;;
        --pages)
            PAGES="$2"
            shift 2
            ;;
        --parallel)
            PARALLEL="$2"
            shift 2
            ;;
        --cicd)
            CICD="$2"
            shift 2
            ;;
        --exit-on-failure)
            EXIT_ON_FAILURE="$2"
            shift 2
            ;;
        --agents)
            AGENTS="$2"
            shift 2
            ;;
        --output)
            OUTPUT="$2"
            shift 2
            ;;
        --help|-h)
            echo "Hive Mind Performance Testing Framework"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --mode MODE              Test execution mode (comprehensive, performance_only, functional_only, regression_only)"
            echo "  --url URL                Base URL to test (default: http://localhost:4321/website/)"
            echo "  --pages PAGES            Comma-separated list of pages to test"
            echo "  --parallel BOOL          Run tests in parallel (default: true)"
            echo "  --cicd BOOL              Enable CI/CD mode (default: false)"
            echo "  --exit-on-failure BOOL   Exit with error code on test failures (default: true)"
            echo "  --agents NUMBER          Number of hive mind agents to use (default: 3)"
            echo "  --output PATH            Output directory for reports (default: ./test-results)"
            echo "  --help, -h               Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                                    # Run comprehensive tests"
            echo "  $0 --mode performance_only                           # Run only performance tests"
            echo "  $0 --url http://localhost:3000 --pages index.html    # Test specific URL and page"
            echo "  $0 --cicd true --exit-on-failure true                # Run in CI/CD mode"
            echo ""
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo "🎯 Test Configuration:"
echo "   Mode: $MODE"
echo "   Base URL: $BASE_URL"
echo "   Pages: $PAGES"
echo "   Parallel Execution: $PARALLEL"
echo "   CI/CD Mode: $CICD"
echo "   Exit on Failure: $EXIT_ON_FAILURE"
echo "   Hive Mind Agents: $AGENTS"
echo "   Output Directory: $OUTPUT"
echo ""

# Create output directory
mkdir -p "$OUTPUT"

# Check if the base URL is accessible
echo "🔍 Checking if base URL is accessible..."
if curl -s --head "$BASE_URL" | head -n 1 | grep -q "200 OK\|301\|302"; then
    echo "✅ Base URL is accessible"
else
    echo "⚠️  Warning: Base URL may not be accessible. Tests may fail."
    echo "   Make sure your local server is running on $BASE_URL"
fi
echo ""

# Run the comprehensive test suite
echo "🚀 Starting Hive Mind Performance Tests..."
echo ""

node hive-mind-test-runner.js \
    --mode "$MODE" \
    --url "$BASE_URL" \
    --pages "$PAGES" \
    --parallel "$PARALLEL" \
    --cicd "$CICD" \
    --exit-on-failure "$EXIT_ON_FAILURE" \
    --agents "$AGENTS" \
    --output "$OUTPUT"

EXIT_CODE=$?

echo ""
echo "═════════════════════════════════════════════════════════════════"

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ HIVE MIND PERFORMANCE TESTS COMPLETED SUCCESSFULLY"
    echo ""
    echo "📊 Reports generated in: $OUTPUT"
    echo "   - JSON Report: Comprehensive machine-readable results"
    echo "   - Markdown Report: Human-readable summary and recommendations"
    echo "   - HTML Report: Interactive web-based dashboard"
    echo ""

    # Display quick summary if reports exist
    if [ -f "$OUTPUT"/*-comprehensive-report.json ]; then
        echo "🧠 Quick Summary:"
        # This would extract key metrics from the JSON report
        # For now, we'll just indicate where to find the results
        echo "   See the generated reports for detailed results and recommendations."
    fi
else
    echo "❌ HIVE MIND PERFORMANCE TESTS FAILED"
    echo ""
    echo "💡 Troubleshooting:"
    echo "   1. Check that your local server is running"
    echo "   2. Verify the base URL is correct: $BASE_URL"
    echo "   3. Ensure Node.js and dependencies are properly installed"
    echo "   4. Review the error messages above for specific issues"
    echo ""
fi

echo "═════════════════════════════════════════════════════════════════"

exit $EXIT_CODE