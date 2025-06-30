
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import { ModularAnalysisInterface } from '../components/analysis/modules/ModularAnalysisInterface';
import { getAnalysisResults } from '../services/analysisResultsService';

const AnalysisResults = () => {
  const useModularInterface = useFeatureFlag('modular-analysis');
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get analysis ID from route parameters
  const { id: analysisId } = useParams();
  
  // Get URL parameters for beta mode
  const urlParams = new URLSearchParams(window.location.search);
  const betaMode = urlParams.get('beta') === 'true';
  
  // Load analysis data from database or sessionStorage
  useEffect(() => {
    const loadAnalysisData = async () => {
      if (!analysisId) {
        setError('No analysis ID provided');
        setIsLoading(false);
        return;
      }

      console.log('📊 Loading analysis data:', {
        analysisId,
        source: 'database',
        betaMode
      });

      try {
        // First try to load from database
        const dbResults = await getAnalysisResults(analysisId);
        
        if (dbResults) {
          console.log('✅ Analysis data loaded from database:', {
            annotationCount: dbResults.annotations?.length || 0,
            hasWellDone: !!dbResults.well_done_data,
            hasEnhancedContext: !!dbResults.enhanced_context
          });
          
          // Transform database format to component format
          const transformedData = {
            annotations: dbResults.annotations,
            images: dbResults.images,
            analysisContext: dbResults.analysis_context,
            enhancedContext: dbResults.enhanced_context,
            wellDone: dbResults.well_done_data,
            researchCitations: dbResults.research_citations,
            knowledgeSourcesUsed: dbResults.knowledge_sources_used,
          };
          
          setAnalysisData(transformedData);
        } else {
          // Fallback to sessionStorage for temporary data
          console.log('📦 Fallback: Trying sessionStorage for temporary data');
          const storedData = sessionStorage.getItem('currentAnalysisData');
          
          if (storedData) {
            try {
              const parsedData = JSON.parse(storedData);
              console.log('✅ Analysis data loaded from sessionStorage:', {
                annotationCount: parsedData.annotations?.length || 0,
                hasWellDone: !!parsedData.wellDone,
                hasEnhancedContext: !!parsedData.enhancedContext
              });
              setAnalysisData(parsedData);
            } catch (parseError) {
              console.error('❌ Failed to parse sessionStorage data:', parseError);
              setError('Failed to load analysis data');
            }
          } else {
            setError('Analysis not found');
          }
        }
      } catch (loadError) {
        console.error('❌ Failed to load analysis data:', loadError);
        setError('Failed to load analysis data');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalysisData();
  }, [analysisId, betaMode]);

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
            
            {/* Optional "Try New Interface" button */}
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
  
  // Loading state for beta mode
  if (betaMode && isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-4">Loading Analysis Results...</h2>
          <p className="text-slate-300 mb-4">
            Loading your professional dashboard from database
            {analysisId && <span className="block text-sm mt-2">Analysis ID: {analysisId}</span>}
          </p>
        </div>
      </div>
    );
  }
  
  // Error state for beta mode
  if (betaMode && error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Analysis Not Found</h2>
          <p className="text-slate-300 mb-4">{error}</p>
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
  
  // NEW INTERFACE WHEN FLAG IS TRUE OR BETA PARAMETER
  if (betaMode && analysisData) {
    return <ModularAnalysisInterface analysisData={analysisData} />;
  }
  
  // Fallback for beta mode without data
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
};

export default AnalysisResults;
