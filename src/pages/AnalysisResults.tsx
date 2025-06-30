
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import { ModularAnalysisInterface } from '../components/analysis/modules/ModularAnalysisInterface';

const AnalysisResults = () => {
  const useModularInterface = useFeatureFlag('modular-analysis');
  const [analysisData, setAnalysisData] = useState(null);
  
  // FIXED: Get analysis ID from route parameters instead of query parameters
  const { id: analysisId } = useParams();
  
  // Get URL parameters for beta mode only
  const urlParams = new URLSearchParams(window.location.search);
  const betaMode = urlParams.get('beta') === 'true';
  
  // Load analysis data from sessionStorage on component mount
  useEffect(() => {
    if (betaMode && analysisId) {
      const storedData = sessionStorage.getItem('currentAnalysisData');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          console.log('📊 Loading analysis data for modular interface:', {
            analysisId,
            annotationCount: parsedData.annotations?.length || 0,
            hasWellDone: !!parsedData.wellDone,
            hasEnhancedContext: !!parsedData.enhancedContext,
            routeStructure: 'CORRECT - ID from route params'
          });
          setAnalysisData(parsedData);
        } catch (error) {
          console.error('❌ Failed to parse stored analysis data:', error);
        }
      }
    }
  }, [betaMode, analysisId]);

  // PRESERVE EXISTING FUNCTIONALITY AS DEFAULT
  if (!useModularInterface && !betaMode) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Analysis Results
            </h1>
            
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="text-lg">✅ Analysis completed successfully!</p>
              <p>Results display temporarily simplified to fix rendering issues.</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This is a minimal safe version while we debug the React Error #300.
              </p>
            </div>
            
            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => window.location.href = '/analysis'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Back to Analysis
              </button>
              
              <button 
                onClick={() => window.location.reload()}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Refresh Page
              </button>
            </div>
            
            {/* ADD ONLY: Optional "Try New Interface" button */}
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                🚀 Try our new professional interface!
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Experience our enhanced modular analysis dashboard with business impact insights.
              </p>
              <button 
                onClick={() => window.location.href += '?beta=true'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              >
                Try New Interface
              </button>
            </div>
            
            <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                Debug Information
              </h3>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Page rendered without crashing</li>
                <li>• Routing to results page works</li>
                <li>• Navigation buttons functional</li>
                <li>• Ready for gradual feature restoration</li>
                {analysisId && <li>• Analysis ID from route: {analysisId}</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // NEW INTERFACE WHEN FLAG IS TRUE OR BETA PARAMETER
  if (betaMode && analysisData) {
    return <ModularAnalysisInterface analysisData={analysisData} />;
  }
  
  // Fallback for beta mode without data
  if (betaMode && !analysisData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Loading Analysis Results...</h2>
          <p className="text-slate-300 mb-4">
            Preparing your professional dashboard
            {analysisId && <span className="block text-sm mt-2">Analysis ID: {analysisId}</span>}
          </p>
          <button 
            onClick={() => window.location.href = '/analysis'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Analysis
          </button>
        </div>
      </div>
    );
  }
  
  return <ModularAnalysisInterface analysisData={analysisData} />;
};

export default AnalysisResults;
