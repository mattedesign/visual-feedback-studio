
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface WebsiteUploadTabProps {
  onUrlSubmit: (url: string) => Promise<void>;
  isProcessing: boolean;
}

export const WebsiteUploadTab = ({ onUrlSubmit, isProcessing }: WebsiteUploadTabProps) => {
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    await onUrlSubmit(url.trim());
    setUrl(''); // Clear the input after submission
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <Globe className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-2xl font-semibold mb-3">Analyze Website</h3>
          <p className="text-slate-200">
            Enter a website URL to capture a screenshot for analysis
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="bg-white dark:bg-slate-200 border-slate-300 dark:border-slate-400 text-slate-900 placeholder:text-slate-600"
              disabled={isProcessing}
            />
            <Button
              type="submit"
              disabled={!url.trim() || isProcessing}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Capturing...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-200 mb-2">What happens next:</h4>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• We'll capture a full-page screenshot of the website</li>
              <li>• The screenshot will be loaded for analysis</li>
              <li>• You can then add annotations and get AI feedback</li>
              <li>• Make sure the URL includes http:// or https://</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
