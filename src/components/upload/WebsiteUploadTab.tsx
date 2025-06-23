
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Loader2 } from 'lucide-react';

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
    <div className="space-y-4">
      <div className="text-center">
        <Globe className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <h3 className="text-lg font-semibold mb-2 text-slate-100">Capture Website Screenshot</h3>
        <p className="text-slate-300 text-sm">
          Enter a website URL to capture a screenshot for analysis
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            disabled={isProcessing}
          />
          <p className="text-xs text-slate-400 mt-1">
            Make sure the URL includes http:// or https://
          </p>
        </div>
        
        <Button
          type="submit"
          disabled={!url.trim() || isProcessing}
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Capturing Screenshot...
            </>
          ) : (
            <>
              <Globe className="w-4 h-4 mr-2" />
              Capture Screenshot
            </>
          )}
        </Button>
      </form>
      
      <div className="bg-slate-800/50 rounded-lg p-3">
        <h4 className="text-sm font-medium text-slate-200 mb-2">What happens next:</h4>
        <ul className="text-xs text-slate-300 space-y-1">
          <li>• We'll capture a full-page screenshot of the website</li>
          <li>• The screenshot will be loaded for analysis</li>
          <li>• You can then add annotations and get AI feedback</li>
        </ul>
      </div>
    </div>
  );
};
