
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Home, Crown, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface HeaderProps {
  user: User;
  onSignOut: () => void;
}

export const Header = ({ user, onSignOut }: HeaderProps) => {
  const navigate = useNavigate();
  const { subscription, getRemainingAnalyses } = useSubscription();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleSubscriptionClick = () => {
    navigate('/subscription');
  };

  const getPlanIcon = () => {
    if (!subscription) return <Zap className="w-3 h-3" />;
    
    switch (subscription.plan_type) {
      case 'yearly':
      case 'monthly':
        return <Crown className="w-3 h-3" />;
      default:
        return <Zap className="w-3 h-3" />;
    }
  };

  const getPlanColor = () => {
    if (!subscription) return 'bg-slate-600';
    
    switch (subscription.plan_type) {
      case 'yearly':
        return 'bg-purple-600 hover:bg-purple-700';
      case 'monthly':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-slate-600 hover:bg-slate-700';
    }
  };

  const remaining = getRemainingAnalyses();

  return (
    <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DA</span>
            </div>
            <span className="font-semibold text-white text-lg">DesignAI</span>
          </button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Subscription Status */}
          {subscription && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSubscriptionClick}
              className={`${getPlanColor()} border-0 text-white flex items-center gap-2`}
            >
              {getPlanIcon()}
              <span className="capitalize">{subscription.plan_type}</span>
              <Badge variant="secondary" className="ml-1 bg-white/20 text-white border-0">
                {remaining}
              </Badge>
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-slate-600 text-white text-sm">
                {user.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-slate-300 text-sm">{user.email}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSignOut}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};
