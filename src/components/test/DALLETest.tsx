
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Palette } from 'lucide-react';
import dalleService from '../../services/design/dalleService';

export const DALLETest = () => {
  const [issue, setIssue] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!issue.trim()) {
      setError('Please describe a design issue first');
      return;
    }

    setLoading(true);
    setError('');
    setImageUrl('');
    
    try {
      const suggestion = await dalleService.generateDesignSuggestion(issue);
      setImageUrl(suggestion.imageUrl);
      console.log('Generated suggestion:', suggestion);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate design suggestion');
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            DALL-E 3 Design Generator Test
          </CardTitle>
          <CardDescription>
            Test the standalone DALL-E 3 service by describing a design issue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="issue" className="text-sm font-medium">
              Describe a design issue:
            </label>
            <Input
              id="issue"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="e.g., Poor button contrast in dark theme"
              className="w-full"
            />
          </div>
          
          <Button 
            onClick={handleGenerate} 
            disabled={loading || !issue.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Design Solution...
              </>
            ) : (
              'Generate Design Solution'
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {imageUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Design Suggestion</CardTitle>
            <CardDescription>
              Design solution for: "{issue}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <img 
              src={imageUrl} 
              alt="Generated design suggestion" 
              className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
              onError={() => setError('Failed to load generated image')}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
