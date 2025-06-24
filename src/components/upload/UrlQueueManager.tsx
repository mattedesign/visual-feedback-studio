
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  Plus, 
  X, 
  Trash2, 
  Play, 
  RotateCcw,
  CheckCircle, 
  AlertCircle, 
  Clock,
  Loader2
} from 'lucide-react';
import { useMultiUrlUpload, UrlUploadItem } from '@/hooks/useMultiUrlUpload';

interface UrlQueueManagerProps {
  onImageUpload: (imageUrl: string) => void;
}

export const UrlQueueManager = ({ onImageUpload }: UrlQueueManagerProps) => {
  const [currentUrl, setCurrentUrl] = useState('');
  
  const {
    urlItems,
    isProcessing,
    processingProgress,
    addUrl,
    removeUrl,
    clearAllUrls,
    processUrls,
    retryFailedUrls,
    getStatusCounts,
  } = useMultiUrlUpload(onImageUpload);

  const handleAddUrl = () => {
    if (currentUrl.trim()) {
      addUrl(currentUrl.trim());
      setCurrentUrl('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddUrl();
    }
  };

  const statusCounts = getStatusCounts();
  const progressPercentage = processingProgress.total > 0 
    ? (processingProgress.current / processingProgress.total) * 100 
    : 0;

  const getStatusIcon = (status: UrlUploadItem['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-slate-400" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadgeVariant = (status: UrlUploadItem['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'completed':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <Globe className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h3 className="text-xl font-semibold mb-2">Multi-Website Analysis</h3>
            <p className="text-slate-200 text-sm">
              Add multiple website URLs to capture and analyze together
            </p>
          </div>

          {/* URL Input */}
          <div className="flex gap-2">
            <Input
              type="url"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://example.com"
              className="bg-white dark:bg-slate-200 border-slate-300 dark:border-slate-400 text-slate-900 placeholder:text-slate-600 flex-1"
              disabled={isProcessing}
            />
            <Button
              onClick={handleAddUrl}
              disabled={!currentUrl.trim() || isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Status Summary */}
          {urlItems.length > 0 && (
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="text-slate-300">Queue:</span>
              {statusCounts.pending > 0 && (
                <Badge variant="secondary">{statusCounts.pending} pending</Badge>
              )}
              {statusCounts.processing > 0 && (
                <Badge variant="default">{statusCounts.processing} processing</Badge>
              )}
              {statusCounts.completed > 0 && (
                <Badge variant="default" className="bg-green-600">{statusCounts.completed} completed</Badge>
              )}
              {statusCounts.error > 0 && (
                <Badge variant="destructive">{statusCounts.error} failed</Badge>
              )}
            </div>
          )}

          {/* Processing Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-300">
                <span>Processing URLs...</span>
                <span>{processingProgress.current} / {processingProgress.total}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {/* URL Queue */}
          {urlItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-slate-200">URL Queue ({urlItems.length})</h4>
                <div className="flex gap-2">
                  {statusCounts.error > 0 && (
                    <Button
                      onClick={retryFailedUrls}
                      disabled={isProcessing}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Retry Failed
                    </Button>
                  )}
                  <Button
                    onClick={clearAllUrls}
                    disabled={isProcessing}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2">
                {urlItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600"
                  >
                    {getStatusIcon(item.status)}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 truncate" title={item.url}>
                        {item.url}
                      </p>
                      {item.error && (
                        <p className="text-xs text-red-400 mt-1">{item.error}</p>
                      )}
                    </div>

                    <Badge variant={getStatusBadgeVariant(item.status)} className="text-xs">
                      {item.status}
                    </Badge>

                    <Button
                      onClick={() => removeUrl(item.id)}
                      disabled={isProcessing && item.status === 'processing'}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-400">
              {urlItems.length === 0 
                ? "Add URLs above to get started" 
                : `${urlItems.length} URL${urlItems.length !== 1 ? 's' : ''} in queue`
              }
            </div>
            
            <Button
              onClick={processUrls}
              disabled={urlItems.length === 0 || isProcessing}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Process Queue
                </>
              )}
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-200 mb-2">How it works:</h4>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• Add multiple website URLs to the queue</li>
              <li>• Click "Process Queue" to capture all screenshots</li>
              <li>• Each successful capture will be added to your analysis</li>
              <li>• Failed URLs can be retried individually or in batch</li>
              <li>• Processing happens sequentially to avoid rate limits</li>
            </ul>
          </div>

          {urlItems.length > 0 && statusCounts.completed > 0 && (
            <Alert className="border-green-500/50 text-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {statusCounts.completed} screenshot{statusCounts.completed !== 1 ? 's' : ''} captured and ready for analysis!
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
