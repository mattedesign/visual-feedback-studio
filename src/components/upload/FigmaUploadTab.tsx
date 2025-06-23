
import { useState } from 'react';
import { Figma, Link2, Loader2, AlertCircle, CheckCircle, Info, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface FigmaUploadTabProps {
  onFigmaSubmit: (figmaUrl: string) => void;
  isProcessing: boolean;
}

export const FigmaUploadTab = ({ onFigmaSubmit, isProcessing }: FigmaUploadTabProps) => {
  const [figmaUrl, setFigmaUrl] = useState('');

  const handleSubmit = () => {
    if (!figmaUrl.trim()) {
      toast.error('Please enter a valid Figma URL');
      return;
    }

    if (!figmaUrl.includes('figma.com')) {
      toast.error('Please enter a valid Figma URL');
      return;
    }

    onFigmaSubmit(figmaUrl);
    setFigmaUrl('');
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <Figma className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-2xl font-semibold mb-3">Analyze Figma Design</h3>
          <p className="text-slate-200">
            Paste your Figma file or frame link to capture a screenshot for analysis
          </p>
        </div>
        
        <div className="flex gap-3 mb-4">
          <Input
            placeholder="https://figma.com/file/..."
            value={figmaUrl}
            onChange={(e) => setFigmaUrl(e.target.value)}
            className="bg-white dark:bg-slate-200 border-slate-300 dark:border-slate-400 text-slate-900 placeholder:text-slate-600"
            disabled={isProcessing}
          />
          <Button 
            onClick={handleSubmit}
            disabled={!figmaUrl.trim() || isProcessing}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Capturing...
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>

        <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-amber-200 mb-1">Important Requirements:</h4>
              <ul className="text-xs text-amber-100 space-y-1">
                <li>• Your Figma file must be publicly accessible (not private)</li>
                <li>• Use "Share" → "Copy link" to get the correct URL</li>
                <li>• Screenshot capture may take up to 60 seconds for complex designs</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-green-200 mb-1">Enhanced Anti-Detection System:</h4>
              <ul className="text-xs text-green-100 space-y-1">
                <li>• Multiple capture strategies with automatic fallback</li>
                <li>• Advanced browser simulation with random user agents</li>
                <li>• Stealth mode with enhanced ad/tracker blocking</li>
                <li>• Mobile and desktop viewport randomization</li>
                <li>• Intelligent content validation to detect bot challenges</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-200 mb-1">Capture Strategies (Automatic):</h4>
              <ul className="text-xs text-blue-100 space-y-1">
                <li>• <strong>Stealth:</strong> Random viewport, enhanced blocking</li>
                <li>• <strong>Mobile:</strong> iPhone user agent simulation</li>
                <li>• <strong>Standard:</strong> Optimized desktop capture</li>
                <li>• <strong>Fast:</strong> Quick capture with minimal delay</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-200 mb-2">How it works:</h4>
          <ul className="text-xs text-slate-300 space-y-1">
            <li>• Our system automatically tries multiple capture strategies</li>
            <li>• Each strategy uses different browser signatures and timings</li>
            <li>• Content validation ensures we capture your design, not bot challenges</li>
            <li>• Works with both file URLs and specific frame links</li>
          </ul>
        </div>

        {isProcessing && (
          <div className="mt-4 bg-green-900/20 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <p className="text-green-200 text-sm">
                Enhanced capture system running... Trying multiple strategies to bypass detection.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
