
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { directRAGAnalysisService } from '@/services/analysis/directRAGAnalysis';
import { Annotation } from '@/types/analysis';
import { toast } from 'sonner';
import { checkKnowledgeBaseStatus, populateBasicKnowledgeEntries } from '@/utils/knowledgeBaseChecker';

export const DirectRAGTestSimple = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [knowledgeStatus, setKnowledgeStatus] = useState<{
    hasData: boolean;
    totalEntries: number;
    entriesByCategory: Record<string, number>;
    sampleEntries: Array<{ id: string; title: string; category: string }>;
  } | null>(null);
  const [isCheckingKnowledge, setIsCheckingKnowledge] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);

  useEffect(() => {
    checkKnowledgeBase();
  }, []);

  const checkKnowledgeBase = async () => {
    setIsCheckingKnowledge(true);
    try {
      const status = await checkKnowledgeBaseStatus();
      setKnowledgeStatus(status);
      console.log('Knowledge base status:', status);
    } catch (error) {
      console.error('Failed to check knowledge base:', error);
      toast.error('Failed to check knowledge base status');
    } finally {
      setIsCheckingKnowledge(false);
    }
  };

  const populateKnowledgeBase = async () => {
    setIsPopulating(true);
    try {
      await populateBasicKnowledgeEntries();
      toast.success('Basic knowledge entries added successfully');
      // Recheck the knowledge base status
      await checkKnowledgeBase();
    } catch (error) {
      console.error('Failed to populate knowledge base:', error);
      toast.error('Failed to populate knowledge base');
    } finally {
      setIsPopulating(false);
    }
  };

  const testDirectAnalysis = async () => {
    const testImageUrl = '/lovable-uploads/21223d81-f4f7-4209-8d6a-f2f8f703d1d1.png';

    setIsAnalyzing(true);
    setAnnotations([]);

    try {
      console.log('🚀 Testing Direct RAG Analysis via Edge Function');
      
      const result = await directRAGAnalysisService.analyzeWithRAG({
        imageUrl: testImageUrl,
        analysisPrompt: 'Analyze this design for UX improvements and accessibility issues. Focus on color contrast, visual hierarchy, and user experience patterns.'
      });

      console.log('📋 Test result:', result);

      if (result.success) {
        setAnnotations(result.annotations);
        
        if (result.researchEnhanced) {
          toast.success(`Analysis complete! Enhanced with ${result.knowledgeSourcesUsed} research sources. Found ${result.annotations.length} insights.`);
        } else {
          toast.success(`Analysis complete! Found ${result.annotations.length} insights. (No research enhancement available)`);
        }
      } else {
        throw new Error(result.error || 'Analysis failed');
      }

    } catch (error) {
      console.error('❌ Test failed:', error);
      toast.error(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Base Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCheckingKnowledge ? (
            <div className="text-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Checking knowledge base...</p>
            </div>
          ) : knowledgeStatus ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Entries:</span>
                <span className={`text-sm ${knowledgeStatus.hasData ? 'text-green-600' : 'text-red-600'}`}>
                  {knowledgeStatus.totalEntries}
                </span>
              </div>
              
              {knowledgeStatus.hasData ? (
                <>
                  <div className="text-sm">
                    <span className="font-medium">By Category:</span>
                    <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(knowledgeStatus.entriesByCategory).map(([category, count]) => (
                        <div key={category} className="flex justify-between">
                          <span className="capitalize">{category}:</span>
                          <span>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">Sample Entries:</span>
                    <div className="mt-1 space-y-1 text-xs">
                      {knowledgeStatus.sampleEntries.slice(0, 3).map((entry) => (
                        <div key={entry.id} className="text-gray-600">
                          [{entry.category}] {entry.title}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-red-600 mb-3">No knowledge entries found!</p>
                  <Button 
                    onClick={populateKnowledgeBase} 
                    disabled={isPopulating}
                    size="sm"
                    variant="outline"
                  >
                    {isPopulating ? 'Adding...' : 'Add Basic Knowledge Entries'}
                  </Button>
                </div>
              )}
              
              <Button 
                onClick={checkKnowledgeBase} 
                disabled={isCheckingKnowledge}
                size="sm"
                variant="outline"
                className="w-full"
              >
                Refresh Status
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">Failed to load knowledge base status</p>
              <Button onClick={checkKnowledgeBase} size="sm" variant="outline" className="mt-2">
                Retry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Direct RAG Analysis Test (via Edge Function)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            This test uses the secure analyze-design edge function with RAG enhancement.
            No API key required in frontend!
          </div>
          
          <Button 
            onClick={testDirectAnalysis} 
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? 'Analyzing...' : 'Test Secure RAG Analysis'}
          </Button>

          {annotations.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Results ({annotations.length} annotations):</h3>
              {annotations.map((annotation, index) => (
                <div key={annotation.id} className="border rounded p-3 text-sm">
                  <div className="font-medium">{annotation.category} - {annotation.severity}</div>
                  <div className="text-gray-600">{annotation.feedback}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Position: ({annotation.x}%, {annotation.y}%) | 
                    Effort: {annotation.implementationEffort} | 
                    Impact: {annotation.businessImpact}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
