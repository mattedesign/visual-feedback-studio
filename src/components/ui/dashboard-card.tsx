
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  variant?: 'default' | 'metric' | 'feature';
}

export function DashboardCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  variant = 'default'
}: DashboardCardProps) {
  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      variant === 'metric' && "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20",
      variant === 'feature' && "bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className={cn(
            "w-4 h-4",
            variant === 'metric' && "text-primary",
            variant === 'feature' && "text-accent",
            variant === 'default' && "text-muted-foreground"
          )}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className={cn(
            "flex items-center text-xs mt-2",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            <span className="mr-1">
              {trend.isPositive ? "↗" : "↘"}
            </span>
            {Math.abs(trend.value)}% from last month
          </div>
        )}
      </CardContent>
    </Card>
  );
}
