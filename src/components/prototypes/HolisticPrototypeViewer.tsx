import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Target, Zap, AlertCircle, CheckCircle, Download, Eye, Code, Columns } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ClearPrototypesButton } from '@/components/admin/ClearPrototypesButton';

interface HolisticPrototypeViewerProps {
  analysisId?: string;
  contextId?: string;
  originalImage?: string;
}

export function HolisticPrototypeViewer({ analysisId, contextId, originalImage }: HolisticPrototypeViewerProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [prototypes, setPrototypes] = useState<any>({});
  const [selectedSolution, setSelectedSolution] = useState('balanced');
  const [viewMode, setViewMode] = useState('preview');
  const [loading, setLoading] = useState(true);
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  const [generating, setGenerating] = useState<any>({});

  console.log('🎯 HolisticPrototypeViewer props:', { analysisId, contextId, originalImage });

  const generateAnalysisFunction = useCallback(async () => {
    setGeneratingAnalysis(true);
    try {
      const response = await supabase.functions.invoke('generate-holistic-prototypes', {
        body: { analysisId, contextId }
      });
      
      if (response.data?.success) {
        // After generating, reload the analysis
        const { data, error } = await supabase
          .from('figmant_holistic_analyses')
          .select('*')
          .eq('analysis_id', analysisId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setAnalysis(data);
          // Load any existing prototypes
          const { data: existingPrototypes } = await supabase
            .from('figmant_holistic_prototypes')
            .select('*')
            .eq('analysis_id', analysisId);
          
          const prototypeMap = {};
          existingPrototypes?.forEach(p => {
            prototypeMap[p.solution_type] = p;
          });
          setPrototypes(prototypeMap);
        }
      } else {
        toast.error('Failed to generate holistic analysis');
      }
    } catch (error) {
      console.error('Analysis generation error:', error);
      toast.error('Failed to generate holistic analysis');
    }
    setGeneratingAnalysis(false);
  }, [analysisId, contextId]);

  const loadAnalysis = useCallback(async () => {
    console.log('🔍 Loading holistic analysis for:', { analysisId, contextId });
    
    try {
      // Load holistic analysis - get the most recent one if multiple exist
      const { data, error } = await supabase
        .from('figmant_holistic_analyses')
        .select('*')
        .eq('analysis_id', analysisId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('📊 Holistic analysis query result:', { data, error, analysisId });

      if (data) {
        console.log('✅ Found existing holistic analysis:', data);
        setAnalysis(data);
        // Load any existing prototypes
        const { data: existingPrototypes, error: prototypeError } = await supabase
          .from('figmant_holistic_prototypes')
          .select('*')
          .eq('analysis_id', analysisId);
        
        console.log('🎨 Prototype query result:', { existingPrototypes, prototypeError, analysisId });
        
        const prototypeMap = {};
        existingPrototypes?.forEach(p => {
          prototypeMap[p.solution_type] = p;
        });
        console.log('🗂️ Prototype map created:', prototypeMap);
        setPrototypes(prototypeMap);
      } else {
        console.log('❌ No holistic analysis found, generating new one for analysisId:', analysisId);
        // Generate initial analysis
        generateAnalysisFunction();
      }
    } catch (error) {
      console.error('💥 Error in loadAnalysis:', error);
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  }, [analysisId, contextId, generateAnalysisFunction]);

  useEffect(() => {
    if (analysisId) {
      loadAnalysis();
    }
  }, [analysisId, loadAnalysis]);

  const generatePrototype = useCallback(async (solutionType: string) => {
    setGenerating(prev => ({ ...prev, [solutionType]: true }));
    
    try {
      const { data: response, error } = await supabase.functions.invoke('generate-holistic-prototypes', {
        body: { analysisId, contextId, solutionType }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (response?.success) {
        setPrototypes(prev => ({ ...prev, [solutionType]: response.prototype }));
        toast.success('Prototype generated successfully!');
      } else {
        throw new Error(response?.error || 'Failed to generate prototype');
      }
    } catch (error) {
      console.error('❌ Error generating prototype:', error);
      toast.error('Failed to generate prototype');
    } finally {
      setGenerating(prev => ({ ...prev, [solutionType]: false }));
    }
  }, [analysisId, contextId]);

  const downloadPrototype = (prototype) => {
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
  };

  const clearAllPrototypes = async () => {
    if (!analysisId) return;
    
    try {
      const { data, error } = await supabase.rpc('clear_prototypes_for_analysis', {
        p_analysis_id: analysisId
      });
      
      if (error) throw error;
      
      // Reset local state
      setPrototypes({});
      setAnalysis(null);
      
      // Reload analysis to trigger fresh generation
      await loadAnalysis();
      
      toast.success(`Cleared ${data || 0} prototypes. You can now regenerate them.`);
    } catch (error) {
      console.error('Error clearing prototypes:', error);
      toast.error('Failed to clear prototypes');
    }
  };

  const executeGeneratedComponent = (componentCode: string) => {
    if (!componentCode || typeof componentCode !== 'string') {
      console.error('Invalid component code provided');
      return null;
    }

    try {
      // CRITICAL: Make React available on window for the generated code
      const originalWindowReact = (window as any).React;
      (window as any).React = React;

      // Create and execute the component
      const componentFunction = new Function(`
        ${componentCode}
        
        if (typeof EnhancedDesign === 'function') {
          return EnhancedDesign;
        } else {
          throw new Error('EnhancedDesign function not found');
        }
      `);

      const Component = componentFunction();

      // Restore original window.React state
      if (originalWindowReact) {
        (window as any).React = originalWindowReact;
      } else {
        delete (window as any).React;
      }

      return Component;

    } catch (error) {
      console.error('Component execution failed:', error);
      
      // Fallback: Try with explicit React context
      try {
        const fallbackFunction = new Function('React', `
          window.React = React; // Ensure React is available
          ${componentCode}
          return EnhancedDesign;
        `);
        
        return fallbackFunction(React);
        
      } catch (fallbackError) {
        console.error('Fallback execution also failed:', fallbackError);
        
        // Return error component
        return function ErrorComponent() {
          return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-semibold mb-2">Component Execution Error</h3>
              <p className="text-red-600 text-sm">{error.message}</p>
              <details className="mt-2">
                <summary className="cursor-pointer text-red-700 text-sm hover:underline">
                  View Component Code
                </summary>
                <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
                  {componentCode.substring(0, 500)}...
                </pre>
              </details>
            </div>
          );
        };
      }
    }
  };

  const renderPrototypePreview = (code) => {
    try {
      // Clean markdown code blocks
      let cleanCode = code.replace(/```(?:jsx?|tsx?)?\n?/g, '').replace(/```\n?$/g, '').trim();
      
      // Remove comment blocks that might cause issues
      cleanCode = cleanCode.replace(/^\/\*[\s\S]*?\*\/\s*/g, '');
      
      // Check if the code contains JSX (< character outside of strings)
      const hasJSX = /<[^>]*>/.test(cleanCode.replace(/"[^"]*"/g, '').replace(/'[^']*'/g, ''));
      
      if (hasJSX) {
        // If JSX is detected, use iframe with Babel for proper JSX compilation
        return renderJSXInIframe(cleanCode);
      }
      
      // For React.createElement based components, try direct execution
      const ComponentWrapper = () => {
        try {
          const GeneratedComponent = executeGeneratedComponent(cleanCode);
          
          if (GeneratedComponent) {
            return <GeneratedComponent />;
          }
          
          return (
            <div className="p-8 text-center bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">Component Not Found</h3>
              <p className="text-yellow-700">EnhancedDesign component could not be loaded from the generated code.</p>
              <p className="text-sm text-yellow-600 mt-2">The component may be using a different export name or structure.</p>
            </div>
          );
        } catch (error) {
          console.error('Component render error:', error);
          return (
            <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">Preview Error</h3>
              <p className="text-red-700 mb-2">There was an error rendering the generated component:</p>
              <code className="text-sm text-red-600 bg-red-100 p-2 rounded block mt-2 whitespace-pre-wrap">{error.message}</code>
              <details className="mt-3">
                <summary className="text-sm text-red-600 cursor-pointer">Stack trace</summary>
                <code className="text-xs text-red-500 bg-red-50 p-2 rounded block mt-1 whitespace-pre-wrap">{error.stack}</code>
              </details>
              <p className="text-sm text-red-600 mt-2">You can view the raw code in the Code tab to debug the issue.</p>
            </div>
          );
        }
      };
      
      return (
        <div className="w-full min-h-[600px] border border-gray-200 rounded-lg overflow-auto bg-white p-4">
          <ComponentWrapper />
        </div>
      );
    } catch (error) {
      return (
        <div className="w-full h-[600px] bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
          <div className="text-center p-8">
            <h3 className="font-semibold text-red-900 mb-2">Preview Generation Failed</h3>
            <p className="text-red-700 mb-4">Unable to generate preview for this prototype.</p>
            <p className="text-sm text-red-600">Please check the Code tab to view the generated code directly.</p>
            <code className="text-xs text-red-500 bg-red-100 p-2 rounded block mt-2">{error.message}</code>
          </div>
        </div>
      );
    }
  };

  const renderJSXInIframe = (code) => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; padding: 16px; font-family: system-ui, -apple-system, sans-serif; }
            .error { background: #fee; border: 1px solid #fcc; padding: 12px; border-radius: 6px; color: #900; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            try {
              const { useState, useEffect, useCallback, useMemo } = React;
              
              ${code}
              
              function ComponentToRender() {
                if (typeof EnhancedDesign !== 'undefined') {
                  return React.createElement(EnhancedDesign);
                }
                return React.createElement('div', 
                  { className: 'p-8 text-center' },
                  React.createElement('h3', null, 'Component Not Found'),
                  React.createElement('p', null, 'EnhancedDesign component could not be loaded from the generated code.')
                );
              }
              
              ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(ComponentToRender));
            } catch (error) {
              console.error('Preview render error:', error);
              ReactDOM.createRoot(document.getElementById('root')).render(
                React.createElement('div', {className: 'error'}, 
                  React.createElement('h3', null, 'Preview Error'),
                  React.createElement('p', null, 'There was a syntax error in the generated code:'),
                  React.createElement('code', null, error.message),
                  React.createElement('p', null, 'You can view the raw code in the Code tab to debug the issue.')
                )
              );
            }
          </script>
        </body>
      </html>
    `;
    
    return (
      <iframe
        srcDoc={html}
        className="w-full h-[600px] border-0"
        sandbox="allow-scripts"
      />
    );
  };

  if (loading || generatingAnalysis) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <motion.div
            className="w-12 h-12 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {loading ? 'Loading Analysis...' : 'Generating Holistic Analysis...'}
            </h3>
            {generatingAnalysis && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Our AI is analyzing your design and identifying specific UX problems...
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <motion.div
                        className="w-2 h-2 bg-blue-600 rounded-full"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-blue-900">What we're doing:</p>
                      <ul className="text-xs text-blue-700 mt-2 space-y-1">
                        <li>• Analyzing visual hierarchy and layout patterns</li>
                        <li>• Identifying conversion optimization opportunities</li>
                        <li>• Comparing against UX best practices</li>
                        <li>• Generating tailored solution approaches</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  This typically takes 15-30 seconds...
                </p>
              </div>
            )}
            {loading && (
              <p className="text-sm text-gray-600">
                Checking for existing analysis data...
              </p>
            )}
          </div>
        </div>
      </Card>
    );
  }

  if (!analysisId) {
    return (
      <Card className="p-8 text-center bg-yellow-50 border-yellow-200">
        <AlertCircle className="w-8 h-8 mx-auto mb-4 text-yellow-600" />
        <h3 className="font-semibold text-yellow-900 mb-2">No Analysis Available</h3>
        <p className="text-yellow-700">
          No analysis ID provided for holistic prototype generation.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Clear Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">AI-Generated Prototypes</h2>
          <p className="text-sm text-gray-600">Holistic solutions targeting your specific UX problems</p>
        </div>
        {Object.keys(prototypes).length > 0 && (
          <Button
            variant="outline"
            onClick={clearAllPrototypes}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Clear All Prototypes
          </Button>
        )}
      </div>
      {/* Problem Summary */}
      {analysis?.identified_problems && Array.isArray(analysis.identified_problems) && analysis.identified_problems.length > 0 && (
        <Card className="p-6 bg-red-50 border-red-200">
          <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Key Issues Affecting Your Goals
          </h3>
          <div className="space-y-2">
            {analysis.identified_problems.map((problem, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Badge variant="destructive" className="mt-0.5">{problem?.severity || 'medium'}</Badge>
                <div className="flex-1">
                  <p className="text-red-800">{problem?.description || 'Problem description not available'}</p>
                  <p className="text-sm text-red-600 mt-1">Impact: {problem?.businessImpact || 'Impact not specified'}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Solution Selector */}
      <div className="grid md:grid-cols-3 gap-4">
        {analysis?.solution_approaches && Array.isArray(analysis.solution_approaches) && analysis.solution_approaches.length > 0 ? (
          analysis.solution_approaches.map((solution) => (
            <Card
              key={solution?.approach || Math.random()}
              className={`p-4 cursor-pointer transition-all ${
                selectedSolution === solution?.approach ? 'ring-2 ring-blue-600' : ''
              }`}
              onClick={() => setSelectedSolution(solution?.approach || 'balanced')}
            >
              <div className="flex items-center gap-2 mb-2">
                {solution?.approach === 'conservative' && <Shield className="w-5 h-5 text-green-600" />}
                {solution?.approach === 'balanced' && <Target className="w-5 h-5 text-blue-600" />}
                {solution?.approach === 'innovative' && <Zap className="w-5 h-5 text-purple-600" />}
                <h4 className="font-semibold">{solution?.name || 'Solution'}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">{solution?.description || 'Description not available'}</p>
              <div className="space-y-1">
                {solution?.expectedImpact && Array.isArray(solution.expectedImpact) && solution.expectedImpact.map((impact, i) => (
                  <p key={i} className="text-xs text-green-600">
                    {impact?.metric || 'Metric'}: {impact?.improvement || 'Improvement'}
                  </p>
                ))}
              </div>
              {!prototypes[solution?.approach] && (
                <Button
                  size="sm"
                  className="w-full mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    generatePrototype(solution?.approach || 'balanced');
                  }}
                  disabled={generating[solution?.approach]}
                >
                  {generating[solution?.approach] ? 'Generating...' : 'Generate Prototype'}
                </Button>
              )}
            </Card>
          ))
        ) : (
          <Card className="p-6 bg-yellow-50 border-yellow-200 col-span-full">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <h3 className="font-semibold text-yellow-900 mb-2">No Solutions Available</h3>
              <p className="text-yellow-700 text-sm">
                Analysis is still being generated. Please wait for the holistic analysis to complete.
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Prototype Display */}
      {prototypes[selectedSolution] && (
        <Card className="overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{prototypes[selectedSolution].title}</h3>
                <p className="text-sm text-gray-600">{prototypes[selectedSolution].description}</p>
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
          </div>

          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="compare">Compare</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="p-0">
              {renderPrototypePreview(prototypes[selectedSolution].component_code)}
            </TabsContent>

            <TabsContent value="compare" className="p-0">
              <div className="grid md:grid-cols-2">
                <div>
                  <div className="p-2 bg-gray-100 text-sm font-medium">Original</div>
                  <img src={originalImage} className="w-full" alt="Original design" />
                </div>
                <div>
                  <div className="p-2 bg-blue-100 text-sm font-medium">AI Enhancement</div>
                  {renderPrototypePreview(prototypes[selectedSolution].component_code)}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="code" className="p-0">
              <div className="p-4 bg-gray-900 overflow-auto max-h-[600px]">
                <pre className="text-sm text-gray-300">
                  <code>{prototypes[selectedSolution].component_code}</code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>

          {/* Implementation Guide */}
          <div className="p-4 bg-gray-50 border-t">
            <details className="cursor-pointer">
              <summary className="font-medium text-sm">Implementation Guide</summary>
              <div className="mt-3 space-y-3">
                <div>
                  <h5 className="font-medium text-sm mb-1">Key Changes</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {prototypes[selectedSolution]?.key_changes && Array.isArray(prototypes[selectedSolution].key_changes) && prototypes[selectedSolution].key_changes.length > 0 ? (
                      prototypes[selectedSolution].key_changes.map((change, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          {change}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 text-sm">No key changes available</li>
                    )}
                  </ul>
                </div>
              </div>
            </details>
          </div>
        </Card>
      )}
    </div>
  );
}