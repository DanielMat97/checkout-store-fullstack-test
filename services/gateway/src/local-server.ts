import { createLogger } from '@app/shared';
import { createGatewayServer } from './gateway';

const logger = createLogger('api-gateway');
const port = Number(process.env.GATEWAY_PORT ?? process.env.PORT ?? 3000);

const server = createGatewayServer();
server.listen(port, () => {
  logger.info('gateway.started', {
    port,
    entrypoint: `http://127.0.0.1:${port}`,
  });
});
