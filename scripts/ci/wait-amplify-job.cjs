#!/usr/bin/env node
/**
 * Wait until an Amplify job reaches a terminal status. Exit 0 only on SUCCEED.
 *
 * Usage:
 *   node scripts/ci/wait-amplify-job.cjs --app-id=dxxx --branch=master [--job-id=3] [--commit=SHA]
 *   AMPLIFY_APP_ID=... AMPLIFY_BRANCH=master GITHUB_SHA=... node scripts/ci/wait-amplify-job.cjs
 *
 * Options / env:
 *   --app-id / AMPLIFY_APP_ID (required)
 *   --branch / AMPLIFY_BRANCH (default: master)
 *   --job-id / AMPLIFY_JOB_ID (optional — skip discovery)
 *   --commit / GITHUB_SHA (optional — match list-jobs commitId)
 *   --timeout-sec (default 900)
 *   --interval-sec (default 15)
 *   --region / AWS_REGION (default us-east-1)
 *
 * refs specs/amplify-build-gate/spec.md · ADR 0015
 */
const { execFileSync } = require('node:child_process');

const TERMINAL_OK = new Set(['SUCCEED']);
const TERMINAL_BAD = new Set(['FAILED', 'CANCELLED']);

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

function awsJson(region, args) {
  const out = execFileSync('aws', ['--region', region, ...args, '--output', 'json'], {
    encoding: 'utf8',
  });
  return JSON.parse(out || '{}');
}

function normalizeCommit(sha) {
  return String(sha || '')
    .trim()
    .toLowerCase();
}

function commitMatches(jobCommit, want) {
  const a = normalizeCommit(jobCommit);
  const b = normalizeCommit(want);
  if (!a || !b) return false;
  return a === b || a.startsWith(b) || b.startsWith(a);
}

function isTerminalOk(status) {
  return TERMINAL_OK.has(String(status || '').toUpperCase());
}

function isTerminalBad(status) {
  return TERMINAL_BAD.has(String(status || '').toUpperCase());
}

/**
 * Pick best job id from list-jobs summaries.
 * Prefer: matching commit → RUNNING/PENDING → newest by jobId numeric.
 */
function pickJobId(summaries, commitSha, preferredJobId) {
  const list = Array.isArray(summaries) ? summaries : [];
  if (preferredJobId) {
    const hit = list.find((j) => String(j.jobId) === String(preferredJobId));
    if (hit) return String(hit.jobId);
    return String(preferredJobId);
  }
  if (commitSha) {
    const byCommit = list.filter((j) => commitMatches(j.commitId, commitSha));
    if (byCommit.length) {
      byCommit.sort((a, b) => Number(b.jobId) - Number(a.jobId));
      return String(byCommit[0].jobId);
    }
  }
  const active = list.filter((j) => {
    const s = String(j.status || '').toUpperCase();
    return !isTerminalOk(s) && !isTerminalBad(s);
  });
  if (active.length) {
    active.sort((a, b) => Number(b.jobId) - Number(a.jobId));
    return String(active[0].jobId);
  }
  if (list.length) {
    const sorted = [...list].sort((a, b) => Number(b.jobId) - Number(a.jobId));
    return String(sorted[0].jobId);
  }
  return '';
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const appId = arg('app-id', 'AMPLIFY_APP_ID');
  const branch = arg('branch', 'AMPLIFY_BRANCH', 'master');
  const jobIdArg = arg('job-id', 'AMPLIFY_JOB_ID');
  const commit = arg('commit', 'GITHUB_SHA');
  const region = arg('region', 'AWS_REGION', 'us-east-1');
  const timeoutSec = Number(arg('timeout-sec', 'AMPLIFY_WAIT_TIMEOUT_SEC', '900'));
  const intervalSec = Number(arg('interval-sec', 'AMPLIFY_WAIT_INTERVAL_SEC', '15'));

  if (!appId) {
    console.error('wait-amplify-job: AMPLIFY_APP_ID / --app-id is required');
    process.exit(2);
  }

  let jobId = jobIdArg;
  const deadline = Date.now() + timeoutSec * 1000;

  console.log(
    `wait-amplify-job: app=${appId} branch=${branch} jobId=${jobId || '(discover)'} commit=${commit || '(any)'} timeout=${timeoutSec}s`,
  );

  while (Date.now() < deadline) {
    if (!jobId) {
      const listed = awsJson(region, [
        'amplify',
        'list-jobs',
        '--app-id',
        appId,
        '--branch-name',
        branch,
        '--max-results',
        '20',
      ]);
      jobId = pickJobId(listed.jobSummaries, commit, '');
      if (!jobId) {
        process.stdout.write('.');
        await sleep(intervalSec * 1000);
        continue;
      }
      console.log(`\nDiscovered jobId=${jobId}`);
    }

    const detail = awsJson(region, [
      'amplify',
      'get-job',
      '--app-id',
      appId,
      '--branch-name',
      branch,
      '--job-id',
      jobId,
    ]);
    const summary = detail.job?.summary || {};
    const status = String(summary.status || '').toUpperCase();
    const jobCommit = summary.commitId || '';
    console.log(
      `job ${jobId} status=${status} commit=${jobCommit.slice(0, 12) || 'n/a'}`,
    );

    if (commit && jobCommit && !commitMatches(jobCommit, commit)) {
      if (jobIdArg) {
        console.log(
          `commit mismatch (job=${jobCommit.slice(0, 12)} want=${commit.slice(0, 12)}) — trusting --job-id`,
        );
      } else {
        console.log('commit mismatch — rediscovering…');
        jobId = '';
        await sleep(intervalSec * 1000);
        continue;
      }
    }

    if (isTerminalOk(status)) {
      console.log(`Amplify build SUCCEED (job ${jobId})`);
      process.exit(0);
    }
    if (isTerminalBad(status)) {
      console.error(`Amplify build ${status} (job ${jobId}) — failing gate`);
      process.exit(1);
    }

    await sleep(intervalSec * 1000);
  }

  console.error(`Timeout waiting for Amplify job (app=${appId} branch=${branch})`);
  process.exit(1);
}

module.exports = {
  commitMatches,
  pickJobId,
  isTerminalOk,
  isTerminalBad,
};

if (require.main === module) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
