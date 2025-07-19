import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function DesignPatternsWidget() {
  const patterns = [
    { name: 'Accessibility', value: 15, color: 'bg-slate-600' },
    { name: 'Conversion Metrics', value: 54, color: 'bg-blue-500' },
    { name: 'Performance', value: 50, color: 'bg-green-400' },
    { name: 'Others', value: 12, color: 'bg-gray-800' }
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg mb-1">Design Patterns</CardTitle>
            <p className="text-sm text-muted-foreground">May 7 - May 14</p>
          </div>
          <Select defaultValue="weekly">
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {patterns.map((pattern, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded ${pattern.color}`} />
                <span className="text-sm font-medium">{pattern.name}</span>
              </div>
              <span className="text-sm font-semibold">{pattern.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}