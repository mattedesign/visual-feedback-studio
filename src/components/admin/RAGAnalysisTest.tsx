
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// RAG ANALYSIS TEST COMPLETELY DISABLED
export const RAGAnalysisTest: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            RAG Analysis Testing - DISABLED
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>RAG functionality has been completely disabled</strong> to prevent infinite loops 
              and edge function call issues. This testing interface is no longer functional.
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">What happened?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• RAG context building has been disabled</li>
              <li>• Build-rag-context edge function calls blocked</li>
              <li>• All research enhancement features deactivated</li>
              <li>• Standard analysis continues to work normally</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
