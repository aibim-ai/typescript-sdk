/**
 * WebSocket alerts example: Listen for real-time security alerts from AIBIM.
 * Useful for building custom alerting integrations or dashboards.
 */
import { AlertsWebSocket } from '@aibim/sdk';
import type { AlertEvent } from '@aibim/sdk';

const ws = new AlertsWebSocket('https://proxy.aibim.ai', 'aibim-your-api-key');

// Connect to the alert stream
await ws.connect();
console.log('Connected to AIBIM alert stream.');

// Option 1: Callback-based listener
const unsubscribe = ws.onAlert((event: AlertEvent) => {
  console.log(`[${event.type}] Risk: ${event.risk_score} | Model: ${event.model}`);
  if (event.matched_rules?.length) {
    console.log(`  Rules: ${event.matched_rules.join(', ')}`);
  }
  if (event.action === 'block') {
    console.log(`  BLOCKED — correlation: ${event.correlation_id}`);
  }
});

// Option 2: Async iterator (for-await loop)
// Uncomment below to use instead of callback:
//
// for await (const event of ws.listen()) {
//   console.log(`Alert: ${event.type} — risk ${event.risk_score}`);
//   if (event.risk_level === 'critical') {
//     console.log('CRITICAL ALERT:', event);
//   }
// }

// Clean up after 60 seconds (demo)
setTimeout(() => {
  unsubscribe();
  ws.close();
  console.log('Disconnected from alert stream.');
}, 60_000);
