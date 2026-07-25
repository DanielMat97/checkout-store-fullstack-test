---
feature: apidog-portal-aws-server
status: done
owner: platform
rubric: [api, docs]
---

# Spec — Portal Apidog + server AWS por defecto en OpenAPI

## Resumen

Como evaluador, abro el **portal público Apidog** y veo la documentación HTTP con **Try it** apuntando al **backend AWS desplegado** (no a `localhost`). En el repo, `docs/` explica que ese portal vive en una URL fija y se **re-sincroniza cada ~3 horas** desde el OpenAPI del proyecto.

## Problema

En el [portal Apidog](https://7j6npb6n4w.apidog.io) los ejemplos salían sin base URL / no usaban el HttpApi de AWS. En `openapi.json` el primer `servers[]` era `http://localhost:3000`, y Apidog usa ese como default.

## Alcance

- Documentar portal: `docs/api/apidog.md` (URL, sync ~3h, fuente OpenAPI).
- Corregir `servers` en `docs/api/openapi.json` (+ copia Amplify): **AWS prod por defecto** vía variable `baseUrl`; localhost como alternativa.
- README / smoke / current-state / INDEX / CHANGELOG.
- Format, lint, commit.

## Fuera de alcance

- Cambiar la configuración del proyecto en la UI de Apidog (el schedule lo administra Apidog; documentamos el comportamiento).
- Feature-branch API URLs dinámicas en el portal público (solo prod).

## Criterios de aceptación (EARS)

- Cuando se importa/sincroniza el OpenAPI, el server por defecto debe ser `https://qo9kbfxew8.execute-api.us-east-1.amazonaws.com`.
- Cuando un lector abre `docs/api/apidog.md`, debe encontrar la URL del portal y la nota de actualización automática cada 3 horas.
- Cuando se actualiza OpenAPI en el repo, la copia `apps/web/public/openapi.json` debe quedar idéntica.

## Referencias

- Portal: https://7j6npb6n4w.apidog.io  
- Fuente JSON: `docs/api/openapi.json` · público: Amplify `/openapi.json`
