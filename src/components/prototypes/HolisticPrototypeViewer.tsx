import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Target, Zap, AlertCircle, CheckCircle, Download, Eye, Code, Columns } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

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

  useEffect(() => {
    loadAnalysis();
  }, [analysisId]);

  const loadAnalysis = async () => {
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
        generateAnalysis();
      }
    } catch (error) {
      console.error('💥 Error in loadAnalysis:', error);
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  };

  const generateAnalysis = async () => {
    setGeneratingAnalysis(true);
    try {
      const response = await supabase.functions.invoke('generate-holistic-prototypes', {
        body: { analysisId, contextId }
      });
      
      if (response.data?.success) {
        await loadAnalysis();
      } else {
        toast.error('Failed to generate holistic analysis');
      }
    } catch (error) {
      console.error('Analysis generation error:', error);
      toast.error('Failed to generate holistic analysis');
    }
    setGeneratingAnalysis(false);
  };

  const generatePrototype = async (solutionType) => {
    setGenerating({ ...generating, [solutionType]: true });
    
    const response = await supabase.functions.invoke('generate-holistic-prototypes', {
      body: { analysisId, contextId, solutionType }
    });
    
    if (response.data?.success) {
      setPrototypes({ ...prototypes, [solutionType]: response.data.prototype });
      toast.success('Prototype generated successfully!');
    }
    
    setGenerating({ ...generating, [solutionType]: false });
  };

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

  const renderPrototypePreview = (code) => {
    try {
      // More robust code cleaning
      let cleanCode = code;
      
      // Remove markdown code block markers
      cleanCode = cleanCode.replace(/```(?:jsx?|tsx?)?\n?/g, '');
      cleanCode = cleanCode.replace(/```\n?$/g, '');
      
      // Remove any leading/trailing whitespace
      cleanCode = cleanCode.trim();
      
      // Remove comment blocks at the start if they exist
      cleanCode = cleanCode.replace(/^\/\*[\s\S]*?\*\/\s*/g, '');
      
      // More aggressive comment cleanup - remove all block comments to avoid parsing issues
      cleanCode = cleanCode.replace(/\/\*[\s\S]*?\*\//g, '');
      
      // Remove single-line comments that might cause issues
      cleanCode = cleanCode.replace(/\/\/.*$/gm, '');
      
      // Fix template literal issues
      cleanCode = cleanCode.replace(/className=\{`([^`]*)`\}/g, 'className="$1"');
      
      // Ensure quotes are properly escaped
      cleanCode = cleanCode.replace(/'/g, "\\'");
      cleanCode = cleanCode.replace(/"/g, '\\"');
      
      // Validate that we have a proper React component
      if (!cleanCode.includes('function') && !cleanCode.includes('const')) {
        cleanCode = `function EnhancedDesign() {
          return React.createElement('div', 
            { className: 'p-8 text-center' },
            React.createElement('h3', null, 'Generated code format not recognized'),
            React.createElement('p', null, 'Please check the Code tab for the raw output')
          );
        }`;
      }

      // Use a more robust approach - encode the code as base64 to avoid injection issues
      const encodedCode = btoa(cleanCode);
      
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
            <script>
              try {
                // Decode the base64 encoded code
                const decodedCode = atob('${encodedCode}');
                
                // Transform and execute the code
                const transformedCode = Babel.transform(decodedCode, {
                  presets: ['react']
                }).code;
                
                // Create a function to safely execute the code
                const executeCode = new Function('React', 'ReactDOM', 'useState', 'useEffect', transformedCode + '; return typeof EnhancedDesign !== "undefined" ? EnhancedDesign : null;');
                
                const { useState, useEffect } = React;
                const EnhancedDesign = executeCode(React, ReactDOM, useState, useEffect);
                
                if (EnhancedDesign) {
                  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(EnhancedDesign));
                } else {
                  ReactDOM.createRoot(document.getElementById('root')).render(
                    React.createElement('div', 
                      { className: 'p-8 text-center' },
                      React.createElement('h3', null, 'Component Not Found'),
                      React.createElement('p', null, 'EnhancedDesign component could not be loaded from the generated code.')
                    )
                  );
                }
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
    } catch (error) {
      // Fallback if even the preview generation fails
      return (
        <div className="w-full h-[600px] bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
          <div className="text-center p-8">
            <h3 className="font-semibold text-red-900 mb-2">Preview Generation Failed</h3>
            <p className="text-red-700 mb-4">Unable to generate preview for this prototype.</p>
            <p className="text-sm text-red-600">Please check the Code tab to view the generated code directly.</p>
          </div>
        </div>
      );
    }
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
      {/* Problem Summary */}
      {analysis?.identified_problems && (
        <Card className="p-6 bg-red-50 border-red-200">
          <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Key Issues Affecting Your Goals
          </h3>
          <div className="space-y-2">
            {analysis.identified_problems.map((problem, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Badge variant="destructive" className="mt-0.5">{problem.severity}</Badge>
                <div className="flex-1">
                  <p className="text-red-800">{problem.description}</p>
                  <p className="text-sm text-red-600 mt-1">Impact: {problem.businessImpact}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Solution Selector */}
      <div className="grid md:grid-cols-3 gap-4">
        {analysis?.solution_approaches?.map((solution) => (
          <Card
            key={solution.approach}
            className={`p-4 cursor-pointer transition-all ${
              selectedSolution === solution.approach ? 'ring-2 ring-blue-600' : ''
            }`}
            onClick={() => setSelectedSolution(solution.approach)}
          >
            <div className="flex items-center gap-2 mb-2">
              {solution.approach === 'conservative' && <Shield className="w-5 h-5 text-green-600" />}
              {solution.approach === 'balanced' && <Target className="w-5 h-5 text-blue-600" />}
              {solution.approach === 'innovative' && <Zap className="w-5 h-5 text-purple-600" />}
              <h4 className="font-semibold">{solution.name}</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">{solution.description}</p>
            <div className="space-y-1">
              {solution.expectedImpact?.map((impact, i) => (
                <p key={i} className="text-xs text-green-600">
                  {impact.metric}: {impact.improvement}
                </p>
              ))}
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
          </Card>
        ))}
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
                    {prototypes[selectedSolution].key_changes?.map((change, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        {change}
                      </li>
                    ))}
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