import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { ModularAnalysisInterface } from '@/components/analysis/modules/ModularAnalysisInterface';
import SimpleAnalysisResults from '@/components/analysis/SimpleAnalysisResults';
import { claude20YearStrategistEngine, StrategistOutput } from '@/services/ai/claudeUXStrategistEngine';
import { StrategistResultsDisplay } from '@/components/analysis/results/StrategistResultsDisplay';
import { FigmaInspiredAnalysisLayout } from '@/components/analysis/figma/FigmaInspiredAnalysisLayout';
import { AnalysisResults as EnhancedAnalysisResults } from '@/components/analysis/AnalysisResults';
import { getAnalysisResults } from '@/services/analysisResultsService';
import { getFigmantResults } from '@/services/figmantAnalysisService';
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
  window.location.href = '/analyze';
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
      console.log('🎨 Loading Figmant analysis data for enhanced UI:', id);
      
      // Fetch real analysis results from Figmant tables
      const figmantResult = await getFigmantResults(id);
      
      if (!figmantResult) {
        console.warn('❌ No Figmant analysis results found for ID:', id);
        toast.error('Analysis results not found');
        return;
      }

      console.log('📊 Raw Figmant result:', figmantResult);

      // Transform the Figmant data to match the enhanced UI format
      const claudeAnalysis = figmantResult.claude_analysis as any;
      
      // Extract annotations from Claude analysis
      let annotations: any[] = [];
      
      if (claudeAnalysis?.criticalIssues) {
        annotations.push(...claudeAnalysis.criticalIssues.map((issue: any, index: number) => ({
          id: `critical-${index}`,
          title: issue.title || issue.issue || 'Critical Issue',
          feedback: issue.description || issue.impact || 'Critical issue identified',
          severity: 'critical',
          category: issue.category || 'Critical'
        })));
      }
      
      if (claudeAnalysis?.recommendations) {
        annotations.push(...claudeAnalysis.recommendations.map((rec: any, index: number) => ({
          id: `recommendation-${index}`,
          title: rec.title || 'Recommendation',
          feedback: rec.description || 'Improvement recommendation',
          severity: rec.effort === 'Low' ? 'low' : rec.effort === 'High' ? 'high' : 'medium',
          category: rec.category || 'Improvement'
        })));
      }

      const transformedData = {
        annotations,
        images: [], // Figmant doesn't store images in results yet
        totalAnnotations: annotations.length,
        processingTime: figmantResult.processing_time_ms,
        aiModel: figmantResult.ai_model_used || 'claude-sonnet-4',
        createdAt: figmantResult.created_at,
        executiveSummary: claudeAnalysis?.executiveSummary,
        overallScore: claudeAnalysis?.overallScore
      };

      setAnalysisData(transformedData);
      console.log('✅ Figmant analysis data loaded for enhanced UI:', {
        annotationCount: transformedData.annotations.length,
        totalAnnotations: transformedData.totalAnnotations,
        overallScore: transformedData.overallScore
      });
      
    } catch (error) {
      console.error('❌ Failed to load Figmant analysis data:', error);
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

  // Transform Figmant data to enhanced format for rich UI
  const transformToEnhancedFormat = (figmantResult: any) => {
    const claudeAnalysis = figmantResult.claude_analysis as any;
    const enhancedIssues: any[] = [];
    
    // Transform critical issues
    if (claudeAnalysis?.criticalIssues) {
      claudeAnalysis.criticalIssues.forEach((issue: any, index: number) => {
        enhancedIssues.push({
          id: `critical-${index}`,
          title: issue.title || issue.issue || 'Critical Issue',
          description: issue.description || issue.impact || 'Critical issue identified',
          category: issue.category?.toLowerCase() || 'usability',
          severity: 'critical',
          confidence: 0.9, // High confidence for critical issues
          impact_scope: 'task-completion',
          element: {
            location: {
              x: Math.random() * 800,
              y: Math.random() * 600,
              width: 100,
              height: 50,
              xPercent: Math.random() * 80 + 10,
              yPercent: Math.random() * 70 + 10,
              widthPercent: 15,
              heightPercent: 8
            }
          },
          implementation: {
            effort: issue.effort === 'Low' ? 'hours' : issue.effort === 'High' ? 'days' : 'hours',
            rationale: issue.reasoning || 'Critical issue affecting user experience',
            design_guidance: issue.solution || 'Immediate attention required'
          },
          business_impact: {
            roi_score: 8,
            priority_level: 'critical',
            quick_win: issue.effort === 'Low'
          }
        });
      });
    }
    
    // Transform recommendations
    if (claudeAnalysis?.recommendations) {
      claudeAnalysis.recommendations.forEach((rec: any, index: number) => {
        enhancedIssues.push({
          id: `recommendation-${index}`,
          title: rec.title || 'Improvement Recommendation',
          description: rec.description || 'Improvement opportunity identified',
          category: rec.category?.toLowerCase() || 'improvement',
          severity: rec.effort === 'Low' ? 'improvement' : rec.effort === 'High' ? 'warning' : 'improvement',
          confidence: 0.75,
          impact_scope: 'aesthetic',
          element: {
            location: {
              x: Math.random() * 800,
              y: Math.random() * 600,
              width: 120,
              height: 60,
              xPercent: Math.random() * 80 + 10,
              yPercent: Math.random() * 70 + 10,
              widthPercent: 18,
              heightPercent: 10
            }
          },
          implementation: {
            effort: rec.effort === 'Low' ? 'minutes' : rec.effort === 'High' ? 'days' : 'hours',
            rationale: rec.reasoning || 'Enhancement opportunity for better user experience',
            design_guidance: rec.solution || 'Consider implementing this improvement',
            code_snippet: rec.effort === 'Low' ? `// Quick fix example\n.element {\n  /* improvement */\n}` : undefined
          },
          business_impact: {
            roi_score: rec.effort === 'Low' ? 7 : 5,
            priority_level: rec.effort === 'Low' ? 'high' : 'medium',
            quick_win: rec.effort === 'Low'
          }
        });
      });
    }
    
    return {
      imageUrl: '/placeholder-design.png', // Default placeholder - in real app, this would come from Figmant
      issues: enhancedIssues,
      analysisMetadata: {
        processingTime: figmantResult.processing_time_ms,
        confidence: 0.85,
        totalIssues: enhancedIssues.length
      }
    };
  };

  // Enhanced data loading with rich format transformation
  const loadEnhancedAnalysisData = async () => {
    if (!id) return;

    try {
      console.log('🎨 Loading enhanced analysis data:', id);
      
      const figmantResult = await getFigmantResults(id);
      
      if (!figmantResult) {
        console.warn('❌ No Figmant analysis results found for ID:', id);
        toast.error('Analysis results not found');
        return;
      }

      console.log('📊 Raw Figmant result:', figmantResult);
      
      // Transform to enhanced format
      const enhancedData = transformToEnhancedFormat(figmantResult);
      setAnalysisData(enhancedData);
      
      console.log('✅ Enhanced analysis data loaded:', {
        issueCount: enhancedData.issues.length,
        hasMetadata: !!enhancedData.analysisMetadata
      });
      
    } catch (error) {
      console.error('❌ Failed to load enhanced analysis data:', error);
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

  // Check for enhanced UI usage
  const shouldUseEnhancedUI = id && analysisData && analysisData.issues && analysisData.issues.length > 0;

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

  // ENHANCED UI: Rich Analysis Results
  if (shouldUseEnhancedUI && analysisData.issues) {
    console.log('🎨 Using Enhanced Analysis Results UI');
    return (
      <EnhancedAnalysisResults
        imageUrl={analysisData.imageUrl || '/placeholder-design.png'}
        issues={analysisData.issues}
        analysisMetadata={analysisData.analysisMetadata}
        onBack={() => window.history.back()}
      />
    );
  }

  // ✅ STREAMLINED: Always use enhanced Figma-inspired UI for fallback
  console.log('🎨 Enhanced UI Check:', { currentURL: window.location.href });
  
  // Always use enhanced Figma UI for results display
  if (id) {
    // Load enhanced data if not already loaded
    if (!analysisData) {
      loadEnhancedAnalysisData();
    }
    
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
