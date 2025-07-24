import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Target, Zap, AlertCircle, CheckCircle, Download, Eye, Code, Columns } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

interface HolisticPrototypeViewerProps {
  analysisId: string;
  contextId?: string;
  originalImage?: string;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  businessImpact: string;
  uxPrinciple: string;
}

interface Solution {
  approach: 'conservative' | 'balanced' | 'innovative';
  name: string;
  description: string;
  keyChanges: string[];
  expectedImpact: {
    conversionRate?: string;
    engagement?: string;
    satisfaction?: string;
  };
  implementationGuidance: {
    steps: string[];
    effort: 'low' | 'medium' | 'high';
    timeline: string;
  };
  realExamples: string[];
}

interface HolisticAnalysis {
  id: string;
  identified_problems: Problem[];
  solution_approaches: Solution[];
  vision_insights: {
    layoutAnalysis?: string;
    colorPsychology?: string;
    textHierarchy?: string;
  };
}

interface Prototype {
  id: string;
  solution_type: 'conservative' | 'balanced' | 'innovative';
  title: string;
  description: string;
  component_code: string;
  key_changes: string[];
  expected_impact: Record<string, any>;
  generation_metadata: Record<string, any>;
  created_at: string;
}

export function HolisticPrototypeViewer({ analysisId, contextId, originalImage }: HolisticPrototypeViewerProps) {
  const [analysis, setAnalysis] = useState<HolisticAnalysis | null>(null);
  const [prototypes, setPrototypes] = useState<Record<string, Prototype>>({});
  const [selectedSolution, setSelectedSolution] = useState<'conservative' | 'balanced' | 'innovative'>('balanced');
  const [viewMode, setViewMode] = useState<'preview' | 'compare' | 'code'>('preview');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadAnalysis();
  }, [analysisId]);

  const loadAnalysis = async () => {
    try {
      // Load holistic analysis
      const { data: holisticData, error: holisticError } = await supabase
        .from('figmant_holistic_analyses')
        .select('*')
        .eq('analysis_id', analysisId)
        .single();

      if (holisticData) {
        setAnalysis(holisticData);
        
        // Load existing prototypes
        const { data: existingPrototypes, error: prototypeError } = await supabase
          .from('figmant_holistic_prototypes')
          .select('*')
          .eq('analysis_id', analysisId);
        
        if (!prototypeError && existingPrototypes) {
          const prototypeMap: Record<string, Prototype> = {};
          existingPrototypes.forEach(p => {
            prototypeMap[p.solution_type] = p;
          });
          setPrototypes(prototypeMap);
        }
      } else if (!holisticError || holisticError.code === 'PGRST116') {
        // No analysis exists yet, generate it
        await generateAnalysis();
      } else {
        throw holisticError;
      }
    } catch (error) {
      console.error('Failed to load analysis:', error);
      toast({
        title: "Error",
        description: "Failed to load analysis data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysis = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('generate-holistic-prototypes', {
        body: { analysisId, contextId }
      });
      
      if (error) throw error;
      
      if (data?.success && data.analysis) {
        setAnalysis(data.analysis);
        toast({
          title: "Analysis Generated",
          description: "Holistic analysis completed successfully"
        });
      }
    } catch (error) {
      console.error('Failed to generate analysis:', error);
      toast({
        title: "Error",
        description: "Failed to generate analysis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePrototype = async (solutionType: 'conservative' | 'balanced' | 'innovative') => {
    setGenerating({ ...generating, [solutionType]: true });
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-holistic-prototypes', {
        body: { analysisId, contextId, solutionType }
      });
      
      if (error) throw error;
      
      if (data?.success && data.prototype) {
        setPrototypes({ ...prototypes, [solutionType]: data.prototype });
        toast({
          title: "Prototype Generated",
          description: `${solutionType} prototype created successfully!`
        });
      }
    } catch (error) {
      console.error(`Failed to generate ${solutionType} prototype:`, error);
      toast({
        title: "Error",
        description: `Failed to generate ${solutionType} prototype`,
        variant: "destructive"
      });
    } finally {
      setGenerating({ ...generating, [solutionType]: false });
    }
  };

  const downloadPrototype = (prototype: Prototype) => {
    const blob = new Blob([prototype.component_code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prototype.title.toLowerCase().replace(/\s+/g, '-')}.tsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Track download
    supabase
      .from('figmant_solution_metrics')
      .insert({ prototype_id: prototype.id, downloaded: true });
      
    toast({
      title: "Downloaded",
      description: "Prototype component saved to your downloads"
    });
  };

  const renderPrototypePreview = (code: string) => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; padding: 20px; font-family: system-ui, sans-serif; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            const { useState, useEffect } = React;
            ${code}
            ReactDOM.createRoot(document.getElementById('root')).render(<EnhancedDesign />);
          </script>
        </body>
      </html>
    `;
    
    return (
      <iframe
        srcDoc={html}
        className="w-full h-[600px] border rounded-lg"
        sandbox="allow-scripts"
        title="Prototype Preview"
      />
    );
  };

  const getSolutionIcon = (approach: string) => {
    switch (approach) {
      case 'conservative': return Shield;
      case 'balanced': return Target;
      case 'innovative': return Zap;
      default: return Target;
    }
  };

  const getSolutionColor = (approach: string) => {
    switch (approach) {
      case 'conservative': return 'text-green-600 border-green-200 bg-green-50';
      case 'balanced': return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'innovative': return 'text-purple-600 border-purple-200 bg-purple-50';
      default: return 'text-blue-600 border-blue-200 bg-blue-50';
    }
  };

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Generating holistic analysis...</p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <p>No analysis data available.</p>
          <Button onClick={generateAnalysis} className="mt-4">
            Generate Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Problem Summary */}
      {analysis.identified_problems && analysis.identified_problems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Key Issues Affecting Your Goals
            </CardTitle>
            <CardDescription className="text-red-700">
              Our AI identified these specific problems that prevent your design from achieving its full potential.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.identified_problems.map((problem, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-red-200">
                  <Badge 
                    variant={problem.severity === 'high' ? 'destructive' : problem.severity === 'medium' ? 'default' : 'secondary'}
                    className="mt-0.5"
                  >
                    {problem.severity}
                  </Badge>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 mb-1">{problem.title}</h4>
                    <p className="text-red-800 mb-2">{problem.description}</p>
                    <p className="text-sm text-red-600">
                      <strong>Business Impact:</strong> {problem.businessImpact}
                    </p>
                    <p className="text-sm text-red-600">
                      <strong>UX Principle:</strong> {problem.uxPrinciple}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Solution Approaches */}
      {analysis.solution_approaches && analysis.solution_approaches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Solution Approaches</CardTitle>
            <CardDescription>
              Choose a strategy that fits your resources and timeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {analysis.solution_approaches.map((solution) => {
                const Icon = getSolutionIcon(solution.approach);
                const colorClass = getSolutionColor(solution.approach);
                const isSelected = selectedSolution === solution.approach;
                
                return (
                  <motion.div
                    key={solution.approach}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all ${
                        isSelected ? `ring-2 ring-primary ${colorClass}` : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedSolution(solution.approach)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-5 h-5 text-primary" />
                          <h4 className="font-semibold">{solution.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{solution.description}</p>
                        
                        <div className="space-y-2 text-xs">
                          <div>
                            <strong>Effort:</strong> {solution.implementationGuidance?.effort || 'Unknown'}
                          </div>
                          <div>
                            <strong>Timeline:</strong> {solution.implementationGuidance?.timeline || 'Unknown'}
                          </div>
                          {solution.expectedImpact && Object.keys(solution.expectedImpact).length > 0 && (
                            <div className="space-y-1">
                              <strong>Expected Impact:</strong>
                              {Object.entries(solution.expectedImpact).map(([metric, improvement]) => (
                                <div key={metric} className="text-green-600 ml-2">
                                  {metric}: {improvement}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {!prototypes[solution.approach] && (
                          <Button
                            size="sm"
                            className="w-full mt-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              generatePrototype(solution.approach);
                            }}
                            disabled={generating[solution.approach]}
                          >
                            {generating[solution.approach] ? 'Generating...' : 'Generate Prototype'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prototype Display */}
      {prototypes[selectedSolution] && (
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  {prototypes[selectedSolution].title}
                </CardTitle>
                <CardDescription>{prototypes[selectedSolution].description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadPrototype(prototypes[selectedSolution])}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>

          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="compare" className="flex items-center gap-2">
                <Columns className="w-4 h-4" />
                Compare
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="p-0">
              <div className="p-4">
                {renderPrototypePreview(prototypes[selectedSolution].component_code)}
              </div>
            </TabsContent>

            <TabsContent value="compare" className="p-0">
              <div className="grid md:grid-cols-2 h-[600px]">
                <div className="border-r">
                  <div className="p-2 bg-muted text-sm font-medium border-b">Original</div>
                  {originalImage ? (
                    <img src={originalImage} className="w-full h-full object-cover" alt="Original design" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Original image not available
                    </div>
                  )}
                </div>
                <div>
                  <div className="p-2 bg-blue-100 text-sm font-medium border-b">AI Enhancement</div>
                  <div className="h-full overflow-auto">
                    {renderPrototypePreview(prototypes[selectedSolution].component_code)}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="code" className="p-0">
              <div className="bg-gray-900 text-gray-300 overflow-auto max-h-[600px] p-4">
                <pre className="text-sm">
                  <code>{prototypes[selectedSolution].component_code}</code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>

          {/* Implementation Guide */}
          <div className="p-4 bg-muted/30 border-t">
            <details className="cursor-pointer">
              <summary className="font-medium text-sm mb-3">Implementation Guide</summary>
              <div className="space-y-4">
                {prototypes[selectedSolution].key_changes && prototypes[selectedSolution].key_changes.length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm mb-2">Key Changes</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {prototypes[selectedSolution].key_changes.map((change, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {prototypes[selectedSolution].expected_impact && Object.keys(prototypes[selectedSolution].expected_impact).length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm mb-2">Expected Impact</h5>
                    <div className="grid gap-2">
                      {Object.entries(prototypes[selectedSolution].expected_impact).map(([metric, impact]) => (
                        <div key={metric} className="text-sm">
                          <span className="font-medium">{metric}:</span>{' '}
                          <span className="text-green-600">{impact}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </details>
          </div>
        </Card>
      )}
    </div>
  );
}