import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Crown, Calendar, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

interface UsageLimitPromptProps {
  className?: string;
}

export const UsageLimitPrompt = ({ className = '' }: UsageLimitPromptProps) => {
  const { 
    subscription, 
    loading, 
    getRemainingAnalyses, 
    getUsagePercentage,
    needsSubscription,
    isTrialUser,
    isActiveSubscriber 
  } = useSubscription();
  const navigate = useNavigate();

  if (loading || !subscription) return null;

  const remaining = getRemainingAnalyses();
  const usagePercentage = getUsagePercentage();
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = remaining === 0;

  // Don't show if user has plenty of analyses remaining and is not a trial user near limit
  if (!isAtLimit && !isNearLimit && !needsSubscription()) return null;

  const handleUpgrade = () => {
    navigate('/subscription');
  };

  const getNextResetDate = () => {
    if (subscription.current_period_end) {
      return new Date(subscription.current_period_end).toLocaleDateString();
    }
    // For trial users, reset is typically monthly (approximate)
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toLocaleDateString();
  };

  // Trial user at limit
  if (isTrialUser() && isAtLimit) {
    return (
      <Card className={`border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-5 w-5" />
            Trial Limit Reached
            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
              {subscription.analyses_used}/{subscription.analyses_limit} Used
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-orange-700">
            You've used all <strong>{subscription.analyses_limit} free analyses</strong> in your trial. 
            Upgrade to continue getting professional UX insights!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleUpgrade} className="bg-orange-600 hover:bg-orange-700 text-white">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="border-orange-300 text-orange-700">
              View Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Trial user near limit
  if (isTrialUser() && isNearLimit) {
    return (
      <Card className={`border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            Trial Ending Soon
            <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
              {remaining} Left
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-yellow-700">
            You have <strong>{remaining} analysis{remaining !== 1 ? 'es' : ''}</strong> remaining in your trial.
            Upgrade now to avoid interruption!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleUpgrade} className="bg-yellow-600 hover:bg-yellow-700 text-white">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Before Limit
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="border-yellow-300 text-yellow-700">
              Continue Trial
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Paid subscriber at limit
  if (isActiveSubscriber() && isAtLimit) {
    return (
      <Card className={`border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Calendar className="h-5 w-5" />
            Monthly Limit Reached
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
              {subscription.analyses_used}/{subscription.analyses_limit} Used
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-blue-700">
            You've used all <strong>{subscription.analyses_limit} analyses</strong> for this billing period.
            Your limit resets on <strong>{getNextResetDate()}</strong>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleUpgrade} variant="outline" className="border-blue-300 text-blue-700">
              <ArrowRight className="h-4 w-4 mr-2" />
              View Upgrade Options
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="border-blue-300 text-blue-700">
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};