/**
 * Type shim so `serverless.ts` can import the CommonJS observability module.
 * Runtime loads `./observability-resources.cjs`.
 */
declare module './infra/observability-resources.cjs' {
  export function observabilityResources(opts: { stage: string }): {
    Conditions: Record<string, unknown>;
    Resources: Record<string, unknown>;
    Outputs: Record<string, unknown>;
  };
}
