#!/usr/bin/env node
/**
 * List CloudWatch observability resources for a checkout-api stage (AWS CLI).
 *
 * Usage:
 *   node scripts/ops/describe-observability.cjs --stage=prod
 *   npm run ops:observability -- --stage=dev
 *
 * Requires: aws CLI configured (profile / env).
 */
const { execFileSync } = require('node:child_process');

function arg(name, fallback = '') {
  const pref = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(pref));
  if (hit) return hit.slice(pref.length);
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0 && process.argv[idx + 1] && !process.argv[idx + 1].startsWith('--')) {
    return process.argv[idx + 1];
  }
  return process.env[name.toUpperCase()] || fallback;
}

const stage = arg('stage', process.env.SERVERLESS_STAGE || 'dev');
const region = arg('region', process.env.AWS_REGION || 'us-east-1');
const profile = arg('profile', process.env.AWS_PROFILE || '');
const stack = `checkout-api-${stage}`;
const dashboard = `checkout-api-${stage}-ops`;

function aws(args) {
  const full = ['--region', region, ...args];
  if (profile) full.unshift('--profile', profile);
  return execFileSync('aws', full, { encoding: 'utf8' }).trim();
}

function section(title) {
  console.log(`\n=== ${title} ===`);
}

try {
  section(`Stack outputs (${stack})`);
  const outputs = aws([
    'cloudformation',
    'describe-stacks',
    '--stack-name',
    stack,
    '--query',
    'Stacks[0].Outputs',
    '--output',
    'json',
  ]);
  const parsed = JSON.parse(outputs || '[]');
  const interesting = [
    'ObservabilityDashboardName',
    'ObservabilityAlertsTopicArn',
    'CloudWatchViewerUserName',
    'HttpApiUrl',
    'StageName',
  ];
  for (const key of interesting) {
    const row = parsed.find((o) => o.OutputKey === key);
    if (row) console.log(`${key}: ${row.OutputValue}`);
  }

  section(`Dashboard ${dashboard}`);
  try {
    aws([
      'cloudwatch',
      'get-dashboard',
      '--dashboard-name',
      dashboard,
      '--output',
      'text',
    ]);
    console.log('exists: yes');
    console.log(
      `console: https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#dashboards:name=${dashboard}`,
    );
  } catch {
    console.log('exists: no (deploy stack first)');
  }

  section('Alarms (checkout-api-* )');
  const alarms = aws([
    'cloudwatch',
    'describe-alarms',
    '--alarm-name-prefix',
    `checkout-api-${stage}-`,
    '--query',
    'MetricAlarms[].{Name:AlarmName,State:StateValue,Metric:MetricName}',
    '--output',
    'table',
  ]);
  console.log(alarms || '(none)');

  section('SNS topics');
  const topicsJson = aws(['sns', 'list-topics', '--output', 'json']);
  const topicArns = JSON.parse(topicsJson || '{"Topics":[]}').Topics || [];
  const match = topicArns
    .map((t) => t.TopicArn)
    .filter((arn) => String(arn).includes(`checkout-api-${stage}-ops-alerts`));
  console.log(match.length ? match.join('\n') : '(none)');

  section('IAM viewer user');
  const user = `checkout-api-${stage}-cw-viewer`;
  try {
    aws([
      'iam',
      'get-user',
      '--user-name',
      user,
      '--query',
      'User.Arn',
      '--output',
      'text',
    ]);
    console.log(`user: ${user}`);
    console.log(
      'Create keys only locally: aws iam create-access-key --user-name ' + user,
    );
  } catch {
    console.log(`user ${user}: not found`);
  }

  console.log('\nOK — see docs/observability.md');
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
