/**
 * Module-level cold-start flag for Lambda containers.
 * Set true at load; cleared after first HTTP access log (or explicitly).
 */
let coldStart = true;

export function isColdStart(): boolean {
  return coldStart;
}

export function markWarm(): void {
  coldStart = false;
}

/** Test helper — reset between specs. */
export function resetColdStartForTests(value = true): void {
  coldStart = value;
}
