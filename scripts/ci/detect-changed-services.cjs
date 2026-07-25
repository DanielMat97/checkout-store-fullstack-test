#!/usr/bin/env node
/**
 * Detect which Lambda functions need redeploy based on git path changes.
 * Prints JSON: { "mode": "full"|"functions"|"none", "functions": ["products", ...] }
 *
 * Usage:
 *   node scripts/ci/detect-changed-services.mjs [baseRef] [headRef]
 * Defaults: BASE_REF / GITHUB_EVENT before-sha, HEAD = HEAD
 */
const { execSync } = require('node:child_process');

const SERVICE_DIRS = {
  products: 'services/products/',
  customers: 'services/customers/',
  deliveries: 'services/deliveries/',
  transactions: 'services/transactions/',
};

/** When transactions package changes, also redeploy SQS worker (same package). */
const FUNCTION_ALIASES = {
  transactions: ['transactions', 'ordersWorker'],
};

const FULL_STACK_PATTERNS = [
  /^serverless\.(ts|js|yml|yaml)$/,
  /^package(-lock)?\.json$/,
  /^packages\/shared\//,
  /^packages\/persistence\//,
  /^\.github\/workflows\/deploy-/,
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
    return sh(`git ls-files`).split('\n').filter(Boolean);
  }
}

const base =
  process.argv[2] || process.env.BASE_REF || process.env.GITHUB_EVENT_BEFORE || '';
const head = process.argv[3] || process.env.HEAD_REF || 'HEAD';

const files = changedFiles(base, head);
const hitFull = files.some((f) => FULL_STACK_PATTERNS.some((re) => re.test(f)));

const functions = Object.entries(SERVICE_DIRS)
  .filter(([, prefix]) => files.some((f) => f.startsWith(prefix)))
  .map(([name]) => name);

const expanded = [
  ...new Set(functions.flatMap((name) => FUNCTION_ALIASES[name] ?? [name])),
];

let mode = 'none';
if (hitFull || functions.length >= 3) {
  mode = 'full';
} else if (functions.length > 0) {
  mode = 'functions';
} else if (files.some((f) => f.startsWith('apps/web/'))) {
  mode = 'none'; // FE-only → Amplify owns it
} else if (files.length > 0) {
  // Docs/scripts-only — skip API deploy
  mode = 'none';
}

const result = {
  mode: hitFull ? 'full' : mode,
  functions: hitFull
    ? [...Object.keys(SERVICE_DIRS), 'ordersWorker']
    : expanded,
  files,
};
process.stdout.write(`${JSON.stringify(result)}\n`);
