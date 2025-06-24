
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export const ConnectionDiagnostics = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostics = async () => {
    setTesting(true);
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      environment: {},
      connectivity: {},
      auth: {},
      database: {}
    };

    try {
      // Environment checks
      diagnostics.environment = {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321",
        hasAnonKey: !!(import.meta.env.VITE_SUPABASE_ANON_KEY),
        isLocal: (import.meta.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321").includes('127.0.0.1'),
        networkOnline: navigator.onLine,
        userAgent: navigator.userAgent
      };

      // Basic connectivity test
      try {
        const response = await fetch(diagnostics.environment.supabaseUrl + '/rest/v1/', {
          method: 'HEAD',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || "",
          }
        });
        
        diagnostics.connectivity = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        };
      } catch (err) {
        diagnostics.connectivity = {
          error: err instanceof Error ? err.message : 'Unknown error',
          type: 'fetch_failed'
        };
      }

      // Auth service test
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        diagnostics.auth = {
          hasSession: !!session,
          sessionExpiry: session?.expires_at,
          error: error?.message,
          userId: session?.user?.id
        };
      } catch (err) {
        diagnostics.auth = {
          error: err instanceof Error ? err.message : 'Auth test failed'
        };
      }

      // Database connectivity test
      try {
        const { data, error, count } = await supabase
          .from('analyses')
          .select('id', { count: 'exact' })
          .limit(1);
        
        diagnostics.database = {
          connected: !error,
          error: error?.message,
          recordCount: count,
          sampleData: data
        };
      } catch (err) {
        diagnostics.database = {
          error: err instanceof Error ? err.message : 'Database test failed'
        };
      }

      setResults(diagnostics);
    } catch (err) {
      setResults({
        error: 'Diagnostics failed',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (success: boolean | undefined) => {
    if (success === undefined) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return success 
      ? <CheckCircle className="h-4 w-4 text-green-500" />
      : <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <Card className="w-full max-w-2xl bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Connection Diagnostics</CardTitle>
        <CardDescription className="text-slate-400">
          Test your Supabase connection and configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            'Run Diagnostics'
          )}
        </Button>

        {results && (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.environment?.networkOnline)}
                    <span>Network Connection: {results.environment?.networkOnline ? 'Online' : 'Offline'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(!results.connectivity?.error)}
                    <span>Supabase Reachable: {results.connectivity?.error ? 'Failed' : 'Success'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(!results.auth?.error)}
                    <span>Auth Service: {results.auth?.error ? 'Failed' : 'Working'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.database?.connected)}
                    <span>Database: {results.database?.connected ? 'Connected' : 'Failed'}</span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="bg-slate-700 rounded p-4">
              <h4 className="text-white font-medium mb-2">Detailed Results:</h4>
              <pre className="text-xs text-slate-300 overflow-auto max-h-96 whitespace-pre-wrap">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
