
import React, { useState, useEffect } from 'react';
import { BarChart3, Eye, BookOpen, Download, Share, ArrowLeft } from 'lucide-react';
import { BusinessImpactDashboard } from './BusinessImpactDashboard';
import { VisualAnalysisModule } from './VisualAnalysisModule';
import { ResearchCitationsModule } from './ResearchCitationsModule';

// Flexible interface that accommodates various data structures
interface ModularAnalysisInterfaceProps {
  analysisData: any; // Use 'any' for maximum compatibility with existing data
}

export const ModularAnalysisInterface: React.FC<ModularAnalysisInterfaceProps> = ({ analysisData }) => {
  const [activeModule, setActiveModule] = useState('business-impact');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle URL parameter for module selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const moduleParam = urlParams.get('module');
    if (moduleParam && ['business-impact', 'visual-analysis', 'research-citations'].includes(moduleParam)) {
      setActiveModule(moduleParam);
    }
  }, []);

  // Safety check for analysis data
  if (!analysisData) {
    return (
      <div className="modular-analysis-interface flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Analysis Data Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please go back and run an analysis first.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const modules = [
    {
      id: 'business-impact',
      name: 'Business Impact',
      icon: BarChart3,
      description: 'Executive summary with ROI and timeline',
      component: BusinessImpactDashboard
    },
    {
      id: 'visual-analysis',
      name: 'Visual Analysis',
      icon: Eye,
      description: 'Detailed annotation review',
      component: VisualAnalysisModule
    },
    {
      id: 'research-citations',
      name: 'Research Citations',
      icon: BookOpen,
      description: 'Research backing and methodology',
      component: ResearchCitationsModule
    }
  ];

  const activeModuleData = modules.find(m => m.id === activeModule);
  const ActiveComponent = activeModuleData?.component;

  const handleModuleChange = (moduleId: string) => {
    setActiveModule(moduleId);
    // Update URL without page reload
    const newParams = new URLSearchParams(window.location.search);
    newParams.set('module', moduleId);
    window.history.replaceState(null, '', `${window.location.pathname}?${newParams.toString()}`);
  };

  const handleExport = () => {
    // Placeholder for export functionality
    console.log('Export functionality - to be implemented');
  };

  const handleShare = () => {
    // Placeholder for share functionality
    if (navigator.share) {
      navigator.share({
        title: 'UX Analysis Results',
        text: 'Check out these UX analysis results',
        url: window.location.href
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Safely extract metadata with fallbacks
  const getAnalysisMetadata = () => {
    return {
      status: analysisData?.analysisStatus || analysisData?.status || 'completed',
      imageCount: analysisData?.images?.length || 0,
      annotationCount: analysisData?.annotations?.length || 0,
      knowledgeSourcesUsed: analysisData?.enhancedContext?.knowledgeSourcesUsed || 0,
      createdAt: analysisData?.createdAt || analysisData?.created_at || new Date().toISOString(),
      analysisContext: analysisData?.analysisContext || analysisData?.context || ''
    };
  };

  const metadata = getAnalysisMetadata();

  return (
    <div className="modular-analysis-interface min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Breadcrumb and Title */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  // Remove beta parameter and go back to standard interface
                  const newParams = new URLSearchParams(window.location.search);
                  newParams.delete('beta');
                  newParams.delete('module');
                  window.location.href = `${window.location.pathname}?${newParams.toString()}`;
                }}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Standard View</span>
              </button>
              <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-slate-600"></div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Analysis Results
                </h1>
                {metadata.analysisContext && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {metadata.analysisContext}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Share className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Mobile Module Selector */}
        {isMobile && (
          <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-4">
            <select
              value={activeModule}
              onChange={(e) => handleModuleChange(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.name} - {module.description}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Desktop Layout */}
        {!isMobile && (
          <div className="flex">
            {/* Left Sidebar - Module Navigation */}
            <div className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 min-h-screen">
              <div className="p-6">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                  Analysis Modules
                </h2>
                <nav className="space-y-2">
                  {modules.map((module) => {
                    const Icon = module.icon;
                    const isActive = activeModule === module.id;
                    
                    return (
                      <button
                        key={module.id}
                        onClick={() => handleModuleChange(module.id)}
                        className={`w-full flex items-start gap-3 px-3 py-3 text-left rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 transition-colors ${
                          isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <div className={`font-medium transition-colors ${
                            isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'
                          }`}>
                            {module.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {module.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </nav>

                {/* Analysis Info */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Analysis Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Status:</span>
                      <span className="ml-2 text-gray-900 dark:text-white capitalize">
                        {metadata.status}
                      </span>
                    </div>
                    {metadata.imageCount > 0 && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Images:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {metadata.imageCount}
                        </span>
                      </div>
                    )}
                    {metadata.annotationCount > 0 && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Issues:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {metadata.annotationCount}
                        </span>
                      </div>
                    )}
                    {metadata.knowledgeSourcesUsed > 0 && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Research Sources:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {metadata.knowledgeSourcesUsed}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Created:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {new Date(metadata.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden">
              {ActiveComponent && (
                <div className="h-full">
                  <ActiveComponent analysisData={analysisData} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Content */}
        {isMobile && ActiveComponent && (
          <div className="min-h-screen">
            <ActiveComponent analysisData={analysisData} />
          </div>
        )}
      </div>
    </div>
  );
};
