#!/bin/bash

# AI Agent Test Runner with Reporting
# Runs all AI agent tests and generates comprehensive reports

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPORT_DIR="test-reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$REPORT_DIR/ai-test-report-$TIMESTAMP.json"
SUMMARY_FILE="$REPORT_DIR/summary-$TIMESTAMP.txt"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  AI Agent Test Suite Runner${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Create report directory
mkdir -p "$REPORT_DIR"

# Check if .env.test exists
if [ ! -f ".env.test" ]; then
    echo -e "${RED}Error: .env.test file not found${NC}"
    echo "Please create a .env.test file with required environment variables"
    exit 1
fi

# Check for ANTHROPIC_API_KEY
if ! grep -q "ANTHROPIC_API_KEY" .env.test; then
    echo -e "${YELLOW}Warning: ANTHROPIC_API_KEY not found in .env.test${NC}"
    echo "Some tests may fail without a valid API key"
fi

echo -e "${BLUE}Running AI Agent Tests...${NC}"
echo ""

# Run tests with coverage and JSON reporter
NODE_ENV=test npx jest \
    --testMatch="**/tests/ai/**/*.test.ts" \
    --coverage \
    --json \
    --outputFile="$REPORT_FILE" \
    --testTimeout=120000 \
    --detectOpenHandles \
    --forceExit

# Check test results
TEST_EXIT_CODE=$?

# Parse test results and create summary
echo ""
echo -e "${BLUE}Generating Test Report...${NC}"

# Create summary file
cat > "$SUMMARY_FILE" << EOF
========================================
AI Agent Test Summary
========================================
Timestamp: $(date)
Report File: $REPORT_FILE

EOF

# Extract key metrics from JSON report (if it exists)
if [ -f "$REPORT_FILE" ]; then
    # Use Node.js to parse JSON and extract metrics
    node -e "
        const fs = require('fs');
        const report = JSON.parse(fs.readFileSync('$REPORT_FILE', 'utf-8'));

        console.log('Test Results:');
        console.log('-------------');
        console.log('Total Tests: ' + report.numTotalTests);
        console.log('Passed: ' + report.numPassedTests);
        console.log('Failed: ' + report.numFailedTests);
        console.log('Skipped: ' + report.numPendingTests);
        console.log('');
        console.log('Coverage:');
        console.log('---------');
        if (report.coverageMap) {
            console.log('See coverage/lcov-report/index.html for detailed coverage report');
        }
        console.log('');
        console.log('Duration: ' + (report.testResults.reduce((sum, r) => sum + (r.endTime - r.startTime), 0) / 1000).toFixed(2) + 's');
    " >> "$SUMMARY_FILE"
fi

# Display summary
echo ""
cat "$SUMMARY_FILE"

# Check if tests passed
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ All AI Agent Tests Passed!${NC}"
    echo ""
    echo -e "${BLUE}Test Reports:${NC}"
    echo "  - JSON Report: $REPORT_FILE"
    echo "  - Summary: $SUMMARY_FILE"
    echo "  - Coverage: coverage/lcov-report/index.html"
    exit 0
else
    echo ""
    echo -e "${RED}✗ Some AI Agent Tests Failed${NC}"
    echo ""
    echo -e "${YELLOW}Check the reports for details:${NC}"
    echo "  - JSON Report: $REPORT_FILE"
    echo "  - Summary: $SUMMARY_FILE"
    exit 1
fi
