import { describe, it, expect } from 'vitest';
import { AibimGuard } from '../src/guard.js';

describe('AibimGuard', () => {
  it('creates with default parameters', () => {
    const guard = new AibimGuard();
    expect(guard).toBeDefined();
    expect(guard).toBeInstanceOf(AibimGuard);
  });

  it('creates with custom baseUrl and apiKey', () => {
    const guard = new AibimGuard('https://proxy.aibim.ai', 'test-api-key');
    expect(guard).toBeDefined();
  });

  it('has analyze method', () => {
    const guard = new AibimGuard();
    expect(typeof guard.analyze).toBe('function');
  });

  it('has health method', () => {
    const guard = new AibimGuard();
    expect(typeof guard.health).toBe('function');
  });

  it('has deepHealth method', () => {
    const guard = new AibimGuard();
    expect(typeof guard.deepHealth).toBe('function');
  });
});
