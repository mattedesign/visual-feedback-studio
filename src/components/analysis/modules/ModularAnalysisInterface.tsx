
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">
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
    <div className="min-h-screen bg-slate-900">
      {/* Header with Navigation */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => window.location.href = '/analysis'}
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Analysis
              </Button>
              <div className="text-white">
                <h1 className="text-xl font-semibold">Analysis Results</h1>
                <p className="text-slate-400 text-sm">
                  {analysisData.analysis_context || 'UX Analysis Results'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={() => window.location.href = `/analysis/${id}`}
              >
                Switch to Classic View
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Module Navigation */}
      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-1">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = currentModule === module.id;
              
              return (
                <button
                  key={module.id}
                  onClick={() => setCurrentModule(module.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{module.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Module Content */}
      <div className="container mx-auto px-4 py-6">
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
