export class AibimError extends Error {
  public readonly statusCode: number | undefined;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "AibimError";
    this.statusCode = statusCode;
  }
}

export class AibimBlockedError extends AibimError {
  public readonly riskScore: number;
  public readonly matchedRules: string[];
  public readonly correlationId: string | undefined;

  constructor(
    message: string,
    riskScore: number,
    matchedRules: string[],
    correlationId?: string,
  ) {
    super(message, 403);
    this.name = "AibimBlockedError";
    this.riskScore = riskScore;
    this.matchedRules = matchedRules;
    this.correlationId = correlationId;
  }
}

export class AibimAuthError extends AibimError {
  constructor(message: string = "Authentication failed") {
    super(message, 401);
    this.name = "AibimAuthError";
  }
}

export class AibimRateLimitError extends AibimError {
  public readonly retryAfter: number | undefined;

  constructor(message: string = "Rate limit exceeded", retryAfter?: number) {
    super(message, 429);
    this.name = "AibimRateLimitError";
    this.retryAfter = retryAfter;
  }
}
