#!/usr/bin/env node
/**
 * Shared Vault helpers (KV v2 at mount "secret").
 */
const fs = require('node:fs');
const path = require('node:path');

const PATHS = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'paths.json'), 'utf8'),
);

function normalizeStage(stage) {
  const s = String(stage || 'dev').trim();
  if (!s) return 'dev';
  if (s === 'prod' || s === 'dev' || s === 'feature') return s;
  if (/^fb-/i.test(s)) return 'feature';
  return s;
}

function kvPrefix(stage) {
  const n = normalizeStage(stage);
  return `checkout/${n}`;
}

/** Logical path without mount/data: checkout/prod/payment */
function logicalPath(stage, bundle) {
  return `${kvPrefix(stage)}/${bundle}`;
}

/** vault CLI / HTTP KV v2 data path: secret/data/checkout/prod/payment */
function kvDataPath(stage, bundle) {
  return `secret/data/${logicalPath(stage, bundle)}`;
}

/** For vault-action "secrets:" lines */
function vaultActionSecretLines(stage) {
  const prefix = kvPrefix(stage);
  return [
    `secret/data/${prefix}/payment api_url | PAYMENT_API_URL ;`,
    `secret/data/${prefix}/payment public_key | PAYMENT_PUBLIC_KEY ;`,
    `secret/data/${prefix}/payment private_key | PAYMENT_PRIVATE_KEY ;`,
    `secret/data/${prefix}/payment integrity_key | PAYMENT_INTEGRITY_KEY ;`,
    `secret/data/${prefix}/payment events_key | PAYMENT_EVENTS_KEY ;`,
    `secret/data/${prefix}/payment currency | PAYMENT_CURRENCY ;`,
    `secret/data/${prefix}/app payment_gateway_mode | PAYMENT_GATEWAY_MODE ;`,
    `secret/data/${prefix}/app cors_origin | CORS_ORIGIN ;`,
    `secret/data/${prefix}/app base_fee | BASE_FEE ;`,
    `secret/data/${prefix}/app delivery_fee | DELIVERY_FEE ;`,
    `secret/data/${prefix}/aws access_key_id | AWS_ACCESS_KEY_ID ;`,
    `secret/data/${prefix}/aws secret_access_key | AWS_SECRET_ACCESS_KEY ;`,
  ].join('\n');
}

function fieldToEnv(bundle, field) {
  const map = {
    payment: {
      api_url: 'PAYMENT_API_URL',
      public_key: 'PAYMENT_PUBLIC_KEY',
      private_key: 'PAYMENT_PRIVATE_KEY',
      integrity_key: 'PAYMENT_INTEGRITY_KEY',
      events_key: 'PAYMENT_EVENTS_KEY',
      currency: 'PAYMENT_CURRENCY',
    },
    aws: {
      access_key_id: 'AWS_ACCESS_KEY_ID',
      secret_access_key: 'AWS_SECRET_ACCESS_KEY',
    },
    app: {
      payment_gateway_mode: 'PAYMENT_GATEWAY_MODE',
      cors_origin: 'CORS_ORIGIN',
      base_fee: 'BASE_FEE',
      delivery_fee: 'DELIVERY_FEE',
    },
  };
  return map[bundle]?.[field];
}

module.exports = {
  PATHS,
  normalizeStage,
  kvPrefix,
  logicalPath,
  kvDataPath,
  vaultActionSecretLines,
  fieldToEnv,
};
