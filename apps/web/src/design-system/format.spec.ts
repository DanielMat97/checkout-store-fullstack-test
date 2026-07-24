import { formatMoney } from '../design-system/format';
import { withViewTransition } from '../design-system/withViewTransition';

describe('formatMoney', () => {
  it('formats COP minor units', () => {
    expect(formatMoney(150000)).toMatch(/1.?500/);
  });
});

describe('withViewTransition', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: false });
  });

  it('runs update immediately without startViewTransition', () => {
    const update = jest.fn();
    withViewTransition(update);
    expect(update).toHaveBeenCalled();
  });

  it('uses startViewTransition when available', () => {
    const update = jest.fn();
    const start = jest.fn((cb: () => void) => {
      cb();
      return { finished: Promise.resolve() };
    });
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: start,
    });
    withViewTransition(update);
    expect(start).toHaveBeenCalled();
    expect(update).toHaveBeenCalled();
  });

  it('skips transitions when reduced motion is preferred', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: true });
    const update = jest.fn();
    const start = jest.fn();
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: start,
    });
    withViewTransition(update);
    expect(start).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalled();
  });
});
