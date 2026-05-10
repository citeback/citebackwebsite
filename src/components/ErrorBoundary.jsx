import { Component } from 'react'

/**
 * ErrorBoundary — catches render errors in child components.
 * Without this, a JS error in any component crashes the entire page.
 * Wrap heavy/risky components (CameraMap, AI chat) with this.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Non-fatal — log but don't crash the app
    console.error('[ErrorBoundary] Component error:', error?.message, info?.componentStack?.split('\n')[1]?.trim())
  }

  render() {
    if (this.state.hasError) {
      const { fallback, label = 'This section' } = this.props
      if (fallback) return fallback
      return (
        <div className="error-boundary-fallback" role="alert">
          <p className="error-boundary-title">{label} failed to load.</p>
          <button
            className="error-boundary-btn"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
