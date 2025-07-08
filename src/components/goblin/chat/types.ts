export interface ChatMessage {
  id: string;
  role: 'user' | 'clarity';
  content: string;
  timestamp: Date;
  refinement_score?: number;
  conversation_stage?: string;
  parsed_problems?: any[];
  suggested_fixes?: any[];
  feedback_anchors?: string[];
  quality_tags?: string[];
  expansion_suggestions?: string[];
}

export interface ClarityChatProps {
  session: any;
  personaData: any;
  onFeedbackUpdate?: (messageId: string, feedbackType: string, data: any) => void;
}