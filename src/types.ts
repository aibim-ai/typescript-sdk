export enum AibimDecision {
  Allow = "allow",
  Warn = "warn",
  Block = "block",
}

export interface AibimClientConfig {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
  maxRetries?: number;
  backoffFactor?: number;
}

export interface DetectionResult {
  risk_score: number;
  is_threat: boolean;
  rules_matched: string[];
  model: string;
  latency_ms: number;
}

export interface AnalyzeRequest {
  prompt: string;
  model?: string;
}

export interface AnalyzeResponse {
  risk_score: number;
  is_suspicious: boolean;
  decision: AibimDecision;
  matched_rules: string[];
  correlation_id?: string;
}

export interface AibimResponseMeta {
  decision: AibimDecision;
  score: number;
  cache?: "hit" | "miss";
  cacheTier?: "exact" | "semantic";
  correlationId?: string;
}

export interface WrapOptions {
  aibimUrl?: string;
  aibimApiKey?: string;
}

export interface ProxyEndpoint {
  slug: string;
  name: string;
  upstream_url: string;
  upstream_type: string;
  is_active: boolean;
}

export interface AlertEvent {
  type: string;
  correlation_id?: string;
  risk_score?: number;
  risk_level?: string;
  model?: string;
  action?: string;
  source_ip?: string;
  endpoint?: string;
  matched_rules?: string[];
  detection_time_ms?: number;
  timestamp?: number;
}

export interface ApiKeyInfo {
  id: string;
  name: string;
  prefix: string;
  is_active: boolean;
  created_at: string;
}

export interface UsageInfo {
  requests_used: number;
  requests_limit: number;
  period_start: string;
  period_end: string;
}

export interface AlertRule {
  id?: string;
  name: string;
  condition: string;
  severity: string;
  actions: string[];
}

export interface RequestOptions {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}
