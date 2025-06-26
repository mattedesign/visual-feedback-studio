
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Home, Sparkles, Zap } from 'lucide-react';
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
        return <Sparkles className="w-3 h-3" />;
      default:
        return <Zap className="w-3 h-3" />;
    }
  };

  const getPlanColor = () => {
    if (!subscription) return 'bg-white/10 hover:bg-white/20';
    
    switch (subscription.plan_type) {
      case 'yearly':
        return 'btn-gradient-primary';
      case 'monthly':
        return 'btn-gradient-orange';
      default:
        return 'bg-white/10 hover:bg-white/20';
    }
  };

  const remaining = getRemainingAnalyses();

  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-md relative z-20">
      <div className="container-modern">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-6">
            <button 
              onClick={handleLogoClick}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-xl">Figmant.AI</span>
                <span className="text-white/60 text-xs">Design Intelligence</span>
              </div>
            </button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-white/80 hover:text-white hover:bg-white/10 border-0"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Subscription Status */}
            {subscription && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSubscriptionClick}
                className={`${getPlanColor()} border-0 text-white flex items-center gap-2 px-4 py-2`}
              >
                {getPlanIcon()}
                <span className="capitalize font-medium">{subscription.plan_type}</span>
                <Badge variant="secondary" className="ml-1 bg-white/20 text-white border-0 px-2">
                  {remaining}
                </Badge>
              </Button>
            )}
            
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                  {user.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-white/90 text-sm font-medium">{user.email}</span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSignOut}
              className="border-white/20 text-white/80 hover:bg-white/10 hover:text-white bg-transparent"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
