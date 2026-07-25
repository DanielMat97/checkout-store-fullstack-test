/** Runtime public config bag — filled from Vite `import.meta.env` in `main.tsx`. */
export type PublicEnv = {
  VITE_API_BASE_URL?: string;
  VITE_MOCK_MODE?: string;
  VITE_BASE_FEE?: string;
  VITE_DELIVERY_FEE?: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __NORA_PUBLIC_ENV__: PublicEnv | undefined;
}

export function setPublicEnv(env: PublicEnv): void {
  globalThis.__NORA_PUBLIC_ENV__ = env;
}

export function readPublicEnv(key: keyof PublicEnv, fallback = ''): string {
  const value = globalThis.__NORA_PUBLIC_ENV__?.[key];
  if (value != null && String(value).trim() !== '') return String(value).trim();
  const fromProcess = readProcessEnv(key);
  if (fromProcess != null && fromProcess.trim() !== '') return fromProcess.trim();
  return fallback;
}

/** Jest / Node fallback without requiring @types/node in the Vite app tsconfig. */
function readProcessEnv(key: string): string | undefined {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process;
  const value = proc?.env?.[key];
  return typeof value === 'string' ? value : undefined;
}
