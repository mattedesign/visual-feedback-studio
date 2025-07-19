
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, change, icon, className }: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
            {change && (
              <div className={cn(
                "flex items-center text-sm mt-2",
                change.isPositive ? "text-green-600" : "text-red-600"
              )}>
                <span className="mr-1">
                  {change.isPositive ? "↗" : "↘"}
                </span>
                {Math.abs(change.value)}%
              </div>
            )}
          </div>
          {icon && (
            <div className="w-8 h-8 text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
