import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '../types';

interface UseChatHistoryProps {
  session: any;
  personaData: any;
}

export const useChatHistory = ({ session, personaData }: UseChatHistoryProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const analyzeMessageQuality = (message: ChatMessage) => {
    const content = message.content.toLowerCase();
    const qualityTags = [];
    
    if (content.includes('specific') || content.includes('exactly') || content.includes('precisely')) {
      qualityTags.push('specific');
    }
    if (content.includes('should') || content.includes('recommend') || content.includes('action')) {
      qualityTags.push('actionable');
    }
    if (content.includes('because') || content.includes('reason') || content.includes('why')) {
      qualityTags.push('explanatory');
    }
    if (message.refinement_score && message.refinement_score > 0.8) {
      qualityTags.push('high-quality');
    }
    if (message.parsed_problems?.length > 0) {
      qualityTags.push('problem-focused');
    }
    if (message.suggested_fixes?.length > 0) {
      qualityTags.push('solution-oriented');
    }
    
    return qualityTags;
  };

  const createInitialMessageFromPersonaData = () => {
    if (!personaData) {
      console.warn('❌ No persona data available for creating initial message');
      return null;
    }

    console.log('🔧 Creating initial message from persona data');
    
    // Extract actual analysis content from persona data
    let initialMessageContent = "What other questions do you have about this design?";
    
    try {
      if (personaData.analysis && personaData.analysis.length > 0) {
        // Use the actual analysis content
        initialMessageContent = personaData.analysis;
        console.log('✅ Using persona analysis content:', initialMessageContent.substring(0, 100) + '...');
      } else if (personaData.synthesis_summary) {
        // Fallback to synthesis summary
        initialMessageContent = personaData.synthesis_summary;
        console.log('✅ Using synthesis summary as fallback');
      } else {
        console.warn('⚠️ No analysis content found, using default message');
      }
    } catch (error) {
      console.error('❌ Error extracting analysis content:', error);
    }

    return {
      id: 'initial-from-persona',
      role: 'clarity' as const,
      content: initialMessageContent,
      timestamp: new Date(),
      conversation_stage: 'initial',
      quality_tags: []
    };
  };

  const saveInitialMessageToDatabase = async (messageContent: string) => {
    if (!session?.id) return;

    try {
      console.log('💾 Attempting to save initial message to database');
      
      await supabase.functions.invoke('goblin-model-claude-analyzer', {
        body: {
          sessionId: session.id,
          saveInitialOnly: true,
          initialContent: messageContent,
          persona: session?.persona_type || 'clarity'
        }
      });
      
      console.log('✅ Initial message save request sent');
    } catch (error) {
      console.error('⚠️ Failed to save initial message:', error);
    }
  };

  const loadConversationHistory = async () => {
    if (!session?.id) {
      console.warn('❌ No session ID available for loading conversation history');
      return;
    }

    try {
      console.log('📚 Loading conversation history for session:', session.id);
      console.time('loadConversationHistory');
      
      // Fetch conversation history from database
      const { data: historyData, error } = await supabase
        .from('goblin_refinement_history')
        .select('*')
        .eq('session_id', session.id)
        .order('message_order', { ascending: true });

      if (error) {
        console.warn('⚠️ Failed to load conversation history:', error);
        // Fall back to initial message from persona data
        const initialMessage = createInitialMessageFromPersonaData();
        if (initialMessage) {
          setMessages([initialMessage]);
          await saveInitialMessageToDatabase(initialMessage.content);
        }
        return;
      }

      console.log(`🔍 Found ${historyData?.length || 0} messages in database`);
      console.timeEnd('loadConversationHistory');

      if (historyData && historyData.length > 0) {
        // Convert database records to ChatMessage format
        const loadedMessages = historyData.map(record => ({
          id: record.id,
          role: record.role as 'user' | 'clarity',
          content: record.content,
          timestamp: new Date(record.created_at),
          refinement_score: record.refinement_score,
          conversation_stage: record.conversation_stage,
          parsed_problems: record.parsed_problems,
          suggested_fixes: record.suggested_fixes,
          quality_tags: analyzeMessageQuality({
            id: record.id,
            role: record.role as 'user' | 'clarity',
            content: record.content,
            timestamp: new Date(record.created_at),
            refinement_score: record.refinement_score,
            conversation_stage: record.conversation_stage,
            parsed_problems: record.parsed_problems,
            suggested_fixes: record.suggested_fixes
          })
        }));

        console.log('✅ Loaded messages from database:', loadedMessages.length);
        setMessages(loadedMessages);
      } else {
        // No history found, create initial message from persona data
        console.log('📝 No conversation history found, creating initial message');
        const initialMessage = createInitialMessageFromPersonaData();
        if (initialMessage) {
          setMessages([initialMessage]);
          await saveInitialMessageToDatabase(initialMessage.content);
        }
      }
    } catch (error) {
      console.error('❌ Error loading conversation history:', error);
      console.timeEnd('loadConversationHistory');
      
      // Log detailed error information
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          sessionId: session?.id
        });
      }
      
      // Fall back to initial message
      const initialMessage = createInitialMessageFromPersonaData();
      if (initialMessage) {
        setMessages([initialMessage]);
      }
    }
  };

  const reloadMessages = async () => {
    try {
      console.log('🔄 Reloading conversation history');
      
      const { data: historyData, error } = await supabase
        .from('goblin_refinement_history')
        .select('*')
        .eq('session_id', session.id)
        .order('message_order', { ascending: true });

      if (!error && historyData && historyData.length > 0) {
        const reloadedMessages = historyData.map(record => ({
          id: record.id,
          role: record.role as 'user' | 'clarity',
          content: record.content,
          timestamp: new Date(record.created_at),
          refinement_score: record.refinement_score,
          conversation_stage: record.conversation_stage,
          parsed_problems: record.parsed_problems,
          suggested_fixes: record.suggested_fixes,
          quality_tags: analyzeMessageQuality({
            id: record.id,
            role: record.role as 'user' | 'clarity',
            content: record.content,
            timestamp: new Date(record.created_at),
            refinement_score: record.refinement_score,
            conversation_stage: record.conversation_stage,
            parsed_problems: record.parsed_problems,
            suggested_fixes: record.suggested_fixes
          })
        }));

        console.log(`✅ Reloaded ${reloadedMessages.length} messages`);
        setMessages(reloadedMessages);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to reload messages:', error);
      return false;
    }
  };

  // Load conversation history when session or persona data changes
  useEffect(() => {
    if (session?.id && personaData) {
      console.log('🚀 Loading conversation history for session:', session.id);
      loadConversationHistory();
    } else {
      console.log('⏸️ Waiting for session and persona data');
      setMessages([]);
    }
  }, [session?.id, personaData]);

  return {
    messages,
    setMessages,
    analyzeMessageQuality,
    reloadMessages
  };
};