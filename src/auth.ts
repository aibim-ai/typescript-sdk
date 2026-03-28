import type { AibimClient } from './client.js';

export class AuthClient {
  constructor(private client: AibimClient) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    return this.client.request<{ access_token: string; refresh_token: string }>(
      'POST',
      '/api/v1/auth/login',
      { body: { email, password } },
    );
  }

  async register(
    email: string,
    password: string,
    tenantName: string,
  ): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>(
      'POST',
      '/api/v1/auth/register',
      { body: { email, password, tenant_name: tenantName } },
    );
  }

  async refresh(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    return this.client.request<{ access_token: string; refresh_token: string }>(
      'POST',
      '/api/v1/auth/refresh',
      { body: { refresh_token: refreshToken } },
    );
  }

  async validate(): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>('GET', '/api/v1/auth/validate');
  }

  async me(): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>('GET', '/api/v1/auth/me');
  }
}
