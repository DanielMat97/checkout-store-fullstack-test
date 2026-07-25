#!/usr/bin/env bash
# Redeploy API from a known-good git SHA.
# Usage: scripts/ci/rollback-api.sh <sha> <stage>
set -euo pipefail

SHA="${1:-}"
STAGE="${2:-prod}"

if [[ -z "$SHA" || "$SHA" == "null" ]]; then
  echo "No previous SHA — skip rollback"
  exit 0
fi

echo "Rolling back API stage=$STAGE to sha=$SHA"
git fetch --depth=1 origin "$SHA" || git fetch origin "$SHA"
git checkout --force "$SHA"

npm ci
npm run build:api
npx serverless deploy --stage "$STAGE" --verbose

echo "Rollback deploy finished for $SHA"
