
import React from 'react';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { StatCard } from '@/components/ui/stat-card';
import { BarChart3, Users, Zap, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';

export function MetricsOverview() {
  const { subscription } = useSubscription();

  const metrics = [
    {
      title: "Total Analyses",
      value: subscription?.analysesUsed || 0,
      description: "Completed this month",
      icon: <BarChart3 className="w-4 h-4" />,
      trend: { value: 12, isPositive: true },
      variant: 'metric' as const
    },
    {
      title: "Credits Remaining",
      value: subscription ? subscription.analysesLimit - subscription.analysesUsed : 0,
      description: `of ${subscription?.analysesLimit || 0} total`,
      icon: <Zap className="w-4 h-4" />,
      variant: 'feature' as const
    },
    {
      title: "Average Score",
      value: "8.4/10",
      description: "Design quality rating",
      icon: <TrendingUp className="w-4 h-4" />,
      trend: { value: 5, isPositive: true },
      variant: 'metric' as const
    },
    {
      title: "Time Saved",
      value: "24hrs",
      description: "vs manual analysis",
      icon: <Clock className="w-4 h-4" />,
      variant: 'feature' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics Overview</h2>
          <p className="text-muted-foreground">Track your UX analysis performance</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <DashboardCard
            key={index}
            title={metric.title}
            value={metric.value}
            description={metric.description}
            icon={metric.icon}
            trend={metric.trend}
            variant={metric.variant}
          />
        ))}
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Issues Identified"
          value="247"
          change={{ value: 8, isPositive: true }}
          icon={<CheckCircle className="w-6 h-6" />}
        />
        <StatCard
          label="Recommendations"
          value="89"
          change={{ value: 15, isPositive: true }}
          icon={<Users className="w-6 h-6" />}
        />
        <StatCard
          label="Implementation Rate"
          value="73%"
          change={{ value: 3, isPositive: true }}
          icon={<TrendingUp className="w-6 h-6" />}
        />
      </div>
    </div>
  );
}
