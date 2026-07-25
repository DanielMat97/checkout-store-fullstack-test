#!/usr/bin/env node
/**
 * Seed Vault KV v2 with placeholder (or env-sourced) secrets for checkout stages.
 *
 * Requires: vault CLI, VAULT_ADDR, VAULT_TOKEN
 *
 * Usage:
 *   VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=root npm run vault:seed
 *   npm run vault:seed -- --stage=prod
 *
 * Values: reads process.env for real keys when present; else writes safe placeholders.
 */
const { execSync } = require('node:child_process');
const { normalizeStage, logicalPath } = require('./lib.cjs');

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function vault(args) {
  return sh(`vault ${args}`);
}

function parseArgs(argv) {
  let stage = 'all';
  for (const a of argv) {
    if (a.startsWith('--stage=')) stage = a.slice('--stage='.length);
  }
  return { stage };
}

function ensureKv() {
  try {
    vault('secrets list -format=json');
  } catch {
    // ignore
  }
  try {
    vault('secrets enable -path=secret kv-v2');
  } catch (error) {
    const msg = String(error.stderr || error.message || error);
    if (!/path is already in use|already enabled/i.test(msg)) {
      // vault CLI often prints to stderr via thrown status
    }
  }
}

function put(stage, bundle, data) {
  const path = logicalPath(stage, bundle);
  const entries = Object.entries(data).filter(
    ([, v]) => v != null && String(v).length > 0,
  );
  if (entries.length === 0) {
    console.log(`skip empty ${path}`);
    return;
  }
  const flat = entries.map(([k, v]) => `${k}=${shellQuote(String(v))}`).join(' ');
  console.log(`put secret/${path}`);
  execSync(`vault kv put secret/${path} ${flat}`, { stdio: 'inherit' });
}

function shellQuote(value) {
  if (/^[A-Za-z0-9_./:@+-]+$/.test(value)) return value;
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function paymentBundle() {
  return {
    api_url: process.env.PAYMENT_API_URL || 'https://payment.example.test/v1',
    public_key: process.env.PAYMENT_PUBLIC_KEY || 'pub_test_replace_me',
    private_key: process.env.PAYMENT_PRIVATE_KEY || 'prv_test_replace_me',
    integrity_key: process.env.PAYMENT_INTEGRITY_KEY || 'int_test_replace_me',
    events_key: process.env.PAYMENT_EVENTS_KEY || 'evt_test_replace_me',
    currency: process.env.PAYMENT_CURRENCY || 'COP',
  };
}

function awsBundle() {
  return {
    access_key_id: process.env.AWS_ACCESS_KEY_ID || '',
    secret_access_key: process.env.AWS_SECRET_ACCESS_KEY || '',
  };
}

function appBundle(stage) {
  const mode =
    process.env.PAYMENT_GATEWAY_MODE ||
    (stage === 'feature' ? 'fake' : stage === 'prod' ? 'sandbox' : 'fake');
  return {
    payment_gateway_mode: mode,
    cors_origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    base_fee: process.env.BASE_FEE || '1500',
    delivery_fee: process.env.DELIVERY_FEE || '5000',
  };
}

function seedStage(stage) {
  const s = normalizeStage(stage);
  put(s, 'payment', paymentBundle());
  put(s, 'app', appBundle(s));
  const aws = awsBundle();
  if (aws.access_key_id && aws.secret_access_key) {
    put(s, 'aws', aws);
  } else {
    console.log(`skip aws for ${s} (set AWS_* to seed)`);
  }
}

function main() {
  if (!process.env.VAULT_ADDR) {
    console.error('VAULT_ADDR is required (e.g. http://127.0.0.1:8200)');
    process.exit(1);
  }
  if (!process.env.VAULT_TOKEN) {
    console.error('VAULT_TOKEN is required');
    process.exit(1);
  }

  const { stage } = parseArgs(process.argv.slice(2));
  ensureKv();

  const stages = stage === 'all' ? ['dev', 'prod', 'feature'] : [stage];
  for (const s of stages) {
    console.log(`\n=== seed stage=${normalizeStage(s)} ===`);
    seedStage(s);
  }
  console.log('\nDone. Export with: npm run vault:export -- --stage=dev');
}

main();
