import { AibimClient } from './client.js';
import type { AnalyzeResponse } from './types.js';

export class AibimGuard {
  private client: AibimClient;

  constructor(baseUrl?: string, apiKey?: string) {
    this.client = new AibimClient({ baseUrl, apiKey });
  }

  async analyze(text: string, model?: string): Promise<AnalyzeResponse> {
    return this.client.request<AnalyzeResponse>('POST', '/api/v1/analyze', {
      body: { prompt: text, model },
    });
  }

  async health(): Promise<Record<string, unknown>> {
    return this.client.health();
  }

  async deepHealth(): Promise<Record<string, unknown>> {
    return this.client.deepHealth();
  }
}
