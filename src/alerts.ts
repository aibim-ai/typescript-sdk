import type { AibimClient } from './client.js';
import type { AlertRule } from './types.js';

export class AlertsClient {
  constructor(private client: AibimClient) {}

  async list(params?: Record<string, string | number>): Promise<unknown[]> {
    return this.client.request<unknown[]>('GET', '/api/v1/alerts', {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  }

  async listRules(): Promise<unknown[]> {
    return this.client.request<unknown[]>('GET', '/api/v1/alerts/rules');
  }

  async createRule(rule: AlertRule): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>(
      'POST',
      '/api/v1/alerts/rules',
      { body: rule },
    );
  }

  async stats(): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>('GET', '/api/v1/alerts/stats');
  }
}
