import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAnalysisCancellation = () => {
  const [cancelling, setCancelling] = useState(false);
  const { toast } = useToast();

  const cancelAnalysis = async (analysisId: string) => {
    if (!analysisId) {
      toast({
        title: "Error",
        description: "No analysis ID provided",
        variant: "destructive"
      });
      return false;
    }

    setCancelling(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Call the cancellation function
      const { data, error } = await supabase.rpc('cancel_analysis', {
        analysis_id: analysisId,
        user_id: user.id
      });

      if (error) {
        throw error;
      }

      if (data) {
        toast({
          title: "Analysis Cancelled",
          description: "Your analysis has been successfully cancelled.",
        });
        return true;
      } else {
        toast({
          title: "Unable to Cancel",
          description: "Analysis may have already completed or been cancelled.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Failed to cancel analysis:', error);
      toast({
        title: "Cancellation Failed",
        description: error instanceof Error ? error.message : "Failed to cancel analysis",
        variant: "destructive"
      });
      return false;
    } finally {
      setCancelling(false);
    }
  };

  const resetStuckAnalyses = async () => {
    try {
      const { data, error } = await supabase.rpc('reset_stuck_analyses');
      
      if (error) {
        throw error;
      }

      if (data && data > 0) {
        toast({
          title: "Analyses Reset",
          description: `${data} stuck analyses have been reset.`,
        });
      } else {
        toast({
          title: "No Stuck Analyses",
          description: "No analyses needed to be reset.",
        });
      }
      
      return data || 0;
    } catch (error) {
      console.error('Failed to reset stuck analyses:', error);
      toast({
        title: "Reset Failed",
        description: error instanceof Error ? error.message : "Failed to reset stuck analyses",
        variant: "destructive"
      });
      return 0;
    }
  };

  return {
    cancelAnalysis,
    cancelling,
    resetStuckAnalyses
  };
};