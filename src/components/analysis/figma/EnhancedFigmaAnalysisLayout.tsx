import React, { useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Download, 
  Share2, 
  Filter, 
  Grid3X3, 
  List, 
  ChevronLeft,
  BarChart3,
  FileText,
  Target,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Brain
} from 'lucide-react';
import { StrategistOutput } from '@/services/ai/claudeUXStrategistEngine';
import { usePrototypeGeneration } from '@/hooks/usePrototypeGeneration';

interface AnalysisData {
  id?: string;
  annotations: Array<{
    id: string;
    title: string;
    feedback: string;
    severity: string;
    category: string;
  }>;
  images?: string[];
  totalAnnotations?: number;
  processingTime?: number;
  knowledgeSourcesUsed?: number;
  aiModel?: string;
  createdAt?: string;
}

interface EnhancedFigmaAnalysisLayoutProps {
  analysisData: AnalysisData;
  strategistAnalysis?: StrategistOutput | null;
  userChallenge?: string;
  onBack?: () => void;
}

export const EnhancedFigmaAnalysisLayout: React.FC<EnhancedFigmaAnalysisLayoutProps> = ({
  analysisData,
  strategistAnalysis,
  userChallenge,
  onBack,
}) => {
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [prototypesLoaded, setPrototypesLoaded] = useState(false);
  
  // Add the hook to your component
  const { 
    isGenerating, 
    progress, 
    error, 
    generatePrototypes, 
    resetState 
  } = usePrototypeGeneration();
  
  // Mock prototypes array for the condition check
  const prototypes: any[] = [];

  const categories = ['all', ...Array.from(new Set(analysisData.annotations.map(a => a.category)))];
  
  const filteredAnnotations = analysisData.annotations.filter(annotation => 
    activeFilter === 'all' || annotation.category === activeFilter
  );

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'important': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Add this handler function
  const handleGeneratePrototypes = async () => {
    if (!analysisData?.id) {
      console.error('No analysis ID available');
      return;
    }
    
    try {
      await generatePrototypes(analysisData.id);
      // Reload prototypes from database
      setPrototypesLoaded(false); // This will trigger the useEffect to reload
    } catch (error) {
      console.error('Failed to generate prototypes:', error);
    }
  };

  return (
    <div className="h-full bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">

        {/* Center Panel - Main Analysis View - Full Width */}
        <ResizablePanel defaultSize={75} minSize={60}>
          <div className="h-full flex flex-col">
            {/* Header - Mobile Responsive */}
            <div className="border-b border-border p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3 sm:gap-0">
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold">Analysis Results</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {filteredAnnotations.length} insights found
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>


              {strategistAnalysis && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">UX Strategist Insights</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enhanced analysis with business impact and strategic recommendations
                  </p>
                </div>
              )}

              {/* Generate Prototypes Section */}
              {analysisData && prototypes.length === 0 && !isGenerating && (
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Generate Visual Prototypes
                      </h3>
                      <p className="text-gray-600 max-w-2xl">
                        Transform your top recommendations into interactive visual prototypes with working code. 
                        We'll select 2-3 high-impact improvements and create comprehensive implementation examples.
                      </p>
                    </div>
                    <button
                      onClick={handleGeneratePrototypes}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate Prototypes
                    </button>
                  </div>
                </div>
              )}

              {/* Generation Progress */}
              {isGenerating && (
                <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Generating Visual Prototypes</h3>
                      <p className="text-gray-600 text-sm">{progress.message}</p>
                    </div>
                  </div>
                  
                  {/* Progress Steps */}
                  <div className="space-y-2">
                    {[
                      { key: 'selecting', label: 'Selecting high-impact issues' },
                      { key: 'generating', label: 'Creating comprehensive prototypes' },
                      { key: 'storing', label: 'Saving prototypes and code' }
                    ].map(step => (
                      <div key={step.key} className="flex items-center gap-3">
                        {progress.step === step.key ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : progress.step === 'complete' ? (
                          <div className="w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        )}
                        <span className={`text-sm ${
                          progress.step === step.key ? 'text-blue-600 font-medium' : 
                          progress.step === 'complete' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {progress.currentPrototype && progress.totalPrototypes && (
                    <div className="mt-4 bg-blue-50 rounded-lg p-3">
                      <div className="flex justify-between text-sm">
                        <span>Prototype Progress</span>
                        <span>{progress.currentPrototype} of {progress.totalPrototypes}</span>
                      </div>
                      <div className="mt-2 bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(progress.currentPrototype / progress.totalPrototypes) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Generation Error */}
              {error && (
                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 text-red-500 mt-0.5">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-red-800">Prototype Generation Failed</h4>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={handleGeneratePrototypes}
                          className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                        >
                          Try Again
                        </button>
                        <button
                          onClick={resetState}
                          className="px-3 py-1.5 border border-red-300 text-red-700 text-sm rounded hover:bg-red-50 transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Content Area - Mobile Optimized */}
            <div className="flex-1 overflow-auto p-3 sm:p-4">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  {filteredAnnotations.map((annotation) => (
                    <Card
                      key={annotation.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedAnnotation === annotation.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedAnnotation(annotation.id)}
                    >
                      <CardHeader className="pb-2 sm:pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-xs sm:text-sm font-medium leading-4 sm:leading-5 line-clamp-2">
                            {annotation.title}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={`text-xs shrink-0 ${getSeverityColor(annotation.severity)}`}
                          >
                            {annotation.severity}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2 sm:line-clamp-3">
                          {annotation.feedback.substring(0, 80)}...
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {annotation.category}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {filteredAnnotations.map((annotation) => (
                    <Card
                      key={annotation.id}
                      className={`cursor-pointer transition-all hover:shadow-sm ${
                        selectedAnnotation === annotation.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedAnnotation(annotation.id)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-xs sm:text-sm mb-1 line-clamp-2">{annotation.title}</h3>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2 sm:line-clamp-3">
                              {annotation.feedback.substring(0, 120)}...
                            </p>
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {annotation.category}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs ${getSeverityColor(annotation.severity)}`}
                              >
                                {annotation.severity}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};