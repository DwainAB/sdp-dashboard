import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-gray-100 border border-gray-200 rounded-xl p-8 max-w-md w-full text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="text-red-700 text-xl font-bold">!</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Une erreur est survenue</h1>
            <p className="text-sm text-gray-500 font-mono bg-gray-50 rounded-lg p-3 text-left break-all">
              {this.state.error?.message || 'Erreur inconnue'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Recharger la page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
