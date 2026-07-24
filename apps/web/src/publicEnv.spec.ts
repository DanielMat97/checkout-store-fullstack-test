import { readPublicEnv, setPublicEnv } from './publicEnv';

describe('publicEnv', () => {
  it('reads set values and falls back', () => {
    setPublicEnv({ VITE_API_BASE_URL: ' http://x.test/ ' });
    expect(readPublicEnv('VITE_API_BASE_URL')).toBe('http://x.test/');
    setPublicEnv({});
    process.env.VITE_MOCK_MODE = 'false';
    expect(readPublicEnv('VITE_MOCK_MODE', 'true')).toBe('false');
    delete process.env.VITE_BASE_FEE;
    expect(readPublicEnv('VITE_BASE_FEE', '1500')).toBe('1500');
  });
});
