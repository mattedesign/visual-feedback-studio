import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export function BenchmarkWidget() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Benchmark</CardTitle>
            <p className="text-sm text-muted-foreground">See how you compare</p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}