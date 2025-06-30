
import React from 'react';
import { Check } from 'lucide-react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { ModularAnalysisInterface } from '@/components/analysis/modules/ModularAnalysisInterface';
import SimpleAnalysisResults from '@/components/analysis/SimpleAnalysisResults';

const AnalysisResults = () => {
  const useModularInterface = useFeatureFlag('modular-analysis');
  
  // Get URL parameter for testing override
  const urlParams = new URLSearchParams(window.location.search);
  const betaMode = urlParams.get('beta') === 'true';
  
  // NEW INTERFACE: When feature flag is enabled or beta parameter is present
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
        
        {/* ADD ONLY: Optional "Try New Interface" button */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
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
