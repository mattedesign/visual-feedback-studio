
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface PopulationSummaryProps {
  actualEntries: number;
  projectedEntries: number;
  completedBatches: number;
  totalBatches: number;
}

export const PopulationSummary = ({ 
  actualEntries, 
  projectedEntries, 
  completedBatches, 
  totalBatches 
}: PopulationSummaryProps) => {
  const discrepancy = projectedEntries - actualEntries;
  const completionPercentage = Math.round((completedBatches / totalBatches) * 100);
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          Knowledge Base Status Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Actual Entries</p>
            <p className="text-2xl font-bold text-blue-600">{actualEntries}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Full Projection</p>
            <p className="text-2xl font-bold text-gray-600">{projectedEntries}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Batches Done</p>
            <p className="text-2xl font-bold text-green-600">{completedBatches}/{totalBatches}</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Progress</p>
            <p className="text-2xl font-bold text-purple-600">{completionPercentage}%</p>
          </div>
        </div>

        {discrepancy > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Data Discrepancy Resolved:</strong> The difference between actual ({actualEntries}) 
              and projected ({projectedEntries}) entries has been identified. The projected number represents 
              the total if all 9 batches were completed with comprehensive UX knowledge entries. 
              The actual number reflects current database content.
              <div className="mt-2">
                <Badge variant="outline" className="mr-2">
                  Missing: {discrepancy} entries
                </Badge>
                <Badge variant="outline">
                  Completion: {completedBatches}/{totalBatches} batches
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {completedBatches === totalBatches && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-700">
              <strong>Knowledge Base Complete!</strong> All {totalBatches} batches have been 
              successfully populated with comprehensive UX knowledge entries. Your knowledge 
              base now contains {actualEntries} high-quality entries ready for RAG analysis.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
