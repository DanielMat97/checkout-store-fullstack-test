import checkoutReducer, { setStep } from './checkoutSlice';

describe('checkoutSlice', () => {
  it('updates step', () => {
    const state = checkoutReducer(undefined, setStep('summary'));
    expect(state.step).toBe('summary');
  });

  it('keeps mock stock on init', () => {
    const state = checkoutReducer(undefined, { type: 'unknown' });
    expect(state.mockStock).toBeGreaterThan(0);
  });
});
