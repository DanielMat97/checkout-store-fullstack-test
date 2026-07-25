#!/usr/bin/env node
/**
 * Poll URL until HTTP status is in okStatuses or timeout.
 * Usage: node scripts/ci/wait-http-ready.cjs <url> [timeoutSec=600] [intervalSec=10]
 */
const url = process.argv[2];
const timeoutSec = Number(process.argv[3] ?? 600);
const intervalSec = Number(process.argv[4] ?? 10);

if (!url) {
  console.error('Usage: wait-http-ready.cjs <url> [timeoutSec] [intervalSec]');
  process.exit(2);
}

const deadline = Date.now() + timeoutSec * 1000;

async function once() {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { Accept: 'text/html,application/json,*/*' },
    });
    return res.status >= 200 && res.status < 500;
  } catch {
    return false;
  }
}

(async () => {
  process.stdout.write(`Waiting for ready: ${url} (timeout ${timeoutSec}s)\n`);
  while (Date.now() < deadline) {
    if (await once()) {
      console.log(`Ready: ${url}`);
      process.exit(0);
    }
    await new Promise((r) => setTimeout(r, intervalSec * 1000));
    process.stdout.write('.');
  }
  console.error(`\nTimeout waiting for ${url}`);
  process.exit(1);
})();
