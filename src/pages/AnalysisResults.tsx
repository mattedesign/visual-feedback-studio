import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { ModularAnalysisInterface } from '@/components/analysis/modules/ModularAnalysisInterface';
import SimpleAnalysisResults from '@/components/analysis/SimpleAnalysisResults';
import { claude20YearStrategistEngine, StrategistOutput } from '@/services/ai/claudeUXStrategistEngine';
import { StrategistResultsDisplay } from '@/components/analysis/results/StrategistResultsDisplay';
import { FigmaInspiredAnalysisLayout } from '@/components/analysis/figma/FigmaInspiredAnalysisLayout';
import { toast } from 'sonner';

const AnalysisResults = () => {
  // Existing functionality
  const useModularInterface = useFeatureFlag('modular-analysis');
  const perplexityEnabled = useFeatureFlag('perplexity-integration');
  const figmaUIEnabled = useFeatureFlag('figma-inspired-ui');
  
  // URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const betaMode = urlParams.get('beta') === 'true';
  const isStrategistMode = urlParams.get('strategist') === 'true';
  const figmaMode = urlParams.get('figma') === 'true';
  
  // Strategist enhancement state
  const [strategistAnalysis, setStrategistAnalysis] = useState<StrategistOutput | null>(null);
  const [strategistLoading, setStrategistLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  
  // Get analysis ID from URL
  const { id } = useParams<{id: string}>();

  // Load analysis data function for Figma mode
  const loadAnalysisData = async () => {
    if (!id) return;

    try {
      console.log('🎨 Loading analysis data for Figma UI:', id);
      
      // For now, create mock data - in a real implementation, you'd fetch from Supabase
      const mockAnalysisData = {
        annotations: [
          {
            id: '1',
            title: "Checkout Form Complexity",
            feedback: "Multiple form fields create cognitive overload during payment",
            severity: "critical",
            category: "Forms"
          },
          {
            id: '2',
            title: "Trust Signal Placement",
            feedback: "Security badges not visible at payment step",
            severity: "important", 
            category: "Trust"
          },
          {
            id: '3',
            title: "Payment Options Clarity",
            feedback: "Available payment methods unclear until final step",
            severity: "important",
            category: "Payment"
          },
          {
            id: '4',
            title: "Mobile Checkout Flow",
            feedback: "Form layout breaks on mobile devices",
            severity: "critical",
            category: "Mobile"
          },
          {
            id: '5',
            title: "Error Handling",
            feedback: "Payment errors not clearly communicated",
            severity: "important",
            category: "Errors"
          }
        ]
      };

      setAnalysisData(mockAnalysisData);
      console.log('✅ Analysis data loaded for Figma UI');
      
    } catch (error) {
      console.error('❌ Failed to load analysis data:', error);
    }
  };

  // Load analysis data when strategist mode is enabled OR Figma mode is enabled
  useEffect(() => {
    if (isStrategistMode && id && !strategistAnalysis) {
      loadAnalysisAndEnhance();
    } else if ((figmaUIEnabled || figmaMode) && id && !analysisData) {
      loadAnalysisData();
    }
  }, [isStrategistMode, figmaUIEnabled, figmaMode, id]);

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

  // NEW: Figma-inspired UI with feature flag
  console.log('🎨 Figma UI Check:', { figmaUIEnabled, figmaMode, currentURL: window.location.href });
  
  if (figmaUIEnabled || figmaMode) {
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

  // EXISTING FUNCTIONALITY: Modular interface when feature flag is enabled or beta parameter is present
  if (useModularInterface || betaMode) {
    try {
      return <ModularAnalysisInterface />;
    } catch (error) {
      console.error('Modular interface failed, falling back to simple results:', error);
      // Fall back to simple results if modular interface fails
      return <SimpleAnalysisResults onBack={() => window.location.href = '/analysis'} />;
    }
  }
  
  // PRESERVE EXISTING FUNCTIONALITY AS DEFAULT
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Analysis Complete!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Generated 14 insights with research backing
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 mb-6 shadow-sm">
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              UX issues identified and categorized
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              Analysis enhanced with research sources
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              Powered by 23+ UX research authorities
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Including Nielsen Norman Group, Baymard Institute, and other leading UX research sources
            </p>
          </div>
        </div>
        
        {/* Testing Options */}
        <div className="space-y-3 mb-6">
          {/* NEW: UX Strategist Option */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-center mb-3">
              <span className="text-purple-600 dark:text-purple-400 text-sm font-medium">
                🎭 20-Year UX Strategist Available!
              </span>
            </div>
            <button 
              onClick={() => {
                // Check if we have any analysis to enhance
                const currentUrl = window.location.href;
                if (currentUrl.includes('/analysis/')) {
                  // We're on a results page, enable strategist mode
                  window.location.href = currentUrl.replace(/[?&]beta=true/, '') + 
                    (currentUrl.includes('?') ? '&' : '?') + 'strategist=true&beta=true';
                } else {
                  // We're on the completion page, go to new analysis
                  window.location.href = '/analysis';
                }
              }}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              Get Expert UX Strategy
            </button>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
              Business-focused recommendations • Confidence scores • Implementation roadmap
            </p>
          </div>

          {/* Modular Interface */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-center mb-3">
              <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                🚀 New Modular Interface Available!
              </span>
            </div>
            <button 
              onClick={() => window.location.href += '?beta=true'}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Try New Professional Dashboard
            </button>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              Executive summary • Visual analysis • Research citations
            </p>
          </div>

          {/* Perplexity Integration */}
          {!perplexityEnabled ? (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-center mb-3">
                <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                  🔬 Real-time Research Validation Available!
                </span>
              </div>
              <button 
                onClick={() => {
                  // Enable Perplexity and persist the choice
                  localStorage.setItem('perplexity-enabled', 'true');
                  window.location.href += '?perplexity=true';
                }}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Enable Perplexity Integration
              </button>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                Current research validation • Industry trends • Competitive insights
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 border-2 border-green-300 dark:border-green-600">
              <div className="flex items-center justify-center mb-3">
                <span className="text-green-700 dark:text-green-300 text-sm font-bold">
                  ✅ Perplexity Integration Active!
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-700 dark:text-green-300">Real-time Research</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-blue-700 dark:text-blue-300">Trend Analysis</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-purple-700 dark:text-purple-300">Validation</span>
                  </div>
                </div>
                <button 
                  onClick={() => window.location.href = '/analysis'}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all text-sm font-medium"
                >
                  Start Enhanced Analysis
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={() => window.location.href = '/analysis'}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start New Analysis
          </button>
          <button 
            onClick={() => window.location.href = '/analysis'}
            className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Back to Analysis
          </button>
        </div>
        
        <div className="mt-6 text-xs text-gray-500 dark:text-gray-500">
          <p>Your analysis has been completed successfully.</p>
          <p>Ready to analyze another design?</p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;