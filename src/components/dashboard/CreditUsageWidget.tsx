import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function CreditUsageWidget() {
  const creditsUsed = 260;
  const creditsTotal = 520;
  const creditsRemaining = creditsTotal - creditsUsed;
  const usagePercentage = (creditsUsed / creditsTotal) * 100;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Credit Usage</CardTitle>
          <Button variant="outline" size="sm">
            Upgrade
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Usage Display */}
        <div className="text-center">
          <div className="text-3xl font-bold text-foreground mb-1">
            {creditsRemaining}
          </div>
          <div className="text-sm text-muted-foreground">remaining</div>
        </div>

        {/* Timeline Point */}
        <div className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            July 7 • 2 credits
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={usagePercentage} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{creditsUsed} used</span>
            <span>of {creditsTotal}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}