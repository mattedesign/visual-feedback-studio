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
    
    // Scoring based on content analysis
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

  const loadInitialMessage = async () => {
    if (!personaData) {
      console.warn('❌ No persona data available for creating initial message');
      return;
    }

    console.log('🔧 Creating initial message from persona data for persona:', session?.persona_type);
    
    // Build initial message with fallbacks for missing fields
    const analysis = personaData.analysis || "Analysis completed";
    const biggestGripe = personaData.biggestGripe || "Your interface needs attention!";
    const whatMakesGoblinHappy = personaData.whatMakesGoblinHappy || "User-centered design that works";
    const goblinPrediction = personaData.goblinPrediction || "Improve the UX and users will thank you";
    const goblinWisdom = personaData.goblinWisdom || "Good UX speaks for itself";

    const initialMessageContent = `${analysis}\n\n🤬 **My biggest gripe:** ${biggestGripe}\n\n😈 **What I actually like:** ${whatMakesGoblinHappy}\n\n🔮 **My prediction:** ${goblinPrediction}\n\n💎 **Goblin wisdom:** ${goblinWisdom}`;

    const initialMessage: ChatMessage = {
      id: 'initial-from-persona',
      role: 'clarity',
      content: initialMessageContent,
      timestamp: new Date(),
      conversation_stage: 'initial',
      quality_tags: []
    };
    
    console.log('✅ Setting initial message from persona data');
    setMessages([initialMessage]);

    // Save the initial message to the database to ensure persistence - only if not already saved
    try {
      console.log('💾 Checking if initial message needs to be saved to database');
      
      // Check if initial message is already in database
      const { data: existingInitial } = await supabase
        .from('goblin_refinement_history')
        .select('id')
        .eq('session_id', session.id)
        .eq('role', 'clarity')
        .eq('conversation_stage', 'initial')
        .limit(1);

      if (!existingInitial || existingInitial.length === 0) {
        console.log('💾 Saving initial message to database for persistence');
        await supabase.functions.invoke('goblin-model-claude-analyzer', {
          body: {
            sessionId: session.id,
            chatMode: false,
            prompt: 'Initial analysis', 
            persona: session?.persona_type || 'clarity',
            conversationHistory: '',
            originalAnalysis: personaData,
            saveInitialOnly: true,
            initialContent: initialMessageContent
          }
        });
        console.log('✅ Initial message saved to database');
      } else {
        console.log('⚠️ Initial message already exists in database, skipping save');
      }
    } catch (error) {
      console.warn('⚠️ Failed to save initial message to database:', error);
      // Continue anyway - the message is still shown in UI
    }
  };

  const loadConversationHistory = async () => {
    if (!session?.id) {
      console.warn('❌ No session ID available for loading conversation history');
      return;
    }

    try {
      console.log('📚 Loading persistent conversation history for session:', session.id);
      
      // Fetch conversation history from the database with user context
      const { data: historyData, error } = await supabase
        .from('goblin_refinement_history')
        .select('*')
        .eq('session_id', session.id)
        .order('message_order', { ascending: true });

      if (error) {
        console.warn('⚠️ Failed to load conversation history:', error);
        // Fall back to initial message from persona data
        await loadInitialMessage();
        return;
      }

      console.log(`🔍 Found ${historyData?.length || 0} messages in database for session ${session.id}`);

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
          quality_tags: [] // Will be populated below
        }));

        console.log('✅ Setting loaded messages from database:', loadedMessages.length);
        // Add quality tags to loaded messages
        const messagesWithQuality = loadedMessages.map(msg => ({
          ...msg,
          quality_tags: analyzeMessageQuality(msg)
        }));
        setMessages(messagesWithQuality);
      } else {
        // No history found in database, create initial message from persona data
        console.log('📝 No conversation history found, creating initial message from persona data');
        await loadInitialMessage();
      }
    } catch (error) {
      console.error('❌ Error loading conversation history:', error);
      // Always fall back to initial message on error
      await loadInitialMessage();
    }
  };

  const reloadMessages = async () => {
    try {
      console.log('🔄 Reloading conversation history after new message');
      
      const { data: historyData, error: reloadError } = await supabase
        .from('goblin_refinement_history')
        .select('*')
        .eq('session_id', session.id)
        .order('message_order', { ascending: true });

      if (!reloadError && historyData && historyData.length > 0) {
        const reloadedMessages = historyData.map(record => ({
          id: record.id,
          role: record.role as 'user' | 'clarity',
          content: record.content,
          timestamp: new Date(record.created_at),
          refinement_score: record.refinement_score,
          conversation_stage: record.conversation_stage,
          parsed_problems: record.parsed_problems,
          suggested_fixes: record.suggested_fixes,
          quality_tags: [] // Will be populated below
        }));

        // Add quality tags to reloaded messages
        const messagesWithQuality = reloadedMessages.map(msg => ({
          ...msg,
          quality_tags: analyzeMessageQuality(msg)
        }));

        console.log(`✅ Loaded ${messagesWithQuality.length} messages from database`);
        setMessages(messagesWithQuality);
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
    setMessages([]); // Clear existing messages first
    
    if (session?.id && personaData) {
      console.log('🚀 Triggering conversation history load for session:', session.id);
      loadConversationHistory();
    } else {
      console.log('⏸️ Not loading conversation - missing session ID or persona data');
    }
  }, [session?.id, personaData]);

  return {
    messages,
    setMessages,
    analyzeMessageQuality,
    reloadMessages
  };
};