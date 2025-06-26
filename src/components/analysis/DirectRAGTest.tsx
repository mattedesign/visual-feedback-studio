
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Annotation } from '@/types/analysis';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const DirectRAGTest = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
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
              <strong>Direct RAG testing has been disabled</strong> - the direct RAG analysis service has been removed.
              Use the main analysis workflow instead, which includes RAG enhancement via the edge function.
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Alternative:</h3>
            <p className="text-sm text-gray-600">
              The main analysis workflow in the app already includes RAG enhancement through the secure edge function.
              Navigate to the main analysis page to use the working RAG-enhanced analysis system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
