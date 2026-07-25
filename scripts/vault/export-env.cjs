#!/usr/bin/env node
/**
 * Export Vault KV secrets for a stage to .env format (stdout or --out=file).
 * Also supports --github-env to append KEY=VALUE lines suitable for $GITHUB_ENV
 * (multiline-safe via printf).
 *
 * Usage:
 *   VAULT_ADDR=… VAULT_TOKEN=… npm run vault:export -- --stage=dev
 *   npm run vault:export -- --stage=prod --out=.env.vault
 *   npm run vault:export -- --stage=feature --github-env
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const { normalizeStage, logicalPath, fieldToEnv } = require('./lib.cjs');

function parseArgs(argv) {
  let stage = 'dev';
  let out = '';
  let githubEnv = false;
  for (const a of argv) {
    if (a.startsWith('--stage=')) stage = a.slice('--stage='.length);
    else if (a.startsWith('--out=')) out = a.slice('--out='.length);
    else if (a === '--github-env') githubEnv = true;
  }
  return { stage, out, githubEnv };
}

function kvGet(stage, bundle) {
  const p = logicalPath(stage, bundle);
  try {
    const raw = execSync(`vault kv get -format=json secret/${p}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const json = JSON.parse(raw);
    return json?.data?.data || {};
  } catch {
    return {};
  }
}

function collect(stage) {
  const env = {};
  for (const bundle of ['payment', 'app', 'aws']) {
    const data = kvGet(stage, bundle);
    for (const [field, value] of Object.entries(data)) {
      const key = fieldToEnv(bundle, field);
      if (key && value != null && String(value) !== '') {
        env[key] = String(value);
      }
    }
  }
  return env;
}

function toDotEnv(env) {
  return (
    Object.entries(env)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n') + '\n'
  );
}

function appendGitHubEnv(env) {
  const file = process.env.GITHUB_ENV;
  if (!file) {
    console.error('GITHUB_ENV is not set');
    process.exit(1);
  }
  const lines = Object.entries(env)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  fs.appendFileSync(file, `${lines}\n`);
  console.error(`Wrote ${Object.keys(env).length} keys to GITHUB_ENV`);
}

function main() {
  if (!process.env.VAULT_ADDR || !process.env.VAULT_TOKEN) {
    console.error('VAULT_ADDR and VAULT_TOKEN are required');
    process.exit(1);
  }
  const { stage, out, githubEnv } = parseArgs(process.argv.slice(2));
  const s = normalizeStage(stage);
  const env = collect(s);
  if (Object.keys(env).length === 0) {
    console.error(`No secrets found for stage=${s}. Run vault:seed first.`);
    process.exit(1);
  }

  if (githubEnv) {
    appendGitHubEnv(env);
    return;
  }

  const text = toDotEnv(env);
  if (out) {
    fs.writeFileSync(out, text, 'utf8');
    console.error(`Wrote ${out} (${Object.keys(env).length} keys)`);
  } else {
    process.stdout.write(text);
  }
}

main();
