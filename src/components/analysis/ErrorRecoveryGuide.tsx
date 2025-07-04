import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, ExternalLink, HelpCircle } from 'lucide-react';

interface ErrorRecoveryGuideProps {
  error: Error | string;
  onRetry?: () => void;
  onReset?: () => void;
}

export const ErrorRecoveryGuide: React.FC<ErrorRecoveryGuideProps> = ({
  error,
  onRetry,
  onReset
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Categorize the error and provide specific guidance
  const getErrorCategory = (errorMsg: string) => {
    if (errorMsg.includes('API key') || errorMsg.includes('authentication') || errorMsg.includes('401')) {
      return {
        category: 'Authentication',
        severity: 'critical',
        description: 'Claude API authentication failed',
        solutions: [
          'Verify your Claude API key is correctly configured in Supabase secrets',
          'Check if your API key has expired or been revoked',
          'Regenerate a new API key from console.anthropic.com',
          'Ensure the API key has the required permissions'
        ],
        quickFix: 'Test your Claude API connection using the diagnostic tool'
      };
    }
    
    if (errorMsg.includes('image') || errorMsg.includes('base64') || errorMsg.includes('URL')) {
      return {
        category: 'Image Processing',
        severity: 'medium',
        description: 'Image data validation or processing failed',
        solutions: [
          'Check that all images are in supported formats (PNG, JPEG, WebP)',
          'Verify image URLs are accessible and not expired',
          'Ensure base64 images are properly formatted',
          'Try reducing the number of images (max 10 recommended)'
        ],
        quickFix: 'Run diagnostics to check image validity'
      };
    }
    
    if (errorMsg.includes('prompt') || errorMsg.includes('validation')) {
      return {
        category: 'Input Validation',
        severity: 'low',
        description: 'Analysis prompt or request validation failed',
        solutions: [
          'Ensure your analysis prompt is between 10-2000 characters',
          'Check that you have provided at least one image',
          'Verify all required fields are filled out',
          'Try simplifying your analysis prompt'
        ],
        quickFix: 'Review your inputs and try again'
      };
    }
    
    if (errorMsg.includes('subscription') || errorMsg.includes('limit')) {
      return {
        category: 'Subscription',
        severity: 'medium',
        description: 'Subscription or usage limit issue',
        solutions: [
          'Check if you have reached your analysis limit',
          'Verify your subscription is active',
          'Consider upgrading your plan for more analyses',
          'Contact support if you believe this is an error'
        ],
        quickFix: 'Visit your subscription page to check status'
      };
    }
    
    if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('timeout')) {
      return {
        category: 'Network',
        severity: 'medium',
        description: 'Network or connectivity issue',
        solutions: [
          'Check your internet connection',
          'Try again in a few moments',
          'Verify Supabase services are operational',
          'Consider reducing image sizes if they are very large'
        ],
        quickFix: 'Retry the analysis after checking your connection'
      };
    }
    
    return {
      category: 'Unknown',
      severity: 'medium',
      description: 'An unexpected error occurred',
      solutions: [
        'Try running the analysis again',
        'Check the diagnostic tool for more information',
        'Verify all your inputs are correct',
        'Contact support if the issue persists'
      ],
      quickFix: 'Run full diagnostics to identify the issue'
    };
  };
  
  const errorInfo = getErrorCategory(errorMessage);
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Card className="w-full border-red-200 bg-red-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          Analysis Failed
          <Badge variant={getSeverityColor(errorInfo.severity)}>
            {errorInfo.category}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error Description */}
        <div className="p-3 bg-red-100 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>{errorInfo.description}:</strong> {errorMessage}
          </p>
        </div>

        {/* Quick Fix */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <HelpCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Quick Fix</p>
              <p className="text-sm text-blue-700">{errorInfo.quickFix}</p>
            </div>
          </div>
        </div>

        {/* Solutions */}
        <div>
          <h4 className="font-medium mb-2">Possible Solutions:</h4>
          <ul className="space-y-1">
            {errorInfo.solutions.map((solution, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{solution}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          
          {onReset && (
            <Button onClick={onReset} variant="ghost" size="sm">
              Start Over
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.open('https://docs.lovable.dev/tips-tricks/troubleshooting', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Troubleshooting Guide
          </Button>
        </div>

        {/* Debug Info */}
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer">Show technical details</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
            {JSON.stringify({
              error: errorMessage,
              category: errorInfo.category,
              severity: errorInfo.severity,
              timestamp: new Date().toISOString()
            }, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
};