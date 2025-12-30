import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Dashboard Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-surface-dark flex items-center justify-center p-4">
                    <div className="bg-surface-card border border-red-500/30 rounded-2xl p-6 max-w-md w-full text-center">
                        <div className="p-3 bg-red-500/20 rounded-full w-fit mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
                        <p className="text-white/60 text-sm mb-4">
                            The dashboard encountered an error. Please refresh the page to try again.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 px-4 py-2 bg-cane-green text-white rounded-xl mx-auto hover:bg-cane-green-light transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh Page
                        </button>
                        {this.state.error && (
                            <details className="mt-4 text-left">
                                <summary className="text-xs text-white/40 cursor-pointer">Error details</summary>
                                <pre className="mt-2 p-2 bg-black/20 rounded text-xs text-red-300 overflow-auto">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
