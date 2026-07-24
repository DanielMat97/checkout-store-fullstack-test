import checkoutReducer, { setStep } from './checkoutSlice';

describe('checkoutSlice', () => {
  it('updates step', () => {
    const state = checkoutReducer(undefined, setStep('summary'));
    expect(state.step).toBe('summary');
  });
});
