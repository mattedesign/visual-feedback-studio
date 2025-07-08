import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClarityChatProps {
  session: any;
  personaData: any;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'clarity';
  content: string;
  timestamp: Date;
  refinement_score?: number;
  conversation_stage?: string;
  parsed_problems?: any[];
  suggested_fixes?: any[];
}

const ClarityChat: React.FC<ClarityChatProps> = ({ session, personaData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load persistent conversation history
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (!session?.id) return;

      try {
        console.log('📚 Loading persistent conversation history...');
        
        // Fetch conversation history from the database
        const { data: historyData, error } = await supabase
          .from('goblin_refinement_history')
          .select('*')
          .eq('session_id', session.id)
          .order('message_order', { ascending: true });

        if (error) {
          console.warn('Failed to load conversation history:', error);
          // Fall back to initial message from persona data
          loadInitialMessage();
          return;
        }

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
            suggested_fixes: record.suggested_fixes
          }));

          setMessages(loadedMessages);
          console.log(`✅ Loaded ${loadedMessages.length} messages from conversation history`);
        } else {
          // No history found, start with initial message
          loadInitialMessage();
        }
      } catch (error) {
        console.error('Error loading conversation history:', error);
        loadInitialMessage();
      }
    };

    const loadInitialMessage = () => {
      if (!personaData) return;

      console.log('🔧 Creating initial message from persona data');
      
      // Build initial message with fallbacks for missing fields
      const analysis = personaData.analysis || "Analysis completed";
      const biggestGripe = personaData.biggestGripe || "Your interface needs attention!";
      const whatMakesGoblinHappy = personaData.whatMakesGoblinHappy || "User-centered design that works";
      const goblinPrediction = personaData.goblinPrediction || "Improve the UX and users will thank you";
      const goblinWisdom = personaData.goblinWisdom || "Good UX speaks for itself";

      const initialMessage: ChatMessage = {
        id: 'initial',
        role: 'clarity',
        content: `${analysis}\n\n🤬 **My biggest gripe:** ${biggestGripe}\n\n😈 **What I actually like:** ${whatMakesGoblinHappy}\n\n🔮 **My prediction:** ${goblinPrediction}\n\n💎 **Goblin wisdom:** ${goblinWisdom}`,
        timestamp: new Date(),
        conversation_stage: 'initial'
      };
      setMessages([initialMessage]);
    };

    if (session?.id && messages.length === 0) {
      loadConversationHistory();
    }
  }, [session?.id, personaData]);

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

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call the goblin-model-claude-analyzer with chatMode
      const actualPersona = session?.persona_type || 'clarity';
      console.log('🎭 Using persona:', actualPersona, 'for session:', session?.id);
      
      const { data, error } = await supabase.functions.invoke('goblin-model-claude-analyzer', {
        body: {
          sessionId: session.id,
          chatMode: true,
          prompt: inputValue,
          persona: actualPersona,
          conversationHistory: messages.map(m => `${m.role}: ${m.content}`).join('\n\n'),
          originalAnalysis: personaData
        }
      });

      if (error) throw error;

      // Reload messages from database to get updated intelligence data
      setTimeout(async () => {
        try {
          const { data: historyData, error: reloadError } = await supabase
            .from('goblin_refinement_history')
            .select('*')
            .eq('session_id', session.id)
            .order('message_order', { ascending: true });

          if (!reloadError && historyData) {
            const reloadedMessages = historyData.map(record => ({
              id: record.id,
              role: record.role as 'user' | 'clarity',
              content: record.content,
              timestamp: new Date(record.created_at),
              refinement_score: record.refinement_score,
              conversation_stage: record.conversation_stage,
              parsed_problems: record.parsed_problems,
              suggested_fixes: record.suggested_fixes
            }));
            setMessages(reloadedMessages);
          } else {
            // Fallback to basic response if reload fails
            const clarityResponse: ChatMessage = {
              id: Date.now().toString() + '_clarity',
              role: 'clarity',
              content: data.analysisData?.analysis || data.rawResponse || 'Hmm, seems I lost my voice for a moment there...',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, clarityResponse]);
          }
        } catch (reloadError) {
          console.error('Failed to reload messages:', reloadError);
          // Fallback to basic response
          const clarityResponse: ChatMessage = {
            id: Date.now().toString() + '_clarity',
            role: 'clarity',
            content: data.analysisData?.analysis || data.rawResponse || 'Hmm, seems I lost my voice for a moment there...',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, clarityResponse]);
        }
      }, 2000); // Wait 2 seconds for database persistence to complete
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

  const exportChat = () => {
    const actualPersona = session?.persona_type || 'clarity';
    const chatData = {
      session: session.title,
      persona: actualPersona,
      date: new Date().toISOString(),
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp
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

  return (
    <div className="flex flex-col h-[600px] space-y-4">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl">
            Chat with {session?.persona_type === 'clarity' ? 'Clarity 🧠👾' : 
                       session?.persona_type === 'mirror' ? 'Mirror 🪞✨' :
                       session?.persona_type === 'strategic' ? 'Strategist 📊🎯' :
                       session?.persona_type === 'mad' ? 'Mad Scientist 🔬⚡' :
                       session?.persona_type === 'executive' ? 'Executive 💼📈' :
                       'AI Assistant 🤖'}
          </CardTitle>
          <Button onClick={exportChat} variant="outline" size="sm">
            Export Chat
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground border-l-4 border-green-500'
                    }`}
                  >
                    {message.role === 'clarity' && (
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-sm font-semibold text-green-600">
                          {session?.persona_type === 'clarity' ? '👾 Clarity' : 
                           session?.persona_type === 'mirror' ? '🪞 Mirror' :
                           session?.persona_type === 'strategic' ? '📊 Strategist' :
                           session?.persona_type === 'mad' ? '🔬 Mad Scientist' :
                           session?.persona_type === 'executive' ? '💼 Executive' :
                           '🤖 AI Assistant'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        {message.conversation_stage && (
                          <Badge variant="outline" className="text-xs">
                            {message.conversation_stage}
                          </Badge>
                        )}
                        {message.refinement_score && (
                          <Badge 
                            variant={message.refinement_score > 0.7 ? "default" : message.refinement_score > 0.5 ? "secondary" : "outline"}
                            className="text-xs"
                          >
                            Score: {(message.refinement_score * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                    {message.role === 'clarity' && (message.parsed_problems?.length || message.suggested_fixes?.length) && (
                      <div className="mt-3 text-xs space-y-2">
                        {message.parsed_problems && message.parsed_problems.length > 0 && (
                          <div>
                            <span className="font-medium text-orange-600">Problems Identified:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {message.parsed_problems.slice(0, 3).map((problem, idx) => (
                                <Badge key={idx} variant="destructive" className="text-xs">
                                  {problem.type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {message.suggested_fixes && message.suggested_fixes.length > 0 && (
                          <div>
                            <span className="font-medium text-blue-600">Fixes Suggested:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {message.suggested_fixes.slice(0, 3).map((fix, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {fix.type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {message.role === 'user' && (
                      <div className="text-xs text-primary-foreground/70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted border-l-4 border-green-500 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-green-600">
                        {session?.persona_type === 'clarity' ? '👾 Clarity' : 
                         session?.persona_type === 'mirror' ? '🪞 Mirror' :
                         session?.persona_type === 'strategic' ? '📊 Strategist' :
                         session?.persona_type === 'mad' ? '🔬 Mad Scientist' :
                         session?.persona_type === 'executive' ? '💼 Executive' :
                         '🤖 AI Assistant'}
                      </span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Ask ${session?.persona_type === 'clarity' ? 'Clarity' : 
                                session?.persona_type === 'mirror' ? 'Mirror' :
                                session?.persona_type === 'strategic' ? 'the Strategist' :
                                session?.persona_type === 'mad' ? 'the Mad Scientist' :
                                session?.persona_type === 'executive' ? 'the Executive' :
                                'the AI Assistant'} about your UX... ${session?.persona_type === 'clarity' ? 'if you dare 😈' : '💭'}`}
          disabled={isLoading}
          className="flex-1"
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={!inputValue.trim() || isLoading}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default ClarityChat;