export interface ChatMessage {
  id: string;
  role: 'user' | 'clarity';
  content: string;
  timestamp: Date;
  refinement_score?: number;
  conversation_stage?: string;
  parsed_problems?: any[];
  suggested_fixes?: any[];
  quality_tags?: string[];
}

export interface ClarityChatProps {
  session: any;
  personaData: any;
  onFeedbackUpdate?: (messageId: string, feedbackType: string, data: any) => void;
}