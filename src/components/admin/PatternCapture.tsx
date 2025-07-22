import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CaptureResult {
  pattern_id: string;
  company: string;
  variant: string;
  storage_path?: string;
  public_url?: string;
  error?: string;
}

export function PatternCapture() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<CaptureResult[]>([]);
  const [capturedCount, setCapturedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const capturePatterns = async () => {
    setIsCapturing(true);
    setProgress(0);
    setResults([]);
    setCapturedCount(0);
    
    try {
      toast.info('Starting visual pattern capture...', {
        description: 'This will take several minutes to complete'
      });

      const { data, error } = await supabase.functions.invoke('capture-visual-patterns', {
        body: { 
          patterns: 'all',
          format: 'webp'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setResults(data.results || []);
      setCapturedCount(data.successful_captures || 0);
      setTotalCount(data.total_patterns || 0);
      setProgress(100);

      toast.success('Pattern capture completed!', {
        description: `Successfully captured ${data.successful_captures} of ${data.total_patterns} patterns`
      });

    } catch (error: any) {
      console.error('Pattern capture error:', error);
      toast.error('Pattern capture failed', {
        description: error.message
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const successfulResults = results.filter(r => !r.error);
  const failedResults = results.filter(r => r.error);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📸 Visual Pattern Screenshot Capture
          <Badge variant="outline">Screenshot One API</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Automatically capture real UI examples from company websites for the visual pattern library.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Capture Controls */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={capturePatterns} 
            disabled={isCapturing}
            size="lg"
          >
            {isCapturing ? 'Capturing Screenshots...' : 'Start Pattern Capture'}
          </Button>
          
          {isCapturing && (
            <div className="flex-1">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Processing patterns... This takes 2-3 seconds per screenshot.
              </p>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{successfulResults.length}</div>
                <p className="text-xs text-muted-foreground">Screenshots Captured</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">{failedResults.length}</div>
                <p className="text-xs text-muted-foreground">Failed Captures</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
                <p className="text-xs text-muted-foreground">Total Patterns</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Successful Results */}
        {successfulResults.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-green-700">
              ✅ Successfully Captured ({successfulResults.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {successfulResults.map((result, index) => (
                <Card key={index} className="border-green-200">
                  <CardContent className="p-3">
                    <div className="text-sm font-medium">{result.pattern_id}</div>
                    <div className="text-xs text-muted-foreground">
                      {result.company} • {result.variant}
                    </div>
                    {result.public_url && (
                      <img 
                        src={result.public_url} 
                        alt={`${result.pattern_id} ${result.variant}`}
                        className="w-full h-20 object-cover rounded mt-2"
                        loading="lazy"
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Failed Results */}
        {failedResults.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-red-700">
              ❌ Failed Captures ({failedResults.length})
            </h3>
            <div className="space-y-2">
              {failedResults.map((result, index) => (
                <Card key={index} className="border-red-200">
                  <CardContent className="p-3">
                    <div className="text-sm font-medium">{result.pattern_id}</div>
                    <div className="text-xs text-red-600">{result.error}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Note:</strong> This captures 20+ patterns across 5 categories (Dashboard, CTA, Card, Form, Navigation)</p>
          <p><strong>Format:</strong> WebP images at 600x400px dimensions</p>
          <p><strong>Rate Limiting:</strong> 2-second delay between captures to be respectful to APIs</p>
          <p><strong>Storage:</strong> Images saved to analysis-images bucket at /patterns/[company]/[pattern].webp</p>
        </div>
      </CardContent>
    </Card>
  );
}