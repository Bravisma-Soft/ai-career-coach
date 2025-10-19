#!/usr/bin/env node

/**
 * Generate HTML Test Report
 *
 * Converts Jest JSON report to beautiful HTML format
 */

const fs = require('fs');
const path = require('path');

function generateHTML(report) {
  const timestamp = new Date().toLocaleString();
  const successRate = ((report.numPassedTests / report.numTotalTests) * 100).toFixed(2);
  const totalDuration = report.testResults.reduce((sum, suite) =>
    sum + (suite.endTime - suite.startTime), 0) / 1000;

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Agent Test Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f5f5f5;
            padding: 20px;
            color: #333;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
        }

        header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }

        header p {
            opacity: 0.9;
            font-size: 14px;
        }

        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }

        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #667eea;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .stat-card.success {
            border-left-color: #10b981;
        }

        .stat-card.failure {
            border-left-color: #ef4444;
        }

        .stat-card.warning {
            border-left-color: #f59e0b;
        }

        .stat-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6b7280;
            margin-bottom: 8px;
        }

        .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #111827;
        }

        .stat-subtitle {
            font-size: 14px;
            color: #6b7280;
            margin-top: 4px;
        }

        .test-suites {
            padding: 30px;
        }

        .suite {
            margin-bottom: 30px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            overflow: hidden;
        }

        .suite-header {
            background: #f9fafb;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            transition: background 0.2s;
        }

        .suite-header:hover {
            background: #f3f4f6;
        }

        .suite-header.passed {
            border-left: 4px solid #10b981;
        }

        .suite-header.failed {
            border-left: 4px solid #ef4444;
        }

        .suite-title {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
        }

        .suite-stats {
            display: flex;
            gap: 15px;
            font-size: 14px;
        }

        .suite-stat {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }

        .badge.success {
            background: #d1fae5;
            color: #065f46;
        }

        .badge.failure {
            background: #fee2e2;
            color: #991b1b;
        }

        .badge.duration {
            background: #e0e7ff;
            color: #3730a3;
        }

        .tests {
            padding: 20px;
            background: white;
        }

        .test {
            padding: 12px;
            margin-bottom: 8px;
            border-radius: 4px;
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }

        .test.passed {
            background: #f0fdf4;
        }

        .test.failed {
            background: #fef2f2;
            border: 1px solid #fecaca;
        }

        .test-icon {
            flex-shrink: 0;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }

        .test-icon.passed {
            background: #10b981;
            color: white;
        }

        .test-icon.failed {
            background: #ef4444;
            color: white;
        }

        .test-content {
            flex: 1;
        }

        .test-title {
            font-size: 14px;
            color: #111827;
            margin-bottom: 4px;
        }

        .test-duration {
            font-size: 12px;
            color: #6b7280;
        }

        .error-message {
            margin-top: 10px;
            padding: 12px;
            background: #fee;
            border-left: 3px solid #ef4444;
            border-radius: 4px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 12px;
            color: #991b1b;
            white-space: pre-wrap;
            overflow-x: auto;
        }

        .collapsible-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }

        .collapsible-content.open {
            max-height: 5000px;
        }

        footer {
            padding: 20px 30px;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }

        .progress-bar {
            height: 6px;
            background: #e5e7eb;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 15px;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981, #059669);
            transition: width 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🤖 AI Agent Test Report</h1>
            <p>Generated: ${timestamp}</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${successRate}%"></div>
            </div>
        </header>

        <div class="summary">
            <div class="stat-card">
                <div class="stat-label">Total Tests</div>
                <div class="stat-value">${report.numTotalTests}</div>
            </div>

            <div class="stat-card success">
                <div class="stat-label">Passed</div>
                <div class="stat-value">${report.numPassedTests}</div>
                <div class="stat-subtitle">${successRate}%</div>
            </div>

            <div class="stat-card failure">
                <div class="stat-label">Failed</div>
                <div class="stat-value">${report.numFailedTests}</div>
            </div>

            <div class="stat-card warning">
                <div class="stat-label">Duration</div>
                <div class="stat-value">${totalDuration.toFixed(1)}s</div>
            </div>
        </div>

        <div class="test-suites">
            <h2 style="margin-bottom: 20px; color: #111827;">Test Suites</h2>
`;

  // Generate suite details
  report.testResults.forEach((suite, idx) => {
    const suiteName = suite.name.split('/').pop().replace('.test.ts', '');
    const passed = suite.assertionResults.filter(t => t.status === 'passed').length;
    const failed = suite.assertionResults.filter(t => t.status === 'failed').length;
    const duration = ((suite.endTime - suite.startTime) / 1000).toFixed(2);
    const statusClass = suite.status === 'passed' ? 'passed' : 'failed';

    html += `
            <div class="suite">
                <div class="suite-header ${statusClass}" onclick="toggleSuite(${idx})">
                    <div class="suite-title">📁 ${suiteName}</div>
                    <div class="suite-stats">
                        <span class="badge success">${passed} passed</span>
                        ${failed > 0 ? `<span class="badge failure">${failed} failed</span>` : ''}
                        <span class="badge duration">${duration}s</span>
                    </div>
                </div>
                <div id="suite-${idx}" class="collapsible-content">
                    <div class="tests">
`;

    // Generate test details
    suite.assertionResults.forEach(test => {
      const testDuration = test.duration ? (test.duration / 1000).toFixed(2) + 's' : 'N/A';
      const statusIcon = test.status === 'passed' ? '✓' : '✗';

      html += `
                        <div class="test ${test.status}">
                            <div class="test-icon ${test.status}">${statusIcon}</div>
                            <div class="test-content">
                                <div class="test-title">${test.title}</div>
                                <div class="test-duration">Duration: ${testDuration}</div>
`;

      if (test.failureMessages && test.failureMessages.length > 0) {
        const errorMsg = test.failureMessages[0]
          .replace(/\u001b\[[0-9;]*m/g, '') // Remove ANSI codes
          .split('\n')
          .slice(0, 15)
          .join('\n');

        html += `
                                <div class="error-message">${escapeHtml(errorMsg)}</div>
`;
      }

      html += `
                            </div>
                        </div>
`;
    });

    html += `
                    </div>
                </div>
            </div>
`;
  });

  html += `
        </div>

        <footer>
            <p>AI Career Coach Test Suite · Powered by Jest & Claude Sonnet 4.5</p>
        </footer>
    </div>

    <script>
        function toggleSuite(idx) {
            const content = document.getElementById('suite-' + idx);
            content.classList.toggle('open');
        }

        // Open failed suites by default
        ${report.testResults.map((suite, idx) =>
          suite.status === 'failed' ? `document.getElementById('suite-${idx}').classList.add('open');` : ''
        ).join('\n        ')}
    </script>
</body>
</html>`;

  return html;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Main execution
function main() {
  const reportDir = 'test-reports';

  // Find latest JSON report
  const files = fs.readdirSync(reportDir)
    .filter(f => f.startsWith('ai-test-report-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error('No test reports found');
    process.exit(1);
  }

  const reportPath = path.join(reportDir, files[0]);
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

  // Generate HTML
  const html = generateHTML(report);

  // Save HTML report
  const htmlPath = reportPath.replace('.json', '.html');
  fs.writeFileSync(htmlPath, html);

  console.log('✅ HTML report generated:', htmlPath);
  console.log('');
  console.log('Open in browser:');
  console.log(`  open ${htmlPath}`);
}

if (require.main === module) {
  main();
}

module.exports = { generateHTML };
