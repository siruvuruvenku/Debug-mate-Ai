import axios from 'axios'
import { analyticsData, dashboardData, initialConversations, logs } from '../data/mockData'
import type { AnalysisRequest, AnalysisResult, AnalyticsData, AppLog, Conversation, DashboardData, Severity } from '../types'

const baseURL = import.meta.env.VITE_API_BASE_URL as string | undefined
export const apiClient = axios.create({ baseURL, timeout: 12_000, headers: { 'Content-Type': 'application/json' } })

let conversations = [...initialConversations]
const wait = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms))
const useMock = !baseURL

export async function fetchDashboard(): Promise<DashboardData> {
  if (!useMock) return (await apiClient.get<DashboardData>('/dashboard')).data
  await wait(180)
  return dashboardData
}

export async function fetchLogs(): Promise<AppLog[]> {
  if (!useMock) return (await apiClient.get<AppLog[]>('/logs')).data
  await wait(180)
  return logs
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  if (!useMock) return (await apiClient.get<AnalyticsData>('/analytics')).data
  await wait(180)
  return analyticsData
}

export async function fetchConversations(): Promise<Conversation[]> {
  if (!useMock) return (await apiClient.get<Conversation[]>('/conversations')).data
  await wait(160)
  return conversations
}

export async function deleteConversation(id: string): Promise<void> {
  if (!useMock) {
    await apiClient.delete(`/conversations/${id}`)
    return
  }
  await wait(100)
  conversations = conversations.filter(conversation => conversation.id !== id)
}

export async function saveConversation(conversation: Conversation, isNew = false): Promise<Conversation> {
  if (!useMock) {
    const response = isNew
      ? await apiClient.post<Conversation>('/conversations', conversation)
      : await apiClient.put<Conversation>(`/conversations/${conversation.id}`, conversation)
    return response.data
  }
  conversations = [conversation, ...conversations.filter(item => item.id !== conversation.id)]
  return conversation
}

function guessSeverity(category: string, text: string): Severity {
  if (/critical|fatal|out of memory/i.test(text)) return 'critical'
  if (/warning/i.test(category)) return 'warning'
  return 'error'
}

export async function streamAnalysis(request: AnalysisRequest, signal: AbortSignal, onChunk: (chunk: string) => void): Promise<void> {
  if (baseURL) {
    const response = await fetch(`${baseURL}/analysis/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify(request),
      signal,
    })
    if (!response.ok) throw new Error(`Analysis request failed (${response.status}). Please try again.`)
    if (!response.body) throw new Error('Streaming is not supported by this response. Please try again.')
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        onChunk(decoder.decode(value, { stream: true }))
      }
      if (signal.aborted) throw new DOMException('Analysis cancelled', 'AbortError')
    } finally {
      reader.releaseLock()
    }
    return
  }

  const text = buildMockResponse(request)
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder()
      for (const word of text.split(/(\s+)/)) {
        if (signal.aborted) {
          controller.close()
          return
        }
        controller.enqueue(encoder.encode(word))
        await wait(18)
      }
      controller.close()
    },
    cancel() {},
  })
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (signal.aborted) throw new DOMException('Analysis cancelled', 'AbortError')
      onChunk(decoder.decode(value, { stream: true }))
    }
    if (signal.aborted) throw new DOMException('Analysis cancelled', 'AbortError')
  } finally {
    reader.releaseLock()
  }
}

export function makeAnalysisResult(request: AnalysisRequest, response: string): AnalysisResult {
  const severity = guessSeverity(request.category, request.logs)
  return {
    id: `analysis-${Date.now()}`,
    title: 'Runtime error detected',
    severity,
    confidence: 94,
    summary: response,
    rootCauses: ['An unchecked value is accessed before it is initialized.', 'The failure path does not validate the upstream response shape.'],
    steps: ['Add a guard clause for missing or null values.', 'Validate the incoming payload at the API boundary.', 'Add a regression test for the empty response case.'],
    code: `if (!customer) {\n  throw new Error('Customer data is required');\n}\n\nconst customerId = customer.id;`,
  }
}

function buildMockResponse(request: AnalysisRequest): string {
  const firstLine = request.logs.trim().split('\n')[0]?.slice(0, 120) ?? 'the provided log'
  return `I found a likely issue in ${request.language}: ${firstLine}. The most probable cause is that a value is accessed before it has been validated. Add an explicit guard at the boundary, then verify the upstream response shape. This should prevent the current failure and make future errors easier to trace.`
}
