#!/usr/bin/env node
const assert = require('node:assert/strict');
const { mergeEnv, toCliMap } = require('./amplify-sync-branch-env.cjs');
const { MARKER, buildBody } = require('./post-env-urls-comment.cjs');

assert.deepEqual(
  mergeEnv({ A: '1', VITE_MOCK_MODE: 'true' }, { VITE_MOCK_MODE: 'false', B: '2' }),
  {
    A: '1',
    VITE_MOCK_MODE: 'false',
    B: '2',
  },
);
assert.equal(
  toCliMap({ VITE_MOCK_MODE: 'false', VITE_API_BASE_URL: 'https://x' }),
  'VITE_MOCK_MODE=false,VITE_API_BASE_URL=https://x',
);

const body = buildBody({
  kind: 'feature',
  feUrl: 'https://fb-1-foo.dxxx.amplifyapp.com',
  apiUrl: 'https://abc.execute-api.us-east-1.amazonaws.com',
  stage: 'fb-1-foo',
  amplifyBranch: 'fb-1/foo',
  sha: 'abcdef123456',
  destroyUrl: 'https://github.com/o/r/actions/workflows/destroy-feature.yml',
});
assert.ok(body.includes(MARKER));
assert.ok(body.includes('Frontend'));
assert.ok(body.includes('Destroy feature stack'));
assert.ok(body.includes('fb-1/foo'));

const prod = buildBody({
  kind: 'prod',
  feUrl: 'https://master.dxxx.amplifyapp.com',
  sha: 'abc',
});
assert.ok(prod.includes('Production frontend'));
assert.ok(!prod.includes('Tear down'));

console.log('feature-env-urls helpers ok');
