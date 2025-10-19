#!/usr/bin/env node

/**
 * Generate CSV Test Report
 *
 * Converts Jest JSON report to CSV format for Excel/spreadsheet analysis
 */

const fs = require('fs');
const path = require('path');

function escapeCSV(field) {
  if (field === null || field === undefined) return '';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function generateCSV(report) {
  const rows = [];

  // Header
  rows.push([
    'Suite',
    'Test Name',
    'Status',
    'Duration (s)',
    'Error Message'
  ].map(escapeCSV).join(','));

  // Data rows
  report.testResults.forEach(suite => {
    const suiteName = suite.name.split('/').pop().replace('.test.ts', '');

    suite.assertionResults.forEach(test => {
      const duration = test.duration ? (test.duration / 1000).toFixed(2) : 'N/A';
      const errorMsg = test.failureMessages && test.failureMessages.length > 0
        ? test.failureMessages[0]
            .replace(/\u001b\[[0-9;]*m/g, '') // Remove ANSI codes
            .split('\n')
            .slice(0, 3)
            .join(' | ')
        : '';

      rows.push([
        suiteName,
        test.title,
        test.status,
        duration,
        errorMsg
      ].map(escapeCSV).join(','));
    });
  });

  return rows.join('\n');
}

function generateSummaryCSV(report) {
  const rows = [];

  // Header
  rows.push([
    'Suite',
    'Total Tests',
    'Passed',
    'Failed',
    'Duration (s)',
    'Status'
  ].map(escapeCSV).join(','));

  // Data rows
  report.testResults.forEach(suite => {
    const suiteName = suite.name.split('/').pop().replace('.test.ts', '');
    const passed = suite.assertionResults.filter(t => t.status === 'passed').length;
    const failed = suite.assertionResults.filter(t => t.status === 'failed').length;
    const total = suite.assertionResults.length;
    const duration = ((suite.endTime - suite.startTime) / 1000).toFixed(2);

    rows.push([
      suiteName,
      total,
      passed,
      failed,
      duration,
      suite.status
    ].map(escapeCSV).join(','));
  });

  // Add totals row
  rows.push([
    'TOTAL',
    report.numTotalTests,
    report.numPassedTests,
    report.numFailedTests,
    '-',
    report.success ? 'passed' : 'failed'
  ].map(escapeCSV).join(','));

  return rows.join('\n');
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

  // Generate detailed CSV
  const detailedCSV = generateCSV(report);
  const detailedPath = reportPath.replace('.json', '-detailed.csv');
  fs.writeFileSync(detailedPath, detailedCSV);

  // Generate summary CSV
  const summaryCSV = generateSummaryCSV(report);
  const summaryPath = reportPath.replace('.json', '-summary.csv');
  fs.writeFileSync(summaryPath, summaryCSV);

  console.log('✅ CSV reports generated:');
  console.log('  Detailed:', detailedPath);
  console.log('  Summary:', summaryPath);
  console.log('');
  console.log('Open in Excel or your preferred spreadsheet application');
}

if (require.main === module) {
  main();
}

module.exports = { generateCSV, generateSummaryCSV };
