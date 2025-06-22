
import { useState } from 'react';
import { Globe, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface WebsiteUploadTabProps {
  onUrlSubmit: (url: string) => void;
  isProcessing: boolean;
}

export const WebsiteUploadTab = ({ onUrlSubmit, isProcessing }: WebsiteUploadTabProps) => {
  const [url, setUrl] = useState('');

  const handleSubmit = () => {
    if (!url.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    onUrlSubmit(url);
    setUrl('');
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <Globe className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h3 className="text-2xl font-semibold mb-3">Analyze Live Website</h3>
          <p className="text-slate-400">
            Enter any website URL to capture and analyze its design
          </p>
        </div>
        
        <div className="flex gap-3">
          <Input
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-slate-700 border-slate-600"
          />
          <Button 
            onClick={handleSubmit}
            disabled={!url.trim() || isProcessing}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Link2 className="w-4 h-4 mr-2" />
            Capture
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
