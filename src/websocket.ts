import type { AlertEvent } from './types.js';

export class AlertsWebSocket {
  private url: string;
  private apiKey: string | undefined;
  private ws: WebSocket | null = null;
  private listeners: Set<(event: AlertEvent) => void> = new Set();
  private pendingResolves: Array<(value: IteratorResult<AlertEvent>) => void> = [];
  private eventQueue: AlertEvent[] = [];
  private closed = false;

  constructor(baseUrl: string = 'http://localhost:8080', apiKey?: string) {
    const wsUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    this.url = `${wsUrl}/ws/alerts`;
    this.apiKey = apiKey;
  }

  connect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const protocols: string[] = [];
      // Pass API key as a subprotocol since WebSocket constructor
      // does not support custom headers in browsers
      if (this.apiKey) {
        protocols.push(`aibim-key-${this.apiKey}`);
      }

      this.ws = new WebSocket(this.url, protocols.length > 0 ? protocols : undefined);

      this.ws.onopen = () => {
        // If using Node-compatible WebSocket that supports headers,
        // the key was passed via subprotocol above
        resolve();
      };

      this.ws.onerror = (event) => {
        const errorMsg =
          event instanceof ErrorEvent ? event.message : 'WebSocket connection failed';
        reject(new Error(errorMsg));
      };

      this.ws.onmessage = (event) => {
        try {
          const alertEvent = JSON.parse(
            typeof event.data === 'string' ? event.data : String(event.data),
          ) as AlertEvent;

          // Notify registered callback listeners
          for (const listener of this.listeners) {
            listener(alertEvent);
          }

          // Feed async generator
          if (this.pendingResolves.length > 0) {
            const pendingResolve = this.pendingResolves.shift()!;
            pendingResolve({ value: alertEvent, done: false });
          } else {
            this.eventQueue.push(alertEvent);
          }
        } catch {
          // Ignore unparseable messages
        }
      };

      this.ws.onclose = () => {
        this.closed = true;
        // Resolve any pending async iterator reads
        for (const pendingResolve of this.pendingResolves) {
          pendingResolve({ value: undefined as unknown as AlertEvent, done: true });
        }
        this.pendingResolves = [];
      };
    });
  }

  async *listen(): AsyncGenerator<AlertEvent> {
    while (!this.closed) {
      if (this.eventQueue.length > 0) {
        yield this.eventQueue.shift()!;
      } else {
        const result = await new Promise<IteratorResult<AlertEvent>>((resolve) => {
          this.pendingResolves.push(resolve);
        });
        if (result.done) return;
        yield result.value;
      }
    }
  }

  onAlert(callback: (event: AlertEvent) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  close(): void {
    this.closed = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    // Resolve any pending reads
    for (const pendingResolve of this.pendingResolves) {
      pendingResolve({ value: undefined as unknown as AlertEvent, done: true });
    }
    this.pendingResolves = [];
  }
}
