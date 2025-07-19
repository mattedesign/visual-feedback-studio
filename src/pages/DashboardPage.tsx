import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TrendsWidget } from '@/components/dashboard/TrendsWidget';
import { BenchmarkWidget } from '@/components/dashboard/BenchmarkWidget';
import { AnalysesCompleteWidget } from '@/components/dashboard/AnalysesCompleteWidget';
import { ActivityCalendar } from '@/components/dashboard/ActivityCalendar';
import { DesignPatternsWidget } from '@/components/dashboard/DesignPatternsWidget';
import { CreditUsageWidget } from '@/components/dashboard/CreditUsageWidget';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
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
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard Analysis</h1>
          <p className="text-muted-foreground">Session in progress</p>
        </div>

        {/* Top Row - Main Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TrendsWidget />
          <BenchmarkWidget />
          <AnalysesCompleteWidget />
        </div>

        {/* Middle Row - Activity Calendar and Design Patterns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityCalendar />
          <DesignPatternsWidget />
        </div>

        {/* Bottom Row - Credit Usage */}
        <div className="max-w-2xl">
          <CreditUsageWidget />
        </div>
      </div>
    </DashboardLayout>
  );
}