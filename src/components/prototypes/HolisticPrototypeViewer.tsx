import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Target, Zap, AlertCircle, CheckCircle, Download, Eye, Code, Columns, RefreshCw, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { PrototypeRenderer } from './PrototypeRenderer';

interface HolisticPrototypeViewerProps {
  analysisId?: string;
  contextId?: string;
  originalImage?: string;
}

interface GenerationState {
  [key: string]: {
    isGenerating: boolean;
    error?: string;
    retryCount: number;
  };
}

interface DebugInfo {
  analysisExists: boolean;
  prototypeCount: number;
  lastGenerated?: string;
  currentAnalysisId?: string;
  loadAttempts: number;
  lastLoadError?: string;
}

export function HolisticPrototypeViewer({ analysisId, contextId, originalImage }: HolisticPrototypeViewerProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [prototypes, setPrototypes] = useState<any>({});
  const [selectedSolution, setSelectedSolution] = useState('balanced');
  const [viewMode, setViewMode] = useState('preview');
  const [loading, setLoading] = useState(true);
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  const [generationState, setGenerationState] = useState<GenerationState>({});
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    analysisExists: false,
    prototypeCount: 0,
    currentAnalysisId: analysisId,
    loadAttempts: 0
  });
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  console.log('🎯 HolisticPrototypeViewer initialized:', { 
    analysisId, 
    contextId, 
    hasOriginalImage: !!originalImage,
    timestamp: new Date().toISOString()
  });

  const updateGenerationState = useCallback((solutionType: string, updates: Partial<GenerationState[string]>) => {
    console.log(`🔄 Updating generation state for ${solutionType}:`, updates);
    setGenerationState(prev => ({
      ...prev,
      [solutionType]: {
        ...prev[solutionType],
        ...updates
      }
    }));
  }, []);

  const loadAnalysis = useCallback(async () => {
    if (!analysisId) {
      console.log('⚠️ No analysisId provided, skipping load');
      setLoading(false);
      setDebugInfo(prev => ({
        ...prev,
        analysisExists: false,
        lastLoadError: 'No analysis ID provided'
      }));
      return;
    }
    
    setLoading(true);
    console.log(`📊 Loading holistic analysis for ID:`, analysisId);
    
    setDebugInfo(prev => ({
      ...prev,
      loadAttempts: prev.loadAttempts + 1,
      lastLoadError: undefined
    }));
    
    try {
      // Load holistic analysis
      console.log('🔍 Querying figmant_holistic_analyses table...');
      const { data, error } = await supabase
        .from('figmant_holistic_analyses')
        .select('*')
        .eq('analysis_id', analysisId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('📊 Holistic analysis query result:', { 
        found: !!data, 
        error: error?.message,
        dataKeys: data ? Object.keys(data) : null,
        analysisId: analysisId
      });

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ Database error loading analysis:', error);
        setDebugInfo(prev => ({
          ...prev,
          lastLoadError: `Database error: ${error.message}`
        }));
        throw error;
      }

      if (data) {
        console.log('✅ Found existing holistic analysis');
        console.log('📊 Analysis details:', {
          id: data.id,
          problemCount: data.identified_problems?.length || 0,
          solutionCount: data.solution_approaches?.length || 0,
          hasVisionInsights: !!data.vision_insights,
          fullDataStructure: data
        });
        
        // CRITICAL FIX: Always set analysis if data exists, regardless of structure
        setAnalysis(data);
        
        // Validate analysis has solution approaches for UI state
        const hasSolutions = data.solution_approaches && 
                            Array.isArray(data.solution_approaches) && 
                            data.solution_approaches.length > 0;
        
        setDebugInfo(prev => ({
          ...prev,
          analysisExists: true, // Always true if data exists
          lastLoadError: hasSolutions ? undefined : 'Analysis exists but solutions may need regeneration'
        }));
        
        if (!hasSolutions) {
          console.warn('⚠️ Analysis found but missing/invalid solution approaches, but setting analysis anyway');
        } else {
          console.log('✅ Analysis has valid solution approaches');
        }
        
        // Load existing prototypes
        console.log('🎨 Loading existing prototypes...');
        const { data: existingPrototypes, error: prototypeError } = await supabase
          .from('figmant_holistic_prototypes')
          .select('*')
          .eq('analysis_id', analysisId);
        
        console.log('🎨 Prototype query result:', {
          count: existingPrototypes?.length || 0,
          error: prototypeError?.message,
          types: existingPrototypes?.map(p => p.solution_type) || []
        });
        
        if (prototypeError) {
          console.warn('⚠️ Failed to load prototypes:', prototypeError);
          setDebugInfo(prev => ({
            ...prev,
            lastLoadError: `Prototype load error: ${prototypeError.message}`
          }));
        } else if (existingPrototypes) {
          const prototypeMap = {};
          existingPrototypes.forEach(p => {
            prototypeMap[p.solution_type] = p;
            console.log(`📋 Loaded ${p.solution_type} prototype: ${p.title}`);
          });
          setPrototypes(prototypeMap);
          
          setDebugInfo(prev => ({
            ...prev,
            prototypeCount: existingPrototypes.length,
            lastGenerated: existingPrototypes[0]?.created_at
          }));
        }
      } else {
        console.log('⚠️ No holistic analysis found, will need to generate');
        setDebugInfo(prev => ({
          ...prev,
          analysisExists: false,
          prototypeCount: 0,
          lastLoadError: 'No holistic analysis found in database'
        }));
      }
    } catch (error) {
      console.error('❌ Error loading analysis:', error);
      setDebugInfo(prev => ({
        ...prev,
        lastLoadError: `Load error: ${error.message}`
      }));
      toast.error('Failed to load analysis data');
    } finally {
      setLoading(false);
    }
  }, [analysisId]); // Remove analysis dependency to prevent infinite loops

  const generateAnalysisFunction = useCallback(async () => {
    if (!analysisId) {
      console.error('❌ Cannot generate analysis without analysisId');
      toast.error('Analysis ID is required to generate holistic analysis');
      return;
    }

    console.log('🔍 Starting holistic analysis generation for:', analysisId);
    setGeneratingAnalysis(true);
    
    try {
      console.log('📡 Calling edge function with params:', { analysisId, contextId });
      
      const { data: response, error } = await supabase.functions.invoke('generate-holistic-prototypes', {
        body: { analysisId, contextId }
      });
      
      console.log('📨 Edge function response:', { 
        success: response?.success, 
        hasAnalysis: !!response?.analysis,
        error: error?.message 
      });
      
      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(error.message);
      }
      
      if (response?.success) {
        console.log('✅ Analysis generation successful, reloading data...');
        // Trigger a fresh reload by calling loadAnalysis directly
        await loadAnalysis(); 
        toast.success('Analysis generated successfully!');
      } else {
        console.error('❌ Edge function returned unsuccessful response:', response);
        throw new Error(response?.error || 'Failed to generate analysis');
      }
    } catch (error) {
      console.error('❌ Analysis generation error:', error);
      setDebugInfo(prev => ({
        ...prev,
        lastLoadError: `Analysis generation failed: ${error.message}`
      }));
      toast.error(`Failed to generate analysis: ${error.message}`);
    } finally {
      setGeneratingAnalysis(false);
    }
  }, [analysisId, contextId, loadAnalysis]);

  useEffect(() => {
    console.log('🔄 useEffect triggered - loading analysis', { analysisId });
    if (analysisId) {
      loadAnalysis();
    } else {
      console.log('⚠️ No analysisId in useEffect');
      setLoading(false);
      setDebugInfo(prev => ({
        ...prev,
        lastLoadError: 'No analysis ID provided in useEffect'
      }));
    }
  }, [analysisId, loadAnalysis]); // Include loadAnalysis but it's stable now

  const generatePrototype = useCallback(async (solutionType: string, retryAttempt = 0) => {
    if (!analysisId) {
      console.error('❌ Cannot generate prototype without analysisId');
      toast.error('Analysis ID is required to generate prototypes');
      return;
    }

    const maxRetries = 3;
    
    console.log(`🎨 Generating ${solutionType} prototype (attempt ${retryAttempt + 1}/${maxRetries})`);
    
    updateGenerationState(solutionType, { 
      isGenerating: true, 
      error: undefined,
      retryCount: retryAttempt 
    });
    
    try {
      console.log('📡 Calling edge function for prototype generation...');
      
      const { data: response, error } = await supabase.functions.invoke('generate-holistic-prototypes', {
        body: { analysisId, contextId, solutionType }
      });
      
      console.log('📨 Prototype generation response:', {
        success: response?.success,
        hasPrototype: !!response?.prototype,
        error: error?.message
      });
      
      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(error.message);
      }
      
      if (response?.success && response.prototype) {
        console.log('✅ Prototype generated successfully:', {
          id: response.prototype.id,
          title: response.prototype.title,
          codeLength: response.prototype.component_code?.length || 0
        });
        
        setPrototypes(prev => ({ ...prev, [solutionType]: response.prototype }));
        updateGenerationState(solutionType, { isGenerating: false });
        
        setDebugInfo(prev => ({
          ...prev,
          prototypeCount: Object.keys({ ...prototypes, [solutionType]: response.prototype }).length,
          lastGenerated: new Date().toISOString()
        }));
        
        toast.success(`${solutionType} prototype generated successfully!`);
      } else {
        console.error('❌ Edge function returned unsuccessful response:', response);
        throw new Error(response?.error || 'Failed to generate prototype');
      }
    } catch (error) {
      console.error(`❌ Error generating ${solutionType} prototype:`, error);
      
      if (retryAttempt < maxRetries - 1) {
        console.log(`🔄 Retrying ${solutionType} prototype generation in 2 seconds...`);
        setTimeout(() => generatePrototype(solutionType, retryAttempt + 1), 2000);
      } else {
        console.error(`❌ All retry attempts exhausted for ${solutionType} prototype`);
        updateGenerationState(solutionType, {
          isGenerating: false,
          error: error.message
        });
        toast.error(`Failed to generate ${solutionType} prototype after ${maxRetries} attempts`);
      }
    }
  }, [analysisId, contextId, updateGenerationState, prototypes]);

  const downloadPrototype = useCallback(async (prototype) => {
    console.log('💾 Downloading prototype:', prototype.title);
    
    try {
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
      try {
        await supabase
          .from('figmant_solution_metrics')
          .insert({ prototype_id: prototype.id, downloaded: true });
        console.log('📊 Download tracked successfully');
      } catch (err) {
        console.warn('⚠️ Failed to track download:', err);
      }
        
      toast.success('Prototype downloaded successfully!');
    } catch (error) {
      console.error('❌ Download failed:', error);
      toast.error('Failed to download prototype');
    }
  }, []);

  const clearAllPrototypes = useCallback(async () => {
    if (!analysisId) return;
    
    console.log('🗑️ Clearing all prototypes for analysis:', analysisId);
    
    try {
      const { data, error } = await supabase.rpc('clear_prototypes_for_analysis', {
        p_analysis_id: analysisId
      });
      
      if (error) {
        console.error('❌ Failed to clear prototypes:', error);
        throw error;
      }
      
      console.log(`✅ Cleared ${data || 0} prototypes`);
      
      setPrototypes({});
      // CRITICAL FIX: Don't clear analysis when clearing prototypes
      // setAnalysis(null); // REMOVED
      
      setDebugInfo(prev => ({
        ...prev,
        prototypeCount: 0
        // analysisExists: false // REMOVED - keep analysis state
      }));
      
      toast.success(`Cleared ${data || 0} prototypes. You can now regenerate them.`);
      
      // Reload analysis to refresh state
      await loadAnalysis();
    } catch (error) {
      console.error('❌ Error clearing prototypes:', error);
      toast.error('Failed to clear prototypes');
    }
  }, [analysisId, loadAnalysis]);

  const handlePrototypeError = useCallback((error: Error, solutionType: string) => {
    console.error(`❌ Prototype rendering error for ${solutionType}:`, error);
    updateGenerationState(solutionType, { error: error.message });
  }, [updateGenerationState]);

  // Enhanced Debug Panel Component
  const DebugPanel = () => (
    <Card className="mb-6 border-yellow-200 bg-yellow-50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-yellow-900 flex items-center gap-2">
            <Bug className="w-4 h-4" />
            Debug Information
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebugPanel(!showDebugPanel)}
          >
            {showDebugPanel ? 'Hide' : 'Show'}
          </Button>
        </div>
        
        {showDebugPanel && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Analysis ID:</strong> {analysisId || 'None'}
              </div>
              <div>
                <strong>Context ID:</strong> {contextId || 'None'}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Analysis Exists:</strong>{' '}
                <Badge variant={debugInfo.analysisExists ? 'default' : 'destructive'}>
                  {debugInfo.analysisExists ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <strong>Prototypes:</strong> {debugInfo.prototypeCount}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Load Attempts:</strong> {debugInfo.loadAttempts}
              </div>
              <div>
                <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
              </div>
            </div>
            
            {debugInfo.lastGenerated && (
              <div>
                <strong>Last Generated:</strong> {new Date(debugInfo.lastGenerated).toLocaleString()}
              </div>
            )}
            
            {debugInfo.lastLoadError && (
              <div className="bg-red-50 border border-red-200 rounded p-2">
                <strong>Last Error:</strong> 
                <p className="text-red-600 text-xs mt-1">{debugInfo.lastLoadError}</p>
              </div>
            )}
            
            <div className="pt-2 border-t border-yellow-200 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadAnalysis}
              >
                Reload Data
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('🔍 Current component state:', {
                    analysis: !!analysis,
                    analysisKeys: analysis ? Object.keys(analysis) : null,
                    prototypes: Object.keys(prototypes),
                    loading,
                    generatingAnalysis,
                    debugInfo
                  });
                }}
              >
                Log State
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );

  if (loading || generatingAnalysis) {
    return (
      <div className="space-y-4">
        <DebugPanel />
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
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 mb-2">What we're doing:</p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Analyzing visual hierarchy and layout patterns</li>
                      <li>• Identifying conversion optimization opportunities</li>
                      <li>• Comparing against UX best practices</li>
                      <li>• Generating tailored solution approaches</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!analysisId) {
    return (
      <div className="space-y-4">
        <DebugPanel />
        <Card className="p-8 text-center bg-yellow-50 border-yellow-200">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-yellow-600" />
          <h3 className="font-semibold text-yellow-900 mb-2">No Analysis Available</h3>
          <p className="text-yellow-700">No analysis ID provided for prototype generation.</p>
        </Card>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="space-y-4">
        <DebugPanel />
        <Card className="p-8 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-gray-400" />
          <h3 className="font-semibold text-gray-900 mb-2">Analysis Required</h3>
          <p className="text-gray-600 mb-4">
            No holistic analysis found. Generate one to create AI prototypes.
          </p>
          <Button onClick={generateAnalysisFunction} disabled={generatingAnalysis}>
            <Zap className="w-4 h-4 mr-2" />
            Generate Analysis
          </Button>
        </Card>
      </div>
    );
  }

  // Handle analysis with missing or malformed solution approaches
  const hasValidSolutions = analysis?.solution_approaches && 
                            Array.isArray(analysis.solution_approaches) && 
                            analysis.solution_approaches.length > 0;

  if (!hasValidSolutions) {
    console.warn('⚠️ Analysis exists but has invalid solution approaches:', analysis);
    return (
      <div className="space-y-4">
        <DebugPanel />
        <Card className="p-8 text-center bg-amber-50 border-amber-200">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-amber-600" />
          <h3 className="font-semibold text-amber-900 mb-2">Solutions Need Generation</h3>
          <p className="text-amber-700 mb-4">
            Analysis found but solution approaches are missing. Generate them now.
          </p>
          <Button onClick={generateAnalysisFunction} disabled={generatingAnalysis}>
            <Zap className="w-4 h-4 mr-2" />
            Generate Solutions
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DebugPanel />
      
      {/* Header */}
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
      {analysis?.identified_problems?.length > 0 && (
        <Card className="p-6 bg-red-50 border-red-200">
          <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Key Issues Affecting Your Goals
          </h3>
          <div className="space-y-2">
            {analysis.identified_problems.map((problem, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Badge variant="destructive" className="mt-0.5">
                  {problem?.severity || 'medium'}
                </Badge>
                <div className="flex-1">
                  <p className="text-red-800">{problem?.description || 'Problem description not available'}</p>
                  <p className="text-sm text-red-600 mt-1">
                    Impact: {problem?.businessImpact || 'Impact assessment needed'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Solution Selector */}
      <div className="grid md:grid-cols-3 gap-4">
        {analysis?.solution_approaches?.map((solution) => {
          const solutionState = generationState[solution?.approach] || { isGenerating: false, retryCount: 0 };
          
          return (
            <Card
              key={solution?.approach}
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
              
              <p className="text-sm text-gray-600 mb-3">
                {solution?.description || 'Description not available'}
              </p>
              
              <div className="space-y-1 mb-3">
                {Array.isArray(solution?.expectedImpact) && solution.expectedImpact.map((impact, i) => (
                  <p key={i} className="text-xs text-green-600">
                    {impact?.metric || 'Metric'}: {impact?.improvement || 'Improvement'}
                  </p>
                ))}
              </div>
              
              {/* Generation Controls */}
              {!prototypes[solution?.approach] && (
                <div className="space-y-2">
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      generatePrototype(solution?.approach || 'balanced');
                    }}
                    disabled={solutionState.isGenerating}
                  >
                    {solutionState.isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Prototype'
                    )}
                  </Button>
                  
                  {solutionState.error && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      Error: {solutionState.error}
                      {solutionState.retryCount > 0 && ` (Attempt ${solutionState.retryCount + 1}/3)`}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
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
              <PrototypeRenderer
                code={prototypes[selectedSolution].component_code}
                title={prototypes[selectedSolution].title}
                onError={(error) => handlePrototypeError(error, selectedSolution)}
              />
            </TabsContent>

            <TabsContent value="compare" className="p-0">
              <div className="grid md:grid-cols-2 gap-0">
                <div>
                  <div className="p-2 bg-gray-100 text-sm font-medium">Original</div>
                  <div className="h-[600px] flex items-center justify-center bg-gray-50">
                    {originalImage ? (
                      <img 
                        src={originalImage} 
                        className="max-w-full max-h-full object-contain" 
                        alt="Original design" 
                      />
                    ) : (
                      <p className="text-gray-500">Original image not available</p>
                    )}
                  </div>
                </div>
                <div>
                  <div className="p-2 bg-blue-100 text-sm font-medium">AI Enhancement</div>
                  <PrototypeRenderer
                    code={prototypes[selectedSolution].component_code}
                    title={`${prototypes[selectedSolution].title} - Enhanced`}
                    onError={(error) => handlePrototypeError(error, selectedSolution)}
                  />
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
                    {prototypes[selectedSolution]?.key_changes?.length > 0 ? (
                      prototypes[selectedSolution].key_changes.map((change, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{change}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 text-sm">No key changes specified</li>
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
