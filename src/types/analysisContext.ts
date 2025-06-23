
export interface UserAnalysisContext {
  analysisPrompt: string;
  designType?: string;
  businessGoals?: string[];
  targetAudience?: string;
}

export interface TechnicalAnalysisContext {
  aiModelUsed?: string;
  providerUsed?: string;
  analysisCompletedAt?: string;
  processingMetadata?: Record<string, any>;
}

export interface AnalysisContextSeparated {
  user: UserAnalysisContext;
  technical: TechnicalAnalysisContext;
}
