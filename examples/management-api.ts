/**
 * Management API example: Use AibimClient sub-clients for tenant management,
 * detection rules, data access, and alert configuration.
 */
import { AibimClient } from '@aibim/sdk';

const client = new AibimClient({
  baseUrl: 'https://proxy.aibim.ai',
  apiKey: 'aibim-your-api-key',
  timeout: 10000,
  maxRetries: 2,
});

// --- Auth ---
const tokens = await client.auth.login('user@example.com', 'password');
console.log('Access token:', tokens.access_token);

// --- Tenant Info ---
const tenantInfo = await client.tenant.me();
console.log('Tenant:', tenantInfo);

const config = await client.tenant.getConfig();
console.log('Tenant config:', config);

// --- API Keys ---
const keys = await client.tenant.listApiKeys();
console.log('API keys:', keys);

const newKey = await client.tenant.createApiKey('Production Key');
console.log('Created key:', newKey);

// --- Usage ---
const usage = await client.tenant.getUsage();
console.log(`Usage: ${usage.requests_used}/${usage.requests_limit}`);

// --- Detection Rules ---
const rules = await client.rules.list();
console.log('Detection rules:', rules);

// --- Data / Events ---
const events = await client.data.events({ limit: 10 });
console.log('Recent events:', events);

const stats = await client.data.realtimeStats();
console.log('Realtime stats:', stats);

// --- Threat Intel ---
const threats = await client.data.threatFeed();
console.log('Threat feed:', threats);

// --- Compliance ---
const frameworks = await client.data.compliance();
console.log('Compliance frameworks:', frameworks);

// --- Alerts ---
const alertStats = await client.alerts.stats();
console.log('Alert stats:', alertStats);

const alertRules = await client.alerts.listRules();
console.log('Alert rules:', alertRules);

// --- Proxy Endpoints ---
const endpoints = await client.tenant.listEndpoints();
console.log('Proxy endpoints:', endpoints);
