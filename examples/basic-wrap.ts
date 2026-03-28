/**
 * Basic example: Wrap an OpenAI client to route through AIBIM proxy.
 */
import OpenAI from 'openai';
import { wrap, AibimBlockedError } from '@aibim/sdk';

const client = wrap(new OpenAI({ apiKey: 'sk-your-openai-key' }), {
  aibimUrl: 'https://proxy.aibim.ai',
  aibimApiKey: 'aibim-your-api-key',
});

try {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'What is machine learning?' },
    ],
  });
  console.log(response.choices[0].message.content);
} catch (error) {
  if (error instanceof AibimBlockedError) {
    console.log(`Blocked! Risk: ${error.riskScore}, Rules: ${error.matchedRules}`);
  }
}
