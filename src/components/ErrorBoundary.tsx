import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State { return { hasError: true } }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application render error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return <div className="error-screen"><AlertTriangle size={24} /><h1>Something went wrong</h1><p>We couldn’t render this page. Refresh to try again.</p><button className="button button-primary" onClick={() => window.location.reload()}>Refresh page</button></div>
    }
    return this.props.children
  }
}
