import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSendMessage: () => void;
  onExpandPrompt: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  session: any;
}

const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  setInputValue,
  onSendMessage,
  onExpandPrompt,
  onKeyPress,
  isLoading,
  session
}) => {
  const getPersonaName = (personaType: string) => {
    switch (personaType) {
      case 'clarity': return 'Clarity';
      case 'mirror': return 'Mirror';
      case 'strategic': return 'the Strategist';
      case 'mad': return 'the Mad Scientist';
      case 'executive': return 'the Executive';
      default: return 'the AI Assistant';
    }
  };

  const getPersonaEmoji = (personaType: string) => {
    switch (personaType) {
      case 'clarity': return 'if you dare 😈';
      default: return '💭';
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder={`Ask ${getPersonaName(session?.persona_type)} about your UX... ${getPersonaEmoji(session?.persona_type)}`}
        disabled={isLoading}
        className="flex-1"
      />
      <Button 
        onClick={onExpandPrompt}
        disabled={!inputValue.trim() || isLoading}
        variant="outline"
        size="sm"
        title="Get better question suggestions"
      >
        💡 Expand
      </Button>
      <Button 
        onClick={onSendMessage} 
        disabled={!inputValue.trim() || isLoading}
      >
        Send
      </Button>
    </div>
  );
};

export default ChatInput;