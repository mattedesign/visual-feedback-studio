import { supabase } from '@/integrations/supabase/client';

export const useMessagePersistence = (sessionId: string) => {
  const validateMessagePersistence = async (expectedMessageCount: number, maxRetries: number = 3): Promise<boolean> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔍 Validation attempt ${attempt}/${maxRetries} - expecting ${expectedMessageCount} messages`);
      
      const { data: historyData, error } = await supabase
        .from('goblin_refinement_history')
        .select('id')
        .eq('session_id', sessionId);

      if (!error && historyData && historyData.length >= expectedMessageCount) {
        console.log(`✅ Persistence validated: ${historyData.length} messages found`);
        return true;
      }

      if (attempt < maxRetries) {
        console.log(`⏳ Waiting before retry... (${historyData?.length || 0}/${expectedMessageCount})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    console.warn(`❌ Persistence validation failed after ${maxRetries} attempts`);
    return false;
  };

  return {
    validateMessagePersistence
  };
};