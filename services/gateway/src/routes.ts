export type MicroserviceName =
  | 'products'
  | 'customers'
  | 'deliveries'
  | 'transactions';

export interface RouteTarget {
  name: MicroserviceName;
  prefix: string;
  port: number;
  envUrlKey: string;
}

/** Single entry path prefixes → domain microservices */
export const MICROSERVICE_ROUTES: RouteTarget[] = [
  {
    name: 'products',
    prefix: 'products',
    port: 3001,
    envUrlKey: 'PRODUCTS_SERVICE_URL',
  },
  {
    name: 'customers',
    prefix: 'customers',
    port: 3002,
    envUrlKey: 'CUSTOMERS_SERVICE_URL',
  },
  {
    name: 'deliveries',
    prefix: 'deliveries',
    port: 3003,
    envUrlKey: 'DELIVERIES_SERVICE_URL',
  },
  {
    name: 'transactions',
    prefix: 'transactions',
    port: 3004,
    envUrlKey: 'TRANSACTIONS_SERVICE_URL',
  },
];

export function resolveTarget(
  pathname: string,
): { route: RouteTarget; upstreamPath: string } | null {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  for (const route of MICROSERVICE_ROUTES) {
    const base = `/${route.prefix}`;
    if (normalized === base || normalized.startsWith(`${base}/`)) {
      return { route, upstreamPath: normalized };
    }
  }
  return null;
}

export function upstreamBaseUrl(route: RouteTarget): string {
  return (
    process.env[route.envUrlKey] ?? `http://127.0.0.1:${route.port}`
  );
}
