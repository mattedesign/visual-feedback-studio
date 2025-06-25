
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useDirectRAGAnalysis } from '@/hooks/analysis/useDirectRAGAnalysis';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Annotation } from '@/types/analysis';

export const DirectRAGTest = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [analysisPrompt, setAnalysisPrompt] = useState('Analyze this design for UX improvements');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  const { analyzeWithDirectRAG, isRAGAnalyzing, ragResults } = useDirectRAGAnalysis({
    imageUrl,
    currentAnalysis: null,
    setIsAnalyzing,
    setAnnotations
  });

  const handleAnalyze = async () => {
    if (!imageUrl || !openaiApiKey) {
      alert('Please provide both image URL and OpenAI API key');
      return;
    }

    await analyzeWithDirectRAG(analysisPrompt, openaiApiKey);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Direct RAG Analysis Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Image URL</label>
            <Input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Analysis Prompt</label>
            <Textarea
              value={analysisPrompt}
              onChange={(e) => setAnalysisPrompt(e.target.value)}
              placeholder="Describe what you want to analyze..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
            <Input
              type="password"
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              placeholder="sk-..."
            />
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !imageUrl || !openaiApiKey}
            className="w-full"
          >
            {isRAGAnalyzing ? (
              <>
                <LoadingSpinner />
                Analyzing with RAG...
              </>
            ) : (
              'Analyze with Direct RAG'
            )}
          </Button>
        </CardContent>
      </Card>

      {imageUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Image Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <img 
              src={imageUrl} 
              alt="Analysis target" 
              className="max-w-full h-auto rounded-lg border"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </CardContent>
        </Card>
      )}

      {ragResults && (
        <Card>
          <CardHeader>
            <CardTitle>RAG Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Research Enhanced:</strong> {ragResults.researchEnhanced ? 'Yes' : 'No'}
              </p>
              <p>
                <strong>Knowledge Sources Used:</strong> {ragResults.knowledgeSourcesUsed}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {annotations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results ({annotations.length} annotations)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {annotations.map((annotation, index) => (
                <div key={annotation.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">Annotation {index + 1}</span>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        annotation.category === 'ux' ? 'bg-blue-100 text-blue-800' :
                        annotation.category === 'visual' ? 'bg-green-100 text-green-800' :
                        annotation.category === 'accessibility' ? 'bg-orange-100 text-orange-800' :
                        annotation.category === 'conversion' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {annotation.category}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        annotation.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        annotation.severity === 'suggested' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {annotation.severity}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{annotation.feedback}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Position: {annotation.x}%, {annotation.y}%</span>
                    <span>Effort: {annotation.implementationEffort}</span>
                    <span>Impact: {annotation.businessImpact}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
