import { describe, it, expect, vi } from 'vitest';
import { RetryPolicy } from '../src/retry.js';
import { AibimError, AibimRateLimitError } from '../src/errors.js';

describe('RetryPolicy', () => {
  it('returns result on first success', async () => {
    const policy = new RetryPolicy(3, 0.01);
    const result = await policy.execute(async () => 'ok');
    expect(result).toBe('ok');
  });

  it('retries on retryable status codes and eventually succeeds', async () => {
    const policy = new RetryPolicy(3, 0.01, 100);
    let attempt = 0;
    const result = await policy.execute(async () => {
      attempt++;
      if (attempt < 3) {
        throw new AibimError('Server error', 500);
      }
      return 'recovered';
    });
    expect(result).toBe('recovered');
    expect(attempt).toBe(3);
  });

  it('throws immediately on non-retryable errors', async () => {
    const policy = new RetryPolicy(3, 0.01);
    let attempt = 0;
    await expect(
      policy.execute(async () => {
        attempt++;
        throw new AibimError('Not found', 404);
      }),
    ).rejects.toThrow('Not found');
    expect(attempt).toBe(1);
  });

  it('retries on AibimRateLimitError', async () => {
    const policy = new RetryPolicy(2, 0.01, 100);
    let attempt = 0;
    const result = await policy.execute(async () => {
      attempt++;
      if (attempt === 1) {
        throw new AibimRateLimitError('Rate limited', 1);
      }
      return 'ok';
    });
    expect(result).toBe('ok');
    expect(attempt).toBe(2);
  });

  it('retries on TypeError (network errors)', async () => {
    const policy = new RetryPolicy(2, 0.01, 100);
    let attempt = 0;
    const result = await policy.execute(async () => {
      attempt++;
      if (attempt === 1) {
        throw new TypeError('fetch failed');
      }
      return 'ok';
    });
    expect(result).toBe('ok');
    expect(attempt).toBe(2);
  });

  it('throws after max retries exhausted', async () => {
    const policy = new RetryPolicy(2, 0.01, 100);
    let attempt = 0;
    await expect(
      policy.execute(async () => {
        attempt++;
        throw new AibimError('Server error', 500);
      }),
    ).rejects.toThrow('Server error');
    // 1 initial + 2 retries = 3 attempts
    expect(attempt).toBe(3);
  });

  it('retries on 502, 503, 504 status codes', async () => {
    for (const status of [502, 503, 504]) {
      const policy = new RetryPolicy(1, 0.01, 100);
      let attempt = 0;
      const result = await policy.execute(async () => {
        attempt++;
        if (attempt === 1) {
          throw new AibimError(`Error ${status}`, status);
        }
        return 'ok';
      });
      expect(result).toBe('ok');
    }
  });

  it('does not retry on 400, 401, 403 status codes', async () => {
    for (const status of [400, 401, 403]) {
      const policy = new RetryPolicy(3, 0.01);
      let attempt = 0;
      await expect(
        policy.execute(async () => {
          attempt++;
          throw new AibimError(`Error ${status}`, status);
        }),
      ).rejects.toThrow(`Error ${status}`);
      expect(attempt).toBe(1);
    }
  });

  it('zero retries means single attempt', async () => {
    const policy = new RetryPolicy(0, 0.01);
    let attempt = 0;
    await expect(
      policy.execute(async () => {
        attempt++;
        throw new AibimError('Server error', 500);
      }),
    ).rejects.toThrow('Server error');
    expect(attempt).toBe(1);
  });
});
