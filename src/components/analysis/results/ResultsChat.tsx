import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ResultsChatProps {
  analysisData: any;
  sessionId: string;
}

export const ResultsChat = ({ analysisData, sessionId }: ResultsChatProps) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: analysisData?.claude_analysis?.executiveSummary || "Analysis complete! I can help you understand the results and suggest improvements.",
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      console.log('🤖 Sending message to Claude via figmant-chat-analyzer');
      
      const { data, error } = await supabase.functions.invoke('figmant-chat-analyzer', {
        body: {
          message: message,
          sessionId: sessionId,
          includeImages: true // Include images for context
        }
      });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw error;
      }

      if (!data?.success) {
        console.error('❌ Analysis failed:', data?.error);
        throw new Error(data?.error || 'Analysis failed');
      }

      console.log('✅ Claude response received:', data);

      const aiResponse: Message = {
        id: messages.length + 2,
        role: 'assistant',
        content: data.content || "I apologize, but I didn't receive a proper response. Could you try asking again?",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);

    } catch (error) {
      console.error('❌ Chat error:', error);
      
      const errorMessage: Message = {
        id: messages.length + 2,
        role: 'assistant',
        content: "I'm sorry, I encountered an error while processing your message. Please try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-[#E2E2E2] flex items-center gap-3">
        <Avatar className="w-8 h-8 bg-[#22757C]">
          <AvatarFallback className="text-white font-medium">
            AI
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-[#121212]">Claude AI</h3>
          <p className="text-xs text-[#7B7B7B]">Analysis</p>
        </div>
        <Button variant="ghost" size="sm" className="ml-auto">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <Avatar className="w-6 h-6 bg-[#22757C] flex-shrink-0">
                <AvatarFallback className="text-white text-xs">
                  AI
                </AvatarFallback>
              </Avatar>
            )}
            <div className={`max-w-[80%] p-3 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-[#22757C] text-white' 
                : 'bg-[#F8F9FA] text-[#121212]'
            }`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p className="text-xs opacity-70 mt-2">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {msg.role === 'user' && (
              <Avatar className="w-6 h-6 bg-[#E2E2E2] flex-shrink-0">
                <AvatarFallback className="text-[#7B7B7B] text-xs">
                  U
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-[#E2E2E2]">
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about your analysis results..."
            className="flex-1 min-h-[40px] max-h-[120px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            onClick={handleSendMessage}
            size="sm"
            className="bg-[#22757C] hover:bg-[#22757C]/90 text-white px-3"
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};