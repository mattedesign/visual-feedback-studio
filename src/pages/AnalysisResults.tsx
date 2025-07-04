import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { ModularAnalysisInterface } from '@/components/analysis/modules/ModularAnalysisInterface';
import SimpleAnalysisResults from '@/components/analysis/SimpleAnalysisResults';
import { claude20YearStrategistEngine, StrategistOutput } from '@/services/ai/claudeUXStrategistEngine';
import { StrategistResultsDisplay } from '@/components/analysis/results/StrategistResultsDisplay';
import { FigmaInspiredAnalysisLayout } from '@/components/analysis/figma/FigmaInspiredAnalysisLayout';
import { getAnalysisResults } from '@/services/analysisResultsService';
import { toast } from 'sonner';

// 🔧 FIX: Utility function to clear persistent state and navigate to clean analysis
const navigateToNewAnalysis = () => {
  console.log('🔄 CLEAR STATE: Clearing all persistent analysis state');
  // Clear session storage
  sessionStorage.removeItem('consultationResults');
  sessionStorage.removeItem('userProblemStatement');
  sessionStorage.removeItem('currentAnalysisData');
  
  // Clear strategist context from localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('strategist_context_') || key.startsWith('share_')) {
      localStorage.removeItem(key);
    }
  });
  
  // Navigate to clean analysis page
  window.location.href = '/analysis';
};

const AnalysisResults = () => {
  // ✅ STREAMLINED: Always use enhanced features - no feature flag checks needed
  const urlParams = new URLSearchParams(window.location.search);
  const isStrategistMode = urlParams.get('strategist') === 'true';
  
  // ✅ STREAMLINED: Enhanced analysis state - always enabled
  const [strategistAnalysis, setStrategistAnalysis] = useState<StrategistOutput | null>(null);
  const [strategistLoading, setStrategistLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  
  // Get analysis ID from URL
  const { id } = useParams<{id: string}>();

  // ✅ STREAMLINED: Always load analysis data for enhanced UI
  const loadAnalysisData = async () => {
    if (!id) return;

    try {
      console.log('🎨 Loading analysis data for enhanced UI:', id);
      
      // Fetch real analysis results from Supabase
      const analysisResult = await getAnalysisResults(id);
      
      if (!analysisResult) {
        console.warn('❌ No analysis results found for ID:', id);
        toast.error('Analysis results not found');
        return;
      }

      // Transform the Supabase data to match the enhanced UI format
      const transformedData = {
        annotations: Array.isArray(analysisResult.annotations) 
          ? analysisResult.annotations.map((annotation: any, index: number) => ({
              id: annotation.id || `annotation-${index}`,
              title: annotation.title || annotation.feedback?.substring(0, 50) || 'Analysis Issue',
              feedback: annotation.feedback || annotation.description || 'No description available',
              severity: annotation.severity || annotation.priority || 'medium',
              category: annotation.category || annotation.type || 'General'
            }))
          : [],
        images: analysisResult.images || [],
        totalAnnotations: analysisResult.total_annotations || 0,
        processingTime: analysisResult.processing_time_ms,
        knowledgeSourcesUsed: analysisResult.knowledge_sources_used,
        aiModel: analysisResult.ai_model_used,
        createdAt: analysisResult.created_at
      };

      setAnalysisData(transformedData);
      console.log('✅ Real analysis data loaded for enhanced UI:', {
        annotationCount: transformedData.annotations.length,
        totalAnnotations: transformedData.totalAnnotations
      });
      
    } catch (error) {
      console.error('❌ Failed to load analysis data:', error);
      toast.error('Failed to load analysis data');
    }
  };

  // ✅ STREAMLINED: Load analysis data on mount or when strategist mode is enabled
  useEffect(() => {
    if (isStrategistMode && id && !strategistAnalysis) {
      loadAnalysisAndEnhance();
    } else if (id && !analysisData) {
      loadAnalysisData();
    }
  }, [isStrategistMode, id]);

  const loadAnalysisAndEnhance = async () => {
    if (!id) return;

    try {
      setStrategistLoading(true);
      console.log('🎭 Loading analysis data for strategist enhancement:', id);
      
      // Get stored strategist context
      const contextKey = `strategist_context_${id}`;
      const storedContext = localStorage.getItem(contextKey);
      
      if (!storedContext) {
        console.warn('❌ No strategist context found');
        toast.error('Strategist context not found. Redirecting to traditional results.');
        // Redirect to traditional results
        window.location.href = window.location.href.replace('strategist=true', 'beta=true');
        return;
      }

      const context = JSON.parse(storedContext);
      console.log('🎭 Found strategist context:', context.userChallenge);
      
      toast.info('🎭 UX Strategist analyzing your design challenge...');

      // For this demo, we'll create mock analysis data
      // In a real implementation, you'd fetch from your API
      const mockAnalysisData = {
        annotations: [
          {
            title: "Checkout Form Complexity",
            feedback: "Multiple form fields create cognitive overload during payment",
            severity: "critical",
            category: "Forms"
          },
          {
            title: "Trust Signal Placement",
            feedback: "Security badges not visible at payment step",
            severity: "important", 
            category: "Trust"
          },
          {
            title: "Payment Options Clarity",
            feedback: "Available payment methods unclear until final step",
            severity: "important",
            category: "Payment"
          },
          {
            title: "Mobile Checkout Flow",
            feedback: "Form layout breaks on mobile devices",
            severity: "critical",
            category: "Mobile"
          },
          {
            title: "Error Handling",
            feedback: "Payment errors not clearly communicated",
            severity: "important",
            category: "Errors"
          }
        ]
      };

      setAnalysisData(mockAnalysisData);

      // Call strategist enhancement
      const strategistResult = await claude20YearStrategistEngine.enhanceAsStrategist({
        userChallenge: context.userChallenge,
        traditionalAnnotations: mockAnalysisData.annotations,
        visionAnalysis: {},
        ragKnowledge: {},
        imageContext: {}
      });
      
      setStrategistAnalysis(strategistResult);
      console.log('✅ Strategist enhancement complete:', strategistResult);
      toast.success('🎭 UX Strategist analysis complete!');
      
    } catch (error) {
      console.error('❌ Strategist enhancement failed:', error);
      toast.error('Strategist analysis failed. Redirecting to traditional results.');
      // Redirect to traditional results on error
      window.location.href = window.location.href.replace('strategist=true', 'beta=true');
    } finally {
      setStrategistLoading(false);
    }
  };

  // STRATEGIST MODE: Loading state
  if (isStrategistMode && strategistLoading) {
    return (
      <div className="strategist-loading bg-slate-900 text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">🎭 UX Strategist Analyzing...</h2>
          <p className="text-slate-400">Applying 20 years of UX expertise to your design challenge</p>
          <div className="mt-4 text-sm text-slate-500 max-w-md">
            <strong>Challenge:</strong> "{(() => {
              const contextKey = `strategist_context_${id}`;
              const stored = localStorage.getItem(contextKey);
              return stored ? JSON.parse(stored).userChallenge : 'Analyzing design...';
            })()}"
          </div>
        </div>
      </div>
    );
  }

  // STRATEGIST MODE: Results display
  if (isStrategistMode && strategistAnalysis && analysisData) {
    const contextKey = `strategist_context_${id}`;
    const storedContext = localStorage.getItem(contextKey);
    const userChallenge = storedContext ? JSON.parse(storedContext).userChallenge : "Design challenge analysis";

    return (
      <StrategistResultsDisplay 
        traditionalAnnotations={analysisData.annotations || []}
        strategistAnalysis={strategistAnalysis}
        userChallenge={userChallenge}
      />
    );
  }

  // ✅ STREAMLINED: Always use enhanced Figma-inspired UI
  console.log('🎨 Enhanced UI Check:', { currentURL: window.location.href });
  
  // Always use enhanced Figma UI for results display
  if (id) {
    // Get stored context for user challenge
    const contextKey = `strategist_context_${id}`;
    const storedContext = localStorage.getItem(contextKey);
    
    return (
      <FigmaInspiredAnalysisLayout 
        analysisData={analysisData || { annotations: [] }}
        strategistAnalysis={strategistAnalysis}
        userChallenge={id ? (storedContext ? JSON.parse(storedContext).userChallenge : undefined) : undefined}
      />
    );
  }

  // ✅ STREAMLINED: Always use modular interface as fallback
  try {
    return <ModularAnalysisInterface />;
  } catch (error) {
    console.error('Modular interface failed, falling back to simple results:', error);
    return <SimpleAnalysisResults onBack={navigateToNewAnalysis} />;
  }
};

export default AnalysisResults;