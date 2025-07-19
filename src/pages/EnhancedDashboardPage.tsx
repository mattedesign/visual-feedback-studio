
import React from 'react';
import { EnhancedDashboardLayout } from '@/components/dashboard/EnhancedDashboardLayout';
import { MetricsOverview } from '@/components/dashboard/MetricsOverview';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { CreditUsageWidget } from '@/components/dashboard/CreditUsageWidget';
import { useAuth } from '@/hooks/useAuth';

export default function EnhancedDashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-muted-foreground">You need to be authenticated to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <EnhancedDashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-muted-foreground text-lg">
              Here's what's happening with your UX analyses today.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <MetricsOverview />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
      </div>

      {/* Credit Usage */}
      <div className="max-w-2xl">
        <CreditUsageWidget />
      </div>
    </EnhancedDashboardLayout>
  );
}
