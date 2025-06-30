import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BusinessImpactDashboard } from './BusinessImpactDashboard';
import { VisualAnalysisModule } from './VisualAnalysisModule';
import { ResearchCitationsModule } from './ResearchCitationsModule';
import { getAnalysisResults } from '@/services/analysisResultsService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, Eye, BookOpen } from 'lucide-react';

type ModuleType = 'business-impact' | 'visual-analysis' | 'research-citations';

export const ModularAnalysisInterface = () => {
  const { id } = useParams<{ id: string }>();
  const [currentModule, setCurrentModule] = useState<ModuleType>('business-impact');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalysisData = async () => {
      if (!id) {
        setError('No analysis ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Loading analysis data for modular interface:', id);
        
        const data = await getAnalysisResults(id);
        if (data) {
          console.log('Analysis data loaded successfully:', {
            annotationCount: Array.isArray(data.annotations) ? data.annotations.length : 0,
            imageCount: data.images?.length || 0,
            hasEnhancedContext: !!data.enhanced_context,
            hasWellDone: !!data.well_done_data
          });
          setAnalysisData(data);
        } else {
          // Fallback to sessionStorage for temp analyses
          const sessionData = sessionStorage.getItem('currentAnalysisData');
          if (sessionData) {
            console.log('Loading analysis data from session storage');
            setAnalysisData(JSON.parse(sessionData));
          } else {
            setError('Analysis not found');
          }
        }
      } catch (error) {
        console.error('Failed to load analysis data:', error);
        setError('Failed to load analysis data');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalysisData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4 text-lg">
            {error || 'Analysis data not available'}
          </div>
          <Button
            onClick={() => window.location.href = '/analysis'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Analysis
          </Button>
        </div>
      </div>
    );
  }

  const modules = [
    {
      id: 'business-impact' as ModuleType,
      label: 'Business Impact',
      icon: BarChart3,
      description: 'Executive summary and ROI analysis'
    },
    {
      id: 'visual-analysis' as ModuleType,
      label: 'Visual Analysis',
      icon: Eye,
      description: 'Detailed annotations and insights'
    },
    {
      id: 'research-citations' as ModuleType,
      label: 'Research Citations',
      icon: BookOpen,
      description: 'Methodology and sources'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header with Navigation */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                onClick={() => window.location.href = '/analysis'}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Analysis
              </Button>
              <div className="text-gray-900 dark:text-white">
                <h1 className="text-2xl font-bold">Analysis Results</h1>
                <p className="text-gray-600 dark:text-slate-400 text-sm">
                  {analysisData.analysis_context || 'UX Analysis Results'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                onClick={() => window.location.href = `/analysis/${id}`}
              >
                Switch to Classic View
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Module Navigation */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="container mx-auto px-6">
          <nav className="flex space-x-2">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = currentModule === module.id;
              
              return (
                <button
                  key={module.id}
                  onClick={() => setCurrentModule(module.id)}
                  className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-all duration-200 border-b-3 ${
                    isActive
                      ? 'text-blue-600 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-600 dark:text-slate-300 border-transparent hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div>{module.label}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 font-normal">
                      {module.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Module Content */}
      <div className="bg-gray-50 dark:bg-slate-900">
        {currentModule === 'business-impact' && (
          <BusinessImpactDashboard analysisData={analysisData} />
        )}
        
        {currentModule === 'visual-analysis' && (
          <VisualAnalysisModule analysisData={analysisData} />
        )}
        
        {currentModule === 'research-citations' && (
          <ResearchCitationsModule analysisData={analysisData} />
        )}
      </div>
    </div>
  );
};
