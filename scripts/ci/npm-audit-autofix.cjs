#!/usr/bin/env node
/**
 * Apply `npm audit fix` (optional --force) and report dirty state + branch slug.
 * Used by `.github/workflows/security-audit-autofix.yml` (ADR 0017).
 *
 * Outputs (GITHUB_OUTPUT when set):
 *   dirty=true|false
 *   slug=<kebab>
 *   summary=<one-line>
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const allowForce = process.argv.includes('--force');
const outFile = process.env.GITHUB_OUTPUT;

function sh(cmd, opts = {}) {
  return execSync(cmd, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...opts,
  });
}

function writeOutput(map) {
  const lines = Object.entries(map).map(([k, v]) => `${k}=${v}`);
  console.log(lines.join('\n'));
  if (outFile) {
    fs.appendFileSync(outFile, `${lines.join('\n')}\n`);
  }
}

function slugify(raw) {
  return String(raw)
    .toLowerCase()
    .replace(/^@/, '')
    .replace(/\//g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

function firstVulnerablePackage() {
  try {
    sh('npm audit --json --omit=dev');
    return null;
  } catch (error) {
    const stdout = error.stdout?.toString?.() || '';
    try {
      const report = JSON.parse(stdout);
      const names = Object.keys(report.vulnerabilities || {});
      return names[0] || null;
    } catch {
      return null;
    }
  }
}

const pkgBefore = fs.readFileSync(path.join(process.cwd(), 'package-lock.json'), 'utf8');

try {
  const fixCmd = allowForce ? 'npm audit fix --force' : 'npm audit fix';
  console.log(`Running: ${fixCmd}`);
  try {
    sh(fixCmd);
  } catch (error) {
    // npm audit fix exits non-zero when some vulns remain — still may have changed lockfile.
    console.log(error.stdout?.toString?.() || error.message);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const pkgAfter = fs.readFileSync(path.join(process.cwd(), 'package-lock.json'), 'utf8');
const dirty = pkgBefore !== pkgAfter;

if (!dirty) {
  writeOutput({
    dirty: 'false',
    slug: '',
    summary: 'npm audit fix produced no lockfile changes',
  });
  process.exit(0);
}

const pkg = firstVulnerablePackage() || 'npm-audit';
const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const slug = slugify(`${pkg}-${date}`) || `npm-audit-${date}`;

writeOutput({
  dirty: 'true',
  slug,
  summary: `npm audit fix updated lockfile (slug=${slug}${allowForce ? ', force' : ''})`,
});
