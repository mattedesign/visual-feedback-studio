
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useRAGAnalysis } from '@/hooks/analysis/useRAGAnalysis';
import { ResearchBackedRecommendations } from './ResearchBackedRecommendations';
import { BookOpen, Sparkles, Search } from 'lucide-react';

export const RAGIntegrationExample: React.FC = () => {
  const [analysisQuery, setAnalysisQuery] = useState('');
  const [analysisType, setAnalysisType] = useState<'comprehensive' | 'ux' | 'conversion' | 'accessibility'>('comprehensive');
  const [mockAnalysisResult, setMockAnalysisResult] = useState('');

  const {
    isBuilding,
    ragContext,
    enhancedResults,
    buildRAGContext,
    enhancePromptWithResearch,
    formatAnalysisWithResearch,
    getResearchCitations,
    clearRAGData,
    hasResearchContext,
    researchSourcesCount,
    researchCategories
  } = useRAGAnalysis();

  const handleBuildContext = async () => {
    if (!analysisQuery.trim()) return;
    
    await buildRAGContext(analysisQuery, {
      maxResults: 8,
      similarityThreshold: 0.7,
    });
  };

  const handleEnhancePrompt = () => {
    if (!ragContext) return;
    
    const enhancedPrompt = enhancePromptWithResearch(analysisQuery, ragContext, analysisType);
    console.log('Enhanced Prompt:', enhancedPrompt);
    
    // In a real implementation, you would send this enhanced prompt to your AI analysis service
    // For demo purposes, we'll simulate an AI response
    const mockResponse = `
    RECOMMENDATION: Improve form usability by reducing field count and implementing real-time validation
    Research shows that forms with fewer fields convert 25% better than complex forms. Studies indicate that real-time validation reduces user errors by 42%.
    
    RECOMMENDATION: Enhance visual hierarchy with consistent typography scale
    Typography research demonstrates that modular scale ratios (1.2-1.618) improve readability by 23% and user comprehension.
    
    RECOMMENDATION: Implement accessibility improvements for color contrast
    WCAG research indicates that proper contrast ratios benefit 15% of the population and improve overall usability for all users.
    `;
    
    setMockAnalysisResult(mockResponse);
  };

  const handleFormatResults = () => {
    if (!ragContext || !mockAnalysisResult) return;
    
    formatAnalysisWithResearch(mockAnalysisResult, ragContext);
  };

  const handleGetCitations = async () => {
    const citations = await getResearchCitations('form design optimization', 3);
    console.log('Research Citations:', citations);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            RAG-Enhanced Design Analysis Demo
          </CardTitle>
          <p className="text-gray-600">
            See how the RAG service transforms generic AI feedback into research-backed UX consulting
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: Build RAG Context */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              Step 1: Build Research Context
            </h4>
            <Textarea
              placeholder="Enter your design analysis query (e.g., 'How can I improve the checkout flow for better conversion?')"
              value={analysisQuery}
              onChange={(e) => setAnalysisQuery(e.target.value)}
              rows={3}
            />
            <div className="flex items-center gap-3">
              <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  <SelectItem value="ux">UX Focus</SelectItem>
                  <SelectItem value="conversion">Conversion Focus</SelectItem>
                  <SelectItem value="accessibility">Accessibility Focus</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleBuildContext} 
                disabled={!analysisQuery.trim() || isBuilding}
              >
                {isBuilding ? 'Building Context...' : 'Build RAG Context'}
              </Button>
            </div>
          </div>

          {/* Research Context Status */}
          {hasResearchContext && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <span className="text-green-800 font-medium">Research Context Built</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{researchSourcesCount} sources</Badge>
                  <Badge variant="outline">{researchCategories.join(', ')}</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Enhance Prompt */}
          {hasResearchContext && (
            <div className="space-y-3">
              <h4 className="font-medium">Step 2: Enhance Analysis Prompt</h4>
              <Button onClick={handleEnhancePrompt}>
                Enhance Prompt with Research
              </Button>
            </div>
          )}

          {/* Step 3: Format Results */}
          {mockAnalysisResult && (
            <div className="space-y-3">
              <h4 className="font-medium">Step 3: Format Research-Backed Results</h4>
              <div className="p-3 bg-gray-50 rounded text-sm">
                <strong>Mock AI Analysis Result:</strong>
                <pre className="whitespace-pre-wrap mt-2">{mockAnalysisResult}</pre>
              </div>
              <Button onClick={handleFormatResults}>
                Format with Research Citations
              </Button>
            </div>
          )}

          {/* Demo Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleGetCitations}>
              Demo: Get Citations
            </Button>
            <Button variant="outline" onClick={clearRAGData}>
              Clear RAG Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Display Enhanced Results */}
      {enhancedResults && (
        <ResearchBackedRecommendations 
          analysisResult={enhancedResults}
          onImplementationClick={(rec) => console.log('Implementation clicked:', rec)}
        />
      )}
    </div>
  );
};
