# @aibim/sdk

Secure your LLM applications with one line of code.

## Install

```bash
npm install @aibim/sdk
```

## Quick Start

```typescript
import OpenAI from 'openai';
import { wrap } from '@aibim/sdk';

const client = wrap(new OpenAI({ apiKey: 'sk-...' }), {
  aibimUrl: 'https://your-aibim.example.com',
  aibimApiKey: 'aibim-your-api-key',
});

// All LLM calls now route through AIBIM security proxy
const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

## Features

- `wrap()`/`unwrap()` for OpenAI and Anthropic clients
- Direct prompt analysis (`AibimGuard`)
- Full management API (tenant, rules, alerts, data)
- Real-time WebSocket alerts
- Zero runtime dependencies (native fetch)
- Full TypeScript type safety
- Automatic retry with exponential backoff

## Supported Providers

- OpenAI
- Azure OpenAI
- Anthropic
- Any OpenAI-compatible API

## Documentation

https://docs.aibim.ai/sdk/typescript
