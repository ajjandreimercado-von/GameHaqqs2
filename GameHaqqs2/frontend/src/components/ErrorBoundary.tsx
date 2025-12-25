import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🔴 ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1b2838] flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <Alert variant="destructive" className="bg-red-900/20 border-red-900/50">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-red-400">Something went wrong</AlertTitle>
              <AlertDescription className="text-red-300 mt-2">
                <p className="mb-4">{this.state.error?.message}</p>
                {this.state.errorInfo && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm">Stack trace</summary>
                    <pre className="mt-2 text-xs overflow-auto bg-[#16202d] p-3 rounded">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>
            <div className="mt-4 flex gap-2">
              <Button 
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb]"
              >
                Reload Page
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className="border-[#2a475e] text-[#8f98a0]"
              >
                Clear Cache & Login
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
