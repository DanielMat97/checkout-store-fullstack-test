import { isColdStart, markWarm, resetColdStartForTests } from './cold-start';

describe('cold-start flag', () => {
  afterEach(() => {
    resetColdStartForTests(true);
  });

  it('starts cold, then warm after markWarm', () => {
    resetColdStartForTests();
    expect(isColdStart()).toBe(true);
    markWarm();
    expect(isColdStart()).toBe(false);
  });

  it('resetColdStartForTests(false) forces warm', () => {
    resetColdStartForTests(false);
    expect(isColdStart()).toBe(false);
  });
});
