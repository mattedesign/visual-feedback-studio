
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Play, 
  Clock, 
  BookOpen, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useRAGAnalysis } from '@/hooks/analysis/useRAGAnalysis';
import { useAnalysisExecutionEnhanced } from '@/hooks/analysis/useAnalysisExecutionEnhanced';
import { analysisService } from '@/services/analysisService';
import { RAGStatusIndicator } from '@/components/analysis/RAGStatusIndicator';
import { ResearchBackedRecommendations } from '@/components/analysis/ResearchBackedRecommendations';
import { toast } from 'sonner';

interface TestResult {
  standardAnalysis?: {
    annotations: any[];
    responseTime: number;
    prompt: string;
  };
  ragAnalysis?: {
    annotations: any[];
    responseTime: number;
    enhancedPrompt: string;
    retrievedKnowledge: any[];
    researchSources: number;
    enhancedResults?: any;
  };
}

export const RAGAnalysisTest = () => {
  const [testImage, setTestImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [analysisPrompt, setAnalysisPrompt] = useState('Analyze this design for UX issues and conversion optimization opportunities');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [testResults, setTestResults] = useState<TestResult>({});
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    totalTime: number;
    ragBuildTime: number;
    analysisTime: number;
    knowledgeRetrievalCount: number;
  } | null>(null);

  const {
    buildRAGContext,
    enhancePromptWithResearch,
    formatAnalysisWithResearch,
    clearRAGData,
    hasResearchContext,
    researchSourcesCount,
    ragContext
  } = useRAGAnalysis();

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTestImage(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      toast.success('Test image uploaded successfully');
    }
  }, []);

  const runStandardAnalysis = async (imageUrl: string, prompt: string) => {
    const startTime = Date.now();
    
    // Create a temporary analysis for testing
    const analysisId = await analysisService.createAnalysis();
    if (!analysisId) throw new Error('Failed to create test analysis');

    const response = await analysisService.analyzeDesign({
      imageUrls: [imageUrl],
      analysisId,
      analysisPrompt: prompt,
      isComparative: false,
      ragEnhanced: false
    });

    const endTime = Date.now();
    
    return {
      annotations: response.annotations || [],
      responseTime: endTime - startTime,
      prompt
    };
  };

  const runRAGEnhancedAnalysis = async (imageUrl: string, prompt: string) => {
    const startTime = Date.now();
    
    // Build RAG context
    setCurrentStep('Building research context...');
    setProgress(25);
    
    const ragBuildStart = Date.now();
    const context = await buildRAGContext(prompt, {
      maxResults: 8,
      similarityThreshold: 0.7
    });
    const ragBuildEnd = Date.now();

    setCurrentStep('Enhancing analysis prompt...');
    setProgress(50);

    // Enhance prompt with research
    const enhancedPrompt = enhancePromptWithResearch(prompt, context, 'comprehensive');

    setCurrentStep('Running enhanced analysis...');
    setProgress(75);

    // Create a temporary analysis for testing
    const analysisId = await analysisService.createAnalysis();
    if (!analysisId) throw new Error('Failed to create test analysis');

    const analysisStart = Date.now();
    const response = await analysisService.analyzeDesign({
      imageUrls: [imageUrl],
      analysisId,
      analysisPrompt: enhancedPrompt,
      isComparative: false,
      ragEnhanced: true,
      researchSourceCount: context.totalRelevantEntries
    });
    const analysisEnd = Date.now();

    setCurrentStep('Formatting research-backed results...');
    setProgress(90);

    // Format results with research backing
    let enhancedResults = null;
    if (response.success && response.annotations) {
      try {
        // Create a mock AI analysis response for formatting
        const mockAIResponse = response.annotations.map(ann => 
          `RECOMMENDATION: ${ann.feedback} (Category: ${ann.category}, Severity: ${ann.severity})`
        ).join('\n\n');
        
        enhancedResults = formatAnalysisWithResearch(mockAIResponse, context);
      } catch (error) {
        console.warn('Failed to format research-backed results:', error);
      }
    }

    const endTime = Date.now();

    return {
      annotations: response.annotations || [],
      responseTime: endTime - startTime,
      enhancedPrompt,
      retrievedKnowledge: context.relevantKnowledge,
      researchSources: context.totalRelevantEntries,
      enhancedResults,
      performanceMetrics: {
        totalTime: endTime - startTime,
        ragBuildTime: ragBuildEnd - ragBuildStart,
        analysisTime: analysisEnd - analysisStart,
        knowledgeRetrievalCount: context.totalRelevantEntries
      }
    };
  };

  const runComparisonTest = async () => {
    if (!imageUrl || !analysisPrompt.trim()) {
      toast.error('Please upload an image and provide an analysis prompt');
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setTestResults({});
    setPerformanceMetrics(null);
    
    try {
      // Clear any existing RAG data
      clearRAGData();

      console.log('🧪 Starting RAG analysis comparison test...');

      // Run standard analysis first
      setCurrentStep('Running standard analysis...');
      setProgress(10);
      
      const standardResult = await runStandardAnalysis(imageUrl, analysisPrompt);
      
      setTestResults(prev => ({ ...prev, standardAnalysis: standardResult }));
      
      // Run RAG-enhanced analysis
      setCurrentStep('Starting RAG-enhanced analysis...');
      setProgress(20);
      
      const ragResult = await runRAGEnhancedAnalysis(imageUrl, analysisPrompt);
      
      setTestResults(prev => ({ ...prev, ragAnalysis: ragResult }));
      setPerformanceMetrics(ragResult.performanceMetrics!);
      
      setCurrentStep('Test completed!');
      setProgress(100);
      
      toast.success('RAG analysis comparison test completed successfully!');
      
      console.log('✅ RAG analysis test completed:', {
        standardAnnotations: standardResult.annotations.length,
        ragAnnotations: ragResult.annotations.length,
        researchSources: ragResult.researchSources,
        totalTime: ragResult.performanceMetrics?.totalTime
      });

    } catch (error) {
      console.error('❌ RAG analysis test failed:', error);
      toast.error(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCurrentStep('Test failed');
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            RAG Analysis Testing Interface
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Test Design Image</label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1"
                />
                {testImage && (
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Image ready
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Analysis Context/Prompt</label>
              <Textarea
                value={analysisPrompt}
                onChange={(e) => setAnalysisPrompt(e.target.value)}
                placeholder="Describe what you want to analyze in the design..."
                rows={3}
              />
            </div>

            <Button 
              onClick={runComparisonTest}
              disabled={isAnalyzing || !imageUrl || !analysisPrompt.trim()}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Test...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run RAG Analysis Comparison Test
                </>
              )}
            </Button>
          </div>

          {/* Progress and Status */}
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{currentStep}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* RAG Status */}
          {(isAnalyzing || hasResearchContext) && (
            <RAGStatusIndicator
              hasResearchContext={hasResearchContext}
              researchSourcesCount={researchSourcesCount}
              isAnalyzing={isAnalyzing}
            />
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {performanceMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {performanceMetrics.totalTime}ms
                </div>
                <div className="text-sm text-gray-600">Total Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {performanceMetrics.ragBuildTime}ms
                </div>
                <div className="text-sm text-gray-600">RAG Build Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {performanceMetrics.analysisTime}ms
                </div>
                <div className="text-sm text-gray-600">Analysis Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {performanceMetrics.knowledgeRetrievalCount}
                </div>
                <div className="text-sm text-gray-600">Knowledge Sources</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {(testResults.standardAnalysis || testResults.ragAnalysis) && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Comparison Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="comparison" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
                <TabsTrigger value="standard">Standard</TabsTrigger>
                <TabsTrigger value="rag">RAG Enhanced</TabsTrigger>
                <TabsTrigger value="knowledge">Retrieved Knowledge</TabsTrigger>
              </TabsList>

              <TabsContent value="comparison" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Standard Analysis Summary */}
                  <Card className="border-orange-200">
                    <CardHeader>
                      <CardTitle className="text-orange-800">Standard Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Annotations:</span>
                        <Badge variant="outline">{testResults.standardAnalysis?.annotations.length || 0}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <Badge variant="outline">{testResults.standardAnalysis?.responseTime}ms</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Research Sources:</span>
                        <Badge variant="outline">0</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* RAG Enhanced Analysis Summary */}
                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle className="text-green-800">RAG Enhanced Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Annotations:</span>
                        <Badge variant="outline">{testResults.ragAnalysis?.annotations.length || 0}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <Badge variant="outline">{testResults.ragAnalysis?.responseTime}ms</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Research Sources:</span>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {testResults.ragAnalysis?.researchSources || 0}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Improvement Metrics */}
                {testResults.standardAnalysis && testResults.ragAnalysis && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Improvement Summary:</strong> RAG enhanced analysis retrieved{' '}
                      {testResults.ragAnalysis.researchSources} research sources and generated{' '}
                      {testResults.ragAnalysis.annotations.length} annotations compared to{' '}
                      {testResults.standardAnalysis.annotations.length} from standard analysis.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="standard" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Original Prompt</h4>
                    <div className="p-3 bg-gray-50 rounded text-sm">
                      {testResults.standardAnalysis?.prompt}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Standard Analysis Results ({testResults.standardAnalysis?.annotations.length || 0} annotations)</h4>
                    <div className="space-y-2">
                      {testResults.standardAnalysis?.annotations.map((annotation, index) => (
                        <Card key={index} className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm">{annotation.feedback}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline">{annotation.category}</Badge>
                                <Badge variant={annotation.severity === 'critical' ? 'destructive' : 'secondary'}>
                                  {annotation.severity}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rag" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Enhanced Prompt (Research-Backed)</h4>
                    <div className="p-3 bg-blue-50 rounded text-sm max-h-40 overflow-y-auto">
                      {testResults.ragAnalysis?.enhancedPrompt}
                    </div>
                  </div>
                  
                  {testResults.ragAnalysis?.enhancedResults && (
                    <div>
                      <h4 className="font-medium mb-2">Research-Backed Recommendations</h4>
                      <ResearchBackedRecommendations 
                        analysisResult={testResults.ragAnalysis.enhancedResults}
                      />
                    </div>
                  )}

                  {!testResults.ragAnalysis?.enhancedResults && (
                    <div>
                      <h4 className="font-medium mb-2">RAG Enhanced Results ({testResults.ragAnalysis?.annotations.length || 0} annotations)</h4>
                      <div className="space-y-2">
                        {testResults.ragAnalysis?.annotations.map((annotation, index) => (
                          <Card key={index} className="p-3 border-l-4 border-l-green-500">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm">{annotation.feedback}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline">{annotation.category}</Badge>
                                  <Badge variant={annotation.severity === 'critical' ? 'destructive' : 'secondary'}>
                                    {annotation.severity}
                                  </Badge>
                                  <Badge variant="outline" className="bg-green-100 text-green-800">
                                    Research-Enhanced
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="knowledge" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">
                    Retrieved Knowledge Entries ({testResults.ragAnalysis?.retrievedKnowledge.length || 0})
                  </h4>
                  <div className="space-y-3">
                    {testResults.ragAnalysis?.retrievedKnowledge.map((entry, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-sm">{entry.title}</h5>
                          <Badge variant="secondary" className="text-xs">
                            {(entry.similarity * 100).toFixed(1)}% match
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{entry.content.substring(0, 200)}...</p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">{entry.category}</Badge>
                          {entry.source && (
                            <Badge variant="outline" className="text-xs">{entry.source}</Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Test Image Preview */}
      {imageUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Test Image Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <img 
              src={imageUrl} 
              alt="Test design" 
              className="max-w-full max-h-96 object-contain rounded border"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
