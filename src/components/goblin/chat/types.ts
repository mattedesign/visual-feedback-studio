export interface ChatMessage {
  id: string;
  role: 'user' | 'clarity';
  content: string;
  timestamp: Date;
  conversation_stage?: string;
  quality_tags?: string[];
}

export interface ClarityChatProps {
  session: any;
  personaData: any;
  onFeedbackUpdate?: (messageId: string, feedbackType: string, data: any) => void;
}