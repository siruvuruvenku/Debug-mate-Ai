import type { AnalyticsData, AppLog, Conversation, DashboardData } from '../types'

const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString()

export const logs: AppLog[] = [
  { id: 'log-1', timestamp: ago(2), level: 'critical', service: 'api-gateway', message: 'Unhandled exception in payment processing', traceId: 'trc_8f2a91c4', environment: 'production', details: 'TypeError: Cannot read properties of undefined (reading \'customerId\')\n    at processPayment (src/payments/processor.ts:148:22)\n    at async POST /api/v2/checkout' },
  { id: 'log-2', timestamp: ago(8), level: 'error', service: 'auth-service', message: 'JWT validation failed: token expired', traceId: 'trc_7b13dd02', environment: 'production', details: 'Token expired at 2025-03-14T09:42:00.000Z\n    at verifyToken (src/auth/jwt.ts:57:11)\n    at authenticateRequest (src/middleware/auth.ts:24:9)' },
  { id: 'log-3', timestamp: ago(19), level: 'warning', service: 'worker-queue', message: 'Retry limit approaching for job #wk_2048', traceId: 'trc_0c4e7a12', environment: 'production', details: 'Job retry 4 of 5. Last error: ECONNRESET from inventory-service.' },
  { id: 'log-4', timestamp: ago(31), level: 'error', service: 'web-frontend', message: 'Hydration mismatch detected on /checkout', traceId: 'trc_5e92b3f1', environment: 'production', details: 'Text content does not match server-rendered HTML.\n    at CheckoutSummary (src/components/CheckoutSummary.tsx:38:7)' },
  { id: 'log-5', timestamp: ago(48), level: 'info', service: 'scheduler', message: 'Daily report generated successfully', traceId: 'trc_9a1f006e', environment: 'production', details: 'Completed in 1.24s. 1,482 records processed.' },
  { id: 'log-6', timestamp: ago(72), level: 'warning', service: 'database', message: 'Connection pool utilization at 82%', traceId: 'trc_21fd879a', environment: 'production', details: 'Pool: 41/50 connections active. Consider increasing pool size or reviewing long-running queries.' },
  { id: 'log-7', timestamp: ago(95), level: 'critical', service: 'api-gateway', message: 'Upstream service unavailable: inventory-service', traceId: 'trc_345eaa18', environment: 'production', details: 'Request failed after 3 retries.\n    at Proxy.request (src/services/inventory.ts:82:13)\n    upstream: inventory.internal:8080' },
  { id: 'log-8', timestamp: ago(138), level: 'error', service: 'notification', message: 'SMTP connection timed out after 30s', traceId: 'trc_7d2ca990', environment: 'staging', details: 'ETIMEDOUT connecting to smtp.mailhost.io:587' },
  { id: 'log-9', timestamp: ago(180), level: 'info', service: 'auth-service', message: 'OAuth provider configuration refreshed', traceId: 'trc_9acde210', environment: 'production', details: 'Google OAuth client credentials updated. No errors.' },
  { id: 'log-10', timestamp: ago(220), level: 'warning', service: 'api-gateway', message: 'Rate limit threshold reached for client 198.51.100.24', traceId: 'trc_316bbdb9', environment: 'production', details: 'Client exceeded 950 of 1000 requests per minute.' },
  { id: 'log-11', timestamp: ago(280), level: 'error', service: 'database', message: 'Slow query detected: 2,408ms', traceId: 'trc_a8bc09d1', environment: 'production', details: 'SELECT * FROM orders WHERE status = ? AND created_at > ?\n    Missing index on orders(status, created_at)' },
  { id: 'log-12', timestamp: ago(340), level: 'info', service: 'worker-queue', message: 'Queue backlog cleared', traceId: 'trc_f4ab509e', environment: 'production', details: 'Processed 326 jobs in 12.6 seconds.' },
]

const trend = [
  { date: 'Mon', errors: 68, resolved: 52 }, { date: 'Tue', errors: 92, resolved: 72 },
  { date: 'Wed', errors: 74, resolved: 61 }, { date: 'Thu', errors: 115, resolved: 88 },
  { date: 'Fri', errors: 83, resolved: 77 }, { date: 'Sat', errors: 54, resolved: 49 },
  { date: 'Sun', errors: 71, resolved: 64 },
]
const severity = [
  { name: 'Critical', value: 12, color: '#f87171' }, { name: 'Error', value: 34, color: '#fb923c' },
  { name: 'Warning', value: 28, color: '#facc15' }, { name: 'Info', value: 26, color: '#55d6a5' },
]

export const dashboardData: DashboardData = {
  stats: { analyzed: 12482, critical: 24, resolved: 1847, avgResolution: '18m 32s' },
  trend, severity,
  recommendations: [
    { id: 'rec-1', title: 'Add a composite index to orders', description: 'A new index could reduce checkout query time by ~70%.', impact: 'high', time: '12 min ago' },
    { id: 'rec-2', title: 'Review payment null checks', description: 'Guard against missing customerId before processing.', impact: 'medium', time: '1 hour ago' },
    { id: 'rec-3', title: 'Tune database connection pool', description: 'Pool utilization has exceeded 80% three times this week.', impact: 'medium', time: '3 hours ago' },
  ],
  recentErrors: logs.slice(0, 5),
}

export const analyticsData: AnalyticsData = {
  trend,
  severity,
  topErrors: [
    { name: 'TypeError: undefined property', count: 284 },
    { name: 'Database connection timeout', count: 196 },
    { name: 'JWT token expired', count: 158 },
    { name: 'Network request failed', count: 121 },
    { name: 'Unhandled promise rejection', count: 94 },
  ],
  resolution: [
    { date: 'Mon', minutes: 26 }, { date: 'Tue', minutes: 22 }, { date: 'Wed', minutes: 24 },
    { date: 'Thu', minutes: 19 }, { date: 'Fri', minutes: 17 }, { date: 'Sat', minutes: 16 },
    { date: 'Sun', minutes: 18 },
  ],
}

export const initialConversations: Conversation[] = [
  { id: 'conv-1', title: 'Payment processor TypeError', preview: 'The error is caused by an unchecked customer object...', timestamp: ago(35), messages: [{ role: 'user', content: 'TypeError: Cannot read properties of undefined (reading customerId) in processPayment' }, { role: 'assistant', content: 'The error is caused by an unchecked customer object in the payment flow. Add a null guard before accessing customerId.' }] },
  { id: 'conv-2', title: 'Database query performance', preview: 'Adding an index on status and created_at should help...', timestamp: ago(60 * 5), messages: [{ role: 'user', content: 'Slow query detected: SELECT * FROM orders WHERE status = ? AND created_at > ?' }, { role: 'assistant', content: 'Adding a composite index on status and created_at should reduce query time significantly.' }] },
  { id: 'conv-3', title: 'JWT expiration handling', preview: 'Consider refreshing the token before it expires...', timestamp: ago(60 * 22), messages: [{ role: 'user', content: 'JWT validation failed: token expired' }, { role: 'assistant', content: 'Consider refreshing the token before it expires and verify the client clock is synchronized.' }] },
  { id: 'conv-4', title: 'Resolving hydration mismatch', preview: 'Check for browser-only values being rendered on the server...', timestamp: ago(60 * 36), messages: [{ role: 'user', content: 'Hydration mismatch detected on /checkout' }, { role: 'assistant', content: 'Check for browser-only values being rendered during server-side rendering. Move them into a client effect.' }] },
]
