#!/usr/bin/env node
/**
 * Print HttpApiUrl from the last serverless deploy info, or from AWS CloudFormation.
 * Usage: node scripts/ci/print-api-url.mjs [stage]
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const stage = process.argv[2] || process.env.STAGE || 'dev';
const region = process.env.AWS_REGION || 'us-east-1';

function fromServerlessInfo() {
  const infoPath = path.join(process.cwd(), '.serverless', 'serverless-state.json');
  if (!fs.existsSync(infoPath)) return null;
  try {
    const state = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
    const outputs = state?.service?.outputs || state?.outputs;
    if (outputs?.HttpApiUrl) return outputs.HttpApiUrl;
  } catch {
    return null;
  }
  return null;
}

function fromCf() {
  const stack = `checkout-api-${stage}`;
  try {
    const raw = execSync(
      `aws cloudformation describe-stacks --stack-name ${stack} --region ${region} --query "Stacks[0].Outputs[?OutputKey=='HttpApiUrl'].OutputValue" --output text`,
      { encoding: 'utf8' },
    ).trim();
    return raw && raw !== 'None' ? raw : null;
  } catch {
    return null;
  }
}

function fromServerlessCli() {
  try {
    const out = execSync(`npx serverless info --stage ${stage} --verbose`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const match = out.match(
      /https:\/\/[a-z0-9]+\.execute-api\.[a-z0-9-]+\.amazonaws\.com[^\s]*/i,
    );
    return match?.[0] ?? null;
  } catch {
    return null;
  }
}

const url = fromCf() || fromServerlessCli() || fromServerlessInfo();
if (!url) {
  console.error(`Could not resolve HttpApiUrl for stage=${stage}`);
  process.exit(1);
}
process.stdout.write(`${url.replace(/\/$/, '')}\n`);
