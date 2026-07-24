#!/usr/bin/env node
/**
 * Production dependency audit gate.
 * - Fails on critical vulnerabilities.
 * - Fails on high unless the package is in the known transitive allowlist
 *   (Nest/Express/Serverless tooling we cannot bump without breaking the stack).
 * - Always prints a summary for the Actions log.
 */
const { execSync } = require('node:child_process');

const ALLOW_HIGH = new Set([
  // Nested under @nestjs/* / express until Nest bumps peer ranges.
  'js-yaml',
  '@nestjs/swagger',
  'path-to-regexp',
  'body-parser',
  'qs',
  'express',
  // Legacy aws-sdk pulled by aws-lambda helper (runtime uses AWS SDK v3 elsewhere).
  'aws-sdk',
  'aws-lambda',
  'uuid',
  // SPA-only react-router; many advisories target SSR/RSC paths we do not use.
  'react-router',
  'react-router-dom',
]);

let report;
try {
  execSync('npm audit --json --omit=dev', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  report = { metadata: { vulnerabilities: {} }, vulnerabilities: {} };
} catch (error) {
  const stdout = error.stdout?.toString?.() || '';
  try {
    report = JSON.parse(stdout);
  } catch {
    console.error('Could not parse npm audit JSON');
    process.exit(1);
  }
}

const vulns = report.vulnerabilities || {};
const critical = [];
const highBlocked = [];
const highAllowed = [];

for (const [name, info] of Object.entries(vulns)) {
  const severity = info.severity;
  if (severity === 'critical') {
    critical.push(name);
  } else if (severity === 'high') {
    if (ALLOW_HIGH.has(name)) highAllowed.push(name);
    else highBlocked.push(name);
  }
}

console.log('### npm audit (omit=dev)');
console.log(
  JSON.stringify(
    {
      critical,
      highBlocked,
      highAllowed,
      counts: report.metadata?.vulnerabilities ?? {},
    },
    null,
    2,
  ),
);

if (critical.length > 0 || highBlocked.length > 0) {
  console.error(
    `\nAudit gate failed: critical=${critical.length} unexpected_high=${highBlocked.length}`,
  );
  process.exit(1);
}

console.log('\nAudit gate passed (no critical / unexpected high).');
