import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LogsPage, AnalysisPage } from './index'

function renderPage(page: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}><MemoryRouter>{page}</MemoryRouter></QueryClientProvider>)
}

describe('troubleshooting workspace', () => {
  afterEach(cleanup)
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('filters logs by severity and keyword', async () => {
    const user = userEvent.setup()
    renderPage(<LogsPage />)
    await screen.findByText('Unhandled exception in payment processing')

    await user.click(screen.getByRole('button', { name: 'Warning' }))
    expect(screen.getByText('Retry limit approaching for job #wk_2048')).toBeInTheDocument()
    expect(screen.queryByText('Unhandled exception in payment processing')).not.toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Search logs' }), 'worker-queue')
    expect(await screen.findByText('Retry limit approaching for job #wk_2048')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('Connection pool utilization at 82%')).not.toBeInTheDocument())
  })

  it('streams an analysis and displays actionable findings', async () => {
    const user = userEvent.setup()
    renderPage(<AnalysisPage />)
    await user.type(screen.getByLabelText(/Error log/), "TypeError: Cannot read properties of undefined (reading 'customerId')")
    await user.click(screen.getByRole('button', { name: 'Analyze error' }))

    expect(await screen.findByText('Analysis complete', {}, { timeout: 10_000 })).toBeInTheDocument()
    expect(screen.getByText('Potential root causes')).toBeInTheDocument()
    expect(screen.getByText('Suggested fix')).toBeInTheDocument()
  }, 15_000)
})
