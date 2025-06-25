
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// RAG INTEGRATION EXAMPLE COMPLETELY DISABLED
export const RAGIntegrationExample: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            RAG Integration Demo - DISABLED
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>RAG integration has been completely disabled</strong> to resolve infinite loop issues.
              This demonstration is no longer available.
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Status:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• RAG context building: <span className="text-red-600 font-medium">DISABLED</span></li>
              <li>• Research enhancement: <span className="text-red-600 font-medium">DISABLED</span></li>
              <li>• Edge function calls: <span className="text-red-600 font-medium">BLOCKED</span></li>
              <li>• Standard analysis: <span className="text-green-600 font-medium">ACTIVE</span></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
