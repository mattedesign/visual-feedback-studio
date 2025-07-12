import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ChatMessage as ChatMessageType } from '../types';
import { ParsedText } from '@/utils/textParsing';

interface ChatMessageProps {
  message: ChatMessageType;
  session: any;
  analyzeMessageQuality: (message: ChatMessageType) => string[];
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  session,
  analyzeMessageQuality
}) => {
  const getPersonaIcon = (personaType: string) => {
    switch (personaType) {
      case 'clarity': return '👾 Clarity';
      case 'mirror': return '🪞 Mirror';
      case 'strategic': return '📊 Strategist';
      case 'mad': return '🔬 Mad Scientist';
      case 'executive': return '💼 Executive';
      default: return '🤖 AI Assistant';
    }
  };

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
              {getPersonaIcon(session?.persona_type)}
            </span>
            <span className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString()}
            </span>
            {message.conversation_stage && (
              <Badge variant="outline" className="text-xs">
                {message.conversation_stage}
              </Badge>
            )}
          </div>
        )}
        
        <div className="whitespace-pre-wrap text-sm">
          <ParsedText>{message.content}</ParsedText>
        </div>

        {message.role === 'user' && (
          <div className="text-xs text-primary-foreground/70 mt-1">
            {message.timestamp.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;