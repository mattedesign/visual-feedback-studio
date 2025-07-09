import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface ImageLoadingDebugProps {
  images: any[];
  loading: boolean;
  error: string | null;
  retryCount: number;
  accessibilityReport: {
    total: number;
    accessible: number;
    inaccessible: number;
  };
  onRetry: () => void;
}

export const ImageLoadingDebug: React.FC<ImageLoadingDebugProps> = ({
  images,
  loading,
  error,
  retryCount,
  accessibilityReport,
  onRetry
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showImageDetails, setShowImageDetails] = useState(false);

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    if (error) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (accessibilityReport.accessible === accessibilityReport.total && accessibilityReport.total > 0) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (loading) return 'Loading...';
    if (error) return 'Error';
    if (accessibilityReport.total === 0) return 'No images';
    if (accessibilityReport.accessible === accessibilityReport.total) return 'All accessible';
    return 'Some issues';
  };

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                {getStatusIcon()}
                🖼️ Image Loading Debug
                <Badge variant="outline" className="bg-blue-100 text-blue-700">
                  {accessibilityReport.total} images
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={error ? 'destructive' : loading ? 'secondary' : 'default'}>
                  {getStatusText()}
                </Badge>
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Status Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2 rounded border">
                <div className="font-medium text-gray-600">Total</div>
                <div className="text-lg font-bold text-blue-600">{accessibilityReport.total}</div>
              </div>
              <div className="bg-white p-2 rounded border">
                <div className="font-medium text-gray-600">Accessible</div>
                <div className="text-lg font-bold text-green-600">{accessibilityReport.accessible}</div>
              </div>
              <div className="bg-white p-2 rounded border">
                <div className="font-medium text-gray-600">Issues</div>
                <div className="text-lg font-bold text-red-600">{accessibilityReport.inaccessible}</div>
              </div>
              <div className="bg-white p-2 rounded border">
                <div className="font-medium text-gray-600">Retries</div>
                <div className="text-lg font-bold text-orange-600">{retryCount}</div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-800 font-medium text-sm">Load Error</p>
                    <p className="text-red-600 text-xs mt-1">{error}</p>
                  </div>
                  <Button onClick={onRetry} size="sm" variant="outline" className="text-red-600 border-red-200">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="text-blue-700 text-sm font-medium">Loading images...</span>
                </div>
              </div>
            )}

            {/* Image Details Toggle */}
            {images.length > 0 && (
              <div className="space-y-2">
                <Button
                  onClick={() => setShowImageDetails(!showImageDetails)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {showImageDetails ? 'Hide' : 'Show'} Image Details
                </Button>

                {showImageDetails && (
                  <div className="bg-white border rounded p-3 max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {images.map((img, index) => (
                        <div key={img.id || index} className="text-xs border-b pb-2 last:border-b-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">Image {index + 1}</span>
                            <Badge
                              variant={img.accessible === false ? 'destructive' : 'default'}
                              className="text-xs"
                            >
                              {img.accessible === false ? 'Inaccessible' : 'OK'}
                            </Badge>
                          </div>
                          <div className="text-gray-600 space-y-1">
                            <div><strong>File:</strong> {img.fileName || img.file_name || 'Unknown'}</div>
                            <div><strong>URL:</strong> <span className="break-all">{(img.url || img.file_path || '').substring(0, 80)}...</span></div>
                            {img.accessibilityError && (
                              <div className="text-red-600"><strong>Error:</strong> {img.accessibilityError}</div>
                            )}
                            {img.size && (
                              <div><strong>Size:</strong> {Math.round(img.size / 1024)}KB</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Debug Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <Button onClick={onRetry} size="sm" variant="outline" disabled={loading}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Reload Images
              </Button>
              <Button
                onClick={() => console.log('🖼️ Current image state:', { images, accessibilityReport, error, retryCount })}
                size="sm"
                variant="outline"
              >
                Log State
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};