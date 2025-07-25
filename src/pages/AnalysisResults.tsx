
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

  // 🔧 FIX: Enhanced data transformation function with debugging
  const transformToEnhancedFormat = (figmantResult: any) => {
    console.log('🔄 TRANSFORM (AnalysisResults.tsx): Starting enhanced data transformation');
    console.log('📊 Raw figmant result structure:', {
      hasClaudeAnalysis: !!(figmantResult?.claude_analysis),
      claudeAnalysisKeys: figmantResult?.claude_analysis ? Object.keys(figmantResult.claude_analysis) : [],
      fullStructure: figmantResult
    });
    
    const claudeAnalysis = figmantResult.claude_analysis as any;
    
    if (!claudeAnalysis) {
      console.warn('❌ No Claude analysis found in Figmant result');
      return null;
    }

    const enhancedIssues: any[] = [];
    const enhancedSuggestions: any[] = [];
    
    console.log('🔍 Claude Analysis Structure Check:', {
      hasClaudeAnalysis: !!claudeAnalysis,
      claudeAnalysisKeys: claudeAnalysis ? Object.keys(claudeAnalysis) : 'none',
      hasIssues: !!claudeAnalysis?.issues,
      issuesIsArray: Array.isArray(claudeAnalysis?.issues),
      issuesLength: claudeAnalysis?.issues?.length || 0,
      issuesData: claudeAnalysis?.issues
    });
    
    // 🔧 NEW FORMAT: Handle the new mentor analysis format
    if (claudeAnalysis?.issues && Array.isArray(claudeAnalysis.issues)) {
      console.log('🔍 Processing new format issues:', claudeAnalysis.issues.length, 'items');
      claudeAnalysis.issues.forEach((issue: any, index: number) => {
        // Add as issue
        enhancedIssues.push({
          id: issue.id || `issue-${index}`,
          title: issue.description || 'Analysis Suggestion',
          description: issue.suggested_fix || issue.impact || 'Improvement opportunity identified',
          category: issue.category?.toLowerCase() || 'usability',
          severity: issue.severity || 'improvement',
          confidence: issue.confidence || 0.8,
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
            effort: issue.level === 'suggestion' ? 'hours' : 'days',
            rationale: issue.impact || 'Improvement opportunity',
            design_guidance: issue.suggested_fix || 'Apply suggested improvements'
          },
          business_impact: {
            roi_score: issue.severity === 'critical' ? 9 : issue.severity === 'warning' ? 7 : 5,
            priority_level: issue.severity,
            quick_win: issue.level === 'suggestion'
          }
        });
        
        // Add as suggestion too
        enhancedSuggestions.push({
          id: `suggestion-${index}`,
          title: issue.description || 'Improvement Suggestion',
          description: issue.suggested_fix || issue.impact || 'Consider this improvement',
          impact: issue.severity === 'critical' ? 'High' : issue.severity === 'warning' ? 'Medium' : 'Low',
          effort: issue.level === 'suggestion' ? 'Low' : 'Medium',
          category: 'improvement'
        });
      });
    }
    
    // Handle mentor analysis alternatives as suggestions
    if (claudeAnalysis?.mentor_analysis?.visual_alternatives && Array.isArray(claudeAnalysis.mentor_analysis.visual_alternatives)) {
      console.log('🔍 Processing visual alternatives:', claudeAnalysis.mentor_analysis.visual_alternatives.length, 'items');
      claudeAnalysis.mentor_analysis.visual_alternatives.forEach((alt: any, index: number) => {
        enhancedSuggestions.push({
          id: `alternative-${index}`,
          title: alt.title || 'Visual Alternative',
          description: alt.description || 'Alternative design approach',
          impact: 'High',
          effort: 'Medium',
          category: 'design-pattern',
          company_example: alt.company_example,
          why_it_works: alt.why_it_works
        });
      });
    }
    
    // LEGACY FORMAT: Handle old format for backward compatibility
    if (claudeAnalysis?.criticalIssues && Array.isArray(claudeAnalysis.criticalIssues)) {
      console.log('🔍 Processing legacy criticalIssues:', claudeAnalysis.criticalIssues.length, 'items');
      claudeAnalysis.criticalIssues.forEach((issue: any, index: number) => {
        // Add as issue
        enhancedIssues.push({
          id: `critical-${index}`,
          title: issue.title || issue.issue || 'Critical Issue',
          description: issue.description || issue.impact || 'Critical issue identified',
          category: issue.category?.toLowerCase() || 'usability',
          severity: 'critical',
          confidence: 0.9,
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
            effort: issue.effort === 'Low' ? 'minutes' : issue.effort === 'High' ? 'days' : 'hours',
            rationale: issue.reasoning || 'Critical issue affecting user experience',
            design_guidance: issue.solution || 'Immediate attention required'
          },
          business_impact: {
            roi_score: 8,
            priority_level: 'critical',
            quick_win: issue.effort === 'Low'
          }
        });
        
        // Add as suggestion too
        enhancedSuggestions.push({
          id: `critical-suggestion-${index}`,
          title: `Fix: ${issue.title || issue.issue || 'Critical Issue'}`,
          description: issue.solution || issue.reasoning || 'Critical fix needed immediately',
          impact: 'Critical',
          effort: issue.effort || 'High',
          category: 'critical-fix'
        });
      });
    }
    
    // Process legacy recommendations as suggestions
    if (claudeAnalysis?.recommendations && Array.isArray(claudeAnalysis.recommendations)) {
      console.log('🔍 Processing legacy recommendations:', claudeAnalysis.recommendations.length, 'items');
      claudeAnalysis.recommendations.forEach((rec: any, index: number) => {
        // Add as issue
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
        
        // Add as suggestion
        enhancedSuggestions.push({
          id: `recommendation-suggestion-${index}`,
          title: rec.title || 'Design Recommendation',
          description: rec.description || rec.solution || 'Recommended improvement',
          impact: rec.effort === 'Low' ? 'High' : 'Medium',
          effort: rec.effort || 'Medium',
          category: 'improvement'
        });
      });
    }
    
    const transformedData = {
      imageUrl: '/placeholder-design.png',
      images: [{ 
        id: 'default', 
        url: '/placeholder-design.png',
        fileName: 'Analysis Image'
      }],
      issues: enhancedIssues,
      suggestions: enhancedSuggestions,
      analysisMetadata: {
        processingTime: figmantResult.processing_time_ms,
        confidence: 0.85,
        totalIssues: enhancedIssues.length
      }
    };

    console.log('✅ TRANSFORM (AnalysisResults.tsx): Enhanced data transformation complete:', {
      issueCount: enhancedIssues.length,
      suggestionCount: enhancedSuggestions.length,
      hasMetadata: !!transformedData.analysisMetadata,
      imageUrl: transformedData.imageUrl,
      suggestions: enhancedSuggestions
    });

    return transformedData;
  };

  // 🔧 FIX: Improved data loading with proper transformation
  const loadEnhancedAnalysisData = async () => {
    if (!id) return;

    try {
      console.log('🎨 ENHANCED: Loading enhanced analysis data for ID:', id);
      
      const figmantResult = await getFigmantResults(id);
      
      if (!figmantResult) {
        console.warn('❌ No Figmant analysis results found for ID:', id);
        toast.error('Analysis results not found');
        return;
      }

      console.log('📊 ENHANCED: Raw Figmant result loaded:', figmantResult);
      
      // Transform to enhanced format
      const enhancedData = transformToEnhancedFormat(figmantResult);
      
      if (!enhancedData) {
        console.warn('❌ ENHANCED: Failed to transform data to enhanced format');
        toast.error('Failed to process analysis data');
        return;
      }

      setAnalysisData(enhancedData);
      
      console.log('✅ ENHANCED: Enhanced analysis data loaded successfully:', {
        issueCount: enhancedData.issues.length,
        hasMetadata: !!enhancedData.analysisMetadata,
        shouldUseEnhancedUI: true
      });
      
    } catch (error) {
      console.error('❌ ENHANCED: Failed to load enhanced analysis data:', error);
      toast.error('Failed to load analysis data');
    }
  };

  // 🔧 FIX: Simplified legacy data loading for backward compatibility
  const loadLegacyAnalysisData = async () => {
    if (!id) return;

    try {
      console.log('📊 LEGACY: Loading legacy analysis data for ID:', id);
      
      const figmantResult = await getFigmantResults(id);
      
      if (!figmantResult) {
        console.warn('❌ No Figmant analysis results found for ID:', id);
        toast.error('Analysis results not found');
        return;
      }

      console.log('📊 LEGACY: Raw Figmant result:', figmantResult);

      const claudeAnalysis = figmantResult.claude_analysis as any;
      
      // Extract annotations from Claude analysis for legacy format
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

      const legacyData = {
        annotations,
        images: [],
        totalAnnotations: annotations.length,
        processingTime: figmantResult.processing_time_ms,
        aiModel: figmantResult.ai_model_used || 'claude-sonnet-4',
        createdAt: figmantResult.created_at,
        executiveSummary: claudeAnalysis?.executiveSummary,
        overallScore: claudeAnalysis?.overallScore
      };

      setAnalysisData(legacyData);
      console.log('✅ LEGACY: Legacy analysis data loaded:', {
        annotationCount: legacyData.annotations.length,
        totalAnnotations: legacyData.totalAnnotations
      });
      
    } catch (error) {
      console.error('❌ LEGACY: Failed to load legacy analysis data:', error);
      toast.error('Failed to load analysis data');
    }
  };

  // ✅ STREAMLINED: Load analysis data on mount or when strategist mode is enabled
  useEffect(() => {
    if (isStrategistMode && id && !strategistAnalysis) {
      loadAnalysisAndEnhance();
    } else if (id && !analysisData) {
      // 🔧 FIX: Load figmant data directly and let routing logic decide UI
      loadFigmantAnalysisData();
    }
  }, [isStrategistMode, id]);

  // 🔧 NEW: Direct figmant data loading that preserves original structure
  const loadFigmantAnalysisData = async () => {
    if (!id) return;

    try {
      console.log('🎨 FIGMANT: Loading figmant analysis data for ID:', id);
      
      const figmantResult = await getFigmantResults(id);
      
      if (!figmantResult) {
        console.warn('❌ No Figmant analysis results found for ID:', id);
        toast.error('Analysis results not found');
        return;
      }

      console.log('📊 FIGMANT: Raw Figmant result loaded:', figmantResult);
      
      // Set the raw figmant data - routing logic will determine which UI to use
      setAnalysisData(figmantResult);
      
      console.log('✅ FIGMANT: Figmant analysis data loaded successfully');
      
    } catch (error) {
      console.error('❌ FIGMANT: Failed to load figmant analysis data:', error);
      toast.error('Failed to load analysis data');
    }
  };

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

  // 🔧 FIX: Updated condition to properly detect enhanced UI usage for both traditional and figmant analysis
  const shouldUseEnhancedUI = (analysisData && analysisData.issues && Array.isArray(analysisData.issues) && analysisData.issues.length > 0) ||
    (analysisData && analysisData.claude_analysis && analysisData.claude_analysis.issues && Array.isArray(analysisData.claude_analysis.issues) && analysisData.claude_analysis.issues.length > 0);

  console.log('🎨 UI DECISION (AnalysisResults.tsx): Enhanced UI check:', {
    hasAnalysisData: !!analysisData,
    hasIssues: !!(analysisData?.issues),
    isIssuesArray: Array.isArray(analysisData?.issues),
    issueCount: analysisData?.issues?.length || 0,
    suggestionCount: analysisData?.suggestions?.length || 0,
    shouldUseEnhancedUI,
    currentURL: window.location.href
  });

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

  // 🔧 FIX: FIGMANT DATA - Use Figma layout for figmant analysis results
  if (id && analysisData && (analysisData.claude_analysis || analysisData.annotations)) {
    console.log('📊 UI DECISION: Using Figma-inspired layout with visual recommendations');
    
    const contextKey = `strategist_context_${id}`;
    const storedContext = localStorage.getItem(contextKey);
    
    // Transform figmant data to expected format for visual recommendations
    let formattedAnalysisData = analysisData;
    
    if (analysisData.claude_analysis && !analysisData.annotations) {
      console.log('🔄 Transforming figmant data for visual recommendations');
      
      const claudeAnalysis = analysisData.claude_analysis;
      let annotations: any[] = [];
      
      // Transform issues to annotations
      if (claudeAnalysis?.issues && Array.isArray(claudeAnalysis.issues)) {
        annotations.push(...claudeAnalysis.issues.map((issue: any, index: number) => ({
          id: issue.id || `issue-${index}`,
          title: issue.description || 'Analysis Issue',
          feedback: issue.suggested_fix || issue.impact || 'Improvement opportunity identified',
          severity: issue.severity || 'improvement',
          category: issue.category || 'usability'
        })));
      }
      
      // Transform legacy formats
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
          severity: rec.effort === 'Low' ? 'low' : rec.effort === 'High' ? 'important' : 'medium',
          category: rec.category || 'Improvement'
        })));
      }
      
      formattedAnalysisData = {
        ...analysisData,
        id: id,
        annotations,
        totalAnnotations: annotations.length,
        processingTime: analysisData.processing_time_ms,
        aiModel: analysisData.ai_model_used || 'claude-sonnet-4',
        createdAt: analysisData.created_at
      };
      
      console.log('✅ Transformed figmant data:', {
        annotationCount: annotations.length,
        totalAnnotations: formattedAnalysisData.totalAnnotations
      });
    }
    
    return (
      <FigmaInspiredAnalysisLayout 
        analysisData={formattedAnalysisData}
        strategistAnalysis={strategistAnalysis}
        userChallenge={id ? (storedContext ? JSON.parse(storedContext).userChallenge : undefined) : undefined}
      />
    );
  }

  // FIGMA LAYOUT: Enhanced Figma-inspired UI for results display (SECONDARY PATH)
  if (id && analysisData) {
    console.log('📊 UI DECISION: Using Figma-inspired layout (legacy compatibility)');
    
    const contextKey = `strategist_context_${id}`;
    const storedContext = localStorage.getItem(contextKey);
    
    return (
      <FigmaInspiredAnalysisLayout 
        analysisData={analysisData}
        strategistAnalysis={strategistAnalysis}
        userChallenge={id ? (storedContext ? JSON.parse(storedContext).userChallenge : undefined) : undefined}
      />
    );
  }

  // LOADING STATE: Show loading while data is being fetched
  if (id && !analysisData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Analysis Results...</h2>
          <p className="text-muted-foreground">Retrieving your design analysis</p>
        </div>
      </div>
    );
  }

  // ✅ STREAMLINED: Always use modular interface as fallback
  try {
    return <ModularAnalysisInterface />;
  } catch (error) {
    console.error('Modular interface failed, falling back to simple results:', error);
    return <SimpleAnalysisResults onBack={navigateToNewAnalysis} analysisId={id} />;
  }
};

export default AnalysisResults;
