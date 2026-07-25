#!/usr/bin/env node
/**
 * Merge Amplify branch environment variables and point VITE_* at the given API URL.
 * Optionally start a RELEASE job.
 *
 * Usage:
 *   node scripts/ci/amplify-sync-branch-env.cjs --app-id=dxxx --branch=fb-1/foo --api-url=https://....amazonaws.com [--start-job]
 *
 * Env: AMPLIFY_APP_ID, AMPLIFY_BRANCH, API_URL / VITE_API_BASE_URL, AWS_REGION
 * Optional: VITE_BASE_FEE, VITE_DELIVERY_FEE
 *
 * refs specs/feature-env-urls-teardown/spec.md · ADR 0016
 */
const { execFileSync } = require('node:child_process');

function arg(name, envName, fallback = '') {
  const pref = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(pref));
  if (hit) return hit.slice(pref.length);
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0 && process.argv[idx + 1] && !process.argv[idx + 1].startsWith('--')) {
    return process.argv[idx + 1];
  }
  return process.env[envName] || fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function awsJson(region, args) {
  const out = execFileSync('aws', ['--region', region, ...args, '--output', 'json'], {
    encoding: 'utf8',
  });
  return JSON.parse(out || '{}');
}

function awsText(region, args) {
  return execFileSync('aws', ['--region', region, ...args, '--output', 'text'], {
    encoding: 'utf8',
  }).trim();
}

/** Merge maps; vite keys win. */
function mergeEnv(existing, vite) {
  return { ...(existing || {}), ...vite };
}

/** AWS CLI map form: KEY=VAL,KEY2=VAL2 (commas inside values not supported). */
function toCliMap(env) {
  return Object.entries(env)
    .map(([k, v]) => `${k}=${v}`)
    .join(',');
}

function amplifyHostUrl(appId, branch, region) {
  const domain = awsText(region, [
    'amplify',
    'get-app',
    '--app-id',
    appId,
    '--query',
    'app.defaultDomain',
  ]);
  const host = String(branch).replace(/\//g, '-');
  return `https://${host}.${domain}`;
}

function main() {
  const appId = arg('app-id', 'AMPLIFY_APP_ID');
  const branch = arg('branch', 'AMPLIFY_BRANCH');
  const apiUrl = (
    arg('api-url', 'API_URL') || arg('api-url', 'VITE_API_BASE_URL')
  ).replace(/\/$/, '');
  const region = arg('region', 'AWS_REGION', 'us-east-1');
  const baseFee = arg('base-fee', 'VITE_BASE_FEE', '1500');
  const deliveryFee = arg('delivery-fee', 'VITE_DELIVERY_FEE', '5000');
  const startJob = hasFlag('start-job') || process.env.AMPLIFY_START_JOB === 'true';

  if (!appId || !branch || !apiUrl) {
    console.error('Required: --app-id, --branch, --api-url');
    process.exit(2);
  }

  const vite = {
    VITE_MOCK_MODE: 'false',
    VITE_API_BASE_URL: apiUrl,
    VITE_BASE_FEE: baseFee,
    VITE_DELIVERY_FEE: deliveryFee,
  };

  let existed = false;
  let existing = {};
  try {
    const br = awsJson(region, [
      'amplify',
      'get-branch',
      '--app-id',
      appId,
      '--branch-name',
      branch,
    ]);
    existed = true;
    existing = br.branch?.environmentVariables || {};
  } catch {
    existed = false;
  }

  const merged = mergeEnv(existing, vite);
  const cliMap = toCliMap(merged);

  if (existed) {
    console.error(`Updating Amplify branch env: ${branch}`);
    execFileSync(
      'aws',
      [
        '--region',
        region,
        'amplify',
        'update-branch',
        '--app-id',
        appId,
        '--branch-name',
        branch,
        '--environment-variables',
        cliMap,
        '--enable-auto-build',
      ],
      { stdio: ['ignore', 'pipe', 'inherit'] },
    );
  } else {
    console.error(`Creating Amplify branch: ${branch}`);
    execFileSync(
      'aws',
      [
        '--region',
        region,
        'amplify',
        'create-branch',
        '--app-id',
        appId,
        '--branch-name',
        branch,
        '--framework',
        'Web',
        '--stage',
        'DEVELOPMENT',
        '--enable-auto-build',
        '--environment-variables',
        cliMap,
      ],
      { stdio: ['ignore', 'pipe', 'inherit'] },
    );
  }

  const feUrl = amplifyHostUrl(appId, branch, region);
  let jobId = '';
  if (startJob) {
    jobId = awsText(region, [
      'amplify',
      'start-job',
      '--app-id',
      appId,
      '--branch-name',
      branch,
      '--job-type',
      'RELEASE',
      '--query',
      'jobSummary.jobId',
    ]);
    console.error(`Started Amplify RELEASE job=${jobId}`);
  }

  // Sole stdout line — safe for RESULT=$(…) capture
  process.stdout.write(
    `${JSON.stringify({
      amplifyUrl: feUrl,
      amplifyBranch: branch,
      apiUrl,
      jobId: jobId || null,
      envKeys: Object.keys(merged).sort(),
    })}\n`,
  );
}

module.exports = { mergeEnv, toCliMap };

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}
