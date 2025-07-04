import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface AnalysisValidatorProps {
  images: string[];
  analysisContext: string;
  analysisId?: string;
}

export const AnalysisValidator: React.FC<AnalysisValidatorProps> = ({
  images,
  analysisContext,
  analysisId
}) => {
  // Validation checks
  const checks = [
    {
      name: 'Images',
      status: images.length === 0 ? 'error' : images.length > 5 ? 'warning' : 'success',
      message: images.length === 0 
        ? 'No images selected' 
        : images.length > 5 
          ? `${images.length} images (recommended: ≤ 5)`
          : `${images.length} image${images.length !== 1 ? 's' : ''} ready`
    },
    {
      name: 'Context',
      status: analysisContext.trim().length < 10 ? 'error' : 
              analysisContext.length > 2000 ? 'warning' : 'success',
      message: analysisContext.trim().length < 10
        ? `Too short: ${analysisContext.trim().length} chars (min: 10)`
        : analysisContext.length > 2000
          ? `Very long: ${analysisContext.length} chars (max: 2000)`
          : `${analysisContext.length} characters`
    },
    {
      name: 'Analysis ID',
      status: !analysisId ? 'error' : 'success',
      message: !analysisId ? 'Missing analysis ID' : 'Analysis ID present'
    }
  ];

  const hasErrors = checks.some(check => check.status === 'error');
  const hasWarnings = checks.some(check => check.status === 'warning');

  const getIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-3">
      {hasErrors && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Analysis cannot proceed. Please fix the issues below.
          </AlertDescription>
        </Alert>
      )}

      {!hasErrors && hasWarnings && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Analysis ready but some warnings detected.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-2">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              {getIcon(check.status)}
              <span className="font-medium">{check.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{check.message}</span>
              <Badge variant={getBadgeVariant(check.status)}>
                {check.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {!hasErrors && !hasWarnings && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✅ All checks passed. Ready for analysis!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};