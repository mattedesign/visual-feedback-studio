
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const subscriptionService = {
  async checkCanCreateAnalysis(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to create analyses');
        return false;
      }

      const { data, error } = await supabase.rpc('check_analysis_limit', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error checking analysis limit:', error);
        toast.error('Failed to check analysis limit');
        return false;
      }

      if (!data) {
        toast.error('You have reached your analysis limit. Please upgrade your plan.');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in checkCanCreateAnalysis:', error);
      toast.error('Failed to verify analysis limit');
      return false;
    }
  },

  async incrementUsage(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('increment_analysis_usage', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error incrementing analysis usage:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error in incrementUsage:', error);
      return false;
    }
  }
};
