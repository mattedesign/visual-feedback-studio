
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const DirectRAGTestSimple = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Direct RAG Test - DISABLED
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Direct RAG testing has been disabled</strong> - the direct RAG analysis service has been removed
              to reduce confusion and clean up the codebase.
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Working Analysis System:</h3>
            <p className="text-sm text-gray-600 mb-2">
              The main analysis workflow already includes RAG enhancement and shows research citations like:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>"Nielsen Norman Group, 2023"</li>
              <li>"WCAG 2.1"</li>
              <li>Other research-backed recommendations</li>
            </ul>
            <p className="text-sm text-gray-600 mt-2">
              Navigate to the main analysis page to use the working system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
