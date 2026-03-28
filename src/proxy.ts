import { AibimDecision } from './types.js';
import type { AibimResponseMeta, WrapOptions } from './types.js';

const AIBIM_ORIGINAL_URL = Symbol('aibim_original_base_url');
const AIBIM_WRAPPED = Symbol('aibim_wrapped');

interface WrappableClient {
  baseURL?: string;
  _baseURL?: string;
  _options?: {
    defaultHeaders?: Record<string, string>;
    baseURL?: string;
  };
  constructor?: { name?: string };
  [key: symbol]: unknown;
}

/**
 * Wrap an OpenAI or Anthropic client to route traffic through AIBIM proxy.
 * Works by replacing the client's baseURL with the AIBIM proxy URL.
 */
export function wrap<T extends object>(client: T, options?: WrapOptions): T {
  const aibimUrl = options?.aibimUrl ?? 'http://localhost:8080';
  const aibimApiKey = options?.aibimApiKey;
  const c = client as unknown as WrappableClient;

  if (c[AIBIM_WRAPPED]) return client; // Already wrapped

  // Store original base URL
  const originalUrl = c.baseURL ?? c._baseURL;
  c[AIBIM_ORIGINAL_URL] = originalUrl;
  c[AIBIM_WRAPPED] = true;

  // Replace base URL
  if ('baseURL' in client) {
    (client as Record<string, unknown>).baseURL = aibimUrl;
  } else if ('_baseURL' in client) {
    (client as Record<string, unknown>)._baseURL = aibimUrl;
  }

  // Inject AIBIM API key for tenant identification
  if (aibimApiKey) {
    const headers = c._options?.defaultHeaders ?? {};
    headers['X-AIBIM-API-Key'] = aibimApiKey;
    if (c._options) {
      c._options.defaultHeaders = headers;
    }
  }

  // Detect Anthropic client and set provider header
  const moduleName = client.constructor?.name ?? '';
  if (
    moduleName.includes('Anthropic') ||
    (c._options?.baseURL?.includes('anthropic'))
  ) {
    const headers = c._options?.defaultHeaders ?? {};
    headers['X-AIBIM-Provider'] = 'anthropic';
    if (c._options) {
      c._options.defaultHeaders = headers;
    }
  }

  return client;
}

/**
 * Unwrap a client, restoring the original base URL.
 */
export function unwrap<T extends object>(client: T): T {
  const c = client as unknown as WrappableClient;

  if (!c[AIBIM_WRAPPED]) return client;

  const originalUrl = c[AIBIM_ORIGINAL_URL] as string | undefined;
  if ('baseURL' in client) {
    (client as Record<string, unknown>).baseURL = originalUrl;
  } else if ('_baseURL' in client) {
    (client as Record<string, unknown>)._baseURL = originalUrl;
  }

  delete (client as Record<symbol, unknown>)[AIBIM_ORIGINAL_URL];
  delete (client as Record<symbol, unknown>)[AIBIM_WRAPPED];

  return client;
}

/**
 * Check if a client is currently wrapped.
 */
export function isWrapped(client: object): boolean {
  return !!(client as unknown as WrappableClient)[AIBIM_WRAPPED];
}

/**
 * Parse AIBIM response metadata from response headers.
 */
export function parseResponseMeta(headers: Headers): AibimResponseMeta {
  return {
    decision:
      (headers.get('x-aibim-decision') as AibimDecision) ?? AibimDecision.Allow,
    score: parseFloat(headers.get('x-aibim-score') ?? '0'),
    cache: (headers.get('x-aibim-cache') as 'hit' | 'miss') ?? undefined,
    cacheTier:
      (headers.get('x-aibim-cache-tier') as 'exact' | 'semantic') ?? undefined,
    correlationId: headers.get('x-correlation-id') ?? undefined,
  };
}
