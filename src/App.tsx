import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { DashboardPage, AnalysisPage, LogsPage, HistoryPage, AnalyticsPage, AssistantPage, SettingsPage } from './pages'

export default function App() {
  return <Routes>
    <Route element={<Layout />}>
      <Route index element={<DashboardPage />} />
      <Route path="analysis" element={<AnalysisPage />} />
      <Route path="logs" element={<LogsPage />} />
      <Route path="assistant" element={<AssistantPage />} />
      <Route path="history" element={<HistoryPage />} />
      <Route path="analytics" element={<AnalyticsPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
}
