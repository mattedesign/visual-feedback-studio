import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatMessage as ChatMessageType } from '../types';
import { ParsedText } from '@/utils/textParsing';

interface ChatMessageProps {
  message: ChatMessageType;
  session: any;
  onRefineFeedback: (messageId: string, feedbackType: string) => void;
  onAddFeedbackAnchor: (messageId: string, anchor: string) => void;
  analyzeMessageQuality: (message: ChatMessageType) => string[];
  feedbackMode: string | null;
  selectedMessageId: string | null;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  session,
  onRefineFeedback,
  onAddFeedbackAnchor,
  analyzeMessageQuality,
  feedbackMode,
  selectedMessageId
}) => {
  const getPersonaIcon = (personaType: string) => {
    switch (personaType) {
      case 'clarity': return '👾 Clarity';
      case 'mirror': return '🪞 Mirror';
      case 'strategic': return '📊 Strategist';
      case 'mad': return '🔬 Mad Scientist';
      case 'exec': return '💼 Executive';
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
          <ParsedText>{message.content}</ParsedText>
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
        
        {/* Feedback Anchors */}
        {message.feedback_anchors && message.feedback_anchors.length > 0 && (
          <div className="mt-3 text-xs">
            <span className="font-medium text-purple-600">Feedback Anchors:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {message.feedback_anchors.map((anchor, idx) => (
                <Badge key={idx} variant="outline" className="text-xs bg-purple-50 text-purple-700">
                  {anchor.split(':')[0]}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Refine Feedback Buttons */}
        {message.role === 'clarity' && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-6 px-2"
              onClick={() => onRefineFeedback(message.id, 'clarity')}
              disabled={feedbackMode === 'clarity' && selectedMessageId === message.id}
            >
              🔍 More Clarity
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-6 px-2"
              onClick={() => onRefineFeedback(message.id, 'specificity')}
              disabled={feedbackMode === 'specificity' && selectedMessageId === message.id}
            >
              📋 More Specific
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-6 px-2"
              onClick={() => onRefineFeedback(message.id, 'actionable')}
              disabled={feedbackMode === 'actionable' && selectedMessageId === message.id}
            >
              ⚡ More Actionable
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-6 px-2"
              onClick={() => onAddFeedbackAnchor(message.id, `Detailed analysis at ${new Date().toLocaleTimeString()}`)}
            >
              📌 Add to Detailed
            </Button>
          </div>
        )}

        {/* Quality Tags */}
        {message.role === 'clarity' && analyzeMessageQuality(message).length > 0 && (
          <div className="mt-3 text-xs">
            <span className="font-medium text-indigo-600">Quality Tags:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {analyzeMessageQuality(message).map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs bg-indigo-50 text-indigo-700">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

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