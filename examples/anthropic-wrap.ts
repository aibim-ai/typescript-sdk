/**
 * Anthropic example: Wrap an Anthropic client to route through AIBIM proxy.
 * The SDK auto-detects Anthropic clients and sets the X-AIBIM-Provider header.
 */
import Anthropic from '@anthropic-ai/sdk';
import { wrap, unwrap, isWrapped, AibimBlockedError } from '@aibim/sdk';

const anthropic = new Anthropic({ apiKey: 'sk-ant-your-key' });

// Wrap to route through AIBIM
const client = wrap(anthropic, {
  aibimUrl: 'https://proxy.aibim.ai',
  aibimApiKey: 'aibim-your-api-key',
});

console.log('Is wrapped:', isWrapped(client)); // true

try {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Explain prompt injection attacks.' }],
  });
  console.log(message.content);
} catch (error) {
  if (error instanceof AibimBlockedError) {
    console.log(`Blocked! Risk score: ${error.riskScore}`);
    console.log(`Matched rules: ${error.matchedRules.join(', ')}`);
    console.log(`Correlation ID: ${error.correlationId}`);
  } else {
    throw error;
  }
}

// Unwrap to restore direct access
unwrap(client);
console.log('Is wrapped after unwrap:', isWrapped(client)); // false
