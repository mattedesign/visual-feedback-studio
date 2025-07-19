import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export function AnalysesCompleteWidget() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Analyses Complete</CardTitle>
            <p className="text-sm text-muted-foreground">12 analyses this week</p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}