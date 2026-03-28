import type { AibimClient } from './client.js';

export class RulesClient {
  constructor(private client: AibimClient) {}

  async list(): Promise<unknown[]> {
    return this.client.request<unknown[]>('GET', '/api/v1/rules');
  }

  async create(rule: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>(
      'POST',
      '/api/v1/rules',
      { body: rule },
    );
  }

  async delete(ruleId: string): Promise<void> {
    await this.client.request('DELETE', `/api/v1/rules/${ruleId}`);
  }
}
