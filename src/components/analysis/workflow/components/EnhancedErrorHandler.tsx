import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, RotateCcw, Bug } from 'lucide-react';
import { ErrorRecoveryGuide } from '@/components/analysis/ErrorRecoveryGuide';

interface EnhancedErrorHandlerProps {
  error: Error | string;
  onRetry?: () => void;
  onReset?: () => void;
  onDebug?: () => void;
  context?: {
    step: string;
    imageCount: number;
    promptLength: number;
  };
}

export const EnhancedErrorHandler: React.FC<EnhancedErrorHandlerProps> = ({
  error,
  onRetry,
  onReset,
  onDebug,
  context
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Error Alert */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Analysis Failed:</strong> {errorMessage}
        </AlertDescription>
      </Alert>

      {/* Context Information */}
      {context && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-yellow-800">Analysis Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm text-yellow-700">
              <div>
                <strong>Step:</strong> {context.step}
              </div>
              <div>
                <strong>Images:</strong> {context.imageCount}
              </div>
              <div>
                <strong>Prompt Length:</strong> {context.promptLength} chars
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
        
        {onReset && (
          <Button onClick={onReset} variant="outline" className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Start Over
          </Button>
        )}
        
        {onDebug && (
          <Button onClick={onDebug} variant="ghost" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Show Debug Info
          </Button>
        )}
      </div>

      {/* Error Recovery Guide */}
      <ErrorRecoveryGuide 
        error={error}
        onRetry={onRetry}
        onReset={onReset}
      />
    </div>
  );
};