#!/usr/bin/env node
/**
 * Detect whether this push/ref should run the Amplify build gate.
 *
 * Usage:
 *   node scripts/ci/detect-fe-amplify.cjs [baseRef] [headRef]
 * Prints JSON: { "feAmplify": true|false, "files": number }
 *
 * refs specs/amplify-build-gate/spec.md
 */
const { execSync } = require('node:child_process');

const FE_AMPLIFY_PATTERNS = [
  /^apps\/web\//,
  /^amplify\.yml$/,
  /^packages\/shared\//,
  /^package(-lock)?\.json$/,
];

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

function changedFiles(base, head) {
  try {
    if (base) {
      return sh(`git diff --name-only ${base}...${head}`).split('\n').filter(Boolean);
    }
  } catch {
    // fall through
  }
  try {
    return sh(`git diff --name-only HEAD~1...${head}`).split('\n').filter(Boolean);
  } catch {
    return sh('git ls-files').split('\n').filter(Boolean);
  }
}

const base =
  process.argv[2] || process.env.BASE_REF || process.env.GITHUB_EVENT_BEFORE || '';
const head = process.argv[3] || process.env.HEAD_REF || 'HEAD';
const files = changedFiles(base, head);
const feAmplify = files.some((f) => FE_AMPLIFY_PATTERNS.some((re) => re.test(f)));

process.stdout.write(`${JSON.stringify({ feAmplify, files: files.length })}\n`);
