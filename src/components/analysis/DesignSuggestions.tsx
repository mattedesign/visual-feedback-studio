
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Palette, Lightbulb, Download, Save, Eye, Sparkles } from 'lucide-react';
import { useDesignSuggestions } from '@/hooks/analysis/useDesignSuggestions';
import { type DesignSuggestion } from '@/services/designSuggestionService';
import { Annotation } from '@/types/analysis';

interface DesignSuggestionsProps {
  annotations: Annotation[];
  analysisId: string;
  designType: string;
  targetAudience?: string;
  brandGuidelines?: string;
  businessGoals?: string;
}

export const DesignSuggestions = ({
  annotations,
  analysisId,
  designType,
  targetAudience,
  brandGuidelines,
  businessGoals
}: DesignSuggestionsProps) => {
  const { suggestions, isGenerating, generateSuggestions, saveSuggestion } = useDesignSuggestions();
  const [selectedSuggestion, setSelectedSuggestion] = useState<DesignSuggestion | null>(null);
  const [designContext, setDesignContext] = useState<'wireframe' | 'mockup' | 'prototype' | 'redesign'>('redesign');

  const handleGenerateSuggestions = async () => {
    const analysisInsights = annotations.map(annotation => ({
      category: annotation.category,
      feedback: annotation.feedback,
      severity: annotation.severity
    }));

    await generateSuggestions({
      analysisInsights,
      userContext: {
        designType,
        targetAudience,
        brandGuidelines,
        businessGoals
      },
      designContext,
      numberOfSuggestions: 3
    });
  };

  const handleSaveSuggestion = async (suggestion: DesignSuggestion) => {
    await saveSuggestion(analysisId, suggestion);
  };

  const getSeverityColor = (category: string) => {
    switch (category) {
      case 'UX Improvement': return 'bg-blue-100 text-blue-800';
      case 'Visual Design': return 'bg-purple-100 text-purple-800';
      case 'Conversion Optimization': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-slate-200">AI Design Suggestions</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={designContext}
            onChange={(e) => setDesignContext(e.target.value as any)}
            className="px-3 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-600 text-sm"
          >
            <option value="wireframe">Wireframe</option>
            <option value="mockup">Mockup</option>
            <option value="prototype">Prototype</option>
            <option value="redesign">Redesign</option>
          </select>
          
          <Button
            onClick={handleGenerateSuggestions}
            disabled={isGenerating || annotations.length === 0}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4 mr-2" />
                Generate Suggestions
              </>
            )}
          </Button>
        </div>
      </div>

      {annotations.length === 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center text-slate-400">
              <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Run an analysis first to generate design suggestions</p>
            </div>
          </CardContent>
        </Card>
      )}

      {suggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge className={getSeverityColor(suggestion.category)}>
                    {suggestion.category}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSuggestion(suggestion)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSaveSuggestion(suggestion)}
                      className="h-8 w-8 p-0"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg text-slate-200">{suggestion.category}</CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  {suggestion.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden bg-slate-700">
                  <img
                    src={suggestion.imageUrl}
                    alt={suggestion.description}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-300">Implementation Notes</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {suggestion.implementationNotes}
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = suggestion.imageUrl;
                    link.download = `design-suggestion-${suggestion.id}.png`;
                    link.click();
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed View Dialog */}
      <Dialog open={!!selectedSuggestion} onOpenChange={() => setSelectedSuggestion(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-200 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              {selectedSuggestion?.category}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedSuggestion?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSuggestion && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6">
                <div className="aspect-video rounded-lg overflow-hidden bg-slate-800">
                  <img
                    src={selectedSuggestion.imageUrl}
                    alt={selectedSuggestion.description}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="prompt">AI Prompt</TabsTrigger>
                    <TabsTrigger value="metadata">Metadata</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-2">Implementation Notes</h4>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {selectedSuggestion.implementationNotes}
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="prompt" className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-2">Generated Prompt</h4>
                      <div className="bg-slate-800 rounded-lg p-4">
                        <p className="text-sm text-slate-300 font-mono leading-relaxed">
                          {selectedSuggestion.prompt}
                        </p>
                      </div>
                    </div>
                    
                    {selectedSuggestion.metadata.revised_prompt && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-2">DALL-E 3 Revised Prompt</h4>
                        <div className="bg-slate-800 rounded-lg p-4">
                          <p className="text-sm text-slate-400 font-mono leading-relaxed">
                            {selectedSuggestion.metadata.revised_prompt}
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="metadata" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Model</h4>
                        <p className="text-sm text-slate-400">{selectedSuggestion.metadata.model}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Size</h4>
                        <p className="text-sm text-slate-400">{selectedSuggestion.metadata.size}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Quality</h4>
                        <p className="text-sm text-slate-400">{selectedSuggestion.metadata.quality}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Style</h4>
                        <p className="text-sm text-slate-400">{selectedSuggestion.metadata.style}</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <Separator className="bg-slate-700" />
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleSaveSuggestion(selectedSuggestion)}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Suggestion
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = selectedSuggestion.imageUrl;
                      link.download = `design-suggestion-${selectedSuggestion.id}.png`;
                      link.click();
                    }}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Image
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
