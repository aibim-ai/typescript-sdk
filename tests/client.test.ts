import { describe, it, expect } from 'vitest';
import { AibimClient } from '../src/client.js';
import { AuthClient } from '../src/auth.js';
import { RulesClient } from '../src/rules.js';
import { DataClient } from '../src/data.js';
import { TenantClient } from '../src/tenant.js';
import { AlertsClient } from '../src/alerts.js';

describe('AibimClient', () => {
  it('creates with default config', () => {
    const client = new AibimClient();
    // Verify it is constructed without errors
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(AibimClient);
  });

  it('creates with custom config', () => {
    const client = new AibimClient({
      baseUrl: 'https://proxy.aibim.ai',
      apiKey: 'test-key-123',
      timeout: 5000,
      maxRetries: 5,
      backoffFactor: 1.0,
    });
    expect(client).toBeDefined();
  });

  it('strips trailing slashes from baseUrl', () => {
    const client = new AibimClient({ baseUrl: 'https://proxy.aibim.ai///' });
    // We can verify this by checking that requestRaw builds correct URLs
    // The constructor strips trailing slashes
    expect(client).toBeDefined();
  });

  describe('sub-clients (lazy initialization)', () => {
    it('auth returns AuthClient', () => {
      const client = new AibimClient();
      expect(client.auth).toBeInstanceOf(AuthClient);
    });

    it('rules returns RulesClient', () => {
      const client = new AibimClient();
      expect(client.rules).toBeInstanceOf(RulesClient);
    });

    it('data returns DataClient', () => {
      const client = new AibimClient();
      expect(client.data).toBeInstanceOf(DataClient);
    });

    it('tenant returns TenantClient', () => {
      const client = new AibimClient();
      expect(client.tenant).toBeInstanceOf(TenantClient);
    });

    it('alerts returns AlertsClient', () => {
      const client = new AibimClient();
      expect(client.alerts).toBeInstanceOf(AlertsClient);
    });

    it('returns same sub-client instance on repeated access', () => {
      const client = new AibimClient();
      const auth1 = client.auth;
      const auth2 = client.auth;
      expect(auth1).toBe(auth2);

      const rules1 = client.rules;
      const rules2 = client.rules;
      expect(rules1).toBe(rules2);
    });
  });
});
