import { describe, expect, it } from 'vitest';

import configJson from '../../vercel.json';

type VercelHeader = {
  key: string;
  value: string;
};

type VercelConfig = {
  headers?: Array<{
    source: string;
    headers: VercelHeader[];
  }>;
  rewrites?: Array<{
    source: string;
    destination: string;
  }>;
};

const config = configJson as VercelConfig;

describe('Vercel deployment policy', () => {
  it('keeps the SPA fallback rewrite', () => {
    expect(config.rewrites).toContainEqual({ source: '/(.*)', destination: '/index.html' });
  });

  it('applies the required security headers to every route', () => {
    const routePolicy = config.headers?.find(({ source }) => source === '/(.*)');
    const headers = new Map(routePolicy?.headers.map(({ key, value }) => [key, value]));

    expect(headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    expect(headers.get('Content-Security-Policy')).toContain("frame-ancestors 'none'");
    expect(headers.get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
    expect(headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headers.get('X-Frame-Options')).toBe('DENY');
  });
});
