import type { AibimClient } from './client.js';

export class DataClient {
  constructor(private client: AibimClient) {}

  async events(params?: Record<string, string | number>): Promise<unknown[]> {
    return this.client.request<unknown[]>('GET', '/api/v1/data/events', {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  }

  async realtimeStats(): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>('GET', '/api/v1/data/stats/realtime');
  }

  async benchmarks(): Promise<unknown[]> {
    return this.client.request<unknown[]>('GET', '/api/v1/data/benchmarks/models');
  }

  async compliance(): Promise<unknown[]> {
    return this.client.request<unknown[]>('GET', '/api/v1/data/compliance/frameworks');
  }

  async trustAgents(): Promise<unknown[]> {
    return this.client.request<unknown[]>('GET', '/api/v1/data/trust/agents');
  }

  async threatFeed(): Promise<unknown[]> {
    return this.client.request<unknown[]>('GET', '/api/v1/data/threat-intel/feed');
  }

  async dlpEvents(): Promise<unknown[]> {
    return this.client.request<unknown[]>('GET', '/api/v1/data/dlp/events');
  }
}
