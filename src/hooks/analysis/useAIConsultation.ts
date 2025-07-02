import { useState, useCallback } from 'react';
import { aiEnhancedSolutionEngine } from '@/services/solutions/aiEnhancedSolutionEngine';
import { toast } from 'sonner';

interface ProblemStatementInput {
  statement: string;
  analysisResults: any[];
  analysisContext: string;
  analysisId?: string;
}

export const useAIConsultation = () => {
  const [isGeneratingConsultation, setIsGeneratingConsultation] = useState(false);
  const [consultationResults, setConsultationResults] = useState<any>(null);
  const [userProblemStatement, setUserProblemStatement] = useState<string>('');

  /**
   * Generate AI consultation with problem statement
   */
  const generateConsultationWithProblemStatement = useCallback(async (input: ProblemStatementInput) => {
    console.log('🎯 Generating AI consultation with problem statement...');
    setIsGeneratingConsultation(true);

    try {
      const consultation = await aiEnhancedSolutionEngine.provideConsultation({
        analysisResults: input.analysisResults,
        userProblemStatement: input.statement,
        analysisContext: input.analysisContext,
        analysisId: input.analysisId
      });

      console.log('✅ AI consultation completed:', {
        approach: consultation.approach,
        confidence: consultation.confidence,
        solutionCount: consultation.solutions.length,
        hasProblemMatch: !!consultation.problemStatementMatch
      });

      setConsultationResults(consultation);
      setUserProblemStatement(input.statement);

      // Store in session for persistence
      sessionStorage.setItem('consultationResults', JSON.stringify(consultation));
      sessionStorage.setItem('userProblemStatement', input.statement);

      toast.success(`Generated ${consultation.solutions.length} enhanced solutions using ${consultation.approach} approach`);

      return consultation;

    } catch (error) {
      console.error('❌ AI consultation failed:', error);
      toast.error('Failed to generate AI consultation. Please try again.');
      throw error;
    } finally {
      setIsGeneratingConsultation(false);
    }
  }, []);

  /**
   * Track user feedback on solutions
   */
  const trackSolutionFeedback = useCallback(async (
    solutionId: string,
    approach: string,
    satisfaction: number
  ) => {
    try {
      await aiEnhancedSolutionEngine.trackUsageAndFeedback(
        solutionId,
        approach,
        satisfaction
      );
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Failed to track feedback:', error);
    }
  }, []);

  /**
   * Load consultation from session storage
   */
  const loadStoredConsultation = useCallback(() => {
    try {
      const stored = sessionStorage.getItem('consultationResults');
      const storedStatement = sessionStorage.getItem('userProblemStatement');
      
      if (stored) {
        const consultation = JSON.parse(stored);
        setConsultationResults(consultation);
        
        if (storedStatement) {
          setUserProblemStatement(storedStatement);
        }
        
        console.log('📱 Loaded stored consultation:', {
          approach: consultation.approach,
          solutionCount: consultation.solutions.length
        });
        
        return consultation;
      }
    } catch (error) {
      console.error('Failed to load stored consultation:', error);
    }
    return null;
  }, []);

  /**
   * Clear consultation results
   */
  const clearConsultation = useCallback(() => {
    setConsultationResults(null);
    setUserProblemStatement('');
    sessionStorage.removeItem('consultationResults');
    sessionStorage.removeItem('userProblemStatement');
  }, []);

  return {
    // State
    isGeneratingConsultation,
    consultationResults,
    userProblemStatement,
    
    // Actions
    generateConsultationWithProblemStatement,
    trackSolutionFeedback,
    loadStoredConsultation,
    clearConsultation,
    setUserProblemStatement
  };
};