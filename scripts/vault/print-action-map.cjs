#!/usr/bin/env node
/**
 * Print vault-action secret mapping for a stage (for debugging / docs).
 * Usage: node scripts/vault/print-action-map.cjs --stage=prod
 */
const { normalizeStage, vaultActionSecretLines } = require('./lib.cjs');

const stageArg =
  process.argv.find((a) => a.startsWith('--stage='))?.slice('--stage='.length) ||
  'prod';
process.stdout.write(`${vaultActionSecretLines(normalizeStage(stageArg))}\n`);
