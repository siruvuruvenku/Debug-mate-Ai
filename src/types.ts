export type Severity = 'critical' | 'error' | 'warning' | 'info'

export interface AppLog {
  id: string
  timestamp: string
  level: Severity
  service: string
  message: string
  traceId: string
  environment: string
  details: string
}

export interface DashboardStats {
  analyzed: number
  critical: number
  resolved: number
  avgResolution: string
}

export interface Recommendation {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  time: string
}

export interface DashboardData {
  stats: DashboardStats
  trend: { date: string; errors: number; resolved: number }[]
  severity: { name: string; value: number; color: string }[]
  recommendations: Recommendation[]
  recentErrors: AppLog[]
}

export interface AnalysisRequest {
  logs: string
  language: string
  category: string
}

export interface AnalysisResult {
  id: string
  title: string
  severity: Severity
  confidence: number
  summary: string
  rootCauses: string[]
  steps: string[]
  code: string
}

export interface Conversation {
  id: string
  title: string
  preview: string
  timestamp: string
  messages: { role: 'user' | 'assistant'; content: string }[]
}

export interface AnalyticsData {
  trend: { date: string; errors: number; resolved: number }[]
  severity: { name: string; value: number; color: string }[]
  topErrors: { name: string; count: number }[]
  resolution: { date: string; minutes: number }[]
}
