import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TrendsWidget } from '@/components/dashboard/TrendsWidget';
import { BenchmarkWidget } from '@/components/dashboard/BenchmarkWidget';
import { AnalysesCompleteWidget } from '@/components/dashboard/AnalysesCompleteWidget';
import { ActivityCalendar } from '@/components/dashboard/ActivityCalendar';
import { DesignPatternsWidget } from '@/components/dashboard/DesignPatternsWidget';
import { CreditUsageWidget } from '@/components/dashboard/CreditUsageWidget';
import { FigmantAnalysisStudio } from '@/components/figmant/FigmantAnalysisStudio';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useState } from 'react';
import { BarChart3, Zap } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [showAnalysisStudio, setShowAnalysisStudio] = useState(false);

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

  if (showAnalysisStudio) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowAnalysisStudio(false)}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
            <FigmantAnalysisStudio 
              onAnalysisComplete={() => {
                // Could navigate to results page
                console.log('Analysis completed');
              }}
            />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Figmant Dashboard</h1>
            <p className="text-muted-foreground">
              AI-powered UX analysis platform
            </p>
          </div>
          <Button 
            onClick={() => setShowAnalysisStudio(true)}
            className="flex items-center gap-2"
            disabled={!subscription?.canAnalyze}
          >
            <Zap className="w-4 h-4" />
            {subscription?.canAnalyze ? 'New Analysis' : 'Upgrade to Analyze'}
          </Button>
        </div>

        {/* Quick Start Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Welcome to Figmant AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Get expert-level UX analysis powered by Claude Sonnet 4 and Google Vision. 
              Upload your designs and receive actionable insights in seconds.
            </p>
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setShowAnalysisStudio(true)}
                disabled={!subscription?.canAnalyze}
              >
                Start Analysis
              </Button>
              {subscription && (
                <span className="text-sm text-muted-foreground">
                  {subscription.analysesLimit - subscription.analysesUsed} analyses remaining
                </span>
              )}
            </div>
          </CardContent>
        </Card>

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