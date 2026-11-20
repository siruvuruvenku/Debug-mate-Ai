import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Activity, Bell, BookOpen, Bot, ChevronDown, CircleHelp, Command, FileSearch2,
  LayoutDashboard, Menu, Search, Settings, ShieldAlert, Sparkles, X, Clock3,
} from 'lucide-react'

const primaryLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/analysis', label: 'Error analysis', icon: ShieldAlert },
  { to: '/logs', label: 'Log explorer', icon: FileSearch2 },
  { to: '/assistant', label: 'AI assistant', icon: Bot },
  { to: '/history', label: 'History', icon: Clock3 },
  { to: '/analytics', label: 'Analytics', icon: Activity },
]
const bottomLinks = [{ to: '/settings', label: 'Settings', icon: Settings }]

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [projectOpen, setProjectOpen] = useState(false)
  const [topProjectOpen, setTopProjectOpen] = useState(false)
  const [project, setProject] = useState('Acme Platform')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (search.trim()) navigate(`/logs?search=${encodeURIComponent(search.trim())}`)
  }

  return (
    <div className="app-shell">
      {mobileOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Command size={17} strokeWidth={2.5} /></div>
          <span>debugmate<span className="brand-ai">.ai</span></span>
          <button className="icon-button mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <button className="workspace-switch" onClick={() => setProjectOpen(!projectOpen)} aria-expanded={projectOpen}>
          <div className="workspace-avatar">A</div>
          <span className="workspace-copy"><strong>{project}</strong><small>Pro workspace</small></span>
          <ChevronDown size={15} className={projectOpen ? 'rotate-icon' : ''} />
        </button>
        {projectOpen && <div className="project-menu">
          {['Acme Platform', 'Mobile App', 'Sandbox'].map(name => <button key={name} onClick={() => { setProject(name); setProjectOpen(false) }} className={project === name ? 'project-selected' : ''}>{name}{project === name && <span>Active</span>}</button>)}
        </div>}
        <div className="nav-section-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {primaryLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}>
              <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
              {label === 'Error analysis' && <span className="nav-pulse" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="usage-card">
            <div className="usage-top"><span>AI credits</span><span>68%</span></div>
            <div className="usage-track"><div /></div>
            <p>6,820 of 10,000 credits used</p>
            <button onClick={() => navigate('/settings')}>Manage plan <span>↗</span></button>
          </div>
          {bottomLinks.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}><Icon size={17} strokeWidth={1.8} /><span>{label}</span></NavLink>)}
          <div className="user-card">
            <div className="user-avatar">JD</div>
            <div className="user-copy"><strong>Jordan Davis</strong><small>jordan@acme.dev</small></div>
            <button className="icon-button" aria-label="Account settings" onClick={() => navigate('/settings')}><ChevronDown size={15} /></button>
          </div>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={19} /></button>
          <form className="global-search" onSubmit={submitSearch}>
            <Search size={16} />
            <input aria-label="Search logs and errors" placeholder="Search logs, errors..." value={search} onChange={event => setSearch(event.target.value)} />
            <kbd>⌘ K</kbd>
          </form>
          <div className="topbar-actions">
            <div className="top-project-wrap"><button className="top-project" onClick={() => setTopProjectOpen(!topProjectOpen)} aria-expanded={topProjectOpen}><span className="project-dot" />{project}<ChevronDown size={14} /></button>
              {topProjectOpen && <div className="top-project-menu">{['Acme Platform', 'Mobile App', 'Sandbox'].map(name => <button key={name} onClick={() => { setProject(name); setTopProjectOpen(false) }} className={project === name ? 'project-selected' : ''}>{name}{project === name && <span>Active</span>}</button>)}</div>}
            </div>
            <div className="notification-wrap">
              <button className="icon-button notification-button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen(!notificationsOpen)}><Bell size={17} /><span /></button>
              {notificationsOpen && <div className="notification-popover"><strong>Notifications</strong><p><span className="notification-dot critical-dot" />2 critical errors need attention</p><p><span className="notification-dot success-dot" />Weekly report is ready</p><button onClick={() => { setNotificationsOpen(false); navigate('/logs') }}>View all activity</button></div>}
            </div>
            <button className="icon-button help-button" aria-label="Help and documentation" onClick={() => navigate('/assistant')}><CircleHelp size={17} /></button>
            <button className="top-avatar" aria-label="User profile" onClick={() => navigate('/settings')}>JD</button>
          </div>
        </header>
        <main className="page-content"><Outlet /></main>
        <footer className="app-footer"><span>© 2025 DebugMate AI</span><span><span className="footer-status" /> All systems operational</span><a href="mailto:support@debugmate.ai">Support <BookOpen size={12} /></a></footer>
      </div>
      <div className="sr-only"><Sparkles /> <Bot /></div>
    </div>
  )
}
