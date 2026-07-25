---
feature: dependabot-audit-autofix
derived_from: spec.md
---

# Plan — dependabot-audit-autofix

## Enfoque

Dos capas complementarias:

1. **Dependabot** — detecta y propone bumps (npm + GitHub Actions).
2. **Workflow `security-audit-autofix`** — aplica `npm audit fix` (sin `--force`), abre `fix/<slug>`, auto-merge tras CI.

Dependabot no renombra sus ramas a `fix/*` (convención propia de GitHub). El contrato `fix/<nombre-de-la-solucion>` aplica al **autofix de audit** del workflow. Opcionalmente un segundo workflow puede auto-mergear PRs de Dependabot con label `security` sin renombrar la rama.

## Diseño técnico

### `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule: { interval: weekly }
    open-pull-requests-limit: 5
    labels: [dependencies]
  - package-ecosystem: github-actions
    directory: /
    schedule: { interval: weekly }
    labels: [dependencies, github-actions]
```

### `.github/workflows/security-audit-autofix.yml`

Triggers: `schedule` (cron semanal), `workflow_dispatch` (inputs: `allow_force` bool).

Jobs:

1. **audit-fix**
   - `actions/checkout@v4` (token con permisos write; default `GITHUB_TOKEN` + permissions).
   - `npm ci`
   - Script `scripts/ci/npm-audit-autofix.cjs`:
     - Corre audit gate / parsea si hay high+.
     - `npm audit fix` (± `--force` solo si input).
     - Si dirty: slug = primer paquete roto o `npm-audit-<date>`; branch `fix/<slug>`.
     - Push + `gh pr create` + `gh pr merge --auto --squash`.
   - Permissions: `contents: write`, `pull-requests: write`.

2. **dependabot-automerge** (opcional, mismo archivo o aparte)
   - `pull_request` from `dependabot[bot]` + label security / dependency.
   - `gh pr merge --auto --squash` tras checks.

### Slug rules

- Lowercase, `[a-z0-9-]+`, strip scopes (`@foo/bar` → `foo-bar`).
- Prefijo fijo `fix/` + slug; colisión → `fix/<slug>-<shortsha>` o update in place.

### Branch protection checklist (manual, documentar en `docs/security.md`)

- Enable Dependabot alerts + security updates.
- Allow auto-merge.
- Required status checks: CI / quality-ok (si existe).
- Si required reviews > 0: add ruleset exception for `github-actions[bot]` on `fix/**` **or** set reviews to 0 for this tech-test repo.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| `audit fix` rompe runtime | CI quality gate antes del merge; sin `--force` por defecto |
| Loop de PRs | Reusar PR abierto; concurrency group |
| Token sin permiso de merge | Documentar settings; fallar el job con mensaje claro |
| Override `js-yaml` vs Artillery | Autofix no debe revertir overrides documentados sin CI verde |

## Verificación

1. `workflow_dispatch` en repo de prueba / fork.
2. Simular lockfile vuln (o esperar advisory) → PR `fix/…` → CI → merge.
3. Segunda corrida sin vulns → no PR.
4. Dependabot PR de actions → aparece según schedule.

## Docs / living

- ADR 0017.
- `docs/security.md` + `docs/ci-cd.md` sección Dependabot/autofix.
- `specs/INDEX.md`.
- `CHANGELOG.md`.
