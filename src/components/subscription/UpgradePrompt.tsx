
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Check, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UpgradePromptProps {
  onUpgrade?: () => void;
}

export const UpgradePrompt = ({ onUpgrade }: UpgradePromptProps) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/subscription');
    }
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crown className="h-5 w-5 text-purple-600" />
          Upgrade Your Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700">
          You've reached your analysis limit. Upgrade to continue analyzing your designs with unlimited access.
        </p>
        
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-blue-500" />
              Pro Plan - $19.99/month
            </h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-500" />
                Unlimited design analyses
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-500" />
                Advanced AI insights
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-500" />
                Priority support
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-purple-500" />
              Enterprise - $199/year
            </h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-500" />
                Everything in Pro
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-500" />
                Save 31% annually
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-500" />
                Team collaboration features
              </li>
            </ul>
          </div>
        </div>
        
        <Button 
          onClick={handleUpgrade}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          Upgrade Now
        </Button>
        
        <p className="text-xs text-gray-500 text-center">
          30-day money-back guarantee • Cancel anytime
        </p>
      </CardContent>
    </Card>
  );
};
