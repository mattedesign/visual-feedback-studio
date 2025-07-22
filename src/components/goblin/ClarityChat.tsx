import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigation } from '@/contexts/NavigationContext';

// Import refactored components and hooks
import { ClarityChatProps, ChatMessage } from './chat/types';
import { useChatHistory } from './chat/hooks/useChatHistory';
import { useMessagePersistence } from './chat/hooks/useMessagePersistence';
import ChatMessageComponent from './chat/components/ChatMessage';
import ChatInput from '@/archive/goblin/chat/components/ChatInput';
import LoadingIndicator from '@/archive/goblin/chat/components/LoadingIndicator';

const ClarityChat: React.FC<ClarityChatProps> = ({ session, personaData, onFeedbackUpdate }) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setTotalImages } = useNavigation();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { messages, setMessages, analyzeMessageQuality, reloadMessages } = useChatHistory({ session, personaData });
  const { validateMessagePersistence } = useMessagePersistence(session?.id);

  // Set total images count for navigation context
  useEffect(() => {
    const fetchImageCount = async () => {
      if (!session?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('goblin_analysis_images')
          .select('id')
          .eq('session_id', session.id);
        
        if (!error) {
          setTotalImages(data?.length || 0);
        }
      } catch (error) {
        console.error('Failed to fetch image count:', error);
        setTotalImages(0);
      }
    };
    
    fetchImageCount();
  }, [session?.id, setTotalImages]);

  // Auto-scroll to bottom when messages load or change
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom when component mounts or becomes visible
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100); // Small delay to ensure DOM is ready

    return () => clearTimeout(timer);
  }, []);

  // Add intersection observer to detect when chat becomes visible (tab switch)
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && messages.length > 0) {
            setTimeout(() => scrollToBottom(), 100);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(scrollArea);
    return () => observer.disconnect();
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    const currentMessageInput = inputValue;
    const currentMessageCount = messages.length;
    
    // Optimistically add user message to UI
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      console.log('🎭 Sending chat message for session:', session?.id);
      
      const { data, error } = await supabase.functions.invoke('goblin-model-claude-analyzer', {
        body: {
          sessionId: session.id,
          chatMode: true,
          prompt: currentMessageInput,
          persona: session?.persona_type || 'clarity',
          conversationHistory: messages.map(m => `${m.role}: ${m.content}`).join('\n\n'),
          originalAnalysis: personaData
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('📡 Chat response received:', data);

      // Expected message count: current + user message + AI response
      const expectedMessageCount = currentMessageCount + 2;
      console.log('🔍 Validating persistence - expecting', expectedMessageCount, 'messages');

      // Validate message persistence with retries
      const persistenceValidated = await validateMessagePersistence(expectedMessageCount, 3);
      
      if (persistenceValidated) {
        console.log('✅ Messages persisted successfully, reloading from database');
        
        // Reload messages from database to get the complete conversation
        const reloadSuccess = await reloadMessages();
        
        if (reloadSuccess) {
          console.log('✅ Messages reloaded successfully from database');
        } else {
          throw new Error('Failed to reload messages after successful persistence');
        }
      } else {
        console.warn('⚠️ Persistence validation failed, using fallback approach');
        
        // Fallback: add the AI response directly to the UI
        const clarityResponse: ChatMessage = {
          id: Date.now().toString() + '_clarity',
          role: 'clarity',
          content: data.rawResponse || 'Response received but failed to persist.',
          timestamp: new Date(),
          quality_tags: []
        };
        setMessages(prev => [...prev, clarityResponse]);
        toast.warning('Message sent but may not be saved - please refresh to see full history');
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message to Clarity');
      
      // Remove the optimistic user message and add error message
      setMessages(prev => prev.slice(0, -1));
      
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
        timestamp: new Date()
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
        quality_tags: m.quality_tags
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
      case 'executive': return 'Executive 💼📈';
      default: return 'AI Assistant 🤖';
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[600px] w-full">
      <Card className="flex-1 flex flex-col overflow-hidden w-full">
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
                  analyzeMessageQuality={analyzeMessageQuality}
                />
              ))}
              {isLoading && <LoadingIndicator session={session} />}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="border-t bg-background p-4 mt-auto">
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
    </div>
  );
};

export default ClarityChat;