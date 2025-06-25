
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { Crown, Zap, AlertCircle } from 'lucide-react';

export const SubscriptionStatus = () => {
  const { subscription, loading, getRemainingAnalyses, getUsagePercentage } = useSubscription();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) return null;

  const remaining = getRemainingAnalyses();
  const usagePercentage = getUsagePercentage();
  const isNearLimit = usagePercentage >= 80;

  const getPlanIcon = () => {
    switch (subscription.plan_type) {
      case 'yearly':
      case 'monthly':
        return <Crown className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getPlanBadgeVariant = () => {
    switch (subscription.plan_type) {
      case 'yearly':
        return 'default';
      case 'monthly':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className={`${isNearLimit ? 'border-orange-200 bg-orange-50' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            {getPlanIcon()}
            Your Plan
          </span>
          <Badge variant={getPlanBadgeVariant()}>
            {subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Analyses Used</span>
            <span className={`font-medium ${isNearLimit ? 'text-orange-600' : ''}`}>
              {subscription.analyses_used} / {subscription.analyses_limit}
            </span>
          </div>
          
          <Progress 
            value={usagePercentage} 
            className={`h-2 ${isNearLimit ? '[&>div]:bg-orange-500' : ''}`}
          />
          
          {remaining === 0 ? (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>Analysis limit reached</span>
            </div>
          ) : isNearLimit ? (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <AlertCircle className="h-4 w-4" />
              <span>{remaining} analysis{remaining !== 1 ? 'es' : ''} remaining</span>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              {remaining} analysis{remaining !== 1 ? 'es' : ''} remaining this period
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
