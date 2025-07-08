import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Database, 
  User, 
  Network,
  FileText,
  Download
} from 'lucide-react';

interface InvestigationReportProps {
  sessionId: string;
  persona: string;
  onClose: () => void;
}

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  message: string;
  details?: any;
  duration?: number;
}

export const InvestigationReport: React.FC<InvestigationReportProps> = ({ 
  sessionId, 
  persona, 
  onClose 
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<string>('');
  const { user } = useAuth();

  const updateResult = (name: string, result: Partial<TestResult>) => {
    setResults(prev => {
      const index = prev.findIndex(r => r.name === name);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...result };
        return updated;
      } else {
        return [...prev, { name, status: 'pending', message: '', ...result }];
      }
    });
  };

  // Test 1: Authentication Verification
  const testAuthentication = async () => {
    const startTime = Date.now();
    updateResult('Authentication', { status: 'pending', message: 'Checking authentication status...' });

    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      const duration = Date.now() - startTime;

      if (error) {
        updateResult('Authentication', {
          status: 'fail',
          message: `Authentication failed: ${error.message}`,
          details: { error: error.message, code: error.status },
          duration
        });
        return false;
      }

      if (!authUser) {
        updateResult('Authentication', {
          status: 'fail',
          message: 'No authenticated user found',
          duration
        });
        return false;
      }

      updateResult('Authentication', {
        status: 'pass',
        message: `User authenticated successfully (${authUser.id.substring(0, 8)}...)`,
        details: { userId: authUser.id, email: authUser.email },
        duration
      });
      return true;
    } catch (error) {
      updateResult('Authentication', {
        status: 'fail',
        message: `Authentication error: ${(error as Error).message}`,
        duration: Date.now() - startTime
      });
      return false;
    }
  };

  // Test 2: Database Connectivity
  const testDatabaseConnectivity = async () => {
    const startTime = Date.now();
    updateResult('Database Connectivity', { status: 'pending', message: 'Testing database connection...' });

    try {
      const { data, error } = await supabase
        .from('goblin_refinement_history')
        .select('count', { count: 'exact', head: true });

      const duration = Date.now() - startTime;

      if (error) {
        updateResult('Database Connectivity', {
          status: 'fail',
          message: `Database connection failed: ${error.message}`,
          details: { error: error.message, code: error.code },
          duration
        });
        return false;
      }

      updateResult('Database Connectivity', {
        status: 'pass',
        message: 'Database connection successful',
        details: { recordCount: data },
        duration
      });
      return true;
    } catch (error) {
      updateResult('Database Connectivity', {
        status: 'fail',
        message: `Database error: ${(error as Error).message}`,
        duration: Date.now() - startTime
      });
      return false;
    }
  };

  // Test 3: Session Data Integrity
  const testSessionDataIntegrity = async () => {
    const startTime = Date.now();
    updateResult('Session Data', { status: 'pending', message: 'Checking session data integrity...' });

    try {
      // Check if session exists
      const { data: sessionData, error: sessionError } = await supabase
        .from('goblin_analysis_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        updateResult('Session Data', {
          status: 'fail',
          message: `Session not found: ${sessionError.message}`,
          details: { sessionId, error: sessionError.message },
          duration: Date.now() - startTime
        });
        return false;
      }

      // Check message count
      const { data: messageData, error: messageError } = await supabase
        .from('goblin_refinement_history')
        .select('*')
        .eq('session_id', sessionId)
        .order('message_order', { ascending: true });

      const duration = Date.now() - startTime;

      if (messageError) {
        updateResult('Session Data', {
          status: 'warning',
          message: `Session exists but message retrieval failed: ${messageError.message}`,
          details: { session: sessionData, error: messageError.message },
          duration
        });
        return false;
      }

      // Validate message ordering
      const orderingIssues = [];
      for (let i = 0; i < messageData.length; i++) {
        const expected = i + 1;
        if (messageData[i].message_order !== expected) {
          orderingIssues.push(`Message ${i}: expected order ${expected}, got ${messageData[i].message_order}`);
        }
      }

      const status = orderingIssues.length > 0 ? 'warning' : 'pass';
      updateResult('Session Data', {
        status,
        message: `Session valid with ${messageData.length} messages${orderingIssues.length > 0 ? ' (ordering issues detected)' : ''}`,
        details: { 
          session: sessionData, 
          messageCount: messageData.length,
          orderingIssues
        },
        duration
      });
      return true;
    } catch (error) {
      updateResult('Session Data', {
        status: 'fail',
        message: `Session check error: ${(error as Error).message}`,
        duration: Date.now() - startTime
      });
      return false;
    }
  };

  // Test 4: Edge Function Connectivity
  const testEdgeFunctionConnectivity = async () => {
    const startTime = Date.now();
    updateResult('Edge Function', { status: 'pending', message: 'Testing edge function connectivity...' });

    try {
      const { data, error } = await supabase.functions.invoke('goblin-model-claude-analyzer', {
        body: {
          sessionId: sessionId,
          saveInitialOnly: true,
          initialContent: `Debug connectivity test at ${new Date().toISOString()}`,
          persona: persona
        }
      });

      const duration = Date.now() - startTime;

      if (error) {
        updateResult('Edge Function', {
          status: 'fail',
          message: `Edge function error: ${error.message}`,
          details: { error: error.message, context: error.context },
          duration
        });
        return false;
      }

      updateResult('Edge Function', {
        status: 'pass',
        message: 'Edge function responding correctly',
        details: { response: data },
        duration
      });
      return true;
    } catch (error) {
      updateResult('Edge Function', {
        status: 'fail',
        message: `Edge function connectivity error: ${(error as Error).message}`,
        duration: Date.now() - startTime
      });
      return false;
    }
  };

  // Test 5: Message Persistence Flow
  const testMessagePersistenceFlow = async () => {
    const startTime = Date.now();
    updateResult('Message Persistence', { status: 'pending', message: 'Testing message persistence flow...' });

    try {
      // Get current message count
      const { data: beforeData } = await supabase
        .from('goblin_refinement_history')
        .select('count', { count: 'exact', head: true })
        .eq('session_id', sessionId);

      const beforeCount = Number(beforeData) || 0;

      // Send a test message
      const testMessage = `Debug persistence test: ${Date.now()}`;
      const { data, error } = await supabase.functions.invoke('goblin-model-claude-analyzer', {
        body: {
          sessionId: sessionId,
          chatMode: true,
          prompt: testMessage,
          persona: persona,
          conversationHistory: '',
          originalAnalysis: { test: true }
        }
      });

      if (error) {
        updateResult('Message Persistence', {
          status: 'fail',
          message: `Failed to send test message: ${error.message}`,
          details: { error: error.message },
          duration: Date.now() - startTime
        });
        return false;
      }

      // Wait for persistence
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if message count increased
      const { data: afterData } = await supabase
        .from('goblin_refinement_history')
        .select('count', { count: 'exact', head: true })
        .eq('session_id', sessionId);

      const afterCount = Number(afterData) || 0;
      const duration = Date.now() - startTime;

      if (afterCount > beforeCount) {
        updateResult('Message Persistence', {
          status: 'pass',
          message: `Message persistence working (${afterCount - beforeCount} new messages)`,
          details: { beforeCount, afterCount, response: data },
          duration
        });
        return true;
      } else {
        updateResult('Message Persistence', {
          status: 'fail',
          message: 'Messages not persisting to database',
          details: { beforeCount, afterCount, response: data },
          duration
        });
        return false;
      }
    } catch (error) {
      updateResult('Message Persistence', {
        status: 'fail',
        message: `Persistence test error: ${(error as Error).message}`,
        duration: Date.now() - startTime
      });
      return false;
    }
  };

  // Run full investigation
  const runInvestigation = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);
    setSummary('');

    const tests = [
      { name: 'Authentication', test: testAuthentication },
      { name: 'Database Connectivity', test: testDatabaseConnectivity },
      { name: 'Session Data', test: testSessionDataIntegrity },
      { name: 'Edge Function', test: testEdgeFunctionConnectivity },
      { name: 'Message Persistence', test: testMessagePersistenceFlow }
    ];

    for (let i = 0; i < tests.length; i++) {
      try {
        await tests[i].test();
      } catch (error) {
        updateResult(tests[i].name, {
          status: 'fail',
          message: `Test failed: ${(error as Error).message}`
        });
      }
      setProgress(((i + 1) / tests.length) * 100);
    }

    // Generate summary
    generateSummary();
    setIsRunning(false);
  };

  const generateSummary = () => {
    const passCount = results.filter(r => r.status === 'pass').length;
    const failCount = results.filter(r => r.status === 'fail').length;
    const warningCount = results.filter(r => r.status === 'warning').length;

    let summary = `Investigation completed for session ${sessionId.substring(0, 8)}...\n\n`;
    summary += `Results: ${passCount} passed, ${failCount} failed, ${warningCount} warnings\n\n`;

    if (failCount === 0 && warningCount === 0) {
      summary += '✅ All tests passed! Chat persistence should be working correctly.';
    } else if (failCount > 0) {
      summary += '❌ Critical issues detected that may prevent chat persistence:\n';
      results.filter(r => r.status === 'fail').forEach(r => {
        summary += `- ${r.name}: ${r.message}\n`;
      });
    } else {
      summary += '⚠️ Some warnings detected, but basic functionality should work:\n';
      results.filter(r => r.status === 'warning').forEach(r => {
        summary += `- ${r.name}: ${r.message}\n`;
      });
    }

    setSummary(summary);
  };

  const exportReport = () => {
    const report = {
      sessionId,
      persona,
      timestamp: new Date().toISOString(),
      userId: user?.id,
      summary,
      results,
      testDurations: results.reduce((acc, r) => {
        if (r.duration) acc[r.name] = r.duration;
        return acc;
      }, {} as Record<string, number>)
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goblin-investigation-${sessionId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Investigation report exported!');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const colors = {
      pass: 'bg-green-100 text-green-800',
      fail: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800'
    };
    return <Badge className={colors[status]}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto m-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Chat Persistence Investigation Report
            </CardTitle>
            <Button onClick={onClose} variant="ghost" size="sm">
              ×
            </Button>
          </div>
          
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span>Session: {sessionId.substring(0, 8)}...</span>
            <span>•</span>
            <span>Persona: {persona}</span>
            <span>•</span>
            <span>User: {user?.id?.substring(0, 8)}...</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Control Section */}
          <div className="flex gap-2">
            <Button 
              onClick={runInvestigation} 
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? 'Running Investigation...' : 'Run Full Investigation'}
            </Button>
            <Button 
              onClick={exportReport} 
              variant="outline"
              disabled={results.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Progress */}
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Investigation Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Results</h3>
              <div className="space-y-3">
                {results.map((result) => (
                  <div key={result.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <h4 className="font-medium">{result.name}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.duration && (
                          <span className="text-xs text-muted-foreground">
                            {result.duration}ms
                          </span>
                        )}
                        {getStatusBadge(result.status)}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
                    
                    {result.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground">Details</summary>
                        <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {summary && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Summary</h3>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{summary}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};