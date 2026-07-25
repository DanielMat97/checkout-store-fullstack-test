#!/usr/bin/env node
/**
 * Sticky PR comment (or commit comment) with FE/API URLs + destroy workflow link.
 *
 * Env:
 *   GH_TOKEN / GITHUB_TOKEN
 *   GITHUB_REPOSITORY (owner/repo)
 *   GITHUB_SHA
 *   GITHUB_REF_NAME (branch)
 *   FE_URL, API_URL (optional), STAGE (optional), AMPLIFY_BRANCH (optional)
 *   DESTROY_WORKFLOW=destroy-feature.yml
 *   COMMENT_KIND=feature|prod
 *
 * refs specs/feature-env-urls-teardown/spec.md · ADR 0016
 */
const MARKER = '<!-- checkout-env-urls -->';

function buildBody(input) {
  const {
    kind = 'feature',
    feUrl = '',
    apiUrl = '',
    stage = '',
    amplifyBranch = '',
    sha = '',
    destroyUrl = '',
    runUrl = '',
  } = input;

  const lines = [
    MARKER,
    kind === 'prod' ? '### Production frontend' : '### Feature environment',
    '',
  ];
  if (feUrl) lines.push(`- **Frontend:** ${feUrl}`);
  if (apiUrl) lines.push(`- **API:** ${apiUrl}`);
  if (stage) lines.push(`- **Serverless stage:** \`${stage}\``);
  if (amplifyBranch) lines.push(`- **Amplify branch:** \`${amplifyBranch}\``);
  if (sha) lines.push(`- **Commit:** \`${sha.slice(0, 12)}\``);
  if (runUrl) lines.push(`- **Workflow run:** ${runUrl}`);
  lines.push('');
  if (kind === 'feature' && destroyUrl) {
    lines.push('#### Tear down this stack');
    lines.push(
      `Use the Actions button **[Destroy feature stack](${destroyUrl})** → Run workflow.`,
    );
    lines.push(
      `Set **ref_name** to \`${amplifyBranch || stage}\` and **confirm** to \`destroy\`.`,
    );
    lines.push('');
  }
  lines.push('_Updated automatically by CI (ADR 0016)._');
  return `${lines.join('\n')}\n`;
}

async function gh(pathname, { method = 'GET', body, token } = {}) {
  const res = await fetch(`https://api.github.com${pathname}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const msg = json?.message || text || res.statusText;
    throw new Error(`GitHub API ${method} ${pathname} → ${res.status}: ${msg}`);
  }
  return json;
}

async function findPrNumber(owner, repo, branch, token) {
  const q = new URLSearchParams({
    head: `${owner}:${branch}`,
    state: 'open',
  });
  const list = await gh(`/repos/${owner}/${repo}/pulls?${q}`, { token });
  if (Array.isArray(list) && list[0]?.number) return list[0].number;
  return null;
}

async function upsertPrComment(owner, repo, prNumber, body, token) {
  const comments = await gh(
    `/repos/${owner}/${repo}/issues/${prNumber}/comments?per_page=100`,
    {
      token,
    },
  );
  const existing = (comments || []).find((c) => String(c.body || '').includes(MARKER));
  if (existing) {
    await gh(`/repos/${owner}/${repo}/issues/comments/${existing.id}`, {
      method: 'PATCH',
      token,
      body: { body },
    });
    return { type: 'pr', id: existing.id, updated: true, prNumber };
  }
  const created = await gh(`/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
    method: 'POST',
    token,
    body: { body },
  });
  return { type: 'pr', id: created.id, updated: false, prNumber };
}

async function createCommitComment(owner, repo, sha, body, token) {
  const created = await gh(`/repos/${owner}/${repo}/commits/${sha}/comments`, {
    method: 'POST',
    token,
    body: { body },
  });
  return { type: 'commit', id: created.id, sha };
}

async function main() {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  const repoFull = process.env.GITHUB_REPOSITORY || '';
  const [owner, repo] = repoFull.split('/');
  const sha = process.env.GITHUB_SHA || '';
  const branch = process.env.GITHUB_REF_NAME || process.env.AMPLIFY_BRANCH || '';
  const kind = process.env.COMMENT_KIND || 'feature';
  const feUrl = process.env.FE_URL || '';
  const apiUrl = process.env.API_URL || '';
  const stage = process.env.STAGE || '';
  const amplifyBranch = process.env.AMPLIFY_BRANCH || branch;
  const destroyWorkflow = process.env.DESTROY_WORKFLOW || 'destroy-feature.yml';
  const runUrl = process.env.GITHUB_RUN_URL || '';

  if (!token || !owner || !repo) {
    console.error('Need GH_TOKEN and GITHUB_REPOSITORY');
    process.exit(2);
  }
  if (!feUrl && !apiUrl) {
    console.error('Need FE_URL and/or API_URL');
    process.exit(2);
  }

  const destroyUrl = `https://github.com/${owner}/${repo}/actions/workflows/${destroyWorkflow}`;
  const body = buildBody({
    kind,
    feUrl,
    apiUrl,
    stage,
    amplifyBranch,
    sha,
    destroyUrl: kind === 'feature' ? destroyUrl : '',
    runUrl,
  });

  let result;
  const prNumber = branch ? await findPrNumber(owner, repo, branch, token) : null;
  if (prNumber) {
    result = await upsertPrComment(owner, repo, prNumber, body, token);
  } else if (sha) {
    result = await createCommitComment(owner, repo, sha, body, token);
  } else {
    throw new Error('No open PR and no GITHUB_SHA for commit comment');
  }

  process.stdout.write(`${JSON.stringify(result)}\n`);
}

module.exports = { MARKER, buildBody };

if (require.main === module) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
