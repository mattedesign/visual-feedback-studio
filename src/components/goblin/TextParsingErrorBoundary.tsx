import React from 'react';
import { withGoblinErrorBoundary } from '@/components/goblin/monitoring/errorBoundary';

interface TextParsingErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  originalText?: string;
}

class TextParsingErrorBoundaryInner extends React.Component<
  TextParsingErrorBoundaryProps,
  { hasError: boolean }
> {
  constructor(props: TextParsingErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Text parsing component error:', error, errorInfo);
    
    // Enhanced logging for pipeline monitoring
    console.error('TextParsingErrorBoundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      originalText: this.props.originalText,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
    
    // Report to monitoring if available
    if (typeof window !== 'undefined' && (window as any).reportError) {
      (window as any).reportError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      // Render fallback or original text
      return (
        this.props.fallback || 
        <span>{this.props.originalText || 'Text parsing failed'}</span>
      );
    }

    return this.props.children;
  }
}

export const TextParsingErrorBoundary = withGoblinErrorBoundary(
  TextParsingErrorBoundaryInner,
  <span>Text parsing unavailable</span>
);