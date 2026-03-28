import { describe, it, expect } from 'vitest';
import { wrap, unwrap, isWrapped, parseResponseMeta } from '../src/proxy.js';
import { AibimDecision } from '../src/types.js';

describe('wrap', () => {
  it('changes baseURL to AIBIM proxy URL', () => {
    const client = { baseURL: 'https://api.openai.com/v1' } as Record<string, unknown>;
    wrap(client, { aibimUrl: 'https://proxy.aibim.ai' });
    expect(client.baseURL).toBe('https://proxy.aibim.ai');
  });

  it('uses default localhost URL when no aibimUrl provided', () => {
    const client = { baseURL: 'https://api.openai.com/v1' } as Record<string, unknown>;
    wrap(client);
    expect(client.baseURL).toBe('http://localhost:8080');
  });

  it('works with _baseURL clients (Anthropic style)', () => {
    const client = { _baseURL: 'https://api.anthropic.com' } as Record<string, unknown>;
    wrap(client, { aibimUrl: 'https://proxy.aibim.ai' });
    expect(client._baseURL).toBe('https://proxy.aibim.ai');
  });

  it('is idempotent — second wrap is a no-op', () => {
    const client = { baseURL: 'https://api.openai.com/v1' } as Record<string, unknown>;
    wrap(client, { aibimUrl: 'https://proxy.aibim.ai' });
    expect(client.baseURL).toBe('https://proxy.aibim.ai');

    // Wrap again with different URL — should be ignored
    wrap(client, { aibimUrl: 'https://other-proxy.example.com' });
    expect(client.baseURL).toBe('https://proxy.aibim.ai');
  });

  it('returns the same client reference', () => {
    const client = { baseURL: 'https://api.openai.com/v1' };
    const result = wrap(client, { aibimUrl: 'https://proxy.aibim.ai' });
    expect(result).toBe(client);
  });

  it('injects X-AIBIM-API-Key header when aibimApiKey provided', () => {
    const client = {
      baseURL: 'https://api.openai.com/v1',
      _options: { defaultHeaders: {} as Record<string, string> },
    };
    wrap(client, { aibimUrl: 'https://proxy.aibim.ai', aibimApiKey: 'test-key-123' });
    expect(client._options.defaultHeaders['X-AIBIM-API-Key']).toBe('test-key-123');
  });

  it('does not inject header when no aibimApiKey provided', () => {
    const client = {
      baseURL: 'https://api.openai.com/v1',
      _options: { defaultHeaders: {} as Record<string, string> },
    };
    wrap(client, { aibimUrl: 'https://proxy.aibim.ai' });
    expect(client._options.defaultHeaders['X-AIBIM-API-Key']).toBeUndefined();
  });

  it('sets X-AIBIM-Provider header for Anthropic clients', () => {
    class Anthropic {
      baseURL = 'https://api.anthropic.com';
      _options = {
        defaultHeaders: {} as Record<string, string>,
        baseURL: 'https://api.anthropic.com',
      };
    }
    const client = new Anthropic();
    wrap(client, { aibimUrl: 'https://proxy.aibim.ai' });
    expect(client._options.defaultHeaders['X-AIBIM-Provider']).toBe('anthropic');
  });
});

describe('unwrap', () => {
  it('restores original baseURL', () => {
    const client = { baseURL: 'https://api.openai.com/v1' } as Record<string, unknown>;
    wrap(client, { aibimUrl: 'https://proxy.aibim.ai' });
    expect(client.baseURL).toBe('https://proxy.aibim.ai');

    unwrap(client);
    expect(client.baseURL).toBe('https://api.openai.com/v1');
  });

  it('restores original _baseURL', () => {
    const client = { _baseURL: 'https://api.anthropic.com' } as Record<string, unknown>;
    wrap(client, { aibimUrl: 'https://proxy.aibim.ai' });
    unwrap(client);
    expect(client._baseURL).toBe('https://api.anthropic.com');
  });

  it('is a no-op on unwrapped client', () => {
    const client = { baseURL: 'https://api.openai.com/v1' };
    const result = unwrap(client);
    expect(result).toBe(client);
    expect(client.baseURL).toBe('https://api.openai.com/v1');
  });

  it('returns same client reference', () => {
    const client = { baseURL: 'https://api.openai.com/v1' };
    wrap(client, { aibimUrl: 'https://proxy.aibim.ai' });
    const result = unwrap(client);
    expect(result).toBe(client);
  });
});

describe('isWrapped', () => {
  it('returns false for unwrapped client', () => {
    const client = { baseURL: 'https://api.openai.com/v1' };
    expect(isWrapped(client)).toBe(false);
  });

  it('returns true for wrapped client', () => {
    const client = { baseURL: 'https://api.openai.com/v1' };
    wrap(client, { aibimUrl: 'https://proxy.aibim.ai' });
    expect(isWrapped(client)).toBe(true);
  });

  it('returns false after unwrap', () => {
    const client = { baseURL: 'https://api.openai.com/v1' };
    wrap(client, { aibimUrl: 'https://proxy.aibim.ai' });
    unwrap(client);
    expect(isWrapped(client)).toBe(false);
  });
});

describe('parseResponseMeta', () => {
  it('parses all AIBIM headers', () => {
    const headers = new Headers({
      'x-aibim-decision': 'block',
      'x-aibim-score': '0.95',
      'x-aibim-cache': 'hit',
      'x-aibim-cache-tier': 'semantic',
      'x-correlation-id': 'corr-123',
    });
    const meta = parseResponseMeta(headers);
    expect(meta.decision).toBe(AibimDecision.Block);
    expect(meta.score).toBe(0.95);
    expect(meta.cache).toBe('hit');
    expect(meta.cacheTier).toBe('semantic');
    expect(meta.correlationId).toBe('corr-123');
  });

  it('returns defaults for missing headers', () => {
    const headers = new Headers();
    const meta = parseResponseMeta(headers);
    expect(meta.decision).toBe(AibimDecision.Allow);
    expect(meta.score).toBe(0);
    expect(meta.cache).toBeUndefined();
    expect(meta.cacheTier).toBeUndefined();
    expect(meta.correlationId).toBeUndefined();
  });
});
