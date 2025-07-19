import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/contexts/SubscriptionContext';

export function CreditUsageWidget() {
  const { subscription, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Credit Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-2 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return null;
  }

  const usagePercentage = (subscription.analysesUsed / subscription.analysesLimit) * 100;
  const remaining = subscription.analysesLimit - subscription.analysesUsed;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Analysis Credits</CardTitle>
          {!subscription.subscribed && (
            <Button variant="outline" size="sm">
              Upgrade
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Usage Display */}
        <div className="text-center">
          <div className="text-3xl font-bold text-foreground mb-1">
            {remaining}
          </div>
          <div className="text-sm text-muted-foreground">
            {remaining === 1 ? 'analysis remaining' : 'analyses remaining'}
          </div>
        </div>

        {/* Plan Info */}
        <div className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} Plan
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={usagePercentage} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{subscription.analysesUsed} used</span>
            <span>of {subscription.analysesLimit}</span>
          </div>
        </div>

        {/* Low credit warning */}
        {remaining <= 1 && !subscription.subscribed && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
            <p className="text-sm text-orange-800 mb-2">
              Running low on analyses!
            </p>
            <Button size="sm" className="w-full">
              Upgrade Now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}