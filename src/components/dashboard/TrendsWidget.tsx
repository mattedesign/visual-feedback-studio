import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export function TrendsWidget() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Trends</CardTitle>
            <p className="text-sm text-muted-foreground">2 new insights found</p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}