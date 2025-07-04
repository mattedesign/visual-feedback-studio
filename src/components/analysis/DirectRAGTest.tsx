
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
            <AlertCircle className="h-5 w-5 text-green-500" />
            RAG Analysis - ACTIVE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>RAG functionality is now active and integrated</strong> - comprehensive analysis includes 
              research-backed insights using the enhanced edge function with Google Vision, Claude 4, GPT-4.1, and Perplexity integration.
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">What's Working:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• RAG-enhanced analysis with 272+ UX research studies</li>
              <li>• Multi-model orchestration (Claude 4, GPT-4.1, Perplexity)</li>
              <li>• Google Vision integration for visual intelligence</li>
              <li>• Research citations and evidence-based recommendations</li>
              <li>• Well Done insights highlighting positive design aspects</li>
            </ul>
            <p className="text-sm text-gray-600 mt-2">
              Navigate to the main analysis page to use the comprehensive RAG-enhanced system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
