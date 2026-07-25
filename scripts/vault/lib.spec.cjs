#!/usr/bin/env node
const assert = require('node:assert/strict');
const { normalizeStage, logicalPath, kvDataPath, fieldToEnv } = require('./lib.cjs');

assert.equal(normalizeStage('fb-42/add-fees'), 'feature');
assert.equal(normalizeStage('prod'), 'prod');
assert.equal(normalizeStage('dev'), 'dev');
assert.equal(logicalPath('prod', 'payment'), 'checkout/prod/payment');
assert.equal(kvDataPath('feature', 'app'), 'secret/data/checkout/feature/app');
assert.equal(fieldToEnv('payment', 'private_key'), 'PAYMENT_PRIVATE_KEY');
assert.equal(fieldToEnv('app', 'cors_origin'), 'CORS_ORIGIN');

console.log('vault lib ok');
