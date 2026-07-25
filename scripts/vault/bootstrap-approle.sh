# Local AppRole bootstrap (optional — for mimicking CI against local Vault).
# After vault:up + vault:seed:
#
#   export VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=root
#   ./scripts/vault/bootstrap-approle.sh
#
# Prints ROLE_ID and SECRET_ID (do not commit).

set -euo pipefail

: "${VAULT_ADDR:?}"
: "${VAULT_TOKEN:?}"

POLICY_NAME=checkout-ci
ROLE_NAME=checkout-ci

vault policy write "$POLICY_NAME" - <<'EOF'
path "secret/data/checkout/*" {
  capabilities = ["read", "list"]
}
path "secret/metadata/checkout/*" {
  capabilities = ["read", "list"]
}
EOF

vault auth enable approle 2>/dev/null || true

vault write auth/approle/role/"$ROLE_NAME" \
  token_policies="$POLICY_NAME" \
  token_ttl=1h \
  token_max_ttl=4h \
  secret_id_ttl=0

ROLE_ID=$(vault read -field=role_id auth/approle/role/"$ROLE_NAME"/role-id)
SECRET_ID=$(vault write -f -field=secret_id auth/approle/role/"$ROLE_NAME"/secret-id)

echo "VAULT_ROLE_ID=$ROLE_ID"
echo "VAULT_SECRET_ID=$SECRET_ID"
echo "# Store these as GitHub Secrets (with VAULT_ADDR). Do not commit."
