
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Loader2, AlertCircle, CheckCircle, TestTube, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UrlQueueManager } from './UrlQueueManager';

interface WebsiteUploadTabProps {
  onUrlSubmit: (url: string) => Promise<void>;
  onImageUpload: (imageUrl: string) => void;
  isProcessing: boolean;
}

export const WebsiteUploadTab = ({ onUrlSubmit, onImageUpload, isProcessing }: WebsiteUploadTabProps) => {
  const [url, setUrl] = useState('');
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    console.log('WebsiteUploadTab: Form submitted with URL:', url.trim());
    
    // Clear previous messages
    setLastError(null);
    setLastSuccess(null);
    
    try {
      await onUrlSubmit(url.trim());
      setLastSuccess('Website screenshot captured successfully!');
      setUrl(''); // Clear the input after successful submission
    } catch (error) {
      console.error('WebsiteUploadTab: Error during submission:', error);
      setLastError(error instanceof Error ? error.message : 'Failed to process website URL');
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    // Clear messages when user starts typing
    if (lastError || lastSuccess) {
      setLastError(null);
      setLastSuccess(null);
    }
  };

  const handleTestUrl = () => {
    const testUrl = 'https://example.com';
    setUrl(testUrl);
    console.log('Test URL set:', testUrl);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Single URL
          </TabsTrigger>
          <TabsTrigger value="multiple" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Multiple URLs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <Globe className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-2xl font-semibold mb-3">Analyze Single Website</h3>
                <p className="text-slate-200">
                  Enter a website URL to capture a screenshot for analysis
                </p>
              </div>

              {lastError && (
                <Alert className="mb-4" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{lastError}</AlertDescription>
                </Alert>
              )}

              {lastSuccess && (
                <Alert className="mb-4 border-green-500/50 text-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{lastSuccess}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    type="url"
                    value={url}
                    onChange={handleUrlChange}
                    placeholder="https://example.com"
                    className="bg-white dark:bg-slate-200 border-slate-300 dark:border-slate-400 text-slate-900 placeholder:text-slate-600"
                    disabled={isProcessing}
                  />
                  <Button
                    type="button"
                    onClick={handleTestUrl}
                    variant="outline"
                    disabled={isProcessing}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Test
                  </Button>
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
                    <li>• Use the Test button to quickly try with example.com</li>
                  </ul>
                </div>

                {isProcessing && (
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-blue-200 text-sm">
                      📸 Capturing screenshot... This may take a few seconds.
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multiple" className="mt-6">
          <UrlQueueManager onImageUpload={onImageUpload} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
