
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';

export const ConnectionStatus = () => {
  const { isConnected, isLoading, error, retryCount, retryConnection } = useConnectionStatus();

  if (isLoading) {
    return (
      <Alert className="mb-4">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <AlertDescription>
          Testing connection to Supabase...
        </AlertDescription>
      </Alert>
    );
  }

  if (isConnected) {
    return (
      <Alert className="mb-4 border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Connected to Supabase successfully
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4" variant="destructive">
      <XCircle className="h-4 w-4" />
      <AlertDescription className="mb-3">
        <div className="space-y-2">
          <p>Connection to Supabase failed</p>
          <p className="text-sm">{error}</p>
          {retryCount > 0 && (
            <p className="text-sm">Retry attempts: {retryCount}</p>
          )}
        </div>
      </AlertDescription>
      <div className="flex flex-col gap-2 mt-3">
        <Button 
          onClick={retryConnection} 
          variant="outline" 
          size="sm"
          className="w-fit"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry Connection
        </Button>
        <div className="text-xs text-muted-foreground">
          <p>Make sure Supabase is running locally:</p>
          <code className="bg-slate-100 px-1 rounded text-xs">supabase start</code>
        </div>
      </div>
    </Alert>
  );
};
