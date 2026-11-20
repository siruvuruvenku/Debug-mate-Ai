import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, CircleHelp } from 'lucide-react'

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <div className="page-header">
    <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>
    {actions && <div className="page-header-actions">{actions}</div>}
  </div>
}

export function Panel({ title, subtitle, action, children, className = '' }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}><div className="panel-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>
}

export function StatCard({ label, value, change, note, icon: Icon, color = 'mint' }: { label: string; value: string; change: string; note: string; icon: React.ElementType; color?: string }) {
  const downIsGood = label === 'Critical errors' || label === 'Avg. resolution'
  const positive = change.startsWith('+') !== downIsGood
  const Trend = positive ? ArrowUpRight : ArrowDownRight
  return <article className="stat-card">
    <div className="stat-card-top"><span>{label}</span><span className={`stat-icon ${color}`}><Icon size={16} /></span></div>
    <div className="stat-value">{value}</div>
    <div className="stat-foot"><span className={`stat-change ${positive ? 'trend-good' : 'trend-bad'}`}><Trend size={13} />{change}</span><span>{note}</span></div>
  </article>
}

export function SeverityBadge({ level }: { level: string }) {
  return <span className={`severity-badge severity-${level.toLowerCase()}`}><span />{level}</span>
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="empty-state"><div><CircleHelp size={20} /></div><strong>{title}</strong><p>{description}</p></div>
}

export function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date)
}
