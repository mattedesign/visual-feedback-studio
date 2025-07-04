import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';
import { useAnalysisDiagnostics } from '@/hooks/analysis/useAnalysisDiagnostics';

interface DiagnosticDebugModeProps {
  images: string[];
  analysisPrompt: string;
  analysisId?: string;
  onDiagnosticsComplete?: (canProceed: boolean) => void;
}

export const DiagnosticDebugMode: React.FC<DiagnosticDebugModeProps> = ({
  images,
  analysisPrompt,
  analysisId,
  onDiagnosticsComplete
}) => {
  const { 
    diagnosticReport, 
    isRunningDiagnostics, 
    runClientDiagnostics, 
    testClaudeConnection,
    clearDiagnostics 
  } = useAnalysisDiagnostics();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedChecks, setExpandedChecks] = useState<Set<string>>(new Set());

  const handleRunDiagnostics = async () => {
    const report = await runClientDiagnostics(images, analysisPrompt, analysisId);
    onDiagnosticsComplete?.(report.canProceed);
  };

  const toggleCheckExpansion = (checkName: string) => {
    const newExpanded = new Set(expandedChecks);
    if (newExpanded.has(checkName)) {
      newExpanded.delete(checkName);
    } else {
      newExpanded.add(checkName);
    }
    setExpandedChecks(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAIL':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'CHECKING':
        return <Activity className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'PASS' ? 'default' : 
                   status === 'FAIL' ? 'destructive' : 'secondary';
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Analysis Diagnostics
          {diagnosticReport && (
            <Badge variant={diagnosticReport.canProceed ? "default" : "destructive"}>
              {diagnosticReport.overallStatus}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleRunDiagnostics}
            disabled={isRunningDiagnostics}
            variant="outline"
          >
            {isRunningDiagnostics ? 'Running Diagnostics...' : 'Run Full Diagnostics'}
          </Button>
          
          <Button 
            onClick={testClaudeConnection}
            variant="outline"
          >
            Test Claude API
          </Button>
          
          {diagnosticReport && (
            <Button 
              onClick={clearDiagnostics}
              variant="ghost"
            >
              Clear Results
            </Button>
          )}
        </div>

        {/* Diagnostic Report */}
        {diagnosticReport && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Diagnostic Summary</h3>
                <span className="text-sm text-muted-foreground">
                  {diagnosticReport.timestamp}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{diagnosticReport.checks.filter(c => c.status === 'PASS').length} Passed</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>{diagnosticReport.checks.filter(c => c.status === 'WARNING').length} Warnings</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span>{diagnosticReport.checks.filter(c => c.status === 'FAIL').length} Failed</span>
                </div>
              </div>

              <div className="mt-3 p-2 rounded bg-muted">
                <strong>Status:</strong> {diagnosticReport.canProceed ? 
                  '✅ Analysis can proceed' : 
                  '❌ Analysis blocked - fix critical issues first'
                }
              </div>
            </div>

            {/* Detailed Results */}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between">
                  <span>Detailed Results ({diagnosticReport.checks.length} checks)</span>
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-2">
                {diagnosticReport.checks.map((check, index) => (
                  <Card key={index} className="p-3">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleCheckExpansion(check.name)}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(check.status)}
                        <span className="font-medium">{check.name}</span>
                        {getStatusBadge(check.status)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground truncate max-w-64">
                          {check.message}
                        </span>
                        {expandedChecks.has(check.name) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </div>
                    </div>
                    
                    {expandedChecks.has(check.name) && check.details && (
                      <div className="mt-3 p-3 bg-muted rounded text-sm">
                        <div className="mb-2">
                          <strong>Message:</strong> {check.message}
                        </div>
                        <div>
                          <strong>Details:</strong>
                          <pre className="mt-1 text-xs overflow-auto">
                            {JSON.stringify(check.details, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
        
        {/* Help Text */}
        <div className="text-sm text-muted-foreground p-3 bg-muted rounded">
          <strong>💡 Tip:</strong> Run diagnostics before starting analysis to identify potential issues early. 
          This helps prevent analysis failures and provides detailed debugging information.
        </div>
      </CardContent>
    </Card>
  );
};