import type { AibimClient } from './client.js';
import type { ApiKeyInfo, UsageInfo, ProxyEndpoint } from './types.js';

export class TenantClient {
  constructor(private client: AibimClient) {}

  async me(): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>('GET', '/api/v1/tenant/me');
  }

  async getConfig(): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>('GET', '/api/v1/tenant/config');
  }

  async updateConfig(config: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>(
      'PUT',
      '/api/v1/tenant/config',
      { body: config },
    );
  }

  async getDetectionMode(): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>('GET', '/api/v1/tenant/detection-mode');
  }

  async setDetectionMode(mode: string): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>(
      'PUT',
      '/api/v1/tenant/detection-mode',
      { body: { mode } },
    );
  }

  async listApiKeys(): Promise<ApiKeyInfo[]> {
    return this.client.request<ApiKeyInfo[]>('GET', '/api/v1/tenant/keys');
  }

  async createApiKey(
    name: string,
    options?: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>(
      'POST',
      '/api/v1/tenant/keys',
      { body: { name, ...options } },
    );
  }

  async deleteApiKey(keyId: string): Promise<void> {
    await this.client.request('DELETE', `/api/v1/tenant/keys/${keyId}`);
  }

  async getUsage(): Promise<UsageInfo> {
    return this.client.request<UsageInfo>('GET', '/api/v1/usage');
  }

  async listEndpoints(): Promise<ProxyEndpoint[]> {
    return this.client.request<ProxyEndpoint[]>('GET', '/api/v1/tenant/endpoints');
  }

  async createEndpoint(endpoint: Record<string, unknown>): Promise<ProxyEndpoint> {
    return this.client.request<ProxyEndpoint>(
      'POST',
      '/api/v1/tenant/endpoints',
      { body: endpoint },
    );
  }
}
