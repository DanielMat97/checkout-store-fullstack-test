/** Native View Transitions when the browser supports them (graceful no-op otherwise). */
export function withViewTransition(update: () => void): void {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { finished: Promise<void> };
  };

  if (reduced || typeof doc.startViewTransition !== 'function') {
    update();
    return;
  }

  doc.startViewTransition(update);
}
