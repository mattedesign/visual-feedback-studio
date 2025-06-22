
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface HeaderProps {
  user: User;
  onSignOut: () => void;
}

export const Header = ({ user, onSignOut }: HeaderProps) => {
  return (
    <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">DA</span>
          </div>
          <span className="font-semibold text-white text-lg">DesignAI</span>
        </div>
        
        <div className="flex items-center gap-4">
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
