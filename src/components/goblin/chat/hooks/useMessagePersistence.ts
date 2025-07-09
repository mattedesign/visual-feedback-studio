import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useMessagePersistence = (sessionId: string | undefined) => {
  const [persistenceState, setPersistenceState] = useState<{
    lastCheckCount: number;
    isValidating: boolean;
  }>({
    lastCheckCount: 0,
    isValidating: false
  });

  const validateMessagePersistence = async (expectedCount: number, maxRetries = 3): Promise<boolean> => {
    if (!sessionId) return false;

    setPersistenceState(prev => ({ ...prev, isValidating: true }));

    try {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`🔍 Persistence validation attempt ${attempt}/${maxRetries} - expecting ${expectedCount} messages`);
        
        const { data, error } = await supabase
          .from('goblin_refinement_history')
          .select('id, message_order, role, conversation_stage')
          .eq('session_id', sessionId)
          .order('message_order', { ascending: true });

        if (error) {
          console.error(`❌ Persistence validation failed (attempt ${attempt}):`, error);
          if (attempt === maxRetries) {
            setPersistenceState(prev => ({ ...prev, isValidating: false }));
            return false;
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        const actualCount = data?.length || 0;
        console.log(`📊 Persistence check: found ${actualCount} messages, expected ${expectedCount}`);
        console.log('📝 Message details:', data?.map(m => ({ order: m.message_order, role: m.role, stage: m.conversation_stage })));

        if (actualCount >= expectedCount) {
          console.log('✅ Persistence validation successful');
          setPersistenceState(prev => ({ ...prev, lastCheckCount: actualCount, isValidating: false }));
          return true;
        }

        if (attempt < maxRetries) {
          console.log(`⏳ Waiting for persistence... (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
        }
      }

      console.warn('⚠️ Persistence validation failed after all retries');
      setPersistenceState(prev => ({ ...prev, isValidating: false }));
      return false;
    } catch (error) {
      console.error('❌ Persistence validation error:', error);
      setPersistenceState(prev => ({ ...prev, isValidating: false }));
      return false;
    }
  };

  const getMessageCount = async (): Promise<number> => {
    if (!sessionId) return 0;

    try {
      const { data, error } = await supabase
        .from('goblin_refinement_history')
        .select('id')
        .eq('session_id', sessionId);

      if (error) {
        console.error('❌ Failed to get message count:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('❌ Error getting message count:', error);
      return 0;
    }
  };

  return {
    validateMessagePersistence,
    getMessageCount,
    persistenceState
  };
};