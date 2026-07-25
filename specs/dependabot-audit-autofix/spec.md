---
feature: dependabot-audit-autofix
status: done
owner: devops
rubric: [B1]
---

# Spec — Dependabot + npm audit autofix con PR `fix/*` y merge a master

## Resumen

Como equipo de entrega, quiero que GitHub **Dependabot** vigile vulnerabilidades de dependencias y que, cuando `npm audit fix` pueda corregirlas de forma automática y segura, el sistema abra un PR en la rama `fix/<nombre-de-la-solucion>`, espere el quality gate, y **mergee a `master` automáticamente**.

## Alcance

### Dependabot (detección / PRs de versión)

- Activar Dependabot en el repo vía `.github/dependabot.yml`:
  - Ecosistema **npm** (raíz del monorepo).
  - Ecosistema **github-actions** (workflows).
- Periodicidad: semanal (npm + actions).
- Dependabot debe abrir PRs de **security updates** cuando GitHub Advisory lo permita (repo público / Dependabot alerts enabled).
- Labels sugeridos en PRs de Dependabot: `dependencies`, `security` (cuando aplique).

### Autofix con `npm audit fix` (rama `fix/*`)

- Workflow programado + `workflow_dispatch` que:
  1. Checkout `master`.
  2. `npm ci`.
  3. Ejecute `npm audit --audit-level=high` (o el mismo umbral que `npm run audit` / gate CI).
  4. Si hay findings **auto-corregibles**, ejecute `npm audit fix` (sin `--force` por defecto).
  5. Si `package-lock.json` / `package.json` cambian:
     - Derive un slug `<nombre-de-la-solucion>` (ej. advisory id / paquete principal / `npm-audit-YYYYMMDD`).
     - Cree rama `fix/<nombre-de-la-solucion>` (ASCII, kebab-case, ≤60 chars).
     - Commit con mensaje claro (`fix: npm audit …`).
     - Abra PR hacia `master` con body: resumen de `npm audit`, lista de paquetes tocados, nota de que el merge es automático tras CI verde.
  6. Habilite **auto-merge** (squash) del PR.
  7. Si CI (`CI` / `quality-ok`) falla → **no** mergear; dejar el PR abierto con comentario del fallo.
- Si `npm audit fix` no produce diff → no crear PR (job verde / “nothing to fix”).
- `npm audit fix --force` **fuera de alcance del autofix automático** (rompe semver a menudo). Solo manual / `workflow_dispatch` con input explícito `allow_force=true` (opcional, default false).

### Auto-merge a master

- Tras PR `fix/*` (y opcionalmente PRs Dependabot etiquetados `security`) + checks requeridos en verde → merge automático a `master`.
- Requiere permisos de Actions: `contents: write`, `pull-requests: write`, y repo con **Allow auto-merge** habilitado.
- Si hay branch protection con required reviewers: el bot debe poder mergear vía ruleset bypass **o** el repo debe permitir auto-merge sin review en PRs del actor `github-actions[bot]` / Dependabot (documentar en plan).
- Concurrency: un solo job de autofix a la vez; no apilar N ramas `fix/*` idénticas el mismo día (reusar PR abierto si existe).

## Fuera de alcance

- Remediación manual de vulns que requieren major bumps / cambios de código.
- Sustituir el gate `npm run audit` del CI (sigue fail-closed en PRs normales).
- Auto-merge de PRs de features humanas (`fb-*`, etc.).
- Dependabot para Docker / Terraform (no aplica hoy).

## Criterios de aceptación (EARS)

- Cuando Dependabot está configurado, el sistema debe publicar PRs de actualización npm/actions según el schedule.
- Cuando `npm audit` reporta vulns high+ y `npm audit fix` (sin force) modifica el lockfile, el sistema debe abrir un PR `fix/<slug>` hacia `master`.
- Cuando ese PR tiene el quality gate en verde, el sistema debe mergearlo automáticamente a `master`.
- Cuando `npm audit fix` no cambia archivos, el sistema no debe abrir PR.
- Cuando el autofix usaría `--force` sin input explícito, el sistema no debe aplicarlo.
- Cuando ya existe un PR abierto `fix/<mismo-slug>`, el sistema debe actualizar esa rama en lugar de abrir un duplicado.

## Supuestos

- Repo público o con Dependabot security updates disponibles.
- `master` es la rama por defecto.
- El evaluador / owner habilita en Settings: Dependabot alerts, Dependabot security updates, **Allow auto-merge**.
- El umbral de audit del autofix alinea con `scripts/ci/audit-gate.cjs` (high).

## Referencias

- ADR: `docs/adr/0017-dependabot-audit-autofix.md`
- CI audit gate: `scripts/ci/audit-gate.cjs`, `docs/ci-cd.md`, `docs/security.md`
- Spec relacionado: `security-hardening/`
