
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PrototypeRendererProps {
  code: string;
  title?: string;
  onError?: (error: Error) => void;
}

export function PrototypeRenderer({ code, title = "Enhanced Design", onError }: PrototypeRendererProps) {
  const [renderState, setRenderState] = useState<'ready' | 'success' | 'error'>('ready');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const cleanupIframe = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const renderPrototype = useCallback(async () => {
    if (!code?.trim()) {
      const errorMsg = 'No valid component code provided';
      console.warn('⚠️', errorMsg);
      setError(errorMsg);
      setRenderState('error');
      return;
    }

    try {
      setError(null);
      cleanupIframe();

      console.log('🎨 Rendering prototype:', { 
        title, 
        codeLength: code.length,
        attempt: retryCount + 1 
      });

      const iframe = iframeRef.current;
      if (!iframe) {
        throw new Error('Iframe not mounted yet');
      }

      console.log('✅ Iframe reference acquired, proceeding with render');

      const sanitizedCode = sanitizeComponentCode(code);
      const iframeContent = createIframeContent(sanitizedCode, title);
      
      // Direct srcdoc assignment
      iframe.srcdoc = iframeContent;
      
      // Simple timeout-based success detection
      timeoutRef.current = setTimeout(() => {
        console.log('✅ Prototype rendering completed');
        setRenderState('success');
      }, 1500);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown rendering error';
      console.error('❌ Prototype rendering failed:', error);
      setError(errorMessage);
      setRenderState('error');
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [code, title, retryCount, onError, cleanupIframe]);

  // Effect to render after iframe is mounted
  useEffect(() => {
    if (renderState === 'ready' && iframeRef.current) {
      renderPrototype();
    }
    return cleanupIframe;
  }, [renderState, renderPrototype, cleanupIframe]);

  const handleRetry = useCallback(() => {
    console.log('🔄 Retrying prototype render...');
    setRetryCount(prev => prev + 1);
    setRenderState('ready'); // Reset to ready state to trigger re-render
  }, []);

  const sanitizeComponentCode = (rawCode: string): string => {
    // Remove markdown code blocks
    let cleanCode = rawCode.replace(/```(?:jsx?|tsx?)?\n?/g, '').replace(/```\n?$/g, '').trim();
    
    // Remove import statements
    cleanCode = cleanCode.replace(/import\s+.*?from\s+['"][^'"]*['"];?\s*\n?/g, '');
    
    // Remove export statements
    cleanCode = cleanCode.replace(/export\s+(default\s+)?/g, '');
    
    // Validate basic structure
    if (!cleanCode.includes('function') || !cleanCode.includes('return')) {
      throw new Error('Invalid component structure - missing function or return statement');
    }
    
    // Basic validation - just ensure it's not completely malformed
    if (cleanCode.length < 20) {
      throw new Error('Component code is too short to be valid');
    }
    
    return cleanCode;
  };

  const createIframeContent = (componentCode: string, componentTitle: string): string => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${componentTitle}</title>
          <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f8fafc;
              min-height: 100vh;
            }
            .error-boundary {
              padding: 2rem;
              background: #fef2f2;
              border: 1px solid #fecaca;
              border-radius: 0.5rem;
              margin: 1rem;
              color: #dc2626;
            }
            .loading {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div id="root">
            <div class="loading">Loading component...</div>
          </div>
          
          <script type="text/babel">
            const { useState, useEffect, useCallback, useMemo, useRef } = React;
            
            // Error boundary component
            class ErrorBoundary extends React.Component {
              constructor(props) {
                super(props);
                this.state = { hasError: false, error: null };
              }
              
              static getDerivedStateFromError(error) {
                return { hasError: true, error };
              }
              
              componentDidCatch(error, errorInfo) {
                console.error('Component error:', error, errorInfo);
              }
              
              render() {
                if (this.state.hasError) {
                  return (
                    <div className="error-boundary">
                      <h2>Component Error</h2>
                      <p>There was an error rendering this component:</p>
                      <code>{this.state.error?.message || 'Unknown error'}</code>
                    </div>
                  );
                }
                
                return this.props.children;
              }
            }
            
            try {
              // Component code
              ${componentCode}
              
              // Render with error boundary
              function App() {
                return (
                  <ErrorBoundary>
                    <EnhancedDesign />
                  </ErrorBoundary>
                );
              }
              
              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(<App />);
              
            } catch (error) {
              console.error('Compilation error:', error);
              document.getElementById('root').innerHTML = \`
                <div class="error-boundary">
                  <h2>Compilation Error</h2>
                  <p>Failed to compile component:</p>
                  <code>\${error.message}</code>
                </div>
              \`;
            }
          </script>
        </body>
      </html>
    `;
  };

  if (renderState === 'error') {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-2">Rendering Failed</h3>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <div className="flex space-x-3">
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry ({retryCount + 1}/3)
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <iframe
        ref={iframeRef}
        className="w-full h-[600px] border border-gray-200 rounded-lg bg-white"
        sandbox="allow-scripts"
        title={title}
        onLoad={() => {
          // Trigger render once iframe is loaded
          if (renderState === 'ready') {
            renderPrototype();
          }
        }}
      />
    </div>
  );
}
