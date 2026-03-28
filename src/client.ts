import type { AibimClientConfig, RequestOptions } from './types.js';
import {
  AibimError,
  AibimAuthError,
  AibimBlockedError,
  AibimRateLimitError,
} from './errors.js';
import { RetryPolicy } from './retry.js';
import { AuthClient } from './auth.js';
import { RulesClient } from './rules.js';
import { DataClient } from './data.js';
import { TenantClient } from './tenant.js';
import { AlertsClient } from './alerts.js';

export class AibimClient {
  private baseUrl: string;
  private apiKey: string | undefined;
  private timeout: number;
  private retry: RetryPolicy;

  private _auth?: AuthClient;
  private _rules?: RulesClient;
  private _data?: DataClient;
  private _tenant?: TenantClient;
  private _alerts?: AlertsClient;

  constructor(config?: AibimClientConfig) {
    this.baseUrl = (config?.baseUrl ?? 'http://localhost:8080').replace(/\/+$/, '');
    this.apiKey = config?.apiKey;
    this.timeout = config?.timeout ?? 30000;
    this.retry = new RetryPolicy(
      config?.maxRetries ?? 3,
      config?.backoffFactor ?? 0.5,
    );
  }

  async request<T = unknown>(
    method: string,
    path: string,
    options?: RequestOptions,
  ): Promise<T> {
    return this.retry.execute(async () => {
      const response = await this.requestRaw(method, path, options);
      await this.handleErrorResponse(response);

      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const json = await response.json();
        // Unwrap AIBIM API envelope: { success, data, error }
        if (
          json !== null &&
          typeof json === 'object' &&
          'success' in json &&
          'data' in json
        ) {
          return json.data as T;
        }
        return json as T;
      }

      return (await response.text()) as unknown as T;
    });
  }

  async requestRaw(
    method: string,
    path: string,
    options?: RequestOptions,
  ): Promise<Response> {
    let url = `${this.baseUrl}${path}`;

    // Append query parameters
    if (options?.params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) {
        url += `?${qs}`;
      }
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...options?.headers,
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const init: RequestInit = {
      method,
      headers,
      signal: options?.signal ?? AbortSignal.timeout(this.timeout),
    };

    if (options?.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(options.body);
    }

    return fetch(url, init);
  }

  private async handleErrorResponse(response: Response): Promise<void> {
    if (response.ok) return;

    let errorBody: Record<string, unknown> = {};
    try {
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        errorBody = (await response.json()) as Record<string, unknown>;
      }
    } catch {
      // Could not parse error body
    }

    const message =
      (errorBody.error as string) ??
      (errorBody.message as string) ??
      `HTTP ${response.status}: ${response.statusText}`;

    switch (response.status) {
      case 401:
        throw new AibimAuthError(message);

      case 403: {
        const riskScore = (errorBody.risk_score as number) ?? 0;
        const matchedRules = (errorBody.matched_rules as string[]) ?? [];
        const correlationId = errorBody.correlation_id as string | undefined;
        throw new AibimBlockedError(message, riskScore, matchedRules, correlationId);
      }

      case 429: {
        const retryAfterHeader = response.headers.get('retry-after');
        const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined;
        throw new AibimRateLimitError(message, retryAfter);
      }

      default:
        throw new AibimError(message, response.status);
    }
  }

  // Sub-clients (lazy initialization)

  get auth(): AuthClient {
    if (!this._auth) {
      this._auth = new AuthClient(this);
    }
    return this._auth;
  }

  get rules(): RulesClient {
    if (!this._rules) {
      this._rules = new RulesClient(this);
    }
    return this._rules;
  }

  get data(): DataClient {
    if (!this._data) {
      this._data = new DataClient(this);
    }
    return this._data;
  }

  get tenant(): TenantClient {
    if (!this._tenant) {
      this._tenant = new TenantClient(this);
    }
    return this._tenant;
  }

  get alerts(): AlertsClient {
    if (!this._alerts) {
      this._alerts = new AlertsClient(this);
    }
    return this._alerts;
  }

  // Convenience methods

  async health(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('GET', '/health');
  }

  async deepHealth(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('GET', '/health/deep');
  }
}
