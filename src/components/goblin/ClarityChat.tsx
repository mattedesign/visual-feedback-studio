import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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
}

const ClarityChat: React.FC<ClarityChatProps> = ({ session, personaData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Initialize with persona data from analysis
  useEffect(() => {
    if (personaData && messages.length === 0) {
      console.log('🔧 ClarityChat: Initializing with persona data:', {
        hasPersonaData: !!personaData,
        availableFields: Object.keys(personaData),
        hasBiggestGripe: !!personaData.biggestGripe,
        hasWhatMakesGoblinHappy: !!personaData.whatMakesGoblinHappy,
        hasGoblinPrediction: !!personaData.goblinPrediction,
        hasGoblinWisdom: !!personaData.goblinWisdom
      });

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
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    }
  }, [personaData]);

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
      const { data, error } = await supabase.functions.invoke('goblin-model-claude-analyzer', {
        body: {
          sessionId: session.id,
          chatMode: true,
          prompt: inputValue,
          persona: 'clarity',
          conversationHistory: messages.map(m => `${m.role}: ${m.content}`).join('\n\n'),
          originalAnalysis: personaData
        }
      });

      if (error) throw error;

      const clarityResponse: ChatMessage = {
        id: Date.now().toString() + '_clarity',
        role: 'clarity',
        content: data.analysisData?.analysis || data.rawResponse || 'Hmm, seems I lost my voice for a moment there...',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, clarityResponse]);
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
    const chatData = {
      session: session.title,
      persona: 'clarity',
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
          <CardTitle className="text-xl">Chat with Clarity 🧠👾</CardTitle>
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
                    className={`${
                      message.role === 'user'
                        ? 'goblin-chat-bubble-user'
                        : 'goblin-chat-bubble-ai border-l-4 border-primary'
                    }`}
                  >
                    {message.role === 'clarity' && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-green-600">👾 Clarity</span>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
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
                      <span className="text-sm font-semibold text-green-600">👾 Clarity</span>
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
          placeholder="Ask Clarity about your UX... if you dare 😈"
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