
import { User } from '@supabase/supabase-js';
import { TopNavigation } from './TopNavigation';

interface HeaderProps {
  user?: User;
  onSignOut?: () => void;
}

export const Header = ({ user, onSignOut }: HeaderProps) => {
  return <TopNavigation user={user} onSignOut={onSignOut} />;
};
