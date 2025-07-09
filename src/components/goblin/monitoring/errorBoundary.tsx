/**
 * GOBLIN ERROR BOUNDARY
 * 
 * Catches and handles errors in the goblin analysis pipeline
 * Prevents crashes and provides fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class GoblinErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: Date.now().toString()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error with context
    console.group('🚨 GOBLIN ERROR BOUNDARY CAUGHT ERROR');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error Boundary Props:', this.props);
    console.groupEnd();

    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to monitoring service (placeholder)
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, you'd send this to your monitoring service
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId
    };

    console.log('📊 Error Report Generated:', errorReport);
    
    // Store in localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('goblin-errors') || '[]');
      existingErrors.push(errorReport);
      // Keep only last 10 errors
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem('goblin-errors', JSON.stringify(recentErrors));
    } catch (e) {
      console.warn('Failed to store error report:', e);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Goblin Analysis Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Something went wrong with the goblin analysis. This error has been logged for investigation.
            </p>
            
            <div className="space-y-2">
              <p className="text-xs font-mono text-muted-foreground">
                Error ID: {this.state.errorId}
              </p>
              {this.state.error && (
                <p className="text-xs font-mono text-destructive">
                  {this.state.error.message}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="secondary"
                size="sm"
              >
                Refresh Page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="text-xs cursor-pointer text-muted-foreground">
                  Show Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export function withGoblinErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <GoblinErrorBoundary fallback={fallback}>
        <Component {...props} />
      </GoblinErrorBoundary>
    );
  };
}
