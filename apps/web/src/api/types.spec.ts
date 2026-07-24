import { ApiError } from './types';

describe('ApiError', () => {
  it('carries status and message', () => {
    const error = new ApiError(502, 'Provider down');
    expect(error.status).toBe(502);
    expect(error.message).toBe('Provider down');
    expect(error.name).toBe('ApiError');
  });
});
