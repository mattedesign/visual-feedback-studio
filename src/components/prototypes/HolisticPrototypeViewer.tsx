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
  const [generating, setGenerating] = useState<any>({});

  console.log('🎯 HolisticPrototypeViewer props:', { analysisId, contextId, originalImage });

  useEffect(() => {
    loadAnalysis();
  }, [analysisId]);

  const loadAnalysis = async () => {
    console.log('🔍 Loading holistic analysis for:', { analysisId, contextId });
    // Load holistic analysis - get the most recent one if multiple exist
    const { data } = await supabase
      .from('figmant_holistic_analyses')
      .select('*')
      .eq('analysis_id', analysisId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      console.log('✅ Found existing holistic analysis:', data);
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
    } else {
      console.log('❌ No holistic analysis found, generating new one for analysisId:', analysisId);
      // Generate initial analysis
      generateAnalysis();
    }
    setLoading(false);
  };

  const generateAnalysis = async () => {
    const response = await supabase.functions.invoke('generate-holistic-prototypes', {
      body: { analysisId, contextId }
    });
    
    if (response.data?.success) {
      loadAnalysis();
    }
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
    // Clean and validate the code before rendering
    const cleanCode = code
      .replace(/[`${}]/g, (match) => {
        // Escape template literals that might cause issues
        if (match === '`') return "'";
        if (match === '${') return "'+";
        if (match === '}') return "+'";
        return match;
      })
      .replace(/className=\{[^}]*\}/g, (match) => {
        // Fix className template literals
        return match.replace(/`([^`]*)`/g, "'$1'");
      });

    // Render in iframe with React and Tailwind
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
            const { useState, useEffect } = React;
            
            try {
              ${cleanCode}
              ReactDOM.createRoot(document.getElementById('root')).render(<EnhancedDesign />);
            } catch (error) {
              ReactDOM.createRoot(document.getElementById('root')).render(
                React.createElement('div', {className: 'error'}, 
                  React.createElement('h3', null, 'Preview Error'),
                  React.createElement('p', null, 'There was a syntax error in the generated code:'),
                  React.createElement('code', null, error.message),
                  React.createElement('p', null, 'You can still view and download the raw code from the Code tab.')
                )
              );
              console.error('Preview render error:', error);
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

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="text-sm text-gray-500 mb-4">
          Debug: analysisId={analysisId}, contextId={contextId}
        </div>
        Loading holistic analysis...
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