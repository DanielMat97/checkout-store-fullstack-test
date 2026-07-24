import http from 'http';
import httpProxy from 'http-proxy';
import {
  createLogger,
  getSecurityHeaders,
  logHttpRequest,
  newCorrelationId,
} from '@app/shared';
import { MICROSERVICE_ROUTES, resolveTarget, upstreamBaseUrl } from './routes';

const logger = createLogger('api-gateway');

function applySecurityHeaders(res: http.ServerResponse): void {
  for (const [key, value] of Object.entries(getSecurityHeaders())) {
    res.setHeader(key, value);
  }
  res.removeHeader('X-Powered-By');
}

export function createGatewayServer(): http.Server {
  const proxy = httpProxy.createProxyServer({
    changeOrigin: true,
    xfwd: true,
  });

  proxy.on('error', (err, _req, res) => {
    logger.error('proxy.error', { errorMessage: err.message });
    const response = res as http.ServerResponse;
    if (!response.headersSent) {
      applySecurityHeaders(response);
      response.writeHead(502, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: 'Bad gateway' }));
    }
  });

  return http.createServer((req, res) => {
    const started = Date.now();
    const correlationId =
      (req.headers['x-correlation-id'] as string | undefined) ??
      newCorrelationId();
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    applySecurityHeaders(res);

    const host = req.headers.host ?? 'localhost';
    const url = new URL(req.url ?? '/', `http://${host}`);

    if (url.pathname === '/health' || url.pathname === '/') {
      const body = JSON.stringify({
        status: 'ok',
        service: 'api-gateway',
        routes: MICROSERVICE_ROUTES.map((r) => `/${r.prefix}`),
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(body);
      logHttpRequest({
        method: req.method ?? 'GET',
        path: url.pathname,
        statusCode: 200,
        durationMs: Date.now() - started,
        correlationId,
        targetService: 'api-gateway',
      });
      return;
    }

    const target = resolveTarget(url.pathname);
    if (!target) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Not found' }));
      logHttpRequest({
        method: req.method ?? 'GET',
        path: url.pathname,
        statusCode: 404,
        durationMs: Date.now() - started,
        correlationId,
      });
      return;
    }

    const upstream = upstreamBaseUrl(target.route);
    res.on('finish', () => {
      logHttpRequest({
        method: req.method ?? 'GET',
        path: url.pathname,
        statusCode: res.statusCode,
        durationMs: Date.now() - started,
        correlationId,
        targetService: target.route.name,
      });
    });

    proxy.web(req, res, { target: upstream });
  });
}
