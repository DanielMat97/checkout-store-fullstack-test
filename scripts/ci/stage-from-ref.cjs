#!/usr/bin/env node
/**
 * Derive a CloudFormation-safe Serverless stage + Amplify branch slug from a git ref.
 *
 * Examples:
 *   refs/heads/fb-123/add-fees  → stage=fb-123-add-fees, amplifyBranch=fb-123/add-fees
 *   refs/tags/fb-456/smoke      → stage=fb-456-smoke
 *
 * Prints JSON: { stage, amplifyBranch, isFeature, raw }
 */
const raw =
  process.argv[2] || process.env.GITHUB_REF_NAME || process.env.GITHUB_REF || '';

const ref = raw
  .replace(/^refs\/heads\//, '')
  .replace(/^refs\/tags\//, '')
  .trim();

const isFeature = /^(fb-[A-Za-z0-9._-]+)(\/|$)/.test(ref);

/** Amplify keeps the branch name as-is (with /). */
const amplifyBranch = ref;

/** Serverless/CFN stage: lowercase, [a-z0-9-], max ~20 recommended. */
let stage = ref
  .toLowerCase()
  .replace(/[^a-z0-9-]+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 28);

if (!stage) stage = 'dev';

process.stdout.write(
  `${JSON.stringify({ stage, amplifyBranch, isFeature, raw: ref })}\n`,
);
