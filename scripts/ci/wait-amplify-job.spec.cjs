#!/usr/bin/env node
const assert = require('node:assert/strict');
const {
  commitMatches,
  pickJobId,
  isTerminalOk,
  isTerminalBad,
} = require('./wait-amplify-job.cjs');

assert.equal(commitMatches('abc123def', 'abc123def'), true);
assert.equal(commitMatches('abc123def456', 'abc123def'), true);
assert.equal(commitMatches('abc123', 'abc123def'), true);
assert.equal(commitMatches('zzzz', 'yyyy'), false);

assert.equal(isTerminalOk('SUCCEED'), true);
assert.equal(isTerminalOk('FAILED'), false);
assert.equal(isTerminalBad('FAILED'), true);
assert.equal(isTerminalBad('CANCELLED'), true);
assert.equal(isTerminalBad('RUNNING'), false);

assert.equal(
  pickJobId(
    [
      { jobId: '2', status: 'FAILED', commitId: 'aaa' },
      { jobId: '3', status: 'RUNNING', commitId: 'bbb' },
    ],
    '',
    '3',
  ),
  '3',
);

assert.equal(
  pickJobId(
    [
      { jobId: '9', status: 'SUCCEED', commitId: 'other' },
      { jobId: '4', status: 'RUNNING', commitId: 'deadbeef01' },
    ],
    'deadbeef01',
    '',
  ),
  '4',
);

assert.equal(
  pickJobId(
    [
      { jobId: '1', status: 'SUCCEED', commitId: 'a' },
      { jobId: '5', status: 'PENDING', commitId: 'b' },
    ],
    '',
    '',
  ),
  '5',
);

assert.equal(pickJobId([{ jobId: '2', status: 'SUCCEED', commitId: 'a' }], '', ''), '2');

console.log('wait-amplify-job helpers ok');
