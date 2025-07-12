import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '../types';
import { safeExtractAnalysisContent, validatePersonaData, validateSessionData } from '../../validation/dataValidation';
import { trackPersonaExtraction, trackChatMessage, dataFlowMonitor } from '../../monitoring/dataFlowMonitor';

interface UseChatHistoryProps {
  session: any;
  personaData: any;
}

export const useChatHistory = ({ session, personaData }: UseChatHistoryProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Persona-specific greetings - BRIEF & HELPFUL
  const getPersonaGreeting = (persona: string): string => {
    const greetings = {
      clarity: "👾 I'm Clarity! Ask me about:\n• Usability issues in your design\n• User confusion points\n• Quick UX fixes",
      strategic: "🎯 I'm your Strategic advisor. Ask me about:\n• Business impact of UX decisions\n• User research insights\n• Competitive advantages",
      mirror: "🪞 I'm Mirror. Ask me about:\n• User emotions and feelings\n• Empathy gaps in your design\n• User journey pain points",
      mad: "🔬 I'm Mad Scientist! Ask me about:\n• Creative UX experiments\n• Unconventional solutions\n• Innovation opportunities",
      mad_scientist: "🔬 I'm Mad Scientist! Ask me about:\n• Creative UX experiments\n• Unconventional solutions\n• Innovation opportunities",
      executive: "💼 I'm your Executive consultant. Ask me about:\n• ROI of UX improvements\n• Business metrics impact\n• Strategic UX decisions",
      exec: "💼 I'm your Executive consultant. Ask me about:\n• ROI of UX improvements\n• Business metrics impact\n• Strategic UX decisions"
    };

    return greetings[persona] || greetings.clarity;
  };

  // Extract context from analysis for enhanced greeting
  const getAnalysisContext = () => {
    if (!personaData) return null;

    const analysisText = safeExtractAnalysisContent(personaData);
    let context = '';
    
    // Look for screen references
    const screenMentions = [];
    if (analysisText.includes('Screen 1')) screenMentions.push('Screen 1');
    if (analysisText.includes('Screen 2')) screenMentions.push('Screen 2');
    if (analysisText.includes('Screen 3')) screenMentions.push('Screen 3');
    
    // Look for UI elements mentioned
    const uiElements = [];
    const commonElements = ['checkout', 'dashboard', 'form', 'navigation', 'button', 'signup', 'login', 'onboarding'];
    commonElements.forEach(element => {
      if (analysisText.toLowerCase().includes(element)) {
        if (!uiElements.includes(element)) {
          uiElements.push(element);
        }
      }
    });

    if (screenMentions.length > 0) {
      context += `I've analyzed your ${screenMentions.join(' and ')}`;
    } else if (uiElements.length > 0) {
      context += `I've analyzed your ${uiElements.slice(0, 2).join(' and ')} interface`;
    } else {
      context += `I've analyzed your uploaded screens`;
    }

    return context;
  };

  const createGreetingMessage = (persona: string): ChatMessage => {
    const baseGreeting = getPersonaGreeting(persona);
    
    const greetingMessage: ChatMessage = {
      id: 'greeting_' + Date.now(),
      role: 'clarity',
      content: baseGreeting,
      timestamp: new Date(),
      conversation_stage: 'greeting',
      quality_tags: ['helpful', 'contextual']
    };

    trackChatMessage(true, greetingMessage);
    return greetingMessage;
  };

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
    // Remove refinement_score and other removed properties
    
    return qualityTags;
  };

  const createInitialMessageFromPersonaData = () => {
    if (!personaData) {
      trackPersonaExtraction(false, null);
      return null;
    }

    // Validate and extract content using the safe function
    const validation = validatePersonaData(personaData);
    const initialMessageContent = safeExtractAnalysisContent(personaData);
    
    const success = validation.isValid && initialMessageContent.length > 0;
    trackPersonaExtraction(success, personaData, initialMessageContent);

    const message = {
      id: 'initial-from-persona',
      role: 'clarity' as const,
      content: initialMessageContent,
      timestamp: new Date(),
      conversation_stage: 'initial',
      quality_tags: []
    };

    trackChatMessage(true, message);
    return message;
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
        // Fall back to enhanced greeting message
        const greetingMessage = createGreetingMessage(session?.persona_type || 'clarity');
        setMessages([greetingMessage]);
        
        // Still save initial analysis for reference (but don't show in chat)
        const initialMessage = createInitialMessageFromPersonaData();
        if (initialMessage) {
          await saveInitialMessageToDatabase(initialMessage.content);
        }
        return;
      }

      console.log(`🔍 Found ${historyData?.length || 0} messages in database`);
      console.timeEnd('loadConversationHistory');

      if (historyData && historyData.length > 0) {
        // Filter out initial analysis messages and convert to ChatMessage format
        const chatMessages = historyData
          .filter(record => record.conversation_stage !== 'initial') // Remove initial JSON dumps
          .map(record => ({
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
              conversation_stage: record.conversation_stage
            })
          }));

        // If no actual chat messages exist (only initial was filtered out), start with enhanced greeting
        if (chatMessages.length === 0) {
          console.log('📝 No chat messages found, creating enhanced greeting message');
          const greetingMessage = createGreetingMessage(session?.persona_type || 'clarity');
          setMessages([greetingMessage]);
        } else {
          console.log('✅ Loaded chat messages from database:', chatMessages.length);
          setMessages(chatMessages);
        }

        // Ensure initial analysis is saved to database (for other tabs) if not already there
        const hasInitialMessage = historyData.some(record => record.conversation_stage === 'initial');
        if (!hasInitialMessage) {
          const initialMessage = createInitialMessageFromPersonaData();
          if (initialMessage) {
            await saveInitialMessageToDatabase(initialMessage.content);
          }
        }
      } else {
        // No history found, create enhanced greeting message
        console.log('📝 No conversation history found, creating enhanced greeting message');
        const greetingMessage = createGreetingMessage(session?.persona_type || 'clarity');
        setMessages([greetingMessage]);
        
        // Save initial analysis for other tabs
        const initialMessage = createInitialMessageFromPersonaData();
        if (initialMessage) {
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
      
      // Fall back to enhanced greeting message
      const greetingMessage = createGreetingMessage(session?.persona_type || 'clarity');
      setMessages([greetingMessage]);
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
        // Filter out initial analysis messages
        const chatMessages = historyData
          .filter(record => record.conversation_stage !== 'initial')
          .map(record => ({
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
              conversation_stage: record.conversation_stage
            })
          }));

        // If only initial messages were filtered out, add enhanced greeting
        if (chatMessages.length === 0) {
          const greetingMessage = createGreetingMessage(session?.persona_type || 'clarity');
          setMessages([greetingMessage]);
        } else {
          console.log(`✅ Reloaded ${chatMessages.length} chat messages`);
          setMessages(chatMessages);
        }
        return true;
      } else {
        // No messages or error - fall back to enhanced greeting
        const greetingMessage = createGreetingMessage(session?.persona_type || 'clarity');
        setMessages([greetingMessage]);
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to reload messages:', error);
      // Fall back to enhanced greeting on error
      const greetingMessage = createGreetingMessage(session?.persona_type || 'clarity');
      setMessages([greetingMessage]);
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