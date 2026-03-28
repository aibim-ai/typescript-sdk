import { describe, it, expect } from 'vitest';
import { AibimDecision } from '../src/types.js';
import type {
  AibimClientConfig,
  AnalyzeResponse,
  AibimResponseMeta,
  WrapOptions,
  ProxyEndpoint,
  AlertEvent,
  ApiKeyInfo,
  UsageInfo,
  AlertRule,
  DetectionResult,
  AnalyzeRequest,
  RequestOptions,
} from '../src/types.js';

describe('AibimDecision', () => {
  it('has Allow value', () => {
    expect(AibimDecision.Allow).toBe('allow');
  });

  it('has Warn value', () => {
    expect(AibimDecision.Warn).toBe('warn');
  });

  it('has Block value', () => {
    expect(AibimDecision.Block).toBe('block');
  });

  it('has exactly 3 values', () => {
    const values = Object.values(AibimDecision);
    expect(values).toHaveLength(3);
    expect(values).toEqual(['allow', 'warn', 'block']);
  });
});

describe('Type interfaces (compile-time checks)', () => {
  it('AibimClientConfig accepts valid config', () => {
    const config: AibimClientConfig = {
      baseUrl: 'https://proxy.aibim.ai',
      apiKey: 'test-key',
      timeout: 5000,
      maxRetries: 2,
      backoffFactor: 1.0,
    };
    expect(config.baseUrl).toBe('https://proxy.aibim.ai');
    expect(config.timeout).toBe(5000);
  });

  it('AibimClientConfig allows all-optional fields', () => {
    const config: AibimClientConfig = {};
    expect(config).toBeDefined();
  });

  it('AnalyzeResponse shape', () => {
    const response: AnalyzeResponse = {
      risk_score: 0.85,
      is_suspicious: true,
      decision: AibimDecision.Block,
      matched_rules: ['prompt_injection'],
      correlation_id: 'abc-123',
    };
    expect(response.risk_score).toBe(0.85);
    expect(response.decision).toBe(AibimDecision.Block);
  });

  it('WrapOptions shape', () => {
    const opts: WrapOptions = {
      aibimUrl: 'https://proxy.aibim.ai',
      aibimApiKey: 'key-123',
    };
    expect(opts.aibimUrl).toBe('https://proxy.aibim.ai');
  });

  it('ProxyEndpoint shape', () => {
    const endpoint: ProxyEndpoint = {
      slug: 'openai-prod',
      name: 'OpenAI Production',
      upstream_url: 'https://api.openai.com/v1',
      upstream_type: 'openai',
      is_active: true,
    };
    expect(endpoint.slug).toBe('openai-prod');
  });

  it('AlertEvent shape', () => {
    const event: AlertEvent = {
      type: 'detection',
      correlation_id: 'corr-1',
      risk_score: 0.9,
      risk_level: 'critical',
      model: 'gpt-4o',
      action: 'block',
      matched_rules: ['injection'],
    };
    expect(event.type).toBe('detection');
  });

  it('ApiKeyInfo shape', () => {
    const key: ApiKeyInfo = {
      id: 'uuid-1',
      name: 'Production Key',
      prefix: 'aibim_prod_',
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
    };
    expect(key.is_active).toBe(true);
  });

  it('UsageInfo shape', () => {
    const usage: UsageInfo = {
      requests_used: 1500,
      requests_limit: 10000,
      period_start: '2026-03-01T00:00:00Z',
      period_end: '2026-03-31T23:59:59Z',
    };
    expect(usage.requests_used).toBe(1500);
  });

  it('AlertRule shape', () => {
    const rule: AlertRule = {
      name: 'High Risk Alert',
      condition: 'risk_score > 0.8',
      severity: 'critical',
      actions: ['notify', 'block'],
    };
    expect(rule.actions).toContain('block');
  });

  it('DetectionResult shape', () => {
    const result: DetectionResult = {
      risk_score: 0.75,
      is_threat: true,
      rules_matched: ['sql_injection'],
      model: 'gpt-4o',
      latency_ms: 45,
    };
    expect(result.is_threat).toBe(true);
  });

  it('AnalyzeRequest shape', () => {
    const req: AnalyzeRequest = {
      prompt: 'ignore previous instructions',
      model: 'gpt-4o',
    };
    expect(req.prompt).toBe('ignore previous instructions');
  });

  it('RequestOptions shape', () => {
    const opts: RequestOptions = {
      body: { key: 'value' },
      params: { page: 1, limit: 10 },
      headers: { 'X-Custom': 'test' },
    };
    expect(opts.headers?.['X-Custom']).toBe('test');
  });

  it('AibimResponseMeta shape', () => {
    const meta: AibimResponseMeta = {
      decision: AibimDecision.Warn,
      score: 0.6,
      cache: 'miss',
      cacheTier: 'exact',
      correlationId: 'id-1',
    };
    expect(meta.score).toBe(0.6);
  });
});
