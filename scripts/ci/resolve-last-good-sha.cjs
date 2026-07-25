#!/usr/bin/env node
/**
 * Resolve last successful deploy-api workflow head SHA (excluding current run).
 * Requires: GH_TOKEN or GITHUB_TOKEN with actions:read.
 *
 * Usage: node scripts/ci/resolve-last-good-sha.cjs
 * Env: GITHUB_REPOSITORY, GITHUB_RUN_ID (optional exclude), WORKFLOW_FILE=deploy-api.yml
 */
const { execSync } = require('child_process');

const repo = process.env.GITHUB_REPOSITORY;
const currentRun = process.env.GITHUB_RUN_ID ?? '';
const workflow = process.env.WORKFLOW_FILE ?? 'deploy-api.yml';

if (!repo) {
  console.error('GITHUB_REPOSITORY required');
  process.exit(2);
}

function gh(args) {
  return execSync(`gh ${args}`, {
    encoding: 'utf8',
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

try {
  const raw = gh(
    `run list --repo "${repo}" --workflow "${workflow}" --status success --limit 20 --json databaseId,headSha,conclusion,status`,
  );
  const runs = JSON.parse(raw);
  const good = runs.find((r) => String(r.databaseId) !== String(currentRun) && r.headSha);
  if (!good) {
    console.log(JSON.stringify({ previousSha: null, reason: 'no_prior_success' }));
    process.exit(0);
  }
  console.log(JSON.stringify({ previousSha: good.headSha, runId: good.databaseId }));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  console.log(JSON.stringify({ previousSha: null, reason: 'lookup_failed' }));
  process.exit(0);
}
