import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BusinessImpactDashboard } from './BusinessImpactDashboard';
import { VisualAnalysisModule } from './VisualAnalysisModule';
import { ResearchCitationsModule } from './ResearchCitationsModule';
import { getAnalysisResults } from '@/services/analysisResultsService';
import { vectorKnowledgeService } from '@/services/knowledgeBase/vectorService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { Eye, BookOpen, BarChart3 } from 'lucide-react';

type ModuleType = 'ux-insights' | 'research-backing' | 'business-case';

export const ModularAnalysisInterface = () => {
  const { id } = useParams<{ id: string }>();
  console.log('🎯 ModularAnalysisInterface - URL Analysis ID:', id);
  console.log('🎯 ModularAnalysisInterface - Current URL:', window.location.href);
  const [currentModule, setCurrentModule] = useState<ModuleType>('ux-insights');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [knowledgeBaseCount, setKnowledgeBaseCount] = useState<number>(274); // Default fallback

  useEffect(() => {
    const loadKnowledgeBaseStats = async () => {
      try {
        const stats = await vectorKnowledgeService.getKnowledgeStats();
        if (stats && stats.totalEntries) {
          setKnowledgeBaseCount(stats.totalEntries);
          console.log('Updated knowledge base count:', stats.totalEntries);
        }
      } catch (error) {
        console.warn('Could not fetch knowledge base stats, using fallback count:', error);
        // Keep the fallback value of 274
      }
    };

    loadKnowledgeBaseStats();
  }, []);

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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <BreadcrumbNavigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 mb-4 text-lg">
              {error || 'Analysis data not available'}
            </div>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const modules = [
    {
      id: 'ux-insights' as ModuleType,
      label: 'UX Insights',
      icon: Eye,
      description: 'Visual annotations and usability findings'
    },
    {
      id: 'research-backing' as ModuleType,
      label: 'Research Backing',
      icon: BookOpen,
      description: `Academic sources and methodology (${knowledgeBaseCount} research entries)`
    },
    {
      id: 'business-case' as ModuleType,
      label: 'Business Case',
      icon: BarChart3,
      description: 'ROI projections and implementation timeline'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation />

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="text-gray-900 dark:text-white">
              <h1 className="text-2xl font-bold">Analysis Results</h1>
              <p className="text-gray-600 dark:text-slate-400 text-sm">
                {analysisData.analysis_context || 'UX Analysis Results'}
              </p>
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
        {currentModule === 'ux-insights' && (
          <VisualAnalysisModule analysisData={analysisData} />
        )}
        
        {currentModule === 'research-backing' && (
          <ResearchCitationsModule analysisData={analysisData} />
        )}
        
        {currentModule === 'business-case' && (
          <BusinessImpactDashboard analysisData={analysisData} />
        )}
      </div>
    </div>
  );
};
