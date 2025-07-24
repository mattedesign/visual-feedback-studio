import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { usePrototypeGeneration } from '@/hooks/usePrototypeGeneration';
import { toast } from 'sonner';

interface PrototypeGenerationButtonProps {
  analysisId: string;
  onSuccess?: () => void;
  variant?: 'default' | 'card' | 'minimal';
  showProgress?: boolean;
}

export function PrototypeGenerationButton({ 
  analysisId, 
  onSuccess, 
  variant = 'default',
  showProgress = true 
}: PrototypeGenerationButtonProps) {
  const { isGenerating, progress, error, generatePrototypes, resetState } = usePrototypeGeneration();

  const handleGenerate = async () => {
    try {
      resetState();
      await generatePrototypes(analysisId);
      toast.success('Visual prototypes generated successfully!');
      onSuccess?.();
    } catch (err) {
      console.error('Failed to generate prototypes:', err);
      toast.error(`Failed to generate prototypes: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (variant === 'card') {
    return (
      <Card className="border-dashed border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
        <CardHeader className="text-center pb-3">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-lg">Generate Visual Prototypes</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create AI-powered design improvements based on analysis
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          {showProgress && isGenerating && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{progress.message}</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Prototypes
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'minimal') {
    return (
      <Button 
        onClick={handleGenerate}
        disabled={isGenerating}
        variant="outline"
        size="sm"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Prototypes
          </>
        )}
      </Button>
    );
  }

  // Default variant
  return (
    <div className="space-y-4">
      {showProgress && isGenerating && (
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{progress.message}</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      <Button 
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Prototypes...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Visual Prototypes
          </>
        )}
      </Button>
    </div>
  );
}