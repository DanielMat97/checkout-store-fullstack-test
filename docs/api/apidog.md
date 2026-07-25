# Apidog — documentación HTTP pública

> Portal vivo de la API Checkout / NORA · Spec: [`specs/apidog-portal-aws-server/`](../../specs/apidog-portal-aws-server/spec.md)

## Dónde vive el frontend de la documentación

**URL del portal (UI Try it / navegación):**  
[https://7j6npb6n4w.apidog.io](https://7j6npb6n4w.apidog.io)

Ahí está publicada la documentación interactiva del proyecto (**Checkout Store / NORA**): products, customers, deliveries, transactions, schemas. Es la cara “Swagger-like” para evaluadores y QA; no sustituye el archivo OpenAPI del repo.

## Actualización automática

El proyecto Apidog está configurado para **detectar cambios y re-sincronizar aproximadamente cada 3 horas** desde la fuente OpenAPI del monorepo (típicamente el JSON público en Amplify o el import del repo).

| | |
|---|---|
| Cadencia | ~cada **3 horas** (managed by Apidog) |
| Efecto | Nuevos paths / schemas / servers del OpenAPI aparecen en el portal tras el próximo sync |
| Si necesitás ver un cambio ya | Re-import manual en Apidog o esperar el ciclo de 3h |

## Fuente de verdad (repo)

| Artefacto | Rol |
|---|---|
| [`docs/api/openapi.json`](openapi.json) | Canonical OpenAPI 3 (editar aquí) |
| `apps/web/public/openapi.json` | Copia servida en Amplify `/openapi.json` |
| Public JSON | https://master.dw2i8myh0xumx.amplifyapp.com/openapi.json |

**Server por defecto en el OpenAPI:** HttpApi AWS prod  
`https://qo9kbfxew8.execute-api.us-east-1.amazonaws.com`  
(variable `baseUrl`; alternativa `http://localhost:3000` para offline).

Tras cambiar rutas o responses: actualizar `docs/api/openapi.json`, sincronizar la copia pública, y dejar que Apidog recoja el cambio en el próximo sync (o forzar import).

## Smoke / Try it

En el portal, elegí el server **AWS prod** (default) y ejecutá p.ej. `GET /products/health` o `GET /products`. Local: cambiá `baseUrl` a `http://localhost:3000` con `serverless offline` arriba.

Más curls: [`smoke.md`](smoke.md).
