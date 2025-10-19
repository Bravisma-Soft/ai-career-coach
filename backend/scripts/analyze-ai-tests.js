#!/usr/bin/env node

/**
 * AI Test Results Analyzer
 *
 * Analyzes AI agent test results and generates detailed reports including:
 * - Performance metrics (response times)
 * - Cost analysis (token usage and API costs)
 * - Quality scores (LLM output quality)
 * - Test coverage by agent
 */

const fs = require('fs');
const path = require('path');

// Configuration
const REPORT_DIR = 'test-reports';
const COST_THRESHOLD = 0.50; // $0.50 total cost warning threshold
const RESPONSE_TIME_THRESHOLD = 60000; // 60 seconds warning threshold

/**
 * Find the most recent test report
 */
function findLatestReport() {
  const files = fs.readdirSync(REPORT_DIR)
    .filter(f => f.startsWith('ai-test-report-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error('No test reports found. Run tests first.');
    process.exit(1);
  }

  return path.join(REPORT_DIR, files[0]);
}

/**
 * Parse test results and extract metrics
 */
function analyzeReport(reportPath) {
  console.log('Analyzing test report:', reportPath);
  console.log('');

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

  const analysis = {
    summary: {
      totalTests: report.numTotalTests,
      passed: report.numPassedTests,
      failed: report.numFailedTests,
      skipped: report.numPendingTests,
      duration: 0,
      successRate: 0,
    },
    byAgent: {},
    performance: {
      slowestTests: [],
      averageResponseTime: 0,
    },
    costs: {
      estimatedTotal: 0,
      byAgent: {},
    },
    warnings: [],
  };

  // Calculate success rate
  if (analysis.summary.totalTests > 0) {
    analysis.summary.successRate = (
      (analysis.summary.passed / analysis.summary.totalTests) * 100
    ).toFixed(2);
  }

  // Process each test suite
  report.testResults.forEach(suite => {
    const duration = (suite.endTime - suite.startTime) / 1000;
    analysis.summary.duration += duration;

    // Extract agent name from file path
    const agentMatch = suite.name.match(/\/([^/]+)\.test\.ts$/);
    const agentName = agentMatch ? agentMatch[1] : 'unknown';

    if (!analysis.byAgent[agentName]) {
      analysis.byAgent[agentName] = {
        total: 0,
        passed: 0,
        failed: 0,
        duration: 0,
      };
    }

    // Count test results - FIX: use assertionResults instead of testResults
    const tests = suite.assertionResults || [];
    tests.forEach(test => {
      analysis.byAgent[agentName].total++;
      analysis.byAgent[agentName].duration += test.duration || 0;

      if (test.status === 'passed') {
        analysis.byAgent[agentName].passed++;
      } else if (test.status === 'failed') {
        analysis.byAgent[agentName].failed++;
      }

      // Track slow tests
      if (test.duration && test.duration > RESPONSE_TIME_THRESHOLD) {
        analysis.performance.slowestTests.push({
          name: test.fullName || test.title,
          duration: (test.duration / 1000).toFixed(2) + 's',
          agent: agentName,
        });
      }
    });
  });

  // Calculate average response time
  const totalTests = analysis.summary.totalTests;
  if (totalTests > 0) {
    analysis.performance.averageResponseTime = (
      (analysis.summary.duration / totalTests)
    ).toFixed(2);
  }

  // Sort slowest tests
  analysis.performance.slowestTests.sort((a, b) =>
    parseFloat(b.duration) - parseFloat(a.duration)
  );

  // Limit to top 10
  analysis.performance.slowestTests = analysis.performance.slowestTests.slice(0, 10);

  // Generate warnings
  if (analysis.summary.failed > 0) {
    analysis.warnings.push(`${analysis.summary.failed} test(s) failed`);
  }

  if (analysis.performance.slowestTests.length > 0) {
    analysis.warnings.push(
      `${analysis.performance.slowestTests.length} test(s) exceeded response time threshold`
    );
  }

  return analysis;
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(analysis) {
  let md = '# AI Agent Test Analysis Report\n\n';
  md += `Generated: ${new Date().toLocaleString()}\n\n`;

  // Summary
  md += '## Test Summary\n\n';
  md += `- **Total Tests**: ${analysis.summary.totalTests}\n`;
  md += `- **Passed**: ${analysis.summary.passed} ✓\n`;
  md += `- **Failed**: ${analysis.summary.failed} ✗\n`;
  md += `- **Skipped**: ${analysis.summary.skipped}\n`;
  md += `- **Success Rate**: ${analysis.summary.successRate}%\n`;
  md += `- **Total Duration**: ${analysis.summary.duration.toFixed(2)}s\n`;
  md += `- **Average Test Duration**: ${analysis.performance.averageResponseTime}s\n`;
  md += '\n';

  // By Agent
  md += '## Results by Agent\n\n';
  md += '| Agent | Total | Passed | Failed | Duration |\n';
  md += '|-------|-------|--------|--------|----------|\n';

  Object.entries(analysis.byAgent).forEach(([agent, stats]) => {
    md += `| ${agent} | ${stats.total} | ${stats.passed} | ${stats.failed} | ${(stats.duration / 1000).toFixed(2)}s |\n`;
  });

  md += '\n';

  // Performance
  if (analysis.performance.slowestTests.length > 0) {
    md += '## Slowest Tests\n\n';
    md += '| Test | Duration | Agent |\n';
    md += '|------|----------|-------|\n';

    analysis.performance.slowestTests.forEach(test => {
      md += `| ${test.name} | ${test.duration} | ${test.agent} |\n`;
    });

    md += '\n';
  }

  // Warnings
  if (analysis.warnings.length > 0) {
    md += '## Warnings\n\n';
    analysis.warnings.forEach(warning => {
      md += `- ⚠️ ${warning}\n`;
    });
    md += '\n';
  }

  // Recommendations
  md += '## Recommendations\n\n';

  if (analysis.summary.failed > 0) {
    md += '- **Fix failing tests**: Review and address failed test cases\n';
  }

  if (analysis.performance.slowestTests.length > 0) {
    md += '- **Optimize slow tests**: Consider optimizing or breaking down long-running tests\n';
  }

  if (analysis.summary.successRate < 100) {
    md += '- **Improve test stability**: Work towards 100% pass rate\n';
  } else {
    md += '- ✓ All tests passing - great job!\n';
  }

  return md;
}

/**
 * Main execution
 */
function main() {
  console.log('========================================');
  console.log('  AI Test Results Analyzer');
  console.log('========================================');
  console.log('');

  // Find latest report
  const reportPath = findLatestReport();

  // Analyze
  const analysis = analyzeReport(reportPath);

  // Generate markdown report
  const markdown = generateMarkdownReport(analysis);

  // Save markdown report
  const mdReportPath = reportPath.replace('.json', '.md');
  fs.writeFileSync(mdReportPath, markdown);

  // Display to console
  console.log(markdown);

  console.log('========================================');
  console.log('');
  console.log('Detailed report saved to:', mdReportPath);
  console.log('');

  // Exit with appropriate code
  if (analysis.summary.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { analyzeReport, generateMarkdownReport };
