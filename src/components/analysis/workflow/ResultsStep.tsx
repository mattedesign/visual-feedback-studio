
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  RotateCcw, 
  Download, 
  Share2, 
  FileText, 
  BarChart3,
  Palette,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { AnalysisWorkflowState } from '@/hooks/analysis/useAnalysisWorkflow';
import { CategorySummaries } from './components/CategorySummaries';
import { DetailedAnnotationsList } from './components/DetailedAnnotationsList';
import { BusinessImpactSummary } from './components/BusinessImpactSummary';
import { PrioritySummary } from './components/PrioritySummary';
import { ResultsActions } from './components/ResultsActions';
import { OverallAnalysisSummary } from './components/OverallAnalysisSummary';
import { ComparativeAnalysisSummary } from '../ComparativeAnalysisSummary';
import { DesignSuggestions } from '../DesignSuggestions';

interface ResultsStepProps {
  workflow: AnalysisWorkflowState;
}

export const ResultsStep = ({ workflow }: ResultsStepProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const {
    annotations,
    currentAnalysis,
    selectedImages,
    isAnalyzing,
    goToStep
  } = workflow;

  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Analysis in progress...</p>
        </div>
      </div>
    );
  }

  if (!annotations.length) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-200 mb-2">No Analysis Results</h3>
            <p className="text-slate-400 mb-6">No annotations were generated from the analysis.</p>
            <Button onClick={() => goToStep('annotate')} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isComparative = selectedImages.length > 1;
  const criticalCount = annotations.filter(a => a.severity === 'critical').length;
  const suggestedCount = annotations.filter(a => a.severity === 'suggested').length;
  const enhancementCount = annotations.filter(a => a.severity === 'enhancement').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Analysis Complete
          </h1>
          <p className="text-slate-400 mt-1">
            {isComparative 
              ? `Comparative analysis of ${selectedImages.length} designs completed`
              : 'Design analysis completed successfully'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-red-900/20 text-red-400 border-red-800">
            {criticalCount} Critical
          </Badge>
          <Badge variant="outline" className="bg-yellow-900/20 text-yellow-400 border-yellow-800">
            {suggestedCount} Suggested
          </Badge>
          <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-800">
            {enhancementCount} Enhancement
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-slate-400">Total Issues</p>
              <p className="text-2xl font-bold text-slate-200">{annotations.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-slate-400">Critical</p>
              <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-slate-400">Design Type</p>
              <p className="text-lg font-medium text-slate-200 capitalize">
                {currentAnalysis?.design_type || 'Web'}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-500" />
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-slate-400">Images</p>
              <p className="text-2xl font-bold text-purple-400">{selectedImages.length}</p>
            </div>
            <Palette className="w-8 h-8 text-purple-500" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-slate-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="detailed">Detailed</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
          <TabsTrigger value="priority">Priority</TabsTrigger>
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isComparative ? (
            <ComparativeAnalysisSummary 
              annotations={annotations}
              imageCount={selectedImages.length}
            />
          ) : (
            <OverallAnalysisSummary annotations={annotations} />
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <CategorySummaries annotations={annotations} />
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <DetailedAnnotationsList 
            annotations={annotations} 
            isComparative={isComparative}
          />
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          <BusinessImpactSummary annotations={annotations} />
        </TabsContent>

        <TabsContent value="priority" className="space-y-6">
          <PrioritySummary annotations={annotations} />
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-6">
          <DesignSuggestions
            annotations={annotations}
            analysisId={currentAnalysis?.id || ''}
            designType={currentAnalysis?.design_type || 'web'}
            targetAudience={currentAnalysis?.target_audience}
            brandGuidelines={currentAnalysis?.brand_guidelines}
            businessGoals={currentAnalysis?.business_goals}
          />
        </TabsContent>
      </Tabs>

      <Separator className="bg-slate-700" />

      {/* Actions */}
      <ResultsActions 
        analysisId={currentAnalysis?.id}
        annotations={annotations}
        onStartNewAnalysis={() => goToStep('upload')}
      />
    </div>
  );
};
