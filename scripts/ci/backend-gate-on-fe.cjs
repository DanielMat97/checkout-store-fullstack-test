#!/usr/bin/env node
/**
 * When apps/web/ (or FE-related CI config) changed vs base, run Nest BE:
 * test → test:cov → audit.
 *
 * Usage:
 *   node scripts/ci/backend-gate-on-fe.cjs [baseRef] [headRef]
 * Exit 0 on skip (no FE changes) or success; non-zero on BE failure.
 *
 * refs specs/frontend-hooks-coverage/spec.md
 */
const { execSync } = require('node:child_process');
const { spawnSync } = require('node:child_process');

const FE_PATTERNS = [
  /^apps\/web\//,
  /^\.github\/workflows\/ci\.yml$/,
  /^scripts\/ci\/backend-gate-on-fe\.cjs$/,
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
    return sh('git status --porcelain')
      .split('\n')
      .filter(Boolean)
      .map((line) => line.replace(/^[ M\?ADRCU]{1,2}\s+/, ''));
  }
}

const base =
  process.argv[2] || process.env.BASE_REF || process.env.GITHUB_EVENT_BEFORE || '';
const head = process.argv[3] || process.env.HEAD_REF || 'HEAD';
const files = changedFiles(base, head);
const feChanged = files.some((f) => FE_PATTERNS.some((re) => re.test(f)));

if (!feChanged) {
  process.stdout.write(
    `backend-gate-on-fe: skip (no FE changes among ${files.length} file(s))\n`,
  );
  process.exit(0);
}

process.stdout.write(
  `backend-gate-on-fe: FE changes detected — running Nest test + coverage + audit\n`,
);

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: false });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('npm', ['run', 'build:shared']);
for (const svc of ['products', 'customers', 'deliveries', 'transactions']) {
  run('npm', ['run', 'test', '-w', `@app/${svc}`]);
}
for (const svc of ['products', 'customers', 'deliveries', 'transactions']) {
  run('npm', ['run', 'test:cov', '-w', `@app/${svc}`]);
}
run('npm', ['run', 'audit']);

process.stdout.write('backend-gate-on-fe: OK\n');
