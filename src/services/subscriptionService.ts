
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const subscriptionService = {
  async checkCanCreateAnalysis(): Promise<{ canCreate: boolean; shouldRedirect: boolean }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to create analyses');
        return { canCreate: false, shouldRedirect: false };
      }

      const { data, error } = await supabase.rpc('check_analysis_limit', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error checking analysis limit:', error);
        toast.error('Failed to check analysis limit');
        return { canCreate: false, shouldRedirect: false };
      }

      if (!data) {
        // Check if user is on trial plan and has reached limit
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('plan_type, analyses_used, analyses_limit')
          .eq('user_id', user.id)
          .single();

        if (subscription?.plan_type === 'trial' && subscription.analyses_used >= subscription.analyses_limit) {
          toast.error('You have used all 3 free analyses. Please upgrade to continue.');
          return { canCreate: false, shouldRedirect: true };
        }

        toast.error('You have reached your analysis limit. Please upgrade your plan.');
        return { canCreate: false, shouldRedirect: true };
      }

      return { canCreate: true, shouldRedirect: false };
    } catch (error) {
      console.error('Error in checkCanCreateAnalysis:', error);
      toast.error('Failed to verify analysis limit');
      return { canCreate: false, shouldRedirect: false };
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
