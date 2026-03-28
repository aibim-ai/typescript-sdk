import { describe, it, expect } from 'vitest';
import {
  AibimError,
  AibimBlockedError,
  AibimAuthError,
  AibimRateLimitError,
} from '../src/errors.js';

describe('AibimError', () => {
  it('has message and statusCode', () => {
    const error = new AibimError('Something went wrong', 500);
    expect(error.message).toBe('Something went wrong');
    expect(error.statusCode).toBe(500);
    expect(error.name).toBe('AibimError');
  });

  it('statusCode is undefined when not provided', () => {
    const error = new AibimError('Unknown error');
    expect(error.statusCode).toBeUndefined();
  });

  it('is an instance of Error', () => {
    const error = new AibimError('test', 400);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AibimError);
  });
});

describe('AibimBlockedError', () => {
  it('has riskScore, matchedRules, correlationId, statusCode=403', () => {
    const error = new AibimBlockedError(
      'Request blocked',
      0.92,
      ['prompt_injection', 'sql_injection'],
      'corr-abc-123',
    );
    expect(error.statusCode).toBe(403);
    expect(error.riskScore).toBe(0.92);
    expect(error.matchedRules).toEqual(['prompt_injection', 'sql_injection']);
    expect(error.correlationId).toBe('corr-abc-123');
    expect(error.name).toBe('AibimBlockedError');
    expect(error.message).toBe('Request blocked');
  });

  it('correlationId is optional', () => {
    const error = new AibimBlockedError('Blocked', 0.8, ['rule1']);
    expect(error.correlationId).toBeUndefined();
  });

  it('is an instance of AibimError and Error', () => {
    const error = new AibimBlockedError('Blocked', 0.5, []);
    expect(error).toBeInstanceOf(AibimError);
    expect(error).toBeInstanceOf(Error);
  });
});

describe('AibimAuthError', () => {
  it('has statusCode=401 and default message', () => {
    const error = new AibimAuthError();
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Authentication failed');
    expect(error.name).toBe('AibimAuthError');
  });

  it('accepts custom message', () => {
    const error = new AibimAuthError('Invalid API key');
    expect(error.message).toBe('Invalid API key');
    expect(error.statusCode).toBe(401);
  });

  it('is an instance of AibimError', () => {
    const error = new AibimAuthError();
    expect(error).toBeInstanceOf(AibimError);
  });
});

describe('AibimRateLimitError', () => {
  it('has statusCode=429 and retryAfter', () => {
    const error = new AibimRateLimitError('Too many requests', 30);
    expect(error.statusCode).toBe(429);
    expect(error.retryAfter).toBe(30);
    expect(error.name).toBe('AibimRateLimitError');
    expect(error.message).toBe('Too many requests');
  });

  it('has default message', () => {
    const error = new AibimRateLimitError();
    expect(error.message).toBe('Rate limit exceeded');
  });

  it('retryAfter is optional', () => {
    const error = new AibimRateLimitError('Rate limited');
    expect(error.retryAfter).toBeUndefined();
  });

  it('is an instance of AibimError', () => {
    const error = new AibimRateLimitError();
    expect(error).toBeInstanceOf(AibimError);
  });
});
