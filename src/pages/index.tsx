import { useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Activity, AlertCircle, AlertOctagon, ArrowDownRight, ArrowRight, ArrowUpRight, Bot, Check,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock3, Code2, Download, FileText,
  Lightbulb, LoaderCircle, MessageSquare, Plus, Search, Send,
  ShieldAlert, Sparkles, Trash2, Upload, X,
} from 'lucide-react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import { deleteConversation, fetchAnalytics, fetchConversations, fetchDashboard, fetchLogs, makeAnalysisResult, saveConversation, streamAnalysis } from '../services/api'
import { useDebounce } from '../hooks/useDebounce'
import type { AnalysisResult, AppLog, Conversation } from '../types'
import { EmptyState, PageHeader, Panel, SeverityBadge, StatCard, formatTime } from '../components/ui'

const currentDateLabel = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()).toUpperCase()

function QueryMessage({ loading, error, retry }: { loading: boolean; error: Error | null; retry: () => void }) {
  if (loading) return <div className="loading-state"><LoaderCircle className="spin" size={18} /> Loading your workspace…</div>
  if (error) return <div className="error-state"><AlertCircle size={17} /><span>We couldn’t load this data. {error.message}</span><button onClick={retry}>Try again</button></div>
  return null
}

export function DashboardPage() {
  const query = useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard })
  const navigate = useNavigate()
  const data = query.data
  const tooltipStyle = { background: '#202126', border: '1px solid #33353b', borderRadius: 8, color: '#f4f4f5', fontSize: 12 }
  return <div className="page">
    <PageHeader eyebrow={currentDateLabel} title="Good morning, Jordan" description="Here’s what’s happening across your applications today." actions={<><button className="button button-secondary" onClick={() => navigate('/logs')}><FileText size={15} /> Explore logs</button><button className="button button-primary" onClick={() => navigate('/analysis')}><Sparkles size={15} /> Analyze an error</button></>} />
    <QueryMessage loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />
    {data && <>
      <div className="stats-grid">
        <StatCard label="Errors analyzed" value={data.stats.analyzed.toLocaleString()} change="+12.8%" note="vs. last week" icon={Activity} color="mint" />
        <StatCard label="Critical errors" value={String(data.stats.critical)} change="-8.2%" note="vs. last week" icon={AlertOctagon} color="coral" />
        <StatCard label="Resolved issues" value={data.stats.resolved.toLocaleString()} change="+18.4%" note="vs. last week" icon={CheckCircle2} color="blue" />
        <StatCard label="Avg. resolution" value={data.stats.avgResolution} change="-12.5%" note="vs. last week" icon={Clock3} color="violet" />
      </div>
      <div className="dashboard-main-grid">
        <Panel title="Error trends" subtitle="Errors and resolutions over the last 7 days" className="trend-panel" action={<span className="period-label">Last 7 days</span>}>
          <div className="chart-legend"><span><i className="legend-dot mint-dot" /> Errors</span><span><i className="legend-dot soft-dot" /> Resolved</span><span className="chart-total">557 <small>total events</small></span></div>
          <div className="chart-area"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.trend} margin={{ top: 10, right: 4, bottom: 0, left: -20 }}><defs><linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#55d6a5" stopOpacity={0.17} /><stop offset="95%" stopColor="#55d6a5" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#292a30" vertical={false} /><XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#777983', fontSize: 11 }} dy={10} /><YAxis tickLine={false} axisLine={false} tick={{ fill: '#777983', fontSize: 11 }} /><Tooltip contentStyle={tooltipStyle} /><Area type="monotone" dataKey="errors" stroke="#55d6a5" strokeWidth={2} fill="url(#errorGradient)" /><Area type="monotone" dataKey="resolved" stroke="#627b73" strokeWidth={1.5} strokeDasharray="4 4" fill="transparent" /></AreaChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="Severity breakdown" subtitle="Distribution of analyzed errors">
          <div className="severity-chart"><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.severity} dataKey="value" nameKey="name" innerRadius={52} outerRadius={68} paddingAngle={4} stroke="none">{data.severity.map(item => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>100</strong><small>events</small></div></div><div className="severity-legend">{data.severity.map(item => <div key={item.name}><span><i className="legend-dot" style={{ background: item.color }} />{item.name}</span><strong>{item.value}%</strong></div>)}</div></div>
        </Panel>
      </div>
      <div className="dashboard-bottom-grid">
        <Panel title="Recent error reports" subtitle="Latest events from your applications" action={<button className="text-button" onClick={() => navigate('/logs')}>View all <ArrowRight size={14} /></button>}>
          <div className="recent-list">{data.recentErrors.map(log => <button className="recent-row" key={log.id} onClick={() => navigate(`/logs?search=${encodeURIComponent(log.service)}`)}><span className={`event-indicator level-${log.level}`}><AlertCircle size={15} /></span><span className="recent-info"><strong>{log.message}</strong><small>{log.service} · {formatTime(log.timestamp)}</small></span><SeverityBadge level={log.level} /><ArrowRight size={14} className="row-arrow" /></button>)}</div>
        </Panel>
        <Panel title="AI recommendations" subtitle="Suggested improvements for your stack">
          <div className="recommendations">{data.recommendations.map(rec => <div className="recommendation" key={rec.id}><span className={`rec-icon rec-${rec.impact}`}><Lightbulb size={15} /></span><div><div className="rec-title">{rec.title}<span className={`impact-tag impact-${rec.impact}`}>{rec.impact} impact</span></div><p>{rec.description}</p><small>{rec.time}</small></div></div>)}</div>
        </Panel>
      </div>
    </>}
  </div>
}

const starterLog = `TypeError: Cannot read properties of undefined (reading 'customerId')
    at processPayment (src/payments/processor.ts:148:22)
    at async POST /api/v2/checkout
    at async handleCheckout (src/routes/checkout.ts:67:9)`

export function AnalysisPage() {
  const queryClient = useQueryClient()
  const [logsText, setLogsText] = useState('')
  const [language, setLanguage] = useState('TypeScript')
  const [category, setCategory] = useState('Runtime error')
  const [response, setResponse] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [running, setRunning] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const responseRef = useRef('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function analyze() {
    if (!logsText.trim()) { setError('Paste an error log or upload a file before starting analysis.'); return }
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setRunning(true); setError(''); setResponse(''); setResult(null); responseRef.current = ''
    try {
      await streamAnalysis({ logs: logsText, language, category }, controller.signal, chunk => {
        responseRef.current += chunk
        setResponse(previous => previous + chunk)
      })
      const finalResponse = responseRef.current
      const analysis = makeAnalysisResult({ logs: logsText, language, category }, finalResponse)
      setResult(analysis)
      const conversation: Conversation = { id: analysis.id, title: logsText.trim().split('\n')[0].slice(0, 60), preview: finalResponse.slice(0, 110), timestamp: new Date().toISOString(), messages: [{ role: 'user', content: logsText }, { role: 'assistant', content: finalResponse }] }
      await saveConversation(conversation, true)
      await queryClient.invalidateQueries({ queryKey: ['conversations'] })
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') setError('Analysis cancelled.')
      else setError(caught instanceof Error ? caught.message : 'Something went wrong while analyzing this log.')
    } finally { setRunning(false); abortRef.current = null }
  }

  function handleFile(file?: File) {
    if (!file) return
    if (file.size > 2_000_000) { setError('File is too large. Please upload a log file under 2 MB.'); return }
    const reader = new FileReader()
    reader.onload = () => { setLogsText(typeof reader.result === 'string' ? reader.result : ''); setError('') }
    reader.onerror = () => setError('We couldn’t read this file. Try a plain text log.')
    reader.readAsText(file)
  }

  return <div className="page">
    <PageHeader eyebrow="AI-POWERED TROUBLESHOOTING" title="Error analysis" description="Turn noisy stack traces into clear, actionable fixes." actions={<button className="button button-secondary" onClick={() => { setLogsText(starterLog); setError('') }}><FileText size={15} /> Load sample</button>} />
    <div className="analysis-layout">
      <section className="panel analysis-input-panel">
        <div className="panel-heading"><div><h2>Analyze an error</h2><p>Paste a stack trace or upload a log file to get started.</p></div><span className="secure-label"><ShieldAlert size={13} /> Private by default</span></div>
        <div className="field-label-row"><label htmlFor="log-input">Error log <span>Required</span></label><span className="field-hint">Up to 2 MB</span></div>
        <div className="code-input-wrap"><textarea id="log-input" spellCheck={false} value={logsText} onChange={event => setLogsText(event.target.value)} placeholder={'Paste your error log or stack trace here…\n\nTypeError: Cannot read properties of undefined'} /><div className="code-input-footer"><span><Code2 size={13} /> Plain text, JSON, or stack trace</span><button className="text-button" onClick={() => fileRef.current?.click()}><Upload size={13} /> Upload file</button><input ref={fileRef} type="file" accept=".txt,.log,.json,.out,text/plain,application/json" hidden onChange={event => handleFile(event.target.files?.[0])} /></div></div>
        <div className="form-selects"><label>Language<select value={language} onChange={event => setLanguage(event.target.value)}><option>TypeScript</option><option>JavaScript</option><option>Python</option><option>Java</option><option>Go</option><option>Ruby</option><option>Other</option></select></label><label>Error category<select value={category} onChange={event => setCategory(event.target.value)}><option>Runtime error</option><option>Performance</option><option>Database</option><option>Network</option><option>Security</option><option>Build / deployment</option></select></label></div>
        {error && <div role="alert" className="inline-error"><AlertCircle size={14} />{error}{logsText.trim() && <button onClick={() => void analyze()}>Retry</button>}</div>}
        <div className="analysis-submit-row"><span><span className="privacy-dot" /> Your logs are encrypted and never used to train AI.</span><div>{running && <button className="button button-secondary" onClick={() => abortRef.current?.abort()}><X size={14} /> Cancel</button>}<button className="button button-primary" onClick={() => void analyze()} disabled={running}>{running ? <><LoaderCircle size={15} className="spin" /> Analyzing…</> : <><Sparkles size={15} /> Analyze error</>}</button></div></div>
      </section>
      <aside className="analysis-aside">
        <div className="analysis-aside-card"><div className="aside-icon"><Sparkles size={17} /></div><h3>What you’ll get</h3><ul><li><Check size={14} /> Root cause analysis</li><li><Check size={14} /> Prioritized fix steps</li><li><Check size={14} /> Suggested code changes</li><li><Check size={14} /> Confidence & severity score</li></ul></div>
        <div className="analysis-tip"><Lightbulb size={16} /><div><strong>Pro tip</strong><p>Include the full stack trace and a few lines of surrounding context for more accurate results.</p></div></div>
      </aside>
    </div>
    {(running || response || result) && <section className="panel analysis-result-panel" aria-live="polite">
      <div className="panel-heading"><div><h2>{running ? 'Analyzing your error' : result ? 'Analysis complete' : 'AI response'}</h2><p>{running ? 'DebugMate is tracing the issue back to its source.' : 'Here’s what we found and how to fix it.'}</p></div>{result && <button className="button button-secondary" onClick={() => void analyze()}><Sparkles size={14} /> Regenerate</button>}</div>
      {response && <div className="stream-response"><div className="response-orb"><Bot size={16} /></div><p>{response}{running && <span className="typing-cursor" />}</p></div>}
      {running && <div className="analysis-progress"><LoaderCircle className="spin" size={15} /> Reading stack trace <span>·</span> Identifying root cause</div>}
      {result && <div className="analysis-findings"><div className="finding-summary"><div className="finding-title"><span className="finding-alert"><AlertCircle size={16} /></span><div><strong>{result.title}</strong><small>{result.confidence}% confidence <span>·</span> <SeverityBadge level={result.severity} /></small></div></div><p>{result.summary}</p></div><div className="finding-columns"><div><h3>Potential root causes</h3>{result.rootCauses.map(item => <p className="finding-item" key={item}><span>•</span>{item}</p>)}</div><div><h3>Recommended steps</h3>{result.steps.map((item, index) => <p className="finding-item" key={item}><span className="step-number">{index + 1}</span>{item}</p>)}</div></div><div className="suggested-code-heading"><h3>Suggested fix</h3><button className="text-button" onClick={() => void navigator.clipboard?.writeText(result.code)}><Code2 size={13} /> Copy code</button></div><pre className="suggested-code"><code>{result.code}</code></pre></div>}
    </section>}
  </div>
}

export function LogsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [level, setLevel] = useState('all')
  const [timeRange, setTimeRange] = useState('24h')
  const [sortBy, setSortBy] = useState('newest')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search)
  const query = useQuery({ queryKey: ['logs'], queryFn: fetchLogs })
  const pageSize = 8
  const filtered = useMemo(() => {
    const cutoff = timeRange === '24h' ? Date.now() - 24 * 60 * 60_000 : timeRange === '7d' ? Date.now() - 7 * 24 * 60 * 60_000 : 0
    const severityRank: Record<string, number> = { critical: 0, error: 1, warning: 2, info: 3 }
    return (query.data ?? [])
      .filter(log => (level === 'all' || log.level === level)
        && new Date(log.timestamp).getTime() >= cutoff
        && `${log.message} ${log.service} ${log.traceId}`.toLowerCase().includes(debouncedSearch.toLowerCase()))
      .sort((a, b) => sortBy === 'severity'
        ? severityRank[a.level] - severityRank[b.level] || new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [query.data, level, timeRange, sortBy, debouncedSearch])
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  function updateSearch(value: string) { setSearch(value); setPage(1); setSearchParams(value ? { search: value } : {}) }
  return <div className="page">
    <PageHeader eyebrow="OBSERVABILITY" title="Log explorer" description="Search, filter, and investigate application events." actions={<button className="button button-secondary" onClick={() => { const content = ['timestamp,level,service,message,traceId', ...(query.data ?? []).map(log => [log.timestamp, log.level, log.service, `"${log.message}"`, log.traceId].join(','))].join('\n'); const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([content], { type: 'text/csv' })); link.download = 'debugmate-logs.csv'; link.click(); URL.revokeObjectURL(link.href) }}><Download size={15} /> Export CSV</button>} />
    <div className="log-summary-strip"><span><span className="footer-status" /> Live stream connected</span><span>Showing <strong>{filtered.length}</strong> events from the last 24 hours</span><span>Last updated just now</span></div>
    <Panel title="Application logs" subtitle="Filter and inspect incoming events." action={<label className="log-select-control"><Clock3 size={13} /><select aria-label="Filter logs by time" value={timeRange} onChange={event => { setTimeRange(event.target.value); setPage(1) }}><option value="24h">Last 24 hours</option><option value="7d">Last 7 days</option><option value="all">All time</option></select><ChevronDown size={12} /></label>}>
      <div className="log-toolbar"><div className="log-search"><Search size={15} /><input aria-label="Search logs" placeholder="Search by message, service, trace ID..." value={search} onChange={event => updateSearch(event.target.value)} />{search && <button aria-label="Clear search" onClick={() => updateSearch('')}><X size={14} /></button>}</div><div className="log-toolbar-filters"><div className="level-filters" role="group" aria-label="Filter by severity">{['all', 'critical', 'error', 'warning', 'info'].map(item => <button key={item} className={level === item ? 'level-filter active' : 'level-filter'} onClick={() => { setLevel(item); setPage(1) }}>{item === 'all' ? 'All levels' : item.charAt(0).toUpperCase() + item.slice(1)}</button>)}</div><label className="sort-control"><span>Sort</span><select aria-label="Sort logs" value={sortBy} onChange={event => setSortBy(event.target.value)}><option value="newest">Newest</option><option value="severity">Severity</option></select></label></div></div>
      <QueryMessage loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />
      {!query.isLoading && !query.error && <div className="logs-table-wrap"><table className="logs-table"><thead><tr><th>SEVERITY</th><th>TIMESTAMP</th><th>MESSAGE</th><th>SERVICE</th><th>TRACE ID</th><th /></tr></thead><tbody>
        {visible.map(log => <LogTableRow key={log.id} log={log} expanded={expanded === log.id} onToggle={() => setExpanded(expanded === log.id ? null : log.id)} />)}
      </tbody></table>{filtered.length === 0 && <EmptyState title="No logs match your filters" description="Try another search term or severity level." />}</div>}
      <div className="table-pagination"><span>{filtered.length ? `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)} of ${filtered.length} events` : 'No events to show'}</span><div><button aria-label="Previous page" disabled={page <= 1} onClick={() => setPage(current => current - 1)}><ChevronLeft size={15} /></button><span>Page {page} of {pageCount}</span><button aria-label="Next page" disabled={page >= pageCount} onClick={() => setPage(current => current + 1)}><ChevronRight size={15} /></button></div></div>
    </Panel>
  </div>
}

function LogTableRow({ log, expanded, onToggle }: { log: AppLog; expanded: boolean; onToggle: () => void }) {
  return <>
    <tr className={expanded ? 'log-row expanded' : 'log-row'} onClick={onToggle} tabIndex={0} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') onToggle() }}>
      <td><SeverityBadge level={log.level} /></td><td className="timestamp-cell">{formatTime(log.timestamp)}</td><td className="log-message-cell">{log.message}</td><td><span className="service-name">{log.service}</span></td><td className="trace-cell">{log.traceId}</td><td><ChevronDown size={14} className={expanded ? 'rotate-icon' : ''} /></td>
    </tr>
    {expanded && <tr className="log-detail-row"><td colSpan={6}><div><div><span>ENVIRONMENT</span><strong>{log.environment}</strong></div><div><span>TRACE DETAILS</span><pre>{log.details}</pre></div></div></td></tr>}
  </>
}

export function HistoryPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const query = useQuery({ queryKey: ['conversations'], queryFn: fetchConversations })
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Conversation | null>(null)
  const debouncedSearch = useDebounce(search)
  const remove = useMutation({ mutationFn: deleteConversation, onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['conversations'] }); setSelected(null) } })
  const items = (query.data ?? []).filter(item => `${item.title} ${item.preview}`.toLowerCase().includes(debouncedSearch.toLowerCase()))
  return <div className="page">
    <PageHeader eyebrow="YOUR WORKSPACE" title="Conversation history" description="Pick up where you left off with your AI troubleshooting sessions." actions={<button className="button button-primary" onClick={() => navigate('/analysis')}><Plus size={15} /> New analysis</button>} />
    <div className="history-search"><Search size={16} /><input aria-label="Search conversations" placeholder="Search conversations..." value={search} onChange={event => setSearch(event.target.value)} /><kbd>⌘ K</kbd></div>
    <QueryMessage loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />
    {!query.isLoading && !query.error && (items.length ? <div className="conversation-list">{items.map(conversation => <article className="conversation-card" key={conversation.id}><button className="conversation-open" onClick={() => setSelected(conversation)}><span className="conversation-icon"><MessageSquare size={17} /></span><span className="conversation-copy"><strong>{conversation.title}</strong><span>{conversation.preview}</span><small>{formatTime(conversation.timestamp)} <i /> {conversation.messages.length} messages</small></span><ArrowRight size={16} className="row-arrow" /></button><button className="icon-button delete-conversation" aria-label={`Delete ${conversation.title}`} onClick={() => remove.mutate(conversation.id)} disabled={remove.isPending}><Trash2 size={15} /></button></article>)}</div> : <EmptyState title="No conversations found" description={search ? 'Try a different search term.' : 'Start an analysis to create your first conversation.'} />)}
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><section role="dialog" aria-modal="true" aria-labelledby="conversation-title" className="conversation-modal" onClick={event => event.stopPropagation()}><div className="modal-header"><div><span className="eyebrow">TROUBLESHOOTING SESSION</span><h2 id="conversation-title">{selected.title}</h2><p>{formatTime(selected.timestamp)}</p></div><button className="icon-button" aria-label="Close conversation" onClick={() => setSelected(null)}><X size={18} /></button></div><div className="modal-messages">{selected.messages.map((message, index) => <div key={`${selected.id}-${index}`} className={`modal-message ${message.role}`}><span>{message.role === 'user' ? 'You' : 'DebugMate AI'}</span><p>{message.content}</p></div>)}</div><div className="modal-footer"><button className="button button-secondary" onClick={() => { setSelected(null); navigate('/analysis') }}><Sparkles size={14} /> Analyze another error</button><button className="button button-primary" onClick={() => { setSelected(null); navigate(`/assistant?conversation=${selected.id}`) }}><MessageSquare size={14} /> Continue conversation</button></div></section></div>}
  </div>
}

export function AnalyticsPage() {
  const query = useQuery({ queryKey: ['analytics'], queryFn: fetchAnalytics })
  const data = query.data
  const tooltipStyle = { background: '#202126', border: '1px solid #33353b', borderRadius: 8, color: '#f4f4f5', fontSize: 12 }
  return <div className="page">
    <PageHeader eyebrow="INSIGHTS" title="Analytics" description="Understand error patterns and measure application health." actions={<span className="period-label">Last 7 days</span>} />
    <QueryMessage loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />
    {data && <>
      <div className="analytics-kpis"><div><span>STABILITY SCORE</span><strong>99.94<small>%</small></strong><em><ArrowUpRight size={13} /> 0.12% this week</em></div><div><span>ERRORS PER 1K REQUESTS</span><strong>2.8</strong><em><ArrowDownRight size={13} /> 14% this week</em></div><div><span>MTTR</span><strong>18<small>m</small> 32<small>s</small></strong><em><ArrowDownRight size={13} /> 12% this week</em></div><div><span>RESOLUTION RATE</span><strong>87<small>%</small></strong><em><ArrowUpRight size={13} /> 6% this week</em></div></div>
      <div className="analytics-grid">
        <Panel title="Errors over time" subtitle="Daily errors compared to resolved issues" className="wide-chart-panel"><div className="chart-legend"><span><i className="legend-dot mint-dot" /> Errors</span><span><i className="legend-dot orange-dot" /> Resolved</span></div><div className="chart-area analytics-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.trend} margin={{ top: 12, right: 8, bottom: 0, left: -20 }}><defs><linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#55d6a5" stopOpacity={0.16} /><stop offset="100%" stopColor="#55d6a5" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#292a30" vertical={false} /><XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#777983', fontSize: 11 }} dy={10} /><YAxis tickLine={false} axisLine={false} tick={{ fill: '#777983', fontSize: 11 }} /><Tooltip contentStyle={tooltipStyle} /><Area type="monotone" dataKey="errors" stroke="#55d6a5" strokeWidth={2} fill="url(#analyticsGradient)" /><Area type="monotone" dataKey="resolved" stroke="#fb923c" strokeWidth={1.5} fill="transparent" /></AreaChart></ResponsiveContainer></div></Panel>
        <Panel title="Errors by severity" subtitle="Current period"><div className="severity-chart analytics-severity"><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.severity} dataKey="value" nameKey="name" innerRadius={48} outerRadius={64} paddingAngle={4} stroke="none">{data.severity.map(item => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>100</strong><small>events</small></div></div><div className="severity-legend">{data.severity.map(item => <div key={item.name}><span><i className="legend-dot" style={{ background: item.color }} />{item.name}</span><strong>{item.value}%</strong></div>)}</div></div></Panel>
        <Panel title="Most frequent errors" subtitle="Top exception types"><div className="top-errors-chart"><ResponsiveContainer width="100%" height={210}><BarChart data={data.topErrors} layout="vertical" margin={{ left: 10, right: 20 }}><CartesianGrid stroke="#292a30" horizontal={false} /><XAxis type="number" hide /><YAxis type="category" dataKey="name" width={185} tickLine={false} axisLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="count" fill="#55d6a5" radius={[0, 4, 4, 0]} barSize={14} /></BarChart></ResponsiveContainer></div></Panel>
        <Panel title="Resolution time" subtitle="Average time to resolve (minutes)"><div className="chart-area resolution-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.resolution} margin={{ top: 12, right: 4, bottom: 0, left: -22 }}><CartesianGrid stroke="#292a30" vertical={false} /><XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#777983', fontSize: 11 }} dy={10} /><YAxis tickLine={false} axisLine={false} tick={{ fill: '#777983', fontSize: 11 }} /><Tooltip contentStyle={tooltipStyle} /><Area type="monotone" dataKey="minutes" stroke="#a78bfa" strokeWidth={2} fill="#a78bfa" fillOpacity={0.08} /></AreaChart></ResponsiveContainer></div></Panel>
      </div>
    </>}
  </div>
}

export function AssistantPage() {
  const [params] = useSearchParams()
  const queryClient = useQueryClient()
  const conversationsQuery = useQuery({ queryKey: ['conversations'], queryFn: fetchConversations })
  const [activeId, setActiveId] = useState(params.get('conversation') ?? '')
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const responseRef = useRef('')
  const active = conversationsQuery.data?.find(conversation => conversation.id === activeId)
  async function sendMessage(message = prompt) {
    if (!message.trim()) { setError('Write a question or paste an error to get started.'); return }
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setRunning(true); setError(''); setResponse(''); responseRef.current = ''
    try {
      await streamAnalysis({ logs: message, language: 'TypeScript', category: 'Runtime error' }, controller.signal, chunk => {
        responseRef.current += chunk
        setResponse(previous => previous + chunk)
      })
      const finalResponse = responseRef.current
      const updated: Conversation = active
        ? { ...active, timestamp: new Date().toISOString(), preview: finalResponse.slice(0, 110), messages: [...active.messages, { role: 'user', content: message }, { role: 'assistant', content: finalResponse }] }
        : { id: `conv-${Date.now()}`, title: message.split('\n')[0].slice(0, 60), preview: finalResponse.slice(0, 110), timestamp: new Date().toISOString(), messages: [{ role: 'user', content: message }, { role: 'assistant', content: finalResponse }] }
      await saveConversation(updated, !active)
      await queryClient.invalidateQueries({ queryKey: ['conversations'] })
      setActiveId(updated.id)
      setPrompt('')
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') setError('Response cancelled.')
      else setError(caught instanceof Error ? caught.message : 'We couldn’t get a response. Please try again.')
    } finally { setRunning(false); abortRef.current = null }
  }
  return <div className="page assistant-page">
    <PageHeader eyebrow="YOUR AI PAIR" title="AI assistant" description="Ask questions, investigate an issue, or continue a previous session." actions={<button className="button button-secondary" onClick={() => { setActiveId(''); setResponse(''); setError('') }}><Plus size={15} /> New chat</button>} />
    <div className="assistant-layout"><aside className="assistant-sessions"><div className="assistant-session-title">RECENT SESSIONS</div><QueryMessage loading={conversationsQuery.isLoading} error={conversationsQuery.error} retry={() => void conversationsQuery.refetch()} />{(conversationsQuery.data ?? []).slice(0, 6).map(item => <button key={item.id} className={`assistant-session ${item.id === activeId ? 'selected' : ''}`} onClick={() => { setActiveId(item.id); setResponse(''); setError('') }}><MessageSquare size={14} /><span><strong>{item.title}</strong><small>{formatTime(item.timestamp)}</small></span></button>)}</aside>
      <section className="assistant-conversation"><div className="assistant-intro"><div className="assistant-avatar"><Sparkles size={19} /></div><h2>{active ? active.title : 'How can I help you debug?'}</h2><p>Share an error, ask about your code, or explore a root cause.</p></div>
        {(active?.messages ?? []).map((message, index) => <div className={`assistant-message ${message.role}`} key={`${activeId}-${index}`}><div className="message-avatar">{message.role === 'user' ? 'JD' : <Sparkles size={14} />}</div><div><small>{message.role === 'user' ? 'You' : 'DebugMate AI'}</small><p>{message.content}</p></div></div>)}
        {response && <div className="assistant-message assistant"><div className="message-avatar"><Sparkles size={14} /></div><div><small>DebugMate AI</small><p>{response}{running && <span className="typing-cursor" />}</p></div></div>}
        {running && <button className="text-button cancel-generation" onClick={() => abortRef.current?.abort()}><X size={13} /> Stop generating</button>}
        {error && <div role="alert" className="inline-error"><AlertCircle size={14} />{error}<button onClick={() => void sendMessage()}>Retry</button></div>}
        {!active && !response && <div className="suggestion-chips">{['Why is my API returning a 500?', 'Help me understand this stack trace', 'How can I reduce database timeouts?'].map(text => <button key={text} onClick={() => { setPrompt(text); void sendMessage(text) }}>{text}<ArrowUpRight size={13} /></button>)}</div>}
        <form className="assistant-composer" onSubmit={event => { event.preventDefault(); void sendMessage() }}><textarea aria-label="Message the AI assistant" placeholder="Ask a question or paste an error…" value={prompt} onChange={event => setPrompt(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage() } }} /><div><span><Sparkles size={13} /> Responses are generated from your prompt</span><button className="send-button" type="submit" disabled={running} aria-label="Send message"><Send size={15} /></button></div></form>
      </section></div>
  </div>
}

export function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [weeklyReport, setWeeklyReport] = useState(true)
  const [retention, setRetention] = useState('30 days')
  return <div className="page">
    <PageHeader eyebrow="PREFERENCES" title="Settings" description="Manage your workspace preferences and notifications." />
    <div className="settings-layout">
      <Panel title="Workspace" subtitle="Your team and environment defaults."><div className="settings-form"><label>Workspace name<input defaultValue="Acme Platform" /></label><label>Default environment<select defaultValue="Production"><option>Production</option><option>Staging</option><option>Development</option></select></label><label>Log retention<select value={retention} onChange={event => setRetention(event.target.value)}><option>7 days</option><option>30 days</option><option>90 days</option></select><small>Logs older than this period are automatically removed.</small></label></div></Panel>
      <Panel title="Notifications" subtitle="Choose which updates you’d like to receive."><div className="settings-toggles"><label><span><strong>Critical error alerts</strong><small>Get notified when a critical error is detected.</small></span><input type="checkbox" checked={notifications} onChange={event => setNotifications(event.target.checked)} /></label><label><span><strong>Weekly stability report</strong><small>A summary of your app’s health every Monday.</small></span><input type="checkbox" checked={weeklyReport} onChange={event => setWeeklyReport(event.target.checked)} /></label></div></Panel>
      <div className="settings-save"><span>{saved ? <><Check size={14} /> Your preferences have been saved.</> : 'Changes are saved to this browser session.'}</span><button className="button button-primary" onClick={() => setSaved(true)}><Check size={14} /> Save changes</button></div>
    </div>
  </div>
}
