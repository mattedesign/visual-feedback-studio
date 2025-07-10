import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Import refactored components and hooks
import { ClarityChatProps, ChatMessage } from './chat/types';
import { useChatHistory } from './chat/hooks/useChatHistory';
import { useMessagePersistence } from './chat/hooks/useMessagePersistence';
import ChatMessageComponent from './chat/components/ChatMessage';
import ChatInput from './chat/components/ChatInput';
import LoadingIndicator from './chat/components/LoadingIndicator';

const ClarityChat: React.FC<ClarityChatProps> = ({ session, personaData, onFeedbackUpdate }) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMode, setFeedbackMode] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { messages, setMessages, analyzeMessageQuality, reloadMessages } = useChatHistory({ session, personaData });
  const { validateMessagePersistence } = useMessagePersistence(session?.id);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    const currentMessageInput = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call the goblin-model-claude-analyzer with chatMode
      const actualPersona = session?.persona_type || 'clarity';
      console.log('🎭 Using persona:', actualPersona, 'for session:', session?.id);
      console.log('📝 Sending message:', currentMessageInput);
      
      const { data, error } = await supabase.functions.invoke('goblin-model-claude-analyzer', {
        body: {
          sessionId: session.id,
          chatMode: true,
          prompt: currentMessageInput,
          persona: actualPersona,
          conversationHistory: messages.map(m => `${m.role}: ${m.content}`).join('\n\n'),
          originalAnalysis: personaData
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('📡 Edge function response received:', data);

      // Validate that messages were persisted before proceeding
      const expectedMessageCount = messages.length + 2; // +1 for user message, +1 for AI response
      console.log('🔍 Validating message persistence...');
      
      const persistenceValidated = await validateMessagePersistence(expectedMessageCount);
      
      if (!persistenceValidated) {
        console.warn('⚠️ Message persistence validation failed, using fallback approach');
        toast.error('Message may not be saved properly. Please refresh if chat history is lost.');
      }

      // Reload messages from database to get updated intelligence data
      const reloadSuccess = await reloadMessages();
      
      if (!reloadSuccess) {
        console.warn('❌ Failed to reload from database, using fallback response');
        // Fallback to basic response if reload fails
        const clarityResponse: ChatMessage = {
          id: Date.now().toString() + '_clarity',
          role: 'clarity',
          content: data.analysisData?.analysis || data.rawResponse || 'Hmm, seems I lost my voice for a moment there...',
          timestamp: new Date(),
          quality_tags: []
        };
        setMessages(prev => [...prev, clarityResponse]);
        toast.warning('Using offline response - message history may not persist');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message to Clarity');
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '_error',
        role: 'clarity',
        content: '🤬 Ugh! Something went wrong with my goblin magic. Try asking me something else.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRefineFeedback = async (messageId: string, feedbackType: string) => {
    setSelectedMessageId(messageId);
    setFeedbackMode(feedbackType);
    
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    try {
      // Call edge function to generate refined feedback
      const { data, error } = await supabase.functions.invoke('goblin-model-claude-analyzer', {
        body: {
          sessionId: session.id,
          chatMode: true,
          prompt: `Please provide ${feedbackType} feedback for this message: "${message.content}"`,
          persona: session?.persona_type || 'clarity',
          conversationHistory: '',
          originalAnalysis: personaData,
          feedbackType
        }
      });

      if (error) throw error;

      // Update message with feedback anchors
      const updatedMessages = messages.map(m => {
        if (m.id === messageId) {
          const newAnchors = [...(m.feedback_anchors || []), `${feedbackType}: ${data.rawResponse?.slice(0, 100)}...`];
          return { ...m, feedback_anchors: newAnchors };
        }
        return m;
      });
      
      setMessages(updatedMessages);
      onFeedbackUpdate?.(messageId, feedbackType, data);
      toast.success(`${feedbackType} feedback added!`);
    } catch (error) {
      console.error('Feedback refinement error:', error);
      toast.error('Failed to generate refined feedback');
    } finally {
      setFeedbackMode(null);
      setSelectedMessageId(null);
    }
  };

  const handleAddFeedbackAnchor = (messageId: string, anchor: string) => {
    const updatedMessages = messages.map(m => {
      if (m.id === messageId) {
        const newAnchors = [...(m.feedback_anchors || []), anchor];
        return { ...m, feedback_anchors: newAnchors };
      }
      return m;
    });
    setMessages(updatedMessages);
    onFeedbackUpdate?.(messageId, 'anchor', anchor);
  };

  const handleExpandPrompt = async () => {
    if (!inputValue.trim()) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('goblin-model-claude-analyzer', {
        body: {
          sessionId: session.id,
          chatMode: true,
          prompt: `Please suggest 3 better ways to ask this question for more actionable UX feedback: "${inputValue}"`,
          persona: session?.persona_type || 'clarity',
          conversationHistory: '',
          originalAnalysis: personaData,
          feedbackType: 'expansion'
        }
      });

      if (error) throw error;

      // Show expansion suggestions as a temporary message
      const expansionMessage: ChatMessage = {
        id: Date.now().toString() + '_expansion',
        role: 'clarity',
        content: `💡 **Here are better ways to ask that question:**\n\n${data.rawResponse}`,
        timestamp: new Date(),
        expansion_suggestions: data.rawResponse?.split('\n').filter((line: string) => line.trim())
      };
      
      setMessages(prev => [...prev, expansionMessage]);
      toast.success('Prompt expansion suggestions added!');
    } catch (error) {
      console.error('Prompt expansion error:', error);
      toast.error('Failed to generate prompt suggestions');
    }
  };

  const exportChat = () => {
    const actualPersona = session?.persona_type || 'clarity';
    const chatData = {
      session: session.title,
      persona: actualPersona,
      date: new Date().toISOString(),
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        feedback_anchors: m.feedback_anchors,
        quality_tags: m.quality_tags,
        refinement_score: m.refinement_score
      }))
    };

    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `clarity-chat-${session.id}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Chat exported! 💾');
  };

  const getPersonaTitle = (personaType: string) => {
    switch (personaType) {
      case 'clarity': return 'Clarity 🧠👾';
      case 'mirror': return 'Mirror 🪞✨';
      case 'strategic': return 'Strategist 📊🎯';
      case 'mad': return 'Mad Scientist 🔬⚡';
      case 'exec': return 'Executive 💼📈';
      default: return 'AI Assistant 🤖';
    }
  };

  return (
    <div className="flex flex-col h-[600px] space-y-4">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl">
            Chat with {getPersonaTitle(session?.persona_type)}
          </CardTitle>
          <Button onClick={exportChat} variant="outline" size="sm">
            Export Chat
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessageComponent
                  key={message.id}
                  message={message}
                  session={session}
                  onRefineFeedback={handleRefineFeedback}
                  onAddFeedbackAnchor={handleAddFeedbackAnchor}
                  analyzeMessageQuality={analyzeMessageQuality}
                  feedbackMode={feedbackMode}
                  selectedMessageId={selectedMessageId}
                />
              ))}
              {isLoading && <LoadingIndicator session={session} />}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <ChatInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSendMessage={handleSendMessage}
        onExpandPrompt={handleExpandPrompt}
        onKeyPress={handleKeyPress}
        isLoading={isLoading}
        session={session}
      />
    </div>
  );
};

export default ClarityChat;