
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { directRAGAnalysisService } from '@/services/analysis/directRAGAnalysis';
import { Annotation } from '@/types/analysis';
import { toast } from 'sonner';

export const DirectRAGTestSimple = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  const testDirectAnalysis = async () => {
    const testImageUrl = '/lovable-uploads/21223d81-f4f7-4209-8d6a-f2f8f703d1d1.png';
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      toast.error('OpenAI API key not found in environment variables');
      return;
    }

    setIsAnalyzing(true);
    setAnnotations([]);

    try {
      console.log('🚀 Testing Direct RAG Analysis');
      
      const result = await directRAGAnalysisService.analyzeWithRAG({
        imageUrl: testImageUrl,
        analysisPrompt: 'Analyze this design for UX improvements and accessibility issues',
        openaiApiKey: apiKey
      });

      console.log('📋 Test result:', result);

      if (result.success) {
        setAnnotations(result.annotations);
        toast.success(`Analysis complete! Found ${result.annotations.length} insights.`);
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
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Direct RAG Analysis Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testDirectAnalysis} 
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? 'Analyzing...' : 'Test Direct RAG Analysis'}
          </Button>

          {annotations.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Results ({annotations.length} annotations):</h3>
              {annotations.map((annotation, index) => (
                <div key={annotation.id} className="border rounded p-3 text-sm">
                  <div className="font-medium">{annotation.category} - {annotation.severity}</div>
                  <div className="text-gray-600">{annotation.feedback}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
