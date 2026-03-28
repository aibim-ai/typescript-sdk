import { AibimDecision } from './types.js';
import type { AibimResponseMeta } from './types.js';

export class AibimStreamResponse implements AsyncIterable<string> {
  private response: Response;
  private _meta: AibimResponseMeta;

  constructor(response: Response) {
    this.response = response;
    this._meta = {
      decision:
        (response.headers.get('x-aibim-decision') as AibimDecision) ?? AibimDecision.Allow,
      score: parseFloat(response.headers.get('x-aibim-score') ?? '0'),
      cache: (response.headers.get('x-aibim-cache') as 'hit' | 'miss') ?? undefined,
      cacheTier:
        (response.headers.get('x-aibim-cache-tier') as 'exact' | 'semantic') ?? undefined,
      correlationId: response.headers.get('x-correlation-id') ?? undefined,
    };
  }

  get detectionMeta(): AibimResponseMeta {
    return this._meta;
  }

  async *[Symbol.asyncIterator](): AsyncIterator<string> {
    if (!this.response.body) {
      return;
    }

    const reader = this.response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop()!;

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            yield data;
          }
        }
      }

      // Process remaining buffer
      if (buffer.startsWith('data: ')) {
        const data = buffer.slice(6);
        if (data !== '[DONE]') {
          yield data;
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
