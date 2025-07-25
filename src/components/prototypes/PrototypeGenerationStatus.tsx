import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { useHolisticPrototypeGeneration } from '@/hooks/useHolisticPrototypeGeneration';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PrototypeGenerationStatusProps {
  analysisId: string;
  onPrototypesGenerated?: () => void;
}

export function PrototypeGenerationStatus({ analysisId, onPrototypesGenerated }: PrototypeGenerationStatusProps) {
  const [holisticAnalysis, setHolisticAnalysis] = useState<any>(null);
  const [prototypes, setPrototypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    isGenerating,
    progress,
    error,
    generateHolisticPrototypes,
    generateSinglePrototype,
    resetState
  } = useHolisticPrototypeGeneration();

  useEffect(() => {
    loadData();
  }, [analysisId]);

  const loadData = async () => {
    if (!analysisId) return;
    
    setLoading(true);
    try {
      // Load holistic analysis
      const { data: analysis } = await supabase
        .from('figmant_holistic_analyses')
        .select('*')
        .eq('analysis_id', analysisId)
        .maybeSingle();

      setHolisticAnalysis(analysis);

      // Load existing prototypes
      const { data: existingPrototypes } = await supabase
        .from('figmant_holistic_prototypes')
        .select('*')
        .eq('analysis_id', analysisId);

      setPrototypes(existingPrototypes || []);
    } catch (error) {
      console.error('Failed to load prototype data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAll = async () => {
    try {
      await generateHolisticPrototypes(analysisId, undefined, true);
      await loadData();
      onPrototypesGenerated?.();
      toast.success('All prototypes generated successfully!');
    } catch (error) {
      console.error('Failed to generate prototypes:', error);
      toast.error('Failed to generate prototypes');
    }
  };

  const handleGenerateSingle = async (solutionType: 'conservative' | 'balanced' | 'innovative') => {
    try {
      await generateSinglePrototype(analysisId, solutionType);
      await loadData();
      onPrototypesGenerated?.();
      toast.success(`${solutionType} prototype generated successfully!`);
    } catch (error) {
      console.error(`Failed to generate ${solutionType} prototype:`, error);
      toast.error(`Failed to generate ${solutionType} prototype`);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading prototype status...</p>
        </CardContent>
      </Card>
    );
  }

  const solutionTypes = [
    { 
      type: 'conservative' as const, 
      label: 'Conservative', 
      description: 'Quick wins and minimal changes',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    { 
      type: 'balanced' as const, 
      label: 'Balanced', 
      description: 'Best practices with moderate changes',
      icon: Zap,
      color: 'text-blue-600'
    },
    { 
      type: 'innovative' as const, 
      label: 'Innovative', 
      description: 'Cutting-edge solutions and bold changes',
      icon: AlertTriangle,
      color: 'text-purple-600'
    }
  ];

  const getPrototypeStatus = (solutionType: string) => {
    return prototypes.find(p => p.solution_type === solutionType);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Prototype Generation</span>
          {holisticAnalysis && (
            <Badge variant="outline" className="text-green-600">
              Analysis Ready
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!holisticAnalysis ? (
          <div className="text-center py-4">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-muted-foreground mb-4">
              Holistic analysis required before generating prototypes
            </p>
            <Button 
              onClick={() => generateHolisticPrototypes(analysisId, undefined, false)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {progress.message}
                </>
              ) : (
                'Generate Analysis'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Choose which prototype solutions to generate:
              </p>
              <Button 
                onClick={handleGenerateAll}
                disabled={isGenerating || prototypes.length === 3}
                size="sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : prototypes.length === 3 ? (
                  'All Generated'
                ) : (
                  'Generate All'
                )}
              </Button>
            </div>

            <div className="grid gap-3">
              {solutionTypes.map(({ type, label, description, icon: Icon, color }) => {
                const existing = getPrototypeStatus(type);
                
                return (
                  <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${color}`} />
                      <div>
                        <div className="font-medium">{label}</div>
                        <div className="text-sm text-muted-foreground">{description}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {existing ? (
                        <Badge variant="outline" className="text-green-600">
                          Generated
                        </Badge>
                      ) : (
                        <Button
                          onClick={() => handleGenerateSingle(type)}
                          disabled={isGenerating}
                          size="sm"
                          variant="outline"
                        >
                          {isGenerating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Generate'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
                <Button 
                  onClick={resetState} 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            )}

            {isGenerating && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <p className="text-sm">{progress.message}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}